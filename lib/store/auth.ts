import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, AuthResponse } from "../api";

interface AuthState {
  user: AuthResponse["user"] | null;
  college: AuthResponse["college"] | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  hydrateApi: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      college: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (data) => {
        set({
          user: data.user,
          college: data.college,
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
          isAuthenticated: true,
        });
        api.setAuth(
          data.tokens.access_token,
          data.college?.id ?? null,
          data.college?.subdomain ?? null
        );
      },
      logout: () => {
        set({
          user: null,
          college: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        api.setAuth(null, null, null);
      },
      hydrateApi: () => {
        const { accessToken, college } = get();
        api.setAuth(accessToken, college?.id ?? null, college?.subdomain ?? null);
      },
    }),
    {
      name: "campusos-auth",
      onRehydrateStorage: () => (state) => {
        if (state) {
          api.setAuth(
            state.accessToken,
            state.college?.id ?? null,
            state.college?.subdomain ?? null
          );
        }
      },
    }
  )
);

