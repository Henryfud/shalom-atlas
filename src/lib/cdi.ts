import { FILTERS } from "@/data/filters";

export const CDI_WEIGHTS: Record<string, number> = Object.fromEntries(
  FILTERS.filter((f) => f.weight > 0).map((f) => [f.id, f.weight])
);

export function calculateCDI(layers: Record<string, number>): number {
  let score = 0;
  for (const [key, count] of Object.entries(layers)) {
    const weight = CDI_WEIGHTS[key] ?? 0;
    score += count * weight;
  }
  return score;
}
