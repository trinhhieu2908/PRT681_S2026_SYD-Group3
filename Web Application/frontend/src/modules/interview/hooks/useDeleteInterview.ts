import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { interviewQueryKeys } from "@/modules/interview/hooks/query-keys";
import { interviewApi } from "@/modules/interview/services/api.service";

export const useDeleteInterview = (jobApplicationId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (interviewId: string) =>
      interviewApi.delete(jobApplicationId, interviewId),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: interviewQueryKeys.all,
      });
      toast.success("Interview deleted.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    deleteInterview: mutation.mutateAsync,
    deletingInterviewId: mutation.isPending ? mutation.variables : undefined,
  };
};
