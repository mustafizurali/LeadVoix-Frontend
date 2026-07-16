const ACCESS_TOKEN_KEY = "leadvoix_access_token";

export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setToken: (token: string) => {
    if (typeof window === "undefined") return;

    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeToken: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};