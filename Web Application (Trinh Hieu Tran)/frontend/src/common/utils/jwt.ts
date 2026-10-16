import { AuthenticatedUser } from "@/modules/auth/model/user";
import { jwtDecode } from "jwt-decode";

export interface JWTPayload {
  exp: number;
  iat: number;
  sub: string;
  unique_name?: string;
  email?: string;
  [key: string]: unknown;
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
    // Refresh shortly before expiry so requests do not race the 15-minute limit.
    return currentTime >= payload.exp - 30;
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

    const email = payload.email || payload.unique_name;
    if (!payload.sub || !email) return null;

    return { id: payload.sub, email };
  } catch (error) {
    return null;
  }
};
