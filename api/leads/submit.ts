import { z } from 'zod';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

const schema = z.object({
  submissionId: z.string().uuid(),
  fullName: z.string().trim().max(200),
  email: z.string().trim().toLowerCase().email().max(254),
  businessName: z.string().trim().max(200).optional().default(''),
  website: z.union([z.string().trim().url().max(500), z.string().trim().max(0)]).optional(),
  mainChallenge: z.string().trim().max(2000),
  attribution: z.object({
    source: z.string().trim().max(100).optional(),
    medium: z.string().trim().max(100).optional(),
    campaign: z.string().trim().max(100).optional(),
    content: z.string().trim().max(100).optional(),
    term: z.string().trim().max(100).optional(),
    referrer: z.string().trim().max(500).optional(),
    landingPage: z.string().trim().max(500).optional(),
  }).optional().default({}),
  formStartedAt: z.string().datetime().optional(),
  honeypot: z.string().max(100).optional(),
});

function normalizeSpreadsheetValue(value: string | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^[=+\-@]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return res.status(415).json({ ok: false, error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Unsupported media type' } });
  }

  const origin = req.headers.origin;
  const allowedOriginsStr = process.env.LEAD_SUBMISSION_ALLOWED_ORIGINS || '';
  const allowedOrigins = allowedOriginsStr.split(',').map(o => o.trim().replace(/\/$/, '')).filter(Boolean);

  if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
     return res.status(500).json({ ok: false, error: { code: 'SERVER_CONFIGURATION_ERROR', message: 'Server configuration error' } });
  }

  if (!origin || !allowedOrigins.includes(origin.replace(/\/$/, ''))) {
     return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Origin not allowed' } });
  }

  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 10240 || (req.body && JSON.stringify(req.body).length > 10240)) {
     return res.status(413).json({ ok: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Payload too large' } });
  }

  let parsed;
  try {
    parsed = schema.strict().parse(req.body);
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: { code: 'VALIDATION_FAILED', message: err.message } });
  }

  if (parsed.honeypot && parsed.honeypot.length > 0) {
    return res.status(400).json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Invalid submission' } });
  }

  const {
    submissionId, fullName, email, businessName, website, mainChallenge, attribution, formStartedAt
  } = parsed;

  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  const emailAuth = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME;

  if (!emailAuth || !privateKey || !sheetId || !tabName) {
    console.error("Missing Google Sheets configuration.");
    return res.status(500).json({ ok: false, error: { code: 'SERVER_CONFIGURATION_ERROR', message: 'Server configuration error' } });
  }

  // Normalize private key newlines
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

    // Ensure headers exist and are correct
    const expectedHeaders = [
      'Lead ID', 'Submission ID', 'Received At', 'First Name', 'Last Name',
      'Email', 'Business Name', 'Website', 'Main Challenge',
      'Attribution Source', 'Attribution Medium', 'Attribution Campaign',
      'Attribution Content', 'Attribution Term', 'Referrer', 'Landing Page',
      'Intake Status', 'Booking Status', 'Call Prep Status', 'Follow-Up Status'
    ];

    const range = `'${tabName}'!A1:T`;
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = readRes.data.values || [];
    let headerRow = rows[0];

    if (!headerRow || headerRow.length === 0) {
      // Initialize headers
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `'${tabName}'!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [expectedHeaders] }
      });
    } else {
      // Verify headers
      for (let i = 0; i < expectedHeaders.length; i++) {
        if (headerRow[i] !== expectedHeaders[i]) {
          console.error(`Header mismatch at column ${i + 1}. Expected '${expectedHeaders[i]}', found '${headerRow[i]}'`);
          return res.status(500).json({ ok: false, error: { code: 'SERVER_CONFIGURATION_ERROR', message: 'Server configuration error' } });
        }
      }
    }

    // Check idempotency (duplicate submissionId)
    // We check rows 1..N for matching submissionId in Column B (index 1)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === submissionId) {
        const existingLeadId = rows[i][0];
        return res.status(200).json({ ok: true, leadId: existingLeadId, duplicate: true });
      }
    }

    // Prepare authoritative fields
    const leadId = uuidv4();
    const receivedAt = new Date().toISOString();
    const intakeStatus = 'INTAKE_RECEIVED';
    const bookingStatus = 'PENDING';
    const callPrepStatus = 'NOT_STARTED';
    const followUpStatus = 'NOT_STARTED';

    const appendRow = [
      leadId,
      submissionId,
      receivedAt,
      normalizeSpreadsheetValue(firstName),
      normalizeSpreadsheetValue(lastName),
      email,
      normalizeSpreadsheetValue(businessName),
      normalizeSpreadsheetValue(website),
      normalizeSpreadsheetValue(mainChallenge),
      normalizeSpreadsheetValue(attribution?.source),
      normalizeSpreadsheetValue(attribution?.medium),
      normalizeSpreadsheetValue(attribution?.campaign),
      normalizeSpreadsheetValue(attribution?.content),
      normalizeSpreadsheetValue(attribution?.term),
      normalizeSpreadsheetValue(attribution?.referrer),
      normalizeSpreadsheetValue(attribution?.landingPage),
      intakeStatus,
      bookingStatus,
      callPrepStatus,
      followUpStatus
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'${tabName}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [appendRow] }
    });

    return res.status(200).json({ ok: true, leadId, duplicate: false });

  } catch (err: any) {
    console.error("Google Sheets API error");
    return res.status(500).json({ ok: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
  }
}
