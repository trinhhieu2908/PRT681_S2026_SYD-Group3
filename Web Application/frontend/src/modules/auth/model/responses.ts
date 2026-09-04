export interface TokenResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  tokens: TokenResponse;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  tokens: TokenResponse;
}

export interface RefreshTokenResponse {
  tokens: TokenResponse;
}
