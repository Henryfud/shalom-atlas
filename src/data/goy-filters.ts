import type { FilterDef } from "@/types";

export const GOY_FILTERS: FilterDef[] = [
  // Goy Slop
  { id: "mcdonalds", label: "McDonald's", color: "#dc2626", weight: 1.3, group: "goy_food" },
  { id: "chick_fil_a", label: "Chick-fil-A", color: "#ef4444", weight: 1.2, group: "goy_food" },
  { id: "cracker_barrel", label: "Cracker Barrel", color: "#f87171", weight: 1.0, group: "goy_food" },
  { id: "waffle_house", label: "Waffle House", color: "#fbbf24", weight: 1.2, group: "goy_food" },
  { id: "applebees", label: "Applebee's", color: "#f59e0b", weight: 1.0, group: "goy_food" },
  { id: "olive_garden", label: "Olive Garden", color: "#84cc16", weight: 1.0, group: "goy_food" },
  { id: "golden_corral", label: "Golden Corral", color: "#eab308", weight: 1.0, group: "goy_food" },
  { id: "hooters", label: "Hooters", color: "#f97316", weight: 0.8, group: "goy_food" },

  // Retail
  { id: "walmart", label: "Walmart", color: "#3b82f6", weight: 1.5, group: "goy_retail" },
  { id: "costco", label: "Costco", color: "#6366f1", weight: 1.2, group: "goy_retail" },
  { id: "bass_pro", label: "Bass Pro Shops", color: "#22c55e", weight: 1.0, group: "goy_retail" },
  { id: "dollar_general", label: "Dollar General", color: "#eab308", weight: 1.3, group: "goy_retail" },
  { id: "tractor_supply", label: "Tractor Supply", color: "#a855f7", weight: 1.0, group: "goy_retail" },

  // Religion
  { id: "churches", label: "Churches", color: "#f472b6", weight: 2.5, group: "goy_religion" },
  { id: "megachurches", label: "Megachurches", color: "#ec4899", weight: 2.0, group: "goy_religion" },
  { id: "catholic_churches", label: "Catholic Churches", color: "#a855f7", weight: 1.5, group: "goy_religion" },

  // Recreation
  { id: "gun_ranges", label: "Gun Ranges", color: "#ef4444", weight: 1.5, group: "goy_recreation" },
  { id: "nascar", label: "NASCAR / Speedways", color: "#f97316", weight: 1.0, group: "goy_recreation" },
  { id: "golf_courses", label: "Golf Courses", color: "#22c55e", weight: 0.8, group: "goy_recreation" },
  { id: "bowling_alleys", label: "Bowling Alleys", color: "#06b6d4", weight: 0.8, group: "goy_recreation" },

  // Services
  { id: "tanning_salons", label: "Tanning Salons", color: "#f59e0b", weight: 1.0, group: "goy_services" },
  { id: "crossfit", label: "CrossFit Gyms", color: "#ef4444", weight: 0.8, group: "goy_services" },
];

export const GOY_FILTER_GROUPS: Record<string, string> = {
  goy_food: "Goy Slop",
  goy_retail: "Retail",
  goy_religion: "Religion",
  goy_recreation: "Recreation",
  goy_services: "Services",
};
