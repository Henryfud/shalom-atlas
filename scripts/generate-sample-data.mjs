#!/usr/bin/env node
/**
 * Generate sample H3 hex GeoJSON data for ~30 major Jewish population centers.
 * Uses h3-js to compute hex cells and boundaries.
 * Output: public/data/hex_res7.json, hex_res8.json, poi_markers.json, stats.json
 */

import { latLngToCell, gridDisk, cellToBoundary, gridRingUnsafe } from "h3-js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
mkdirSync(DATA_DIR, { recursive: true });

// 35+ Jewish population centers — CDI scores from Revision Round 1 tiers
const CITIES = [
  // Tier 1 (CDI 85-100) — Major Jewish population centers
  { name: "Lakewood, NJ", lat: 40.0968, lng: -74.2179, peakCDI: 98 },
  { name: "Brooklyn, NY", lat: 40.6782, lng: -73.9442, peakCDI: 97 },
  { name: "Monsey, NY", lat: 41.1112, lng: -74.0685, peakCDI: 95 },
  { name: "Manhattan, NY", lat: 40.7831, lng: -73.9712, peakCDI: 90 },
  { name: "Teaneck, NJ", lat: 40.8976, lng: -74.0159, peakCDI: 88 },
  { name: "Five Towns, NY", lat: 40.6282, lng: -73.7185, peakCDI: 85 },
  { name: "Great Neck, NY", lat: 40.8007, lng: -73.7285, peakCDI: 85 },

  // Tier 2 (CDI 65-84) — Large communities
  { name: "Passaic, NJ", lat: 40.8568, lng: -74.1285, peakCDI: 82 },
  { name: "Los Angeles, CA", lat: 34.0622, lng: -118.3534, peakCDI: 82 },
  { name: "Miami Beach, FL", lat: 25.7907, lng: -80.13, peakCDI: 80 },
  { name: "Boca Raton, FL", lat: 26.3683, lng: -80.1289, peakCDI: 75 },
  { name: "Boston, MA", lat: 42.3317, lng: -71.1212, peakCDI: 73 },
  { name: "Skokie, IL", lat: 42.0324, lng: -87.7416, peakCDI: 72 },
  { name: "Baltimore, MD", lat: 39.3743, lng: -76.7227, peakCDI: 71 },
  { name: "Philadelphia, PA", lat: 40.0438, lng: -75.1453, peakCDI: 70 },
  { name: "Silver Spring, MD", lat: 39.01, lng: -77.0261, peakCDI: 68 },
  { name: "West Hartford, CT", lat: 41.7621, lng: -72.7420, peakCDI: 65 },
  { name: "West Orange, NJ", lat: 40.7987, lng: -74.239, peakCDI: 65 },
  { name: "Encino, CA", lat: 34.1592, lng: -118.5017, peakCDI: 65 },

  // Tier 3 (CDI 40-64) — Moderate communities
  { name: "Pittsburgh, PA", lat: 40.4312, lng: -79.9675, peakCDI: 58 },
  { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194, peakCDI: 55 },
  { name: "Chicago, IL", lat: 41.8991, lng: -87.6268, peakCDI: 55 },
  { name: "Cleveland, OH", lat: 41.4993, lng: -81.6944, peakCDI: 53 },
  { name: "Atlanta, GA", lat: 33.8463, lng: -84.3563, peakCDI: 52 },
  { name: "Scottsdale, AZ", lat: 33.4942, lng: -111.9261, peakCDI: 50 },
  { name: "Detroit, MI", lat: 42.4734, lng: -83.2219, peakCDI: 50 },
  { name: "Potomac, MD", lat: 39.0179, lng: -77.2085, peakCDI: 50 },
  { name: "Denver, CO", lat: 39.71, lng: -104.9813, peakCDI: 48 },
  { name: "Seattle, WA", lat: 47.6097, lng: -122.3331, peakCDI: 47 },
  { name: "St. Louis, MO", lat: 38.6507, lng: -90.3053, peakCDI: 46 },
  { name: "Dallas, TX", lat: 32.8285, lng: -96.7795, peakCDI: 45 },
  { name: "Houston, TX", lat: 29.7255, lng: -95.3493, peakCDI: 42 },

  // Tier 4 (CDI 20-39) — Smaller communities
  { name: "San Diego, CA", lat: 32.7157, lng: -117.1611, peakCDI: 35 },
  { name: "Minneapolis, MN", lat: 44.9537, lng: -93.2650, peakCDI: 33 },
  { name: "Portland, OR", lat: 45.5152, lng: -122.6784, peakCDI: 32 },
  { name: "Austin, TX", lat: 30.2672, lng: -97.7431, peakCDI: 30 },
  { name: "Nashville, TN", lat: 36.1627, lng: -86.7816, peakCDI: 28 },
];

