import axiosClient from "@/clients/axios-client";
import { DASHBOARD_API } from "@/common/constants/api-endpoints";
import type { DashboardSummaryResponse } from "@/modules/dashboard/model/responses";

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    return axiosClient.get<DashboardSummaryResponse, DashboardSummaryResponse>(
      DASHBOARD_API.summary,
    );
  },
};
