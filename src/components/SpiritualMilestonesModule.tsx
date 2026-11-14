import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  Sparkles,
  Target,
  Trophy,
  Sun,
  Moon,
  Star,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Heart,
  HeartHandshake,
  Zap,
  RotateCcw,
  Plus,
  Share2,
  Copy,
  Check,
  Search,
  Filter,
  Info,
  X,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Volume2,
  BookOpen,
} from "lucide-react";
import { DhikrAchievementBadge, DhikrBadgeTier } from "../types";

// Audio chime for milestone achievement unlocked
const playMilestoneUnlockChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 - E5 - G5 - C6 - E6
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
    // Autoplay policy
  }
};

export interface SpiritualMilestoneDef {
  id: string;
  code: string;
  name: string;
  indonesianTitle: string;
  description: string;
  countTarget: number;
  unit: string;
  tier: DhikrBadgeTier;
  iconName: string;
  dalilReference: {
    arabic?: string;
    translation: string;
    source: string;
  };
  rewardPoints: number;
}

export const SPIRITUAL_MILESTONES_CATALOG: SpiritualMilestoneDef[] = [
  {
    id: "milestone-33-first-steps",
    code: "FIRST_STEPS_33",
    name: "First Steps of Tasbih",
    indonesianTitle: "Langkah Awal Tasbih Fatimah",
    description: "Melafalkan 33 repetisi pertama kalimat thayyibah dengan penuh kehadiran hati.",
    countTarget: 33,
    unit: "Repetisi Dzikir",
    tier: "bronze",
    iconName: "Sparkles",
    dalilReference: {
      arabic: "تُسَبِّحُونَ وَتَحْمَدُونَ وَتُكَبِّرُونَ دُبُرَ كُلِّ صَلاَةٍ ثَلاَثًا وَثَلاَثِينَ",
      translation: "Bertasbihlah kalian, bertahmidlah, dan bertakbirlah setiap selesai shalat sebanyak 33 kali.",
      source: "HR. Bukhari no. 843 & Muslim no. 595",
    },
    rewardPoints: 30,
  },
  {
    id: "milestone-70-istighfar-sunnah",
    code: "ISTIGHFAR_SUNNAH_70",
    name: "Sunnah of Repentance",
    indonesianTitle: "Penyuci Jiwa 70 Istighfar",
    description: "Mencapai minimal 70 repetisi istighfar harian meneladani kebiasaan Rasulullah SAW.",
    countTarget: 70,
    unit: "Repetisi Dzikir",
    tier: "bronze",
    iconName: "HeartHandshake",
    dalilReference: {
      arabic: "وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً",
      translation: "Demi Allah, sesungguhnya aku beristighfar kepada Allah dan bertaubat kepada-Nya dalam sehari lebih dari 70 kali.",
      source: "HR. Bukhari no. 6307",
    },
    rewardPoints: 45,
  },
  {
    id: "milestone-99-prayer-tasbih",
    code: "PRAYER_TASBIH_99",
    name: "Ba'da Shalat Complete",
    indonesianTitle: "Khatam Wirid Ba'da Shalat (99x)",
    description: "Menyelesaikan putaran 99 repetisi (33x Subhanallah, 33x Alhamdulillah, 33x Allahu Akbar).",
    countTarget: 99,
    unit: "Repetisi Dzikir",
    tier: "bronze",
    iconName: "Target",
    dalilReference: {
      arabic: "مَنْ سَبَّحَ اللَّهَ فِي دُبُرِ كُلِّ صَلاَةٍ ثَلاَثًا وَثَلاَثِينَ...",
      translation: "Barangsiapa bertasbih 33 kali, bertahmid 33 kali, bertakbir 33 kali, diampuni kesalahannya meski sebanyak buih di lautan.",
      source: "HR. Muslim no. 597",
    },
    rewardPoints: 50,
  },
  {
    id: "milestone-100-century-mizan",
    code: "CENTURY_MIZAN_100",
    name: "Century Praiser",
    indonesianTitle: "Pengetuk Ratusan Mizan (100x)",
    description: "Melafalkan 100 repetisi dzikir tasbih mizan dalam satu hari pembuka pengampunan dosa.",
    countTarget: 100,
    unit: "Repetisi Dzikir",
    tier: "bronze",
    iconName: "CheckCircle2",
    dalilReference: {
      arabic: "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ",
      translation: "Barangsiapa mengucapkan 'Subhanallahi wa bihamdihi' seratus kali dalam sehari, maka dosa-dosanya akan digugurkan.",
      source: "HR. Bukhari no. 6405 & Muslim no. 2691",
    },
    rewardPoints: 60,
  },
  {
    id: "milestone-300-kaffah-target",
    code: "KAFFAH_TARGET_300",
    name: "Kaffah Target Achiever",
    indonesianTitle: "Pemberat Timbangan Mizan (300x)",
    description: "Menuntaskan seluruh target wirid harian kaffah minimal 300 repetisi dzikir.",
    countTarget: 300,
    unit: "Repetisi Dzikir",
    tier: "silver",
    iconName: "Trophy",
    dalilReference: {
      arabic: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ",
      translation: "Dua kalimat yang ringan di lisan, berat di timbangan, dan dicintai Ar-Rahman: Subhanallahi wa bihamdih, Subhanallahil 'Azhim.",
      source: "HR. Bukhari no. 6406 & Muslim no. 2694",
    },
    rewardPoints: 90,
  },
  {
    id: "milestone-500-dawn-guardian",
    code: "DAWN_GUARDIAN_500",
    name: "Penaung Fajar & Senja",
    indonesianTitle: "Penaung Fajar & Senja (500x)",
    description: "Mencapai akumulasi 500 repetisi dzikir, menjaga benteng hati siang dan malam.",
    countTarget: 500,
    unit: "Repetisi Dzikir",
    tier: "silver",
    iconName: "Sun",
    dalilReference: {
      arabic: "فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ",
      translation: "Maka bertasbihlah kepada Allah di waktu kamu berada di petang hari dan waktu kamu berada di waktu subuh.",
      source: "QS. Ar-Rum: 17",
    },
    rewardPoints: 120,
  },
  {
    id: "milestone-1000-millennium-praiser",
    code: "MILLENNIUM_1000",
    name: "Millennium Praiser",
    indonesianTitle: "Seribu Kalimat Thayyibah (1,000x)",
    description: "Mencapai akumulasi 1.000 repetisi dzikir seumur hidup di aplikasi abdi dakwah.",
    countTarget: 1000,
    unit: "Repetisi Dzikir",
    tier: "gold",
    iconName: "Award",
    dalilReference: {
      arabic: "أَيَعْجِزُ أَحَدُكُمْ أَنْ يَكْسِبَ كُلَّ يَوْمٍ أَلْفَ حَسَنَةٍ؟ يُسَبِّحُ مِائَةَ تَسْبِيحَةٍ فَيُكْتَبُ لَهُ أَلْفُ حَسَنَةٍ",
      translation: "Apakah salah seorang dari kalian tidak mampu meraih 1.000 kebaikan setiap hari? Yaitu bertasbih 100 kali, dicatat baginya 1.000 kebaikan.",
      source: "HR. Muslim no. 2698",
    },
    rewardPoints: 200,
  },
  {
    id: "milestone-3000-star-of-istiqomah",
    code: "STAR_ISTIQOMAH_3000",
    name: "Star of Steadfastness",
    indonesianTitle: "Bintang Istiqomah (3,000x)",
    description: "Melafalkan akumulasi 3.000 repetisi wirid dan doa perlindungan yang mengakar.",
    countTarget: 3000,
    unit: "Repetisi Dzikir",
    tier: "gold",
    iconName: "Star",
    dalilReference: {
      arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ",
      translation: "Orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah.",
      source: "QS. Ar-Ra'd: 28",
    },
    rewardPoints: 300,
  },
  {
    id: "milestone-5000-pillar-al-mufarridun",
    code: "AL_MUFARRIDUN_5000",
    name: "Pillar of Al-Mufarridun",
    indonesianTitle: "Pilar Al-Mufarridun (5,000x)",
    description: "Mencapai 5.000 repetisi dzikir, menggapai derajat orang-orang yang mendahului dalam kebaikan.",
    countTarget: 5000,
    unit: "Repetisi Dzikir",
    tier: "diamond",
    iconName: "Flame",
    dalilReference: {
      arabic: "سَبَقَ الْمُفَرِّدُونَ... الذَّاكِرُونَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتُ",
      translation: "Telah mendahului orang-orang al-mufarridun... yaitu kaum laki-laki dan perempuan yang banyak berdzikir mengingat Allah.",
      source: "HR. Muslim no. 2676",
    },
    rewardPoints: 500,
  },
  {
    id: "milestone-10000-ocean-of-dhikr",
    code: "OCEAN_OF_DHIKR_10000",
    name: "Ocean of Remembrance",
    indonesianTitle: "Samudera Dzikir Kaffah (10,000x)",
    description: "Lencana kehormatan tertinggi atas tercapainya 10.000 repetisi dzikir sepanjang masa.",
    countTarget: 10000,
    unit: "Repetisi Dzikir",
    tier: "diamond",
    iconName: "ShieldCheck",
    dalilReference: {
      arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا وَسَبِّحُوهُ بُكْرَةً وَأَصِيلًا",
      translation: "Wahai orang-orang yang beriman! Ingatlah Allah dengan mengingat-Nya sebanyak-banyaknya, dan bertasbihlah kepada-Nya di waktu pagi dan petang.",
      source: "QS. Al-Ahzab: 41-42",
    },
    rewardPoints: 1000,
  },
];

