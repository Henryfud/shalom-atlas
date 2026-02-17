export type AppMode = "jewish" | "goy";

/* ── Auth & Voting ── */

export interface Profile {
  id: string;
  username: string;
  wallet_address: string | null;
  trust_level: number;
  created_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  hex_id: string;
  mode: AppMode;
  vote_value: number;
  period_id: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  trust_level: number;
  wallet_address: string | null;
  total_votes: number;
  total_points: number;
  points_this_week: number;
  points_this_month: number;
}

export interface HexCell {
  h3Index: string;
  cdiScore: number;
  layers: Record<string, number>;
}

export interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address?: string;
}

export interface FilterDef {
  id: string;
  label: string;
  color: string;
  weight: number;
  group: FilterGroup;
  icon?: string;
  count?: number;
}

export type FilterGroup =
  | "religious"
  | "education"
  | "food"
  | "community"
  | "demographic"
  | "infrastructure"
  | "goy_food"
  | "goy_retail"
  | "goy_religion"
  | "goy_recreation"
  | "goy_services";

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface ModeConfig {
  label: string;
  icon: string;
  densityProperty: string;
  densityLabel: string;
  hexDataPrefix: string;
  poiDataPath: string;
  accentColor: string;
  tiers: { min: number; max: number; label: string; score: number }[];
  colorStops: [number, [number, number, number]][];
  filters: FilterDef[];
  filterGroups: Record<string, string>;
}
