"use client";

import { useState } from "react";
import ColorScale from "./ColorScale";
import { scoreToColor } from "@/lib/colors";
import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";

export default function Legend() {
  const [expanded, setExpanded] = useState(true);
  const mode = useAppStore((s) => s.mode);
  const config = MODE_CONFIGS[mode];

  return (
    <div className="absolute bottom-6 right-4 z-[200] w-56">
      <div
        className="backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: mode === "goy" ? "rgba(31,21,32,0.95)" : "rgba(15,20,30,0.95)",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: mode === "goy" ? "rgba(34,150,62,0.2)" : "rgba(212,168,83,0.15)",
        }}
      >
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3.5 py-2.5"
        >
          <span className="text-xs font-bold text-text-primary">
            {expanded ? config.densityLabel : "Legend"}
          </span>
          <svg
            className={`w-3.5 h-3.5 text-text-muted transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="px-3.5 pb-3.5">
            {/* Tiers */}
            <div className="space-y-1.5 mb-3">
              {config.tiers.map((tier) => (
                <div key={tier.label} className="flex items-center gap-2.5">
                  {mode === "goy" ? (
                    <div
                      className="w-7 h-7 rounded-sm shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: scoreToColor(tier.score, config.colorStops) }}
                    >
                      {tier.score}
                    </div>
                  ) : (
                    <div
                      className="w-7 h-7 rounded-sm shrink-0"
                      style={{ backgroundColor: scoreToColor(tier.score, config.colorStops) }}
                    />
                  )}
                  <span className="text-[11px] text-text-secondary flex-1">
                    {tier.label}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    ({tier.min}–{tier.max})
                  </span>
                </div>
              ))}
            </div>

            {/* Color bar */}
            <ColorScale />
            <div className="flex justify-between text-[10px] text-text-muted mt-1">
              <span>0</span>
              <span>100</span>
            </div>

            {/* Note */}
            <p className="text-[10px] text-text-muted mt-2 opacity-70">
              No color = No data for this area
            </p>
          </div>
        )}

        {/* Collapsed: just the scale bar */}
        {!expanded && (
          <div className="px-3.5 pb-3">
            <ColorScale />
          </div>
        )}
      </div>
    </div>
  );
}
