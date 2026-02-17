"use client";

import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";
import { scoreToColor } from "@/lib/colors";

interface HexTooltipProps {
  feature: GeoJSON.Feature | null;
  x: number;
  y: number;
}

const JEWISH_LAYER_LABELS: Record<string, string> = {
  layer_synagogues: "Synagogues",
  layer_chabad: "Chabad",
  layer_mikvahs: "Mikvahs",
  layer_day_schools: "Day Schools",
  layer_hillel: "Hillel",
  layer_hebrew_schools: "Hebrew Schools",
  layer_kosher_restaurants: "Kosher Restaurants",
  layer_kosher_delis: "Kosher Delis",
  layer_kosher_bakeries: "Kosher Bakeries",
  layer_judaica: "Judaica Shops",
  layer_jccs: "JCCs",
  layer_federations: "Federations",
  layer_jewish_family_services: "Family Services",
  layer_jewish_museums: "Museums",
};

const GOY_LAYER_LABELS: Record<string, string> = {
  layer_mcdonalds: "McDonald's",
  layer_chick_fil_a: "Chick-fil-A",
  layer_cracker_barrel: "Cracker Barrel",
  layer_waffle_house: "Waffle House",
  layer_applebees: "Applebee's",
  layer_olive_garden: "Olive Garden",
  layer_golden_corral: "Golden Corral",
  layer_hooters: "Hooters",
  layer_walmart: "Walmart",
  layer_costco: "Costco",
  layer_bass_pro: "Bass Pro Shops",
  layer_dollar_general: "Dollar General",
  layer_tractor_supply: "Tractor Supply",
  layer_churches: "Churches",
  layer_megachurches: "Megachurches",
  layer_catholic_churches: "Catholic Churches",
  layer_gun_ranges: "Gun Ranges",
  layer_nascar: "NASCAR / Speedways",
  layer_golf_courses: "Golf Courses",
  layer_bowling_alleys: "Bowling Alleys",
  layer_tanning_salons: "Tanning Salons",
  layer_crossfit: "CrossFit Gyms",
};

export default function HexTooltip({ feature, x, y }: HexTooltipProps) {
  const mode = useAppStore((s) => s.mode);
  const config = MODE_CONFIGS[mode];
  const layerLabels = mode === "jewish" ? JEWISH_LAYER_LABELS : GOY_LAYER_LABELS;

  if (!feature?.properties) return null;

  const score = feature.properties[config.densityProperty];
  const { nearest_city } = feature.properties;
  const color = scoreToColor(score, config.colorStops);
  const scoreLabel = mode === "jewish" ? "CDI Score" : "GPI Score";

  // Get non-zero layer counts
  const layers = Object.entries(feature.properties)
    .filter(([key, val]) => key.startsWith("layer_") && (val as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 6);

  return (
    <div
      className="pointer-events-none fixed z-[500] min-w-[200px] max-w-[280px]"
      style={{
        left: x + 12,
        top: y - 12,
      }}
    >
      <div className="bg-bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
        {nearest_city && (
          <p className="text-xs text-text-muted mb-1">{nearest_city}</p>
        )}
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className="text-2xl font-display font-bold"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-text-muted">{scoreLabel}</span>
        </div>
        {layers.length > 0 && (
          <div className="border-t border-border pt-2 space-y-1">
            {layers.map(([key, val]) => (
              <div
                key={key}
                className="flex justify-between text-xs"
              >
                <span className="text-text-secondary">
                  {layerLabels[key] ?? key}
                </span>
                <span className="text-text-primary font-medium">
                  {val as number}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
