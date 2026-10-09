import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: "usr_creator_01",
  name: "Alex Rivera",
  email: "alex@virulmuse.ai",
  handle: "@alexcreates",
  niche: "Tech & Creator Economy",
  dnaScore: 92,
  plan: "Creator Pro",
};

const AuthContext = createContext<AuthContextValue>({
  user: DEFAULT_USER,
  isAuthenticated: true,
  isLoading: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("virulmuse_user");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return DEFAULT_USER;
  });

  const login = (email: string, name = "Alex Rivera") => {
    const nextUser: UserProfile = {
      ...DEFAULT_USER,
      email,
      name,
    };
    setUser(nextUser);
    try {
      localStorage.setItem("virulmuse_user", JSON.stringify(nextUser));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("virulmuse_user");
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
