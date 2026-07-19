import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as crypto from 'crypto';

function verifyWebhook(req: any, secret: string, cacheStore: Map<string, boolean>) {
  if (!req || !req.timestamp || !req.signature || !req.payload) {
    return { ok: false, error: 'MALFORMED_REQUEST', status: 400 };
  }

  const { timestamp, signature, payload } = req;
  const now = new Date().getTime();
  const age = now - timestamp;
  if (age > 5 * 60 * 1000 || age < -60000) {
    return { ok: false, error: 'EXPIRED_TIMESTAMP', status: 403 };
  }

  const payloadToSign = timestamp.toString() + JSON.stringify(payload);
  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');

  if (expectedSignature !== signature) {
    return { ok: false, error: 'INVALID_SIGNATURE', status: 403 };
  }

  const replayKey = 'replay_' + crypto.createHash('sha256').update(signature).digest('hex');
  if (cacheStore.has(replayKey)) {
    return { ok: false, error: 'REPLAY_REJECTED', status: 409 };
  }

  cacheStore.set(replayKey, true);
  return { ok: true, leadId: payload.leadId, status: 200 };
}

describe('Apps Script Webhook Verifier Contract', () => {
  const secret = 'super-secret-key';
  let cache: Map<string, boolean>;

  beforeEach(() => {
    cache = new Map();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1000000000));
  });

  function createValidReq(payload: any, tsOffset = 0) {
    const timestamp = new Date().getTime() + tsOffset;
    const payloadToSign = timestamp.toString() + JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');
    return { timestamp, signature, payload };
  }

  const payload = { leadId: '1234', prospectName: 'Test' };

  it('verifier rejects an invalid signature', () => {
    const req = createValidReq(payload);
    req.signature = 'bad-sig';
    const res = verifyWebhook(req, secret, cache);
    expect(res.status).toBe(403);
    expect(res.error).toBe('INVALID_SIGNATURE');
  });

  it('payload mutation changes the signature and is rejected', () => {
    const req = createValidReq(payload);
    req.payload.prospectName = 'Hacked';
    const res = verifyWebhook(req, secret, cache);
    expect(res.status).toBe(403);
    expect(res.error).toBe('INVALID_SIGNATURE');
  });

  it('verifier rejects an expired timestamp', () => {
    const req = createValidReq(payload, -600000); // 10 mins old
    const res = verifyWebhook(req, secret, cache);
    expect(res.status).toBe(403);
    expect(res.error).toBe('EXPIRED_TIMESTAMP');
  });

  it('verifier accepts one valid fresh request', () => {
    const req = createValidReq(payload);
    const res = verifyWebhook(req, secret, cache);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
  });

  it('verifier rejects an exact replay', () => {
    const req = createValidReq(payload);
    const res1 = verifyWebhook(req, secret, cache);
    expect(res1.status).toBe(200);

    const res2 = verifyWebhook(req, secret, cache);
    expect(res2.status).toBe(409);
    expect(res2.error).toBe('REPLAY_REJECTED');
  });

});
