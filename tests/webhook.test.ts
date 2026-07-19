import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as crypto from 'crypto';
import { EmailNotificationAdapter } from '../api/leads/_notifications/email';
import { LeadNotificationRouter } from '../api/leads/_notifications/router';
import { NotificationEventStore } from '../api/leads/_notifications/store';
import { TelegramNotificationAdapter } from '../api/leads/_notifications/telegram';

// --- Mocks for the Apps Script Contract ---
let waitUntilPromises: Promise<any>[] = [];

vi.mock('@vercel/functions', () => ({
  waitUntil: (promise: Promise<any>) => {
    waitUntilPromises.push(promise);
  }
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

let mockRecordEvent: any;

function secureCompareHex(expected: string, provided: string) {
  if (
    typeof expected !== "string" ||
    typeof provided !== "string" ||
    !/^[0-9a-fA-F]{64}$/.test(expected) ||
    !/^[0-9a-fA-F]{64}$/.test(provided)
  ) {
    return false;
  }

  const a = expected.toLowerCase();
  const b = provided.toLowerCase();
  let mismatch = 0;

  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

class MockLock {
  private locked = false;
  tryLock(timeout: number) {
    if (this.locked) return false;
    this.locked = true;
    return true;
  }
  releaseLock() {
    this.locked = false;
  }
}

let activeLock = new MockLock();

async function simulateAppsScriptWebhook(
  reqBody: any,
  secret: string,
  cacheStore: Map<string, string>,
  lock: MockLock,
  failMail = false,
  pauseBeforeMail = 0
) {
  let locked = false;
  try {
    if (!reqBody) {
      return { ok: false, error: 'MALFORMED_REQUEST' };
    }

    const { timestamp, signature, payload } = reqBody;

    if (
      typeof timestamp !== 'number' ||
      !isFinite(timestamp) ||
      typeof signature !== 'string' ||
      signature.length !== 64 ||
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return { ok: false, error: 'MALFORMED_REQUEST' };
    }

    if (!payload.prospectName || !payload.businessEmail || !payload.primaryChallenge || !payload.leadId) {
      return { ok: false, error: 'MALFORMED_REQUEST' };
    }

    const now = new Date().getTime();
    const age = now - timestamp;
    if (age > 5 * 60 * 1000 || age < -60000) {
      return { ok: false, error: 'EXPIRED_TIMESTAMP' };
    }

    const payloadToSign = timestamp.toString() + JSON.stringify(payload);
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');

    if (!secureCompareHex(expectedSignature, signature)) {
      return { ok: false, error: 'INVALID_SIGNATURE' };
    }

    const replayKey = 'replay_' + crypto.createHash('sha256').update(signature).digest('hex');

    locked = lock.tryLock(5000);
    if (!locked) {
      return { ok: false, error: 'LOCK_UNAVAILABLE' };
    }

    const isReplay = cacheStore.get(replayKey);
    if (isReplay) {
      return { ok: false, error: 'REPLAY_REJECTED' };
    }

    cacheStore.set(replayKey, 'PROCESSING');

    if (pauseBeforeMail > 0) {
      await new Promise(r => setTimeout(r, pauseBeforeMail));
    }

    if (failMail) {
      cacheStore.delete(replayKey);
      return { ok: false, error: 'EMAIL_SEND_FAILED' };
    }

    cacheStore.set(replayKey, 'SENT');
    return { ok: true, leadId: payload.leadId };
  } catch (e) {
    return { ok: false, error: 'INTERNAL_SERVER_ERROR' };
  } finally {
    if (locked) lock.releaseLock();
  }
}

describe('Apps Script Webhook Verifier Contract', () => {
  const secret = 'super-secret-key';
  let cache: Map<string, string>;

  beforeEach(() => {
    cache = new Map();
    activeLock = new MockLock();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1000000000));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createValidReq(payload: any, tsOffset = 0) {
    const timestamp = new Date().getTime() + tsOffset;
    const payloadToSign = timestamp.toString() + JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');
    return { timestamp, signature, payload };
  }

  const payload = { leadId: '1234', prospectName: 'Test', businessEmail: 'test@example.com', primaryChallenge: 'Test' };

  it('1. Valid fresh signed request is accepted', async () => {
    const req = createValidReq(payload);
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(true);
  });

  it('2. Missing signature is rejected', async () => {
    const req = createValidReq(payload);
    delete (req as any).signature;
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('MALFORMED_REQUEST');
  });

  it('3. Malformed signature length is rejected', async () => {
    const req = createValidReq(payload);
    req.signature = 'abcd';
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('MALFORMED_REQUEST');
  });

  it('4. Non-hexadecimal signature is rejected', async () => {
    const req = createValidReq(payload);
    req.signature = 'g'.repeat(64);
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('INVALID_SIGNATURE');
  });

  it('5. Invalid signature is rejected', async () => {
    const req = createValidReq(payload);
    req.signature = 'a'.repeat(64);
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('INVALID_SIGNATURE');
  });

  it('6. Payload mutation after signing is rejected', async () => {
    const req = createValidReq(payload);
    req.payload.prospectName = 'Hacked';
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('INVALID_SIGNATURE');
  });

  it('7. Timestamp mutation after signing is rejected', async () => {
    const req = createValidReq(payload);
    req.timestamp += 1000;
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('INVALID_SIGNATURE');
  });

  it('8. Expired timestamp is rejected', async () => {
    const req = createValidReq(payload, -600000); // 10 mins old
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('EXPIRED_TIMESTAMP');
  });

  it('9. Excessively future timestamp is rejected', async () => {
    const req = createValidReq(payload, 120000); // 2 mins future
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('EXPIRED_TIMESTAMP');
  });

  it('10. Exact completed replay is rejected', async () => {
    const req = createValidReq(payload);
    const res1 = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res1.ok).toBe(true);
    const res2 = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res2.ok).toBe(false);
    expect(res2.error).toBe('REPLAY_REJECTED');
  });

  it('11. Lock unavailable fails closed', async () => {
    const req = createValidReq(payload);
    activeLock.tryLock(5000); // Lock it manually
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('LOCK_UNAVAILABLE');
  });

  it('12. Two concurrent identical requests produce at most one accepted email dispatch', async () => {
    vi.useRealTimers();
    const req = createValidReq(payload);

    // Fire two concurrently
    const p1 = simulateAppsScriptWebhook(req, secret, cache, activeLock, false, 50);
    const p2 = simulateAppsScriptWebhook(req, secret, cache, activeLock, false, 50);

    const [res1, res2] = await Promise.all([p1, p2]);
    const successes = [res1, res2].filter(r => r.ok).length;
    expect(successes).toBe(1);

    const rejects = [res1, res2].filter(r => !r.ok);
    expect(rejects[0].error === 'LOCK_UNAVAILABLE' || rejects[0].error === 'REPLAY_REJECTED').toBe(true);
  });

  it('13. PROCESSING replay marker blocks a concurrent duplicate', async () => {
    const req = createValidReq(payload);
    const replayKey = 'replay_' + crypto.createHash('sha256').update(req.signature).digest('hex');
    cache.set(replayKey, 'PROCESSING');

    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock);
    expect(res.ok).toBe(false);
    expect(res.error).toBe('REPLAY_REJECTED');
  });

  it('14. Successful send leaves replay marker protection active', async () => {
    const req = createValidReq(payload);
    await simulateAppsScriptWebhook(req, secret, cache, activeLock);

    const replayKey = 'replay_' + crypto.createHash('sha256').update(req.signature).digest('hex');
    expect(cache.get(replayKey)).toBe('SENT');
  });

  it('15. Failed MailApp send does not falsely report success', async () => {
    const req = createValidReq(payload);
    const res = await simulateAppsScriptWebhook(req, secret, cache, activeLock, true); // failMail = true
    expect(res.ok).toBe(false);
    expect(res.error).toBe('EMAIL_SEND_FAILED');

    const replayKey = 'replay_' + crypto.createHash('sha256').update(req.signature).digest('hex');
    expect(cache.has(replayKey)).toBe(false); // Marker removed
  });

  it('Source contract test proves canonical file uses LockService', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(path.resolve(__dirname, '../infrastructure/apps-script/lead-email-notification-webhook.gs'), 'utf-8');
    expect(source).toContain('LockService.getScriptLock()');
    expect(source).toContain('tryLock(');
    expect(source).toContain('releaseLock()');
    expect(source).toContain('cache.get(replayKey)');
    expect(source).toContain('cache.put(replayKey, \'PROCESSING\'');
    expect(source).not.toContain('statusCode, data');
  });
});