interface SpiritualMilestonesModuleProps {
  onOpenDigitalCounter?: () => void;
  onOpenDailyDhikr?: () => void;
}

export default function SpiritualMilestonesModule({
  onOpenDigitalCounter,
  onOpenDailyDhikr,
}: SpiritualMilestonesModuleProps) {
  // Current user dhikr count tracking
  const [totalDhikrCount, setTotalDhikrCount] = useState<number>(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const dailyCount = parseInt(localStorage.getItem(`islamicity_counter_daily_${todayStr}`) || "0", 10);
      const lifetime = parseInt(localStorage.getItem("islamicity_lifetime_dhikr_count") || "0", 10);
      return Math.max(dailyCount, lifetime, 450); // friendly initial seed
    } catch {}
    return 450;
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNLOCKED" | "LOCKED">("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal celebration / certificate state
  const [activeBadgeModal, setActiveBadgeModal] = useState<SpiritualMilestoneDef | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [showDemoToolbar, setShowDemoToolbar] = useState<boolean>(false);

  // Sync count to localStorage
  const updateCount = (newCount: number) => {
    setTotalDhikrCount(newCount);
    try {
      localStorage.setItem("islamicity_lifetime_dhikr_count", newCount.toString());
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(`islamicity_counter_daily_${todayStr}`, newCount.toString());
    } catch {}
  };

  // Check which badges are unlocked
  const evaluatedBadges = useMemo(() => {
    return SPIRITUAL_MILESTONES_CATALOG.map((m) => {
      const isUnlocked = totalDhikrCount >= m.countTarget;
      const progressPct = Math.min(100, Math.round((totalDhikrCount / m.countTarget) * 100));
      return {
        ...m,
        isUnlocked,
        progressPct,
        currentCount: totalDhikrCount,
        remainingNeeded: Math.max(0, m.countTarget - totalDhikrCount),
      };
    });
  }, [totalDhikrCount]);

  // Next milestone to aim for
  const nextMilestone = useMemo(() => {
    return evaluatedBadges.find((b) => !b.isUnlocked) || null;
  }, [evaluatedBadges]);

  const unlockedCount = useMemo(() => {
    return evaluatedBadges.filter((b) => b.isUnlocked).length;
  }, [evaluatedBadges]);

  const totalPoints = useMemo(() => {
    return evaluatedBadges
      .filter((b) => b.isUnlocked)
      .reduce((acc, curr) => acc + curr.rewardPoints, 0);
  }, [evaluatedBadges]);

  // Filtered badges list
  const filteredBadges = useMemo(() => {
    return evaluatedBadges.filter((b) => {
      if (statusFilter === "UNLOCKED" && !b.isUnlocked) return false;
      if (statusFilter === "LOCKED" && b.isUnlocked) return false;
      if (tierFilter !== "ALL" && b.tier !== tierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.indonesianTitle.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.countTarget.toString().includes(q)
        );
      }
      return true;
    });
  }, [evaluatedBadges, statusFilter, tierFilter, searchQuery]);

  // Open certificate modal with celebration
  const handleOpenBadge = (badge: SpiritualMilestoneDef) => {
    setActiveBadgeModal(badge);
    setCopiedShare(false);
    if (totalDhikrCount >= badge.countTarget) {
      playMilestoneUnlockChime();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#10b981", "#f59e0b", "#38bdf8", "#fbbf24"],
        });
      } catch {}
    }
  };

  // Add reps simulation handler
  const handleAddReps = (amount: number) => {
    const next = totalDhikrCount + amount;
    updateCount(next);

    // Check if new milestone was unlocked
    const freshlyUnlocked = SPIRITUAL_MILESTONES_CATALOG.find(
      (m) => totalDhikrCount < m.countTarget && next >= m.countTarget
    );

    if (freshlyUnlocked) {
      playMilestoneUnlockChime();
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#e11d48"],
      });
      setActiveBadgeModal(freshlyUnlocked);
    }
  };

  // Render Lucide Icon helper
  const renderLucideIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Target":
        return <Target className={className} />;
      case "CheckCircle2":
        return <CheckCircle2 className={className} />;
      case "Trophy":
        return <Trophy className={className} />;
      case "Sun":
        return <Sun className={className} />;
      case "Moon":
        return <Moon className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Star":
        return <Star className={className} />;
      case "Flame":
        return <Flame className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "HeartHandshake":
        return <HeartHandshake className={className} />;
      case "Zap":
        return <Zap className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  // Tier appearance styling helper
  const getTierBadgeStyle = (tier: DhikrBadgeTier) => {
    switch (tier) {
      case "diamond":
        return {
          badge: "bg-cyan-950 text-cyan-200 border-cyan-400/60 shadow-cyan-900/30",
          cardBorder: "border-cyan-400/60 hover:border-cyan-300",
          glow: "from-cyan-500/20 via-teal-500/10 to-transparent",
          iconBg: "bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 text-white",
          label: "Berlian (Diamond)",
          ring: "ring-cyan-400/30",
        };
      case "gold":
        return {
          badge: "bg-amber-950 text-amber-200 border-amber-400/60 shadow-amber-900/30",
          cardBorder: "border-amber-400/60 hover:border-amber-300",
          glow: "from-amber-500/20 via-yellow-500/10 to-transparent",
          iconBg: "bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-bold",
          label: "Emas (Gold)",
          ring: "ring-amber-400/30",
        };
      case "silver":
        return {
          badge: "bg-slate-800 text-slate-200 border-slate-400/50 shadow-slate-900/30",
          cardBorder: "border-slate-300 hover:border-slate-400",
          glow: "from-slate-400/15 via-slate-500/10 to-transparent",
          iconBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white",
          label: "Perak (Silver)",
          ring: "ring-slate-400/30",
        };
      case "bronze":
      default:
        return {
          badge: "bg-amber-950/80 text-amber-300 border-amber-700/50",
          cardBorder: "border-amber-700/40 hover:border-amber-600",
          glow: "from-amber-700/15 via-orange-800/10 to-transparent",
          iconBg: "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100",
          label: "Perunggu (Bronze)",
          ring: "ring-amber-700/30",
        };
    }
  };

  // Copy Certificate Share
  const handleCopyCertificate = (b: SpiritualMilestoneDef) => {
    const text = `🏆 ✨ Alhamdulillah! Saya telah mencapai Spiritual Milestone Dzikir:
Lencana: "${b.indonesianTitle}" (${b.countTarget.toLocaleString("id-ID")} Repetisi)
Tier: ${b.tier.toUpperCase()}

📖 Dalil:
"${b.dalilReference.translation}"
(${b.dalilReference.source})

Total Repetisi Dzikir: ${totalDhikrCount.toLocaleString("id-ID")}x
Melalui Aplikasi ABDI Islamicity Kaffah (abdi.sematangborangcity.cloud)`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div id="spiritual-milestones-module" className="space-y-6 animate-fade-in">
      {/* HERO BANNER & STATS CARD */}
      <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 rounded-3xl p-6 sm:p-7 text-white border border-emerald-600/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>SPIRITUAL MILESTONES &amp; DIGITAL BADGES</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <span>Lencana Kehormatan Ruhani</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold uppercase tracking-wider">
                Milestones
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Rayakan setiap hembusan tasbih, tahmid, dan tahlil Anda. Buka lencana kehormatan digital berbasis repetisi
              wirid yang dicatat secara real-time, lengkap dengan dalil hadits shahih dan visualisasi kemajuan.
            </p>
          </div>

          {/* Quick Stats Pill Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-stretch lg:self-auto shrink-0">
            {/* Stat 1: Total Lifetime Reps */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-800/80 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Repetisi
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono pt-1">
                {totalDhikrCount.toLocaleString("id-ID")}
              </div>
              <span className="text-[10px] text-emerald-300 font-medium">wirid tercatat</span>
            </div>

            {/* Stat 2: Badges Unlocked */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-800/80 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Lencana Terbuka
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono pt-1">
                {unlockedCount} / {SPIRITUAL_MILESTONES_CATALOG.length}
              </div>
              <span className="text-[10px] text-emerald-300 font-medium">milestone tuntas</span>
            </div>

            {/* Stat 3: Total Spiritual Points */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-800/80 col-span-2 sm:col-span-1 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Poin Thawab
              </span>
              <div className="text-2xl sm:text-3xl font-black text-teal-300 font-mono pt-1">
                {totalPoints}
              </div>
              <span className="text-[10px] text-emerald-300 font-medium">poin kebaikan</span>
            </div>
          </div>
        </div>

        {/* NEXT MILESTONE PROGRESS TRACKER */}
        {nextMilestone && (
          <div className="relative z-10 mt-6 pt-5 border-t border-emerald-800/60 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Target Milestone Berikutnya:</span>
                <span className="font-semibold text-emerald-300">
                  {nextMilestone.indonesianTitle} ({nextMilestone.countTarget.toLocaleString("id-ID")} Repetisi)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-amber-300">
                  Kurang {nextMilestone.remainingNeeded.toLocaleString("id-ID")} repetisi ({nextMilestone.progressPct}%)
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-900/90 border border-emerald-800/80 overflow-hidden relative p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-300 shadow-sm relative"
                style={{ width: `${nextMilestone.progressPct}%` }}
              >
                {nextMilestone.progressPct >= 10 && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDemoToolbar(!showDemoToolbar)}
              className="text-amber-300 hover:text-white font-semibold flex items-center gap-1 transition"
            >
              <span>{showDemoToolbar ? "Sembunyikan Panel Uji Coba" : "Simulasi Tambah Repetisi (Uji Coba Cepat)"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDigitalCounter && (
              <button
                onClick={onOpenDigitalCounter}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Buka Tasbih Haptic</span>
              </button>
            )}
          </div>
        </div>

        {/* DEMO / TESTING TOOLBAR */}
        {showDemoToolbar && (
          <div className="relative z-10 mt-4 p-4 rounded-2xl bg-slate-900/95 border border-amber-400/40 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Panel Uji Coba Milestones (Klik untuk menambah repetisi seketika):</span>
              </span>
              <button
                onClick={() => updateCount(0)}
                className="text-slate-400 hover:text-rose-400 text-[11px] underline"
              >
                Reset Hitungan ke 0
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "+33 Repetisi", val: 33 },
                { label: "+70 Repetisi", val: 70 },
                { label: "+100 Repetisi", val: 100 },
                { label: "+300 Repetisi", val: 300 },
                { label: "+1,000 Repetisi", val: 1000 },
                { label: "+5,000 Repetisi (Mufarridun)", val: 5000 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => handleAddReps(btn.val)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold border border-emerald-600/60 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: `Semua (${SPIRITUAL_MILESTONES_CATALOG.length})` },
            { id: "UNLOCKED", label: `Tercapai (${unlockedCount})` },
            { id: "LOCKED", label: `Dalam Proses (${SPIRITUAL_MILESTONES_CATALOG.length - unlockedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.id
                  ? "bg-emerald-800 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tier filter & Search input */}
        <div className="flex items-center gap-3">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
          >
            <option value="ALL">Semua Tier</option>
            <option value="bronze">Perunggu (Bronze)</option>
            <option value="silver">Perak (Silver)</option>
            <option value="gold">Emas (Gold)</option>
            <option value="diamond">Berlian (Diamond)</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari lencana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* MILESTONE BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBadges.map((badge) => {
          const tierStyle = getTierBadgeStyle(badge.tier);
          const isUnlocked = badge.isUnlocked;

          return (
            <div
              key={badge.id}
              onClick={() => handleOpenBadge(badge)}
              className={`rounded-3xl p-5 border transition flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md ${
                isUnlocked
                  ? "bg-white border-emerald-400/80 ring-2 ring-emerald-500/20"
                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Header: Tier chip & Lock Status */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tierStyle.badge}`}>
                  {tierStyle.label}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isUnlocked
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-700" />
                        <span>Tercapai</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Terkunci</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Center: Badge Icon & Title */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isUnlocked
                      ? tierStyle.iconBg
                      : "bg-slate-200 text-slate-400 border border-slate-300"
                  }`}
                >
                  {renderLucideIcon(badge.iconName, "w-7 h-7")}
                </div>

                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {badge.indonesianTitle}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                      {badge.countTarget.toLocaleString("id-ID")} Repetisi
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold">
                      +{badge.rewardPoints} Poin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Bottom: Progress Bar & Milestone Status */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Kemajuan:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {Math.min(badge.currentCount, badge.countTarget).toLocaleString("id-ID")} /{" "}
                    {badge.countTarget.toLocaleString("id-ID")} ({badge.progressPct}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-slate-400"
                    }`}
                    style={{ width: `${badge.progressPct}%` }}
                  />
                </div>

                {!isUnlocked && (
                  <p className="text-[10px] text-slate-400 italic text-right">
                    Kurang {badge.remainingNeeded.toLocaleString("id-ID")} repetisi lagi
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED CERTIFICATE & DALIL MODAL */}
      {activeBadgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-emerald-300 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setActiveBadgeModal(null)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header Banner */}
            <div className="text-center space-y-2 pt-2">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider inline-block">
                Sertifikat Penghargaan Spiritual
              </span>

              <div
                className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg my-2 ${
                  totalDhikrCount >= activeBadgeModal.countTarget
                    ? getTierBadgeStyle(activeBadgeModal.tier).iconBg
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {renderLucideIcon(activeBadgeModal.iconName, "w-10 h-10")}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeBadgeModal.indonesianTitle}
              </h3>

              <p className="text-xs text-slate-500 font-mono">
                Kode Milestone: <strong>{activeBadgeModal.code}</strong> &bull; Tier:{" "}
                <strong>{activeBadgeModal.tier.toUpperCase()}</strong>
              </p>
            </div>

            {/* Target Status Pill */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-emerald-900 font-bold block">
                  Status Pencapaian:
                </span>
                <span className="text-emerald-700">
                  {totalDhikrCount >= activeBadgeModal.countTarget
                    ? "✨ Berhasil Dituntaskan Kaffah"
                    : `Dalam Proses (${totalDhikrCount}/${activeBadgeModal.countTarget}x)`}
                </span>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-emerald-800 font-mono">
                  {activeBadgeModal.countTarget.toLocaleString("id-ID")}x
                </span>
                <span className="text-[10px] text-emerald-600 block">Repetisi</span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">Makna Keutamaan:</strong>
              {activeBadgeModal.description}
            </div>

            {/* Dalil Reference */}
            {activeBadgeModal.dalilReference && (
              <div className="bg-gradient-to-br from-emerald-950 to-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-emerald-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-300 font-mono text-[11px] pb-1 border-b border-emerald-800/60">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dalil As-Sunnah &amp; Hadits:</span>
                  </span>
                  <span className="font-bold text-amber-300">{activeBadgeModal.dalilReference.source}</span>
                </div>

                {activeBadgeModal.dalilReference.arabic && (
                  <div className="text-right font-arabic text-lg sm:text-xl leading-loose font-bold text-amber-200 pt-1">
                    {activeBadgeModal.dalilReference.arabic}
                  </div>
                )}

                <p className="text-emerald-100/90 italic leading-relaxed pt-1 font-serif">
                  &ldquo;{activeBadgeModal.dalilReference.translation}&rdquo;
                </p>
              </div>
            )}

            {/* Action Buttons: Share & Close */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleCopyCertificate(activeBadgeModal)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Teks Sertifikat Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan / Salin Lencana</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveBadgeModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
