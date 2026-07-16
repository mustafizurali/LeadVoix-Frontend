import { create } from "zustand";
import { tokenStorage } from "@/lib/auth/tokenStorage";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: tokenStorage.getToken(),
  isAuthenticated: !!tokenStorage.getToken(),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  setAccessToken: (token) => {
    tokenStorage.setToken(token);

    set({
      accessToken: token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    tokenStorage.removeToken();

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));