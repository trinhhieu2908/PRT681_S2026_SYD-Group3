import axiosClient from "@/clients/axios-client";
import { INTERVIEW_API } from "@/common/constants/api-endpoints";
import type {
  CreateInterviewRequest,
  GetUpcomingInterviewsRequest,
  UpdateInterviewRequest,
} from "@/modules/interview/model/requests";
import type {
  InterviewResponse,
  UpcomingInterviewResponse,
} from "@/modules/interview/model/responses";

export const interviewApi = {
  getAll: async (jobApplicationId: string): Promise<InterviewResponse[]> => {
    return axiosClient.get<InterviewResponse[], InterviewResponse[]>(
      INTERVIEW_API.byApplication(jobApplicationId),
    );
  },

  getById: async (
    jobApplicationId: string,
    interviewId: string,
  ): Promise<InterviewResponse> => {
    return axiosClient.get<InterviewResponse, InterviewResponse>(
      INTERVIEW_API.byId(jobApplicationId, interviewId),
    );
  },

  create: async (
    jobApplicationId: string,
    request: CreateInterviewRequest,
  ): Promise<InterviewResponse> => {
    return axiosClient.post<
      InterviewResponse,
      InterviewResponse,
      CreateInterviewRequest
    >(INTERVIEW_API.byApplication(jobApplicationId), request);
  },

  update: async (
    jobApplicationId: string,
    interviewId: string,
    request: UpdateInterviewRequest,
  ): Promise<InterviewResponse> => {
    return axiosClient.patch<
      InterviewResponse,
      InterviewResponse,
      UpdateInterviewRequest
    >(INTERVIEW_API.byId(jobApplicationId, interviewId), request);
  },

  delete: async (
    jobApplicationId: string,
    interviewId: string,
  ): Promise<void> => {
    await axiosClient.delete(INTERVIEW_API.byId(jobApplicationId, interviewId));
  },

  getUpcoming: async (
    request: GetUpcomingInterviewsRequest,
  ): Promise<UpcomingInterviewResponse[]> => {
    return axiosClient.get<
      UpcomingInterviewResponse[],
      UpcomingInterviewResponse[]
    >(INTERVIEW_API.upcoming, { params: request });
  },
};
