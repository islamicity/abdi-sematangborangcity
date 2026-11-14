import { useState, useId } from "react";
import {
  Target,
  TrendingUp,
  Coins,
  Calendar,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Edit3,
  Check,
  ChevronRight,
  ShieldCheck,
  Trophy,
  Award,
} from "lucide-react";
import { ZiswafTransaction } from "../types";

interface ZiswafCircularProgressWidgetProps {
  totalCollected: number;
  monthlyTarget?: number;
  monthName?: string;
  transactions?: ZiswafTransaction[];
  onOpenDonate?: () => void;
  onTargetChange?: (newTarget: number) => void;
  onOpenAwards?: () => void;
}

export default function ZiswafCircularProgressWidget({
  totalCollected,
  monthlyTarget: initialMonthlyTarget = 85000000,
  monthName = "Agustus 2026 (Safar 1448 H)",
  transactions = [],
  onOpenDonate,
  onTargetChange,
  onOpenAwards,
}: ZiswafCircularProgressWidgetProps) {

  const [targetGoal, setTargetGoal] = useState<number>(initialMonthlyTarget);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTargetInput, setTempTargetInput] = useState<string>(String(initialMonthlyTarget));
  const gradientId = useId();

  // Progress math
  const progressPercent = Math.min(100, (totalCollected / targetGoal) * 100);
  const remainingAmount = Math.max(0, targetGoal - totalCollected);
  const isGoalReached = totalCollected >= targetGoal;

  // Circular gauge parameters
  const strokeWidth = 14;
  const radius = 62;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Category breakdown calculations
  const zakatCollected = transactions
    .filter((t) => t.type.startsWith("ZAKAT"))
    .reduce((sum, t) => sum + t.amount, 0);

  const infaqCollected = transactions
    .filter((t) => t.type === "INFAQ_SHODAQOH")
    .reduce((sum, t) => sum + t.amount, 0);

  const wakafCollected = transactions
    .filter((t) => t.type === "WAKAF_PRODUKTIF")
    .reduce((sum, t) => sum + t.amount, 0);

  // Month days progress
  const currentDay = 14;
  const daysInMonth = 31;
  const daysRemaining = daysInMonth - currentDay;
  const requiredDailyPace = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;
  const currentDailyAvg = currentDay > 0 ? totalCollected / currentDay : 0;

  const handleSaveTarget = () => {
    const val = Number(tempTargetInput.replace(/\D/g, ""));
    if (val > 0) {
      setTargetGoal(val);
      setIsEditingTarget(false);
      onTargetChange?.(val);
    }
  };

  return (
    <div
      id="ziswaf-monthly-circular-progress-widget"
      className="bg-white rounded-3xl border border-teal-100/80 shadow-md p-5 sm:p-6 space-y-5 relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Target Capaian ZISWAFH Bulanan
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Periode: {monthName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-teal-700 font-semibold">{daysRemaining} hari tersisa</span>
            </p>
          </div>
        </div>

        {/* Target Goal Adjustment Button / Preset */}
        <div className="flex items-center gap-2">
          {isEditingTarget ? (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-teal-300 animate-fadeIn">
              <span className="text-xs font-mono font-bold text-slate-500 pl-2">Rp</span>
              <input
                id="input-monthly-target-goal"
                type="number"
                value={tempTargetInput}
                onChange={(e) => setTempTargetInput(e.target.value)}
                className="w-28 text-xs font-mono font-bold text-slate-900 bg-transparent outline-none px-1"
                placeholder="85000000"
                autoFocus
              />
              <button
                id="btn-save-target-goal"
                onClick={handleSaveTarget}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-lg transition"
                title="Simpan Target"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-edit-target-goal"
              onClick={() => {
                setTempTargetInput(String(targetGoal));
                setIsEditingTarget(true);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1.5 rounded-xl border border-teal-200 transition shadow-2xs"
            >
              <Edit3 className="w-3 h-3 text-teal-600" />
              <span>Ubah Target: Rp {(targetGoal / 1000000).toFixed(0)} Jt</span>
            </button>
          )}

          {onOpenDonate && (
            <button
              id="widget-btn-quick-donate"
              onClick={onOpenDonate}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Tunaikan ZISWAF</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Circular Progress Ring + KPI Insights + Fund Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
        {/* Left Col: Circular Progress Bar Visual Ring (5 cols) */}
        <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50/80 to-teal-50/40 p-5 rounded-2xl border border-teal-100/60 text-center">
          <div className="relative flex items-center justify-center">
            <svg
              className="w-44 h-44 -rotate-90 transform drop-shadow-xs"
              viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Background Track */}
              <circle
                cx={radius}
                cy={radius}
                r={normalizedRadius}
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
              />

              {/* Dynamic Animated Progress Ring */}
              <circle
                cx={radius}
                cy={radius}
                r={normalizedRadius}
                fill="transparent"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
                Tercapai
              </span>
              <div className="text-3xl font-black font-mono tracking-tight text-slate-900 flex items-baseline">
                {progressPercent.toFixed(1)}
                <span className="text-sm font-bold text-teal-600 ml-0.5">%</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                  isGoalReached
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : progressPercent >= 75
                    ? "bg-teal-100 text-teal-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isGoalReached
                  ? "🎯 Target Terpenuhi!"
                  : progressPercent >= 75
                  ? "⚡ Menjelang Target"
                  : "📈 On Progress"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-800">
              Rp {totalCollected.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              dari target sasaran <span className="font-semibold text-slate-700">Rp {targetGoal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Detailed Metrics & 3 Pillars Breakdown (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Key Metric Highlights Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Coins className="w-3 h-3 text-teal-600" />
                Sisa Target
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-slate-900">
                Rp {(remainingAmount / 1000000).toFixed(1)} Jt
              </div>
              <span className="text-[10px] text-slate-500 block">
                {isGoalReached ? "Surplus Target" : `${((remainingAmount / targetGoal) * 100).toFixed(0)}% dari kuota`}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" />
                Laju Rata-rata
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-blue-900">
                Rp {(currentDailyAvg / 1000000).toFixed(1)} Jt
              </div>
              <span className="text-[10px] text-slate-500 block">per hari terkumpul</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                Target Harian Sisa
              </span>
              <div className="text-sm sm:text-base font-black font-mono text-emerald-800">
                Rp {(requiredDailyPace / 1000000).toFixed(1)} Jt
              </div>
              <span className="text-[10px] text-slate-500 block">untuk {daysRemaining} hari kedepan</span>
            </div>
          </div>

          {/* Breakdown Mini Bars per Sub-Fund Pillar */}
          <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Distribusi Dana Masuk per Kategori Akad
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {transactions.length} Transaksi Diverifikasi
              </span>
            </div>

            {/* Zakat Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-700">1. Zakat (Maal & Profesi)</span>
                <span className="font-mono font-bold text-teal-900">
                  Rp {(zakatCollected / 1000000).toFixed(1)} Jt ({((zakatCollected / (totalCollected || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (zakatCollected / (totalCollected || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Infaq & Shodaqoh Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-700">2. Infaq & Sedekah Terikat</span>
                <span className="font-mono font-bold text-emerald-900">
                  Rp {(infaqCollected / 1000000).toFixed(1)} Jt ({((infaqCollected / (totalCollected || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (infaqCollected / (totalCollected || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Wakaf Produktif Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-700">3. Wakaf Uang / Produktif UMKM</span>
                <span className="font-mono font-bold text-amber-900">
                  Rp {(wakafCollected / 1000000).toFixed(1)} Jt ({((wakafCollected / (totalCollected || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (wakafCollected / (totalCollected || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Info & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tersinkronisasi otomatis dengan QRIS 24 Masjid Sematang Borang</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTargetGoal(75000000);
                  onTargetChange?.(75000000);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition ${
                  targetGoal === 75000000
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                75 Jt
              </button>
              <button
                onClick={() => {
                  setTargetGoal(85000000);
                  onTargetChange?.(85000000);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition ${
                  targetGoal === 85000000
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                85 Jt
              </button>
              <button
                onClick={() => {
                  setTargetGoal(100000000);
                  onTargetChange?.(100000000);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition ${
                  targetGoal === 100000000
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                100 Jt
              </button>
            </div>
          </div>

          {/* Muamalah Awards Milestone Link Banner */}
          {onOpenAwards && (
            <div
              onClick={onOpenAwards}
              className="cursor-pointer bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-emerald-500/10 border border-amber-300/50 hover:border-amber-400 p-2.5 rounded-xl flex items-center justify-between gap-3 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>Target Berikutnya: Lencana "Community Pillar" (100 Jt)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-semibold">
                      97.25%
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-600">
                    Buka piagam kehormatan komunitas & reward syariah
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-800 shrink-0">
                <span>Lihat Awards</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
