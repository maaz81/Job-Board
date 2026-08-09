/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { User } from "@/types";

import {
  getMeRequest,
  refreshRequest,
  logoutRequest,
} from "@/api/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        const user = await getMeRequest();
        setUser(user);
      } catch {
        try {
          await refreshRequest();

          const user = await getMeRequest();
          setUser(user);
        } catch {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  function login(newUser: User) {
    setUser(newUser);
  }

  async function refreshUser() {
    try {
      const currentUser = await getMeRequest();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }
  console.log("AuthProvider Render");

  console.log({
    user,
    isLoading,
  });
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}