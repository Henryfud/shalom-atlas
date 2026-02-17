"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import AuthModal from "@/components/ui/AuthModal";
import WalletModal from "@/components/ui/WalletModal";
import { useAppStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { MODE_CONFIGS } from "@/lib/mode-config";

interface ProfileStats {
  totalPoints: number;
  totalVotes: number;
  rank: number | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const mode = useAppStore((s) => s.mode);
  const openWalletModal = useAppStore((s) => s.openWalletModal);
  const config = MODE_CONFIGS[mode];

  const [stats, setStats] = useState<ProfileStats>({ totalPoints: 0, totalVotes: 0, rank: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    async function fetchStats() {
      const { data } = await supabase
        .from("leaderboard")
        .select("total_points, total_votes")
        .eq("user_id", user!.id)
        .single();

      // Get rank
      const { count } = await supabase
        .from("leaderboard")
        .select("*", { count: "exact", head: true })
        .gt("total_points", data?.total_points ?? 0);

      setStats({
        totalPoints: data?.total_points ?? 0,
        totalVotes: data?.total_votes ?? 0,
        rank: count !== null ? count + 1 : null,
      });
      setLoading(false);
    }

    fetchStats();
  }, [user, router]);

  if (!user || !profile) return null;

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="bg-bg-primary min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ backgroundColor: config.accentColor }}
            >
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-text-primary">
                {profile.username}
              </h1>
              <p className="text-sm text-text-muted">Member since {memberSince}</p>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Solana Wallet</h3>
              {profile.wallet_address ? (
                <p className="text-xs text-text-muted font-mono">
                  {profile.wallet_address.slice(0, 8)}...{profile.wallet_address.slice(-6)}
                </p>
              ) : (
                <p className="text-xs text-text-muted">Not connected</p>
              )}
            </div>
            <button
              onClick={openWalletModal}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-border text-text-secondary hover:text-text-primary transition-colors"
            >
              {profile.wallet_address ? "Edit" : "Connect"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Points", value: loading ? "..." : stats.totalPoints },
            { label: "Cells Voted", value: loading ? "..." : stats.totalVotes },
            { label: "Accuracy", value: "Coming soon" },
            { label: "Rank", value: loading ? "..." : stats.rank ? `#${stats.rank}` : "—" },
          ].map((card) => (
            <div key={card.label} className="bg-bg-card border border-border rounded-xl p-5">
              <p className="text-xs text-text-muted mb-1.5">{card.label}</p>
              <p className="font-display text-2xl font-bold text-accent-gold">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* About Accuracy */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-2">About Accuracy</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Accuracy measures how often your votes align with the majority opinion of other
            voters. A higher accuracy means you tend to agree with the community consensus.
            This metric will be available once enough votes have been cast.
          </p>
        </div>
      </div>

      <AuthModal />
      <WalletModal />
    </main>
  );
}
