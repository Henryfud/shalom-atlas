"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store";
import { getCurrentPeriodId } from "@/lib/periods";
import type { AppMode } from "@/types";

interface VoteResult {
  success: boolean;
  points_earned: number;
  daily_total: number;
  error?: string;
}

export function useVoting() {
  const user = useAppStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [existingVote, setExistingVote] = useState<number | null>(null);

  const checkExistingVote = useCallback(
    async (hexId: string, mode: AppMode) => {
      if (!user) return null;
      const periodId = getCurrentPeriodId();

      const { data } = await supabase
        .from("votes")
        .select("vote_value")
        .eq("user_id", user.id)
        .eq("hex_id", hexId)
        .eq("mode", mode)
        .eq("period_id", periodId)
        .single();

      const val = data?.vote_value ?? null;
      setExistingVote(val);
      return val;
    },
    [user]
  );

  const submitVote = useCallback(
    async (hexId: string, mode: AppMode, voteValue: number): Promise<VoteResult> => {
      if (!user) return { success: false, points_earned: 0, daily_total: 0, error: "Not logged in" };

      setLoading(true);
      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hex_id: hexId, mode, vote_value: voteValue }),
        });

        const result = await res.json();
        if (!res.ok) return { success: false, points_earned: 0, daily_total: 0, error: result.error };

        setExistingVote(voteValue);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { submitVote, checkExistingVote, existingVote, loading };
}
