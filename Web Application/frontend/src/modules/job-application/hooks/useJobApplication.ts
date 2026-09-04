import { useQuery } from "@tanstack/react-query";
import { JOB_APPLICATION_QUERY_KEY } from "@/modules/job-application/hooks/useJobApplications";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

export const useJobApplication = (id?: string) => {
  return useQuery({
    queryKey: [...JOB_APPLICATION_QUERY_KEY, "detail", id],
    queryFn: () => jobApplicationApi.getById(id!),
    enabled: Boolean(id),
  });
};
