import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { JOB_APPLICATION_QUERY_KEY } from "@/modules/job-application/hooks/useJobApplications";
import { JobApplicationResponse } from "@/modules/job-application/model/responses";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

export const useUnarchiveJobApplication = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => jobApplicationApi.unarchive(id),
    retry: false,
    onSuccess: (application: JobApplicationResponse) => {
      queryClient.setQueryData(
        [...JOB_APPLICATION_QUERY_KEY, "detail", id],
        application,
      );
      void queryClient.invalidateQueries({
        queryKey: JOB_APPLICATION_QUERY_KEY,
      });
      toast.success(`Application restored to ${application.currentStatus}.`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    unarchive: mutation.mutate,
    isUnarchiving: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
