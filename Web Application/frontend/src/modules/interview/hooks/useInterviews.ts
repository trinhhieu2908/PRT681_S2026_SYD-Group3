import { useQuery } from "@tanstack/react-query";
import { interviewQueryKeys } from "@/modules/interview/hooks/query-keys";
import { interviewApi } from "@/modules/interview/services/api.service";

export const useInterviews = (jobApplicationId?: string) => {
  return useQuery({
    queryKey: interviewQueryKeys.byApplication(jobApplicationId ?? ""),
    queryFn: () => interviewApi.getAll(jobApplicationId!),
    enabled: Boolean(jobApplicationId),
  });
};
