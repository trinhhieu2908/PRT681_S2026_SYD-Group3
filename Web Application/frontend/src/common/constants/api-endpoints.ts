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
