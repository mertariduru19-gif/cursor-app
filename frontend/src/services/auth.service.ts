import api from "./api";
import { AuthResponse, UserProfile } from "../types/auth";

export const login = async (payload: { email: string; password: string }) => {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
};

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get<UserProfile>("/users/me");
  return response.data;
};
