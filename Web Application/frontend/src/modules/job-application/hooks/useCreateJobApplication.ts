import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardQueryKeys } from "@/modules/dashboard/hooks/query-keys";
import { JOB_APPLICATION_QUERY_KEY } from "@/modules/job-application/hooks/useJobApplications";
import { jobApplicationApi } from "@/modules/job-application/services/api.service";

interface UseCreateJobApplicationOptions {
  onSuccess?: () => void;
}

export const useCreateJobApplication = ({
  onSuccess,
}: UseCreateJobApplicationOptions = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: jobApplicationApi.create,
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: JOB_APPLICATION_QUERY_KEY,
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
      toast.success("Job application created.");
      onSuccess?.();
    },
  });

  return {
    createJobApplication: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
