# Google Sheets Lead Ledger Setup

This document outlines the legitimate manual setup steps required to connect the secure Vercel Serverless Function to a private Google Sheet.

## Manual Setup Steps

1. **Create or select a Google Cloud project** in the [Google Cloud Console](https://console.cloud.google.com/).
2. **Enable the Google Sheets API** for the project.
3. **Create a Service Account** and generate a JSON key. You will need the `client_email` and `private_key` from this JSON file.
4. **Create a private Google Sheet** owned by `strategicgrowth.biz@gmail.com`.
5. **Share the Sheet** with the service-account email as an **Editor**.
6. **Obtain the Sheet ID** from the Google Sheet URL (the long string between `/d/` and `/edit`).
7. **Set the required Vercel Preview environment variables**:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SHEET_TAB_NAME`
   - `LEAD_SUBMISSION_ALLOWED_ORIGINS`
8. **Redeploy the feature branch preview** on Vercel to apply the new environment variables.
9. **Submit a controlled test lead** through the deployed micro-intake form.
10. **Confirm the row appears** in the Google Sheet and verify no secrets or PII appear in the Vercel logs or browser network assets.

## Expected Sheet Headers
The endpoint will automatically initialize the following headers if the configured tab is entirely empty:

1. Lead ID
2. Submission ID
3. Received At
4. First Name
5. Last Name
6. Email
7. Business Name
8. Website
9. Main Challenge
10. Attribution Source
11. Attribution Medium
12. Attribution Campaign
13. Attribution Content
14. Attribution Term
15. Referrer
16. Landing Page
17. Intake Status
18. Booking Status
19. Call Prep Status
20. Follow-Up Status

*Note: If existing headers do not match exactly, the server will reject submissions to prevent data corruption.*

## Idempotency Behavior
The server uses the `Submission ID` field (Column B) to ensure idempotent submissions. If a user retries a submission due to a network error, and the server finds a matching Submission ID already appended to the sheet, it will return the existing Lead ID and will not append a duplicate row.

## Known Limitations
- Google Sheets does not provide full transactional uniqueness under simultaneous concurrent writes. High-volume concurrent submissions may result in eventual consistency issues or overwrites, though this is acceptable for a low-volume Client Zero launch.
- Distributed rate limiting is not implemented at the infrastructure layer in Phase 2A; basic controls include payload sizing, CORS, and submission ID idempotency.

## Maintenance
- **Removing a Test Row:** Simply delete the row manually in Google Sheets.
- **Disabling the Endpoint:** If the configuration is wrong or you need to pause ingestion safely, you can temporarily clear the `GOOGLE_SHEET_ID` or `LEAD_SUBMISSION_ALLOWED_ORIGINS` environment variables in Vercel.