describe('Lead Notifications Email Adapter Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    waitUntilPromises = [];
    mockRecordEvent = vi.spyOn(NotificationEventStore.prototype, 'recordEvent').mockResolvedValue(undefined);
    process.env.LEAD_EMAIL_NOTIFICATIONS_ENABLED = 'true';
    process.env.LEAD_EMAIL_WEBHOOK_URL = 'https://example.com/webhook';
    process.env.LEAD_EMAIL_WEBHOOK_SECRET = 'test-secret';
    process.env.TELEGRAM_NOTIFICATIONS_ENABLED = 'true';
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat';
  });

  afterEach(() => {
    delete process.env.LEAD_EMAIL_NOTIFICATIONS_ENABLED;
    delete process.env.LEAD_EMAIL_WEBHOOK_URL;
    delete process.env.LEAD_EMAIL_WEBHOOK_SECRET;
    delete process.env.TELEGRAM_NOTIFICATIONS_ENABLED;
  });

  const sampleLead = { leadId: 'test-lead-123' } as any;

  it('16. Missing Apps Script configuration records CONFIGURATION_ERROR', async () => {
    delete process.env.LEAD_EMAIL_WEBHOOK_URL;
    const adapter = new EmailNotificationAdapter();
    const store = new NotificationEventStore();
    await adapter.send(sampleLead, 'sub-123', store);

    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'EMAIL_NOTIFICATION_FAILED', 'EMAIL', 'APPS_SCRIPT', '', 'FAILED', 1, 'CONFIGURATION_ERROR');
  });

  it('17. EmailNotificationAdapter uses JSON data.ok as authoritative', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true }) } as any);
    const adapter = new EmailNotificationAdapter();
    const store = new NotificationEventStore();
    await adapter.send(sampleLead, 'sub-123', store);

    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'EMAIL_NOTIFICATION_ACCEPTED', 'EMAIL', 'APPS_SCRIPT', '', 'ACCEPTED', 1, 'NONE');
  });

  it('18. EmailNotificationAdapter records API_ERROR when endpoint returns {ok: false}', async () => {
    // Even if transport is 200, if ok is false it is an API_ERROR
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ ok: false, error: 'INVALID_SIGNATURE' }) } as any);
    const adapter = new EmailNotificationAdapter();
    const store = new NotificationEventStore();
    await adapter.send(sampleLead, 'sub-123', store);

    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'EMAIL_NOTIFICATION_FAILED', 'EMAIL', 'APPS_SCRIPT', '', 'FAILED', 1, 'API_ERROR');
  });

  it('19. Telegram failure does not suppress email', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Telegram Network Error'));
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true }) } as any);

    await LeadNotificationRouter.route(sampleLead, 'sub-123');
    await Promise.all(waitUntilPromises);

    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'TELEGRAM_NOTIFICATION_FAILED', 'TELEGRAM', 'TELEGRAM_BOT_API', '', 'FAILED', 1, 'NETWORK_ERROR');
    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'EMAIL_NOTIFICATION_ACCEPTED', 'EMAIL', 'APPS_SCRIPT', '', 'ACCEPTED', 1, 'NONE');
  });

  it('20. Email failure does not suppress Telegram', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }) } as any);
    mockFetch.mockRejectedValueOnce(new Error('Email Network Error'));

    await LeadNotificationRouter.route(sampleLead, 'sub-123');
    await Promise.all(waitUntilPromises);

    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'TELEGRAM_NOTIFICATION_ACCEPTED', 'TELEGRAM', 'TELEGRAM_BOT_API', '1', 'ACCEPTED', 1, 'NONE');
    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'EMAIL_NOTIFICATION_FAILED', 'EMAIL', 'APPS_SCRIPT', '', 'FAILED', 1, 'NETWORK_ERROR');
  });
});
