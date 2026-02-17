"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Map, { type MapRef, type ViewStateChangeEvent, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useAppStore } from "@/store";
import { getResolutionForZoom } from "@/lib/h3";
import HexLayer from "./HexLayer";
import HexTooltip from "./HexTooltip";
import VotePopup from "./VotePopup";
import maplibregl, { type Map as MaplibreMap } from "maplibre-gl";
import * as pmtiles from "pmtiles";

// Register PMTiles protocol once at module level
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAPLIBRE_STYLE ||
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapContainer() {
  const mapRef = useRef<MapRef>(null);
  const setViewState = useAppStore((s) => s.setViewState);
  const viewState = useAppStore((s) => s.viewState);
  const setHexResolution = useAppStore((s) => s.setHexResolution);
  const hexResolution = useAppStore((s) => s.hexResolution);
  const mode = useAppStore((s) => s.mode);

  const [hoveredFeature, setHoveredFeature] = useState<GeoJSON.Feature | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const hoveredStateId = useRef<number | null>(null);

  // Click-to-vote popup state
  const [clickedFeature, setClickedFeature] = useState<GeoJSON.Feature | null>(null);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });

  // Track basemap layer IDs so we can restyle them on mode change
  const waterLayerIds = useRef<string[]>([]);
  const basemapLayerIds = useRef<{ background: string[]; landcover: string[] }>({ background: [], landcover: [] });

  const onMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState);
    },
    [setViewState]
  );

  const onMoveEnd = useCallback(
    (evt: ViewStateChangeEvent) => {
      const zoom = evt.viewState.zoom;
      const newRes = getResolutionForZoom(zoom);
      if (newRes !== hexResolution) {
        setHexResolution(newRes);
      }
    },
    [hexResolution, setHexResolution]
  );

  // Clean up basemap: remove river lines, restyle water + land
  const onMapLoad = useCallback((evt: { target: MaplibreMap }) => {
    const map = evt.target;
    const style = map.getStyle();
    if (!style?.layers) return;

    const waterIds: string[] = [];
    const bgIds: string[] = [];
    const landIds: string[] = [];
    const currentMode = useAppStore.getState().mode;

    for (const layer of style.layers) {
      const id = layer.id.toLowerCase();

      // Remove river/stream/canal LINE layers only (keep ocean/lake fills)
      if (
        layer.type === "line" &&
        (id.includes("waterway") || id.includes("river") || id.includes("canal") || id.includes("stream"))
      ) {
        map.removeLayer(layer.id);
        continue;
      }

      // Track water fill layers
      if (layer.type === "fill" && id.includes("water")) {
        waterIds.push(layer.id);
        map.setPaintProperty(layer.id, "fill-color", currentMode === "goy" ? "#1a0a0a" : "#112240");
      }

      // Track background layers
      if (id === "background" || (layer.type === "background")) {
        bgIds.push(layer.id);
        if (currentMode === "goy") {
          try { map.setPaintProperty(layer.id, "background-color", "#1a1a2e"); } catch { /* */ }
        }
      }

      // Track landcover/landuse fill layers
      if (layer.type === "fill" && (id.includes("landcover") || id.includes("landuse") || id.includes("land"))) {
        if (!id.includes("water")) {
          landIds.push(layer.id);
          if (currentMode === "goy") {
            try { map.setPaintProperty(layer.id, "fill-color", "#1e1e32"); } catch { /* */ }
          }
        }
      }
    }
    waterLayerIds.current = waterIds;
    basemapLayerIds.current = { background: bgIds, landcover: landIds };
  }, []);

  // Update water + basemap colors when mode changes
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Water
    const waterColor = mode === "goy" ? "#1a0a0a" : "#112240";
    for (const layerId of waterLayerIds.current) {
      try { map.setPaintProperty(layerId, "fill-color", waterColor); } catch { /* */ }
    }

    // Background
    for (const layerId of basemapLayerIds.current.background) {
      try {
        map.setPaintProperty(layerId, "background-color", mode === "goy" ? "#1a1a2e" : "#0a0e17");
      } catch { /* */ }
    }

    // Landcover
    for (const layerId of basemapLayerIds.current.landcover) {
      try {
        map.setPaintProperty(layerId, "fill-color", mode === "goy" ? "#1e1e32" : "#0d1117");
      } catch { /* */ }
    }
  }, [mode]);

  const getSourceLayer = useCallback(() => {
    const currentMode = useAppStore.getState().mode;
    return currentMode === "jewish" ? "jewish-hex" : "goy-hex";
  }, []);

  const onMouseMove = useCallback(
    (evt: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const zoom = map.getZoom();
      const sl = getSourceLayer();

      // Clear previous hover
      if (hoveredStateId.current !== null) {
        try {
          map.setFeatureState(
            { source: "hex-data", sourceLayer: sl, id: hoveredStateId.current },
            { hover: false }
          );
        } catch { /* source may not exist yet */ }
      }

      // Only show tooltips at zoom 8+
      if (zoom < 8) {
        hoveredStateId.current = null;
        setHoveredFeature(null);
        map.getCanvas().style.cursor = "";
        return;
      }

      setTooltipPos({ x: evt.point.x, y: evt.point.y });

      // Check hex layer
      const features = evt.features;
      if (features && features.length > 0) {
        const feature = features[0];
        hoveredStateId.current = feature.id as number;
        try {
          map.setFeatureState(
            { source: "hex-data", sourceLayer: sl, id: feature.id as number },
            { hover: true }
          );
        } catch { /* source may not exist yet */ }
        setHoveredFeature(feature);
        map.getCanvas().style.cursor = "pointer";
      } else {
        hoveredStateId.current = null;
        setHoveredFeature(null);
        map.getCanvas().style.cursor = "";
      }
    },
    [getSourceLayer]
  );

  const onClick = useCallback(
    (evt: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map || map.getZoom() < 8) return;

      const features = evt.features;
      if (features && features.length > 0) {
        setClickedFeature(features[0]);
        setClickPos({ x: evt.point.x, y: evt.point.y });
      }
    },
    []
  );

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (hoveredStateId.current !== null) {
      const sl = getSourceLayer();
      try {
        map.setFeatureState(
          { source: "hex-data", sourceLayer: sl, id: hoveredStateId.current },
          { hover: false }
        );
      } catch { /* source may not exist yet */ }
    }
    hoveredStateId.current = null;
    setHoveredFeature(null);
    map.getCanvas().style.cursor = "";
  }, [getSourceLayer]);

  return (
    <>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
        onLoad={onMapLoad}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        interactiveLayerIds={["hex-fill"]}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        maxBounds={[[-180, 5], [-30, 75]]}
        minZoom={3}
        maxZoom={16}
        attributionControl={{ compact: true }}
      >
        <HexLayer />
      </Map>
      <HexTooltip
        feature={hoveredFeature}
        x={tooltipPos.x}
        y={tooltipPos.y}
      />
      {clickedFeature && (
        <VotePopup
          feature={clickedFeature}
          x={clickPos.x}
          y={clickPos.y}
          onClose={() => setClickedFeature(null)}
        />
      )}
    </>
  );
}
