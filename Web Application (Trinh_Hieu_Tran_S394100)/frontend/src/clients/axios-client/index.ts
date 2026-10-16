import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { authService } from "@/modules/auth/services/auth.service";
import { AUTH_API } from "@/common/constants/api-endpoints";

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
  message?: string;
  title?: string;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const publicAuthEndpoints = [
  AUTH_API.register,
  AUTH_API.login,
  AUTH_API.refreshToken,
];

const isPublicAuthRequest = (url?: string) =>
  publicAuthEndpoints.some((endpoint) => url?.includes(endpoint));

const toApiError = (error: AxiosError<ApiErrorResponse>): Error => {
  const data = error.response?.data;
  const message =
    data?.error?.message || data?.message || data?.title || error.message;

  return new Error(message || "Something went wrong. Please try again.");
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5100/api",
  headers: {
    "content-type": "application/json",
  },
  timeout: 20000,
});

axiosClient.interceptors.request.use(async (config) => {
  if (isPublicAuthRequest(config.url)) {
    return config;
  }

  const accessToken = await authService.getValidAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;
      const accessToken = await authService.refreshAccessToken();

      if (accessToken) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest as AxiosRequestConfig);
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export default axiosClient;
