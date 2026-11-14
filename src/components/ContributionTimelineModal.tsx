import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Flame,
  Heart,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  PlusCircle,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  FileText,
  BadgeCheck,
  Stethoscope,
  Utensils,
  BookOpen,
  Hammer,
  Coins,
  Share2,
  QrCode,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ContributionTimelineItem, ContributionCategory } from "../types";
import { INITIAL_CONTRIBUTION_TIMELINE } from "../data/contributionTimelineData";
import { INITIAL_CONTRIBUTOR_LEADERBOARD } from "../data/leaderboardData";

interface ContributionTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserName?: string;
  targetUserRole?: string;
  targetUserMasjid?: string;
  targetUserKelurahan?: string;
  onLogNewActivity?: () => void;
  onOpenQrScanner?: () => void;
}

export default function ContributionTimelineModal({
  isOpen,
  onClose,
  targetUserName = "dr. H. Rahmat Pratama, Sp.PD",
  targetUserRole = "Dokter Spesialis Penyakit Dalam & Relawan Medis DKM",
  targetUserMasjid = "Masjid Jami' Al-Ikhlas",
  targetUserKelurahan = "Sukamulya",
  onOpenQrScanner,
}: ContributionTimelineModalProps) {
  // Local storage persistence for contribution timeline
  const [timelineItems, setTimelineItems] = useState<ContributionTimelineItem[]>(() => {
    try {
      const saved = localStorage.getItem("islamicity_user_contribution_timeline_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_CONTRIBUTION_TIMELINE;
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem("islamicity_user_contribution_timeline_v1", JSON.stringify(timelineItems));
    } catch {
      // ignore
    }
  }, [timelineItems]);

  // Selected Contributor Profile (allows switching between contributors)
  const [selectedContributorName, setSelectedContributorName] = useState<string>(targetUserName);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Quick Add Contribution Form Modal Inside Timeline
  const [isAddingNewItem, setIsAddingNewItem] = useState<boolean>(false);
  const [newItemForm, setNewItemForm] = useState<{
    title: string;
    category: ContributionCategory;
    categoryLabel: string;
    masjidName: string;
    kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Kecamatan Sematang Borang";
    description: string;
    hoursLogged: number;
    beneficiariesCount: number;
    amountRp: number;
    notes: string;
    tags: string;
  }>({
    title: "",
    category: "MOSQUE_ATTENDANCE",
    categoryLabel: "Presensi Subuh",
    masjidName: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya",
    description: "",
    hoursLogged: 2,
    beneficiariesCount: 0,
    amountRp: 0,
    notes: "",
    tags: "Subuh Berjamaah, Istiqomah",
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync selected contributor with props if changed
  useEffect(() => {
    if (targetUserName) {
      setSelectedContributorName(targetUserName);
    }
  }, [targetUserName]);

  // Close on Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered & Sorted Timeline List
  const filteredItems = useMemo(() => {
    return timelineItems
      .filter((item) => {
        // Filter by Contributor Name if matching
        if (selectedContributorName && item.userName !== selectedContributorName) {
          // If the item doesn't explicitly match, we still include if it's the primary user default
          if (item.userName !== "dr. H. Rahmat Pratama, Sp.PD" && selectedContributorName === "dr. H. Rahmat Pratama, Sp.PD") {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
          return false;
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchMasjid = item.masjidName.toLowerCase().includes(q);
          const matchEvidence = item.evidenceCode?.toLowerCase().includes(q);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchMasjid && !matchEvidence && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "NEWEST") {
          return b.id.localeCompare(a.id);
        } else {
          return a.id.localeCompare(b.id);
        }
      });
  }, [timelineItems, selectedContributorName, selectedCategory, searchQuery, sortOrder]);

  // Aggregated Statistical Metrics for Header
  const totalHours = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + (curr.impactMetrics.hoursLogged || 0), 0);
  }, [filteredItems]);

  const totalPoints = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + (curr.impactMetrics.pointsEarned || 0), 0);
  }, [filteredItems]);

  const totalBeneficiaries = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + (curr.impactMetrics.beneficiariesCount || 0), 0);
  }, [filteredItems]);

  const totalDonationValue = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + (curr.impactMetrics.amountRp || 0), 0);
  }, [filteredItems]);

  // Handle New Item Submit
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.title.trim()) return;

    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#38bdf8"],
      });
    } catch {
      // ignore
    }

    const calculatedPoints =
      (newItemForm.hoursLogged || 0) * 10 +
      (newItemForm.category === "VOLUNTEER_MEDICAL" ? 25 : 15) +
      (newItemForm.amountRp > 0 ? Math.min(50, Math.round(newItemForm.amountRp / 100000)) : 0);

    const newItem: ContributionTimelineItem = {
      id: `ctl-${Date.now()}`,
      userName: selectedContributorName || targetUserName,
      userRole: targetUserRole,
      date: "20 Agustus 2026",
      time: "05:15 WIB",
      hijriDate: "7 Shafar 1448 H",
      title: newItemForm.title,
      category: newItemForm.category,
      categoryLabel: newItemForm.categoryLabel,
      masjidName: newItemForm.masjidName,
      kelurahan: newItemForm.kelurahan,
      description: newItemForm.description || "Partisipasi aktif terverifikasi dalam program kemakmuran masjid & layanan umat.",
      impactMetrics: {
        hoursLogged: Number(newItemForm.hoursLogged) || 1,
        beneficiariesCount: Number(newItemForm.beneficiariesCount) || 0,
        amountRp: Number(newItemForm.amountRp) || 0,
        pointsEarned: calculatedPoints,
      },
      verificationStatus: "TERVERIFIKASI_DKM",
      verifiedBy: "Sistem Presensi Digital ABDI",
      evidenceType: "PRESENSI_QR",
      evidenceCode: `QR-ACT-${Date.now().toString().slice(-6)}`,
      locationDetails: newItemForm.masjidName,
      notes: newItemForm.notes || "Dicatat mandiri dan telah divalidasi keabsahan jadwalnya.",
      tags: newItemForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    setTimelineItems((prev) => [newItem, ...prev]);
    setIsAddingNewItem(false);
    setNewItemForm({
      title: "",
      category: "MOSQUE_ATTENDANCE",
      categoryLabel: "Presensi Subuh",
      masjidName: "Masjid Jami' Al-Ikhlas",
      kelurahan: "Sukamulya",
      description: "",
      hoursLogged: 2,
      beneficiariesCount: 0,
      amountRp: 0,
      notes: "",
      tags: "Subuh Berjamaah, Khidmah Umat",
    });

    triggerToast("Alhamdulillah! Aktivitas khidmah berhasil ditambahkan ke linimasa kronologis.");
  };

  // Helper for Category Design and Icon
  const getCategoryConfig = (cat: ContributionCategory) => {
    switch (cat) {
      case "MOSQUE_ATTENDANCE":
        return {
          icon: <Flame className="w-4 h-4 text-amber-400" />,
          badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          ringColor: "border-amber-400/80 bg-amber-950",
          label: "Presensi Masjid & Subuh",
          dotColor: "bg-amber-400",
        };
      case "VOLUNTEER_MEDICAL":
        return {
          icon: <Stethoscope className="w-4 h-4 text-emerald-400" />,
          badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          ringColor: "border-emerald-400/80 bg-emerald-950",
          label: "Khidmah & Medis Dhuafa",
          dotColor: "bg-emerald-400",
        };
      case "CHARITY_DISTRIBUTION":
        return {
          icon: <Utensils className="w-4 h-4 text-rose-400" />,
          badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          ringColor: "border-rose-400/80 bg-rose-950",
          label: "Dapur Berkah & Sembako",
          dotColor: "bg-rose-400",
        };
      case "ZISWAF_DONATION":
        return {
          icon: <Coins className="w-4 h-4 text-teal-400" />,
          badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
          ringColor: "border-teal-400/80 bg-teal-950",
          label: "ZISWAF & Wakaf Produktif",
          dotColor: "bg-teal-400",
        };
      case "EDUCATIONAL_DAKWAH":
        return {
          icon: <BookOpen className="w-4 h-4 text-sky-400" />,
          badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
          ringColor: "border-sky-400/80 bg-sky-950",
          label: "Kajian & Literasi Qur'an",
          dotColor: "bg-sky-400",
        };
      case "INFRASTRUCTURE_WAKAF":
      default:
        return {
          icon: <Hammer className="w-4 h-4 text-purple-400" />,
          badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          ringColor: "border-purple-400/80 bg-purple-950",
          label: "Gotong Royong & Fisik",
          dotColor: "bg-purple-400",
        };
    }
  };

  // Printable Transcript Generation
  const handlePrintTranscript = () => {
    try {
      window.print();
    } catch {
      triggerToast("Membuka dialog cetak transkrip riwayat khidmah...");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="contribution-timeline-modal"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25 }}
        className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Top Floating Glow Ambient Effects */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-amber-950/80 to-slate-950 border-b border-amber-900/50 relative z-10 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-amber-400 text-xl font-bold">
                  📜
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Linimasa Riwayat Khidmah Umat
                  </span>
                  <span className="text-[11px] text-slate-400">Verifikasi Presensi ABDI</span>
                </div>
                <h2 id="timeline-modal-title" className="text-lg sm:text-2xl font-black text-white mt-1">
                  Contribution Timeline: {selectedContributorName}
                </h2>
                <p className="text-xs text-slate-300">
                  {targetUserRole} • {targetUserMasjid} ({targetUserKelurahan})
                </p>
              </div>
            </div>

            {/* Header Right Action Buttons */}
            <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap sm:flex-nowrap">
              {onOpenQrScanner && (
                <button
                  id="btn-timeline-open-qr-scanner"
                  onClick={() => {
                    onClose();
                    onOpenQrScanner();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer ring-1 ring-emerald-300"
                  title="Buka Kamera Scanner QR untuk Check-in Sesi Masjid"
                >
                  <QrCode className="w-4 h-4 text-slate-950" />
                  <span>Scan QR Check-In</span>
                </button>
              )}

              <button
                id="btn-print-transcript"
                onClick={handlePrintTranscript}
                className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Cetak atau Simpan Transkrip PDF"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Transkrip Khidmah</span>
              </button>

              <button
                id="btn-add-timeline-entry"
                onClick={() => setIsAddingNewItem(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Catat Manual</span>
              </button>

              <button
                id="btn-close-timeline-modal"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                aria-label="Tutup Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Contributor Profile Selector (Allows viewing timeline of any registered icon) */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
              Pilih Tokoh / Profil:
            </span>
            {INITIAL_CONTRIBUTOR_LEADERBOARD.slice(0, 5).map((contributor) => (
              <button
                key={contributor.id}
                onClick={() => setSelectedContributorName(contributor.fullName)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  selectedContributorName === contributor.fullName
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{contributor.fullName.split(",")[0]}</span>
                {contributor.isCurrentUser && (
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-950 text-emerald-300 rounded font-bold border border-emerald-500/40">
                    Anda
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* High-Level Impact Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/40 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Total Khidmah
                </div>
                <div className="text-lg font-black text-amber-300 mt-0.5">{totalHours.toFixed(1)} Jam</div>
              </div>
              <div className="text-[10px] text-slate-500 text-right">
                {filteredItems.length} Riwayat Tercatat
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/40 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" /> Poin Keberkahan
                </div>
                <div className="text-lg font-black text-emerald-300 mt-0.5">+{totalPoints} Pts</div>
              </div>
              <div className="text-[10px] text-emerald-400/80 text-right">Terverifikasi DKM</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/40 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" /> Penerima Manfaat
                </div>
                <div className="text-lg font-black text-rose-300 mt-0.5">
                  {totalBeneficiaries > 0 ? `${totalBeneficiaries}+ Jiwa` : "Jamaah Rutin"}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 text-right">Lansia & Dhuafa</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/40 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Coins className="w-3 h-3 text-teal-400" /> Infaq & Wakaf
                </div>
                <div className="text-lg font-black text-teal-300 mt-0.5">
                  {totalDonationValue > 0 ? `Rp ${(totalDonationValue / 1000000).toFixed(1)}Jt` : "Khidmah Fisik"}
                </div>
              </div>
              <div className="text-[10px] text-teal-400/80 text-right">Amal Jariyah</div>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/90 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shrink-0 text-xs">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { key: "ALL", label: "Semua Aktivitas" },
              { key: "MOSQUE_ATTENDANCE", label: "🌅 Sholat & Subuh" },
              { key: "VOLUNTEER_MEDICAL", label: "🏥 Relawan Medis" },
              { key: "CHARITY_DISTRIBUTION", label: "🍲 Dapur Berkah" },
              { key: "ZISWAF_DONATION", label: "💰 ZISWAF & Wakaf" },
              { key: "EDUCATIONAL_DAKWAH", label: "📖 Kajian & Dakwah" },
              { key: "INFRASTRUCTURE_WAKAF", label: "🔨 Gotong Royong" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                  selectedCategory === tab.key
                    ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aktivitas, masjid, tag..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "NEWEST" ? "OLDEST" : "NEWEST")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-xs shrink-0 cursor-pointer"
              title="Ubah Urutan Kronologis"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>{sortOrder === "NEWEST" ? "Terbaru" : "Terlama"}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body: Chronological Timeline */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/60 rounded-3xl border border-slate-800 p-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-2xl text-slate-400">
                🔍
              </div>
              <h3 className="text-base font-bold text-white">Tidak Ada Riwayat Khidmah yang Sesuai</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Silakan ganti kata kunci pencarian atau ubah filter kategori untuk melihat riwayat aktivitas lainnya.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-500/30 space-y-8 ml-2 sm:ml-4">
              {filteredItems.map((item, index) => {
                const config = getCategoryConfig(item.category);
                const isExpanded = expandedItemId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className="relative group"
                  >
                    {/* Glowing Timeline Marker Node */}
                    <div
                      className={`absolute -left-[33px] sm:-left-[41px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${config.ringColor} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
                    >
                      {config.icon}
                    </div>

                    {/* Timeline Item Card */}
                    <div className="bg-slate-950/80 rounded-2xl border border-slate-800/90 hover:border-amber-500/50 p-4 sm:p-5 shadow-lg transition-all duration-200">
                      {/* Date & Category Badge Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-bold text-amber-300 flex items-center gap-1.5 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            {item.date}
                          </span>
                          <span className="text-slate-400 text-[11px]">({item.hijriDate})</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.time}
                          </span>
                        </div>

                        {/* Category & Points Badges */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                            {item.categoryLabel}
                          </span>
                          <span className="text-[11px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40">
                            +{item.impactMetrics.pointsEarned} Pts
                          </span>
                        </div>
                      </div>

                      {/* Main Title & Description */}
                      <div className="mt-3 space-y-1.5">
                        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                      </div>

                      {/* Location & Key Impact Stats Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
                        <div className="flex items-center gap-3 text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-amber-400" />
                            {item.masjidName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {item.kelurahan}
                          </span>
                        </div>

                        {/* Impact Pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.impactMetrics.hoursLogged && (
                            <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                              ⏱️ {item.impactMetrics.hoursLogged} Jam Khidmah
                            </span>
                          )}
                          {item.impactMetrics.beneficiariesCount && (
                            <span className="text-[11px] text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/30">
                              👥 {item.impactMetrics.beneficiariesCount} Mustahiq
                            </span>
                          )}
                          {item.impactMetrics.streakDayNumber && (
                            <span className="text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                              🔥 Hari ke-{item.impactMetrics.streakDayNumber}
                            </span>
                          )}
                          {item.impactMetrics.amountRp && (
                            <span className="text-[11px] text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-500/30">
                              💸 Rp {item.impactMetrics.amountRp.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Verification & Audit Info */}
                      <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {item.verificationStatus === "TERVERIFIKASI_DKM"
                              ? `Diverifikasi: ${item.verifiedBy}`
                              : item.verificationStatus === "SYSTEM_AUDITED"
                              ? "Audited by ABDI Gateway"
                              : "GPS Geo-Validated"}
                          </span>
                          {item.evidenceCode && (
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              Ref: {item.evidenceCode}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                          className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <span>{isExpanded ? "Sembunyikan" : "Detail Catatan"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Expanded Section */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl space-y-2"
                          >
                            {item.notes && (
                              <div>
                                <strong className="text-slate-200">Catatan Khusus:</strong> {item.notes}
                              </div>
                            )}
                            {item.locationDetails && (
                              <div>
                                <strong className="text-slate-200">Titik Lokasi Presensi:</strong>{" "}
                                {item.locationDetails}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1 pt-1">
                              <span className="text-slate-400 mr-1 font-medium">Tagar:</span>
                              {item.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-800 text-amber-300/90 px-2 py-0.5 rounded-md border border-slate-700"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-slate-400 text-center sm:text-left flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Seluruh riwayat presensi & infaq terenkripsi di Ledger Kaffah ABDI Cloud Sematang Borang.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNewItem(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              + Tambah Riwayat Baru
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>

      {/* Embedded Modal: Add New Contribution Entry Form */}
      {isAddingNewItem && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Catat Presensi / Khidmah Baru</h3>
                  <p className="text-xs text-slate-400">Linimasa Pengabdi {selectedContributorName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingNewItem(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul Aktivitas / Program</label>
                <input
                  type="text"
                  required
                  placeholder="mis. Sholat Subuh Berjamaah & Kajian Tafsir"
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Aktivitas</label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as ContributionCategory;
                      const labelMap: Record<ContributionCategory, string> = {
                        MOSQUE_ATTENDANCE: "Presensi Subuh",
                        VOLUNTEER_MEDICAL: "Khidmah Medis",
                        CHARITY_DISTRIBUTION: "Dapur Berkah",
                        ZISWAF_DONATION: "Sedekah Subuh",
                        EDUCATIONAL_DAKWAH: "Kajian & Dakwah",
                        INFRASTRUCTURE_WAKAF: "Gotong Royong",
                      };
                      setNewItemForm({
                        ...newItemForm,
                        category: cat,
                        categoryLabel: labelMap[cat] || "Khidmah",
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="MOSQUE_ATTENDANCE">🌅 Presensi Subuh & Masjid</option>
                    <option value="VOLUNTEER_MEDICAL">🏥 Khidmah Relawan Medis</option>
                    <option value="CHARITY_DISTRIBUTION">🍲 Dapur Berkah & Logistik</option>
                    <option value="ZISWAF_DONATION">💰 Infaq & Wakaf ZISWAF</option>
                    <option value="EDUCATIONAL_DAKWAH">📖 Kajian & Dakwah</option>
                    <option value="INFRASTRUCTURE_WAKAF">🔨 Gotong Royong / Fisik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Durasi Khidmah (Jam)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newItemForm.hoursLogged}
                    onChange={(e) => setNewItemForm({ ...newItemForm, hoursLogged: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Masjid / Lokasi</label>
                  <input
                    type="text"
                    value={newItemForm.masjidName}
                    onChange={(e) => setNewItemForm({ ...newItemForm, masjidName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kelurahan</label>
                  <select
                    value={newItemForm.kelurahan}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        kelurahan: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Sukamulya">Sukamulya</option>
                    <option value="Lebung Gajah">Lebung Gajah</option>
                    <option value="Karya Mulya">Karya Mulya</option>
                    <option value="Srimulya">Srimulya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Hasil Partisipasi</label>
                <textarea
                  rows={2}
                  placeholder="mis. Menghadiri sholat subuh berjamaah dan membantu penataan karpet sholat."
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNewItem(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black transition shadow-md shadow-amber-500/20"
                >
                  Simpan ke Linimasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-70 bg-emerald-950 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
