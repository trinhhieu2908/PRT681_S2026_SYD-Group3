import { useQuery } from "@tanstack/react-query";
import { dashboardQueryKeys } from "@/modules/dashboard/hooks/query-keys";
import { dashboardApi } from "@/modules/dashboard/services/api.service";

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: dashboardApi.getSummary,
  });
};
