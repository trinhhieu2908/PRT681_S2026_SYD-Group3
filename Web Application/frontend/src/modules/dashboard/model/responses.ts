import type { PendingFollowUpResponse } from "@/modules/follow-up/model/responses";
import type { UpcomingInterviewResponse } from "@/modules/interview/model/responses";
import type { JobApplicationStatus } from "@/modules/job-application/model/responses";

export interface DashboardStatusCountResponse {
  status: JobApplicationStatus;
  count: number;
}

export interface DashboardPlatformCountResponse {
  platform: string;
  count: number;
}

export interface DashboardSummaryResponse {
  activeApplicationCount: number;
  applicationsByStatus: DashboardStatusCountResponse[];
  applicationsByPlatform: DashboardPlatformCountResponse[];
  upcomingInterviews: UpcomingInterviewResponse[];
  overdueFollowUps: PendingFollowUpResponse[];
}
