import axiosClient from "@/clients/axios-client";
import { AUTH_API } from "@/common/constants/api-endpoints";
import { LoginRequest } from "@/modules/auth/model/requests";
import { LoginResponse } from "@/modules/auth/model/responses";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const body = {
      username: credentials.username,
      password: credentials.password,
      type: "web",
    };
    return await axiosClient.post(AUTH_API.login, body);
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    return await axiosClient.post(AUTH_API.refreshToken, { refreshToken });
  },
};
