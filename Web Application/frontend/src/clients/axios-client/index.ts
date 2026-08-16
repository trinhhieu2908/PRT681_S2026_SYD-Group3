import axios from "axios";
import { authService } from "@/modules/auth/services/auth.service";
import { AUTH_API } from "@/common/constants/api-endpoints";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5100/api",
  headers: {
    "content-type": "application/json",
  },
  timeout: 20000,
});

// Request interceptor to add access token
axiosClient.interceptors.request.use(async (config) => {
  // Skip adding token for auth endpoints
  if (
    config.url?.includes(AUTH_API.login) ||
    config.url?.includes(AUTH_API.refreshToken)
  ) {
    return config;
  }

  // Get valid access token (will refresh if needed)
  const accessToken = await authService.getValidAccessToken();
  if (accessToken) {
    config.headers.authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
  async (response) => {
    // Extract data from response
    if (response && response.data && response.data.data) {
      return response.data.data;
    } else if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  },
);

export default axiosClient;
