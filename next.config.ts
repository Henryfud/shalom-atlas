import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["maplibre-gl"],
  turbopack: {
    resolveAlias: {
      "maplibre-gl": "maplibre-gl/dist/maplibre-gl.js",
    },
  },
};

export default nextConfig;
