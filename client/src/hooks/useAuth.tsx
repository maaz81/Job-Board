// import { useState, useEffect } from 'react';
// import type { User } from '@/types';

// const TOKEN_KEY = 'jobsphere_token';
// const USER_KEY = 'jobsphere_user';

// export function useAuth() {
//   const [user, setUser] = useState<User | null>(() => {
//     try {
//       const stored = localStorage.getItem(USER_KEY);
//       return stored ? (JSON.parse(stored) as User) : null;
//     } catch {
//       return null;
//     }
//   });

//   const token = localStorage.getItem(TOKEN_KEY);
//   const isAuthenticated = !!token && !!user;

//   function login(token: string, user: User) {
//     localStorage.setItem(TOKEN_KEY, token);
//     localStorage.setItem(USER_KEY, JSON.stringify(user));
//     setUser(user);
//   }

//   function logout() {
//     localStorage.removeItem(TOKEN_KEY);
//     localStorage.removeItem(USER_KEY);
//     setUser(null);
//   }

//   // Sync state across tabs
//   useEffect(() => {
//     function onStorage(e: StorageEvent) {
//       if (e.key === USER_KEY) {
//         try {
//           setUser(e.newValue ? (JSON.parse(e.newValue) as User) : null);
//         } catch {
//           setUser(null);
//         }
//       }
//     }
//     window.addEventListener('storage', onStorage);
//     return () => window.removeEventListener('storage', onStorage);
//   }, []);

//   return { user, token, isAuthenticated, login, logout };
// }

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types";
import { getMeRequest } from "@/api/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "jobsphere_token"; // must match the key your axios interceptor reads

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    getMeRequest()
      .then(setUser)
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); })
      .finally(() => setIsLoading(false));
  }, [token]);

  function login(newToken: string, newUser: User) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }
    }>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}