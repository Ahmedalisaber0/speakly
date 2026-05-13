"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthUser,
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
  LoginPayload,
  RegisterPayload,
} from "@/lib/auth-api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const fresh = await apiMe();
    setUser(fresh);
    setLoading(false);
    return fresh;
  }, []);

  // Bootstrap the session from the cookie on first mount. The setState calls
  // inside refresh come from an external source (the API) — that's the
  // legitimate use case for setState-in-effect that the lint rule is about.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    const u = await apiLogin(payload);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const u = await apiRegister(payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refresh,
      setUser,
    }),
    [user, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
