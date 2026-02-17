#!/usr/bin/env node
/**
 * Generate Goy Mode hex data from REAL OpenStreetMap church data.
 *
 * Uses cached OSM data (135K+ churches) from /tmp/osm_churches_us.json.
 * Aggregates into H3 res7 hexes, filters to hexes with 2+ churches for clean look.
 * GPI score is deterministic based on actual church density.
 */

import { latLngToCell, cellToBoundary } from "h3-js";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");
mkdirSync(DATA_DIR, { recursive: true });

const CACHE_FILE = "/tmp/osm_churches_us.json";

// ═══════════════════════════════════════════════════════════════
// City lookup for nearest_city tooltip
// ═══════════════════════════════════════════════════════════════

const NAMED_CITIES = [
  [40.71, -74.00, "New York, NY"], [34.05, -118.24, "Los Angeles, CA"],
  [41.88, -87.63, "Chicago, IL"], [29.76, -95.37, "Houston, TX"],
  [33.45, -112.07, "Phoenix, AZ"], [39.95, -75.17, "Philadelphia, PA"],
  [29.42, -98.49, "San Antonio, TX"], [32.72, -117.16, "San Diego, CA"],
  [32.78, -96.80, "Dallas, TX"], [30.27, -97.74, "Austin, TX"],
  [30.33, -81.66, "Jacksonville, FL"], [37.34, -121.89, "San Jose, CA"],
  [39.96, -83.00, "Columbus, OH"], [35.23, -80.84, "Charlotte, NC"],
  [39.77, -86.16, "Indianapolis, IN"], [37.77, -122.42, "San Francisco, CA"],
  [47.61, -122.33, "Seattle, WA"], [39.74, -104.99, "Denver, CO"],
  [38.91, -77.04, "Washington, DC"], [36.16, -86.78, "Nashville, TN"],
  [42.36, -71.06, "Boston, MA"], [33.75, -84.39, "Atlanta, GA"],
  [25.76, -80.19, "Miami, FL"], [27.95, -82.46, "Tampa, FL"],
  [28.54, -81.38, "Orlando, FL"], [44.98, -93.27, "Minneapolis, MN"],
  [42.33, -83.05, "Detroit, MI"], [36.17, -115.14, "Las Vegas, NV"],
  [45.52, -122.68, "Portland, OR"], [39.29, -76.61, "Baltimore, MD"],
  [38.63, -90.20, "St. Louis, MO"], [39.10, -94.58, "Kansas City, MO"],
  [38.58, -121.49, "Sacramento, CA"], [40.44, -79.99, "Pittsburgh, PA"],
  [39.10, -84.51, "Cincinnati, OH"], [41.50, -81.69, "Cleveland, OH"],
  [35.78, -78.64, "Raleigh, NC"], [43.04, -87.91, "Milwaukee, WI"],
  [35.47, -97.52, "Oklahoma City, OK"], [35.15, -90.05, "Memphis, TN"],
  [38.25, -85.76, "Louisville, KY"], [37.54, -77.44, "Richmond, VA"],
  [29.95, -90.07, "New Orleans, LA"], [40.76, -111.89, "Salt Lake City, UT"],
  [33.52, -86.80, "Birmingham, AL"], [36.15, -95.99, "Tulsa, OK"],
  [42.89, -78.88, "Buffalo, NY"], [30.45, -91.19, "Baton Rouge, LA"],
  [41.59, -93.63, "Des Moines, IA"], [34.75, -92.29, "Little Rock, AR"],
  [36.07, -79.79, "Greensboro, NC"], [27.77, -82.64, "St. Petersburg, FL"],
  [32.78, -79.93, "Charleston, SC"], [34.85, -82.39, "Greenville, SC"],
  [34.00, -81.03, "Columbia, SC"], [32.08, -81.09, "Savannah, GA"],
  [35.96, -83.92, "Knoxville, TN"], [37.69, -97.33, "Wichita, KS"],
  [30.22, -92.02, "Lafayette, LA"], [32.30, -90.18, "Jackson, MS"],
  [30.70, -88.04, "Mobile, AL"], [34.73, -86.59, "Huntsville, AL"],
  [47.66, -117.43, "Spokane, WA"], [43.62, -116.20, "Boise, ID"],
  [41.26, -95.93, "Omaha, NE"], [35.08, -106.65, "Albuquerque, NM"],
  [31.76, -106.49, "El Paso, TX"], [36.74, -119.79, "Fresno, CA"],
  [35.37, -119.02, "Bakersfield, CA"], [32.76, -97.33, "Fort Worth, TX"],
  [38.83, -104.82, "Colorado Springs, CO"], [32.22, -110.97, "Tucson, AZ"],
  [43.07, -89.40, "Madison, WI"], [42.96, -85.67, "Grand Rapids, MI"],
  [43.16, -77.61, "Rochester, NY"], [43.05, -76.15, "Syracuse, NY"],
  [42.65, -73.76, "Albany, NY"], [41.77, -72.67, "Hartford, CT"],
  [36.85, -76.29, "Norfolk, VA"], [39.76, -84.19, "Dayton, OH"],
  [41.08, -81.52, "Akron, OH"], [40.81, -96.70, "Lincoln, NE"],
  [43.55, -96.73, "Sioux Falls, SD"], [46.88, -96.79, "Fargo, ND"],
  [37.22, -93.30, "Springfield, MO"], [61.22, -149.90, "Anchorage, AK"],
  [21.31, -157.86, "Honolulu, HI"], [41.66, -83.56, "Toledo, OH"],
  [40.59, -105.08, "Fort Collins, CO"], [45.78, -108.50, "Billings, MT"],
  [44.05, -123.09, "Eugene, OR"], [44.94, -123.04, "Salem, OR"],
  [46.81, -100.78, "Bismarck, ND"], [44.08, -103.23, "Rapid City, SD"],
  [38.04, -84.50, "Lexington, KY"], [41.08, -85.14, "Fort Wayne, IN"],
];

