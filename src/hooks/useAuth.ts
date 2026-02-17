"use client";

import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store";
import type { Profile } from "@/types";

const toEmail = (username: string) => `${username.toLowerCase()}@shalomatlas.local`;

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data as Profile | null;
}

export function useAuth() {
  const setUser = useAppStore((s) => s.setUser);
  const setProfile = useAppStore((s) => s.setProfile);

  // Listen to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).then(setProfile);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setProfile]);

  const register = useCallback(
    async (username: string, password: string) => {
      const email = toEmail(username);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Registration failed");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        username,
      });

      if (profileError) throw new Error(profileError.message);

      return authData.user;
    },
    []
  );

  const login = useCallback(async (username: string, password: string) => {
    const email = toEmail(username);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [setUser, setProfile]);

  return { register, login, logout };
}
