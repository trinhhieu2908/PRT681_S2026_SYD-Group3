import { authService } from "@/modules/auth/services/auth.service";
import { extractUserFromToken } from "@/common/utils/jwt";
import { AuthenticatedUser } from "@/modules/auth/model/user";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if refresh token exists and is valid
      if (!authService.isAuthenticated()) {
        logout();
        return false;
      }

      // Try to get a valid access token
      const accessToken = await authService.getValidAccessToken();

      if (!accessToken) {
        logout();
        return false;
      }

      // Extract user from token
      const userData = extractUserFromToken(accessToken);

      if (!userData) {
        logout();
        return false;
      }

      setIsAuthenticated(true);
      setUser(userData);
      return true;
    } catch (error) {
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  /**
   * Login with tokens
   */
  const login = (accessToken: string, refreshToken: string) => {
    // Save tokens
    authService.saveTokens({ accessToken, refreshToken, user: null });

    // Extract user info
    const userData = extractUserFromToken(accessToken);

    if (userData) {
      setIsAuthenticated(true);
      setUser(userData);
      setIsLoading(false); // Important: Set loading to false after login
    } else {
      authService.logout();
      setIsLoading(false);
    }
  };

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
