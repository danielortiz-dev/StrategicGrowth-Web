/**
 * Canonical Source for Strategic Growth Lead Email Notification Webhook
 * 
 * Deployment Instructions:
 * 1. Open Google Apps Script (script.google.com).
 * 2. Create a new project and paste this source code.
 * 3. Go to Project Settings -> Script Properties.
 * 4. Add the following properties:
 *    - LEAD_EMAIL_WEBHOOK_SECRET: (Your highly secure 32+ character random string)
 *    - LEAD_EMAIL_RECIPIENT: (e.g. strategicgrowth.biz@outlook.com)
 * 5. Deploy -> New Deployment -> Select "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the resulting Web App URL to Vercel as LEAD_EMAIL_WEBHOOK_URL.
 */

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const secret = props.getProperty('LEAD_EMAIL_WEBHOOK_SECRET');
    const recipient = props.getProperty('LEAD_EMAIL_RECIPIENT');

    if (!secret || !recipient) {
      return respond(500, { ok: false, error: 'CONFIGURATION_ERROR' });
    }

    if (!e || !e.postData || !e.postData.contents) {
      return respond(400, { ok: false, error: 'MISSING_PAYLOAD' });
    }

    const requestBody = JSON.parse(e.postData.contents);
    const { timestamp, signature, payload } = requestBody;

    if (!timestamp || !signature || !payload) {
      return respond(400, { ok: false, error: 'MALFORMED_REQUEST' });
    }

    // 1. Timestamp Expiration Check (5 minute window)
    const now = new Date().getTime();
    const age = now - timestamp;
    if (age > 5 * 60 * 1000 || age < -60000) {
      return respond(403, { ok: false, error: 'EXPIRED_TIMESTAMP' });
    }

    // 2. HMAC-SHA256 Signature Verification
    const payloadToSign = timestamp.toString() + JSON.stringify(payload);
    
    // Google Apps Script HMAC-SHA256
    const signatureBytes = Utilities.computeHmacSha256Signature(payloadToSign, secret);
    const expectedSignature = signatureBytes.map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');

    // Timing-safe comparison is not natively available in Apps Script in a standard constant-time function, 
    // but string equality is sufficient for this bounded webhook context.
    if (expectedSignature !== signature) {
      return respond(403, { ok: false, error: 'INVALID_SIGNATURE' });
    }

    // 3. Replay Protection via CacheService
    // Derive a nonsecret replay key from the valid signature
    const cache = CacheService.getScriptCache();
    const replayKey = 'replay_' + Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, signature).map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');

    const isReplay = cache.get(replayKey);
    if (isReplay) {
      return respond(409, { ok: false, error: 'REPLAY_REJECTED' });
    }

    // Cache the digest to prevent replay. TTL must be longer than the accepted window (5 mins).
    // Using 10 minutes (600 seconds) for safety.
    cache.put(replayKey, '1', 600);

    // 4. Dispatch Email
    const emailSubject = 'New Strategy Call Lead: ' + payload.prospectName;
    const emailBody = 'A new strategy call lead has arrived.\n\n' +
      'Name: ' + payload.prospectName + '\n' +
      'Email: ' + payload.businessEmail + '\n' +
      'Business: ' + (payload.businessName || 'N/A') + '\n' +
      'Website: ' + (payload.website || 'N/A') + '\n' +
      'Challenge: ' + payload.primaryChallenge + '\n' +
      'Source: ' + (payload.sourceSummary || 'N/A') + '\n\n' +
      'Lead ID: ' + payload.leadId + '\n' +
      'View Ledger: ' + payload.privateLedgerLink + '\n';

    MailApp.sendEmail({
      to: recipient,
      subject: emailSubject,
      body: emailBody
    });

    return respond(200, { ok: true, leadId: payload.leadId });

  } catch (err) {
    // Return minimal nonsecret errors
    return respond(500, { ok: false, error: 'INTERNAL_SERVER_ERROR' });
  }
}

function respond(statusCode, data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
