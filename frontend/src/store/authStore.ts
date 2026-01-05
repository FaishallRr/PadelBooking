import { create } from "zustand";
import Cookies from "js-cookie";

interface AuthState {
  token: string | null;
  role: string | null;
  setAuth: (token: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: Cookies.get("token") || null,
  role: Cookies.get("role") || null,

  setAuth: (token, role) => {
    if (token) Cookies.set("token", token, { expires: 7 });
    if (role) Cookies.set("role", role, { expires: 7 });

    set({ token, role });
  },

  clearAuth: () => {
    Cookies.remove("token");
    Cookies.remove("role");

    set({ token: null, role: null });
  },
}));
