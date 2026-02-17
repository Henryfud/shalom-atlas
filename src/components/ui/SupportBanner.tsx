"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAppStore } from "@/store";

const WALLETS = [
  {
    name: "Solana",
    ticker: "SOL",
    color: "#9945FF",
    address: "GyMKHX1kPN84otafdQVHNtranWGn2a5of4a6rySYduUK",
  },
  {
    name: "Ethereum",
    ticker: "ETH",
    color: "#627EEA",
    address: "0x73bbBaC88C35D788Aa697F308c916fF14e8DAE34",
  },
  {
    name: "Bitcoin",
    ticker: "BTC",
    color: "#F7931A",
    address: "bc1p7aqn2e5mxslflgef9s8h07dwnpm3c3jekxrca5yyuxlgyjgy5uysh2k0h6",
  },
  {
    name: "Monero",
    ticker: "XMR",
    color: "#FF6600",
    address: "0x73bbBaC88C35D788Aa697F308c916fF14e8DAE34",
  },
  {
    name: "pump.fun",
    ticker: "CA",
    color: "#00D18C",
    address: "To be announced",
  },
];

export default function SupportBanner() {
  const [expanded, setExpanded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const mode = useAppStore((s) => s.mode);
  const bannerRef = useRef<HTMLDivElement>(null);

  const accentColor = mode === "jewish" ? "#d4a853" : "#dc2626";

  // Update CSS variable with banner height so ControlBar can position below it
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty(
        "--banner-height",
        `${el.offsetHeight}px`
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded]);

  const handleCopy = useCallback(async (address: string, idx: number) => {
    if (address === "To be announced") return;
    try {
      await navigator.clipboard.writeText(address);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      /* clipboard not available */
    }
  }, []);

  return (
    <div
      ref={bannerRef}
      className="fixed left-0 right-0 z-[999]"
      style={{ top: 56 }}
    >
      {/* Collapsed toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full py-1 text-center text-[11px] font-bold tracking-widest uppercase transition-colors"
        style={{
          backgroundColor: "rgba(10, 14, 23, 0.92)",
          backdropFilter: "blur(12px)",
          color: accentColor,
          borderBottom: `1px solid ${accentColor}20`,
        }}
      >
        SUPPORT THIS PROJECT {expanded ? "\u2303" : "\u2304"}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            backgroundColor: "rgba(10, 14, 23, 0.95)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${accentColor}30`,
          }}
        >
          <div className="px-4 sm:px-6 pt-1.5 pb-3">
            <p className="text-center text-[10px] text-text-muted mb-2 tracking-wide">
              Support independent research. Click any address to copy.
            </p>

            {/* Row 1: Solana + Ethereum */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {WALLETS.slice(0, 2).map((w, i) => (
                <WalletCard
                  key={w.ticker}
                  wallet={w}
                  copied={copiedIdx === i}
                  accentBorder={accentColor}
                  onCopy={() => handleCopy(w.address, i)}
                />
              ))}
            </div>

            {/* Row 2: Bitcoin + Monero */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {WALLETS.slice(2, 4).map((w, i) => (
                <WalletCard
                  key={w.ticker}
                  wallet={w}
                  copied={copiedIdx === i + 2}
                  accentBorder={accentColor}
                  onCopy={() => handleCopy(w.address, i + 2)}
                />
              ))}
            </div>

            {/* Row 3: pump.fun centered */}
            <div className="grid grid-cols-2 gap-2">
              <div className="col-start-1 col-end-3 mx-auto w-[calc(50%-4px)]">
                <WalletCard
                  wallet={WALLETS[4]}
                  copied={copiedIdx === 4}
                  accentBorder={accentColor}
                  onCopy={() => handleCopy(WALLETS[4].address, 4)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WalletCard({
  wallet,
  copied,
  accentBorder,
  onCopy,
}: {
  wallet: (typeof WALLETS)[number];
  copied: boolean;
  accentBorder: string;
  onCopy: () => void;
}) {
  const isAnnounced = wallet.address === "To be announced";

  return (
    <button
      onClick={onCopy}
      className="w-full text-left rounded-md px-3 py-2 transition-all duration-150 cursor-pointer"
      style={{
        backgroundColor: "rgba(26, 34, 53, 0.7)",
        border: `1px solid ${accentBorder}15`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(26, 34, 53, 1)";
        e.currentTarget.style.borderColor = `${accentBorder}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(26, 34, 53, 0.7)";
        e.currentTarget.style.borderColor = `${accentBorder}15`;
      }}
      disabled={isAnnounced}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs font-bold" style={{ color: wallet.color }}>
          {wallet.name}
        </span>
        <span className="text-[10px] text-text-muted">{wallet.ticker}</span>
        {copied && (
          <span className="text-[10px] font-bold text-green-400 ml-auto">
            Copied!
          </span>
        )}
      </div>
      <p
        className="text-[11px] font-mono text-text-muted leading-snug break-all"
        style={{ opacity: isAnnounced ? 0.5 : 0.8 }}
      >
        {wallet.address}
      </p>
    </button>
  );
}
