import axiosClient from "@/clients/axios-client";
import { FOLLOW_UP_API } from "@/common/constants/api-endpoints";
import type {
  CreateFollowUpRequest,
  UpdateFollowUpCompletionRequest,
  UpdateFollowUpRequest,
} from "@/modules/follow-up/model/requests";
import type {
  FollowUpResponse,
  PendingFollowUpResponse,
} from "@/modules/follow-up/model/responses";

export const followUpApi = {
  getAll: async (jobApplicationId: string): Promise<FollowUpResponse[]> => {
    return axiosClient.get<FollowUpResponse[], FollowUpResponse[]>(
      FOLLOW_UP_API.byApplication(jobApplicationId),
    );
  },

  create: async (
    jobApplicationId: string,
    request: CreateFollowUpRequest,
  ): Promise<FollowUpResponse> => {
    return axiosClient.post<
      FollowUpResponse,
      FollowUpResponse,
      CreateFollowUpRequest
    >(FOLLOW_UP_API.byApplication(jobApplicationId), request);
  },

  update: async (
    jobApplicationId: string,
    followUpId: string,
    request: UpdateFollowUpRequest,
  ): Promise<FollowUpResponse> => {
    return axiosClient.patch<
      FollowUpResponse,
      FollowUpResponse,
      UpdateFollowUpRequest
    >(FOLLOW_UP_API.byId(jobApplicationId, followUpId), request);
  },

  updateCompletion: async (
    jobApplicationId: string,
    followUpId: string,
    request: UpdateFollowUpCompletionRequest,
  ): Promise<FollowUpResponse> => {
    return axiosClient.patch<
      FollowUpResponse,
      FollowUpResponse,
      UpdateFollowUpCompletionRequest
    >(FOLLOW_UP_API.completion(jobApplicationId, followUpId), request);
  },

  delete: async (
    jobApplicationId: string,
    followUpId: string,
  ): Promise<void> => {
    await axiosClient.delete(FOLLOW_UP_API.byId(jobApplicationId, followUpId));
  },

  getPending: async (): Promise<PendingFollowUpResponse[]> => {
    return axiosClient.get<
      PendingFollowUpResponse[],
      PendingFollowUpResponse[]
    >(FOLLOW_UP_API.pending);
  },
};
