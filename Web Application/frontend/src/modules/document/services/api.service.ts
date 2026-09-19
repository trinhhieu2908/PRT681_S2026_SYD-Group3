import axiosClient from "@/clients/axios-client";
import {
  JOB_APPLICATION_API,
  RESUME_API,
  STORAGE_API,
} from "@/common/constants/api-endpoints";
import {
  AttachResumeRequest,
  GenerateUploadPresignedUrlsRequest,
  SaveCoverLetterRequest,
  SaveResumeRequest,
} from "@/modules/document/model/requests";
import {
  CoverLetterResponse,
  GenerateUploadPresignedUrlsResponse,
  ResumeResponse,
  UploadPresignedUrlResponse,
} from "@/modules/document/model/responses";

export const documentApi = {
  getResumes: async (): Promise<ResumeResponse[]> => {
    return axiosClient.get<ResumeResponse[], ResumeResponse[]>(RESUME_API.root);
  },

  generateUploadPresignedUrls: async (
    request: GenerateUploadPresignedUrlsRequest,
  ): Promise<GenerateUploadPresignedUrlsResponse> => {
    return axiosClient.post<
      GenerateUploadPresignedUrlsResponse,
      GenerateUploadPresignedUrlsResponse,
      GenerateUploadPresignedUrlsRequest
    >(STORAGE_API.uploadPresignedUrls, request);
  },

  uploadToPresignedUrl: async (
    file: File,
    upload: UploadPresignedUrlResponse,
  ): Promise<void> => {
    const response = await fetch(upload.uploadUrl, {
      method: upload.httpMethod,
      headers: {
        "Content-Type": upload.contentType,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error("The file could not be uploaded. Please try again.");
    }
  },

  saveResume: async (request: SaveResumeRequest): Promise<ResumeResponse> => {
    return axiosClient.post<ResumeResponse, ResumeResponse, SaveResumeRequest>(
      RESUME_API.root,
      request,
    );
  },

  attachResume: async (
    jobApplicationId: string,
    request: AttachResumeRequest,
  ): Promise<ResumeResponse> => {
    return axiosClient.put<ResumeResponse, ResumeResponse, AttachResumeRequest>(
      JOB_APPLICATION_API.resume(jobApplicationId),
      request,
    );
  },

  saveCoverLetter: async (
    jobApplicationId: string,
    request: SaveCoverLetterRequest,
  ): Promise<CoverLetterResponse> => {
    return axiosClient.put<
      CoverLetterResponse,
      CoverLetterResponse,
      SaveCoverLetterRequest
    >(JOB_APPLICATION_API.coverLetter(jobApplicationId), request);
  },
};
