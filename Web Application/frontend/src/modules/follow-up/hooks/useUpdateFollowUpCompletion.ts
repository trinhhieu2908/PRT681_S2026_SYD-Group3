import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { followUpQueryKeys } from "@/modules/follow-up/hooks/query-keys";
import type { UpdateFollowUpCompletionRequest } from "@/modules/follow-up/model/requests";
import { followUpApi } from "@/modules/follow-up/services/api.service";

interface CompletionVariables extends UpdateFollowUpCompletionRequest {
  jobApplicationId: string;
  followUpId: string;
}

export const useUpdateFollowUpCompletion = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (variables: CompletionVariables) =>
      followUpApi.updateCompletion(
        variables.jobApplicationId,
        variables.followUpId,
        { isCompleted: variables.isCompleted },
      ),
    retry: false,
    onSuccess: (followUp) => {
      void queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
      toast.success(
        followUp.isCompleted ? "Follow-up completed." : "Follow-up reopened.",
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    updateCompletion: mutation.mutate,
    isUpdatingCompletion: mutation.isPending,
    updatingFollowUpId: mutation.isPending
      ? mutation.variables?.followUpId
      : undefined,
  };
};
