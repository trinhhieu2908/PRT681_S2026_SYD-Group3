import { authApi } from "@/modules/auth/services/api.service";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getRefreshTokenExpiresAt,
  setAccessToken,
  setRefreshToken,
  setRefreshTokenExpiresAt,
} from "@/clients/local-storage";
import { isTokenExpired } from "@/common/utils/jwt";
import { TokenResponse } from "@/modules/auth/model/responses";

class AuthService {
  private refreshPromise: Promise<string | null> | null = null;

  hasValidRefreshToken(): boolean {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const expiresAt = getRefreshTokenExpiresAt();
    if (!expiresAt) {
      // Older stored sessions have no expiry metadata. Let the API validate them.
      return true;
    }

    const expiryTime = Date.parse(expiresAt);
    return !Number.isNaN(expiryTime) && Date.now() < expiryTime;
  }

  isAccessTokenValid(): boolean {
    const accessToken = getAccessToken();
    return Boolean(accessToken && !isTokenExpired(accessToken));
  }

  async getValidAccessToken(): Promise<string | null> {
    const accessToken = getAccessToken();

    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }

    return this.refreshAccessToken();
  }

  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken || !this.hasValidRefreshToken()) {
      this.clearSession();
      return null;
    }

    this.refreshPromise = authApi
      .refreshToken(refreshToken)
      .then((response) => {
        this.saveTokens(response.tokens);
        return response.tokens.accessToken;
      })
      .catch(() => {
        this.clearSession();
        this.redirectToLogin();
        return null;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  async logout(): Promise<void> {
    try {
      const accessToken = await this.getValidAccessToken();
      if (accessToken) {
        await authApi.logout();
      }
    } catch (error) {
      // Local logout must still complete if the API is unavailable.
    } finally {
      this.clearSession();
    }
  }

  clearSession(): void {
    clearTokens();
  }

  saveTokens(tokens: TokenResponse): void {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setRefreshTokenExpiresAt(tokens.refreshTokenExpiresAtUtc);
  }

  private redirectToLogin(): void {
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }
}

export const authService = new AuthService();
