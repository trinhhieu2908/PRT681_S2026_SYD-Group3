import LoginPage from "@/pages/auth/login-page";
import { routes } from "./routes";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/contexts/auth.context";

// Login route component that handles redirect logic
const LoginRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to={routes.homePath} replace />
  ) : (
    <LoginPage />
  );
};

export default LoginRoute;
