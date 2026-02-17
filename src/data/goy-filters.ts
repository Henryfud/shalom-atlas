import type { FilterDef } from "@/types";

export const GOY_FILTERS: FilterDef[] = [
  // Goy Slop
  { id: "mcdonalds", label: "McDonald's", color: "#dc2626", weight: 1.3, group: "goy_food", icon: "🍔" },
  { id: "chick_fil_a", label: "Chick-fil-A", color: "#ef4444", weight: 1.2, group: "goy_food", icon: "🐔" },
  { id: "cracker_barrel", label: "Cracker Barrel", color: "#f87171", weight: 1.0, group: "goy_food", icon: "🪵" },
  { id: "waffle_house", label: "Waffle House", color: "#fbbf24", weight: 1.2, group: "goy_food", icon: "🧇" },
  { id: "applebees", label: "Applebee's", color: "#f59e0b", weight: 1.0, group: "goy_food", icon: "🍎" },
  { id: "olive_garden", label: "Olive Garden", color: "#84cc16", weight: 1.0, group: "goy_food", icon: "🫒" },
  { id: "golden_corral", label: "Golden Corral", color: "#eab308", weight: 1.0, group: "goy_food", icon: "🐂" },
  { id: "hooters", label: "Hooters", color: "#f97316", weight: 0.8, group: "goy_food", icon: "🦉" },

  // Retail
  { id: "walmart", label: "Walmart", color: "#3b82f6", weight: 1.5, group: "goy_retail", icon: "🏪" },
  { id: "costco", label: "Costco", color: "#6366f1", weight: 1.2, group: "goy_retail", icon: "🛒" },
  { id: "bass_pro", label: "Bass Pro Shops", color: "#22c55e", weight: 1.0, group: "goy_retail", icon: "🎣" },
  { id: "dollar_general", label: "Dollar General", color: "#eab308", weight: 1.3, group: "goy_retail", icon: "💵" },
  { id: "tractor_supply", label: "Tractor Supply", color: "#a855f7", weight: 1.0, group: "goy_retail", icon: "🚜" },

  // Religion
  { id: "churches", label: "Churches", color: "#f472b6", weight: 2.5, group: "goy_religion", icon: "⛪" },
  { id: "megachurches", label: "Megachurches", color: "#ec4899", weight: 2.0, group: "goy_religion", icon: "🏟" },
  { id: "catholic_churches", label: "Catholic Churches", color: "#a855f7", weight: 1.5, group: "goy_religion", icon: "✝️" },

  // Recreation
  { id: "gun_ranges", label: "Gun Ranges", color: "#ef4444", weight: 1.5, group: "goy_recreation", icon: "🎯" },
  { id: "nascar", label: "NASCAR / Speedways", color: "#f97316", weight: 1.0, group: "goy_recreation", icon: "🏎" },
  { id: "golf_courses", label: "Golf Courses", color: "#22c55e", weight: 0.8, group: "goy_recreation", icon: "⛳" },
  { id: "bowling_alleys", label: "Bowling Alleys", color: "#06b6d4", weight: 0.8, group: "goy_recreation", icon: "🎳" },

  // Services
  { id: "tanning_salons", label: "Tanning Salons", color: "#f59e0b", weight: 1.0, group: "goy_services", icon: "☀️" },
  { id: "crossfit", label: "CrossFit Gyms", color: "#ef4444", weight: 0.8, group: "goy_services", icon: "🏋️" },
];

export const GOY_FILTER_GROUPS: Record<string, string> = {
  goy_food: "Goy Slop",
  goy_retail: "Retail",
  goy_religion: "Religion",
  goy_recreation: "Recreation",
  goy_services: "Services",
};
