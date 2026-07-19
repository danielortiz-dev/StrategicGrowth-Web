import { TelegramNotificationAdapter } from './telegram';
import { EmailNotificationAdapter } from './email';
import { NotificationEventStore } from './store';
import { LeadData } from './types';
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
