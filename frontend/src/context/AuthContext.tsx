import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export type UserRole = "admin" | "manager" | "developer" | "designer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

/** Normalize backend user to frontend User shape (id, name, email, role, avatar). */
function normalizeUser(raw: { id?: string; name?: string; email?: string; role?: string; avatar?: string }): User {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    role: (raw.role as UserRole) ?? "developer",
    avatar: String(raw.avatar ?? "")
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  /** Last login error message from backend (e.g. 401/500), cleared on next login attempt or success. */
  lastLoginError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("sdw_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [lastLoginError, setLastLoginError] = useState<string | null>(null);

  // Récupérer le profil si un token existe déjà
  useEffect(() => {
    const token = localStorage.getItem("sdw_token");
    if (token && !user) {
      apiFetch<{ id: string; name: string; email: string; role: string; avatar?: string }>("/auth/me", { auth: true })
        .then(u => setUser(normalizeUser(u)))
        .catch(() => {
          localStorage.removeItem("sdw_token");
          localStorage.removeItem("sdw_user");
        });
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setLastLoginError(null);
    try {
      const res = await apiFetch<{ token: string; user: { id?: string; name?: string; email?: string; role?: string; avatar?: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      const user = normalizeUser(res.user);
      localStorage.setItem("sdw_token", res.token);
      localStorage.setItem("sdw_user", JSON.stringify(user));
      setUser(user);
      return true;
    } catch (err) {
      const message =
        err instanceof Error && err.message === "Failed to fetch"
          ? "Serveur inaccessible. Démarrez le backend (npm run dev dans le dossier backend) sur http://localhost:5001"
          : err instanceof Error
            ? err.message
            : "Identifiants invalides.";
      setLastLoginError(message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sdw_user");
    localStorage.removeItem("sdw_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, lastLoginError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
