"use client";

import { useState, useEffect } from "react";
import ColorScale from "./ColorScale";

const STORAGE_KEY = "shalom-atlas-welcome-dismissed";

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="max-w-[520px] w-full mx-4 bg-bg-card border border-border rounded-xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
          Welcome to Shalom Atlas
        </h2>
        <p className="text-[15px] text-text-secondary mb-5 leading-relaxed">
          This map visualizes Jewish community presence across the United States
          using publicly available data.
        </p>

        {/* Index explainer */}
        <div className="bg-bg-primary/50 border border-border rounded-lg p-4 mb-5">
          <p className="text-sm text-text-primary mb-3">
            The{" "}
            <span className="text-accent-gold font-medium">CDI Index</span>{" "}
            shows community density scores:
          </p>
          <ColorScale />
          <div className="flex justify-between text-xs text-text-muted mt-1.5">
            <span>0 (Low Presence)</span>
            <span>100 (High Presence)</span>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Toggle layers in{" "}
          <span className="text-accent-gold font-medium">Filters</span> to
          adjust the score. Disable{" "}
          <span className="text-accent-gold font-medium">CDI Index</span> to
          view individual data points instead.
        </p>

        <button
          onClick={dismiss}
          className="w-full py-3 bg-accent-gold hover:bg-accent-gold/90 text-bg-primary font-semibold rounded-lg transition-colors text-[15px] cursor-pointer"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}
