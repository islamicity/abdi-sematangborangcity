import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Moon,
  Sun,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Heart,
  BookOpen,
  Apple,
  Coins,
  ChevronDown,
  ChevronUp,
  Share2,
  RotateCcw,
  Check,
  AlertCircle,
  Star,
  Flame,
  ArrowRight,
} from "lucide-react";

export interface RamadanChecklistItem {
  id: string;
  category: "spiritual" | "fiqh" | "health" | "social" | "custom";
  title: string;
  description: string;
  isCompleted: boolean;
  priority: "high" | "medium" | "low";
  completedAt?: string;
  dalilNote?: string;
}

const DEFAULT_PREPARATION_ITEMS: RamadanChecklistItem[] = [
  // 1. Spiritual & Ruhani
  {
    id: "prep-qadha-puasa",
    category: "spiritual",
    title: "Tuntaskan Qadha Puasa Tahun Lalu",
    description: "Pastikan seluruh hutang puasa Ramadan sebelumnya telah ditunaikan sebelum masuk bulan Sya'ban berakhir.",
    isCompleted: true,
    priority: "high",
    dalilNote: "Kewajiban meng-qadha puasa sebelum datang Ramadan berikutnya (HR. Bukhari no. 1950)",
  },
  {
    id: "prep-senin-kamis",
    category: "spiritual",
    title: "Membiasakan Puasa Sunnah (Senin-Kamis / Ayyamul Bidh)",
    description: "Melatih tubuh dan lambung secara bertahap agar tidak kaget saat hari pertama Ramadan tiba.",
    isCompleted: false,
    priority: "high",
    dalilNote: "Rasulullah SAW memperbanyak puasa di bulan Sya'ban (HR. Muslim no. 1156)",
  },
  {
    id: "prep-tadabbur-quran",
    category: "spiritual",
    title: "Bangun Rutinitas Tilawah Harian (Target 1 Juz/Hari)",
    description: "Memulai pemanasan membaca Al-Qur'an minimal 1-2 lembar per shalat fardhu agar terbiasa one day one juz.",
    isCompleted: false,
    priority: "high",
  },
  {
    id: "prep-taubat-maaf",
    category: "spiritual",
    title: "Muhasabah, Taubat Nasuha & Saling Memaafkan",
    description: "Membersihkan hati dari dendam, iri hati, dan perselisihan keluarga sebelum bulan suci menyapa.",
    isCompleted: false,
    priority: "medium",
  },

  // 2. Fikih & Ilmu
  {
    id: "prep-fiqh-puasa",
    category: "fiqh",
    title: "Kaji Ulang Fikih Puasa & Pembatalnya",
    description: "Menyegarkan ilmu tentang rukun puasa, hal-hal yang membatalkan, serta amalan yang makruh & sunnah.",
    isCompleted: true,
    priority: "high",
    dalilNote: "'Menuntut ilmu itu wajib bagi setiap muslim' (HR. Ibnu Majah)",
  },
  {
    id: "prep-fiqh-tarawih",
    category: "fiqh",
    title: "Memahami Adab Qiyamul Lail & Shalat Tarawih",
    description: "Mengetahui tata cara shalat malam berjamaah di masjid dengan khusyuk dan tidak tergesa-gesa.",
    isCompleted: false,
    priority: "medium",
  },
  {
    id: "prep-zakat-fitrah",
    category: "fiqh",
    title: "Hitung Estimasi Zakat Maal & Zakat Fitrah",
    description: "Mempersiapkan catatan harta haul/nisab dan kuota beras/uang zakat fitrah keluarga lebih dini.",
    isCompleted: false,
    priority: "medium",
  },

  // 3. Kesehatan & Jasmani
  {
    id: "prep-pola-tidur",
    category: "health",
    title: "Penyesuaian Jam Tidur & Latihan Bangun Sahur",
    description: "Menggeser jam tidur malam lebih awal (maksimal 22:00) agar mudah terjaga di sepertiga malam.",
    isCompleted: false,
    priority: "high",
  },
  {
    id: "prep-detoks-kafein",
    category: "health",
    title: "Kurangi Kafein & Makanan Berlemak Berlebih",
    description: "Detoksifikasi bertahap dari ketergantungan kopi/teh agar tidak mengalami sakit kepala di awal puasa.",
    isCompleted: false,
    priority: "medium",
  },
  {
    id: "prep-stok-kurma",
    category: "health",
    title: "Siapkan Asupan Makanan Sehat & Kurma",
    description: "Menyediakan kurma basah (ruthab) atau kering (tamr) sesuai sunnah berbuka puasa di rumah.",
    isCompleted: false,
    priority: "low",
  },

  // 4. Infaq & Sosial
  {
    id: "prep-tabungan-infaq",
    category: "social",
    title: "Siapkan Tabungan Khusus Sedekah Subuh Ramadan",
    description: "Mengalokasikan anggaran khusus infaq harian dan sedekah paket buka puasa (ifthar) dhuafa.",
    isCompleted: false,
    priority: "high",
    dalilNote: "'Rasulullah SAW adalah orang yang paling dermawan, dan paling dermawan di bulan Ramadan' (HR. Bukhari)",
  },
  {
    id: "prep-daftar-penerima",
    category: "social",
    title: "Daftar Kerabat & Kaum Dhuafa Penerima Parsel Kebaikan",
    description: "Mendata tetangga atau mustahik di sekitar Sematang Borang yang membutuhkan bantuan paket berkah.",
    isCompleted: false,
    priority: "medium",
  },
];

