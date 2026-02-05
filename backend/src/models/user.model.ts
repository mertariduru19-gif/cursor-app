import { UserRole } from "./enums";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
