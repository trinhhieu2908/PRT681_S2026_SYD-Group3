import type { JobApplicationStatus } from "@/modules/job-application/model/responses";

export interface CreateJobApplicationRequest {
  companyName: string;
  roleTitle: string;
  platform: string;
  jobLink?: string | null;
  portfolioLink?: string | null;
  gitHubLink?: string | null;
}

export interface GetJobApplicationsRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: JobApplicationStatus;
  platform?: string;
  fromDate?: string;
  toDate?: string;
}

export type JobApplicationFilters = Pick<
  GetJobApplicationsRequest,
  "status" | "platform" | "fromDate" | "toDate"
>;
