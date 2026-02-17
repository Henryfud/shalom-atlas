"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";
import type { FilterDef } from "@/types";

export function useFilters() {
  const mode = useAppStore((s) => s.mode);
  const activeFilters = useAppStore((s) => s.activeFilters);
  const config = MODE_CONFIGS[mode];

  const groupedFilters = useMemo(() => {
    const groups: Record<string, FilterDef[]> = {};
    for (const f of config.filters) {
      if (!groups[f.group]) groups[f.group] = [];
      groups[f.group].push(f);
    }
    return groups;
  }, [config.filters]);

  const activeCount = useMemo(
    () => Object.values(activeFilters).filter(Boolean).length,
    [activeFilters]
  );

  const isAnyActive = activeCount > 0;

  return { groupedFilters, activeCount, isAnyActive, FILTER_GROUPS: config.filterGroups };
}
