import { useEffect } from "react";
import { useAuth } from "@/modules/auth/contexts/auth.context";
import { useNavigate, useLocation } from "react-router-dom";
import { routes } from "@/routes/routes";

interface AuthGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
}

export const useAuthGuard = (): AuthGuardResult => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) {
      return;
    }

    // If authentication is required and user is not authenticated
    if (!isAuthenticated) {
      navigate(routes.loginPath, {
        replace: true,
        state: { from: location },
      });
      return;
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  return {
    isLoading,
    isAuthorized: !isLoading && isAuthenticated,
  };
};
