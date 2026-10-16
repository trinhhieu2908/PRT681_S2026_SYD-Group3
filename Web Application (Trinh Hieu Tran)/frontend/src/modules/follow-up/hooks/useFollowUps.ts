import { useQuery } from "@tanstack/react-query";
import { followUpQueryKeys } from "@/modules/follow-up/hooks/query-keys";
import { followUpApi } from "@/modules/follow-up/services/api.service";

export const useFollowUps = (jobApplicationId?: string) => {
  return useQuery({
    queryKey: followUpQueryKeys.byApplication(jobApplicationId ?? ""),
    queryFn: () => followUpApi.getAll(jobApplicationId!),
    enabled: Boolean(jobApplicationId),
  });
};
