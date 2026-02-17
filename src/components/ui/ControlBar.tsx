"use client";

import { useAppStore } from "@/store";
import { useFilters } from "@/hooks/useFilters";
import CDIDropdown from "./CDIDropdown";
import SearchInput from "./SearchInput";
import NamesDropdown from "./NamesDropdown";

export default function ControlBar() {
  const toggleFilterPanel = useAppStore((s) => s.toggleFilterPanel);
  const filterPanelOpen = useAppStore((s) => s.filterPanelOpen);
  const { activeCount } = useFilters();

  return (
    <div
      className="fixed z-[200] flex items-center gap-2.5 transition-all duration-300 ease-out"
      style={{
        top: "calc(56px + var(--banner-height, 0px) + 12px)",
        left: filterPanelOpen ? "356px" : "16px",
      }}
    >
      {/* Filters button — leftmost */}
      <button
        onClick={toggleFilterPanel}
        className="flex items-center gap-2 px-3.5 h-10 bg-bg-card/80 border border-border rounded-full text-sm text-text-secondary hover:text-text-primary hover:brightness-110 hover:border-border-light transition-all"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="ml-0.5 text-xs text-accent-gold font-medium">
            ({activeCount})
          </span>
        )}
      </button>

      <CDIDropdown />
      <SearchInput />
      <NamesDropdown />
    </div>
  );
}
