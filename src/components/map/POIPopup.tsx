"use client";

import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";

interface POIPopupProps {
  feature: GeoJSON.Feature;
  x: number;
  y: number;
  onClose: () => void;
}

export default function POIPopup({ feature, x, y, onClose }: POIPopupProps) {
  const mode = useAppStore((s) => s.mode);
  const config = MODE_CONFIGS[mode];

  if (!feature?.properties) return null;

  const { name, category, city } = feature.properties;
  const filterDef = config.filters.find((f) => f.id === category);

  return (
    <>
      {/* Click-away backdrop */}
      <div className="fixed inset-0 z-[499]" onClick={onClose} />
      <div
        className="fixed z-[500] min-w-[180px] max-w-[260px]"
        style={{ left: x + 12, top: y - 12 }}
      >
        <div className="bg-bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
          {/* Category color dot + label */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: filterDef?.color ?? "#888" }}
            />
            <span className="text-[11px] text-text-muted uppercase tracking-wider">
              {filterDef?.label ?? category}
            </span>
          </div>
          {/* POI name */}
          <p className="text-sm font-medium text-text-primary">{name}</p>
          {/* City */}
          {city && (
            <p className="text-xs text-text-muted mt-0.5">{city}</p>
          )}
        </div>
      </div>
    </>
  );
}
