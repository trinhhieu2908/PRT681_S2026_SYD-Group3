export type StorageContext = "resume" | "cover-letter";

export interface GenerateUploadPresignedUrlsRequest {
  context: StorageContext;
  fileNames: string[];
}

export interface SaveResumeRequest {
  jobApplicationId: string;
  fileName: string;
  objectKey: string;
  contentType: string;
}

export interface AttachResumeRequest {
  resumeId: string;
}

export interface SaveCoverLetterRequest {
  fileName: string;
  objectKey: string;
  contentType: string;
}
