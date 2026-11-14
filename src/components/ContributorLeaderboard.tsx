import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Heart,
  Star,
  Search,
  Filter,
  Calendar,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Flame,
  X,
  ChevronRight,
  ChevronDown,
  Shield,
  ThumbsUp,
  Activity,
  PlusCircle,
  Zap,
  History,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ContributorLeaderboardItem, PlaqueTier } from "../types";
import { INITIAL_CONTRIBUTOR_LEADERBOARD } from "../data/leaderboardData";

interface ContributorLeaderboardProps {
  currentUserName?: string;
  currentUserRole?: string;
  currentUserKelurahan?: string;
  onViewPlaque?: (plaqueId?: string) => void;
  onViewTimeline?: (userName?: string) => void;
}

export default function ContributorLeaderboard({
  currentUserName = "dr. H. Rahmat Pratama, Sp.PD",
  currentUserRole = "Dokter Spesialis Penyakit Dalam",
  currentUserKelurahan = "Sukamulya",
  onViewPlaque,
  onViewTimeline,
}: ContributorLeaderboardProps) {
  // Stored Leaderboard items with LocalStorage persistence
  const [leaderboardData, setLeaderboardData] = useState<ContributorLeaderboardItem[]>(() => {
    try {
      const saved = localStorage.getItem("islamicity_leaderboard_contributors_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_CONTRIBUTOR_LEADERBOARD;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("islamicity_leaderboard_contributors_v1", JSON.stringify(leaderboardData));
    } catch {
      // ignore
    }
  }, [leaderboardData]);

  // Filters State
  const [timeframe, setTimeframe] = useState<"all_time" | "year_1447" | "month_current">("all_time");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Quick Action Modal for Logging Mosque Participation
  const [isLogActivityModalOpen, setIsLogActivityModalOpen] = useState<boolean>(false);
  const [activityForm, setActivityForm] = useState({
    activityType: "Sholat Subuh Berjamaah",
    hours: 2,
    notes: "Menghadiri sholat subuh berjamaah dan kajian rutin di masjid.",
  });

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered & Sorted Leaderboard
  const filteredLeaderboard = useMemo(() => {
    return leaderboardData
      .filter((item) => {
        // Category filter
        if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
        // Kelurahan filter
        if (selectedKelurahan !== "all" && item.kelurahan !== selectedKelurahan) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.fullName.toLowerCase().includes(q);
          const matchRole = item.roleTitle.toLowerCase().includes(q);
          const matchMasjid = item.masjid.toLowerCase().includes(q);
          const matchBadges = item.badges.some((b) => b.toLowerCase().includes(q));
          if (!matchName && !matchRole && !matchMasjid && !matchBadges) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }, [leaderboardData, selectedCategory, selectedKelurahan, searchQuery]);

  // Find Current User from Leaderboard
  const currentUserItem = useMemo(() => {
    return (
      leaderboardData.find((item) => item.isCurrentUser || item.fullName === currentUserName) ||
      leaderboardData[1] // fallback to dr. Rahmat Pratama
    );
  }, [leaderboardData, currentUserName]);

  // Current User Rank Index
  const currentUserRankIndex = useMemo(() => {
    const sorted = [...leaderboardData].sort((a, b) => b.compositeScore - a.compositeScore);
    const idx = sorted.findIndex((i) => i.id === currentUserItem.id);
    return idx >= 0 ? idx + 1 : 2;
  }, [leaderboardData, currentUserItem]);

  // Handle Quick Prayer / Kudos (+5 Points & +1 Prayer)
  const handleGivePrayer = (e: React.MouseEvent, itemId: string, name: string) => {
    e.stopPropagation();
    try {
      confetti({
        particleCount: 30,
        spread: 65,
        origin: { y: 0.8 },
        colors: ["#f59e0b", "#10b981", "#fbbf24"],
      });
    } catch {
      // ignore
    }

    setLeaderboardData((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newPrayersCount = item.prayersReceivedCount + 1;
          const newPlaqueScore = Math.min(100, item.digitalPlaqueScore + 0.5);
          const newComposite = Math.min(1000, item.compositeScore + 5);
          const newProgress = Math.min(100, item.progressToNextRankPercentage + 0.5);
          return {
            ...item,
            prayersReceivedCount: newPrayersCount,
            digitalPlaqueScore: Number(newPlaqueScore.toFixed(1)),
            compositeScore: newComposite,
            progressToNextRankPercentage: Number(newProgress.toFixed(1)),
          };
        }
        return item;
      })
    );

    showToast(`Alhamdulillah! Doa kebaikan untuk "${name}" terkirim (+5 poin apresiasi).`);
  };

  // Handle Log Activity Submit
  const handleLogActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      confetti({
        particleCount: 45,
        spread: 75,
        origin: { y: 0.7 },
        colors: ["#10b981", "#38bdf8", "#f59e0b"],
      });
    } catch {
      // ignore
    }

    setLeaderboardData((prev) =>
      prev.map((item) => {
        if (item.id === currentUserItem.id) {
          const newHours = item.volunteerHours + Number(activityForm.hours);
          const newAttendance = item.mosqueAttendanceCount + 1;
          const newStreak = item.subuhStreakDays + (activityForm.activityType.includes("Subuh") ? 1 : 0);
          const newMosqueScore = Math.min(100, item.mosqueParticipationScore + 1.5);
          const newComposite = Math.min(1000, item.compositeScore + 25);
          const newProgress = Math.min(100, item.progressToNextRankPercentage + 2.5);

          return {
            ...item,
            volunteerHours: newHours,
            mosqueAttendanceCount: newAttendance,
            subuhStreakDays: newStreak,
            mosqueParticipationScore: Number(newMosqueScore.toFixed(1)),
            compositeScore: newComposite,
            progressToNextRankPercentage: Number(newProgress.toFixed(1)),
            recentActivity: `${activityForm.activityType}: ${activityForm.notes}`,
            lastActiveTimestamp: "Baru saja",
          };
        }
        return item;
      })
    );

    setIsLogActivityModalOpen(false);
    showToast("Aktivitas kemakmuran masjid tercatat! Progress bar Anda telah meningkat (+25 poin).");
  };

  // Color & Badge Helper based on Rank Level
  const getRankLevelBadge = (level: ContributorLeaderboardItem["currentRankLevel"]) => {
    switch (level) {
      case "Khadimul Ummah Utama":
        return {
          badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/60",
          barColor: "from-amber-500 via-yellow-400 to-amber-300",
          glow: "shadow-amber-500/20",
          icon: "👑",
        };
      case "Teladan Emas":
        return {
          badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/60",
          barColor: "from-emerald-500 via-teal-400 to-emerald-300",
          glow: "shadow-emerald-500/20",
          icon: "🌟",
        };
      case "Bintang Istiqomah":
        return {
          badgeClass: "bg-sky-500/20 text-sky-300 border-sky-400/60",
          barColor: "from-sky-500 via-blue-400 to-sky-300",
          glow: "shadow-sky-500/20",
          icon: "⭐",
        };
      case "Pengabdi Harapan":
        return {
          badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-400/60",
          barColor: "from-indigo-500 via-purple-400 to-indigo-300",
          glow: "shadow-indigo-500/20",
          icon: "💠",
        };
      case "Pejuang Khidmah":
      default:
        return {
          badgeClass: "bg-purple-500/20 text-purple-300 border-purple-400/60",
          barColor: "from-purple-500 via-fuchsia-400 to-purple-300",
          glow: "shadow-purple-500/20",
          icon: "✨",
        };
    }
  };

  // Top 3 Podium Items
  const topThree = filteredLeaderboard.slice(0, 3);

  return (
    <div id="contributor-leaderboard-widget" className="space-y-6">
      {/* Hero Header & Scoring Rule Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950/80 to-slate-900 rounded-2xl p-6 sm:p-7 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-2.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard & Rekognisi Pengabdi Rumah Allah</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Papan Peringkat Pengabdi Masjid</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-400/40 text-amber-300">
                Progress Bar Ranking
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
              Perhitungan peringkat terintegrasi yang menggabungkan{" "}
              <strong className="text-amber-300">Partisipasi Kemakmuran Masjid (50%)</strong> (sholat subuh berjamaah,
              kehadiran taklim & jam khidmah) dan{" "}
              <strong className="text-emerald-300">Aktivitas Prasasti Kehormatan (50%)</strong> (tahun pengabdian,
              tingkat prasasti digital & untaian doa jamaah).
            </p>
          </div>

          {/* Quick Action Button to Log Activity */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-log-mosque-activity"
              onClick={() => setIsLogActivityModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Catat Kehadiran / Aktivitas (+25 Poin)</span>
            </button>
          </div>
        </div>

        {/* Scoring Weights Formula Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-800/90 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/40">
            <div className="text-slate-400 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Subuh & Partisipasi Masjid
              </span>
              <span className="text-amber-300 font-bold">50% Bobot</span>
            </div>
            <div className="text-slate-200 text-[11px] mt-1">Sholat Subuh Berjamaah, Baksos & Jam Khidmah</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/40">
            <div className="text-slate-400 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Prasasti & Doa Jamaah
              </span>
              <span className="text-emerald-300 font-bold">50% Bobot</span>
            </div>
            <div className="text-slate-200 text-[11px] mt-1">Tahun Pengabdian, Tier Prasasti & Doa Kebaikan</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/40">
            <div className="text-slate-400 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                Top Score Saat Ini
              </span>
              <span className="text-yellow-400 font-bold">970 / 1000 Poin</span>
            </div>
            <div className="text-slate-200 text-[11px] mt-1">H. Abdullah Manaf (28 Thn Khidmah)</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/40">
            <div className="text-slate-400 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                Peringkat Anda
              </span>
              <span className="text-sky-300 font-bold">Rank #{currentUserRankIndex}</span>
            </div>
            <div className="text-slate-200 text-[11px] mt-1">{currentUserItem.compositeScore} Poin (Teladan Emas)</div>
          </div>
        </div>
      </div>

      {/* Current User Personal Progress Tracker Widget (Highlighted Card with Progress Bars) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-emerald-400/50 shrink-0"
              style={{ backgroundColor: currentUserItem.avatarColor }}
            >
              👨‍⚕️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Posisi Anda Saat Ini: Rank #{currentUserRankIndex}
                </span>
                <span className="text-xs text-slate-400">{currentUserItem.currentRankLevel}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{currentUserItem.fullName}</h3>
              <p className="text-xs text-slate-400">
                {currentUserItem.roleTitle} • {currentUserItem.masjid} ({currentUserItem.kelurahan})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="text-right pr-1">
              <div className="text-[11px] text-slate-400 font-medium">Skor Komposit Anda</div>
              <div className="text-xl font-black text-emerald-400">{currentUserItem.compositeScore} / 1000 Poin</div>
            </div>
            {onViewTimeline && (
              <button
                id="btn-open-user-timeline"
                onClick={() => onViewTimeline(currentUserItem.fullName)}
                className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Buka Linimasa Riwayat Khidmah & Presensi"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Linimasa Riwayat</span>
              </button>
            )}
            <button
              onClick={() => setIsLogActivityModalOpen(true)}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
              title="Tambah Aktivitas Sekarang"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar Towards Next Rank */}
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Progress Menuju Gelar:{" "}
                <strong className="text-amber-300 font-bold">{currentUserItem.nextRankTitle}</strong>
              </span>
              <span className="text-emerald-400 font-black text-xs">
                {currentUserItem.progressToNextRankPercentage}%
              </span>
            </div>

            {/* Custom Multi-Segment / Glowing Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-700/80 shadow-inner relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentUserItem.progressToNextRankPercentage}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 relative shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </motion.div>

              {/* Milestone Ticks */}
              <div className="absolute inset-0 flex justify-between px-6 pointer-events-none">
                <span className="h-full w-0.5 bg-slate-800" />
                <span className="h-full w-0.5 bg-slate-800" />
                <span className="h-full w-0.5 bg-slate-800" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>Mulai (0 Poin)</span>
              <span>250 Pts (Bintang)</span>
              <span>500 Pts (Teladan)</span>
              <span>750 Pts (Utama)</span>
              <span>1000 Pts (Puncak)</span>
            </div>
          </div>

          {/* Sub-Metric Progress Bars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            {/* 1. Subuh & Attendance */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Subuh & Sholat
                </span>
                <span className="text-amber-300 font-bold">{currentUserItem.mosqueParticipationScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentUserItem.mosqueParticipationScore}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Streak: {currentUserItem.subuhStreakDays} Hari</span>
                <span>{currentUserItem.mosqueAttendanceCount} Kehadiran</span>
              </div>
            </div>

            {/* 2. Volunteer Hours */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Jam Khidmah
                </span>
                <span className="text-emerald-300 font-bold">
                  {Math.min(100, Math.round((currentUserItem.volunteerHours / 700) * 100))}%
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((currentUserItem.volunteerHours / 700) * 100))}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>{currentUserItem.volunteerHours} Jam Terverifikasi</span>
                <span>Target: 700 Jam</span>
              </div>
            </div>

            {/* 3. Plaque & Prayers Received */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" /> Prasasti & Doa
                </span>
                <span className="text-rose-300 font-bold">{currentUserItem.digitalPlaqueScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentUserItem.digitalPlaqueScore}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>{currentUserItem.prayersReceivedCount} Doa Jamaah</span>
                <span>Tier: {currentUserItem.plaqueTier.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Visual Showcase */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Podium 3 Besar Pengabdi Teladan</span>
          </h3>
          <span className="text-xs text-slate-400">Pembaruan Real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((item, idx) => {
            const rank = idx + 1;
            const rankStyle =
              rank === 1
                ? {
                    border: "border-amber-400/70 shadow-amber-500/20 bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950",
                    crownColor: "text-yellow-300",
                    badge: "bg-amber-400 text-slate-950 font-black",
                    label: "JUARA 1 KHADIMUL UMMAH",
                  }
                : rank === 2
                ? {
                    border: "border-emerald-400/60 shadow-emerald-500/20 bg-gradient-to-b from-emerald-950/80 via-slate-900 to-slate-950",
                    crownColor: "text-emerald-300",
                    badge: "bg-emerald-400 text-slate-950 font-bold",
                    label: "JUARA 2 TELADAN KHIDMAH",
                  }
                : {
                    border: "border-sky-400/50 shadow-sky-500/15 bg-gradient-to-b from-sky-950/80 via-slate-900 to-slate-950",
                    crownColor: "text-sky-300",
                    badge: "bg-sky-400 text-slate-950 font-bold",
                    label: "JUARA 3 PEJUANG ISTIQOMAH",
                  };

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                className={`rounded-2xl border-2 ${rankStyle.border} p-5 relative overflow-hidden shadow-xl flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${rankStyle.badge}`}>{rankStyle.label}</span>
                  <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
                    <Trophy className={`w-3.5 h-3.5 ${rankStyle.crownColor}`} />
                    <span>#{rank}</span>
                  </div>
                </div>

                <div className="text-center my-3">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white/30 mb-2 relative"
                    style={{ backgroundColor: item.avatarColor }}
                  >
                    {item.isMemorial ? "🕊️" : item.fullName.replace(/K\.H\.|dr\.|H\.|Ust\.|Ir\./gi, "").trim()[0] || "T"}
                    <span className="absolute -top-2 -right-2 text-base">
                      {rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉"}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base leading-snug">{item.fullName}</h4>
                  <p className="text-xs text-amber-300/90 font-medium line-clamp-1 mt-0.5">{item.roleTitle}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.masjid}</p>
                </div>

                {/* Progress Bar in Podium Card */}
                <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 font-semibold">Skor Total Khidmah:</span>
                    <span className="text-amber-300 font-black text-sm">{item.compositeScore} Pts</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getRankLevelBadge(item.currentRankLevel).barColor}`}
                      style={{ width: `${item.progressToNextRankPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {item.subuhStreakDays} Hari Subuh
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      {item.prayersReceivedCount} Doa
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={(e) => handleGivePrayer(e, item.id, item.fullName)}
                    className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition transform active:scale-95"
                  >
                    <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                    <span>Kirim Doa (+5 Pts)</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar for Full Leaderboard Table */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Timeframe Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setTimeframe("all_time")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                timeframe === "all_time"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🏆 Sepanjang Masa (Hall of Fame)
            </button>
            <button
              onClick={() => setTimeframe("year_1447")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                timeframe === "year_1447"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              📅 Tahun 1447 H / 2026
            </button>
            <button
              onClick={() => setTimeframe("month_current")}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                timeframe === "month_current"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🌙 Bulan Berjalan
            </button>
          </div>

          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pengabdi, peran, atau masjid..."
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

      {/* Full Leaderboard List with Progress Bar UI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-semibold">
          <span>Menampilkan {filteredLeaderboard.length} Pengabdi Terdaftar</span>
          <span>Klik baris untuk rincian breakdown partisipasi</span>
        </div>

        {filteredLeaderboard.map((item, index) => {
          const rank = index + 1;
          const rankLevelInfo = getRankLevelBadge(item.currentRankLevel);
          const isExpanded = expandedItemId === item.id;
          const isUser = item.isCurrentUser || item.fullName === currentUserName;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className={`rounded-2xl border transition-all ${
                isUser
                  ? "bg-slate-900/95 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30"
                  : rank === 1
                  ? "bg-slate-900/90 border-amber-500/50 shadow-md"
                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
              } p-4 sm:p-5`}
            >
              <div
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
              >
                {/* Left Side: Rank, Avatar, Identity */}
                <div className="flex items-center gap-3.5 min-w-[280px]">
                  {/* Rank Number Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                      rank === 1
                        ? "bg-amber-400 text-slate-950 font-black shadow-amber-500/30"
                        : rank === 2
                        ? "bg-slate-300 text-slate-950 font-black"
                        : rank === 3
                        ? "bg-amber-700 text-white font-black"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 border border-white/20"
                    style={{ backgroundColor: item.avatarColor }}
                  >
                    {item.isMemorial ? "🕊️" : item.fullName.replace(/K\.H\.|dr\.|H\.|Ust\.|Ir\./gi, "").trim()[0] || "T"}
                  </div>

                  {/* Name & Role */}
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm hover:text-amber-300 transition">
                        {item.fullName}
                      </h4>
                      {isUser && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          Anda
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.2 rounded-full border ${rankLevelInfo.badgeClass}`}>
                        {rankLevelInfo.icon} {item.currentRankLevel}
                      </span>
                    </div>
                    <p className="text-xs text-amber-300/80 font-medium truncate mt-0.5">{item.roleTitle}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {item.masjid}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">{item.kelurahan}</span>
                    </div>
                  </div>
                </div>

                {/* Center / Right: Main Composite Progress Bar */}
                <div className="flex-1 max-w-xl space-y-1.5 px-0 lg:px-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span>Total Skor Khidmah:</span>
                      <strong className="text-amber-300 font-bold">{item.compositeScore} Poin</strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {item.progressToNextRankPercentage}% Menuju {item.nextRankTitle}
                    </span>
                  </div>

                  {/* Visual Progress Bar UI */}
                  <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${rankLevelInfo.barColor} transition-all duration-500`}
                      style={{ width: `${item.progressToNextRankPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Flame className="w-3 h-3" />
                      {item.subuhStreakDays} Hari Subuh
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Clock className="w-3 h-3" />
                      {item.volunteerHours} Jam Khidmah
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3 h-3" />
                      {item.prayersReceivedCount} Doa Jamaah
                    </span>
                  </div>
                </div>

                {/* Actions: Send Prayer & Toggle Details */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 justify-end">
                  <button
                    onClick={(e) => handleGivePrayer(e, item.id, item.fullName)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition transform active:scale-95 cursor-pointer"
                    title="Kirim Doa Apresiasi (+5 Poin)"
                  >
                    <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                    <span>Kirim Doa</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedItemId(isExpanded ? null : item.id);
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Detailed Breakdown Section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 pt-4 border-t border-slate-800/90 space-y-3.5 text-xs overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Detailed Progress Metrics */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-amber-400" />
                          <span>Rincian Partisipasi & Digital Plaque Activity:</span>
                        </div>

                        {/* Metric 1: Mosque Attendance & Subuh Streak */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300">
                              Partisipasi Sholat Subuh & Masjid ({item.mosqueAttendanceCount} Kali):
                            </span>
                            <span className="text-amber-300 font-bold">{item.mosqueParticipationScore}%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full"
                              style={{ width: `${item.mosqueParticipationScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Metric 2: Volunteer Hours */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300">
                              Jam Khidmah Relawan & Baksos ({item.volunteerHours} Jam):
                            </span>
                            <span className="text-emerald-300 font-bold">
                              {Math.min(100, Math.round((item.volunteerHours / 700) * 100))}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-400 h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Math.round((item.volunteerHours / 700) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Metric 3: Digital Plaque Score & Community Prayers */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300">
                              Apresiasi Prasasti Kehormatan ({item.plaqueTier.toUpperCase()} - {item.yearsOfDedication} Thn):
                            </span>
                            <span className="text-rose-300 font-bold">{item.digitalPlaqueScore}%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-rose-400 h-full rounded-full"
                              style={{ width: `${item.digitalPlaqueScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Badges, Recent Activity & Plaque Info */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>Lencana Kehormatan & Jejak Khidmah:</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            {item.badges.map((badge, bIdx) => (
                              <span
                                key={bIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-slate-700 text-[10px] font-semibold"
                              >
                                🏅 {badge}
                              </span>
                            ))}
                          </div>

                          <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                            <strong className="text-slate-300">Aktivitas Terakhir:</strong> {item.recentActivity}
                            <div className="text-[10px] text-slate-500 mt-0.5">Waktu: {item.lastActiveTimestamp}</div>
                          </div>
                        </div>

                        {/* Action Link to Digital Mosque Honors & Contribution Timeline */}
                        <div className="pt-2 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">
                            Prasasti: {item.plaqueTitle}
                          </span>
                          <div className="flex items-center gap-2">
                            {onViewTimeline && (
                              <button
                                onClick={() => onViewTimeline(item.fullName)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-amber-300 hover:text-white border border-slate-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5 text-amber-400" />
                                <span>Linimasa Riwayat</span>
                              </button>
                            )}
                            {onViewPlaque && (
                              <button
                                onClick={() => onViewPlaque(item.id)}
                                className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
                              >
                                <span>Lihat Prasasti</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Log Activity Modal (Check-in & Boost Progress Bar) */}
      {isLogActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Catat Kehadiran & Partisipasi Masjid</h3>
                  <p className="text-xs text-slate-400">Tingkatkan Skor Leaderboard & Progress Bar Anda</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogActivityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogActivitySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Jenis Partisipasi</label>
                <select
                  value={activityForm.activityType}
                  onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="Sholat Subuh Berjamaah (+1 Hari Streak)">
                    🌅 Sholat Subuh Berjamaah (+1 Hari Streak)
                  </option>
                  <option value="Homecare & Baksos Medis Dhuafa">
                    🏥 Homecare & Baksos Medis Dhuafa
                  </option>
                  <option value="Khidmah Kebersihan & Gotong Royong Masjid">
                    🧹 Khidmah Kebersihan & Gotong Royong Masjid
                  </option>
                  <option value="Kajian Dhuha & Pembinaan Santri Tahfidz">
                    📖 Kajian Dhuha & Pembinaan Santri Tahfidz
                  </option>
                  <option value="Penyelenggaraan Janazah & Dapur Berkah">
                    🍲 Penyelenggaraan Janazah & Dapur Berkah
                  </option>
                  <option value="Digitalisasi & IT Dakwah">
                    💻 Digitalisasi & IT Dakwah
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Durasi Khidmah (Jam)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={activityForm.hours}
                  onChange={(e) => setActivityForm({ ...activityForm, hours: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan / Laporan Singkat</label>
                <textarea
                  rows={3}
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  placeholder="Ceritakan ringkas kegiatan amal / partisipasi yang dilakukan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Setiap aktivitas yang dicatat akan menambah <strong>+25 Poin</strong> ke skor komposit Anda dan
                  memajukan progress bar ranking.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
                >
                  Simpan & Tambah Poin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-emerald-500/50 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
