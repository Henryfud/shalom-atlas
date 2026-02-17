"use client";

import { useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store";
import { geocodeAddress } from "@/lib/geo";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setViewState = useAppStore((s) => s.setViewState);
  const lastSearchTime = useRef(0);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    // Rate limit: 1 req/sec for Nominatim
    const now = Date.now();
    if (now - lastSearchTime.current < 1000) return;
    lastSearchTime.current = now;

    setLoading(true);
    setError("");

    const result = await geocodeAddress(q);

    setLoading(false);

    if (result) {
      setViewState({
        longitude: result.lng,
        latitude: result.lat,
        zoom: 12,
      });
      setQuery("");
    } else {
      setError("No results found");
      setTimeout(() => setError(""), 2000);
    }
  }, [query, setViewState]);

  return (
    <div className="relative">
      {/* Search icon or loading spinner */}
      {loading ? (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent-gold/40 border-t-accent-gold rounded-full animate-spin" />
      ) : (
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}
      <input
        type="text"
        value={error || query}
        onChange={(e) => {
          setQuery(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search address or ZIP..."
        className={`w-56 h-10 pl-9 pr-3 bg-bg-card/80 border rounded-full text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold-dim focus:outline-none focus:ring-1 focus:ring-accent-gold/30 transition-colors ${
          error ? "border-red-500/50 text-red-400" : "border-border"
        }`}
      />
    </div>
  );
}
