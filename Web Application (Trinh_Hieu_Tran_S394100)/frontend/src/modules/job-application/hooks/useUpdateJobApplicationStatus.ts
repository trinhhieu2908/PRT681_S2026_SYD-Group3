import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardQueryKeys } from "@/modules/dashboard/hooks/query-keys";
import { JOB_APPLICATION_QUERY_KEY } from "@/modules/job-application/hooks/useJobApplications";
import { UpdateJobApplicationStatusRequest } from "@/modules/job-application/model/requests";
import {
  JobApplicationDetailResponse,
  JobApplicationResponse,
} from "@/modules/job-application/model/responses";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

export const useUpdateJobApplicationStatus = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: UpdateJobApplicationStatusRequest) =>
      jobApplicationApi.updateStatus(id, request),
    retry: false,
    onSuccess: (application: JobApplicationResponse) => {
      queryClient.setQueryData<JobApplicationDetailResponse>(
        [...JOB_APPLICATION_QUERY_KEY, "detail", id],
        (current) =>
          current
            ? {
                ...current,
                ...application,
              }
            : undefined,
      );
      void queryClient.invalidateQueries({
        queryKey: JOB_APPLICATION_QUERY_KEY,
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
      toast.success(`Application moved to ${application.currentStatus}.`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    updateStatus: mutation.mutate,
    isUpdating: mutation.isPending,
    pendingStatus: mutation.variables?.newStatus,
    error: mutation.error,
    reset: mutation.reset,
  };
};
