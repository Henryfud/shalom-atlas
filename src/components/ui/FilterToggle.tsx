"use client";

import { useAppStore } from "@/store";
import type { FilterDef } from "@/types";

interface FilterToggleProps {
  filter: FilterDef;
}

export default function FilterToggle({ filter }: FilterToggleProps) {
  const active = useAppStore((s) => s.activeFilters[filter.id]);
  const toggleFilter = useAppStore((s) => s.toggleFilter);

  return (
    <button
      onClick={() => toggleFilter(filter.id)}
      className="flex items-center gap-3 w-full py-2 px-1 rounded-md hover:bg-bg-card-hover/50 transition-colors group"
    >
      {/* Toggle switch */}
      <div
        className="relative w-9 h-5 rounded-full shrink-0 transition-colors"
        style={{ backgroundColor: active ? filter.color : "#2a3550" }}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            active ? "left-[18px]" : "left-0.5"
          }`}
        />
      </div>

      {/* Icon + Label */}
      <span className="text-sm text-text-primary group-hover:text-white transition-colors flex-1 text-left">
        {filter.icon && <span className="mr-1.5">{filter.icon}</span>}
        {filter.label}
      </span>

      {/* Weight */}
      <span className="text-xs text-text-muted shrink-0">
        {filter.weight > 0 ? `×${filter.weight}` : "overlay"}
      </span>
    </button>
  );
}
