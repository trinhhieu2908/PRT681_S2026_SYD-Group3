export interface CreateInterviewRequest {
  title: string;
  interviewType: string;
  scheduledAtUtc: string;
  location: string | null;
  meetingLink: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
}

export interface UpdateInterviewRequest {
  title?: string;
  interviewType?: string;
  scheduledAtUtc?: string;
  location?: string;
  meetingLink?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

export interface GetUpcomingInterviewsRequest {
  days: number;
}
