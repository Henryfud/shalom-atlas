"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);
  const profile = useAppStore((s) => s.profile);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const openWalletModal = useAppStore((s) => s.openWalletModal);
  const { logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isJewish = mode === "jewish";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] h-14 flex items-center justify-between px-5 bg-bg-primary/85 backdrop-blur-xl border-b transition-colors duration-300"
      style={{ borderColor: isJewish ? "rgba(212,168,83,0.15)" : "rgba(34,150,62,0.25)" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center text-lg transition-all duration-300 ${
            isJewish
              ? "bg-accent-gold/15 border border-accent-gold/30 text-accent-gold"
              : "bg-green-600/15 border border-green-600/30 text-green-500"
          }`}
          style={!isJewish ? { filter: "drop-shadow(0 0 6px #22963e)" } : undefined}
        >
          {isJewish ? "✡" : "✝"}
        </div>
        <span className="font-display text-xl font-bold text-text-primary tracking-tight">
          {isJewish ? "Shalom Atlas" : "Goy Mode"}
        </span>
      </Link>

      {/* Mode Toggle */}
      <div className="flex items-center bg-bg-card rounded-full p-0.5 border border-border">
        <button
          onClick={() => !isJewish && toggleMode()}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
            isJewish
              ? "bg-accent-gold/20 text-accent-gold"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          ✡ Jewish
        </button>
        <button
          onClick={() => isJewish && toggleMode()}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
            !isJewish
              ? "bg-green-600/20 text-green-500"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          ✝ Goy
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <Link
          href="/how-it-works"
          className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors no-underline"
        >
          How It Works
        </Link>
        <Link
          href="/leaderboard"
          className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors no-underline"
        >
          Leaderboard
        </Link>
        <Link
          href="/stats"
          className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors no-underline"
        >
          Stats
        </Link>

        {/* Auth */}
        {profile ? (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border border-border bg-bg-card/80 text-text-secondary hover:text-text-primary transition-colors"
            >
              <span className="w-5 h-5 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center text-[10px] font-bold">
                {profile.username[0].toUpperCase()}
              </span>
              {profile.username}
              <svg
                className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors no-underline"
                >
                  Profile
                </Link>
                <button
                  onClick={() => { openWalletModal(); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
                >
                  Wallet Settings
                </button>
                <div className="border-t border-border/50" />
                <button
                  onClick={() => { logout(); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-bg-card-hover transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:brightness-110"
            style={{ backgroundColor: isJewish ? "#d4a853" : "#22963e" }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
