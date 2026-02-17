"use client";

import { useMemo, useState, useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useAppStore } from "@/store";
import { getExpressionsForMode } from "@/lib/colors";
import type { FeatureCollection, Point } from "geojson";

interface HexLayerProps {
  beforeId?: string;
}

export default function HexLayer({ beforeId }: HexLayerProps) {
  const showCDI = useAppStore((s) => s.showCDI);
  const mode = useAppStore((s) => s.mode);

  const expressions = useMemo(() => getExpressionsForMode(mode), [mode]);

  // Load centroid data for Jewish glow layer only
  const [centroidData, setCentroidData] = useState<FeatureCollection<Point> | null>(null);
  useEffect(() => {
    if (mode !== "jewish") {
      setCentroidData(null);
      return;
    }
    fetch("/data/jewish_centroids.json")
      .then((r) => r.json())
      .then(setCentroidData)
      .catch((err) => console.error("Failed to load centroids:", err));
  }, [mode]);

  const pmtilesUrl = mode === "jewish"
    ? "pmtiles:///data/jewish_hex.pmtiles"
    : "pmtiles:///data/goy_hex.pmtiles";

  const sourceLayer = mode === "jewish" ? "jewish-hex" : "goy-hex";

  const outlineColor = mode === "jewish" ? "#d4a853" : "#dc2626";
  const hoverOutlineColor = mode === "jewish" ? "#d4a853" : "#ef4444";
  const selectedOutlineColor = mode === "jewish" ? "#e8c252" : "#ef4444";

  if (!showCDI) return null;

  return (
    <>
      {/* Jewish mode only: small centroid glow at national zoom (zoom 3-10) */}
      {mode === "jewish" && centroidData && (
        <Source key={`glow-${mode}`} id="hex-centroids" type="geojson" data={centroidData}>
          <Layer
            id="hex-glow"
            type="circle"
            source="hex-centroids"
            beforeId={beforeId}
            paint={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "circle-radius": expressions.glowRadius as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "circle-color": expressions.glowColor as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "circle-opacity": expressions.glowOpacity as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "circle-blur": expressions.glowBlur as any,
            }}
          />
        </Source>
      )}

      {/* Hex fill polygons from PMTiles — visible at ALL zoom levels */}
      <Source key={`hex-vt-${mode}`} id="hex-data" type="vector" url={pmtilesUrl}>
        <Layer
          id="hex-fill"
          type="fill"
          source-layer={sourceLayer}
          beforeId={beforeId}
          paint={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "fill-color": expressions.fillColor as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "fill-opacity": expressions.fillOpacity as any,
          }}
        />
        <Layer
          id="hex-outline"
          type="line"
          source-layer={sourceLayer}
          beforeId={beforeId}
          paint={{
            "line-color": outlineColor,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.1, 8, 0.2, 10, 0.3, 14, 0.8] as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.1, 8, 0.15, 10, 0.25, 14, 0.5] as any,
          }}
        />
        <Layer
          id="hex-hover"
          type="line"
          source-layer={sourceLayer}
          beforeId={beforeId}
          paint={{
            "line-color": hoverOutlineColor,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              2,
              0,
            ] as any,
            "line-opacity": 1,
          }}
        />
        <Layer
          id="hex-selected"
          type="line"
          source-layer={sourceLayer}
          beforeId={beforeId}
          paint={{
            "line-color": selectedOutlineColor,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              3,
              0,
            ] as any,
            "line-opacity": 1,
          }}
        />
      </Source>
    </>
  );
}
