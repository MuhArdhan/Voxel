"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiPost, apiGet } from "@/lib/api";
import {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAuth,
  isAdmin,
} from "@/lib/auth";
import { getErrorMessage } from "@/lib/utils";
import type { User, AuthResponse } from "@/types";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await apiPost<AuthResponse>("/auth/login", payload);
    setToken(res.token);
    setStoredUser(res.user);
    setTokenState(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiPost<AuthResponse>("/auth/register", payload);
    setToken(res.token);
    setStoredUser(res.user);
    setTokenState(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // Token sudah expired — tetap logout di client
    } finally {
      clearAuth();
      setTokenState(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      // api.php defines GET /auth/me, and it returns the User directly, not wrapped in { user: ... }
      const res = await apiGet<User>("/auth/me");
      setUser(res);
      setStoredUser(res);
    } catch (err) {
      const msg = getErrorMessage(err);
      console.warn("Failed to refresh user:", msg);
      if ((err as { response?: { status?: number } })?.response?.status === 401) {
        clearAuth();
        setTokenState(null);
        setUser(null);
      }
    }
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoggedIn: !!token && !!user,
    isAdmin: isAdmin(user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