// Layer categories that contribute to CDI
const LAYER_KEYS = [
  "synagogues",
  "chabad",
  "mikvahs",
  "day_schools",
  "hillel",
  "hebrew_schools",
  "kosher_restaurants",
  "kosher_delis",
  "kosher_bakeries",
  "judaica",
  "jccs",
  "federations",
  "jewish_family_services",
  "jewish_museums",
];

const WEIGHTS = {
  synagogues: 2.5,
  chabad: 2.0,
  mikvahs: 2.0,
  day_schools: 1.8,
  hillel: 1.5,
  hebrew_schools: 1.5,
  kosher_restaurants: 1.3,
  kosher_delis: 1.2,
  kosher_bakeries: 1.0,
  judaica: 1.0,
  jccs: 1.2,
  federations: 1.0,
  jewish_family_services: 1.0,
  jewish_museums: 0.8,
};

function noise(range) {
  return (Math.random() - 0.5) * 2 * range;
}

function generateLayerCounts(cdi) {
  // Generate plausible layer counts that would roughly produce this CDI score
  const counts = {};
  if (cdi <= 5) {
    for (const key of LAYER_KEYS) counts[key] = 0;
    return counts;
  }

  // Scale factor: higher CDI = more POIs
  const scale = cdi / 100;
  counts.synagogues = Math.max(0, Math.round(scale * 25 + noise(3)));
  counts.chabad = Math.max(0, Math.round(scale * 8 + noise(2)));
  counts.mikvahs = Math.max(0, Math.round(scale * 4 + noise(1)));
  counts.day_schools = Math.max(0, Math.round(scale * 6 + noise(2)));
  counts.hillel = Math.max(0, Math.round(scale * 2 + noise(1)));
  counts.hebrew_schools = Math.max(0, Math.round(scale * 4 + noise(1)));
  counts.kosher_restaurants = Math.max(0, Math.round(scale * 18 + noise(4)));
  counts.kosher_delis = Math.max(0, Math.round(scale * 8 + noise(2)));
  counts.kosher_bakeries = Math.max(0, Math.round(scale * 5 + noise(2)));
  counts.judaica = Math.max(0, Math.round(scale * 3 + noise(1)));
  counts.jccs = Math.max(0, Math.round(scale * 2 + noise(1)));
  counts.federations = Math.max(0, Math.round(scale * 1 + noise(0.5)));
  counts.jewish_family_services = Math.max(
    0,
    Math.round(scale * 1 + noise(0.5))
  );
  counts.jewish_museums = Math.max(0, Math.round(scale * 1 + noise(0.5)));

  return counts;
}

function cellToBoundaryGeoJSON(h3Index) {
  // cellToBoundary returns [[lat, lng], ...], we need [[lng, lat], ...]
  const boundary = cellToBoundary(h3Index);
  const coords = boundary.map(([lat, lng]) => [lng, lat]);
  coords.push(coords[0]); // Close the polygon
  return coords;
}

function generateHexData(resolution) {
  const kRing = resolution === 7 ? 2 : 3;
  const decayRates = resolution === 7 ? [1.0, 0.6, 0.25] : [1.0, 0.75, 0.5, 0.2];
  const allFeatures = [];
  const seen = new Set();

  for (const city of CITIES) {
    const centerCell = latLngToCell(city.lat, city.lng, resolution);

    // Get cells ring by ring for decay
    for (let ring = 0; ring <= kRing; ring++) {
      let cells;
      if (ring === 0) {
        cells = [centerCell];
      } else {
        try {
          cells = gridRingUnsafe(centerCell, ring);
        } catch {
          // Fallback: get all cells in disk and subtract inner
          const outer = gridDisk(centerCell, ring);
          const inner = new Set(gridDisk(centerCell, ring - 1));
          cells = outer.filter((c) => !inner.has(c));
        }
      }

      for (const cell of cells) {
        if (seen.has(cell)) continue;
        seen.add(cell);

        const decay = decayRates[ring] ?? 0.1;
        const baseCDI = city.peakCDI * decay;
        const cdi = Math.max(0, Math.min(100, Math.round(baseCDI + noise(5))));
        const layers = generateLayerCounts(cdi);
        const coords = cellToBoundaryGeoJSON(cell);

        allFeatures.push({
          type: "Feature",
          properties: {
            h3: cell,
            cdi,
            nearest_city: city.name,
            ...Object.fromEntries(
              Object.entries(layers).map(([k, v]) => [`layer_${k}`, v])
            ),
          },
          geometry: {
            type: "Polygon",
            coordinates: [coords],
          },
        });
      }
    }
  }

  return {
    type: "FeatureCollection",
    features: allFeatures,
  };
}

