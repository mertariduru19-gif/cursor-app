import { create } from "zustand";
import { AuthResponse, UserProfile } from "../types/auth";
import * as authService from "../services/auth.service";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearMessages: () => void;
}

const setAuth = (response: AuthResponse) => {
  localStorage.setItem("token", response.token);
  return response;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
  success: null,
  clearMessages: () => set({ error: null, success: null }),
  bootstrap: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      const profile = await authService.getMe();
      set({ user: profile, token });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await authService.login({ email, password });
      const auth = setAuth(response);
      set({ user: auth.user, token: auth.token, success: "Login successful" });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? "Login failed" });
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (name, email, password) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await authService.register({ name, email, password });
      const auth = setAuth(response);
      set({ user: auth.user, token: auth.token, success: "Account created" });
    } catch (error: any) {
      set({ error: error?.response?.data?.message ?? "Registration failed" });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
