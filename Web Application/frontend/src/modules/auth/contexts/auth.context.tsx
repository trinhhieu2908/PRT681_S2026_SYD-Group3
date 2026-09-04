import { extractUserFromToken } from "@/common/utils/jwt";
import { AuthenticatedUser } from "@/modules/auth/model/user";
import { LoginResponse } from "@/modules/auth/model/responses";
import { authService } from "@/modules/auth/services/auth.service";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (response: LoginResponse) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    authService.clearSession();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!authService.hasValidRefreshToken()) {
        clearAuthState();
        return false;
      }

      const accessToken = await authService.getValidAccessToken();
      if (!accessToken) {
        clearAuthState();
        return false;
      }

      const userData = extractUserFromToken(accessToken);
      if (!userData) {
        clearAuthState();
        return false;
      }

      setIsAuthenticated(true);
      setUser(userData);
      return true;
    } catch (error) {
      clearAuthState();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState]);

  const login = useCallback((response: LoginResponse) => {
    authService.saveTokens(response.tokens);
    setIsAuthenticated(true);
    setUser({
      id: response.userId,
      email: response.email,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
