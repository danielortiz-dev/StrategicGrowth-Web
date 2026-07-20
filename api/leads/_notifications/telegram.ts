import { LeadData, NotificationAdapter } from './types.js';
import { NotificationEventStore } from './store.js';

export class TelegramNotificationAdapter implements NotificationAdapter {
  async send(lead: LeadData, submissionId: string, store: NotificationEventStore): Promise<void> {
    const enabled = process.env.TELEGRAM_NOTIFICATIONS_ENABLED;
    if (enabled !== 'true') return;
    
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
       await store.recordEvent(lead.leadId, 'TELEGRAM_NOTIFICATION_FAILED', 'TELEGRAM', 'TELEGRAM_BOT_API', '', 'FAILED', 1, 'CONFIGURATION_ERROR');
       return;
    }

    const text = `STRATEGIC GROWTH — NEW LEAD\n\nVerified lead received.\nBusiness: ${lead.businessName || 'Not provided'}\nBooking: ${lead.bookingStatus}\n\nReview:\n${lead.privateLedgerLink}`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text })
      });
      const data = await res.json();
      
      if (data.ok) {
        await store.recordEvent(lead.leadId, 'TELEGRAM_NOTIFICATION_ACCEPTED', 'TELEGRAM', 'TELEGRAM_BOT_API', data.result?.message_id?.toString() || '', 'ACCEPTED', 1, 'NONE');
      } else {
        await store.recordEvent(lead.leadId, 'TELEGRAM_NOTIFICATION_FAILED', 'TELEGRAM', 'TELEGRAM_BOT_API', '', 'FAILED', 1, 'API_ERROR');
      }
    } catch (err) {
      await store.recordEvent(lead.leadId, 'TELEGRAM_NOTIFICATION_FAILED', 'TELEGRAM', 'TELEGRAM_BOT_API', '', 'FAILED', 1, 'NETWORK_ERROR');
    }
  }
}
