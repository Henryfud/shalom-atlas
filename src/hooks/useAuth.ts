"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/store";

interface AuthUser {
  id: string;
  username: string;
  wallet_address?: string;
  trust_level?: number;
  created_at?: string;
}

const STORAGE_KEY = "shalom_atlas_user";

function saveUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useAuth() {
  const setUser = useAppStore((s) => s.setUser);
  const setProfile = useAppStore((s) => s.setProfile);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = loadUser();
    if (saved) {
      setUser(saved);
      setProfile({
        id: saved.id,
        username: saved.username,
        wallet_address: saved.wallet_address || null,
        trust_level: saved.trust_level || 1,
        created_at: saved.created_at || new Date().toISOString(),
      });
    }
  }, [setUser, setProfile]);

  const register = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      const user: AuthUser = data.user;
      saveUser(user);
      setUser(user);
      setProfile({
        id: user.id,
        username: user.username,
        wallet_address: null,
        trust_level: 1,
        created_at: new Date().toISOString(),
      });

      return user;
    },
    [setUser, setProfile]
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      const user: AuthUser = data.user;
      saveUser(user);
      setUser(user);
      setProfile({
        id: user.id,
        username: user.username,
        wallet_address: user.wallet_address || null,
        trust_level: user.trust_level || 1,
        created_at: user.created_at || new Date().toISOString(),
      });

      return user;
    },
    [setUser, setProfile]
  );

  const logout = useCallback(() => {
    clearUser();
    setUser(null);
    setProfile(null);
  }, [setUser, setProfile]);

  return { register, login, logout };
}
