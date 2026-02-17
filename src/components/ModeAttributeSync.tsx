"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store";

export default function ModeAttributeSync() {
  const mode = useAppStore((s) => s.mode);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  return null;
}
