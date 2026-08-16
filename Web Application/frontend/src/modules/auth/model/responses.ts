import { AuthenticatedUser } from "@/modules/auth/model/user";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: AuthenticatedUser | null;
}
