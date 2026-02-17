"use client";

import { useState, useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";
import type { FeatureCollection, Point } from "geojson";

const EXCLUDED_GROUPS: Record<string, string[]> = {
  jewish: ["demographic", "infrastructure"],
  goy: [],
};

export default function POIMarkers() {
  const mode = useAppStore((s) => s.mode);
  const activeFilters = useAppStore((s) => s.activeFilters);
  const config = MODE_CONFIGS[mode];
  const [poiData, setPOIData] = useState<FeatureCollection<Point> | null>(null);

  useEffect(() => {
    fetch(config.poiDataPath)
      .then((res) => res.json())
      .then(setPOIData)
      .catch((err) => console.error("Failed to load POI data:", err));
  }, [config.poiDataPath]);

  if (!poiData) return null;

  const excluded = EXCLUDED_GROUPS[mode] ?? [];
  const activeFilterDefs = config.filters.filter(
    (f) => activeFilters[f.id] && !excluded.includes(f.group)
  );

  return (
    <Source id="poi-markers" type="geojson" data={poiData}>
      {activeFilterDefs.map((filter) => (
        <Layer
          key={filter.id}
          id={`poi-${filter.id}`}
          type="circle"
          source="poi-markers"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filter={["==", ["get", "category"], filter.id] as any}
          paint={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 2,
              8, 4,
              12, 7,
            ] as any,
            "circle-color": filter.color,
            "circle-opacity": 0.85,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1,
            "circle-stroke-opacity": 0.4,
          }}
        />
      ))}
    </Source>
  );
}
