import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { followUpQueryKeys } from "@/modules/follow-up/hooks/query-keys";
import { followUpApi } from "@/modules/follow-up/services/api.service";

export const useDeleteFollowUp = (jobApplicationId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (followUpId: string) =>
      followUpApi.delete(jobApplicationId, followUpId),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
      toast.success("Follow-up deleted.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    deleteFollowUp: mutation.mutateAsync,
    deletingFollowUpId: mutation.isPending ? mutation.variables : undefined,
  };
};
