"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/lib/api";
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await api.get<User>("/auth/me");
      setUser(response.data);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    setUser(response.data.user);
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
