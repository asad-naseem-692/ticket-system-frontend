import { User, AuthResponse } from "./types";

const TOKEN_KEY = "cs_auth_token";
const USER_KEY = "cs_auth_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function saveAuthSession(auth: AuthResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, auth.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getRedirectPathForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/all-tickets";
    case "agent":
      return "/assigned-tickets";
    case "customer":
    default:
      return "/my-tickets";
  }
}
