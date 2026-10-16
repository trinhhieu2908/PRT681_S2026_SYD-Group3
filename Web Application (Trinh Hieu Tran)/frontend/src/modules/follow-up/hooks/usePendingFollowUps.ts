import { useQuery } from "@tanstack/react-query";
import { followUpQueryKeys } from "@/modules/follow-up/hooks/query-keys";
import { followUpApi } from "@/modules/follow-up/services/api.service";

export const usePendingFollowUps = () => {
  return useQuery({
    queryKey: followUpQueryKeys.pending,
    queryFn: followUpApi.getPending,
  });
};
