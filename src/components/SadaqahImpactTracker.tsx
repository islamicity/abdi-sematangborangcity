import { useState, useMemo, FC } from "react";
import confetti from "canvas-confetti";
import {
  Heart,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Building,
  MapPin,
  CheckCircle2,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  ChevronRight,
  Droplets,
  Utensils,
  GraduationCap,
  Package,
  Activity,
  Award,
  Zap,
} from "lucide-react";
import { SadaqahProject } from "../types";

// Default Initial Projects for Sadaqah Impact Tracking
const INITIAL_SADAQAH_PROJECTS: SadaqahProject[] = [
  {
    id: "sp-01",
    title: "Sedekah Subuh: 500 Porsi Sarapan Berkah Lansia & Dhuafa",
    category: "Sedekah Subuh",
    masjidLocation: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya",
    targetAmount: 7500000,
    currentAmount: 5850000,
    unitCost: 15000,
    unitName: "Porsi Sarapan Berkah",
    targetUnits: 500,
    currentUnits: 390,
    donorCount: 142,
    recurringDonorsCount: 88,
    description:
      "Program penyediaan sarapan hangat bernutrisi bagi jamaah lansia, pedagang gerobak, dan kaum dhuafa setelah Sholat Shubuh Berjamaah setiap Ahad pagi.",
    beneficiarySummary: "390 dari 500 jamaah lansia telah menerima sarapan berkah",
    iconName: "Utensils",
    accentColor: "emerald",
    recentDonations: [
      {
        donorName: "Hamba Allah (Sukamulya)",
        amount: 15000,
        timestamp: "10 menit lalu",
        isRecurring: true,
        frequency: "Harian",
        message: "Bismillah sedekah subuh istiqomah untuk sarapan lansia.",
      },
      {
        donorName: "Keluarga dr. M. Hidayat",
        amount: 50000,
        timestamp: "45 menit lalu",
        isRecurring: true,
        frequency: "Mingguan",
        message: "Semoga berkah dan menolak bala.",
      },
      {
        donorName: "Ibu Nurhasanah",
        amount: 30000,
        timestamp: "2 jam lalu",
        isRecurring: false,
        message: "Niat atas nama almarhum orang tua.",
      },
      {
        donorName: "Pemuda Masjid Al-Ikhlas",
        amount: 25000,
        timestamp: "4 jam lalu",
        isRecurring: true,
        frequency: "Harian",
      },
    ],
  },
  {
    id: "sp-02",
    title: "Air Minum Sehat & Filterisasi Sanitasi Tempat Wudhu",
    category: "Air Bersih & Sanitasi",
    masjidLocation: "Masjid Nurul Huda",
    kelurahan: "Karya Mulya",
    targetAmount: 6000000,
    currentAmount: 4320000,
    unitCost: 20000,
    unitName: "Galon Air Bersih & Steril",
    targetUnits: 300,
    currentUnits: 216,
    donorCount: 96,
    recurringDonorsCount: 54,
    description:
      "Pengadaan dispenser air minum siap minum gratis untuk santri TPA dan penggantian membran ultrafiltrasi kran wudhu utama masjid.",
    beneficiarySummary: "216 galon air bersih terpasang dan melayani 400 santri & jamaah",
    iconName: "Droplets",
    accentColor: "teal",
    recentDonations: [
      {
        donorName: "Pak Syahrul Amin",
        amount: 40000,
        timestamp: "1 jam lalu",
        isRecurring: true,
        frequency: "Mingguan",
        message: "Pahala sedekah air mengalir abadi.",
      },
      {
        donorName: "Hamba Allah (Karya Mulya)",
        amount: 20000,
        timestamp: "3 jam lalu",
        isRecurring: true,
        frequency: "Harian",
      },
      {
        donorName: "Keluarga Hj. Rosita",
        amount: 100000,
        timestamp: "6 jam lalu",
        isRecurring: false,
        message: "Infaq air wudhu jamaah sholat 5 waktu.",
      },
    ],
  },
  {
    id: "sp-03",
    title: "Beasiswa SPP & Santunan Pendidikan 40 Santri Yatim",
    category: "Pendidikan Santri",
    masjidLocation: "Masjid Al-Muhajirin",
    kelurahan: "Srimulya",
    targetAmount: 9000000,
    currentAmount: 7650000,
    unitCost: 150000,
    unitName: "Bulan SPP Santri Yatim",
    targetUnits: 60,
    currentUnits: 51,
    donorCount: 78,
    recurringDonorsCount: 42,
    description:
      "Dukungan biaya SPP bulanan, seragam sekolah, dan paket kitab tahfidz Al-Qur'an untuk anak-anak yatim dhuafa di wilayah Srimulya.",
    beneficiarySummary: "51 bulan biaya SPP santri yatim telah tercover lunas",
    iconName: "GraduationCap",
    accentColor: "amber",
    recentDonations: [
      {
        donorName: "Alumni TPQ Srimulya",
        amount: 150000,
        timestamp: "30 menit lalu",
        isRecurring: true,
        frequency: "Bulanan",
        message: "Dukungan penuh untuk adik-adik santri yatim penghafal Quran.",
      },
      {
        donorName: "Ibu Rahmawati, S.Pd",
        amount: 50000,
        timestamp: "2 jam lalu",
        isRecurring: true,
        frequency: "Mingguan",
      },
      {
        donorName: "Hamba Allah",
        amount: 75000,
        timestamp: "5 jam lalu",
        isRecurring: false,
      },
    ],
  },
  {
    id: "sp-04",
    title: "Lumbung Beras & Sembako Darurat Mustahiq Bulanan",
    category: "Lumbung Pangan",
    masjidLocation: "Masjid Baiturrahman",
    kelurahan: "Lebung Gajah",
    targetAmount: 10000000,
    currentAmount: 6750000,
    unitCost: 75000,
    unitName: "Paket Sembako Berkah",
    targetUnits: 133,
    currentUnits: 90,
    donorCount: 110,
    recurringDonorsCount: 65,
    description:
      "Lumbung pangan mandiri masjid untuk memastikan tidak ada janda lansia atau mustahiq kelaparan di wilayah Lebung Gajah.",
    beneficiarySummary: "90 paket sembako beras & minyak telah tersalurkan ke keluarga prasejahtera",
    iconName: "Package",
    accentColor: "indigo",
    recentDonations: [
      {
        donorName: "Bpk. Rahmat Fauzi",
        amount: 75000,
        timestamp: "15 menit lalu",
        isRecurring: true,
        frequency: "Mingguan",
        message: "Untuk lumbung pangan dhuafa.",
      },
      {
        donorName: "Majelis Taklim Khodijah",
        amount: 150000,
        timestamp: "1 jam lalu",
        isRecurring: false,
      },
    ],
  },
];