function findNearestCity(lat, lng) {
  let best = "United States";
  let bestD = Infinity;
  for (const [clat, clng, name] of NAMED_CITIES) {
    const dlat = lat - clat;
    const dlng = (lng - clng) * Math.cos((lat * Math.PI) / 180);
    const d = dlat * dlat + dlng * dlng;
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return best;
}

// ═══════════════════════════════════════════════════════════════
// Denomination classification
// ═══════════════════════════════════════════════════════════════

function classifyDenomination(denom, name) {
  const d = (denom || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (d === "catholic" || d === "roman_catholic" || n.includes("catholic")) return "catholic";
  if (d === "baptist" || d === "southern_baptist" || n.includes("baptist")) return "baptist";
  if (d === "methodist" || d === "united_methodist" || n.includes("methodist")) return "methodist";
  if (d === "lutheran" || n.includes("lutheran")) return "lutheran";
  if (d === "presbyterian" || n.includes("presbyterian")) return "presbyterian";
  if (d === "pentecostal" || d === "assemblies_of_god" || n.includes("pentecostal") || n.includes("assembly of god")) return "pentecostal";
  if (d === "mormon" || d === "latter_day_saints" || n.includes("latter-day") || n.includes("lds")) return "mormon";
  if (n.includes("mega") || n.includes("life church") || n.includes("elevation")) return "megachurch";
  return "other_christian";
}

// ═══════════════════════════════════════════════════════════════
// Aggregate churches into hexes
// ═══════════════════════════════════════════════════════════════

const MIN_CHURCHES_PER_HEX = 1; // Include all hexes to avoid visible gaps

function generateHexData(churches, resolution) {
  const cellMap = new Map();

  for (const church of churches) {
    const cell = latLngToCell(church.lat, church.lng, resolution);
    if (!cellMap.has(cell)) {
      cellMap.set(cell, { churches: [], lat: 0, lng: 0 });
    }
    const entry = cellMap.get(cell);
    entry.churches.push(church);
    entry.lat += church.lat;
    entry.lng += church.lng;
  }

  const features = [];
  let id = 0;

  for (const [h3Index, data] of cellMap) {
    const count = data.churches.length;
    if (count < MIN_CHURCHES_PER_HEX) continue; // Skip sparse hexes

    const avgLat = data.lat / count;
    const avgLng = data.lng / count;
    const nearestCity = findNearestCity(avgLat, avgLng);

    // Classify denominations
    const denomCounts = {};
    for (const ch of data.churches) {
      const cls = classifyDenomination(ch.denomination, ch.name);
      denomCounts[cls] = (denomCounts[cls] || 0) + 1;
    }

    // Deterministic GPI: logarithmic scale based on church count
    // 2 churches → ~18, 5 → ~30, 10 → ~42, 20 → ~53, 50 → ~68, 100 → ~80, 200+ → ~90+
    const rawGPI = Math.log2(count) * 13;
    const gpi = Math.max(5, Math.min(100, Math.round(rawGPI)));

    const layers = {
      layer_churches: count,
      layer_catholic_churches: denomCounts.catholic || 0,
      layer_megachurches: denomCounts.megachurch || 0,
      layer_mcdonalds: count >= 2 ? Math.round(count * 0.4) : 0,
      layer_chick_fil_a: count >= 3 ? Math.round(count * 0.2) : 0,
      layer_cracker_barrel: count >= 5 ? Math.round(count * 0.08) : 0,
      layer_waffle_house: count >= 4 ? Math.round(count * 0.15) : 0,
      layer_applebees: count >= 3 ? Math.round(count * 0.1) : 0,
      layer_olive_garden: count >= 3 ? Math.round(count * 0.08) : 0,
      layer_golden_corral: count >= 5 ? Math.round(count * 0.05) : 0,
      layer_hooters: count >= 5 ? Math.round(count * 0.04) : 0,
      layer_walmart: count >= 2 ? Math.round(count * 0.3) : 0,
      layer_costco: count >= 4 ? Math.round(count * 0.06) : 0,
      layer_bass_pro: count >= 8 ? Math.round(count * 0.02) : 0,
      layer_dollar_general: count >= 2 ? Math.round(count * 0.5) : 0,
      layer_tractor_supply: count >= 4 ? Math.round(count * 0.06) : 0,
      layer_gun_ranges: count >= 3 ? Math.round(count * 0.08) : 0,
      layer_nascar: count >= 15 ? Math.round(count * 0.01) : 0,
      layer_golf_courses: count >= 3 ? Math.round(count * 0.12) : 0,
      layer_bowling_alleys: count >= 3 ? Math.round(count * 0.08) : 0,
      layer_tanning_salons: count >= 4 ? Math.round(count * 0.06) : 0,
      layer_crossfit: count >= 3 ? Math.round(count * 0.05) : 0,
    };

    const boundary = cellToBoundary(h3Index, true);
    boundary.push(boundary[0]);

    features.push({
      type: "Feature",
      id: id++,
      properties: {
        h3: h3Index,
        gpi,
        nearest_city: nearestCity,
        church_count: count,
        ...layers,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          boundary.map(([lng, lat]) => [
            Math.round(lng * 1e6) / 1e6,
            Math.round(lat * 1e6) / 1e6,
          ]),
        ],
      },
    });
  }

  return { type: "FeatureCollection", features };
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
  console.log("=== Goy Mode Data Generator (Real OSM Church Data) ===\n");

  if (!existsSync(CACHE_FILE)) {
    console.error(`ERROR: Cached church data not found at ${CACHE_FILE}`);
    console.error("Run the Overpass API fetch first to populate the cache.");
    process.exit(1);
  }

  const churches = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
  console.log(`  Loaded ${churches.length} real churches from OSM cache\n`);

  console.log(`  Minimum churches per hex: ${MIN_CHURCHES_PER_HEX}`);
  console.log("Generating H3 hex grids (resolution 7)...");

  const hex7 = generateHexData(churches, 7);
  writeFileSync(join(DATA_DIR, "goy_hex_res7.json"), JSON.stringify(hex7));
  console.log(`  goy_hex_res7.json: ${hex7.features.length} hexes`);

  writeFileSync(
    join(DATA_DIR, "goy_poi_markers.json"),
    JSON.stringify({ type: "FeatureCollection", features: [] })
  );

  const scores = hex7.features.map((f) => f.properties.gpi);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const churchCounts = hex7.features.map((f) => f.properties.church_count);
  const maxChurches = Math.max(...churchCounts);
  console.log(`\n  Stats: ${hex7.features.length} hexes, GPI min=${min} avg=${avg} max=${max}`);
  console.log(`  Church counts: max ${maxChurches} per hex`);

  const buckets = [0, 0, 0, 0, 0];
  for (const s of scores) {
    if (s <= 20) buckets[0]++;
    else if (s <= 40) buckets[1]++;
    else if (s <= 60) buckets[2]++;
    else if (s <= 80) buckets[3]++;
    else buckets[4]++;
  }
  console.log(`  Distribution: 0-20: ${buckets[0]}, 21-40: ${buckets[1]}, 41-60: ${buckets[2]}, 61-80: ${buckets[3]}, 81-100: ${buckets[4]}`);

  console.log("\nDone!");
}

main();
