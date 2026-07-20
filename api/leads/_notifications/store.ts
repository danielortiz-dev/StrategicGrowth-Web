import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

export class NotificationEventStore {
  async recordEvent(leadId: string, eventType: string, channel: string, provider: string, providerMessageId: string, status: string, attemptCount: number, failureClass: string) {
    const emailAuth = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!emailAuth || !privateKey || !sheetId) return;
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: emailAuth,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      const eventId = uuidv4();
      const createdAt = new Date().toISOString();
      const row = [
        eventId, leadId, eventType, createdAt, channel, provider, providerMessageId, status, attemptCount, failureClass, ''
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "'Lead Events'!A1",
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });
    } catch (err) {
      console.error("Failed to write to Lead Events");
    }
  }
}
