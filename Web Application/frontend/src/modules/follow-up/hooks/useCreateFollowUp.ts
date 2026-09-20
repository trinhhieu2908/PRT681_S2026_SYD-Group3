import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { followUpQueryKeys } from "@/modules/follow-up/hooks/query-keys";
import type { CreateFollowUpRequest } from "@/modules/follow-up/model/requests";
import { followUpApi } from "@/modules/follow-up/services/api.service";

interface UseCreateFollowUpOptions {
  onSuccess?: () => void;
}

export const useCreateFollowUp = (
  jobApplicationId: string,
  options: UseCreateFollowUpOptions = {},
) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreateFollowUpRequest) =>
      followUpApi.create(jobApplicationId, request),
    retry: false,
    onSuccess: (followUp) => {
      void queryClient.invalidateQueries({ queryKey: followUpQueryKeys.all });
      toast.success(`${followUp.title} added.`);
      options.onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    createFollowUp: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
