import { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  Sparkles,
  Trophy,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Store,
  HeartHandshake,
  Coins,
  Truck,
  Building2,
  CheckCircle2,
  Lock,
  Unlock,
  Share2,
  Copy,
  Check,
  Printer,
  PlusCircle,
  ArrowUpRight,
  Flame,
  Star,
  ExternalLink,
  QrCode,
  Calendar,
  X,
  Volume2,
  Info,
  ChevronRight,
  RefreshCw,
  Gift,
  HelpCircle,
  Search,
} from "lucide-react";

import { MuamalahAwardBadge, MuamalahAwardCategory, MuamalahBadgeTier } from "../types";
import { INITIAL_MUAMALAH_AWARDS, getMuamalahAwardsSummary } from "../data/muamalahAwardsData";

// Play harmonic celebration chime using Web Audio API
const playCelebrationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major Arpeggio)
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + index * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.12);
      osc.stop(ctx.currentTime + index * 0.12 + 0.6);
    });
  } catch (e) {
    // Audio Context might be blocked by autoplay policies
    console.log("Audio chime note skipped", e);
  }
};

interface MuamalahAwardsBadgeSystemProps {
  currentTotalZiswaf?: number;
  onOpenDirectDonation?: () => void;
}

export default function MuamalahAwardsBadgeSystem({
  currentTotalZiswaf = 97250000,
  onOpenDirectDonation,
}: MuamalahAwardsBadgeSystemProps) {
  const [awardsList, setAwardsList] = useState<MuamalahAwardBadge[]>(INITIAL_MUAMALAH_AWARDS);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNLOCKED" | "IN_PROGRESS" | "LOCKED">("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for Digital Certificate & Details
  const [activeCertificateAward, setActiveCertificateAward] = useState<MuamalahAwardBadge | null>(null);
  const [copiedCertCode, setCopiedCertCode] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Simulation State
  const [simulationAmount, setSimulationAmount] = useState<number>(3000000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [justUnlockedAward, setJustUnlockedAward] = useState<MuamalahAwardBadge | null>(null);

  // Computed summary
  const summary = useMemo(() => getMuamalahAwardsSummary(awardsList), [awardsList]);

  // Filtered Awards
  const filteredAwards = useMemo(() => {
    return awardsList.filter((award) => {
      // Category filter
      const matchesCategory = selectedCategory === "ALL" || award.category === selectedCategory;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "UNLOCKED") matchesStatus = award.unlocked;
      if (statusFilter === "IN_PROGRESS") matchesStatus = !award.unlocked && award.currentProgress > 0;
      if (statusFilter === "LOCKED") matchesStatus = !award.unlocked && award.currentProgress === 0;

      // Tier filter
      const matchesTier = tierFilter === "ALL" || award.tier === tierFilter;

      // Search query
      const matchesSearch =
        searchQuery === "" ||
        award.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        award.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        award.titleArabic.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesStatus && matchesTier && matchesSearch;
    });
  }, [awardsList, selectedCategory, statusFilter, tierFilter, searchQuery]);

  // Dynamic icon selector
  const renderBadgeIcon = (iconName: string, className: string = "w-6 h-6") => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className={className} />;
      case "TrendingUp":
        return <TrendingUp className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "Droplets":
        return <Droplets className={className} />;
      case "Store":
        return <Store className={className} />;
      case "HeartHandshake":
        return <HeartHandshake className={className} />;
      case "Coins":
        return <Coins className={className} />;
      case "Truck":
        return <Truck className={className} />;
      case "Building2":
        return <Building2 className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  const getTierColorStyle = (tier: MuamalahBadgeTier) => {
    switch (tier) {
      case "DIAMOND":
        return {
          badge: "bg-cyan-950/80 text-cyan-300 border-cyan-400/60 shadow-cyan-500/20",
          pill: "bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold",
          border: "border-cyan-400/40 hover:border-cyan-400",
          glow: "from-cyan-500/15 via-indigo-500/10 to-transparent",
        };
      case "PLATINUM":
        return {
          badge: "bg-emerald-950/80 text-emerald-300 border-emerald-400/60 shadow-emerald-500/20",
          pill: "bg-gradient-to-r from-emerald-300 to-teal-400 text-slate-950 font-bold",
          border: "border-emerald-400/40 hover:border-emerald-400",
          glow: "from-emerald-500/15 via-teal-500/10 to-transparent",
        };
      case "GOLD":
        return {
          badge: "bg-amber-950/80 text-amber-300 border-amber-400/60 shadow-amber-500/20",
          pill: "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-bold",
          border: "border-amber-400/40 hover:border-amber-400",
          glow: "from-amber-500/15 via-yellow-500/10 to-transparent",
        };
      case "SILVER":
        return {
          badge: "bg-slate-900 text-slate-300 border-slate-400/60 shadow-slate-500/20",
          pill: "bg-gradient-to-r from-slate-300 to-slate-100 text-slate-950 font-bold",
          border: "border-slate-400/40 hover:border-slate-300",
          glow: "from-slate-400/10 to-transparent",
        };
      case "BRONZE":
        return {
          badge: "bg-amber-950/40 text-amber-500 border-amber-700/60",
          pill: "bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold",
          border: "border-amber-700/40 hover:border-amber-600",
          glow: "from-amber-700/10 to-transparent",
        };
    }
  };

  // Simulate communal donation and trigger milestone unlock
  const handleTriggerSimulation = (amountToAdd: number) => {
    setIsSimulating(true);

    setTimeout(() => {
      let newlyUnlocked: MuamalahAwardBadge | null = null;

      setAwardsList((prev) =>
        prev.map((award) => {
          if (award.targetMetricType === "DONATION_AMOUNT") {
            const nextProgress = award.currentProgress + amountToAdd;
            const willUnlock = nextProgress >= award.targetGoal && !award.unlocked;

            if (willUnlock && !newlyUnlocked) {
              newlyUnlocked = {
                ...award,
                currentProgress: nextProgress,
                unlocked: true,
                unlockedDate: "14 Agustus 2026 (Hari Ini)",
              };
            }

            return {
              ...award,
              currentProgress: nextProgress,
              unlocked: nextProgress >= award.targetGoal,
              unlockedDate:
                nextProgress >= award.targetGoal && !award.unlockedDate
                  ? "14 Agustus 2026 (Hari Ini)"
                  : award.unlockedDate,
            };
          }
          return award;
        })
      );

      setIsSimulating(false);

      if (newlyUnlocked) {
        setJustUnlockedAward(newlyUnlocked);
        playCelebrationChime();
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ["#10b981", "#38bdf8", "#fbbf24", "#f59e0b", "#a855f7"],
        });
      } else {
        // Simple confetti burst for contribution
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      }
    }, 400);
  };

  // Copy Certificate Verification Code
  const copyCertificateCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCertCode(true);
    setTimeout(() => setCopiedCertCode(false), 2000);
  };

  // Share digital award to social platforms
  const shareAwardWhatsApp = (award: MuamalahAwardBadge) => {
    const text = `🏆 PENGHARGAAN MUAMALAH UMAT: "${award.name}"
${award.titleArabic}

Alhamdulillah! Komunitas Sematang Borang telah meraih Lencana Kehormatan Tingkat ${award.tier}.
Target: ${award.targetGoal.toLocaleString("id-ID")} ${award.unitLabel}
Dampak: ${award.impactNarrative}

Kode Verifikasi: ${award.certificateVerificationCode}
Endorsed by: ${award.endorsedBy}

Bersama Membangun Keadilan & Kemandirian Ekonomi Umat:
https://abdi.sematangborangcity.cloud`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div id="muamalah-awards-system" className="space-y-6">
      {/* Celebration Banner if a badge was just unlocked */}
      {justUnlockedAward && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 p-1 rounded-2xl shadow-2xl animate-bounce">
          <div className="bg-slate-950 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
                <Trophy className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    🎉 MILESTONE BARU TERCAPAI!
                  </span>
                  <span className="text-xs text-amber-300 font-serif font-bold">
                    {justUnlockedAward.titleArabic}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Lencana "{justUnlockedAward.name}" Resmi Terbuka!
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  {justUnlockedAward.impactNarrative}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveCertificateAward(justUnlockedAward);
                  setJustUnlockedAward(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
              >
                <Award className="w-4 h-4" />
                <span>Lihat Piagam Digital</span>
              </button>
              <button
                onClick={() => setJustUnlockedAward(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 border border-teal-800/60 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Digital Muamalah Awards & Badges
              </span>
              <span className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Sistem Apresiasi Filantropi Syariah
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Lencana Kehormatan & Pencapaian Donasi ZISWAFH
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bentuk apresiasi digital berbasis capaian riil kedermawanan jamaah (*muhsinin*) dan amil. Setiap donasi membuka lencana penghargaan komunitas, memperluas manfaat lumbung pangan, sumur bor wakaf, beasiswa santri, dan modal usaha UMKM tanpa riba.
            </p>
          </div>

          {/* Quick Metrics Badge Card */}
          <div className="bg-slate-900/90 border border-teal-700/60 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Status Capaian Umat
              </div>
              <div className="text-xl font-black text-amber-400 flex items-baseline gap-1.5">
                <span>{summary.unlockedBadges} / {summary.totalBadges}</span>
                <span className="text-xs font-normal text-slate-300">Lencana Terbuka</span>
              </div>
              <div className="w-36 bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${summary.completionRatePct}%` }}
                />
              </div>
              <div className="text-[10px] text-teal-300 font-semibold mt-1">
                Tingkat Kesiapan Komunitas: {summary.completionRatePct}%
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Next-Up Milestone Bar */}
        {summary.nextMilestone && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-900/50 rounded-xl p-4 border border-teal-900/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                      🎯 TARGET BERIKUTNYA YANG HAMPIR TERBUKA
                    </span>
                    <span className="text-xs text-slate-400 font-serif">
                      {summary.nextMilestone.titleArabic}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {summary.nextMilestone.name} — Tingkat {summary.nextMilestone.tier}
                  </div>
                </div>
              </div>

              {/* Progress & Quick Simulation Action */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {summary.nextMilestone.targetMetricType === "DONATION_AMOUNT"
                      ? `Rp ${summary.nextMilestone.currentProgress.toLocaleString("id-ID")} / Rp ${summary.nextMilestone.targetGoal.toLocaleString("id-ID")}`
                      : `${summary.nextMilestone.currentProgress} / ${summary.nextMilestone.targetGoal} ${summary.nextMilestone.unitLabel}`}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Kurang{" "}
                    <span className="font-bold text-amber-300">
                      {summary.nextMilestone.targetMetricType === "DONATION_AMOUNT"
                        ? `Rp ${(summary.nextMilestone.targetGoal - summary.nextMilestone.currentProgress).toLocaleString("id-ID")}`
                        : `${summary.nextMilestone.targetGoal - summary.nextMilestone.currentProgress} ${summary.nextMilestone.unitLabel}`}
                    </span>{" "}
                    lagi untuk membuka lencana ini!
                  </div>
                </div>

                {summary.nextMilestone.targetMetricType === "DONATION_AMOUNT" && (
                  <button
                    onClick={() =>
                      handleTriggerSimulation(
                        Math.max(1000000, summary.nextMilestone!.targetGoal - summary.nextMilestone!.currentProgress)
                      )
                    }
                    disabled={isSimulating}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tunaikan & Buka Lencana Ini</span>
                  </button>
                )}
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((summary.nextMilestone.currentProgress / summary.nextMilestone.targetGoal) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Interactive Milestone Simulator Drawer Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Simulasi Penggalangan Donasi Komunitas</span>
              <span className="text-[10px] px-2 py-0.5 bg-teal-950 text-teal-300 rounded-full border border-teal-800">
                Interactive Engine
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Uji coba menambahkan kontribusi ZISWAFH untuk melihat lencana terbuka secara langsung dengan efek suara dan konfeti.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "+Rp 1.000.000", val: 1000000 },
            { label: "+Rp 2.750.000 (Unlock Pillar)", val: 2750000 },
            { label: "+Rp 5.000.000", val: 5000000 },
            { label: "+Rp 10.000.000", val: 10000000 },
          ].map((preset) => (
            <button
              key={preset.val}
              onClick={() => handleTriggerSimulation(preset.val)}
              disabled={isSimulating}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-200 border border-teal-800/80 rounded-xl text-xs font-semibold transition flex items-center gap-1 hover:border-teal-500"
            >
              <PlusCircle className="w-3 h-3 text-teal-400" />
              <span>{preset.label}</span>
            </button>
          ))}

          <button
            onClick={() => {
              setAwardsList(INITIAL_MUAMALAH_AWARDS);
              setJustUnlockedAward(null);
            }}
            title="Reset ke status awal"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 text-xs transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-semibold mr-1">Status:</span>
            {[
              { id: "ALL", label: `Semua Lencana (${awardsList.length})` },
              { id: "UNLOCKED", label: `🏆 Terbuka (${summary.unlockedBadges})` },
              { id: "IN_PROGRESS", label: `⏳ Menuju Target (${summary.lockedBadges})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === tab.id
                    ? "bg-teal-700 text-white shadow-sm font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-semibold mr-1">Tingkat:</span>
            {["ALL", "DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  tierFilter === tier
                    ? "bg-slate-900 text-white font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-semibold mr-1">Kategori:</span>
            {[
              { id: "ALL", label: "Semua Kategori" },
              { id: "COMMUNITY_GOAL", label: "Pilar Utama Komunitas" },
              { id: "ZISWAF_MILESTONE", label: "Milestone Nominal ZISWAFH" },
              { id: "INFRASTRUCTURE", label: "Wakaf Air & Ambulans" },
              { id: "EMPOWERMENT", label: "Inkubasi UMKM" },
              { id: "ASNAF_CARE", label: "Pangan & Kafalah Santri" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lencana / hadits..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Badges Grid Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAwards.map((award) => {
          const tierStyle = getTierColorStyle(award.tier);
          const progressPct = Math.min(100, Math.round((award.currentProgress / award.targetGoal) * 100));

          return (
            <div
              key={award.id}
              className={`rounded-2xl border ${
                award.unlocked
                  ? "bg-white border-slate-200 shadow-md hover:shadow-xl"
                  : "bg-slate-900/40 border-slate-300/80 shadow-sm"
              } p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Top Accent Gradient Ribbon */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${award.badgeAccentColor}`}
              />

              <div className="space-y-4">
                {/* Header: Icon, Tier Pill, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-13 h-13 rounded-2xl p-3 flex items-center justify-center shadow-md ${
                        award.unlocked
                          ? `bg-gradient-to-br ${award.badgeAccentColor} text-white`
                          : "bg-slate-200 text-slate-500 border border-slate-300"
                      }`}
                    >
                      {renderBadgeIcon(award.iconName, "w-7 h-7")}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${tierStyle.pill}`}>
                          {award.tier}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {award.id}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                        {award.name}
                      </h4>
                    </div>
                  </div>

                  {/* Lock/Unlock Indicator */}
                  {award.unlocked ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Terbuka
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {progressPct}%
                    </span>
                  )}
                </div>

                {/* Arabic Calligraphy Subtitle */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center">
                  <div className="text-sm font-serif font-bold text-slate-800 tracking-wide">
                    {award.titleArabic}
                  </div>
                </div>

                {/* Description & Impact */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {award.description}
                </p>

                {/* Goal Metric & Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Capaian Donasi:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {award.targetMetricType === "DONATION_AMOUNT"
                        ? `Rp ${(award.currentProgress / 1000000).toFixed(1)}Jt / Rp ${(award.targetGoal / 1000000).toFixed(0)}Jt`
                        : `${award.currentProgress} / ${award.targetGoal} ${award.unitLabel}`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        award.unlocked
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-amber-400 to-emerald-400"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      {award.unlocked
                        ? `Dibuka pada: ${award.unlockedDate}`
                        : `Kurang ${
                            award.targetMetricType === "DONATION_AMOUNT"
                              ? `Rp ${(award.targetGoal - award.currentProgress).toLocaleString("id-ID")}`
                              : `${award.targetGoal - award.currentProgress} ${award.unitLabel}`
                          }`}
                    </span>
                    <span className="font-bold text-teal-700">{progressPct}%</span>
                  </div>
                </div>

                {/* Hadith Quote Excerpt */}
                <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 text-xs text-emerald-950 space-y-0.5">
                  <div className="font-serif text-right text-emerald-900 text-xs font-semibold">
                    "{award.hadithInspiration.arabic}"
                  </div>
                  <div className="text-[11px] text-emerald-800 italic">
                    "{award.hadithInspiration.meaning}"
                  </div>
                  <div className="text-[9.5px] text-emerald-700 font-semibold pt-0.5">
                    — {award.hadithInspiration.source}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setActiveCertificateAward(award)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    award.unlocked
                      ? "bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{award.unlocked ? "Lihat Piagam & Manfaat" : "Detail Target & Piagam"}</span>
                </button>

                {award.unlocked && (
                  <button
                    onClick={() => shareAwardWhatsApp(award)}
                    title="Bagikan ke WhatsApp"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital Certificate Modal */}
      {activeCertificateAward && (
        <div
          id="digital-certificate-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full border-4 border-amber-300/80 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Certificate Ornamental Background */}
            <div className="bg-gradient-to-br from-amber-50 via-slate-50 to-emerald-50 p-6 sm:p-8 text-slate-900 relative">
              {/* Close Button */}
              <button
                onClick={() => setActiveCertificateAward(null)}
                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-600 flex items-center justify-center shadow-md border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Header Banner */}
              <div className="text-center space-y-1.5 pb-4 border-b border-amber-200/80">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  Piagam Digital Muamalah & Keadilan Sosial
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 tracking-tight">
                  CERTIFICATE OF MUAMALAH EXCELLENCE
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  No. Registrasi Syariah: {activeCertificateAward.certificateVerificationCode}
                </p>
              </div>

              {/* Certificate Body Content */}
              <div className="py-5 space-y-4 text-center">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  Diberikan dengan penuh takzim kepada seluruh jamaah & muhsinin
                </div>

                <div className="text-xl sm:text-2xl font-black text-teal-900 font-serif">
                  KECAMATAN SEMATANG BORANG, PALEMBANG
                </div>

                <div className="inline-block bg-white p-3 rounded-2xl border-2 border-amber-300 shadow-sm max-w-lg mx-auto">
                  <div className="text-sm font-serif font-bold text-amber-800">
                    {activeCertificateAward.titleArabic}
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    Lencana "{activeCertificateAward.name}"
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {activeCertificateAward.description}
                  </div>
                </div>

                {/* Hadith Box */}
                <div className="bg-emerald-950 text-white p-4 rounded-2xl text-left space-y-1 max-w-xl mx-auto shadow-inner border border-emerald-800">
                  <div className="font-serif text-right text-amber-300 text-sm font-bold">
                    {activeCertificateAward.hadithInspiration.arabic}
                  </div>
                  <div className="text-xs text-slate-300 italic pt-1">
                    "{activeCertificateAward.hadithInspiration.meaning}"
                  </div>
                  <div className="text-[10px] text-teal-300 font-semibold">
                    — {activeCertificateAward.hadithInspiration.source}
                  </div>
                </div>

                {/* Perks unlocked */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left space-y-2 max-w-xl mx-auto">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-teal-600" />
                    <span>Dampak & Hak Keistimewaan yang Terbuka:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {activeCertificateAward.rewardPerks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Signatories & Endorsement */}
                <div className="pt-4 grid grid-cols-2 gap-4 text-center text-xs max-w-md mx-auto">
                  <div className="border-t border-slate-300 pt-2">
                    <div className="font-bold text-slate-800">Ust. H. Ahmad Farhan, S.Pd.I</div>
                    <div className="text-[10px] text-slate-500">Ketua Dewan Baitul Maal</div>
                  </div>
                  <div className="border-t border-slate-300 pt-2">
                    <div className="font-bold text-slate-800">{activeCertificateAward.endorsedBy}</div>
                    <div className="text-[10px] text-slate-500">Dewan Pengawas Syariah</div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCertificateCode(activeCertificateAward.certificateVerificationCode)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copiedCertCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCertCode ? "Kode Tersalin!" : "Salin No. Registrasi"}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Dokumen</span>
                  </button>
                </div>

                <button
                  onClick={() => shareAwardWhatsApp(activeCertificateAward)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan ke WhatsApp & Grup Jamaah</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wall of Honor - Collaborating Mosque Hubs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Simpul Kolaborasi Masjid Peraih Lencana Kehormatan</span>
            </h4>
            <p className="text-xs text-slate-500">
              Gerakan bersama DKM se-Kecamatan Sematang Borang yang menopang ketercapaian milestone ZISWAFH.
            </p>
          </div>
          <span className="text-xs text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            24 Masjid & Musholla
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900">Masjid Jami' Al-Ikhlas</div>
            <div className="text-[11px] text-teal-700 font-semibold">Central Baitul Maal • Sukamulya</div>
            <div className="text-[10px] text-slate-500">Pusat Distribusi Pangan & UMKM</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900">Masjid Baiturrahman</div>
            <div className="text-[11px] text-teal-700 font-semibold">Lebung Gajah</div>
            <div className="text-[10px] text-slate-500">Pusat Layanan Medis & Kesehatan</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900">Masjid Nurul Huda</div>
            <div className="text-[11px] text-teal-700 font-semibold">Karya Mulya</div>
            <div className="text-[10px] text-slate-500">Rumah Qur'an & Beasiswa Yatim</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900">Masjid Al-Muhajirin</div>
            <div className="text-[11px] text-teal-700 font-semibold">Srimulya</div>
            <div className="text-[10px] text-slate-500">Pusat Armada Ambulans 24 Jam</div>
          </div>
        </div>
      </div>
    </div>
  );
}
