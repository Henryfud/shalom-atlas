"use client";

import Navbar from "@/components/ui/Navbar";
import AuthModal from "@/components/ui/AuthModal";
import WalletModal from "@/components/ui/WalletModal";
import { useAppStore } from "@/store";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { MODE_CONFIGS } from "@/lib/mode-config";

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

export default function LeaderboardPage() {
  const mode = useAppStore((s) => s.mode);
  const config = MODE_CONFIGS[mode];

  const {
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
    totalPages,
  } = useLeaderboard();

  const pointsKey =
    timeFilter === "week"
      ? "points_this_week"
      : timeFilter === "month"
      ? "points_this_month"
      : "total_points";

  const maxPoints = entries.length > 0 ? Math.max(...entries.map((e) => (e as unknown as Record<string, number>)[pointsKey] ?? 0)) : 1;

  return (
    <main className="bg-bg-primary min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
              Leaderboard
            </h1>
            <p className="text-text-muted text-sm">
              Top community voters helping refine the {config.densityLabel}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-bg-card border border-border rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-text-muted">Registered</p>
              <p className="font-display text-lg font-bold text-accent-gold">{totalCount}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          {/* Time filter */}
          <div className="flex bg-bg-card rounded-full p-0.5 border border-border">
            {(["week", "month", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors capitalize ${
                  timeFilter === t
                    ? "bg-accent-gold/20 text-accent-gold"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t === "all" ? "All Time" : `This ${t.charAt(0).toUpperCase() + t.slice(1)}`}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username..."
            className="flex-1 max-w-xs px-3.5 py-2 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-text-muted border-b border-border/50">
                <th className="text-left px-4 py-3 font-normal w-12">#</th>
                <th className="text-left px-4 py-3 font-normal">User</th>
                <th className="text-left px-4 py-3 font-normal w-40">Progress</th>
                <th className="text-right px-4 py-3 font-normal w-20">Points</th>
                <th className="text-right px-4 py-3 font-normal w-20">Votes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-muted">
                    Loading...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-muted">
                    No voters yet. Be the first!
                  </td>
                </tr>
              ) : (
                entries.map((entry, i) => {
                  const rank = page * perPage + i + 1;
                  const points = (entry as unknown as Record<string, number>)[pointsKey] ?? 0;
                  const barWidth = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

                  return (
                    <tr key={entry.user_id} className="border-t border-border/30 hover:bg-bg-card-hover transition-colors">
                      <td className={`px-4 py-3 text-sm font-bold ${RANK_STYLES[rank] ?? "text-text-muted"}`}>
                        {rank}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-accent-gold/15 text-accent-gold flex items-center justify-center text-xs font-bold">
                            {entry.username[0].toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold text-text-primary">
                            {entry.username}
                          </span>
                          {entry.trust_level > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-gold/10 text-accent-gold">
                              {entry.trust_level.toFixed(1)}x
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${barWidth}%`,
                              backgroundColor: config.accentColor,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-display font-bold text-accent-gold">
                          {points}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-text-secondary">
                        {entry.total_votes}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-text-muted px-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* How Scoring Works */}
        <h2 className="font-display text-xl font-bold text-text-primary mb-4">
          How Scoring Works
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { score: "+2", label: "First to vote on a cell", color: "#22c55e" },
            { score: "+1", label: "Vote on any cell", color: "#3b82f6" },
            { score: "-2", label: "Change your vote", color: "#ef4444" },
            { score: "500", label: "Max points per day", color: config.accentColor },
          ].map((card) => (
            <div key={card.label} className="bg-bg-card border border-border rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-bold mb-1" style={{ color: card.color }}>
                {card.score}
              </p>
              <p className="text-xs text-text-muted">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Trust Level */}
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Trust Level</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Your trust level acts as a multiplier on points earned. Higher trust levels are
            awarded to reliable voters with high accuracy. Start at 1.0x and grow as your
            votes consistently align with community consensus.
          </p>
        </div>

        {/* Voting Periods */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Voting Periods</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Votes lock every 12 hours (6am & 6pm UTC). At the end of each period, community
            votes are tallied and {mode === "jewish" ? "CDI" : "GPI"} scores are adjusted based
            on consensus.
          </p>
        </div>
      </div>

      <AuthModal />
      <WalletModal />
    </main>
  );
}
