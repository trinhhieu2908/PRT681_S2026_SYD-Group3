import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { interviewQueryKeys } from "@/modules/interview/hooks/query-keys";
import type { UpdateInterviewRequest } from "@/modules/interview/model/requests";
import { interviewApi } from "@/modules/interview/services/api.service";

interface UseUpdateInterviewOptions {
  onSuccess?: () => void;
}

export const useUpdateInterview = (
  jobApplicationId: string,
  interviewId: string,
  options: UseUpdateInterviewOptions = {},
) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: UpdateInterviewRequest) =>
      interviewApi.update(jobApplicationId, interviewId, request),
    retry: false,
    onSuccess: (interview) => {
      void queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.all,
      });
      toast.success(`${interview.title} updated.`);
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    updateInterview: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
