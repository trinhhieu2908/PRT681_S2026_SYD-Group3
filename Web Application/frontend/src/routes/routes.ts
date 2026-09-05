export const routes = {
  homePath: "/",
  loginPath: "/login",
  jobApplicationsPath: "/job-applications",
  jobApplicationDetailPath: "/job-applications/:id",
  getJobApplicationDetailPath: (id: string) => `/job-applications/${id}`,
};
