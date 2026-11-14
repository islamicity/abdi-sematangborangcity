import { useState, useMemo, FC, FormEvent } from "react";
import confetti from "canvas-confetti";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Heart,
  Building,
  CheckCircle2,
  Filter,
  Layers,
  Search,
  Plus,
  ArrowUpRight,
  Sparkles,
  Info,
  Clock,
  Users,
  Target,
  FileSpreadsheet,
  FileText,
  X,
  Stethoscope,
  ShoppingBag,
  BookOpen,
  Wrench,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ProjectFinancialAllocation } from "../types";
import { INITIAL_PROJECT_FINANCIAL_ALLOCATIONS } from "../data/financialStewardshipData";

interface FinancialStewardshipBreakdownProps {
  onSelectCategory?: (categoryId: string) => void;
}

// Category Color Scheme & Icons
export const CATEGORY_METADATA: Record<
  string,
  {
    name: string;
    shortLabel: string;
    color: string;
    lightBg: string;
    border: string;
    text: string;
    icon: typeof Stethoscope;
  }
> = {
  "cat-medis": {
    name: "Layanan Kesehatan & Khidmah Medis Dhuafa",
    shortLabel: "Kesehatan & Medis",
    color: "#10b981", // emerald-500
    lightBg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: Stethoscope,
  },
  "cat-pangan": {
    name: "Lumbung Pangan & Dapur Berkah Berbagi",
    shortLabel: "Pangan & Sembako",
    color: "#f59e0b", // amber-500
    lightBg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    icon: ShoppingBag,
  },
  "cat-pendidikan": {
    name: "Pendidikan, Rumah Tahfidz & Literasi Santri",
    shortLabel: "Pendidikan & Tahfidz",
    color: "#38bdf8", // sky-400
    lightBg: "bg-sky-500/10",
    border: "border-sky-500/30",
    text: "text-sky-400",
    icon: BookOpen,
  },
  "cat-infrastruktur": {
    name: "Infrastruktur, Sanitasi Air Bersih & Bedah Rumah",
    shortLabel: "Infrastruktur & Sanitasi",
    color: "#a855f7", // purple-500
    lightBg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    icon: Wrench,
  },
  "cat-sosial-jenazah": {
    name: "Penyelenggaraan Jenazah, Fardhu Kifayah & Ambulans",
    shortLabel: "Jenazah & Siaga Darurat",
    color: "#f43f5e", // rose-500
    lightBg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    icon: Heart,
  },
  "cat-umkm": {
    name: "Pemberdayaan Ekonomi & Modal Qardhul Hasan UMKM",
    shortLabel: "Ekonomi & Halal UMKM",
    color: "#ec4899", // pink-500
    lightBg: "bg-pink-500/10",
    border: "border-pink-500/30",
    text: "text-pink-400",
    icon: Building,
  },
  "cat-teknologi": {
    name: "Teknologi, Media Dakwah & Digitalisasi Masjid",
    shortLabel: "IT & Media Dakwah",
    color: "#06b6d4", // cyan-500
    lightBg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    icon: Smartphone,
  },
};