// Target: 1 Ramadan 1448 H (Estimated: 8 Februari 2027 00:00:00 GMT+7)
const TARGET_RAMADAN_DATE = new Date("2027-02-08T00:00:00+07:00");

interface RamadanCountdownWidgetProps {
  compact?: boolean;
  onOpenKnowledgeCatalog?: () => void;
  onOpenDailyDhikr?: () => void;
}

export default function RamadanCountdownWidget({
  compact = false,
  onOpenKnowledgeCatalog,
  onOpenDailyDhikr,
}: RamadanCountdownWidgetProps) {
  // Live Countdown state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  // Checklist items state
  const [checklist, setChecklist] = useState<RamadanChecklistItem[]>(() => {
    try {
      const stored = localStorage.getItem("islamicity_ramadan_checklist_items");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return DEFAULT_PREPARATION_ITEMS;
  });

  // Filter & custom input state
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "spiritual" | "fiqh" | "health" | "social" | "pending" | "completed"
  >("all");
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customDesc, setCustomDesc] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<
    "spiritual" | "fiqh" | "health" | "social"
  >("spiritual");
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Countdown timer calculation
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = TARGET_RAMADAN_DATE.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save checklist to localStorage
  const saveChecklist = (newItems: RamadanChecklistItem[]) => {
    setChecklist(newItems);
    try {
      localStorage.setItem("islamicity_ramadan_checklist_items", JSON.stringify(newItems));
    } catch {}
  };

  // Toggle item status
  const handleToggleItem = (id: string) => {
    const updated = checklist.map((item) => {
      if (item.id === id) {
        const nextState = !item.isCompleted;
        if (nextState) {
          try {
            confetti({
              particleCount: 25,
              spread: 50,
              origin: { y: 0.7 },
              colors: ["#10b981", "#f59e0b", "#38bdf8"],
            });
          } catch {}
        }
        return {
          ...item,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return item;
    });

    saveChecklist(updated);
  };

  // Add custom preparation item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newItem: RamadanChecklistItem = {
      id: `custom-${Date.now()}`,
      category: customCategory,
      title: customTitle.trim(),
      description: customDesc.trim() || "Target persiapan pribadi menjelang bulan suci Ramadan.",
      isCompleted: false,
      priority: "medium",
    };

    const updated = [newItem, ...checklist];
    saveChecklist(updated);
    setCustomTitle("");
    setCustomDesc("");
    setShowAddCustom(false);
  };

  // Delete custom item
  const handleDeleteItem = (id: string) => {
    if (confirm("Hapus target persiapan ini?")) {
      const updated = checklist.filter((item) => item.id !== id);
      saveChecklist(updated);
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (confirm("Kembalikan checklist persiapan ke daftar rekomendasi awal?")) {
      saveChecklist(DEFAULT_PREPARATION_ITEMS);
    }
  };

  // Progress metrics
  const completedCount = useMemo(() => checklist.filter((i) => i.isCompleted).length, [checklist]);
  const totalCount = checklist.length;
  const progressPct = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.round((completedCount / totalCount) * 100);
  }, [completedCount, totalCount]);

  // Readiness badge assessment
  const readinessStatus = useMemo(() => {
    if (progressPct >= 90) return { label: "Sangat Siap (Kaffah)", color: "text-emerald-300 bg-emerald-900/60 border-emerald-500/40" };
    if (progressPct >= 60) return { label: "Siap Menyambut", color: "text-amber-300 bg-amber-900/60 border-amber-500/40" };
    if (progressPct >= 30) return { label: "Tahap Pemanasan", color: "text-teal-300 bg-teal-900/60 border-teal-500/40" };
    return { label: "Memulai Persiapan", color: "text-slate-300 bg-slate-800 border-slate-600" };
  }, [progressPct]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return checklist.filter((item) => {
      if (selectedFilter === "completed") return item.isCompleted;
      if (selectedFilter === "pending") return !item.isCompleted;
      if (selectedFilter !== "all") return item.category === selectedFilter;
      return true;
    });
  }, [checklist, selectedFilter]);

  // Copy plan for sharing
  const handleSharePlan = () => {
    const text = `🌙 *RAMADAN 1448 H COUNTDOWN & CHECKLIST PRIBADI*
⏳ Sisa Waktu Menuju Ramadan: ${timeLeft.days} Hari ${timeLeft.hours} Jam ${timeLeft.minutes} Menit
📊 Kesiapan: ${completedCount}/${totalCount} Persiapan Tuntas (${progressPct}%) • ${readinessStatus.label}

🎯 Beberapa Target Persiapan:
${checklist.slice(0, 5).map((it) => `${it.isCompleted ? "✅" : "⬜"} ${it.title}`).join("\n")}

Mari persiapkan hati dan raga menyambut bulan penuh ampunan bersama ABDI Islamicity Kaffah!`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div
      id="ramadan-countdown-widget"
      className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 rounded-3xl p-5 sm:p-7 text-white border border-emerald-600/40 shadow-xl relative overflow-hidden space-y-6 animate-fade-in"
    >
      {/* Background Decorative Blurs */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-10 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP HEADER: TITLE & EXPAND TOGGLE */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <Moon className="w-3.5 h-3.5 text-amber-300" />
            <span>RAMADAN 1448 H COUNTDOWN &amp; PREPARATION PLANNER</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span>Hitung Mundur Menuju Ramadan</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold uppercase tracking-wider">
              1448 H
            </span>
          </h3>

          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            Persiapkan jiwa, fikih ibadah, kesehatan fisik, dan infaq sosial menyambut tamu agung bulan suci Ramadan.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={handleSharePlan}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-800 transition text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            title="Bagikan Rencana Persiapan Ramadan"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
            <span className="hidden sm:inline">{copiedShare ? "Tersalin!" : "Bagikan"}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/40 transition text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <span>{isExpanded ? "Sederhanakan" : "Buka Checklist Lengkap"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CLOCK COUNTDOWN CARDS */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Days */}
        <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-emerald-700/60 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-amber-400">
            {timeLeft.days}
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300 mt-1">
            Hari Lagi
          </span>
        </div>

        {/* Hours */}
        <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-emerald-700/60 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300 mt-1">
            Jam
          </span>
        </div>

        {/* Minutes */}
        <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-emerald-700/60 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300 mt-1">
            Menit
          </span>
        </div>

        {/* Seconds */}
        <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-emerald-700/60 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-emerald-400 animate-pulse">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300 mt-1">
            Detik
          </span>
        </div>
      </div>

      {/* RAMADAN PRAYER / HADITH BANNER */}
      <div className="relative z-10 p-3.5 sm:p-4 rounded-2xl bg-emerald-900/40 border border-emerald-600/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-arabic font-bold text-amber-200 text-sm block leading-relaxed">
              اللَّهُمَّ بَارِكْ لَنَا فِي رَجَبَ وَشَعْبَانَ وَبَلِّغْنَا رَمَضَانَ
            </span>
            <p className="text-[11px] text-emerald-200/90 italic font-serif">
              &ldquo;Ya Allah berkahilah kami di bulan Rajab dan Sya'ban, dan sampaikanlah kami kepada bulan Ramadan.&rdquo;
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 text-emerald-300 border border-emerald-700/80">
            Estimasi: 8 Feb 2027 (1 Ramadan 1448 H)
          </span>
        </div>
      </div>

      {/* CHECKLIST READINESS PROGRESS TRACK */}
      <div className="relative z-10 space-y-2 pt-2 border-t border-emerald-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">Kesiapan Pra-Ramadan Anda:</span>
            <span className="font-mono text-emerald-300 font-bold">
              {completedCount} dari {totalCount} Persiapan Tuntas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${readinessStatus.color}`}>
              {readinessStatus.label}
            </span>
            <span className="font-mono font-bold text-amber-300">
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Visual Progress Bar Track */}
        <div className="w-full h-3 rounded-full bg-slate-900/90 border border-emerald-800/80 overflow-hidden relative p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-300 shadow-sm relative"
            style={{ width: `${progressPct}%` }}
          >
            {progressPct >= 10 && (
              <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            )}
          </div>
        </div>
      </div>

      {/* EXPANDED PERSONALIZED PREPARATION CHECKLIST SECTION */}
      {isExpanded && (
        <div className="relative z-10 bg-white rounded-2xl p-5 text-slate-900 space-y-5 animate-fade-in shadow-lg">
          {/* Header & Category Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Rencana Persiapan Pribadi (Personalized Checklist)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Centang setiap target yang telah Anda siapkan. Data tersimpan aman di perangkat Anda.
              </p>
            </div>

            {/* Controls: Add Custom & Reset */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Target Pribadi</span>
              </button>

              <button
                onClick={handleResetDefaults}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Reset ke Default"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ADD CUSTOM TARGET DRAWER */}
          {showAddCustom && (
            <form
              onSubmit={handleAddCustomItem}
              className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                <span>Buat Target Persiapan Ramadan Kustom</span>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  &times; Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Judul target (misal: Beli kurma Sukari untuk masjid, dll)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-hidden"
                  >
                    <option value="spiritual">Qalbu &amp; Spiritual</option>
                    <option value="fiqh">Fikih &amp; Ilmu</option>
                    <option value="health">Kesehatan Fisik</option>
                    <option value="social">Infaq &amp; Sosial</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Catatan tambahan / rincian target..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition"
              >
                Simpan Target Baru
              </button>
            </form>
          )}

          {/* CATEGORY FILTER PILLS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: `Semua (${checklist.length})` },
              { id: "spiritual", label: "Qalbu & Spiritual" },
              { id: "fiqh", label: "Fikih & Ilmu" },
              { id: "health", label: "Kesehatan Fisik" },
              { id: "social", label: "Infaq & Sosial" },
              { id: "pending", label: `Belum Selesai (${checklist.length - completedCount})` },
              { id: "completed", label: `Selesai (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedFilter === tab.id
                    ? "bg-emerald-800 text-white shadow-2xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CHECKLIST ITEMS LIST */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Tidak ada target persiapan dalam kategori ini.
              </p>
            ) : (
              filteredItems.map((item) => {
                const isCompleted = item.isCompleted;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={`p-3.5 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer select-none ${
                      isCompleted
                        ? "bg-emerald-50/60 border-emerald-300 text-slate-700"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className="pt-0.5 shrink-0">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-lg border-2 border-slate-300 bg-white hover:border-emerald-500 transition"></div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold ${
                            isCompleted ? "line-through text-slate-500" : "text-slate-900"
                          }`}
                        >
                          {item.title}
                        </span>

                        <span className="text-[10px] px-2 py-0.2 rounded-md font-mono uppercase font-bold bg-white border border-slate-200 text-slate-500">
                          {item.category}
                        </span>

                        {item.priority === "high" && !isCompleted && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                            Utama
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {item.description}
                      </p>

                      {item.dalilNote && (
                        <p className="text-[10px] text-emerald-800 italic font-serif flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{item.dalilNote}</span>
                        </p>
                      )}
                    </div>

                    {/* Delete button if custom */}
                    {item.category === "custom" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
