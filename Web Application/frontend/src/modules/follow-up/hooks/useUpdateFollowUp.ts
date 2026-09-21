import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardQueryKeys } from "@/modules/dashboard/hooks/query-keys";
import { followUpQueryKeys } from "@/modules/follow-up/hooks/query-keys";
import type { UpdateFollowUpRequest } from "@/modules/follow-up/model/requests";
import { followUpApi } from "@/modules/follow-up/services/api.service";

interface UseUpdateFollowUpOptions {
  onSuccess?: () => void;
}

export const useUpdateFollowUp = (
  jobApplicationId: string,
  followUpId: string,
  options: UseUpdateFollowUpOptions = {},
) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: UpdateFollowUpRequest) =>
      followUpApi.update(jobApplicationId, followUpId, request),
    retry: false,
    onSuccess: (followUp) => {
      void queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
      toast.success(`${followUp.title} updated.`);
      options.onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    updateFollowUp: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
