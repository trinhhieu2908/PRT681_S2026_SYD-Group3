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
};
