import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { JOB_APPLICATION_QUERY_KEY } from "@/modules/job-application/hooks/useJobApplications";
import { UpdateJobApplicationStatusRequest } from "@/modules/job-application/model/requests";
import { JobApplicationResponse } from "@/modules/job-application/model/responses";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

export const useUpdateJobApplicationStatus = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: UpdateJobApplicationStatusRequest) =>
      jobApplicationApi.updateStatus(id, request),
    retry: false,
    onSuccess: (application: JobApplicationResponse) => {
      queryClient.setQueryData(
        [...JOB_APPLICATION_QUERY_KEY, "detail", id],
        application,
      );
      void queryClient.invalidateQueries({
        queryKey: JOB_APPLICATION_QUERY_KEY,
      });
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
