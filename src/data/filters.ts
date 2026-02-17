import type { FilterDef } from "@/types";

export const FILTERS: FilterDef[] = [
  // Religious Institutions
  {
    id: "synagogues",
    label: "Synagogues & Temples",
    color: "#4a7cff",
    weight: 2.5,
    group: "religious",
  },
  {
    id: "chabad",
    label: "Chabad Houses",
    color: "#6366f1",
    weight: 2.0,
    group: "religious",
  },
  {
    id: "mikvahs",
    label: "Mikvahs",
    color: "#818cf8",
    weight: 2.0,
    group: "religious",
  },

  // Education
  {
    id: "day_schools",
    label: "Day Schools & Yeshivas",
    color: "#f59e0b",
    weight: 1.8,
    group: "education",
  },
  {
    id: "hillel",
    label: "Hillel Centers",
    color: "#fbbf24",
    weight: 1.5,
    group: "education",
  },
  {
    id: "hebrew_schools",
    label: "Hebrew Schools",
    color: "#f97316",
    weight: 1.5,
    group: "education",
  },

  // Food & Commerce
  {
    id: "kosher_restaurants",
    label: "Kosher Restaurants",
    color: "#10b981",
    weight: 1.3,
    group: "food",
  },
  {
    id: "kosher_delis",
    label: "Kosher Markets & Delis",
    color: "#34d399",
    weight: 1.2,
    group: "food",
  },
  {
    id: "kosher_bakeries",
    label: "Kosher Bakeries",
    color: "#6ee7b7",
    weight: 1.0,
    group: "food",
  },
  {
    id: "judaica",
    label: "Judaica & Book Shops",
    color: "#14b8a6",
    weight: 1.0,
    group: "food",
  },

  // Community Organizations
  {
    id: "jccs",
    label: "Jewish Community Centers",
    color: "#ec4899",
    weight: 1.2,
    group: "community",
  },
  {
    id: "federations",
    label: "Jewish Federations",
    color: "#f472b6",
    weight: 1.0,
    group: "community",
  },
  {
    id: "jewish_family_services",
    label: "Jewish Family Services",
    color: "#fb7185",
    weight: 1.0,
    group: "community",
  },
  {
    id: "jewish_museums",
    label: "Jewish Museums",
    color: "#e879f9",
    weight: 0.8,
    group: "community",
  },

  // Infrastructure (no weight — display only)
  {
    id: "nyc_tunnels",
    label: "NYC Underground Tunnels",
    color: "#d4a853",
    weight: 0,
    group: "infrastructure",
  },

  // Demographic overlays (no weight — display only)
  {
    id: "population_density",
    label: "Population Estimate",
    color: "#d4a853",
    weight: 0,
    group: "demographic",
  },
  {
    id: "median_home_price",
    label: "Median Home Price",
    color: "#94a3b8",
    weight: 0,
    group: "demographic",
  },
];

export const FILTER_GROUPS: Record<string, string> = {
  religious: "Religious Institutions",
  education: "Education",
  food: "Food & Commerce",
  community: "Community Organizations",
  infrastructure: "Infrastructure",
  demographic: "Demographic Overlays",
};
