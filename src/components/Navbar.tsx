import { useState, useEffect } from "react";
import {
  BookOpen,
  Scale,
  Users,
  Coins,
  ShieldCheck,
  Search,
  Sparkles,
  MapPin,
  Clock,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import { PillarType } from "../types";

interface NavbarProps {
  activePillar: PillarType;
  setActivePillar?: (pillar: PillarType) => void;
  onSelectPillar?: (pillar: PillarType) => void;
  onOpenZiswafModal?: () => void;
  onOpenFiqhModal?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function Navbar({
  activePillar,
  setActivePillar,
  onSelectPillar,
  onOpenZiswafModal,
  onOpenFiqhModal,
  searchQuery = "",
  setSearchQuery = () => {},
}: NavbarProps) {
  const setPillar = onSelectPillar || setActivePillar || (() => {});
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: "berdakwah" as PillarType,
      label: "Berdakwah",
      subLabel: "Dzikir, Hadits & Kajian",
      icon: BookOpen,
      color: "emerald",
    },
    {
      id: "bersyariah" as PillarType,
      label: "Bersyariah",
      subLabel: "AI Fiqh & Compliance",
      icon: Scale,
      color: "blue",
    },
    {
      id: "berjamaah" as PillarType,
      label: "Berjamaah",
      subLabel: "GIS Map & Events",
      icon: Users,
      color: "amber",
    },
    {
      id: "bermuamalah" as PillarType,
      label: "Bermuamalah",
      subLabel: "ZISWAF & Marketplace",
      icon: Coins,
      color: "teal",
    },
    {
      id: "control_plane" as PillarType,
      label: "Cloud Governance",
      subLabel: "Data Integrity & BI",
      icon: ShieldCheck,
      color: "indigo",
    },
  ];

  return (
    <header id="abdi-navbar" className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/60 text-white shadow-lg">
      {/* Top Banner: Local Domain & Realtime Indicators */}
      <div className="bg-emerald-900/80 px-4 py-1.5 text-xs border-b border-emerald-800/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-emerald-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            abdi.sematangborangcity.cloud
          </span>
          <span className="hidden sm:inline-block text-emerald-400/60">|</span>
          <span className="hidden sm:flex items-center gap-1 text-emerald-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Kec. Sematang Borang, Kota Palembang
          </span>
        </div>

        <div className="flex items-center gap-4 text-emerald-200">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{time || "Memuat..."}</span>
          </div>
          <span className="hidden md:inline-block bg-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded font-mono text-[11px] border border-emerald-700/50">
            1 Safar 1448 H
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Data Integrity: 100% Valid
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPillar("berdakwah")}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-inner border border-emerald-300/30">
            <span className="text-xl font-black tracking-tighter text-white">4B</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                ABDI Islamicity
              </h1>
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/40">
                4B KAFFAH
              </span>
            </div>
            <p className="text-xs text-emerald-300/80">
              Berdakwah • Bersyariah • Berjamaah • Bermuamalah
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-xs sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Cari dalil, fatwa, kajian, donasi, atau produk halal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-emerald-900/60 border border-emerald-700/60 rounded-lg text-sm text-white placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-300 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Action CTA Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="quick-fiqh-btn"
            onClick={onOpenFiqhModal || (() => setPillar("bersyariah"))}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm border border-blue-400/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
            <span>Tanya AI Fiqh</span>
          </button>
          <button
            id="quick-donasi-btn"
            onClick={onOpenZiswafModal || (() => setPillar("bermuamalah"))}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-md border border-amber-300/40"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-slate-950" />
            <span>Tunaikan ZISWAF</span>
          </button>
        </div>
      </div>

      {/* 4B Pillar Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none border-t border-emerald-900/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePillar === item.id;
            return (
              <button
                key={item.id}
                id={`tab-pillar-${item.id}`}
                onClick={() => setPillar(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-150 border-b-2 ${
                  isActive
                    ? "bg-emerald-900/90 text-white border-emerald-400 font-semibold shadow-sm"
                    : "text-emerald-300/80 hover:text-white hover:bg-emerald-900/40 border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-emerald-400/70"}`} />
                <div className="text-left">
                  <div>{item.label}</div>
                  <div className="text-[10px] font-normal text-emerald-400/80 hidden md:block">
                    {item.subLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
