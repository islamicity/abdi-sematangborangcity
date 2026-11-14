import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  Flame,
  Sun,
  Moon,
  Zap,
  Target,
  Trophy,
  ShieldCheck,
  HeartHandshake,
  Volume2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
  Search,
  Share2,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Info,
  X,
  Star,
  Heart,
  TrendingUp,
  SlidersHorizontal,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import { DhikrAchievementBadge, DhikrBadgeTier, DhikrUserStats } from "../types";
import {
  DHIKR_SPIRITUAL_LEVELS,
  calculateSpiritualLevel,
} from "../data/dhikrGamificationData";

interface DhikrGamificationSectionProps {
  badges: DhikrAchievementBadge[];
  stats: DhikrUserStats;
  totalRepetitionsToday: number;
  dailyRepetitionTarget: number;
  morningDoneCount: number;
  totalMorningItems: number;
  eveningDoneCount: number;
  totalEveningItems: number;
  onNavigateToTab: (tab: "morning" | "evening" | "free_tasbih" | "all") => void;
  onSimulateStreakIncrement?: () => void;
  onSimulateCompleteMorning?: () => void;
  onSimulateResetForDemo?: () => void;
}

// Gentle Harmonic Audio Chime for Achievement Unlocked
const playBadgeChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 - E5 - G5 - C6 - E6 (Celestial arpeggio)
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
    });
  } catch {
    // Autoplay restrictions
  }
};

