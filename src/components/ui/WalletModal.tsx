"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { MODE_CONFIGS } from "@/lib/mode-config";

export default function WalletModal() {
  const isOpen = useAppStore((s) => s.isWalletModalOpen);
  const closeModal = useAppStore((s) => s.closeWalletModal);
  const mode = useAppStore((s) => s.mode);
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const config = MODE_CONFIGS[mode];

  const [address, setAddress] = useState(profile?.wallet_address ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ wallet_address: address.trim() || null })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, wallet_address: address.trim() || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "rgba(15,20,30,0.97)",
          border: `1px solid ${config.accentColor}33`,
        }}
      >
        <div className="p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-text-primary">
            Wallet Settings
          </h2>
          <p className="text-xs text-text-muted">
            Link your Solana wallet to your account
          </p>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Solana Wallet Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold transition-colors font-mono text-xs"
              placeholder="e.g., 7EcDhSYGxXyscszYEp35KHN8vvw..."
            />
          </div>

          <p className="text-[10px] text-text-muted opacity-70">
            Your wallet address is private and only visible to you.
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: config.accentColor }}
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save Wallet"}
          </button>
        </div>

        <button
          onClick={closeModal}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
