export interface LeadData {
  leadId: string;
  prospectName: string;
  businessName: string;
  businessEmail: string;
  website: string;
  primaryChallenge: string;
  sourceSummary: string;
  landingPage: string;
  bookingStatus: string;
  followUpStatus: string;
  responseTarget: string;
  privateLedgerLink: string;
}

export interface NotificationAdapter {
  send(lead: LeadData, submissionId: string, store: any): Promise<void>;
}
