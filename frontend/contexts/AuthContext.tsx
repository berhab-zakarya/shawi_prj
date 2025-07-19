
"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProfileResponse } from "@/types/auth";
import { useProfile } from "@/hooks/use-profile";
import { getToken, refreshToken } from "@/lib/jwtService";

export interface AuthContextType {
  user: ProfileResponse | null;
  loading: boolean;
  errorMessage: string;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading, errorMessage, getProfile } = useProfile();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
useEffect(() => {
  // Only run on client side
  if (typeof window !== 'undefined') {
    setIsAuthenticated(!!getToken());
  }
}, [user]);

  const refreshProfile = async () => {
    await getProfile();
  };

 const logout = () => {
  // Only run on client side
  if (typeof window !== 'undefined') {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    window.location.reload();
  }
};

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        loading: loading,
        errorMessage: errorMessage,
        isAuthenticated: isAuthenticated,
        refreshProfile: refreshProfile,
        logout: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


