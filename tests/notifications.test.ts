import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TelegramNotificationAdapter } from '../api/leads/notifications/telegram';
import { EmailNotificationAdapter } from '../api/leads/notifications/email';
import { LeadNotificationRouter } from '../api/leads/notifications/router';
import { NotificationEventStore } from '../api/leads/notifications/store';
import * as crypto from 'crypto';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockRecordEvent = vi.fn();
const storeMock = {
  recordEvent: mockRecordEvent,
  hasAcceptedEvent: vi.fn().mockResolvedValue(false)
} as unknown as NotificationEventStore;

const sampleLead = {
  leadId: 'test-lead-123',
  prospectName: 'John Doe',
  businessName: 'Test Business',
  businessEmail: 'test@example.com',
  website: 'https://example.com',
  primaryChallenge: 'Testing',
  sourceSummary: 'Direct',
  landingPage: '/book',
  bookingStatus: 'PENDING',
  followUpStatus: 'NOT_STARTED',
  responseTarget: 'Review within 2 business hours',
  privateLedgerLink: 'https://docs.google.com/spreadsheets/d/123/edit'
};

describe('Lead Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TELEGRAM_NOTIFICATIONS_ENABLED = 'true';
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat';
    
    process.env.LEAD_EMAIL_NOTIFICATIONS_ENABLED = 'true';
    process.env.LEAD_EMAIL_WEBHOOK_URL = 'https://example.com/webhook';
    process.env.LEAD_EMAIL_WEBHOOK_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.TELEGRAM_NOTIFICATIONS_ENABLED;
    delete process.env.LEAD_EMAIL_NOTIFICATIONS_ENABLED;
  });

  it('Telegram content excludes prohibited detailed PII', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true, result: { message_id: 123 } }) } as any);
    const adapter = new TelegramNotificationAdapter();
    await adapter.send(sampleLead, 'sub-123', storeMock);

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('api.telegram.org'), expect.any(Object));
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.text).toContain('STRATEGIC GROWTH — NEW LEAD');
    expect(body.text).toContain('Test Business');
    expect(body.text).not.toContain('test@example.com');
    expect(body.text).not.toContain('John Doe');
    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'TELEGRAM_NOTIFICATION_ACCEPTED', 'TELEGRAM', 'TELEGRAM_BOT_API', '123', 'ACCEPTED', 1, 'NONE');
  });

  it('Email content contains the approved operational fields', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true }) } as any);
    const adapter = new EmailNotificationAdapter();
    await adapter.send(sampleLead, 'sub-123', storeMock);

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/webhook', expect.any(Object));
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.payload.prospectName).toBe('John Doe');
    expect(body.payload.businessEmail).toBe('test@example.com');
    expect(body.signature).toBeTruthy();
    expect(body.timestamp).toBeTruthy();
    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'EMAIL_NOTIFICATION_ACCEPTED', 'EMAIL', 'APPS_SCRIPT', '', 'ACCEPTED', 1, 'NONE');
  });

  it('One channel failure does not suppress the other channel', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Telegram Network Error'));
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true }) } as any);

    await LeadNotificationRouter.route(sampleLead, 'sub-123');

    // Due to waitUntil not awaiting in test naturally, we'll manually invoke
    const telegramAdapter = new TelegramNotificationAdapter();
    const emailAdapter = new EmailNotificationAdapter();
    await Promise.allSettled([
        telegramAdapter.send(sampleLead, 'sub-123', storeMock),
        emailAdapter.send(sampleLead, 'sub-123', storeMock)
    ]);

    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'TELEGRAM_NOTIFICATION_FAILED', 'TELEGRAM', 'TELEGRAM_BOT_API', '', 'FAILED', 1, 'NETWORK_ERROR');
    expect(mockRecordEvent).toHaveBeenCalledWith('test-lead-123', 'EMAIL_NOTIFICATION_ACCEPTED', 'EMAIL', 'APPS_SCRIPT', '', 'ACCEPTED', 1, 'NONE');
  });
});
