import {apiRequest} from './api';

export type ReportReason = 'scam' | 'spam' | 'offensive' | 'inaccurate' | 'other';

export type ReportInput = {
  reason: ReportReason;
  details?: string;
  property_id?: string;
  reported_user_id?: string;
};

export async function createReport(input: ReportInput): Promise<void> {
  await apiRequest<void>('/reports', {
    method: 'POST',
    body: input,
    authenticated: true
  });
}