// Generate POI markers for a few cities
function generatePOIMarkers() {
  const categories = [
    { id: "synagogues", names: ["Temple Beth El", "Congregation Shaarei Torah", "Young Israel", "Ohev Shalom Synagogue", "Beth Jacob Congregation"] },
    { id: "chabad", names: ["Chabad of Midtown", "Chabad Jewish Center", "Chabad House", "Chabad Lubavitch"] },
    { id: "kosher_restaurants", names: ["Jerusalem Grill", "Kosher Palace", "The Kosher Kitchen", "Shalom Falafel", "Eden Bistro"] },
    { id: "jccs", names: ["JCC Manhattan", "JCC of Greater Boston", "South Florida JCC"] },
    { id: "day_schools", names: ["Yeshiva Academy", "Jewish Day School", "Torah Academy", "Hebrew Academy"] },
    { id: "jewish_museums", names: ["Jewish Heritage Museum", "Holocaust Memorial Museum"] },
  ];

  const poiCities = CITIES.slice(0, 8); // First 8 cities
  const features = [];
  let id = 1;

  for (const city of poiCities) {
    for (const cat of categories) {
      const count = Math.min(cat.names.length, Math.ceil(Math.random() * 3) + 1);
      for (let i = 0; i < count; i++) {
        features.push({
          type: "Feature",
          properties: {
            id: `poi_${id++}`,
            name: cat.names[i],
            category: cat.id,
            city: city.name,
          },
          geometry: {
            type: "Point",
            coordinates: [
              city.lng + noise(0.02),
              city.lat + noise(0.02),
            ],
          },
        });
      }
    }
  }

  return { type: "FeatureCollection", features };
}

// Generate stats
function generateStats(res7Data) {
  const topMetros = CITIES.slice()
    .sort((a, b) => b.peakCDI - a.peakCDI)
    .slice(0, 10)
    .map((c, i) => ({ rank: i + 1, name: c.name, cdi: c.peakCDI }));

  // CDI distribution from hex features
  const dist = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
  for (const f of res7Data.features) {
    const cdi = f.properties.cdi;
    if (cdi <= 20) dist["0-20"]++;
    else if (cdi <= 40) dist["21-40"]++;
    else if (cdi <= 60) dist["41-60"]++;
    else if (cdi <= 80) dist["61-80"]++;
    else dist["81-100"]++;
  }

  return {
    totalEstimatedPopulation: 7600000,
    totalSynagogues: 3728,
    totalKosherEstablishments: 4215,
    totalJCCs: 347,
    statesWithData: 42,
    topMetros,
    topZIPs: [
      { rank: 1, zip: "11230", area: "Midwood, Brooklyn", cdi: 98 },
      { rank: 2, zip: "08701", area: "Lakewood, NJ", cdi: 97 },
      { rank: 3, zip: "11219", area: "Borough Park, Brooklyn", cdi: 96 },
      { rank: 4, zip: "11211", area: "Williamsburg, Brooklyn", cdi: 95 },
      { rank: 5, zip: "10977", area: "Spring Valley/Monsey, NY", cdi: 93 },
      { rank: 6, zip: "11235", area: "Brighton Beach, Brooklyn", cdi: 90 },
      { rank: 7, zip: "10952", area: "Monsey, NY", cdi: 89 },
      { rank: 8, zip: "07055", area: "Passaic, NJ", cdi: 85 },
      { rank: 9, zip: "11516", area: "Cedarhurst (Five Towns), NY", cdi: 83 },
      { rank: 10, zip: "07666", area: "Teaneck, NJ", cdi: 80 },
    ],
    cdiDistribution: dist,
  };
}

// Run generation
console.log("Generating H3 hex data (resolution 7)...");
const res7 = generateHexData(7);
console.log(`  → ${res7.features.length} features`);

console.log("Generating H3 hex data (resolution 8)...");
const res8 = generateHexData(8);
console.log(`  → ${res8.features.length} features`);

console.log("Generating POI markers...");
const pois = generatePOIMarkers();
console.log(`  → ${pois.features.length} POIs`);

console.log("Generating stats...");
const stats = generateStats(res7);

// Write files
writeFileSync(join(DATA_DIR, "hex_res7.json"), JSON.stringify(res7));
writeFileSync(join(DATA_DIR, "hex_res8.json"), JSON.stringify(res8));
writeFileSync(join(DATA_DIR, "poi_markers.json"), JSON.stringify(pois));
writeFileSync(join(DATA_DIR, "stats.json"), JSON.stringify(stats, null, 2));

console.log("\nAll data files written to public/data/");
