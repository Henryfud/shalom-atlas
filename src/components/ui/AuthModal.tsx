"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { MODE_CONFIGS } from "@/lib/mode-config";

type Tab = "login" | "register";

export default function AuthModal() {
  const isOpen = useAppStore((s) => s.isAuthModalOpen);
  const closeModal = useAppStore((s) => s.closeAuthModal);
  const mode = useAppStore((s) => s.mode);
  const config = MODE_CONFIGS[mode];

  const { login, register } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) { setError("Username is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      if (tab === "register") {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      closeModal();
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "rgba(15,20,30,0.97)",
          border: `1px solid ${config.accentColor}33`,
        }}
      >
        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-3 text-sm font-bold capitalize transition-colors ${
                tab === t
                  ? "text-text-primary border-b-2"
                  : "text-text-muted hover:text-text-secondary"
              }`}
              style={tab === t ? { borderColor: config.accentColor } : undefined}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold transition-colors"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-card border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold transition-colors"
              placeholder="Enter password"
              autoComplete={tab === "register" ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: config.accentColor }}
          >
            {loading ? "..." : tab === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {/* Close */}
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
