#!/usr/bin/env node
/**
 * Generate goy city markers — curated list of ~25 major US cities.
 * Uses exact city center coordinates and data-driven density from hex data.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

// ── Curated major US cities with exact downtown coordinates ──
const MAJOR_CITIES = [
  { name: "New York, NY",       lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles, CA",    lat: 34.0522, lng: -118.2437 },
  { name: "Chicago, IL",        lat: 41.8781, lng: -87.6298 },
  { name: "Houston, TX",        lat: 29.7604, lng: -95.3698 },
  { name: "Phoenix, AZ",        lat: 33.4484, lng: -112.0740 },
  { name: "Philadelphia, PA",   lat: 39.9526, lng: -75.1652 },
  { name: "San Antonio, TX",    lat: 29.4241, lng: -98.4936 },
  { name: "Dallas, TX",         lat: 32.7767, lng: -96.7970 },
  { name: "Miami, FL",          lat: 25.7617, lng: -80.1918 },
  { name: "Atlanta, GA",        lat: 33.7490, lng: -84.3880 },
  { name: "Boston, MA",         lat: 42.3601, lng: -71.0589 },
  { name: "San Francisco, CA",  lat: 37.7749, lng: -122.4194 },
  { name: "Seattle, WA",        lat: 47.6062, lng: -122.3321 },
  { name: "Denver, CO",         lat: 39.7392, lng: -104.9903 },
  { name: "Washington, DC",     lat: 38.9072, lng: -77.0369 },
  { name: "Nashville, TN",      lat: 36.1627, lng: -86.7816 },
  { name: "Detroit, MI",        lat: 42.3314, lng: -83.0458 },
  { name: "Portland, OR",       lat: 45.5152, lng: -122.6784 },
  { name: "Minneapolis, MN",    lat: 44.9778, lng: -93.2650 },
  { name: "Charlotte, NC",      lat: 35.2271, lng: -80.8431 },
  { name: "Las Vegas, NV",      lat: 36.1699, lng: -115.1398 },
  { name: "Orlando, FL",        lat: 28.5383, lng: -81.3792 },
  { name: "St. Louis, MO",      lat: 38.6270, lng: -90.1994 },
  { name: "Tampa, FL",          lat: 27.9506, lng: -82.4572 },
  { name: "New Orleans, LA",    lat: 29.9511, lng: -90.0715 },
];

// ── Load hex data and compute density per city ──
const hexData = JSON.parse(readFileSync(join(DATA_DIR, "goy_hex_res7.json"), "utf8"));

// Count churches near each city (within ~100km)
const cityChurches = MAJOR_CITIES.map(city => {
  let totalChurches = 0;
  for (const f of hexData.features) {
    const ring = f.geometry.coordinates[0];
    const len = ring.length - 1;
    const hexLat = ring.slice(0, len).reduce((s, c) => s + c[1], 0) / len;
    const hexLng = ring.slice(0, len).reduce((s, c) => s + c[0], 0) / len;
    const dlat = hexLat - city.lat;
    const dlng = (hexLng - city.lng) * Math.cos(city.lat * Math.PI / 180);
    const distDeg = Math.sqrt(dlat * dlat + dlng * dlng);
    if (distDeg < 1.0) { // ~110km radius
      totalChurches += f.properties.church_count;
    }
  }
  return { ...city, churches: totalChurches };
});

const maxChurches = Math.max(...cityChurches.map(c => c.churches));

const features = cityChurches.map((c, i) => ({
  type: "Feature",
  properties: {
    name: c.name,
    rank: i + 1,
    churches: c.churches,
    density: Math.max(30, Math.round(Math.log2(Math.max(1, c.churches)) / Math.log2(maxChurches) * 100)),
  },
  geometry: {
    type: "Point",
    coordinates: [c.lng, c.lat],
  },
}));

const collection = { type: "FeatureCollection", features };
writeFileSync(join(DATA_DIR, "goy_city_markers.json"), JSON.stringify(collection));

console.log(`Wrote ${features.length} city markers:\n`);
for (const c of cityChurches.sort((a, b) => b.churches - a.churches)) {
  const density = Math.max(30, Math.round(Math.log2(Math.max(1, c.churches)) / Math.log2(maxChurches) * 100));
  console.log(`  ${c.name}: ${c.churches} churches, density=${density}`);
}
