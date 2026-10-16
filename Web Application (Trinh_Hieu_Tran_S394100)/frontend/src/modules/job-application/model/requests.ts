import type { JobApplicationStatus } from "@/modules/job-application/model/responses";

export interface CreateJobApplicationRequest {
  companyName: string;
  roleTitle: string;
  platform: string;
  jobLink?: string | null;
  portfolioLink?: string | null;
  gitHubLink?: string | null;
}

export interface UpdateJobApplicationRequest {
  companyName?: string;
  roleTitle?: string;
  platform?: string;
  applicationDate?: string;
  jobLink?: string;
  portfolioLink?: string;
  gitHubLink?: string;
}

export type JobApplicationLinkField =
  | "jobLink"
  | "portfolioLink"
  | "gitHubLink";

export type JobApplicationEditableField = keyof UpdateJobApplicationRequest;

export type JobApplicationEditableValue<
  Field extends JobApplicationEditableField,
> = Field extends JobApplicationLinkField ? string | null : string;

export interface GetJobApplicationsRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: JobApplicationStatus;
  platform?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UpdateJobApplicationStatusRequest {
  newStatus: JobApplicationStatus;
  skipToOffer: boolean;
}

export type JobApplicationFilters = Pick<
  GetJobApplicationsRequest,
  "status" | "platform" | "fromDate" | "toDate"
>;
