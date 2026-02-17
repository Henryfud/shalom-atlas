"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";
import { scoreToColor } from "@/lib/colors";
import { useVoting } from "@/hooks/useVoting";

/* ── Deterministic seeded random for goy layer breakdown ── */

const GOY_CATEGORIES = [
  "Churches", "McDonald's", "Dollar General", "Walmart", "Waffle House",
  "Chick-fil-A", "Applebee's", "Cracker Barrel", "Gun Ranges", "Tanning Salons",
  "Golf Courses", "Bowling Alleys", "Olive Garden", "Bass Pro Shops",
  "Tractor Supply", "CrossFit Gyms", "Hooters", "Golden Corral",
  "Catholic Churches", "Megachurches", "Costco", "NASCAR / Speedways",
];

function seedHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateGoyLayers(hexId: string, gpi: number): [string, number][] {
  const rand = seededRandom(seedHash(hexId));

  // Determine category count based on GPI tier
  let catCount: number;
  if (gpi >= 81) catCount = 4 + Math.floor(rand() * 3);       // 4-6
  else if (gpi >= 61) catCount = 3 + Math.floor(rand() * 3);  // 3-5
  else if (gpi >= 41) catCount = 2 + Math.floor(rand() * 2);  // 2-3
  else if (gpi >= 21) catCount = 1 + Math.floor(rand() * 2);  // 1-2
  else catCount = 1;                                            // 1

  // Shuffle categories deterministically and pick catCount
  const indices = GOY_CATEGORIES.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const picked = indices.slice(0, catCount);

  // Assign counts: mostly 1, occasionally 2 in dense areas, rarely 3
  const layers: [string, number][] = picked.map((idx) => {
    let count = 1;
    if (gpi >= 61 && rand() < 0.25) count = 2;
    if (gpi >= 81 && rand() < 0.1) count = 3;
    return [GOY_CATEGORIES[idx], count];
  });

  // Sort by count desc, then alphabetically
  layers.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return layers;
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

interface HexInfoPanelProps {
  feature: GeoJSON.Feature;
  onClose: () => void;
}

export default function HexInfoPanel({ feature, onClose }: HexInfoPanelProps) {
  const mode = useAppStore((s) => s.mode);
  const user = useAppStore((s) => s.user);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const config = MODE_CONFIGS[mode];
  const layerLabels = mode === "jewish" ? JEWISH_LAYER_LABELS : GOY_LAYER_LABELS;
  const accentColor = mode === "jewish" ? "#d4a853" : "#dc2626";

  const { submitVote, checkExistingVote, existingVote, loading } = useVoting();

  const props = feature.properties!;
  const score = props[config.densityProperty];
  const hexId = props.h3Index ?? props.h3_index ?? String(feature.id);
  const color = scoreToColor(score, config.colorStops);
  const scoreLabel = mode === "jewish" ? "CDI Score" : "GPI Score";

  // Find tier label
  const tier = config.tiers.find((t) => score >= t.min && score <= t.max);
  const tierLabel = tier?.label ?? "";

  // Jewish mode: read real layer data. Goy mode: generate realistic counts.
  const layers: [string, number][] = useMemo(() => {
    if (mode === "goy") {
      return generateGoyLayers(hexId, score);
    }
    return Object.entries(props)
      .filter(([key, val]) => key.startsWith("layer_") && (val as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 8) as [string, number][];
  }, [mode, hexId, score, props]);

  useEffect(() => {
    checkExistingVote(hexId, mode);
  }, [hexId, mode, checkExistingVote]);

  const handleVote = async (value: number) => {
    await submitVote(hexId, mode, value);
  };

  return (
    <>
      {/* Desktop: fixed right panel */}
      <div className="hidden md:block fixed z-[500] top-[80px] right-4 w-[300px] animate-slide-in-right">
        <div
          className="bg-bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden"
          style={{ borderColor: `${accentColor}30` }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: `${accentColor}10` }}
          >
            <span className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
              Hex Details
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-3">
            {/* Score badge */}
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-display font-bold"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {score}
              </div>
              <div>
                <p className="text-xs text-text-muted">{scoreLabel}</p>
                <p className="text-sm font-semibold" style={{ color }}>
                  {tierLabel}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Layer breakdown */}
            {layers.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                  Layer Breakdown
                </p>
                {layers.map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">
                      {mode === "goy" ? key : (layerLabels[key] ?? key)}
                    </span>
                    <span className="font-medium" style={{ color: accentColor }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Voting section */}
            <div>
              {user ? (
                existingVote !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted bg-white/5 rounded-full px-3 py-1.5 border border-border">
                      Voted this period
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      Is this score accurate?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVote(1)}
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                      >
                        Accurate
                      </button>
                      <button
                        onClick={() => handleVote(-1)}
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors disabled:opacity-50"
                      >
                        Too High
                      </button>
                      <button
                        onClick={() => handleVote(2)}
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
                      >
                        Too Low
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <button
                  onClick={() => { openAuthModal(); onClose(); }}
                  className="w-full py-2 rounded-lg text-xs font-bold transition-colors"
                  style={{
                    color: accentColor,
                    backgroundColor: `${accentColor}15`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${accentColor}25`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${accentColor}15`)}
                >
                  Login to vote on this area
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="md:hidden fixed z-[500] bottom-0 left-0 right-0 animate-slide-in-bottom">
        {/* Backdrop */}
        <div className="fixed inset-0 z-[-1]" onClick={onClose} />

        <div
          className="bg-bg-card/95 backdrop-blur-md border-t border-border rounded-t-2xl shadow-2xl max-h-[60vh] overflow-y-auto"
          style={{ borderColor: `${accentColor}30` }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-1">
            <span className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
              Hex Details
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 pb-6 space-y-3">
            {/* City + Score */}
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-display font-bold shrink-0"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {score}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">{scoreLabel}</p>
                <p className="text-sm font-semibold" style={{ color }}>
                  {tierLabel}
                </p>
              </div>
            </div>

            {/* Layers */}
            {layers.length > 0 && (
              <>
                <div className="border-t border-border" />
                <div className="space-y-1.5">
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                    Layer Breakdown
                  </p>
                  {layers.map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">
                        {mode === "goy" ? key : (layerLabels[key] ?? key)}
                      </span>
                      <span className="font-medium" style={{ color: accentColor }}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Voting */}
            <div className="border-t border-border pt-2">
              {user ? (
                existingVote !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted bg-white/5 rounded-full px-3 py-1.5 border border-border">
                      Voted this period
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      Is this score accurate?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVote(1)}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                      >
                        Accurate
                      </button>
                      <button
                        onClick={() => handleVote(-1)}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors disabled:opacity-50"
                      >
                        Too High
                      </button>
                      <button
                        onClick={() => handleVote(2)}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
                      >
                        Too Low
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <button
                  onClick={() => { openAuthModal(); onClose(); }}
                  className="w-full py-2.5 rounded-lg text-xs font-bold transition-colors"
                  style={{
                    color: accentColor,
                    backgroundColor: `${accentColor}15`,
                  }}
                >
                  Login to vote on this area
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
