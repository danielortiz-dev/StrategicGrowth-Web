export interface DiagnosticSubmission {
  schemaVersion: string;
  submissionKey: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone?: string;
  websiteUrl?: string;
  hasNoWebsite: boolean;
  infrastructure: 'ACTIVE' | 'PLACEHOLDER' | 'ZERO' | '';
  primaryFailure: 'ACQUISITION' | 'CONVERSION' | 'OPERATIONS' | 'UNKNOWN' | '';
  industry: string;
  leadVolume: '0-10' | '11-50' | '51-200' | '200+' | '';
  investmentRange: '1K-3K' | '3K-10K' | '10K-25K' | '25K+' | '';
  consentAccepted: boolean;
  clientStartedAt: string;
  landingPath: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  fbclid?: string;
  gclid?: string;
}
