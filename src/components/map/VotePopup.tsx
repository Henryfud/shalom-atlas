"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store";
import { MODE_CONFIGS } from "@/lib/mode-config";
import { scoreToColor } from "@/lib/colors";
import { useVoting } from "@/hooks/useVoting";

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

interface VotePopupProps {
  feature: GeoJSON.Feature;
  x: number;
  y: number;
  onClose: () => void;
}

export default function VotePopup({ feature, x, y, onClose }: VotePopupProps) {
  const mode = useAppStore((s) => s.mode);
  const user = useAppStore((s) => s.user);
  const openAuthModal = useAppStore((s) => s.openAuthModal);
  const config = MODE_CONFIGS[mode];
  const layerLabels = mode === "jewish" ? JEWISH_LAYER_LABELS : GOY_LAYER_LABELS;

  const { submitVote, checkExistingVote, existingVote, loading } = useVoting();

  const props = feature.properties!;
  const score = props[config.densityProperty];
  const hexId = props.h3Index ?? props.h3_index ?? String(feature.id);
  const { nearest_city } = props;
  const color = scoreToColor(score, config.colorStops);
  const scoreLabel = mode === "jewish" ? "CDI Score" : "GPI Score";

  const layers = Object.entries(props)
    .filter(([key, val]) => key.startsWith("layer_") && (val as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 6);

  useEffect(() => {
    checkExistingVote(hexId, mode);
  }, [hexId, mode, checkExistingVote]);

  const handleVote = async (value: number) => {
    await submitVote(hexId, mode, value);
  };

  // Clamp position to viewport
  const left = Math.min(x + 12, window.innerWidth - 320);
  const top = Math.min(y - 12, window.innerHeight - 400);

  return (
    <>
      {/* Click-away backdrop */}
      <div className="fixed inset-0 z-[499]" onClick={onClose} />

      <div
        className="fixed z-[500] min-w-[240px] max-w-[300px]"
        style={{ left, top }}
      >
        <div className="bg-bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            {nearest_city && (
              <p className="text-xs text-text-muted">{nearest_city}</p>
            )}
            <button
              onClick={onClose}
              className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-text-primary shrink-0 ml-2"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Score */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-display font-bold" style={{ color }}>
              {score}
            </span>
            <span className="text-xs text-text-muted">{scoreLabel}</span>
          </div>

          {/* Layers */}
          {layers.length > 0 && (
            <div className="border-t border-border pt-2 space-y-1 mb-3">
              {layers.map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-text-secondary">{layerLabels[key] ?? key}</span>
                  <span className="text-text-primary font-medium">{val as number}</span>
                </div>
              ))}
            </div>
          )}

          {/* Voting section */}
          <div className="border-t border-border pt-2.5">
            {user ? (
              existingVote !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted bg-bg-card rounded-full px-2.5 py-1 border border-border">
                    Voted this period
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-text-muted font-semibold">Is this score accurate?</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleVote(1)}
                      disabled={loading}
                      className="flex-1 py-1.5 rounded-md text-[10px] font-bold bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                    >
                      Accurate
                    </button>
                    <button
                      onClick={() => handleVote(-1)}
                      disabled={loading}
                      className="flex-1 py-1.5 rounded-md text-[10px] font-bold bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors disabled:opacity-50"
                    >
                      Too High
                    </button>
                    <button
                      onClick={() => handleVote(2)}
                      disabled={loading}
                      className="flex-1 py-1.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
                    >
                      Too Low
                    </button>
                  </div>
                </div>
              )
            ) : (
              <button
                onClick={() => { openAuthModal(); onClose(); }}
                className="w-full py-1.5 rounded-md text-[10px] font-bold text-accent-gold bg-accent-gold/10 hover:bg-accent-gold/20 transition-colors"
              >
                Login to vote on this area
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
