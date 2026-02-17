#!/bin/bash
# Build PMTiles vector tiles from hex GeoJSON data
set -e

DATA_DIR="$(dirname "$0")/../public/data"

echo "Building Jewish hex tiles..."
tippecanoe \
  -o "$DATA_DIR/jewish_hex.pmtiles" \
  -Z3 -z14 \
  --no-feature-limit --no-tile-size-limit --no-tile-compression \
  -l jewish-hex \
  --coalesce-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --force \
  "$DATA_DIR/hex_res7.json"

echo "Building Goy hex tiles..."
tippecanoe \
  -o "$DATA_DIR/goy_hex.pmtiles" \
  -Z3 -z14 \
  --no-feature-limit --no-tile-size-limit \
  -l goy-hex \
  --coalesce-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --force \
  -y gpi -y nearest_city -y church_count \
  -y layer_churches -y layer_catholic_churches -y layer_megachurches \
  -y layer_mcdonalds -y layer_chick_fil_a -y layer_walmart -y layer_dollar_general \
  "$DATA_DIR/goy_hex_res7.json"

echo "Done! Files:"
ls -lh "$DATA_DIR"/*.pmtiles
