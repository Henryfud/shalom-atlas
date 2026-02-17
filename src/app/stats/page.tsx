"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import { useAppStore } from "@/store";
import ModeAttributeSync from "@/components/ModeAttributeSync";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// Jewish stats colors
const JEWISH_BAR_COLORS: Record<string, string> = {
  "81-100": "#d4a853",
  "61-80": "#c9a84c",
  "41-60": "#4a9fd4",
  "21-40": "#2a6db5",
  "0-20": "#1e3a6e",
};

// Goy stats colors matching the new palette
const GOY_BAR_COLORS: Record<string, string> = {
  "81-100": "#ef4444",
  "61-80": "#f472b6",
  "41-60": "#60a5fa",
  "21-40": "#6ee7b7",
  "0-20": "#4ade80",
};

export default function StatsPage() {
  const mode = useAppStore((s) => s.mode);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const url = mode === "goy" ? "/data/goy_stats.json" : "/data/stats.json";
    fetch(url)
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, [mode]);

  if (!stats) {
    return (
      <main className="bg-bg-primary min-h-screen">
        <ModeAttributeSync />
        <Navbar />
        <div className="flex items-center justify-center h-screen text-text-muted">
          Loading...
        </div>
      </main>
    );
  }

  const isGoy = mode === "goy";
  const scoreKey = isGoy ? "gpi" : "cdi";
  const scoreLabel = isGoy ? "GPI" : "CDI";
  const barColors = isGoy ? GOY_BAR_COLORS : JEWISH_BAR_COLORS;
  const distribution = isGoy ? stats.gpiDistribution : stats.cdiDistribution;
  const maxDist = Math.max(...Object.values(distribution as Record<string, number>));

  const statCards = isGoy
    ? [
        { label: "Est. Goy Population", value: formatNumber(stats.totalEstimatedPopulation) },
        { label: "Churches", value: formatNumber(stats.totalChurches) },
        { label: "Fast Food Locations", value: formatNumber(stats.totalFastFood) },
        { label: "Retail Chains", value: formatNumber(stats.totalRetailChains) },
      ]
    : [
        { label: "Est. Jewish Population", value: formatNumber(stats.totalEstimatedPopulation) },
        { label: "Synagogues", value: formatNumber(stats.totalSynagogues) },
        { label: "Kosher Establishments", value: formatNumber(stats.totalKosherEstablishments) },
        { label: "Community Centers", value: formatNumber(stats.totalJCCs) },
      ];

  return (
    <main className="bg-bg-primary min-h-screen">
      <ModeAttributeSync />
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          {isGoy ? "Goy Mode Statistics" : "Statistics"}
        </h1>
        <p className="text-text-muted text-sm mb-10">
          Aggregate data across all coverage areas
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-bg-card border border-border rounded-xl p-5"
            >
              <p className="text-xs text-text-muted mb-1.5">{card.label}</p>
              <p className="font-display text-2xl font-bold text-accent-gold">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Top Metros */}
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              Top 10 Metros by {scoreLabel}
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-muted">
                  <th className="text-left pb-2 font-normal">#</th>
                  <th className="text-left pb-2 font-normal">Metro</th>
                  <th className="text-right pb-2 font-normal">{scoreLabel}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topMetros.map((m: { rank: number; name: string; [k: string]: unknown }) => (
                  <tr key={m.rank} className="border-t border-border/50">
                    <td className="py-2 text-text-muted">{m.rank}</td>
                    <td className="py-2 text-text-secondary">{m.name}</td>
                    <td className="py-2 text-right font-display font-bold text-accent-gold">
                      {m[scoreKey] as number}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top ZIPs */}
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              Top 10 ZIP Codes by {scoreLabel}
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-muted">
                  <th className="text-left pb-2 font-normal">#</th>
                  <th className="text-left pb-2 font-normal">ZIP</th>
                  <th className="text-left pb-2 font-normal">Area</th>
                  <th className="text-right pb-2 font-normal">{scoreLabel}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topZIPs.map((z: { rank: number; zip: string; area: string; [k: string]: unknown }) => (
                  <tr key={z.rank} className="border-t border-border/50">
                    <td className="py-2 text-text-muted">{z.rank}</td>
                    <td className="py-2 text-text-secondary font-mono text-xs">
                      {z.zip}
                    </td>
                    <td className="py-2 text-text-secondary">{z.area}</td>
                    <td className="py-2 text-right font-display font-bold text-accent-gold">
                      {z[scoreKey] as number}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">
            {scoreLabel} Score Distribution
          </h2>
          <div className="flex items-end gap-3 h-40">
            {Object.entries(distribution as Record<string, number>).map(([range, count]) => (
              <div
                key={range}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-text-muted">{count}</span>
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${(count / maxDist) * 120}px`,
                    background: barColors[range] ?? "#444",
                  }}
                />
                <span className="text-[10px] text-text-muted mt-1">
                  {range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
