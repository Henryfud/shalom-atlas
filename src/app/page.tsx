"use client";

import dynamic from "next/dynamic";
import ControlBar from "@/components/ui/ControlBar";
import FiltersPanel from "@/components/ui/FiltersPanel";
import Legend from "@/components/ui/Legend";
import WelcomeModal from "@/components/ui/WelcomeModal";
import RequestDataSection from "@/components/ui/RequestDataSection";
import Navbar from "@/components/ui/Navbar";
import AuthModal from "@/components/ui/AuthModal";
import SupportBanner from "@/components/ui/SupportBanner";
import WalletModal from "@/components/ui/WalletModal";
import ModeAttributeSync from "@/components/ModeAttributeSync";

const MapContainer = dynamic(
  () => import("@/components/map/MapContainer"),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main>
      <ModeAttributeSync />
      <Navbar />
      <SupportBanner />
      {/* Map section — full viewport height */}
      <div className="relative h-screen">
        <MapContainer />
        <ControlBar />
        <FiltersPanel />
        <Legend />
        <WelcomeModal />
      </div>

      {/* Request Data — below the map, in normal page flow */}
      <RequestDataSection />

      {/* Modals */}
      <AuthModal />
      <WalletModal />
    </main>
  );
}
