export const routes = {
  homePath: "/",
  loginPath: "/login",
  interviewsPath: "/interviews",
  jobApplicationsPath: "/job-applications",
  jobApplicationDetailPath: "/job-applications/:id",
  getJobApplicationDetailPath: (id: string) => `/job-applications/${id}`,
};
