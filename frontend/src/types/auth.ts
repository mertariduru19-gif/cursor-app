export type UserRole = "ADMIN" | "USER";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
