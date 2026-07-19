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

function secureCompareHex(expected, provided) {
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

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let locked = false;

  try {
    const props = PropertiesService.getScriptProperties();
    const secret = props.getProperty('LEAD_EMAIL_WEBHOOK_SECRET');
    const recipient = props.getProperty('LEAD_EMAIL_RECIPIENT');

    if (!secret || !recipient) {
      return respond({ ok: false, error: 'CONFIGURATION_ERROR' });
    }

    if (!e || !e.postData || !e.postData.contents) {
      return respond({ ok: false, error: 'MALFORMED_REQUEST' });
    }

    let requestBody;
    try {
      requestBody = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return respond({ ok: false, error: 'MALFORMED_REQUEST' });
    }

    const { timestamp, signature, payload } = requestBody;

    if (
      typeof timestamp !== 'number' ||
      !isFinite(timestamp) ||
      typeof signature !== 'string' ||
      signature.length !== 64 ||
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return respond({ ok: false, error: 'MALFORMED_REQUEST' });
    }

    if (!payload.prospectName || !payload.businessEmail || !payload.primaryChallenge || !payload.leadId) {
      return respond({ ok: false, error: 'MALFORMED_REQUEST' });
    }

    // 1. Timestamp Expiration Check (5 minute window in past, 1 minute in future)
    const now = new Date().getTime();
    const age = now - timestamp;
    if (age > 5 * 60 * 1000 || age < -60000) {
      return respond({ ok: false, error: 'EXPIRED_TIMESTAMP' });
    }

    // 2. HMAC-SHA256 Signature Verification
    const payloadToSign = timestamp.toString() + JSON.stringify(payload);
    
    // Google Apps Script HMAC-SHA256
    const signatureBytes = Utilities.computeHmacSha256Signature(payloadToSign, secret);
    const expectedSignature = signatureBytes.map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');

    // Best-effort fixed-length comparison in the Apps Script JavaScript runtime
    if (!secureCompareHex(expectedSignature, signature)) {
      return respond({ ok: false, error: 'INVALID_SIGNATURE' });
    }

    // 3. Replay Protection via CacheService and LockService
    // Derive a nonsecret replay key from the valid signature
    const replayKey = 'replay_' + Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, signature).map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');

    locked = lock.tryLock(5000);
    if (!locked) {
      return respond({ ok: false, error: 'LOCK_UNAVAILABLE' });
    }

    const cache = CacheService.getScriptCache();
    const isReplay = cache.get(replayKey);
    if (isReplay) {
      return respond({ ok: false, error: 'REPLAY_REJECTED' });
    }

    // Place a PROCESSING replay marker before sending
    cache.put(replayKey, 'PROCESSING', 600);

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

    try {
      MailApp.sendEmail({
        to: recipient,
        subject: emailSubject,
        body: emailBody
      });
      // Replace marker with SENT after successful send
      cache.put(replayKey, 'SENT', 600);
    } catch (mailErr) {
      cache.remove(replayKey);
      return respond({ ok: false, error: 'EMAIL_SEND_FAILED' });
    }

    return respond({ ok: true, leadId: payload.leadId });

  } catch (err) {
    // Return minimal nonsecret errors
    return respond({ ok: false, error: 'INTERNAL_SERVER_ERROR' });
  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}
