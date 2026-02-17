import type { Feature, FeatureCollection, Polygon } from "geojson";

export function getResolutionForZoom(zoom: number): 7 | 8 {
  return zoom <= 8 ? 7 : 8;
}

export function hexFeatureCollection(
  features: Feature<Polygon>[]
): FeatureCollection<Polygon> {
  return {
    type: "FeatureCollection",
    features,
  };
}
