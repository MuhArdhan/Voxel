const TOKEN_KEY = "voxel_token";
const USER_KEY = "voxel_user";
const SESSION_KEY = "voxel_session_id";

import type { User } from "@/types";

// ---- Token ----
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---- User ----
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ---- Session ID (untuk guest cart) ----
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ---- Helpers ----
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

export function clearAuth(): void {
  removeToken();
  removeStoredUser();
}
