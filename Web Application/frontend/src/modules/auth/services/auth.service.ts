import { authApi } from "@/modules/auth/services/api.service";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "@/clients/local-storage";
import { isTokenExpired } from "@/common/utils/jwt";
import { LoginResponse } from "@/modules/auth/model/responses";

class AuthService {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  /**
   * Check if user is authenticated based on valid refresh token
   */
  isAuthenticated(): boolean {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    // Check if refresh token is expired
    return !isTokenExpired(refreshToken);
  }

  /**
   * Check if access token is valid and not expired
   */
  isAccessTokenValid(): boolean {
    const accessToken = getAccessToken();
    if (!accessToken) return false;

    return !isTokenExpired(accessToken);
  }

  /**
   * Get valid access token, refresh if needed
   */
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = getAccessToken();

    // If no access token, try to refresh
    if (!accessToken) {
      return await this.refreshAccessToken();
    }

    // If access token is valid, return it
    if (!isTokenExpired(accessToken)) {
      return accessToken;
    }

    // Access token expired, refresh it
    return await this.refreshAccessToken();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();

    if (!refreshToken || isTokenExpired(refreshToken)) {
      this.logout();
      return null;
    }

    // If already refreshing, queue the request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response: LoginResponse = await authApi.refreshToken(refreshToken);

      // Update tokens
      setAccessToken(response.accessToken);

      // Process queued requests
      this.processQueue(response.accessToken, null);
      this.isRefreshing = false;

      return response.accessToken;
    } catch (error) {
      // Refresh failed, logout user
      this.processQueue(null, error as Error);
      this.isRefreshing = false;
      this.logout();
      return null;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(token: string | null, error: Error | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error("No token available"));
      }
    });

    this.failedQueue = [];
  }

  /**
   * Logout user and clear all tokens
   */
  logout(): void {
    clearTokens();
    this.isRefreshing = false;
    this.failedQueue = [];

    // Redirect to login if not already there
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  /**
   * Save login response tokens
   */
  saveTokens(response: LoginResponse): void {
    setAccessToken(response.accessToken);
    setRefreshToken(response.refreshToken);
  }
}

export const authService = new AuthService();
