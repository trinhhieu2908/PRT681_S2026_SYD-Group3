export interface ResumeResponse {
  id: string;
  fileName: string;
  objectKey: string;
  contentType: string;
  presignUrl?: string;
  presignedUrl?: string;
  url?: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface CoverLetterResponse {
  id: string;
  jobApplicationId: string;
  fileName: string;
  objectKey: string;
  contentType: string;
  presignUrl?: string;
  presignedUrl?: string;
  url?: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface UploadPresignedUrlResponse {
  fileName: string;
  objectKey: string;
  uploadUrl: string;
  httpMethod: string;
  contentType: string;
  expiresAtUtc: string;
}

export interface GenerateUploadPresignedUrlsResponse {
  uploads: UploadPresignedUrlResponse[];
}
