/**
 * Color utilities — mode-aware color scales and MapLibre expressions.
 */

import type { AppMode } from "@/types";
import { MODE_CONFIGS } from "./mode-config";

/* ── JS-side color interpolation ── */

export function scoreToColor(
  score: number,
  stops: [number, [number, number, number]][]
): string {
  const clamped = Math.max(0, Math.min(100, score));

  for (let i = 0; i < stops.length - 1; i++) {
    const [s0, c0] = stops[i];
    const [s1, c1] = stops[i + 1];

    if (clamped >= s0 && clamped <= s1) {
      const t = (clamped - s0) / (s1 - s0);
      const r = Math.round(c0[0] + t * (c1[0] - c0[0]));
      const g = Math.round(c0[1] + t * (c1[1] - c0[1]));
      const b = Math.round(c0[2] + t * (c1[2] - c0[2]));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  const last = stops[stops.length - 1][1];
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

/* ── MapLibre expression builders ── */

function buildFillColorExpression(
  prop: string,
  stops: [number, [number, number, number]][]
): unknown[] {
  const expr: unknown[] = ["interpolate", ["linear"], ["get", prop]];
  for (const [val, [r, g, b]] of stops) {
    expr.push(val, `rgb(${r}, ${g}, ${b})`);
  }
  return expr;
}

/** Jewish mode fill opacity — score-based, no zoom fade */
function buildFillOpacityExpression(prop: string): unknown[] {
  return [
    "interpolate",
    ["linear"],
    ["get", prop],
    0, 0.08,
    30, 0.3,
    60, 0.5,
    100, 0.7,
  ];
}

/** Goy mode fill opacity — visible from national zoom, basemap still readable */
function buildGoyFillOpacity(prop: string): unknown[] {
  return [
    "interpolate",
    ["linear"],
    ["get", prop],
    0, 0.35,
    20, 0.45,
    40, 0.55,
    60, 0.65,
    80, 0.75,
    100, 0.85,
  ];
}

/* ── Jewish Mode: Bright glow at national zoom, CDI-scaled ── */

function buildJewishGlowRadius(prop: string): unknown[] {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    3,
    ["interpolate", ["linear"], ["get", prop], 20, 10, 50, 18, 80, 28, 100, 35],
    6,
    ["interpolate", ["linear"], ["get", prop], 20, 6, 50, 12, 80, 18, 100, 24],
    9,
    ["interpolate", ["linear"], ["get", prop], 20, 3, 50, 6, 80, 10, 100, 14],
    12,
    0,
  ];
}

function buildJewishGlowColor(prop: string): unknown[] {
  return [
    "interpolate",
    ["linear"],
    ["get", prop],
    0, "#1e3a6e",
    30, "#2a6db5",
    50, "#4a9fd4",
    70, "#8bc4a0",
    85, "#c9a84c",
    100, "#e8c252",
  ];
}

const JEWISH_GLOW_BLUR: unknown[] = [
  "interpolate",
  ["linear"],
  ["zoom"],
  3, 1.0,
  8, 0.7,
  12, 0.3,
];

const JEWISH_GLOW_OPACITY: unknown[] = [
  "interpolate",
  ["linear"],
  ["zoom"],
  3, 0.8,
  8, 0.5,
  12, 0,
];

/* ── Public API ── */

export function getExpressionsForMode(mode: AppMode) {
  const config = MODE_CONFIGS[mode];
  const prop = config.densityProperty;

  if (mode === "goy") {
    return {
      fillColor: buildFillColorExpression(prop, config.colorStops),
      fillOpacity: buildGoyFillOpacity(prop),
      glowRadius: null,
      glowOpacity: null,
      glowColor: null,
      glowBlur: null,
    };
  }

  // Jewish mode
  return {
    fillColor: buildFillColorExpression(prop, config.colorStops),
    fillOpacity: buildFillOpacityExpression(prop),
    glowRadius: buildJewishGlowRadius(prop),
    glowOpacity: JEWISH_GLOW_OPACITY,
    glowColor: buildJewishGlowColor(prop),
    glowBlur: JEWISH_GLOW_BLUR,
  };
}
