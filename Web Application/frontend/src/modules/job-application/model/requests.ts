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
}
