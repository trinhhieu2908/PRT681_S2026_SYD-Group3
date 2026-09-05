import axiosClient from "@/clients/axios-client";
import { AUTH_API } from "@/common/constants/api-endpoints";
import { LoginRequest, RegisterRequest } from "@/modules/auth/model/requests";
import {
  LoginResponse,
  RefreshTokenResponse,
  RegisterResponse,
} from "@/modules/auth/model/responses";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return axiosClient.post<LoginResponse, LoginResponse, LoginRequest>(
      AUTH_API.login,
      credentials,
    );
  },

  register: async (credentials: RegisterRequest): Promise<RegisterResponse> => {
    return axiosClient.post<
      RegisterResponse,
      RegisterResponse,
      RegisterRequest
    >(AUTH_API.register, credentials);
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return axiosClient.post<RefreshTokenResponse, RefreshTokenResponse>(
      AUTH_API.refreshToken,
      { refreshToken },
    );
  },

  logout: async (): Promise<void> => {
    await axiosClient.post(AUTH_API.logout);
  },
};
