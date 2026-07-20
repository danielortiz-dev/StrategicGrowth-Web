import { TelegramNotificationAdapter } from './telegram.js';
import { EmailNotificationAdapter } from './email.js';
import { NotificationEventStore } from './store.js';
import { LeadData } from './types.js';
import { waitUntil } from '@vercel/functions';

export class LeadNotificationRouter {
  static async route(lead: LeadData, submissionId: string) {
    const telegramAdapter = new TelegramNotificationAdapter();
    const emailAdapter = new EmailNotificationAdapter();
    const store = new NotificationEventStore();

    waitUntil((async () => {
      // Execute both independently
      await Promise.allSettled([
        telegramAdapter.send(lead, submissionId, store),
        emailAdapter.send(lead, submissionId, store)
      ]);
    })());
  }
}
