import { useState } from "react";
import Navbar from "./components/Navbar";
import PrayerTimeBanner from "./components/PrayerTimeBanner";
import BerdakwahModule from "./components/BerdakwahModule";
import BersyariahModule from "./components/BersyariahModule";
import BerjamaahModule from "./components/BerjamaahModule";
import BermuamalahModule from "./components/BermuamalahModule";
import CloudDataControlPlane from "./components/CloudDataControlPlane";
import { PillarType } from "./types";
import {
  Sparkles,
  ShieldCheck,
  Users,
  Coins,
  Server,
  Heart,
  BookOpen,
  MapPin,
  ExternalLink,
  Info,
} from "lucide-react";

export default function App() {
  const [activePillar, setActivePillar] = useState<PillarType>("berdakwah");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Application Header & Navigation */}
      <Navbar activePillar={activePillar} onSelectPillar={setActivePillar} />

      {/* Real-Time Prayer Times & Hadits Banner for Palembang / Sematang Borang */}
      <PrayerTimeBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dynamic Pillar Content */}
        {activePillar === "berdakwah" && <BerdakwahModule />}
        {activePillar === "bersyariah" && <BersyariahModule />}
        {activePillar === "berjamaah" && <BerjamaahModule />}
        {activePillar === "bermuamalah" && <BermuamalahModule />}
        {activePillar === "cloud_control" && <CloudDataControlPlane />}
      </main>

      {/* Footer & Ecosystem Attribution */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-white text-base">
                <span className="text-emerald-400 font-mono">abdi.sematangborangcity.cloud</span>
              </div>
              <p className="text-slate-400 max-w-xl">
                Aplikasi Berjamaah Dakwah Islamicity 4B Kaffah (Berdakwah, Bersyariah, Berjamaah, Bermuamalah) didukung Cloud Data Validation, Knowledge Catalog, dan Kecerdasan Buatan (AI/BI).
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActivePillar("berdakwah")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activePillar === "berdakwah"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                1. Berdakwah
              </button>
              <button
                onClick={() => setActivePillar("bersyariah")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activePillar === "bersyariah"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                2. Bersyariah
              </button>
              <button
                onClick={() => setActivePillar("berjamaah")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activePillar === "berjamaah"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                3. Berjamaah
              </button>
              <button
                onClick={() => setActivePillar("bermuamalah")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activePillar === "bermuamalah"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                4. Bermuamalah
              </button>
              <button
                onClick={() => setActivePillar("cloud_control")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activePillar === "cloud_control"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Cloud Governance
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 Inisiatif Ekosistem Digital Masjid & Jamaah Kecamatan Sematang Borang, Kota Palembang.
            </div>
            <div className="flex items-center gap-4">
              <span>Palembang UTC+7 (WIB)</span>
              <span>•</span>
              <span>Rujukan: DSN-MUI & Kemenag RI</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Bebas Riba & Gharar</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
