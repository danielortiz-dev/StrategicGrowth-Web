import { LeadData, NotificationAdapter } from './types.js';
import { NotificationEventStore } from './store.js';
import * as crypto from 'crypto';

export class EmailNotificationAdapter implements NotificationAdapter {
  async send(lead: LeadData, submissionId: string, store: NotificationEventStore): Promise<void> {
    const enabled = process.env.LEAD_EMAIL_NOTIFICATIONS_ENABLED;
    if (enabled !== 'true') return;
    
    const url = process.env.LEAD_EMAIL_WEBHOOK_URL;
    const secret = process.env.LEAD_EMAIL_WEBHOOK_SECRET;
    
    if (!url || !secret) {
      await store.recordEvent(lead.leadId, 'EMAIL_NOTIFICATION_FAILED', 'EMAIL', 'APPS_SCRIPT', '', 'FAILED', 1, 'CONFIGURATION_ERROR');
      return;
    }

    const timestamp = new Date().getTime();
    const payloadToSign = timestamp.toString() + JSON.stringify(lead);
    const signature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp,
          signature,
          payload: lead
        })
      });
      const data = await res.json();
      
      if (data.ok) {
        await store.recordEvent(lead.leadId, 'EMAIL_NOTIFICATION_ACCEPTED', 'EMAIL', 'APPS_SCRIPT', '', 'ACCEPTED', 1, 'NONE');
      } else {
        await store.recordEvent(lead.leadId, 'EMAIL_NOTIFICATION_FAILED', 'EMAIL', 'APPS_SCRIPT', '', 'FAILED', 1, 'API_ERROR');
      }
    } catch (err) {
      await store.recordEvent(lead.leadId, 'EMAIL_NOTIFICATION_FAILED', 'EMAIL', 'APPS_SCRIPT', '', 'FAILED', 1, 'NETWORK_ERROR');
    }
  }
}
