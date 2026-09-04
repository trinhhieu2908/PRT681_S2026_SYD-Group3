import axiosClient from "@/clients/axios-client";
import { JOB_APPLICATION_API } from "@/common/constants/api-endpoints";
import {
  CreateJobApplicationRequest,
  GetJobApplicationsRequest,
} from "@/modules/job-application/model/requests";
import {
  JobApplicationResponse,
  PagedJobApplicationsResponse,
} from "@/modules/job-application/model/responses";

export const jobApplicationApi = {
  getAll: async ({
    pageNumber,
    pageSize,
  }: GetJobApplicationsRequest): Promise<PagedJobApplicationsResponse> => {
    return axiosClient.get<
      PagedJobApplicationsResponse,
      PagedJobApplicationsResponse
    >(JOB_APPLICATION_API.root, {
      params: { pageNumber, pageSize },
    });
  },

  create: async (
    request: CreateJobApplicationRequest,
  ): Promise<JobApplicationResponse> => {
    return axiosClient.post<
      JobApplicationResponse,
      JobApplicationResponse,
      CreateJobApplicationRequest
    >(JOB_APPLICATION_API.root, request);
  },
};
