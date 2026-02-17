import { create } from "zustand";
import type { AppMode, ViewState, Profile } from "@/types";
import { MODE_CONFIGS } from "@/lib/mode-config";

const filtersForMode = (mode: AppMode) =>
  Object.fromEntries(MODE_CONFIGS[mode].filters.map((f) => [f.id, true]));

interface AppStore {
  // Mode
  mode: AppMode;
  toggleMode: () => void;

  // View
  viewState: ViewState;
  setViewState: (vs: Partial<ViewState>) => void;

  // Hex grid
  hexResolution: 7 | 8;
  setHexResolution: (res: 7 | 8) => void;
  showCDI: boolean;
  toggleCDI: () => void;

  // Filters
  filterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  closeFilterPanel: () => void;
  activeFilters: Record<string, boolean>;
  toggleFilter: (id: string) => void;
  setAllFilters: (enabled: boolean) => void;

  // Auth
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  profile: Profile | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser: (user: any | null) => void;
  setProfile: (profile: Profile | null) => void;

  // Modals
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Mode
  mode: "jewish",
  toggleMode: () =>
    set((s) => {
      const newMode = s.mode === "jewish" ? "goy" : "jewish";
      return {
        mode: newMode,
        activeFilters: filtersForMode(newMode),
      };
    }),

  // View
  viewState: { longitude: -95.7, latitude: 38.5, zoom: 4.2 },
  setViewState: (vs) =>
    set((s) => ({ viewState: { ...s.viewState, ...vs } })),

  // Hex grid
  hexResolution: 7,
  setHexResolution: (res) => set({ hexResolution: res }),
  showCDI: true,
  toggleCDI: () => set((s) => ({ showCDI: !s.showCDI })),

  // Filters
  filterPanelOpen: false,
  toggleFilterPanel: () =>
    set((s) => ({ filterPanelOpen: !s.filterPanelOpen })),
  closeFilterPanel: () => set({ filterPanelOpen: false }),
  activeFilters: filtersForMode("jewish"),
  toggleFilter: (id) =>
    set((s) => ({
      activeFilters: {
        ...s.activeFilters,
        [id]: !s.activeFilters[id],
      },
    })),
  setAllFilters: (enabled) =>
    set((s) => ({
      activeFilters: Object.fromEntries(
        MODE_CONFIGS[s.mode].filters.map((f) => [f.id, enabled])
      ),
    })),

  // Auth
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  // Modals
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  isWalletModalOpen: false,
  openWalletModal: () => set({ isWalletModalOpen: true }),
  closeWalletModal: () => set({ isWalletModalOpen: false }),
}));
