export const AUTH_API = {
  register: "/auth/register",
  login: "/auth/login",
  refreshToken: "/auth/refresh",
  logout: "/auth/logout",
};

export const JOB_APPLICATION_API = {
  root: "/job-applications",
  status: (id: string) => `/job-applications/${id}/status`,
  unarchive: (id: string) => `/job-applications/${id}/unarchive`,
  resume: (id: string) => `/job-applications/${id}/resume`,
  coverLetter: (id: string) => `/job-applications/${id}/cover-letter`,
};

export const RESUME_API = {
  root: "/resumes",
};

export const STORAGE_API = {
  uploadPresignedUrls: "/storage/upload-presigned-urls",
};

export const INTERVIEW_API = {
  upcoming: "/interviews/upcoming",
  byApplication: (jobApplicationId: string) =>
    `/job-applications/${jobApplicationId}/interviews`,
  byId: (jobApplicationId: string, interviewId: string) =>
    `/job-applications/${jobApplicationId}/interviews/${interviewId}`,
};

export const FOLLOW_UP_API = {
  pending: "/follow-ups/pending",
  byApplication: (jobApplicationId: string) =>
    `/job-applications/${jobApplicationId}/follow-ups`,
  byId: (jobApplicationId: string, followUpId: string) =>
    `/job-applications/${jobApplicationId}/follow-ups/${followUpId}`,
  completion: (jobApplicationId: string, followUpId: string) =>
    `/job-applications/${jobApplicationId}/follow-ups/${followUpId}/completion`,
};

export const DASHBOARD_API = {
  summary: "/dashboard/summary",
};
