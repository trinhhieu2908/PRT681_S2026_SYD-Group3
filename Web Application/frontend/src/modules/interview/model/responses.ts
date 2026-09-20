export interface InterviewResponse {
  id: string;
  jobApplicationId: string;
  title: string;
  interviewType: string;
  scheduledAtUtc: string;
  location: string | null;
  meetingLink: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface UpcomingInterviewResponse {
  id: string;
  jobApplicationId: string;
  companyName: string;
  roleTitle: string;
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

export type InterviewCardData = InterviewResponse | UpcomingInterviewResponse;
