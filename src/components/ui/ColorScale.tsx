"use client";

import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";

export default function ColorScale({ className = "" }: { className?: string }) {
  const mode = useAppStore((s) => s.mode);
  const stops = MODE_CONFIGS[mode].colorStops;
  const gradient = stops
    .map(([, [r, g, b]]) => `rgb(${r},${g},${b})`)
    .join(", ");

  return (
    <div
      className={`h-2 rounded-full w-full ${className}`}
      style={{
        background: `linear-gradient(to right, ${gradient})`,
      }}
    />
  );
}
