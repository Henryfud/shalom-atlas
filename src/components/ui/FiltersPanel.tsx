"use client";

import { useAppStore } from "@/store";
import { useFilters } from "@/hooks/useFilters";
import FilterToggle from "./FilterToggle";

export default function FiltersPanel() {
  const filterPanelOpen = useAppStore((s) => s.filterPanelOpen);
  const closeFilterPanel = useAppStore((s) => s.closeFilterPanel);
  const setAllFilters = useAppStore((s) => s.setAllFilters);
  const { groupedFilters, FILTER_GROUPS, activeCount } = useFilters();

  return (
    <>
      {/* Backdrop — click to close */}
      {filterPanelOpen && (
        <div
          className="absolute inset-0 z-[300]"
          onClick={closeFilterPanel}
        />
      )}

      {/* Panel */}
      <div
        className={`absolute top-0 left-0 z-[400] h-full w-[340px] bg-bg-secondary/95 backdrop-blur-md border-r border-border shadow-2xl transition-transform duration-300 ease-out ${
          filterPanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-16 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Filters
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {activeCount} active
            </p>
          </div>
          <button
            onClick={closeFilterPanel}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* All / Clear */}
        <div className="px-5 pb-3 flex gap-3 text-xs">
          <button
            onClick={() => setAllFilters(true)}
            className="text-accent-gold hover:underline"
          >
            All
          </button>
          <span className="text-text-muted">|</span>
          <button
            onClick={() => setAllFilters(false)}
            className="text-accent-gold hover:underline"
          >
            Clear
          </button>
        </div>

        {/* Filter groups */}
        <div className="overflow-y-auto h-[calc(100%-120px)] px-5 pb-8">
          {Object.entries(groupedFilters).map(([group, filters]) => (
            <div key={group} className="mb-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                {FILTER_GROUPS[group]}
              </h3>
              <div className="space-y-0.5">
                {filters.map((f) => (
                  <FilterToggle key={f.id} filter={f} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
