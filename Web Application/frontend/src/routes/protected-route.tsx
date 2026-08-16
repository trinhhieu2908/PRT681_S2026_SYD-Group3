import { ReactNode } from "react";
import { useAuthGuard } from "@/modules/auth/hooks/useAuthGuard";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, isAuthorized } = useAuthGuard();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null; // Auth guard will handle redirects
  }

  return <>{children}</>;
};

export default ProtectedRoute;
