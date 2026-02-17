"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { LeaderboardEntry } from "@/types";

type TimeFilter = "week" | "month" | "all";

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);

    // Determine sort column based on time filter
    const pointsColumn =
      timeFilter === "week"
        ? "points_this_week"
        : timeFilter === "month"
        ? "points_this_month"
        : "total_points";

    let query = supabase
      .from("leaderboard")
      .select("*", { count: "exact" })
      .order(pointsColumn, { ascending: false })
      .range(page * perPage, (page + 1) * perPage - 1);

    if (search.trim()) {
      query = query.ilike("username", `%${search.trim()}%`);
    }

    const { data, count, error } = await query;

    if (!error && data) {
      setEntries(data as LeaderboardEntry[]);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [timeFilter, search, page]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(0);
  }, [timeFilter, search]);

  return {
    entries,
    totalCount,
    loading,
    timeFilter,
    setTimeFilter,
    search,
    setSearch,
    page,
    setPage,
    perPage,
    totalPages: Math.ceil(totalCount / perPage),
  };
}
