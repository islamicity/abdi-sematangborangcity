import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  Shield,
  Sparkles,
  Heart,
  Star,
  Search,
  Filter,
  Calendar,
  Building2,
  MapPin,
  Send,
  MessageCircle,
  Share2,
  PlusCircle,
  Clock,
  CheckCircle2,
  UserCheck,
  Flame,
  X,
  Printer,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Download,
  ThumbsUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MosqueHonorPlaque, PlaqueTier, CommunityPrayerNote } from "../types";
import { INITIAL_MOSQUE_HONORS } from "../data/mosqueHonorsData";

interface DigitalMosqueHonorsProps {
  currentUserName?: string;
  currentUserRole?: string;
  currentUserKelurahan?: string;
}

export default function DigitalMosqueHonors({
  currentUserName = "dr. H. Rahmat Pratama, Sp.PD",
  currentUserRole = "Dokter Spesialis Penyakit Dalam",
  currentUserKelurahan = "Sukamulya",
}: DigitalMosqueHonorsProps) {
  // Stored Plaques with LocalStorage Persistence
  const [plaques, setPlaques] = useState<MosqueHonorPlaque[]>(() => {
    try {
      const saved = localStorage.getItem("islamicity_digital_mosque_honors_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_MOSQUE_HONORS;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("islamicity_digital_mosque_honors_v1", JSON.stringify(plaques));
    } catch {
      // ignore
    }
  }, [plaques]);

  // Filters State
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected Plaque for Expanded Detailed View Modal
  const [activePlaqueModal, setActivePlaqueModal] = useState<MosqueHonorPlaque | null>(null);

  // Prayer Submission Form State
  const [prayerText, setPrayerText] = useState<string>("");
  const [prayerSenderName, setPrayerSenderName] = useState<string>(currentUserName);
  const [prayerSenderRole, setPrayerSenderRole] = useState<string>(currentUserRole);

  // Nomination Modal State
  const [isNominateModalOpen, setIsNominateModalOpen] = useState<boolean>(false);
  const [nominateForm, setNominateForm] = useState({
    fullName: "",
    honorTitle: "",
    category: "Ibadah & Dakwah" as MosqueHonorPlaque["category"],
    tier: "gold" as PlaqueTier,
    serviceStartYear: 2005,
    yearsOfDedication: 20,
    masjid: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya" as MosqueHonorPlaque["kelurahan"],
    quote: "",
    milestone1: "",
    milestone2: "",
    milestone3: "",
  });

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Plaques
  const filteredPlaques = useMemo(() => {
    return plaques.filter((p) => {
      // Tier filter
      if (selectedTier !== "all" && p.tier !== selectedTier) return false;
      // Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      // Kelurahan filter
      if (selectedKelurahan !== "all" && p.kelurahan !== selectedKelurahan) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.fullName.toLowerCase().includes(q);
        const matchTitle = p.honorTitle.toLowerCase().includes(q);
        const matchMasjid = p.masjid.toLowerCase().includes(q);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const matchMilestones = p.milestones.some((m) => m.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchMasjid && !matchTags && !matchMilestones) {
          return false;
        }
      }
      return true;
    });
  }, [plaques, selectedTier, selectedCategory, selectedKelurahan, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalPlaques = plaques.length;
    const totalYears = plaques.reduce((acc, curr) => acc + curr.yearsOfDedication, 0);
    const totalPrayers = plaques.reduce((acc, curr) => acc + curr.prayersCount, 0);
    const goldPlaques = plaques.filter((p) => p.tier === "gold" || p.tier === "memorial").length;
    return { totalPlaques, totalYears, totalPrayers, goldPlaques };
  }, [plaques]);

  // Fast Quick Prayer Button Handler (+1 Doa)
  const handleQuickPrayer = (e: React.MouseEvent, plaqueId: string) => {
    e.stopPropagation();
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#f59e0b", "#10b981", "#fbbf24"],
      });
    } catch {
      // ignore
    }

    setPlaques((prev) =>
      prev.map((p) => {
        if (p.id === plaqueId) {
          return {
            ...p,
            prayersCount: p.prayersCount + 1,
          };
        }
        return p;
      })
    );

    if (activePlaqueModal && activePlaqueModal.id === plaqueId) {
      setActivePlaqueModal((prev) => (prev ? { ...prev, prayersCount: prev.prayersCount + 1 } : null));
    }

    showToast("Aamiin Yaa Rabbal 'Aalamiin. Doa kebaikan Anda telah tercatat pada prasasti pengabdi.");
  };

  // Submit Detailed Prayer Note Handler
  const handleDetailedPrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim() || !activePlaqueModal) return;

    const newPrayer: CommunityPrayerNote = {
      id: `prayer-${Date.now()}`,
      senderName: prayerSenderName.trim() || currentUserName,
      senderRole: prayerSenderRole.trim() || currentUserRole,
      prayerText: prayerText.trim(),
      timestamp: "Baru saja",
      likesCount: 1,
    };

    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#f59e0b", "#10b981", "#38bdf8"],
      });
    } catch {
      // ignore
    }

    setPlaques((prev) =>
      prev.map((p) => {
        if (p.id === activePlaqueModal.id) {
          return {
            ...p,
            prayersCount: p.prayersCount + 1,
            userPrayers: [newPrayer, ...p.userPrayers],
          };
        }
        return p;
      })
    );

    setActivePlaqueModal((prev) =>
      prev
        ? {
            ...prev,
            prayersCount: prev.prayersCount + 1,
            userPrayers: [newPrayer, ...prev.userPrayers],
          }
        : null
    );

    setPrayerText("");
    showToast("Jazakumullah khairan! Tausiyah doa Anda telah dipasang di dinding prasasti kehormatan.");
  };

  // Nominate Contributor Submit Handler
  const handleNominateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominateForm.fullName.trim() || !nominateForm.honorTitle.trim()) {
      showToast("Mohon lengkapi nama tokoh dan gelar kehormatan!");
      return;
    }

    const milestonesList: string[] = [];
    if (nominateForm.milestone1.trim()) milestonesList.push(nominateForm.milestone1.trim());
    if (nominateForm.milestone2.trim()) milestonesList.push(nominateForm.milestone2.trim());
    if (nominateForm.milestone3.trim()) milestonesList.push(nominateForm.milestone3.trim());
    if (milestonesList.length === 0) {
      milestonesList.push(`Pengabdian setia selama ${nominateForm.yearsOfDedication} tahun di lingkungan ${nominateForm.masjid}`);
    }

    const newPlaque: MosqueHonorPlaque = {
      id: `plaque-${Date.now()}`,
      fullName: nominateForm.fullName.trim(),
      honorTitle: nominateForm.honorTitle.trim(),
      category: nominateForm.category,
      tier: nominateForm.tier,
      serviceStartYear: Number(nominateForm.serviceStartYear) || 2010,
      serviceEndYear: "Sekarang",
      yearsOfDedication: Number(nominateForm.yearsOfDedication) || 15,
      masjid: nominateForm.masjid,
      kelurahan: nominateForm.kelurahan,
      avatarColor:
        nominateForm.tier === "gold"
          ? "#d97706"
          : nominateForm.tier === "emerald"
          ? "#059669"
          : nominateForm.tier === "silver"
          ? "#0284c7"
          : "#7c3aed",
      quote:
        nominateForm.quote.trim() ||
        "Tiada kenikmatan yang lebih abadi selain menghabiskan usia untuk memakmurkan rumah Allah.",
      milestones: milestonesList,
      dkmCertificateId: `HONOR-${nominateForm.tier.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      ratificationDate: "Disahkan DKM Sematang Borang 2026",
      prayersCount: 1,
      tags: [
        `${nominateForm.yearsOfDedication} Thn Khidmah`,
        nominateForm.category,
        nominateForm.kelurahan,
      ],
      userPrayers: [
        {
          id: `p-${Date.now()}`,
          senderName: currentUserName,
          senderRole: currentUserRole,
          prayerText: `Alhamdulillah kami mengusulkan beliau atas dedikasi luar biasa bagi kemaslahatan umat.`,
          timestamp: "Hari ini",
          likesCount: 1,
        },
      ],
    };

    setPlaques((prev) => [newPlaque, ...prev]);
    setIsNominateModalOpen(false);
    showToast(`Alhamdulillah! Usulan prasasti kehormatan untuk "${nominateForm.fullName}" berhasil diterbitkan.`);
  };

  // Helper for Plaque Border & Background Styles by Tier
  const getPlaqueStyle = (tier: PlaqueTier) => {
    switch (tier) {
      case "memorial":
        return {
          frameBg: "bg-gradient-to-br from-amber-950/90 via-slate-900 to-black",
          borderColor: "border-amber-600/70 shadow-amber-900/30",
          metalGradient: "from-amber-400 via-amber-200 to-yellow-500",
          tierBadgeBg: "bg-amber-950 text-amber-300 border-amber-500/60",
          tierLabel: "Prasasti Khidmah Abadi (Anumerta)",
          accentGlow: "shadow-[0_0_25px_rgba(245,158,11,0.15)]",
          trimIcon: "⚜️",
        };
      case "gold":
        return {
          frameBg: "bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-950",
          borderColor: "border-amber-400/60 shadow-amber-500/20",
          metalGradient: "from-amber-300 via-yellow-100 to-amber-500",
          tierBadgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/50",
          tierLabel: "Prasasti Emas Khidmah (20+ Thn)",
          accentGlow: "shadow-[0_0_20px_rgba(251,191,36,0.18)]",
          trimIcon: "👑",
        };
      case "emerald":
        return {
          frameBg: "bg-gradient-to-br from-slate-950 via-emerald-950/50 to-slate-950",
          borderColor: "border-emerald-500/60 shadow-emerald-500/20",
          metalGradient: "from-emerald-300 via-teal-100 to-emerald-500",
          tierBadgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50",
          tierLabel: "Prasasti Zamrud Kemanusiaan",
          accentGlow: "shadow-[0_0_20px_rgba(16,185,129,0.18)]",
          trimIcon: "🌟",
        };
      case "silver":
        return {
          frameBg: "bg-gradient-to-br from-slate-950 via-sky-950/40 to-slate-950",
          borderColor: "border-sky-400/50 shadow-sky-500/15",
          metalGradient: "from-sky-200 via-slate-100 to-sky-400",
          tierBadgeBg: "bg-sky-500/20 text-sky-300 border-sky-400/40",
          tierLabel: "Prasasti Perak Khidmah (10+ Thn)",
          accentGlow: "shadow-[0_0_15px_rgba(56,189,248,0.15)]",
          trimIcon: "⭐",
        };
      case "bronze":
      default:
        return {
          frameBg: "bg-gradient-to-br from-slate-950 via-orange-950/30 to-slate-950",
          borderColor: "border-amber-700/50 shadow-orange-950/20",
          metalGradient: "from-amber-400 via-orange-200 to-amber-600",
          tierBadgeBg: "bg-orange-500/20 text-orange-300 border-orange-400/40",
          tierLabel: "Prasasti Perunggu Khidmah (5+ Thn)",
          accentGlow: "shadow-[0_0_15px_rgba(234,88,12,0.12)]",
          trimIcon: "✨",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/90 rounded-2xl p-6 sm:p-7 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        {/* Background Islamic Geometric Halo Elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-2.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Dinding Kehormatan & Prasasti Pengabdi Masjid Digital</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Digital Mosque Honors Wall</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-400/40 text-amber-300">
                Prasasti Pengabdi Umat
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
              Monumen digital apresiasi bagi para sesepuh, muazzin, ulama, relawan medis, advokat wakaf, dan penggerak sosial
              yang telah mewakafkan usia dan tenaganya lebih dari 5 hingga 30+ tahun demi kemakmuran masjid di Sematang Borang.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-nominate-honoree"
              onClick={() => setIsNominateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Usulkan Tokoh Pengabdi</span>
            </button>
            <button
              onClick={() => {
                showToast("Daftar prasasti kehormatan ini disahkan oleh Dewan Kemakmuran Masjid Se-Kecamatan Sematang Borang.");
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Legalitas DKM</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/70 backdrop-blur-sm rounded-xl p-3 border border-amber-900/40">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Prasasti Terdaftar</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">{stats.totalPlaques} Tokoh Mulia</div>
          </div>
          <div className="bg-slate-950/70 backdrop-blur-sm rounded-xl p-3 border border-amber-900/40">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kumulatif Pengabdian</span>
            </div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{stats.totalYears} Tahun Khidmah</div>
          </div>
          <div className="bg-slate-950/70 backdrop-blur-sm rounded-xl p-3 border border-amber-900/40">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Doa Terpanjat dari Jamaah</span>
            </div>
            <div className="text-lg font-black text-amber-300 mt-0.5">{stats.totalPrayers} Doa Kebaikan</div>
          </div>
          <div className="bg-slate-950/70 backdrop-blur-sm rounded-xl p-3 border border-amber-900/40">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span>Khidmah Emas & Anumerta</span>
            </div>
            <div className="text-lg font-black text-yellow-400 mt-0.5">{stats.goldPlaques} Tokoh Sepuh</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Tier Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedTier("all")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                selectedTier === "all" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              Semua Tingkatan
            </button>
            <button
              onClick={() => setSelectedTier("gold")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1 ${
                selectedTier === "gold" ? "bg-amber-500 text-slate-950 shadow-sm font-black" : "text-amber-300 hover:text-amber-200"
              }`}
            >
              <span>👑 Emas (20+ Thn)</span>
            </button>
            <button
              onClick={() => setSelectedTier("emerald")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1 ${
                selectedTier === "emerald" ? "bg-emerald-500 text-slate-950 shadow-sm font-black" : "text-emerald-300 hover:text-emerald-200"
              }`}
            >
              <span>🌟 Zamrud (Medis)</span>
            </button>
            <button
              onClick={() => setSelectedTier("silver")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1 ${
                selectedTier === "silver" ? "bg-sky-500 text-slate-950 shadow-sm font-black" : "text-sky-300 hover:text-sky-200"
              }`}
            >
              <span>⭐ Perak (10+ Thn)</span>
            </button>
            <button
              onClick={() => setSelectedTier("memorial")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1 ${
                selectedTier === "memorial" ? "bg-amber-700 text-white shadow-sm font-black" : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <span>⚜️ Anumerta</span>
            </button>
          </div>

          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tokoh, masjid, atau jasa pengabdian..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Category & Kelurahan Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Bidang:
            </span>
            {[
              "all",
              "Ibadah & Dakwah",
              "Kesehatan Dhuafa",
              "Wakaf & Pembangunan",
              "Pendidikan Santri",
              "Sosial & Dapur Berkah",
              "Teknologi & Media",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  selectedCategory === cat
                    ? "bg-slate-700 text-white font-bold border border-slate-600 shadow-xs"
                    : "text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800"
                }`}
              >
                {cat === "all" ? "Semua Bidang" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Kelurahan:
            </span>
            {["all", "Sukamulya", "Lebung Gajah", "Karya Mulya", "Srimulya"].map((kel) => (
              <button
                key={kel}
                onClick={() => setSelectedKelurahan(kel)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  selectedKelurahan === kel
                    ? "bg-amber-950 text-amber-300 font-bold border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {kel === "all" ? "Semua" : kel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Virtual 'Plaques' (with Motion Viewport Fade-In Animations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPlaques.length > 0 ? (
            filteredPlaques.map((plaque, index) => {
              const style = getPlaqueStyle(plaque.tier);
              return (
                <motion.div
                  key={plaque.id}
                  layout
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  onClick={() => setActivePlaqueModal(plaque)}
                  className={`rounded-2xl border ${style.borderColor} ${style.frameBg} ${style.accentGlow} p-5 cursor-pointer relative overflow-hidden transition-shadow flex flex-col justify-between group`}
                >
                  {/* Decorative Ornamental Header Rim */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent opacity-75" />

                  {/* Corner Calligraphic Accents */}
                  <div className="absolute top-2 left-2 text-amber-500/30 text-xs select-none">❖</div>
                  <div className="absolute top-2 right-2 text-amber-500/30 text-xs select-none">❖</div>

                  <div>
                    {/* Top Tier Badge & Dedication Duration */}
                    <div className="flex items-center justify-between gap-2 mb-3 pt-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${style.tierBadgeBg}`}
                      >
                        <span>{style.trimIcon}</span>
                        <span>{style.tierLabel}</span>
                      </span>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-amber-300 text-[11px] font-bold">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{plaque.yearsOfDedication} Tahun</span>
                        </span>
                      </div>
                    </div>

                    {/* Honoree Identity & Avatar */}
                    <div className="flex items-start gap-3.5 my-2">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/30 shrink-0 transform group-hover:scale-105 transition"
                        style={{ backgroundColor: plaque.avatarColor }}
                      >
                        {plaque.isMemorial ? "🕊️" : plaque.fullName.replace(/K\.H\.|dr\.|H\.|Hajjah|Ust\.|Ir\.|S\.Kom/gi, "").trim()[0] || "T"}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-300 transition">
                          {plaque.fullName}
                        </h3>
                        <p className="text-xs text-amber-400/90 font-medium line-clamp-1 mt-0.5">
                          {plaque.honorTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            {plaque.masjid}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400">{plaque.kelurahan}</span>
                        </div>
                      </div>
                    </div>

                    {/* Plaque Engraved Quote */}
                    <div className="bg-slate-950/80 rounded-xl p-3 my-3.5 border border-slate-800/90 relative">
                      <span className="text-amber-500/40 text-xl font-serif leading-none absolute top-1 left-1.5">&ldquo;</span>
                      <p className="text-xs text-slate-300 italic pl-3 pr-1 line-clamp-2 leading-relaxed">
                        {plaque.quote}
                      </p>
                    </div>

                    {/* Key Milestones Highlight (Top 2) */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      {plaque.milestones.slice(0, 2).map((m, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 text-slate-300">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plaque Footer: Prayers Tally & Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                      <span className="font-semibold text-slate-200">{plaque.prayersCount}</span>
                      <span className="text-[11px]">Doa Kebaikan</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleQuickPrayer(e, plaque.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition transform active:scale-90"
                        title="Kirim Doa Singkat (+1 Doa)"
                      >
                        <Heart className="w-3 h-3 text-amber-400" />
                        <span>Kirim Doa</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePlaqueModal(plaque);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                        title="Buka Lembar Piagam Prasasti"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <Award className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Tidak Ada Prasasti Ditemukan</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Silakan sesuaikan filter tingkatan, bidang khidmah, atau kata kunci pencarian Anda untuk melihat prasasti lainnya.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Modal: Virtual Plaque Certificate & Doa Tausiyah Wall */}
      {activePlaqueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-6"
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActivePlaqueModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Virtual Plaque Golden Certificate Stage */}
            <div
              className={`p-6 sm:p-8 rounded-2xl border-4 ${getPlaqueStyle(activePlaqueModal.tier).borderColor} ${
                getPlaqueStyle(activePlaqueModal.tier).frameBg
              } shadow-2xl relative text-center space-y-4`}
            >
              {/* Islamic Calligraphic Header Border */}
              <div className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <span>{getPlaqueStyle(activePlaqueModal.tier).trimIcon}</span>
                <span>{getPlaqueStyle(activePlaqueModal.tier).tierLabel}</span>
              </div>

              {/* Title & Honoree Name */}
              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Prasasti Kehormatan Khidmah Rumah Allah
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
                  {activePlaqueModal.fullName}
                </h2>
                <div className="text-sm font-semibold text-amber-400">
                  {activePlaqueModal.honorTitle}
                </div>
              </div>

              {/* Service Years Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-md">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Masa Pengabdian: {activePlaqueModal.serviceStartYear} — {activePlaqueModal.serviceEndYear} ({activePlaqueModal.yearsOfDedication} Tahun Istiqomah)
                </span>
              </div>

              {/* Plaque Engraved Quote */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-slate-200 text-xs sm:text-sm italic max-w-xl mx-auto leading-relaxed">
                &ldquo;{activePlaqueModal.quote}&rdquo;
              </div>

              {/* Milestone Checklist */}
              <div className="text-left bg-slate-950/90 p-4 rounded-xl border border-slate-800 max-w-xl mx-auto space-y-2 text-xs">
                <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Jejak Amal Jariyah & Kontribusi Bersejarah:</span>
                </div>
                {activePlaqueModal.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>

              {/* Ratification DKM Seal Badge */}
              <div className="flex flex-wrap items-center justify-between text-left text-[11px] text-slate-400 border-t border-slate-800 pt-3 max-w-xl mx-auto">
                <div>
                  <div>Disahkan oleh DKM Sematang Borang</div>
                  <div className="text-slate-300 font-mono font-bold text-[10px]">{activePlaqueModal.dkmCertificateId}</div>
                </div>
                <div className="text-right">
                  <div>Tanggal Pengesahan</div>
                  <div className="text-amber-300 font-semibold">{activePlaqueModal.ratificationDate}</div>
                </div>
              </div>
            </div>

            {/* Prayer & Appreciation Section (Tausiyah & Doa Jamaah) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Tausiyah Doa & Apresiasi Jamaah ({activePlaqueModal.userPrayers.length})</span>
                </h3>
                <span className="text-xs text-slate-400">Total {activePlaqueModal.prayersCount} Doa Terpanjat</span>
              </div>

              {/* Existing Prayer Cards */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {activePlaqueModal.userPrayers.map((prayer) => (
                  <div key={prayer.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-amber-300">{prayer.senderName}</div>
                      <span className="text-[10px] text-slate-500">{prayer.timestamp}</span>
                    </div>
                    {prayer.senderRole && <div className="text-[10px] text-slate-400">{prayer.senderRole}</div>}
                    <p className="text-slate-200 mt-1 leading-relaxed">{prayer.prayerText}</p>
                  </div>
                ))}
              </div>

              {/* Send Prayer Form */}
              <form onSubmit={handleDetailedPrayerSubmit} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kirim Untaian Doa / Kesaksian Amal untuk Beliau:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={prayerSenderName}
                    onChange={(e) => setPrayerSenderName(e.target.value)}
                    placeholder="Nama Anda..."
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={prayerSenderRole}
                    onChange={(e) => setPrayerSenderRole(e.target.value)}
                    placeholder="Peran / Hubungan (Jamaah / Relawan)..."
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <textarea
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  placeholder="Tuliskan doa kebaikan, rasa terima kasih, atau permohonan pahala jariyah..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Doa akan ditampilkan di dinding prasasti</span>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <Send className="w-3 h-3" />
                    <span>Kirim Doa Sekarang</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Nomination Modal for New Long-term Contributor */}
      {isNominateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Usulkan Tokoh Pengabdi Masjid</h3>
                  <p className="text-xs text-slate-400">Pendaftaran Prasasti Kehormatan DKM Sematang Borang</p>
                </div>
              </div>
              <button
                onClick={() => setIsNominateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleNominateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap Tokoh *</label>
                  <input
                    type="text"
                    required
                    value={nominateForm.fullName}
                    onChange={(e) => setNominateForm({ ...nominateForm, fullName: e.target.value })}
                    placeholder="Contoh: H. M. Husni Thamrin"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gelar Kehormatan / Jasa *</label>
                  <input
                    type="text"
                    required
                    value={nominateForm.honorTitle}
                    onChange={(e) => setNominateForm({ ...nominateForm, honorTitle: e.target.value })}
                    placeholder="Contoh: Pendiri TPQ Gratis & Muazzin 20 Tahun"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bidang Layanan</label>
                  <select
                    value={nominateForm.category}
                    onChange={(e) => setNominateForm({ ...nominateForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Ibadah & Dakwah">Ibadah & Dakwah</option>
                    <option value="Kesehatan Dhuafa">Kesehatan Dhuafa</option>
                    <option value="Wakaf & Pembangunan">Wakaf & Pembangunan</option>
                    <option value="Pendidikan Santri">Pendidikan Santri</option>
                    <option value="Sosial & Dapur Berkah">Sosial & Dapur Berkah</option>
                    <option value="Teknologi & Media">Teknologi & Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tingkatan Prasasti</label>
                  <select
                    value={nominateForm.tier}
                    onChange={(e) => setNominateForm({ ...nominateForm, tier: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="gold">👑 Emas (20+ Thn)</option>
                    <option value="silver">⭐ Perak (10+ Thn)</option>
                    <option value="bronze">✨ Perunggu (5+ Thn)</option>
                    <option value="emerald">🌟 Zamrud (Medis/Kemanusiaan)</option>
                    <option value="memorial">⚜️ Anumerta (Rahimahullah)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tahun Mulai Khidmah</label>
                  <input
                    type="number"
                    value={nominateForm.serviceStartYear}
                    onChange={(e) => setNominateForm({ ...nominateForm, serviceStartYear: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Masjid Pangkalan</label>
                  <input
                    type="text"
                    value={nominateForm.masjid}
                    onChange={(e) => setNominateForm({ ...nominateForm, masjid: e.target.value })}
                    placeholder="Nama Masjid..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelurahan</label>
                  <select
                    value={nominateForm.kelurahan}
                    onChange={(e) => setNominateForm({ ...nominateForm, kelurahan: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Sukamulya">Sukamulya</option>
                    <option value="Lebung Gajah">Lebung Gajah</option>
                    <option value="Karya Mulya">Karya Mulya</option>
                    <option value="Srimulya">Srimulya</option>
                    <option value="Kecamatan Sematang Borang">Kecamatan Sematang Borang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kutipan Amanah / Pesan Hikmah</label>
                <textarea
                  value={nominateForm.quote}
                  onChange={(e) => setNominateForm({ ...nominateForm, quote: e.target.value })}
                  placeholder="Kutipan nasihat beliau selama mengabdi..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pencapaian / Rekam Jejak Kunci</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={nominateForm.milestone1}
                    onChange={(e) => setNominateForm({ ...nominateForm, milestone1: e.target.value })}
                    placeholder="Milestone 1 (misal: Mengajar 300 santri yatim)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={nominateForm.milestone2}
                    onChange={(e) => setNominateForm({ ...nominateForm, milestone2: e.target.value })}
                    placeholder="Milestone 2 (opsional)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNominateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                >
                  Terbitkan Prasasti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-amber-500/50 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
