// Local storage utilities for token management
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Access token management
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    // console.error('Error getting access token from localStorage:', error);
    return null;
  }
};

export const setAccessToken = (token: string): void => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    // console.error('Error setting access token to localStorage:', error);
  }
};

export const removeAccessToken = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    // console.error('Error removing access token from localStorage:', error);
  }
};

// Refresh token management
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    // console.error('Error getting refresh token from localStorage:', error);
    return null;
  }
};

export const setRefreshToken = (token: string): void => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    // console.error('Error setting refresh token to localStorage:', error);
  }
};

export const removeRefreshToken = (): void => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    // console.error('Error removing refresh token from localStorage:', error);
  }
};

// Clear all tokens
export const clearTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
};
