export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role?: string;
  isActive?: boolean;
}
