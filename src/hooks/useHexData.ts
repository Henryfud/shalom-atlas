"use client";

import { useState, useEffect } from "react";
import type { FeatureCollection, Polygon } from "geojson";
import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";

const cache: Record<string, FeatureCollection<Polygon>> = {};

export function useHexData(resolution: 7 | 8) {
  const mode = useAppStore((s) => s.mode);
  const prefix = MODE_CONFIGS[mode].hexDataPrefix;
  const key = `${prefix}${resolution}`;

  const [data, setData] = useState<FeatureCollection<Polygon> | null>(
    cache[key] ?? null
  );
  const [loading, setLoading] = useState(!cache[key]);

  useEffect(() => {
    if (cache[key]) {
      setData(cache[key]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/data/${key}.json`)
      .then((res) => res.json())
      .then((json) => {
        cache[key] = json;
        setData(json);
      })
      .catch((err) => console.error("Failed to load hex data:", err))
      .finally(() => setLoading(false));
  }, [key]);

  return { data, loading };
}
