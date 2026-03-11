"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id?: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  isAdmin?: boolean;
  token?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (email: string, password?: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password?: string) => Promise<AuthResponse>;
  loginWithGoogle: (token: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  // Load auth state from localStorage + refresh role from backend
  useEffect(() => {
    const storedUser = localStorage.getItem("teesforteens_user");
    if (!storedUser) {
      setIsAuthReady(true);
      return;
    }

    const parsed = JSON.parse(storedUser);
    // Set from localStorage immediately so UI isn't blank
    const localUser = { ...parsed, isAdmin: parsed.role === 'admin' };
    setUser(localUser);

    // Refresh role from backend before declaring auth ready
    if (parsed.token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/users/profile`, {
        headers: { Authorization: `Bearer ${parsed.token}`, "Content-Type": "application/json" }
      })
        .then(r => r.ok ? r.json() : null)
        .then(profile => {
          if (profile) {
            const refreshed = { ...parsed, role: profile.role, isAdmin: profile.role === 'admin' };
            setUser(refreshed);
            localStorage.setItem("teesforteens_user", JSON.stringify(refreshed));
          }
        })
        .catch(() => {})
        .finally(() => setIsAuthReady(true));
    } else {
      setIsAuthReady(true);
    }
  }, []);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/auth`;

  const register = async (name: string, email: string, password?: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Registration failed." };
      }

      const userData = { ...data, isAdmin: data.role === 'admin' };
      setUser(userData);
      localStorage.setItem("teesforteens_user", JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error("Register error:", error);
      return { success: false, message: "Network error occurred." };
    }
  };

  const login = async (email: string, password?: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Invalid email or password." };
      }

      const userData = { ...data, isAdmin: data.role === 'admin' };
      setUser(userData);
      localStorage.setItem("teesforteens_user", JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, message: "Network error occurred." };
    }
  };

  const loginWithGoogle = async (token: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Google sign in failed." };
      }

      const userData = { ...data, isAdmin: data.role === 'admin' };
      setUser(userData);
      localStorage.setItem("teesforteens_user", JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error("Google Auth error:", error);
      return { success: false, message: "Network error occurred." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("teesforteens_user");
    router.push("/login");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAuthReady, login, register, loginWithGoogle, logout }}>
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
