export type JobApplicationStatus =
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn"
  | "Archived";

export interface JobApplicationResponse {
  id: string;
  companyName: string;
  roleTitle: string;
  platform: string;
  applicationDate: string;
  currentStatus: JobApplicationStatus;
  jobLink: string | null;
  portfolioLink: string | null;
  gitHubLink: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface PagedJobApplicationsResponse {
  items: JobApplicationResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