export default function DhikrGamificationSection({
  badges,
  stats,
  totalRepetitionsToday,
  dailyRepetitionTarget,
  morningDoneCount,
  totalMorningItems,
  eveningDoneCount,
  totalEveningItems,
  onNavigateToTab,
  onSimulateStreakIncrement,
  onSimulateCompleteMorning,
  onSimulateResetForDemo,
}: DhikrGamificationSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNLOCKED" | "IN_PROGRESS" | "LOCKED">("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalBadge, setActiveModalBadge] = useState<DhikrAchievementBadge | null>(null);
  const [copiedShareText, setCopiedShareText] = useState<boolean>(false);
  const [showDemoTools, setShowDemoTools] = useState<boolean>(false);

  // Compute total points earned from unlocked badges
  const totalEarnedPoints = useMemo(() => {
    return badges
      .filter((b) => b.isUnlocked)
      .reduce((acc, curr) => acc + curr.rewardPoints, 0);
  }, [badges]);

  // Compute spiritual level progress
  const levelInfo = useMemo(() => {
    return calculateSpiritualLevel(totalEarnedPoints);
  }, [totalEarnedPoints]);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const inProgressCount = badges.filter((b) => !b.isUnlocked && b.currentValue > 0).length;
  const lockedCount = badges.filter((b) => !b.isUnlocked && b.currentValue === 0).length;

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      // Category filter
      if (selectedCategory !== "ALL" && badge.category !== selectedCategory) {
        return false;
      }

      // Tier filter
      if (tierFilter !== "ALL" && badge.tier !== tierFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "UNLOCKED" && !badge.isUnlocked) return false;
      if (statusFilter === "IN_PROGRESS" && (badge.isUnlocked || badge.currentValue === 0)) return false;
      if (statusFilter === "LOCKED" && (badge.isUnlocked || badge.currentValue > 0)) return false;

      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = badge.name.toLowerCase().includes(q);
        const matchesTitle = badge.indonesianTitle.toLowerCase().includes(q);
        const matchesDesc = badge.description.toLowerCase().includes(q);
        const matchesReq = badge.requirementDescription.toLowerCase().includes(q);
        return matchesName || matchesTitle || matchesDesc || matchesReq;
      }

      return true;
    });
  }, [badges, selectedCategory, statusFilter, tierFilter, searchQuery]);

  // Helper for badge icon rendering
  const renderBadgeIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "Flame":
        return <Flame className={className} />;
      case "Sun":
        return <Sun className={className} />;
      case "Moon":
        return <Moon className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Target":
        return <Target className={className} />;
      case "Trophy":
        return <Trophy className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "HeartHandshake":
        return <HeartHandshake className={className} />;
      case "Volume2":
        return <Volume2 className={className} />;
      case "RotateCcw":
        return <RotateCcw className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Award":
        return <Award className={className} />;
      default:
        return <Star className={className} />;
    }
  };

  // Tier styling helpers
  const getTierBadgeStyle = (tier: DhikrBadgeTier) => {
    switch (tier) {
      case "diamond":
        return {
          chip: "bg-cyan-900/90 text-cyan-200 border-cyan-400/60 shadow-cyan-900/30",
          cardBorder: "border-cyan-400/50 hover:border-cyan-300",
          glow: "from-cyan-500/20 via-emerald-500/10 to-transparent",
          iconBg: "bg-gradient-to-br from-cyan-600 to-teal-700 text-cyan-100",
          label: "Berlian (Diamond)",
        };
      case "gold":
        return {
          chip: "bg-amber-900/90 text-amber-200 border-amber-400/60 shadow-amber-900/30",
          cardBorder: "border-amber-400/50 hover:border-amber-300",
          glow: "from-amber-500/20 via-orange-500/10 to-transparent",
          iconBg: "bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 font-bold",
          label: "Emas (Gold)",
        };
      case "silver":
        return {
          chip: "bg-slate-800 text-slate-200 border-slate-400/50 shadow-slate-900/30",
          cardBorder: "border-slate-300 hover:border-slate-400",
          glow: "from-slate-400/15 via-slate-500/10 to-transparent",
          iconBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white",
          label: "Perak (Silver)",
        };
      case "bronze":
      default:
        return {
          chip: "bg-amber-950/80 text-amber-300 border-amber-700/50",
          cardBorder: "border-amber-600/30 hover:border-amber-600/60",
          glow: "from-amber-700/15 via-orange-800/10 to-transparent",
          iconBg: "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100",
          label: "Perunggu (Bronze)",
        };
    }
  };

  const handleOpenCertificate = (badge: DhikrAchievementBadge) => {
    setActiveModalBadge(badge);
    setCopiedShareText(false);
    if (badge.isUnlocked) {
      playBadgeChime();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#10b981", "#f59e0b", "#3b82f6", "#ffffff"],
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  const handleCopyBadgeShare = (badge: DhikrAchievementBadge) => {
    const textToCopy = `🏆 Pencapaian Lencana Dzikir Islamicity 4B:
🏅 Lencana: "${badge.name}" (${badge.indonesianTitle})
✨ Kategori: ${badge.category.toUpperCase()} • Tingkat: ${badge.tier.toUpperCase()}
📜 Syarat: ${badge.requirementDescription}
💫 Status: ${badge.isUnlocked ? "Telah Diraih! Alhamdulillah" : `Progress: ${badge.currentValue}/${badge.targetValue} ${badge.unit}`}
📖 Dalil: "${badge.dalilReference?.translation || "Ingatlah Allah sebanyak-banyaknya."}" (${badge.dalilReference?.source || "Al-Hadits"})
🕌 Mari istiqomahkan Dzikir Harian bersama ABDI Islamicity Kaffah!`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 3000);
  };

  return (
    <div id="dhikr-gamification-section" className="space-y-6 animate-fade-in">
      {/* Top Banner: Spiritual Level & Istiqomah Streak Status */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 rounded-2xl p-6 sm:p-7 text-white border border-emerald-600/40 shadow-xl relative overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Level & Title */}
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>SISTEM GAMIFIKASI & APRESIASI ISTIQOMAH DZIKIR</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3 flex-wrap">
              <span>Tingkat Spiritual:</span>
              <span className="text-amber-300 underline decoration-amber-400/50 decoration-2 underline-offset-4">
                Level {levelInfo.currentLevel.level} • {levelInfo.currentLevel.title}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              {levelInfo.currentLevel.subTitle}. Tingkatkan frekuensi dzikir harian dan pertahankan streak istiqomah
              untuk membuka lencana mulia dan memperberat timbangan amal kebaikan.
            </p>

            <div className="pt-2 italic text-[11px] sm:text-xs text-amber-200/80 border-l-2 border-amber-400/60 pl-3">
              {levelInfo.currentLevel.quote}
            </div>

            {/* Level XP Progress Bar */}
            <div className="pt-3 space-y-1.5 max-w-md">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-300 font-medium">
                  {totalEarnedPoints} Poin Amal
                  {levelInfo.nextLevel && (
                    <span className="text-slate-400 font-normal ml-1">/ {levelInfo.nextLevel.minPoints} Poin</span>
                  )}
                </span>
                <span className="text-amber-300 font-bold">
                  {levelInfo.nextLevel ? `${levelInfo.pointsToNext} Poin menuju Level ${levelInfo.nextLevel.level}` : "Derajat Tertinggi!"}
                </span>
              </div>
              <div className="w-full bg-emerald-950/80 rounded-full h-2.5 overflow-hidden border border-emerald-800">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelInfo.progressPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Streak Badge */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-xl border border-emerald-600/40 backdrop-blur-sm lg:min-w-[320px]">
            {/* Streak Counter */}
            <div className="space-y-0.5">
              <div className="text-[11px] text-emerald-300/80 font-medium flex items-center justify-between">
                <span>Streak Istiqomah</span>
                <span className="text-[10px] text-amber-400 font-bold">Aktif</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono flex items-center gap-1.5">
                <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
                {stats.currentStreakDays} Hari
              </div>
              <div className="text-[10px] text-emerald-400">Berturut-turut terjaga</div>
            </div>

            {/* Total Badges Earned */}
            <div className="space-y-0.5">
              <div className="text-[11px] text-emerald-300/80 font-medium">Lencana Diraih</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono flex items-center gap-1.5">
                <Award className="w-6 h-6 text-emerald-400" />
                {unlockedCount} <span className="text-xs text-slate-400 font-normal">/ {badges.length}</span>
              </div>
              <div className="text-[10px] text-amber-300 font-bold">
                {Math.round((unlockedCount / Math.max(1, badges.length)) * 100)}% Terkoleksi
              </div>
            </div>

            {/* Today Total Repetitions */}
            <div className="space-y-0.5 col-span-2 sm:col-span-1 lg:col-span-2 border-t sm:border-t-0 lg:border-t border-emerald-900/60 pt-2 sm:pt-0 lg:pt-2">
              <div className="text-[11px] text-emerald-300/80 font-medium flex items-center justify-between">
                <span>Repetisi Hari Ini</span>
                <span className="text-[10px] text-amber-300 font-mono font-bold">
                  Target: {dailyRepetitionTarget}x
                </span>
              </div>
              <div className="text-lg font-black text-white font-mono flex items-center justify-between">
                <span>{totalRepetitionsToday.toLocaleString("id-ID")}x</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700">
                  {totalRepetitionsToday >= dailyRepetitionTarget ? "Target Tuntas ✨" : "Sedang Berjalan"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo & Test Simulator Toggle */}
        <div className="mt-5 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300/80">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Lencana otomatis terbuka saat syarat istiqomah atau milestone tercapai secara real-time.</span>
          </div>

          <button
            onClick={() => setShowDemoTools(!showDemoTools)}
            className="px-2.5 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showDemoTools ? "Sembunyikan Panel Uji" : "Panel Uji & Simulasi Capaian"}</span>
          </button>
        </div>

        {/* Interactive Demo Simulation Controls */}
        {showDemoTools && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-amber-400/40 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Uji Interaktif: Simulasi Progres Lencana (Untuk Pengujian Pengguna)
              </span>
              <span className="text-[11px] text-slate-400">Data tersimpan di penyimpanan lokal</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Coba simulasi penambahan streak istiqomah atau penuntasan sesi dzikir pagi untuk melihat animasi lencana &apos;Consistent Reader&apos; dan &apos;Early Bird&apos; langsung terbuka!
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onSimulateStreakIncrement && (
                <button
                  onClick={() => {
                    onSimulateStreakIncrement();
                    playBadgeChime();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Flame className="w-3.5 h-3.5" />
                  +1 Hari Streak ({stats.currentStreakDays} hari)
                </button>
              )}

              {onSimulateCompleteMorning && (
                <button
                  onClick={() => {
                    onSimulateCompleteMorning();
                    playBadgeChime();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Sun className="w-3.5 h-3.5" />
                  Tuntaskan Sesi Pagi (Buka &apos;Early Bird&apos;)
                </button>
              )}

              {onSimulateResetForDemo && (
                <button
                  onClick={onSimulateResetForDemo}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Nilai Uji
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* STREAK MILESTONE ROADMAP (VISUAL JOURNEY) */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              Peta Jalan Istiqomah Dzikir (Streak Milestones)
            </h3>
            <p className="text-xs text-slate-500">
              Langkah demi langkah membangun kebiasaan dzikir yang dicintai Allah SWT.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Streak Saat Ini: {stats.currentStreakDays} Hari</span>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {[
            { day: 1, label: "Hari 1", title: "Langkah Awal", badgeCode: "EARLY_BIRD", points: 40 },
            { day: 3, label: "Hari 3", title: "Consistent Reader", badgeCode: "CON_READER_BRONZE", points: 50 },
            { day: 7, label: "Hari 7", title: "Sepekan Barakah", badgeCode: "CON_READER_SILVER", points: 100 },
            { day: 14, label: "Hari 14", title: "Dua Pekan Emas", badgeCode: "CON_READER_GOLD", points: 200 },
            { day: 30, label: "Hari 30", title: "Teladan Sebulan", badgeCode: "TITAN_30_DAYS", points: 350 },
          ].map((milestone) => {
            const isReached = stats.currentStreakDays >= milestone.day;
            const isNextGoal = !isReached && (stats.currentStreakDays < milestone.day);

            return (
              <div
                key={milestone.day}
                className={`p-3.5 rounded-xl border transition-all text-center relative overflow-hidden flex flex-col justify-between ${
                  isReached
                    ? "bg-gradient-to-b from-emerald-50 to-white border-emerald-300 shadow-sm"
                    : isNextGoal
                    ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30"
                    : "bg-slate-50/60 border-slate-200 text-slate-400 opacity-80"
                }`}
              >
                {/* Status Icon */}
                <div className="flex justify-center mb-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isReached
                        ? "bg-emerald-600 text-white shadow-emerald-200 shadow-md"
                        : isNextGoal
                        ? "bg-amber-500 text-slate-950 font-black animate-pulse shadow-md"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isReached ? <Check className="w-5 h-5 stroke-[2.5]" /> : `${milestone.day}d`}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {milestone.label}
                  </div>
                  <div className={`text-xs font-black line-clamp-1 ${isReached ? "text-emerald-800" : isNextGoal ? "text-amber-900" : "text-slate-600"}`}>
                    {milestone.title}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[10px]">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span className="font-semibold text-slate-600">+{milestone.points} Poin</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: `Semua (${badges.length})` },
              { id: "UNLOCKED", label: `Diraih (${unlockedCount})` },
              { id: "IN_PROGRESS", label: `Dalam Proses (${inProgressCount})` },
              { id: "LOCKED", label: `Terkunci (${lockedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lencana (misal: 'Consistent', 'Fajar')..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category & Tier Sub-filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-semibold mr-1">Kategori:</span>
            {[
              { id: "ALL", label: "Semua Kategori" },
              { id: "streak", label: "🔥 Istiqomah & Streak" },
              { id: "discipline", label: "⏰ Waktu & Fajar/Senja" },
              { id: "volume", label: "🎯 Volume Repetisi" },
              { id: "recitation", label: "📖 Tartil & Pelafalan" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedCategory === cat.id
                    ? "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Tingkat:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="ALL">Semua Tingkat (Tiers)</option>
              <option value="bronze">Perunggu (Bronze)</option>
              <option value="silver">Perak (Silver)</option>
              <option value="gold">Emas (Gold)</option>
              <option value="diamond">Berlian (Diamond)</option>
            </select>
          </div>
        </div>
      </div>

      {/* BADGES GRID */}
      {filteredBadges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Tidak ada lencana yang cocok</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cobalah ubah filter status, kategori, atau bersihkan kata kunci pencarian.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setStatusFilter("ALL");
              setTierFilter("ALL");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const tierStyle = getTierBadgeStyle(badge.tier);
            const progressPct = Math.min(100, Math.round((badge.currentValue / badge.targetValue) * 100));

            return (
              <div
                key={badge.id}
                onClick={() => handleOpenCertificate(badge)}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                  badge.isUnlocked
                    ? `${tierStyle.cardBorder} hover:scale-[1.01]`
                    : "border-slate-200 opacity-90 hover:border-slate-300"
                }`}
              >
                {/* Subtle Tier Radiant Background Glow */}
                <div
                  className={`absolute right-0 top-0 w-44 h-44 bg-gradient-to-bl ${tierStyle.glow} rounded-full blur-2xl pointer-events-none`}
                ></div>

                {/* Card Top: Tier Chip, Category, and Status */}
                <div className="relative z-10 flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${tierStyle.chip}`}
                    >
                      {tierStyle.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {badge.category === "streak"
                        ? "Istiqomah"
                        : badge.category === "discipline"
                        ? "Waktu Fajar/Senja"
                        : badge.category === "volume"
                        ? "Volume Repetisi"
                        : "Tartil & Irama"}
                    </span>
                  </div>

                  {/* Unlocked / Locked Pill */}
                  {badge.isUnlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                      Diraih
                    </span>
                  ) : badge.currentValue > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                      {progressPct}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium text-[10px]">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Terkunci
                    </span>
                  )}
                </div>

                {/* Card Body: Icon + Badge Titles */}
                <div className="relative z-10 flex items-start gap-3.5 mb-4">
                  {/* Badge Emblem */}
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${
                      badge.isUnlocked
                        ? tierStyle.iconBg
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {renderBadgeIcon(badge.iconName, "w-6 h-6")}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                      <span>{badge.name}</span>
                      {badge.isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                      {badge.indonesianTitle}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Target */}
                <div className="relative z-10 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      {badge.isUnlocked ? "Tuntas Tercapai!" : "Progres Pencapaian"}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {badge.currentValue} / {badge.targetValue} {badge.unit}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.isUnlocked
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-amber-400 to-amber-500"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>

                  {/* Card Bottom: Points and Action Hint */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      +{badge.rewardPoints} Poin Amal
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Detail & Dalil</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK ACCESS ACTIONS BANNER */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Siap Menambah Lencana Baru Hari Ini?</h4>
            <p className="text-xs text-emerald-800">
              Pilih wirid Dzikir Pagi, Dzikir Petang, atau putar Tasbih Bebas untuk terus memperkuat streak istiqomah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => onNavigateToTab("morning")}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Dzikir Pagi</span>
          </button>
          <button
            onClick={() => onNavigateToTab("evening")}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dzikir Petang</span>
          </button>
          <button
            onClick={() => onNavigateToTab("free_tasbih")}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tasbih Bebas</span>
          </button>
        </div>
      </div>

      {/* DETAILED BADGE CERTIFICATE & DALIL MODAL */}
      {activeModalBadge && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden relative">
            {/* Top Ornamental Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 border border-emerald-600 text-emerald-300 text-[11px] font-bold">
                    SERTIFIKAT LENCANA AS-SUNNAH
                  </span>
                  <span className="text-xs text-amber-300 font-semibold font-mono">
                    ID: {activeModalBadge.code}
                  </span>
                </div>

                <button
                  onClick={() => setActiveModalBadge(null)}
                  className="p-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 transition"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Badge Hero Presentation */}
              <div className="relative z-10 mt-5 flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-white/10 ${
                    activeModalBadge.isUnlocked
                      ? getTierBadgeStyle(activeModalBadge.tier).iconBg
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {renderBadgeIcon(activeModalBadge.iconName, "w-10 h-10")}
                </div>

                <div className="pt-2">
                  <div className="text-xs font-bold text-amber-300 tracking-wider uppercase">
                    {activeModalBadge.name}
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    {activeModalBadge.indonesianTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold border border-emerald-600/50">
                    Tingkat: {getTierBadgeStyle(activeModalBadge.tier).label}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3.5 h-3.5 text-slate-950" />
                    +{activeModalBadge.rewardPoints} Poin
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Description & Requirements */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Deskripsi & Syarat Peraihan
                </h5>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {activeModalBadge.description}
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <Target className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Syarat: </span>
                    {activeModalBadge.requirementDescription}
                  </div>
                </div>
              </div>

              {/* Current Progress Indicator */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">Status Pencapaian Anda:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {activeModalBadge.currentValue} / {activeModalBadge.targetValue} {activeModalBadge.unit}
                  </span>
                </div>
                <div className="w-full bg-emerald-200/70 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((activeModalBadge.currentValue / activeModalBadge.targetValue) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                  {activeModalBadge.isUnlocked ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Alhamdulillah, lencana ini telah berhasil Anda raih!</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        Tersisa {Math.max(0, activeModalBadge.targetValue - activeModalBadge.currentValue)}{" "}
                        {activeModalBadge.unit} lagi untuk membuka lencana ini.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Hadits / Quranic Dalil Reference */}
              {activeModalBadge.dalilReference && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <BookmarkCheck className="w-4 h-4 text-amber-700" />
                    <span>Dalil As-Sunnah Terkait</span>
                  </div>

                  {activeModalBadge.dalilReference.arabic && (
                    <div className="text-right text-lg font-arabic font-bold text-amber-950 leading-loose">
                      {activeModalBadge.dalilReference.arabic}
                    </div>
                  )}

                  <p className="text-xs text-amber-950/90 italic leading-relaxed">
                    &ldquo;{activeModalBadge.dalilReference.translation}&rdquo;
                  </p>

                  <div className="text-[11px] font-semibold text-amber-800 text-right">
                    — {activeModalBadge.dalilReference.source}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleCopyBadgeShare(activeModalBadge)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                {copiedShareText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Teks Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>Bagikan Prestasi</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {activeModalBadge.isUnlocked && (
                  <button
                    onClick={() => {
                      playBadgeChime();
                      confetti({
                        particleCount: 40,
                        spread: 50,
                        origin: { y: 0.6 },
                      });
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs font-bold transition flex items-center gap-1"
                    title="Putar nada perayaan"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Rayakan</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveModalBadge(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
