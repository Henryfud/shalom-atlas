"use client";

import { useState, useEffect } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useAppStore } from "@/store";
import type { FeatureCollection, LineString, Point, Feature, Geometry } from "geojson";

/* ── Williamsburg Underground Tunnels (fictitious) ── */
const WILLIAMSBURG_TUNNELS: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Williamsburg Underground Tunnels" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.9700, 40.7105],
          [-73.9655, 40.7100],
          [-73.9610, 40.7092],
          [-73.9565, 40.7088],
          [-73.9520, 40.7080],
          [-73.9480, 40.7075],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Williamsburg Underground Tunnels" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.9572, 40.7155],
          [-73.9575, 40.7130],
          [-73.9577, 40.7105],
          [-73.9565, 40.7088],
          [-73.9560, 40.7060],
          [-73.9555, 40.7035],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Williamsburg Underground Tunnels" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.9555, 40.7035],
          [-73.9540, 40.7015],
          [-73.9520, 40.6995],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Williamsburg Underground Tunnels" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.9610, 40.7092],
          [-73.9620, 40.7070],
          [-73.9635, 40.7050],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Williamsburg Underground Tunnels" },
      geometry: {
        type: "Point",
        coordinates: [-73.9577, 40.7088],
      },
    },
  ] as Feature<Geometry>[],
};

export default function TunnelLayer() {
  const active = useAppStore((s) => s.activeFilters["nyc_tunnels"]);
  const mode = useAppStore((s) => s.mode);
  const [linesData, setLinesData] = useState<FeatureCollection<LineString> | null>(null);
  const [stationsData, setStationsData] = useState<FeatureCollection<Point> | null>(null);
  const [brooklynData, setBrooklynData] = useState<FeatureCollection<LineString> | null>(null);

  useEffect(() => {
    fetch("/data/nyc_subway_lines.geojson")
      .then((res) => res.json())
      .then(setLinesData)
      .catch((err) => console.error("Failed to load subway lines:", err));

    fetch("/data/nyc_subway_stations.geojson")
      .then((res) => res.json())
      .then(setStationsData)
      .catch((err) => console.error("Failed to load subway stations:", err));

    fetch("/data/brooklyn_tunnels.geojson")
      .then((res) => res.json())
      .then(setBrooklynData)
      .catch((err) => console.error("Failed to load Brooklyn tunnels:", err));
  }, []);

  if (!active || !linesData) return null;

  return (
    <>
      {/* ── NYC Subway lines — visible zoom 11+ ── */}
      <Source id="nyc-tunnels" type="geojson" data={linesData}>
        <Layer
          id="nyc-tunnels-glow"
          type="line"
          source="nyc-tunnels"
          paint={{
            "line-color": "#d4a853",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              11, 2,
              13, 5,
              16, 8,
            ] as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-opacity": [
              "interpolate", ["linear"], ["zoom"],
              11, 0,
              12, 0.08,
              14, 0.15,
              16, 0.2,
            ] as any,
            "line-blur": 4,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
        <Layer
          id="nyc-tunnels"
          type="line"
          source="nyc-tunnels"
          paint={{
            "line-color": "#d4a853",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              11, 0.5,
              13, 1.5,
              16, 3,
            ] as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-opacity": [
              "interpolate", ["linear"], ["zoom"],
              11, 0,
              12, 0.3,
              14, 0.6,
              16, 0.8,
            ] as any,
            "line-blur": 0.5,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
      </Source>

      {/* ── Subway stations — visible zoom 11+ ── */}
      {stationsData && (
        <Source id="nyc-tunnel-stations" type="geojson" data={stationsData}>
          <Layer
            id="nyc-tunnel-stations"
            type="circle"
            source="nyc-tunnel-stations"
            paint={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "circle-radius": [
                "interpolate", ["linear"], ["zoom"],
                11, 1,
                14, 4,
              ] as any,
              "circle-color": "#d4a853",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "circle-opacity": [
                "interpolate", ["linear"], ["zoom"],
                11, 0,
                12, 0.5,
                14, 0.9,
              ] as any,
              "circle-stroke-width": 0.5,
              "circle-stroke-color": "#0a0e17",
            }}
          />
        </Source>
      )}

      {/* ── Williamsburg Underground Tunnels (red, zoom 11+) ── */}
      <Source id="williamsburg-tunnels" type="geojson" data={WILLIAMSBURG_TUNNELS}>
        <Layer
          id="williamsburg-tunnels-glow"
          type="line"
          source="williamsburg-tunnels"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filter={["==", ["geometry-type"], "LineString"] as any}
          paint={{
            "line-color": "#cc2222",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              11, 2,
              13, 6,
              16, 10,
            ] as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-opacity": [
              "interpolate", ["linear"], ["zoom"],
              11, 0,
              12, 0.1,
              14, 0.2,
              16, 0.25,
            ] as any,
            "line-blur": 5,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
        <Layer
          id="williamsburg-tunnels-line"
          type="line"
          source="williamsburg-tunnels"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filter={["==", ["geometry-type"], "LineString"] as any}
          paint={{
            "line-color": "#dd3333",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              11, 0.8,
              13, 2,
              16, 3.5,
            ] as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "line-opacity": [
              "interpolate", ["linear"], ["zoom"],
              11, 0,
              12, 0.4,
              14, 0.7,
              16, 0.9,
            ] as any,
            "line-blur": 0.3,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
        <Layer
          id="williamsburg-tunnels-label"
          type="symbol"
          source="williamsburg-tunnels"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filter={["==", ["geometry-type"], "Point"] as any}
          layout={{
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Bold"],
            "text-size": [
              "interpolate", ["linear"], ["zoom"],
              13, 11,
              15, 14,
            ],
            "text-anchor": "center",
            "text-allow-overlap": true,
          }}
          paint={{
            "text-color": "#ff4444",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "text-opacity": [
              "interpolate", ["linear"], ["zoom"],
              12, 0,
              13, 1,
            ] as any,
            "text-halo-color": "#0a0e17",
            "text-halo-width": 2,
          }}
        />
      </Source>

      {/* ── Brooklyn Tunnel Network (gold dashed, Jewish mode only, zoom 11+) ── */}
      {mode === "jewish" && brooklynData && (
        <Source id="brooklyn-tunnels" type="geojson" data={brooklynData}>
          <Layer
            id="brooklyn-tunnels-glow"
            type="line"
            source="brooklyn-tunnels"
            paint={{
              "line-color": "#d4a853",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "line-width": [
                "interpolate", ["linear"], ["zoom"],
                11, 2,
                13, 5,
                16, 8,
              ] as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "line-opacity": [
                "interpolate", ["linear"], ["zoom"],
                11, 0,
                12, 0.08,
                14, 0.15,
                16, 0.2,
              ] as any,
              "line-blur": 4,
            }}
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
          />
          <Layer
            id="brooklyn-tunnels-line"
            type="line"
            source="brooklyn-tunnels"
            paint={{
              "line-color": "#d4a853",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "line-width": [
                "interpolate", ["linear"], ["zoom"],
                11, 0.5,
                13, 1.5,
                16, 3,
              ] as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "line-opacity": [
                "interpolate", ["linear"], ["zoom"],
                11, 0,
                12, 0.3,
                14, 0.6,
                16, 0.8,
              ] as any,
              "line-blur": 0.5,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              "line-dasharray": [2, 1] as any,
            }}
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
          />
        </Source>
      )}
    </>
  );
}
