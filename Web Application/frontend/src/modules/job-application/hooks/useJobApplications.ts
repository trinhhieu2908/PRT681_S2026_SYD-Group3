import { useQuery } from "@tanstack/react-query";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

export const JOB_APPLICATION_QUERY_KEY = ["job-applications"] as const;
export const DEFAULT_JOB_APPLICATION_PAGE_SIZE = 20;

export const useJobApplications = (
  pageNumber: number,
  pageSize = DEFAULT_JOB_APPLICATION_PAGE_SIZE,
) => {
  return useQuery({
    queryKey: [...JOB_APPLICATION_QUERY_KEY, pageNumber, pageSize],
    queryFn: () => jobApplicationApi.getAll({ pageNumber, pageSize }),
  });
};
