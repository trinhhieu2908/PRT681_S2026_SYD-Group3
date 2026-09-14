import axiosClient from "@/clients/axios-client";
import { JOB_APPLICATION_API } from "@/common/constants/api-endpoints";
import {
  CreateJobApplicationRequest,
  GetJobApplicationsRequest,
  UpdateJobApplicationRequest,
  UpdateJobApplicationStatusRequest,
} from "@/modules/job-application/model/requests";
import {
  JobApplicationDetailResponse,
  JobApplicationResponse,
  PagedJobApplicationsResponse,
} from "@/modules/job-application/model/responses";

export const jobApplicationApi = {
  getById: async (id: string): Promise<JobApplicationDetailResponse> => {
    return axiosClient.get<
      JobApplicationDetailResponse,
      JobApplicationDetailResponse
    >(`${JOB_APPLICATION_API.root}/${id}`);
  },

  getAll: async (
    request: GetJobApplicationsRequest,
  ): Promise<PagedJobApplicationsResponse> => {
    return axiosClient.get<
      PagedJobApplicationsResponse,
      PagedJobApplicationsResponse
    >(JOB_APPLICATION_API.root, {
      params: request,
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

  update: async (
    id: string,
    request: UpdateJobApplicationRequest,
  ): Promise<JobApplicationResponse> => {
    return axiosClient.put<
      JobApplicationResponse,
      JobApplicationResponse,
      UpdateJobApplicationRequest
    >(`${JOB_APPLICATION_API.root}/${id}`, request);
  },

  updateStatus: async (
    id: string,
    request: UpdateJobApplicationStatusRequest,
  ): Promise<JobApplicationResponse> => {
    return axiosClient.patch<
      JobApplicationResponse,
      JobApplicationResponse,
      UpdateJobApplicationStatusRequest
    >(JOB_APPLICATION_API.status(id), request);
  },

  unarchive: async (id: string): Promise<JobApplicationResponse> => {
    return axiosClient.post<JobApplicationResponse, JobApplicationResponse>(
      JOB_APPLICATION_API.unarchive(id),
    );
  },
};
