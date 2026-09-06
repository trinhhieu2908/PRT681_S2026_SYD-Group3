import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetJobApplicationsRequest } from "@/modules/job-application/model/requests";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

export const JOB_APPLICATION_QUERY_KEY = ["job-applications"] as const;
export const DEFAULT_JOB_APPLICATION_PAGE_SIZE = 20;

export const useJobApplications = (request: GetJobApplicationsRequest) => {
  return useQuery({
    queryKey: [...JOB_APPLICATION_QUERY_KEY, request],
    queryFn: () => jobApplicationApi.getAll(request),
    placeholderData: keepPreviousData,
  });
};
