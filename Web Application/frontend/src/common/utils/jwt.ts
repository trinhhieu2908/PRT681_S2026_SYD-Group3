import { AuthenticatedUser } from "@/modules/auth/model/user";
import { jwtDecode } from "jwt-decode";

export interface JWTPayload {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: any;
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    // Add 30 seconds buffer to refresh before actual expiry
    return currentTime >= payload.exp;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = decodeToken(token);
    return payload?.exp || null;
  } catch (error) {
    return null;
  }
};

/**
 * Extract user from access token
 */
export const extractUserFromToken = (
  accessToken: string,
): AuthenticatedUser | null => {
  try {
    const payload = decodeToken(accessToken);
    if (!payload) return null;

    return {
      id: payload.sub,
      fullName: payload.fullName || "",
      email: payload.email || "",
      username: payload.username || "",
      role: payload.role,
      isActive: payload.isActive ?? true,
    };
  } catch (error) {
    return null;
  }
};
