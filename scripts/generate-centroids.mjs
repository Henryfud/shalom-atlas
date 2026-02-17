#!/usr/bin/env node
/**
 * Extract centroid points from hex GeoJSON for glow/heatmap layers.
 * These are lightweight point files (~1-5MB) used for the national zoom visualization.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

function extractCentroids(inputFile, outputFile, densityProp) {
  const data = JSON.parse(readFileSync(join(DATA_DIR, inputFile), "utf8"));

  const features = data.features.map((f) => {
    const ring = f.geometry.coordinates[0];
    const len = ring.length - 1; // Exclude closing duplicate
    let lngSum = 0, latSum = 0;
    for (let i = 0; i < len; i++) {
      lngSum += ring[i][0];
      latSum += ring[i][1];
    }

    // Keep only the density score + nearest_city for tooltip/heatmap weight
    const props = { [densityProp]: f.properties[densityProp] };
    if (f.properties.nearest_city) props.nearest_city = f.properties.nearest_city;

    return {
      type: "Feature",
      properties: props,
      geometry: {
        type: "Point",
        coordinates: [
          Math.round((lngSum / len) * 1e6) / 1e6,
          Math.round((latSum / len) * 1e6) / 1e6,
        ],
      },
    };
  });

  const collection = { type: "FeatureCollection", features };
  writeFileSync(join(DATA_DIR, outputFile), JSON.stringify(collection));
  console.log(`  ${outputFile}: ${features.length} centroids`);
}

console.log("Generating centroid files...");
extractCentroids("hex_res7.json", "jewish_centroids.json", "cdi");
extractCentroids("goy_hex_res7.json", "goy_centroids.json", "gpi");
console.log("Done!");
