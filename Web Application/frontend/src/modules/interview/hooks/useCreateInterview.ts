import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { interviewQueryKeys } from "@/modules/interview/hooks/query-keys";
import type { CreateInterviewRequest } from "@/modules/interview/model/requests";
import { interviewApi } from "@/modules/interview/services/api.service";

interface UseCreateInterviewOptions {
  onSuccess?: () => void;
}

export const useCreateInterview = (
  jobApplicationId: string,
  options: UseCreateInterviewOptions = {},
) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreateInterviewRequest) =>
      interviewApi.create(jobApplicationId, request),
    retry: false,
    onSuccess: (interview) => {
      void queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.all,
      });
      toast.success(`${interview.title} added.`);
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createInterview: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