// Audio Chime Feedback
const playDonationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.45);
    });
  } catch (e) {
    // Ignore audio error
  }
};

interface SadaqahImpactTrackerProps {
  onSuccessDonation?: (project: SadaqahProject, amount: number) => void;
}

export const SadaqahImpactTracker: FC<SadaqahImpactTrackerProps> = ({
  onSuccessDonation,
}) => {
  const [projects, setProjects] = useState<SadaqahProject[]>(INITIAL_SADAQAH_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("sp-01");

  // Recurring Donation Simulator State
  const [simDailyAmount, setSimDailyAmount] = useState<number>(10000);
  const [simFrequency, setSimFrequency] = useState<"Harian" | "Mingguan" | "Bulanan">("Harian");

  // Instant Donation Modal/Input State
  const [customDonationAmount, setCustomDonationAmount] = useState<number>(25000);
  const [donorNameInput, setDonorNameInput] = useState<string>("dr. Muhammad Hidayatullah");
  const [donorMessageInput, setDonorMessageInput] = useState<string>("Bismillah sedekah berkah.");
  const [isRecurringChecked, setIsRecurringChecked] = useState<boolean>(true);
  const [showSuccessBadge, setShowSuccessBadge] = useState<boolean>(false);

  // Selected Active Project
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Percentage and Progress Calculations
  const progressPercent = useMemo(() => {
    if (!activeProject || activeProject.targetAmount === 0) return 0;
    const pct = (activeProject.currentAmount / activeProject.targetAmount) * 100;
    return Math.min(100, Math.round(pct * 10) / 10);
  }, [activeProject]);

  // SVG Circular Ring parameters
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Simulator Projections
  const simulationProjection = useMemo(() => {
    let monthlyTotal = 0;
    if (simFrequency === "Harian") {
      monthlyTotal = simDailyAmount * 30;
    } else if (simFrequency === "Mingguan") {
      monthlyTotal = simDailyAmount * 4;
    } else {
      monthlyTotal = simDailyAmount;
    }

    const unitsPerMonth = Math.floor(monthlyTotal / activeProject.unitCost);
    const units3Months = Math.floor((monthlyTotal * 3) / activeProject.unitCost);
    const units6Months = Math.floor((monthlyTotal * 6) / activeProject.unitCost);
    const units1Year = Math.floor((monthlyTotal * 12) / activeProject.unitCost);

    return {
      monthlyTotal,
      threeMonthsTotal: monthlyTotal * 3,
      sixMonthsTotal: monthlyTotal * 6,
      oneYearTotal: monthlyTotal * 12,
      unitsPerMonth,
      units3Months,
      units6Months,
      units1Year,
    };
  }, [simDailyAmount, simFrequency, activeProject]);

  // Handle Instant Donation Submit
  const handleExecuteDonation = () => {
    if (customDonationAmount <= 0) return;

    const newUnitsGained = Math.max(1, Math.floor(customDonationAmount / activeProject.unitCost));

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === activeProject.id) {
          const updatedAmount = proj.currentAmount + customDonationAmount;
          const updatedUnits = proj.currentUnits + newUnitsGained;
          const updatedDonors = proj.donorCount + 1;
          const updatedRecurring = isRecurringChecked
            ? proj.recurringDonorsCount + 1
            : proj.recurringDonorsCount;

          const newDonationItem = {
            donorName: donorNameInput.trim() || "Hamba Allah",
            amount: customDonationAmount,
            timestamp: "Baru saja",
            isRecurring: isRecurringChecked,
            frequency: isRecurringChecked ? "Harian" : undefined,
            message: donorMessageInput.trim() || undefined,
          };

          return {
            ...proj,
            currentAmount: updatedAmount,
            currentUnits: updatedUnits,
            donorCount: updatedDonors,
            recurringDonorsCount: updatedRecurring,
            recentDonations: [newDonationItem, ...proj.recentDonations.slice(0, 5)],
          };
        }
        return proj;
      })
    );

    playDonationChime();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#10b981", "#f59e0b", "#14b8a6", "#38bdf8"],
    });

    setShowSuccessBadge(true);
    setTimeout(() => {
      setShowSuccessBadge(false);
    }, 4500);

    if (onSuccessDonation) {
      onSuccessDonation(activeProject, customDonationAmount);
    }
  };

  const getProjectIcon = (name: string) => {
    switch (name) {
      case "Utensils":
        return <Utensils className="w-5 h-5" />;
      case "Droplets":
        return <Droplets className="w-5 h-5" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div id="sadaqah-impact-tracker-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs font-black shadow-sm">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Sadaqah Impact Tracker (Sedekah Mikro Berjamaah)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-Time Accumulator
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dampak Kumulatif Sedekah Rutin Umat
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Pantau bagaimana donasi kecil yang istiqomah (Rp 5.000 – Rp 20.000 / hari) berakumulasi menjadi manfaat nyata yang berkelanjutan bagi proyek-proyek masjid di Sematang Borang.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="text-slate-400">Total Donatur Rutin:</div>
              <div className="font-mono font-black text-white text-sm">
                {projects.reduce((acc, p) => acc + p.recurringDonorsCount, 0)} Jamaah Istiqomah
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Selector Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {projects.map((proj) => {
          const isSelected = proj.id === activeProject.id;
          const pct = Math.round((proj.currentAmount / proj.targetAmount) * 100);

          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                isSelected
                  ? "bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg text-white"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {getProjectIcon(proj.iconName)}
              </div>
              <div>
                <div className="text-xs font-bold truncate max-w-[200px]">
                  {proj.title}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-400 font-mono font-bold">{pct}%</span>
                  <span>•</span>
                  <span>{proj.kelurahan}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Visual Progress Ring & Detailed Impact vs Action Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Progress Ring & Project Metrics (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/40">
                {activeProject.category}
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {activeProject.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Building className="w-3.5 h-3.5" />
                  {activeProject.masjidLocation}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <MapPin className="w-3.5 h-3.5" />
                  Kelurahan {activeProject.kelurahan}
                </span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400">Biaya Satuan:</div>
              <div className="text-xs font-black text-amber-300 font-mono">
                Rp {activeProject.unitCost.toLocaleString("id-ID")} / {activeProject.unitName}
              </div>
            </div>
          </div>

          {/* Central Progress Ring & Cumulative Impact Counter */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2">
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-slate-800"
                  fill="transparent"
                />
                {/* Progress Value Ring */}
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Metrics in Ring */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {progressPercent}%
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                  Tercapai
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  {activeProject.currentUnits} / {activeProject.targetUnits} Unit
                </span>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="space-y-3 w-full">
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Total Dana Terkumpul:</div>
                  <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                    Rp {activeProject.currentAmount.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Target Kebutuhan:</div>
                  <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                    Rp {activeProject.targetAmount.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Penerima Manfaat Riil:</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {activeProject.currentUnits} {activeProject.unitName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Donatur Rutin:</div>
                  <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                    {activeProject.recurringDonorsCount} Orang Istiqomah
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Transparansi DKM:</strong> {activeProject.beneficiarySummary}.
                </span>
              </div>
            </div>
          </div>

          {/* Recent Live Donors Feed */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Aktivitas Sedekah Mikro Terkini:</span>
              </span>
              <span className="text-[10px] text-slate-400">{activeProject.donorCount} Total Donasi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeProject.recentDonations.slice(0, 4).map((d, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate text-[11px] flex items-center gap-1">
                      <span>{d.donorName}</span>
                      {d.isRecurring && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                          Rutin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {d.message || `${d.timestamp}`}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-emerald-400 text-xs shrink-0 ml-2">
                    +Rp {d.amount.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Micro-Donation Calculator & Instant Contribution (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box 1: Cumulative Impact Calculator Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-black text-white">
                  Simulasi Dampak Sedekah Rutin Anda
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                Kalkulator Berkah
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Pilih Nominal Sedekah Istiqomah:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[5000, 10000, 20000, 50000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSimDailyAmount(amt)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition font-mono ${
                      simDailyAmount === amt
                        ? "bg-emerald-600 border-emerald-400 text-slate-950 shadow"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    Rp {(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Frekuensi Penunaian:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(["Harian", "Mingguan", "Bulanan"] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setSimFrequency(freq)}
                    className={`py-1.5 rounded-xl font-bold border transition ${
                      simFrequency === freq
                        ? "bg-amber-500 border-amber-400 text-slate-950 shadow"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Projected Benefits Timeline Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                <span>Proyeksi Manfaat Riil:</span>
                <span className="font-mono text-emerald-400">
                  Rp {simulationProjection.monthlyTotal.toLocaleString("id-ID")} / bln
                </span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-400">1 Bulan:</span>
                  <span className="font-bold text-white">
                    {simulationProjection.unitsPerMonth} {activeProject.unitName}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-400">3 Bulan:</span>
                  <span className="font-bold text-emerald-400">
                    {simulationProjection.units3Months} {activeProject.unitName}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-400">1 Tahun (Kumulatif):</span>
                  <span className="font-bold text-amber-300">
                    {simulationProjection.units1Year} {activeProject.unitName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Instant Sedekah Contribution Form */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-emerald-800/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-black text-white">
                  Tunaikan Sedekah Mikro Sekarang
                </h4>
              </div>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/50">
                QRIS & Saldo DKM
              </span>
            </div>

            {/* Success Toast / Notification */}
            {showSuccessBadge && (
              <div className="p-3 bg-emerald-950 border border-emerald-400 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Jazakallahu khairan! Donasi Anda berhasil tercatat pada ring progres.</span>
              </div>
            )}

            {/* Donation Amount Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Nominal Sedekah:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15000, 25000, 50000, 75000, 100000, 150000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCustomDonationAmount(val)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                      customDonationAmount === val
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 text-slate-950 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    Rp {(val / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Donor Name & Message */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Atas Nama (Boleh Hamba Allah):
                </label>
                <input
                  type="text"
                  value={donorNameInput}
                  onChange={(e) => setDonorNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Nama Donatur / Relawan"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Pesan / Doa Kebaikan (Opsional):
                </label>
                <input
                  type="text"
                  value={donorMessageInput}
                  onChange={(e) => setDonorMessageInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Doa untuk kemaslahatan umat..."
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurringChecked}
                  onChange={(e) => setIsRecurringChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500"
                />
                <span className="text-slate-300 text-[11px] font-semibold">
                  Jadikan Komitmen Sedekah Rutin (Pengingat Subuh)
                </span>
              </label>
            </div>

            {/* Action Button */}
            <button
              onClick={handleExecuteDonation}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              <span>Tunaikan Sedekah Rp {customDonationAmount.toLocaleString("id-ID")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SadaqahImpactTracker;
