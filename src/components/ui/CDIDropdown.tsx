"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";
import ColorScale from "./ColorScale";

export default function CDIDropdown() {
  const [open, setOpen] = useState(false);
  const showCDI = useAppStore((s) => s.showCDI);
  const toggleCDI = useAppStore((s) => s.toggleCDI);
  const mode = useAppStore((s) => s.mode);
  const config = MODE_CONFIGS[mode];
  const ref = useRef<HTMLDivElement>(null);

  const buttonLabel = mode === "jewish" ? "CDI Index" : "GPI Index";
  const toggleLabel = mode === "jewish" ? "Show CDI Heatmap" : "Show GPI Heatmap";
  const lowLabel = mode === "jewish" ? "Low Community Presence" : "Low Goy Density";
  const highLabel = mode === "jewish" ? "High Community Presence" : "High Goy Density";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3.5 h-10 rounded-full text-sm font-medium transition-all hover:brightness-110 ${
          showCDI
            ? "border border-accent-gold/50 text-accent-gold bg-accent-gold/5 hover:border-accent-gold/70"
            : "border border-border text-text-secondary bg-bg-card/80 hover:border-border-light"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-current" />
        {buttonLabel}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-bg-card/95 backdrop-blur-md border border-border rounded-xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-primary">
              {toggleLabel}
            </span>
            <button
              onClick={toggleCDI}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${
                showCDI ? "bg-accent-gold" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${
                  showCDI ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Scale */}
          <div className="space-y-1.5">
            <ColorScale />
            <div className="flex justify-between text-[11px] text-text-muted">
              <span>{lowLabel}</span>
              <span>{highLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
