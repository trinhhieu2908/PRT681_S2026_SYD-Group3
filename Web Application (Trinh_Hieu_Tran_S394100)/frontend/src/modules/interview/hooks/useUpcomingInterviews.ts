import { useQuery } from "@tanstack/react-query";
import { interviewQueryKeys } from "@/modules/interview/hooks/query-keys";
import { interviewApi } from "@/modules/interview/services/api.service";

export const useUpcomingInterviews = (days: number) => {
  return useQuery({
    queryKey: interviewQueryKeys.upcoming(days),
    queryFn: () => interviewApi.getUpcoming({ days }),
  });
};
