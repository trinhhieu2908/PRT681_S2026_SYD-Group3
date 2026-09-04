import Layout from "@/common/components/layout/layout";
import ProtectedRoute from "@/routes/protected-route";
import { routes } from "@/routes/routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";

const LoginRoute = lazy(() => import("@/routes/login-route"));
const DashboardPage = lazy(() => import("@/pages/dashboard/dashboard-page"));
const JobApplicationPage = lazy(
  () => import("@/pages/job-application/job-application-page"),
);
const JobApplicationDetailPage = lazy(
  () => import("@/pages/job-application/job-application-detail-page"),
);
const NotFoundPage = lazy(() => import("@/pages/not-found/not-found-page"));

const router = createBrowserRouter([
  {
    path: routes.loginPath,
    element: <LoginRoute />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: routes.homePath,
        element: <DashboardPage />,
      },
      {
        path: routes.jobApplicationsPath,
        element: <JobApplicationPage />,
      },
      {
        path: routes.jobApplicationDetailPath,
        element: <JobApplicationDetailPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
