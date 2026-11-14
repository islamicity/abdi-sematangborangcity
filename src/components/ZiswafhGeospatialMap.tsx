import { useState, useMemo } from "react";
import {
  MapPin,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  HeartHandshake,
  ShieldCheck,
  Building2,
  PieChart,
  DollarSign,
  Activity,
  ArrowUpRight,
  Share2,
  Copy,
  Check,
  HelpCircle,
  Truck,
  Droplets,
  Store,
  Compass,
  Maximize2,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  PlusCircle,
  Clock,
  Info,
} from "lucide-react";
import { ZiswafhNeighborhoodZone, ZiswafhFilterCategory, ZiswafhBenefitDisbursement } from "../types";
import { ZISWAFH_NEIGHBORHOOD_ZONES, DISTRICT_ZISWAFH_STATS } from "../data/ziswafhGeospatialData";

export default function ZiswafhGeospatialMap() {
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Semua");
  const [selectedCategory, setSelectedCategory] = useState<ZiswafhFilterCategory>("ALL");
  const [activeMetric, setActiveMetric] = useState<"VALUE" | "COVERAGE" | "MUSTAHIQ" | "PRIORITY">("VALUE");
  const [selectedZone, setSelectedZone] = useState<ZiswafhNeighborhoodZone>(ZISWAFH_NEIGHBORHOOD_ZONES[0]);
  const [hoveredZone, setHoveredZone] = useState<ZiswafhNeighborhoodZone | null>(null);

  // SVG Layer Toggles
  const [showFlowLines, setShowFlowLines] = useState<boolean>(true);
  const [showMosquePins, setShowMosquePins] = useState<boolean>(true);
  const [showInfraPins, setShowInfraPins] = useState<boolean>(true);
  const [showHeatmapGlow, setShowHeatmapGlow] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);

  // Simulation & Copy Feedback
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [dispatchedFeedback, setDispatchedFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered Zones
  const filteredZones = useMemo(() => {
    return ZISWAFH_NEIGHBORHOOD_ZONES.filter((zone) => {
      const matchKelurahan = selectedKelurahan === "Semua" || zone.kelurahan === selectedKelurahan;
      const matchSearch =
        searchQuery === "" ||
        zone.neighborhoodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.masjidHub.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.kelurahan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchKelurahan && matchSearch;
    });
  }, [selectedKelurahan, searchQuery]);

  // Dynamic polygon fill color calculation
  const getZoneFillColor = (zone: ZiswafhNeighborhoodZone) => {
    const isSelected = selectedZone.id === zone.id;
    const isHovered = hoveredZone?.id === zone.id;

    if (activeMetric === "VALUE") {
      // Scale based on value (20M to 50M)
      const val = zone.totalBenefitValueDisbursed;
      if (val >= 40000000) return isSelected ? "#059669" : isHovered ? "#10b981" : "rgba(16, 185, 129, 0.45)";
      if (val >= 30000000) return isSelected ? "#0d9488" : isHovered ? "#14b8a6" : "rgba(20, 184, 166, 0.40)";
      if (val >= 25000000) return isSelected ? "#0284c7" : isHovered ? "#38bdf8" : "rgba(56, 189, 248, 0.35)";
      return isSelected ? "#d97706" : isHovered ? "#f59e0b" : "rgba(245, 158, 11, 0.35)";
    }

    if (activeMetric === "COVERAGE") {
      const cov = zone.disbursementCoveragePct;
      if (cov >= 92) return isSelected ? "#059669" : isHovered ? "#10b981" : "rgba(16, 185, 129, 0.50)";
      if (cov >= 85) return isSelected ? "#0d9488" : isHovered ? "#14b8a6" : "rgba(20, 184, 166, 0.40)";
      if (cov >= 80) return isSelected ? "#d97706" : isHovered ? "#f59e0b" : "rgba(245, 158, 11, 0.40)";
      return isSelected ? "#dc2626" : isHovered ? "#ef4444" : "rgba(239, 68, 68, 0.45)";
    }

    if (activeMetric === "MUSTAHIQ") {
      const mustahiq = zone.totalMustahiqKK;
      if (mustahiq >= 75) return isSelected ? "#7c3aed" : isHovered ? "#8b5cf6" : "rgba(139, 92, 246, 0.45)";
      if (mustahiq >= 60) return isSelected ? "#2563eb" : isHovered ? "#3b82f6" : "rgba(59, 130, 246, 0.40)";
      return isSelected ? "#0d9488" : isHovered ? "#14b8a6" : "rgba(20, 184, 166, 0.35)";
    }

    // PRIORITY
    switch (zone.distributionPriority) {
      case "OPTIMAL":
        return isSelected ? "#059669" : isHovered ? "#10b981" : "rgba(16, 185, 129, 0.45)";
      case "STABIL":
        return isSelected ? "#0284c7" : isHovered ? "#38bdf8" : "rgba(56, 189, 248, 0.40)";
      case "PERHATIAN":
        return isSelected ? "#d97706" : isHovered ? "#f59e0b" : "rgba(245, 158, 11, 0.40)";
      case "PRIORITAS_TINGGI":
        return isSelected ? "#dc2626" : isHovered ? "#ef4444" : "rgba(239, 68, 68, 0.45)";
      default:
        return "rgba(20, 184, 166, 0.35)";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "OPTIMAL":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "STABIL":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PERHATIAN":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "PRIORITAS_TINGGI":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const handleSimulateDispatch = () => {
    setDispatchedFeedback(
      `Alokasi darurat Rp 5.000.000 (Paket Sembako + Bantuan Medis) berhasil dikirimkan ke koordinasi DKM ${selectedZone.masjidHub}!`
    );
    setTimeout(() => {
      setDispatchedFeedback(null);
    }, 4500);
  };

  const copyGeospatialReport = () => {
    const text = `📍 RINGKASAN SEBARAN GEOSPASIAL MANFAAT ZISWAFH
Kecamatan Sematang Borang, Palembang
Periode: Real-time Agustus 2026

💰 Total Dana Tersalurkan: Rp ${DISTRICT_ZISWAFH_STATS.totalDisbursedValue.toLocaleString("id-ID")}
👥 Penerima Manfaat: ${DISTRICT_ZISWAFH_STATS.totalBeneficiaries.toLocaleString("id-ID")} Jiwa (${DISTRICT_ZISWAFH_STATS.totalMustahiqKK} KK Mustahiq)
📊 Rerata Cakupan Asnaf: ${DISTRICT_ZISWAFH_STATS.averageCoveragePct}%
🏪 UMKM Binaan Berkah: ${DISTRICT_ZISWAFH_STATS.totalUmkmSupported} Usaha
💧 Sumur Bor & Fasilitas Wakaf: ${DISTRICT_ZISWAFH_STATS.totalWaterPoints} Titik

Rincian Penyaluran 5 Instrumen:
• Zakat: Rp ${DISTRICT_ZISWAFH_STATS.breakdownSummary.zakat.toLocaleString("id-ID")}
• Infaq: Rp ${DISTRICT_ZISWAFH_STATS.breakdownSummary.infaq.toLocaleString("id-ID")}
• Shodaqoh: Rp ${DISTRICT_ZISWAFH_STATS.breakdownSummary.shodaqoh.toLocaleString("id-ID")}
• Wakaf Produktif: Rp ${DISTRICT_ZISWAFH_STATS.breakdownSummary.wakaf.toLocaleString("id-ID")}
• Hibah & Fasum: Rp ${DISTRICT_ZISWAFH_STATS.breakdownSummary.hibah.toLocaleString("id-ID")}

Wilayah Terpilih: ${selectedZone.neighborhoodName} (${selectedZone.kelurahan})
• Masjid Hub: ${selectedZone.masjidHub}
• Alokasi: Rp ${selectedZone.totalBenefitValueDisbursed.toLocaleString("id-ID")} (${selectedZone.disbursementCoveragePct}% Target)
• Status: ${selectedZone.distributionPriority}

Sistem Informasi Terpadu ZISWAFH — abdi.sematangborangcity.cloud`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div id="ziswafh-geospatial-component" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-800/50 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-teal-400" />
                Geospatial ZISWAFH Engine
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Peta Sebaran 4 Kelurahan Sematang Borang
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Peta Sebaran Manfaat ZISWAFH & Indeks Keadilan Sosial
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Visualisasi geospasial interaktif distribusi Zakat, Infaq, Shodaqoh, Wakaf Produktif, dan Hibah berbasis vektor SVG. Memetakan 12 sektor lingkungan RW, simpul masjid, sumur bor wakaf, dan rute logistik darurat secara transparan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-copy-geospatial-report"
              onClick={copyGeospatialReport}
              className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-teal-200 border border-teal-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
              <span>{copiedSummary ? "Laporan Tersalin!" : "Salin Ringkasan Geospasial"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Kelurahan Selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 mr-1 font-semibold whitespace-nowrap">Kelurahan:</span>
            {["Semua", "Sukamulya", "Lebung Gajah", "Karya Mulya", "Srimulya"].map((kel) => (
              <button
                key={kel}
                onClick={() => setSelectedKelurahan(kel)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedKelurahan === kel
                    ? "bg-teal-500 text-slate-950 shadow-sm font-bold"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {kel}
              </button>
            ))}
          </div>

          {/* Choropleth Metric Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 mr-1 font-semibold whitespace-nowrap">Layer Warna:</span>
            {[
              { id: "VALUE", label: "Nilai Manfaat (Rp)" },
              { id: "COVERAGE", label: "Cakupan Asnaf (%)" },
              { id: "MUSTAHIQ", label: "Keluarga Mustahiq" },
              { id: "PRIORITY", label: "Status Prioritas" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeMetric === m.id
                    ? "bg-emerald-400 text-slate-950 font-bold shadow-sm"
                    : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* District KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Total Dana Tersalurkan</div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">
            Rp {(DISTRICT_ZISWAFH_STATS.totalDisbursedValue / 1000000).toFixed(1)} Jt
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 100% Terverifikasi
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Penerima Manfaat</div>
          <div className="text-base sm:text-lg font-black text-teal-700 font-mono mt-0.5">
            {DISTRICT_ZISWAFH_STATS.totalBeneficiaries.toLocaleString("id-ID")} Jiwa
          </div>
          <div className="text-[10px] text-slate-500">
            {DISTRICT_ZISWAFH_STATS.totalMustahiqKK} KK Mustahiq
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Muzakki & Donatur</div>
          <div className="text-base sm:text-lg font-black text-blue-700 font-mono mt-0.5">
            {DISTRICT_ZISWAFH_STATS.totalMuzakki.toLocaleString("id-ID")} Orang
          </div>
          <div className="text-[10px] text-blue-600 font-semibold">24 Simpul Masjid</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Rerata Cakupan Asnaf</div>
          <div className="text-base sm:text-lg font-black text-emerald-700 font-mono mt-0.5">
            {DISTRICT_ZISWAFH_STATS.averageCoveragePct}%
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">Distribusi Merata</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">UMKM Berdaya (Wakaf)</div>
          <div className="text-base sm:text-lg font-black text-purple-700 font-mono mt-0.5">
            {DISTRICT_ZISWAFH_STATS.totalUmkmSupported} Usaha
          </div>
          <div className="text-[10px] text-purple-600 font-semibold">Qardhul Hasan 0%</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-medium">Sumur & Medis Dhuafa</div>
          <div className="text-base sm:text-lg font-black text-amber-700 font-mono mt-0.5">
            {DISTRICT_ZISWAFH_STATS.totalWaterPoints} Titik
          </div>
          <div className="text-[10px] text-amber-600 font-semibold">Wakaf Air & Kesehatan</div>
        </div>
      </div>

      {/* Dispatch feedback notification */}
      {dispatchedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispatchedFeedback}</span>
        </div>
      )}

      {/* Main Geospatial Interactive Canvas & Dossier Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SVG Map Stage (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-4 relative overflow-hidden">
            {/* SVG Top Layer Controls Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Compass className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-white">Peta Vektor Kecamatan Sematang Borang</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-400 font-mono">
                  Scale: 1:12.500
                </span>
              </div>

              {/* Layer Toggles */}
              <div className="flex items-center gap-3 text-[11px] text-slate-300 overflow-x-auto pb-1 scrollbar-none">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showFlowLines}
                    onChange={(e) => setShowFlowLines(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-0 w-3.5 h-3.5 accent-teal-500"
                  />
                  <span>Alur Logistik</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showMosquePins}
                    onChange={(e) => setShowMosquePins(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-0 w-3.5 h-3.5 accent-teal-500"
                  />
                  <span>Simpul Masjid</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showInfraPins}
                    onChange={(e) => setShowInfraPins(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-0 w-3.5 h-3.5 accent-teal-500"
                  />
                  <span>Sumur & UMKM</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showRoads}
                    onChange={(e) => setShowRoads(e.target.checked)}
                    className="rounded text-teal-500 focus:ring-0 w-3.5 h-3.5 accent-teal-500"
                  />
                  <span>Jalur Arteri</span>
                </label>
              </div>
            </div>

            {/* SVG Geospatial Stage */}
            <div className="relative w-full aspect-[1000/680] mt-2 rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-[#07131b] to-slate-950 border border-slate-900">
              <svg
                viewBox="0 0 1000 680"
                className="w-full h-full select-none"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* SVG Definitions & Gradients */}
                <defs>
                  {/* District Glow Filters */}
                  <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="pulse-hub" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Linear & Radial Gradients */}
                  <linearGradient id="river-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
                  </linearGradient>

                  <linearGradient id="flow-line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>

                  <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Background Grid Pattern */}
                <rect width="1000" height="680" fill="url(#grid-pattern)" />

                {/* Kelurahan Outer Boundaries Labeling Backgrounds */}
                <g id="kelurahan-territories" opacity="0.35">
                  {/* Sukamulya (Top-Left) */}
                  <rect x="60" y="30" width="440" height="320" rx="16" fill="rgba(13, 148, 136, 0.08)" stroke="rgba(20, 184, 166, 0.3)" strokeDasharray="6 4" />
                  <text x="80" y="60" fill="#2dd4bf" fontSize="13" fontWeight="bold" letterSpacing="1">
                    KELURAHAN SUKAMULYA
                  </text>

                  {/* Lebung Gajah (Bottom-Left) */}
                  <rect x="60" y="350" width="440" height="300" rx="16" fill="rgba(5, 150, 105, 0.08)" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="6 4" />
                  <text x="80" y="380" fill="#34d399" fontSize="13" fontWeight="bold" letterSpacing="1">
                    KELURAHAN LEBUNG GAJAH
                  </text>

                  {/* Karya Mulya (Top-Right) */}
                  <rect x="500" y="30" width="440" height="320" rx="16" fill="rgba(2, 132, 199, 0.08)" stroke="rgba(56, 189, 248, 0.3)" strokeDasharray="6 4" />
                  <text x="520" y="60" fill="#38bdf8" fontSize="13" fontWeight="bold" letterSpacing="1">
                    KELURAHAN KARYA MULYA
                  </text>

                  {/* Srimulya (Bottom-Right) */}
                  <rect x="500" y="350" width="440" height="300" rx="16" fill="rgba(124, 58, 237, 0.08)" stroke="rgba(167, 139, 250, 0.3)" strokeDasharray="6 4" />
                  <text x="520" y="380" fill="#a78bfa" fontSize="13" fontWeight="bold" letterSpacing="1">
                    KELURAHAN SRIMULYA
                  </text>
                </g>

                {/* River / Borang Canal (Natural Waterway) */}
                <path
                  d="M 20,200 C 140,240 220,180 340,250 C 460,320 520,380 620,440 C 720,500 840,560 980,590"
                  fill="none"
                  stroke="url(#river-gradient)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                <text x="880" y="580" fill="#38bdf8" fontSize="9" fontWeight="600" opacity="0.6">
                  Aliran Sungai Borang
                </text>

                {/* Main Arterial Roads */}
                {showRoads && (
                  <g id="road-network" opacity="0.45">
                    {/* Jl. Sematang Borang Raya (Horizontal Central Spine) */}
                    <path d="M 40,150 L 960,160" stroke="#f1f5f9" strokeWidth="2.5" strokeDasharray="8 6" />
                    <text x="100" y="142" fill="#cbd5e1" fontSize="9" fontWeight="600">
                      Jl. Sematang Borang Raya
                    </text>

                    {/* Jl. Padat Karya (North-South Connector) */}
                    <path d="M 380,40 L 410,640" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="390" y="580" fill="#cbd5e1" fontSize="9" fontWeight="600" transform="rotate(85 390,580)">
                      Jl. Padat Karya
                    </text>

                    {/* Jl. Karya Jaya */}
                    <path d="M 720,40 L 710,640" stroke="#f1f5f9" strokeWidth="1.8" strokeDasharray="5 5" />
                    <text x="730" y="100" fill="#cbd5e1" fontSize="9" fontWeight="600">
                      Jl. Karya Jaya
                    </text>
                  </g>
                )}

                {/* Neighborhood Zone Polygons (Interactive Choropleth Layer) */}
                <g id="neighborhood-polygons">
                  {ZISWAFH_NEIGHBORHOOD_ZONES.map((zone) => {
                    const isSelected = selectedZone.id === zone.id;
                    const isHovered = hoveredZone?.id === zone.id;
                    const fillColor = getZoneFillColor(zone);

                    return (
                      <g key={zone.id} className="cursor-pointer transition-all duration-200">
                        {/* Zone Area Polygon */}
                        <path
                          d={zone.svgPolygonPath}
                          fill={fillColor}
                          stroke={isSelected ? "#34d399" : isHovered ? "#38bdf8" : "rgba(255, 255, 255, 0.25)"}
                          strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.2}
                          strokeLinejoin="round"
                          onClick={() => setSelectedZone(zone)}
                          onMouseEnter={() => setHoveredZone(zone)}
                          onMouseLeave={() => setHoveredZone(null)}
                          className="transition-all duration-200"
                        />

                        {/* Zone Center Label */}
                        <text
                          x={zone.geoCenter.x}
                          y={zone.geoCenter.y - 12}
                          textAnchor="middle"
                          fill={isSelected ? "#ffffff" : "#f1f5f9"}
                          fontSize="11"
                          fontWeight="bold"
                          pointerEvents="none"
                          className="drop-shadow"
                        >
                          {zone.neighborhoodName.split(" ")[0]} {zone.neighborhoodName.split(" ")[1]}
                        </text>

                        {/* Metric Badge inside Polygon */}
                        <rect
                          x={zone.geoCenter.x - 38}
                          y={zone.geoCenter.y - 4}
                          width="76"
                          height="16"
                          rx="8"
                          fill={isSelected ? "#047857" : "rgba(15, 23, 42, 0.85)"}
                          stroke={isSelected ? "#34d399" : "rgba(255, 255, 255, 0.3)"}
                          strokeWidth="1"
                          pointerEvents="none"
                        />
                        <text
                          x={zone.geoCenter.x}
                          y={zone.geoCenter.y + 8}
                          textAnchor="middle"
                          fill="#34d399"
                          fontSize="9.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                          pointerEvents="none"
                        >
                          {activeMetric === "VALUE" && `Rp ${(zone.totalBenefitValueDisbursed / 1000000).toFixed(1)}Jt`}
                          {activeMetric === "COVERAGE" && `${zone.disbursementCoveragePct}% Target`}
                          {activeMetric === "MUSTAHIQ" && `${zone.totalMustahiqKK} KK`}
                          {activeMetric === "PRIORITY" && zone.distributionPriority}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Active Distribution Flow Lines (from Central Baitul Maal Mosque) */}
                {showFlowLines && (
                  <g id="logistics-flow-lines" pointerEvents="none">
                    {/* Central Baitul Maal at Masjid Jami' Al-Ikhlas (220, 160) */}
                    {ZISWAFH_NEIGHBORHOOD_ZONES.filter((z) => z.id !== "ZONE-SKM-01").map((targetZone) => (
                      <g key={`flow-${targetZone.id}`}>
                        <line
                          x1="220"
                          y1="160"
                          x2={targetZone.geoCenter.x}
                          y2={targetZone.geoCenter.y}
                          stroke="url(#flow-line-gradient)"
                          strokeWidth="1.5"
                          strokeDasharray="6 4"
                          opacity="0.6"
                        />
                        {/* Flow Moving Pulse Dot */}
                        <circle
                          cx={(220 + targetZone.geoCenter.x) / 2}
                          y={(160 + targetZone.geoCenter.y) / 2}
                          r="3"
                          fill="#34d399"
                        />
                      </g>
                    ))}
                  </g>
                )}

                {/* Mosque Hub Marker Pins with Pulsating Radar */}
                {showMosquePins && (
                  <g id="mosque-hub-markers">
                    {ZISWAFH_NEIGHBORHOOD_ZONES.map((zone) => {
                      const isCentral = zone.id === "ZONE-SKM-01";
                      const isSelected = selectedZone.id === zone.id;

                      return (
                        <g
                          key={`mosque-${zone.id}`}
                          onClick={() => setSelectedZone(zone)}
                          className="cursor-pointer"
                        >
                          {/* Pulsating Radar Ring */}
                          <circle
                            cx={zone.geoCenter.x}
                            cy={zone.geoCenter.y + 24}
                            r={isCentral ? "14" : "9"}
                            fill="none"
                            stroke={isCentral ? "#10b981" : "#38bdf8"}
                            strokeWidth="1.5"
                            opacity="0.7"
                            className="animate-ping"
                          />

                          {/* Mosque Node Pin Body */}
                          <circle
                            cx={zone.geoCenter.x}
                            cy={zone.geoCenter.y + 24}
                            r={isCentral ? "7" : "5"}
                            fill={isCentral ? "#10b981" : isSelected ? "#38bdf8" : "#ffffff"}
                            stroke="#0f172a"
                            strokeWidth="2"
                          />

                          {/* Central Badge label */}
                          {isCentral && (
                            <text
                              x={zone.geoCenter.x}
                              y={zone.geoCenter.y + 44}
                              textAnchor="middle"
                              fill="#6ee7b7"
                              fontSize="9"
                              fontWeight="bold"
                              className="drop-shadow"
                            >
                              ★ Central Baitul Maal
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Infrastructure Points (Wakaf Water Wells & Clinics) */}
                {showInfraPins && (
                  <g id="infrastructure-markers" pointerEvents="none">
                    {ZISWAFH_NEIGHBORHOOD_ZONES.map((zone) => (
                      <g key={`infra-${zone.id}`}>
                        {/* Wakaf Water Points */}
                        {zone.waterSanitationPoints && zone.waterSanitationPoints > 0 && (
                          <g transform={`translate(${zone.geoCenter.x - 28}, ${zone.geoCenter.y + 22})`}>
                            <circle cx="0" cy="0" r="4" fill="#0284c7" />
                            <text x="6" y="3" fill="#38bdf8" fontSize="8" fontWeight="bold">
                              💧 {zone.waterSanitationPoints}x
                            </text>
                          </g>
                        )}
                        {/* UMKM Incubators */}
                        {zone.umkmSupportedCount && zone.umkmSupportedCount > 0 && (
                          <g transform={`translate(${zone.geoCenter.x + 14}, ${zone.geoCenter.y + 22})`}>
                            <circle cx="0" cy="0" r="4" fill="#a855f7" />
                            <text x="6" y="3" fill="#c084fc" fontSize="8" fontWeight="bold">
                              🏪 {zone.umkmSupportedCount}
                            </text>
                          </g>
                        )}
                      </g>
                    ))}
                  </g>
                )}
              </svg>

              {/* Map Legend Overlay Card */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 max-w-xs shadow-lg">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Legenda Peta Geospasial</span>
                  <span className="text-[10px] text-teal-400 font-mono">12 Sektor RW</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Tersalurkan &gt;40 Jt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span>Tersalurkan 30-40 Jt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>Tersalurkan 25-30 Jt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Perhatian (&lt;25 Jt)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Simpul Masjid / DKM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sky-400 font-bold">💧</span>
                    <span>Sumur Bor Wakaf</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filter Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sektor lingkungan (misal: Padat Karya, Sukamulya, Baiturrahman)..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Right: Selected Zone Dossier & Distribution Detail Drawer (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-5">
            {/* Dossier Header */}
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                  Kelurahan {selectedZone.kelurahan}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadgeColor(
                    selectedZone.distributionPriority
                  )}`}
                >
                  {selectedZone.distributionPriority}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1 leading-tight">
                {selectedZone.neighborhoodName}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Basis: <strong>{selectedZone.masjidHub}</strong></span>
              </p>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200/80">
                <span className="text-[11px] text-teal-800 font-medium">Dana Tersalurkan</span>
                <div className="text-base font-black text-teal-950 font-mono mt-0.5">
                  Rp {(selectedZone.totalBenefitValueDisbursed / 1000000).toFixed(1)} Jt
                </div>
                <div className="text-[10px] text-teal-700 font-semibold">
                  {selectedZone.disbursementCoveragePct}% Target Kuota
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Keluarga Mustahiq</span>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {selectedZone.totalMustahiqKK} KK
                </div>
                <div className="text-[10px] text-slate-600 font-semibold">
                  {selectedZone.beneficiariesCount} Jiwa Terbantu
                </div>
              </div>
            </div>

            {/* ZISWAFH 5-Instrument Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Komposisi 5 Instrumen:</span>
                <span className="text-[10px] text-slate-500">Nilai Realisasi</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {/* Zakat */}
                <div className="flex items-center justify-between bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                  <span className="font-medium text-emerald-900">Zakat (Mal & Fitrah)</span>
                  <span className="font-mono font-bold text-emerald-800">
                    Rp {selectedZone.benefitBreakdown.zakat.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Infaq */}
                <div className="flex items-center justify-between bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                  <span className="font-medium text-teal-900">Infaq Operasional & Medis</span>
                  <span className="font-mono font-bold text-teal-800">
                    Rp {selectedZone.benefitBreakdown.infaq.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Shodaqoh */}
                <div className="flex items-center justify-between bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                  <span className="font-medium text-blue-900">Shodaqoh Santunan Yatim</span>
                  <span className="font-mono font-bold text-blue-800">
                    Rp {selectedZone.benefitBreakdown.shodaqoh.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Wakaf Produktif */}
                <div className="flex items-center justify-between bg-purple-50/60 p-2 rounded-lg border border-purple-100">
                  <span className="font-medium text-purple-900">Wakaf Modal Usaha & Air</span>
                  <span className="font-mono font-bold text-purple-800">
                    Rp {selectedZone.benefitBreakdown.wakaf.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Hibah */}
                <div className="flex items-center justify-between bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                  <span className="font-medium text-amber-900">Hibah Fasilitas Ibadah</span>
                  <span className="font-mono font-bold text-amber-800">
                    Rp {selectedZone.benefitBreakdown.hibah.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Programs */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Program Unggulan Sektor Ini:</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedZone.featuredPrograms.map((prog, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{prog}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Dispatched Ledger */}
            {selectedZone.recentDisbursements.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Riwayat Penyaluran Terakhir:</span>
                  <span className="text-[10px] text-teal-600 font-mono">Ledger Audited</span>
                </div>
                {selectedZone.recentDisbursements.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.programName}</span>
                      <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                        Rp {item.amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{item.unitDescription}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{item.date}</span>
                      <span className="font-mono text-slate-500">Kode: {item.verifiedAuditCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Simulator Button */}
            <div className="pt-2">
              <button
                onClick={handleSimulateDispatch}
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
              >
                <Truck className="w-4 h-4" />
                <span>Simulasikan Kirim Bantuan ke Sektor Ini</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