export const FinancialStewardshipBreakdown: FC<FinancialStewardshipBreakdownProps> = ({
  onSelectCategory,
}) => {
  const [allocations, setAllocations] = useState<ProjectFinancialAllocation[]>(
    INITIAL_PROJECT_FINANCIAL_ALLOCATIONS
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [selectedKelurahanFilter, setSelectedKelurahanFilter] = useState<string>("Semua");
  const [selectedFundSourceFilter, setSelectedFundSourceFilter] = useState<string>("Semua");
  const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // New Allocation Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newCategoryId, setNewCategoryId] = useState<string>("cat-pangan");
  const [newMasjid, setNewMasjid] = useState<string>("Masjid Jami' Al-Ikhlas");
  const [newKelurahan, setNewKelurahan] = useState<"Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya">("Sukamulya");
  const [newAllocatedAmount, setNewAllocatedAmount] = useState<number>(10000000);
  const [newSourceFund, setNewSourceFund] = useState<"Sedekah Subuh" | "Infaq Khusus Program" | "Wakaf Manfaat" | "Dana Tabarru' DKM" | "Zakat Maal Produktif">("Sedekah Subuh");
  const [newBeneficiaries, setNewBeneficiaries] = useState<number>(200);
  const [newBeneficiaryUnit, setNewBeneficiaryUnit] = useState<string>("Mustahiq & Dhuafa");
  const [newKeyOutput, setNewKeyOutput] = useState<string>("Penyaluran paket manfaat langsung tanpa potongan admin");

  // Summary Totals
  const totalAllocated = useMemo(() => {
    return allocations.reduce((sum, item) => sum + item.allocatedAmountRp, 0);
  }, [allocations]);

  const totalDisbursed = useMemo(() => {
    return allocations.reduce((sum, item) => sum + item.disbursedAmountRp, 0);
  }, [allocations]);

  const totalBeneficiaries = useMemo(() => {
    return allocations.reduce((sum, item) => sum + item.beneficiariesCount, 0);
  }, [allocations]);

  const totalVolunteerHours = useMemo(() => {
    return allocations.reduce((sum, item) => sum + item.volunteerHoursLogged, 0);
  }, [allocations]);

  const weightedSroiMultiplier = useMemo(() => {
    if (totalAllocated === 0) return 1;
    const totalBenefit = allocations.reduce(
      (sum, item) => sum + item.allocatedAmountRp * item.sroiMultiplier,
      0
    );
    return (totalBenefit / totalAllocated).toFixed(2);
  }, [allocations, totalAllocated]);

  const disbursementPct = Math.round((totalDisbursed / (totalAllocated || 1)) * 100);

  // Group Allocations by Category for Donut Chart
  const categoryDonutData = useMemo(() => {
    const map: Record<
      string,
      {
        id: string;
        name: string;
        shortLabel: string;
        value: number; // allocated amount
        disbursed: number;
        projectCount: number;
        volunteers: number;
        hours: number;
        beneficiaries: number;
        color: string;
      }
    > = {};

    Object.keys(CATEGORY_METADATA).forEach((catId) => {
      const meta = CATEGORY_METADATA[catId];
      map[catId] = {
        id: catId,
        name: meta.name,
        shortLabel: meta.shortLabel,
        value: 0,
        disbursed: 0,
        projectCount: 0,
        volunteers: 0,
        hours: 0,
        beneficiaries: 0,
        color: meta.color,
      };
    });

    allocations.forEach((item) => {
      if (map[item.categoryId]) {
        map[item.categoryId].value += item.allocatedAmountRp;
        map[item.categoryId].disbursed += item.disbursedAmountRp;
        map[item.categoryId].projectCount += 1;
        map[item.categoryId].volunteers += item.volunteerCount;
        map[item.categoryId].hours += item.volunteerHoursLogged;
        map[item.categoryId].beneficiaries += item.beneficiariesCount;
      }
    });

    return Object.values(map)
      .filter((item) => item.value > 0)
      .map((item) => {
        const pctOfTotal = ((item.value / (totalAllocated || 1)) * 100).toFixed(1);
        return {
          ...item,
          pctOfTotal: Number(pctOfTotal),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [allocations, totalAllocated]);

  // Filtered Project List
  const filteredProjects = useMemo(() => {
    return allocations.filter((item) => {
      const matchCat =
        selectedCategoryFilter === "ALL" || item.categoryId === selectedCategoryFilter;
      const matchKel =
        selectedKelurahanFilter === "Semua" || item.kelurahan === selectedKelurahanFilter;
      const matchFund =
        selectedFundSourceFilter === "Semua" || item.sourceFund === selectedFundSourceFilter;
      const matchQuery =
        searchQuery.trim() === "" ||
        item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.homeMasjid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchKel && matchFund && matchQuery;
    });
  }, [
    allocations,
    selectedCategoryFilter,
    selectedKelurahanFilter,
    selectedFundSourceFilter,
    searchQuery,
  ]);

  // Handle Add Allocation Submit
  const handleAddAllocation = (e: FormEvent) => {
    e.preventDefault();
    if (!newProjectName || newAllocatedAmount <= 0) return;

    const meta = CATEGORY_METADATA[newCategoryId] || CATEGORY_METADATA["cat-pangan"];

    const newRecord: ProjectFinancialAllocation = {
      id: `pfa-${Date.now()}`,
      projectName: newProjectName,
      category: meta.shortLabel,
      categoryId: newCategoryId,
      homeMasjid: newMasjid,
      kelurahan: newKelurahan,
      allocatedAmountRp: newAllocatedAmount,
      disbursedAmountRp: Math.round(newAllocatedAmount * 0.85),
      volunteerCount: 10,
      volunteerHoursLogged: 40,
      beneficiariesCount: newBeneficiaries,
      beneficiaryUnit: newBeneficiaryUnit,
      costPerBeneficiaryRp: Math.round(newAllocatedAmount / (newBeneficiaries || 1)),
      sroiMultiplier: 2.9,
      status: "AKTIF",
      auditStatus: "VERIFIED_DKM",
      lastAuditDate: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      sourceFund: newSourceFund,
      keyOutputs: [
        newKeyOutput || "Alokasi dana amanah terverifikasi DKM",
        "Penyaluran terkoordinasi dengan relawan lapangan",
      ],
    };

    setAllocations((prev) => [newRecord, ...prev]);
    setShowAddModal(false);
    setNewProjectName("");

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#10b981", "#f59e0b", "#38bdf8", "#ec4899"],
      });
    } catch {
      // ignore
    }
  };

  // Custom Tooltip for Recharts Donut
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const meta = CATEGORY_METADATA[data.id] || CATEGORY_METADATA["cat-medis"];
      const IconComponent = meta.icon;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-2 min-w-[240px] z-50 animate-fadeIn">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: data.color }}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white leading-tight">{data.shortLabel}</div>
              <div className="text-[10px] text-slate-400">{data.projectCount} Proyek Aktif</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span>Alokasi Dana:</span>
              <span className="font-mono font-bold text-amber-300">
                Rp {data.value.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Porsi Anggaran:</span>
              <span className="font-mono font-bold text-emerald-400">
                {data.pctOfTotal}% dari Total
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Dana Tersalur:</span>
              <span className="font-mono text-slate-200">
                Rp {data.disbursed.toLocaleString("id-ID")} (
                {Math.round((data.disbursed / data.value) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Penerima Manfaat:</span>
              <span className="font-mono text-sky-300">
                {data.beneficiaries.toLocaleString("id-ID")} Jiwa
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Dukungan Relawan:</span>
              <span className="font-mono text-purple-300">
                {data.volunteers} Relawan ({data.hours}j)
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>100% Bebas Potongan Operasional DKM</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="financial-stewardship-breakdown-section"
      className="space-y-6 bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-800 relative overflow-hidden"
    >
      {/* Background Accent Gradients */}
      <div className="absolute -top-12 -right-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>FINANCIAL STEWARDSHIP & SADAQAH ALLOCATION DONUT ANALYTICS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span>Financial Stewardship Breakdown</span>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
              Amanah Umat 100%
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Visualisasi distribusi dana <strong>Sedekah, Infaq, Zakat Maal & Wakaf Manfaat</strong> across active volunteer projects. Setiap rupiah disalurkan secara transparan dengan audit DKM dan daya ungkit tenaga khidmah relawan (SROI Multiplier).
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-simulate-add-allocation"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-xs font-bold text-white shadow-lg transition active:scale-95 group"
          >
            <Plus className="w-4 h-4 text-amber-200 group-hover:rotate-90 transition" />
            <span>Alokasikan Dana Baru</span>
          </button>
        </div>
      </div>

      {/* Top 4 Financial Stewardship KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Dana Amanah Umat</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 mt-1">
            Rp {(totalAllocated / 1000000).toFixed(1)}{" "}
            <span className="text-xs text-slate-400 font-normal">Juta</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{allocations.length} Proyek Lapangan</span>
            <span className="text-amber-400 font-bold font-mono">100% Syariah</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Rp {totalAllocated.toLocaleString("id-ID")} terkelola
          </div>
        </div>

        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Tingkat Penyerapan Dana</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300 mt-1">
            {disbursementPct}%
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: `${disbursementPct}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Rp {(totalDisbursed / 1000000).toFixed(1)}Jt
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Terserap langsung ke mustahiq lapangan
          </div>
        </div>

        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Daya Ungkit SROI Sosial</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-sky-300 mt-1">
            {weightedSroiMultiplier}x{" "}
            <span className="text-xs text-slate-400 font-normal">Multiplier</span>
          </div>
          <div className="text-[11px] text-sky-400/90 font-medium mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rp 1 Sadaqah = Rp {weightedSroiMultiplier} Manfaat</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Berkat {totalVolunteerHours} jam kerja relawan gratis
          </div>
        </div>

        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Penerima Manfaat Langsung</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300 mt-1">
            {totalBeneficiaries.toLocaleString("id-ID")}{" "}
            <span className="text-xs text-slate-400 font-normal">Mustahiq</span>
          </div>
          <div className="text-[11px] text-purple-400/90 font-medium mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>98.6% Direct Impact Ratio</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            0% Potongan Gaji Pengurus DKM
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Donut Chart (Left 7 Cols) + Category Breakdown Cards (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left: Recharts Donut Chart with Center Cutout Summary */}
        <div className="lg:col-span-7 bg-slate-950/90 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Distribusi Alokasi Dana per Kategori Layanan</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Arahkan kursor atau klik irisan donat untuk melihat rincian alokasi dan efisiensi sosial.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold bg-amber-950 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
              Donut Analysis
            </span>
          </div>

          {/* Donut Chart Canvas Container */}
          <div className="relative w-full h-[320px] sm:h-[360px] my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={categoryDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={125}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  onMouseEnter={(_, index) => {
                    setActiveSliceIndex(index);
                    setHoveredCategoryId(categoryDonutData[index]?.id || null);
                  }}
                  onMouseLeave={() => {
                    setActiveSliceIndex(null);
                    setHoveredCategoryId(null);
                  }}
                  onClick={(_, index) => {
                    const catId = categoryDonutData[index]?.id;
                    if (catId) {
                      setSelectedCategoryFilter(
                        selectedCategoryFilter === catId ? "ALL" : catId
                      );
                      if (onSelectCategory) onSelectCategory(catId);
                    }
                  }}
                  cursor="pointer"
                >
                  {categoryDonutData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={entry.color}
                      stroke={
                        activeSliceIndex === index || hoveredCategoryId === entry.id
                          ? "#ffffff"
                          : "#0f172a"
                      }
                      strokeWidth={activeSliceIndex === index ? 3 : 1.5}
                      opacity={
                        hoveredCategoryId && hoveredCategoryId !== entry.id ? 0.45 : 1
                      }
                      className="transition-all duration-300"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Cutout Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Total Alokasi
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                Rp {(totalAllocated / 1000000).toFixed(1)} M
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {categoryDonutData.length} Kategori Layanan
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5">
                {disbursementPct}% Terserap
              </span>
            </div>
          </div>

          {/* Quick Interactive Mini Legend */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[11px]">
            {categoryDonutData.map((c) => (
              <div
                key={c.id}
                onMouseEnter={() => setHoveredCategoryId(c.id)}
                onMouseLeave={() => setHoveredCategoryId(null)}
                onClick={() => {
                  setSelectedCategoryFilter(
                    selectedCategoryFilter === c.id ? "ALL" : c.id
                  );
                }}
                className={`p-2 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedCategoryFilter === c.id || hoveredCategoryId === c.id
                    ? "bg-slate-900 border-amber-400/60 ring-1 ring-amber-400/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  ></span>
                  <span className="text-slate-300 font-medium truncate">
                    {c.shortLabel}
                  </span>
                </div>
                <span className="font-mono font-bold text-white text-xs ml-1">
                  {c.pctOfTotal}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Breakdown Cards with Fund Details & Progress */}
        <div className="lg:col-span-5 bg-slate-950/90 rounded-3xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Rincian Anggaran per Sektor Layanan</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {allocations.length} Proyek Berjalan
            </span>
          </div>

          {/* Scrollable Category List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {categoryDonutData.map((c) => {
              const meta = CATEGORY_METADATA[c.id] || CATEGORY_METADATA["cat-medis"];
              const IconComp = meta.icon;
              const isSelected = selectedCategoryFilter === c.id;
              const isHovered = hoveredCategoryId === c.id;

              return (
                <div
                  key={c.id}
                  onMouseEnter={() => setHoveredCategoryId(c.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  onClick={() =>
                    setSelectedCategoryFilter(isSelected ? "ALL" : c.id)
                  }
                  className={`p-3 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected || isHovered
                      ? "bg-slate-900 border-amber-400/70 ring-1 ring-amber-400/40 shadow-md"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: c.color }}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs leading-tight">
                          {c.shortLabel}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {c.projectCount} Proyek • {c.volunteers} Relawan Aktif
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-300 text-xs">
                        Rp {(c.value / 1000000).toFixed(1)} Jt
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                        {c.pctOfTotal}% dari total
                      </div>
                    </div>
                  </div>

                  {/* Fund Progress Bar (Disbursed vs Allocated) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        Terserap: Rp {(c.disbursed / 1000000).toFixed(1)} Jt
                      </span>
                      <span>
                        {Math.round((c.disbursed / c.value) * 100)}% Tersalur
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (c.disbursed / c.value) * 100)}%`,
                          backgroundColor: c.color,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>
                      👥 {c.beneficiaries.toLocaleString("id-ID")} Penerima Manfaat
                    </span>
                    <span className="text-emerald-400 font-medium">
                      ⏱️ {c.hours} Jam Khidmah
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-[11px] text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Standar Pengawasan Syariah DKM Sematang Borang</span>
            </span>
            <span className="font-bold text-white">Akuntabel</span>
          </div>
        </div>
      </div>

      {/* Project Financial Ledger Table & Filter Controls */}
      <div className="bg-slate-950/90 rounded-3xl p-5 border border-slate-800 space-y-4 relative z-10">
        {/* Ledger Header & Search/Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              <span>Buku Besar Alokasi Dana Proyek Relawan (Project Financial Ledger)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Menampilkan rincian anggaran, realisasi serapan dana, jumlah relawan, dan biaya per mustahiq pada setiap proyek lapangan.
            </p>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari proyek atau masjid..."
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 w-48 sm:w-60"
              />
            </div>
            {selectedCategoryFilter !== "ALL" && (
              <button
                onClick={() => setSelectedCategoryFilter("ALL")}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/30"
              >
                <span>Reset Kategori</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Select */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Kategori:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">Semua Kategori ({allocations.length})</option>
                {Object.keys(CATEGORY_METADATA).map((catId) => (
                  <option key={catId} value={catId} className="bg-slate-900 text-white">
                    {CATEGORY_METADATA[catId].shortLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Kelurahan Select */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Kelurahan:</span>
              <select
                value={selectedKelurahanFilter}
                onChange={(e) => setSelectedKelurahanFilter(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value="Semua" className="bg-slate-900 text-white">Semua Kelurahan</option>
                <option value="Sukamulya" className="bg-slate-900 text-white">Sukamulya</option>
                <option value="Lebung Gajah" className="bg-slate-900 text-white">Lebung Gajah</option>
                <option value="Karya Mulya" className="bg-slate-900 text-white">Karya Mulya</option>
                <option value="Srimulya" className="bg-slate-900 text-white">Srimulya</option>
              </select>
            </div>

            {/* Fund Source Select */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Sumber Kas:</span>
              <select
                value={selectedFundSourceFilter}
                onChange={(e) => setSelectedFundSourceFilter(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value="Semua" className="bg-slate-900 text-white">Semua Sumber Dana</option>
                <option value="Sedekah Subuh" className="bg-slate-900 text-white">Sedekah Subuh</option>
                <option value="Infaq Khusus Program" className="bg-slate-900 text-white">Infaq Khusus Program</option>
                <option value="Wakaf Manfaat" className="bg-slate-900 text-white">Wakaf Manfaat</option>
                <option value="Zakat Maal Produktif" className="bg-slate-900 text-white">Zakat Maal Produktif</option>
                <option value="Dana Tabarru' DKM" className="bg-slate-900 text-white">Dana Tabarru' DKM</option>
              </select>
            </div>
          </div>

          <div className="text-slate-400 text-[11px]">
            Menampilkan <strong className="text-white">{filteredProjects.length}</strong> dari {allocations.length} proyek
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                <th className="p-3 rounded-l-xl">Nama Proyek & Lokasi</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Sumber Kas</th>
                <th className="p-3 text-right">Alokasi Anggaran</th>
                <th className="p-3 text-right">Dana Tersalur</th>
                <th className="p-3 text-center">Tim Relawan</th>
                <th className="p-3">Penerima Manfaat</th>
                <th className="p-3 text-center">Audit DKM</th>
                <th className="p-3 rounded-r-xl text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProjects.map((p) => {
                const meta = CATEGORY_METADATA[p.categoryId] || CATEGORY_METADATA["cat-medis"];
                const pctDisbursed = Math.round((p.disbursedAmountRp / (p.allocatedAmountRp || 1)) * 100);
                const isExpanded = expandedProjectId === p.id;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-900/60 transition group"
                  >
                    <td className="p-3 font-bold text-white">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: meta.color }}
                          ></span>
                          <span className="text-slate-100">{p.projectName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>📍 {p.homeMasjid}</span>
                          <span>•</span>
                          <span className="text-slate-400 font-normal">Kel. {p.kelurahan}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${meta.color}15`,
                          borderColor: `${meta.color}40`,
                          color: meta.color,
                        }}
                      >
                        {meta.shortLabel}
                      </span>
                    </td>

                    <td className="p-3 font-medium text-slate-300">
                      <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-[10px]">
                        {p.sourceFund}
                      </span>
                    </td>

                    <td className="p-3 font-mono font-bold text-amber-300 text-right">
                      Rp {p.allocatedAmountRp.toLocaleString("id-ID")}
                    </td>

                    <td className="p-3 font-mono text-right">
                      <div className="text-emerald-300 font-bold">
                        Rp {p.disbursedAmountRp.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] text-slate-400">{pctDisbursed}% terserap</div>
                    </td>

                    <td className="p-3 text-center">
                      <div className="font-mono font-bold text-white">
                        {p.volunteerCount} Relawan
                      </div>
                      <div className="text-[10px] text-purple-400 font-mono">
                        {p.volunteerHoursLogged} Jam Khidmah
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-200">
                        {p.beneficiariesCount} {p.beneficiaryUnit}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Rp {p.costPerBeneficiaryRp.toLocaleString("id-ID")}/jiwa
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Verifikasi DKM</span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setExpandedProjectId(isExpanded ? null : p.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded Details Card View if any project is selected */}
        {expandedProjectId && (
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
            {(() => {
              const p = allocations.find((x) => x.id === expandedProjectId);
              if (!p) return null;
              const meta = CATEGORY_METADATA[p.categoryId] || CATEGORY_METADATA["cat-medis"];

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      ></span>
                      <h5 className="font-bold text-white text-xs sm:text-sm">
                        Rincian Output & Audit: {p.projectName}
                      </h5>
                    </div>
                    <button
                      onClick={() => setExpandedProjectId(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[10px]">Lokasi & Pengelola</div>
                      <div className="font-bold text-white">{p.homeMasjid}</div>
                      <div className="text-slate-400 text-[10px]">
                        Kelurahan {p.kelurahan} • Sematang Borang
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[10px]">Efisiensi & SROI Multiplier</div>
                      <div className="font-mono font-bold text-emerald-400">
                        {p.sroiMultiplier}x Nilai Manfaat
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Biaya Manfaat: Rp {p.costPerBeneficiaryRp.toLocaleString("id-ID")}/penerima
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[10px]">Status Audit & Tanggal Terakhir</div>
                      <div className="font-bold text-amber-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Lolos Audit Syariah DKM</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">Audit Terakhir: {p.lastAuditDate}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-300">
                      Capaian Output Nyata di Lapangan:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {p.keyOutputs.map((out, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Modal: Alokasi Dana Amanah Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Alokasikan Dana Amanah / Sadaqah Baru</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAllocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Nama Program / Proyek Relawan
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Contoh: Pembagian Kacamata Baca Gratis Santri Dhuafa"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Kategori Layanan
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {Object.keys(CATEGORY_METADATA).map((catId) => (
                      <option key={catId} value={catId}>
                        {CATEGORY_METADATA[catId].shortLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Sumber Kas / Jenis Donasi
                  </label>
                  <select
                    value={newSourceFund}
                    onChange={(e) => setNewSourceFund(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Sedekah Subuh">Sedekah Subuh</option>
                    <option value="Infaq Khusus Program">Infaq Khusus Program</option>
                    <option value="Wakaf Manfaat">Wakaf Manfaat</option>
                    <option value="Zakat Maal Produktif">Zakat Maal Produktif</option>
                    <option value="Dana Tabarru' DKM">Dana Tabarru' DKM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Besar Alokasi Dana (Rp)
                  </label>
                  <input
                    type="number"
                    min="500000"
                    step="500000"
                    required
                    value={newAllocatedAmount}
                    onChange={(e) => setNewAllocatedAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Target Penerima Manfaat
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBeneficiaries}
                    onChange={(e) => setNewBeneficiaries(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Masjid Basis Penyaluran
                  </label>
                  <input
                    type="text"
                    required
                    value={newMasjid}
                    onChange={(e) => setNewMasjid(e.target.value)}
                    placeholder="Contoh: Masjid Jami' Al-Ikhlas"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Kelurahan Fokus
                  </label>
                  <select
                    value={newKelurahan}
                    onChange={(e) => setNewKelurahan(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Sukamulya">Sukamulya</option>
                    <option value="Lebung Gajah">Lebung Gajah</option>
                    <option value="Karya Mulya">Karya Mulya</option>
                    <option value="Srimulya">Srimulya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Rencana Output Nyata Proyek
                </label>
                <input
                  type="text"
                  value={newKeyOutput}
                  onChange={(e) => setNewKeyOutput(e.target.value)}
                  placeholder="Contoh: Pengadaan 100 kacamata baca & skrining dokter spesialis mata"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-200 text-[11px]">
                💡 Alokasi dana yang ditambahkan akan secara otomatis memperbarui irisan diagram donat (Donut Chart) dan kalkulasi penyerapan dana secara real-time.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan & Alokasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
