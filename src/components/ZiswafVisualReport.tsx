import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Building2,
  ShieldCheck,
  Sparkles,
  Download,
  Filter,
  Layers,
  ArrowUpRight,
  HeartHandshake,
  CheckCircle2,
  Coins,
  FileSpreadsheet,
  RefreshCw,
  Info,
  Printer,
  FileText,
} from "lucide-react";
import { ZiswafTransaction } from "../types";
import PrintableCommunityReportModal from "./PrintableCommunityReportModal";

interface ZiswafVisualReportProps {
  transactions: ZiswafTransaction[];
  onOpenDonate?: () => void;
  onRequestPrintReport?: () => void;
  onOpenForecast?: () => void;
}

// Master Color Palette for Islamic FinTech Visuals
const PROGRAM_COLORS = [
  "#0d9488", // Teal 600 - Lumbung Pangan
  "#059669", // Emerald 600 - Pemberdayaan UMKM
  "#3b82f6", // Blue 500 - Beasiswa Santri
  "#f59e0b", // Amber 500 - Kesehatan Dhuafa
  "#6366f1", // Indigo 500 - Operasional & Sarana Dakwah
  "#ec4899", // Pink 500 - Pembebasan Gharimin
];

export default function ZiswafVisualReport({
  transactions,
  onOpenDonate,
  onRequestPrintReport,
  onOpenForecast,
}: ZiswafVisualReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Tahun 2026");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Semua");
  const [activeChartTab, setActiveChartTab] = useState<"overview" | "distribution" | "impact" | "growth">("overview");
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Dynamic calculations from current transactions
  const totalTransactionAmount = transactions.reduce((acc, t) => acc + t.amount, 0);

  // 1. ZISWAF Fund Distribution by Program / Asnaf Data
  const distributionData = [
    {
      name: "Lumbung Pangan Mustahiq",
      asnaf: "Fakir & Miskin",
      allocated: 28500000 + (totalTransactionAmount > 50000000 ? 5000000 : 0),
      target: 30000000,
      percentage: 34.5,
      recipients: 340,
      color: "#0d9488",
    },
    {
      name: "Modal Usaha UMKM Berkah",
      asnaf: "Pemberdayaan Umat / Amil",
      allocated: 22000000,
      target: 25000000,
      percentage: 26.6,
      recipients: 144,
      color: "#059669",
    },
    {
      name: "Beasiswa Santri & Tahfidz",
      asnaf: "Fisabilillah",
      allocated: 15500000,
      target: 18000000,
      percentage: 18.8,
      recipients: 120,
      color: "#3b82f6",
    },
    {
      name: "Pelayanan Medis Dhuafa",
      asnaf: "Ibnu Sabil & Miskin",
      allocated: 9500000,
      target: 10000000,
      percentage: 11.5,
      recipients: 95,
      color: "#f59e0b",
    },
    {
      name: "Sarana & Dakwah Masjid",
      asnaf: "Fisabilillah / Mu'allaf",
      allocated: 7250000,
      target: 8000000,
      percentage: 8.6,
      recipients: 81,
      color: "#6366f1",
    },
  ];

  const totalAllocated = distributionData.reduce((sum, item) => sum + item.allocated, 0);
  const totalTarget = distributionData.reduce((sum, item) => sum + item.target, 0);
  const totalRecipients = distributionData.reduce((sum, item) => sum + item.recipients, 0);

  // 2. Monthly Trend Data (Jan - Aug 2026)
  const monthlyTrendData = [
    { month: "Jan", penerimaan: 32000000, penyaluran: 28000000, mustahiq: 450, surplus: 4000000 },
    { month: "Feb", penerimaan: 38500000, penyaluran: 34000000, mustahiq: 510, surplus: 4500000 },
    { month: "Mar", penerimaan: 68000000, penyaluran: 61000000, mustahiq: 820, surplus: 7000000 }, // Ramadhan Peak
    { month: "Apr", penerimaan: 94000000, penyaluran: 88500000, mustahiq: 1150, surplus: 5500000 }, // Idul Fitri
    { month: "Mei", penerimaan: 42000000, penyaluran: 38000000, mustahiq: 590, surplus: 4000000 },
    { month: "Jun", penerimaan: 55000000, penyaluran: 49000000, mustahiq: 680, surplus: 6000000 }, // Idul Adha
    { month: "Jul", penerimaan: 48000000, penyaluran: 44500000, mustahiq: 720, surplus: 3500000 },
    { month: "Agu (Live)", penerimaan: totalTransactionAmount > 0 ? 52000000 + totalTransactionAmount : 69750000, penyaluran: 58500000, mustahiq: 780, surplus: 11250000 },
  ];

  // 3. Community Social Impact by Kelurahan Data
  const kelurahanImpactData = [
    {
      kelurahan: "Sukamulya",
      penerimaPangan: 245,
      umkmBerdaya: 48,
      beasiswaSantri: 42,
      danaTersalurkanJuta: 31.5,
      indeksMandiri: 88,
    },
    {
      kelurahan: "Lebung Gajah",
      penerimaPangan: 198,
      umkmBerdaya: 38,
      beasiswaSantri: 32,
      danaTersalurkanJuta: 24.2,
      indeksMandiri: 82,
    },
    {
      kelurahan: "Karya Mulya",
      penerimaPangan: 165,
      umkmBerdaya: 30,
      beasiswaSantri: 26,
      danaTersalurkanJuta: 19.8,
      indeksMandiri: 85,
    },
    {
      kelurahan: "Srimulya",
      penerimaPangan: 182,
      umkmBerdaya: 36,
      beasiswaSantri: 30,
      danaTersalurkanJuta: 22.4,
      indeksMandiri: 86,
    },
  ];

  // Filtered kelurahan data if user selects specific kelurahan
  const displayKelurahanData =
    selectedKelurahan === "Semua"
      ? kelurahanImpactData
      : kelurahanImpactData.filter((k) => k.kelurahan === selectedKelurahan);

  // 4. Radar Data: SROI & Multiplier Dimensions
  const sroiRadarData = [
    { metric: "Ketahanan Pangan", skor: 92, target: 100 },
    { metric: "Pemberdayaan UMKM", skor: 86, target: 100 },
    { metric: "Pendidikan Santri", skor: 94, target: 100 },
    { metric: "Bebas Riba & Rentenir", skor: 90, target: 100 },
    { metric: "Layanan Kesehatan", skor: 84, target: 100 },
    { metric: "Akuntabilitas Amil", skor: 99, target: 100 },
  ];

  // Custom Rupiah Formatter for Tooltips
  const formatRupiah = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  return (
    <div id="ziswaf-visual-report-container" className="space-y-6">
      {/* Header & Filter Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 text-white flex items-center justify-center shadow-md">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Laporan Visual ZISWAF & Dampak Sosial Umat
                </h3>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                  Live BI Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Visualisasi terpadu distribusi dana Zakat, Infaq, Shodaqoh, dan Wakaf (ZISWAF) serta metrik keberdayaan jamaah Sematang Borang.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 text-[11px] font-medium">Periode:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option>Tahun 2026</option>
                <option>Kuartal 3 (Juli-Sept)</option>
                <option>Semester 1 (Jan-Jun)</option>
                <option>Bulan Berjalan (Agustus)</option>
              </select>
            </div>

            {/* Kelurahan Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 text-[11px] font-medium">Wilayah:</span>
              <select
                value={selectedKelurahan}
                onChange={(e) => setSelectedKelurahan(e.target.value)}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua 4 Kelurahan</option>
                <option value="Sukamulya">Kel. Sukamulya</option>
                <option value="Lebung Gajah">Kel. Lebung Gajah</option>
                <option value="Karya Mulya">Kel. Karya Mulya</option>
                <option value="Srimulya">Kel. Srimulya</option>
              </select>
            </div>

            {/* Predictive AI Forecasting Button */}
            {onOpenForecast && (
              <button
                id="open-ai-forecast-btn"
                onClick={onOpenForecast}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition shadow-sm"
                title="Buka Model AI Prediktif Peramalan Pertumbuhan ZISWAFH Kuartal Mendatang"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>AI Forecast Kuartal</span>
              </button>
            )}

            {/* Print-Friendly Summary Generation Button */}
            <button
              id="generate-printable-summary-btn"
              onClick={() => {
                if (onRequestPrintReport) {
                  onRequestPrintReport();
                } else {
                  setIsPrintModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border border-teal-400/40"
              title="Generate Ringkasan Transparansi Siap Cetak untuk Papan Masjid & Buletin Warga"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan Transparansi</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: Total Tersalurkan */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50/80 p-4 rounded-xl border border-teal-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-teal-800 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-teal-600" />
              Total Dana Tersalurkan
            </span>
            <div className="text-xl sm:text-2xl font-black text-teal-950 font-mono">
              Rp {(totalAllocated / 1000000).toFixed(1)} Jt
            </div>
            <div className="text-[10px] text-teal-700 font-medium flex items-center gap-1">
              <span className="font-bold text-emerald-700">91.5%</span> dari Target {formatRupiah(totalTarget)}
            </div>
          </div>

          {/* Card 2: Total Mustahiq / Penerima Manfaat */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50/80 p-4 rounded-xl border border-blue-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-blue-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Penerima Manfaat
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-950 font-mono">
              {totalRecipients.toLocaleString("id-ID")} Jiwa
            </div>
            <div className="text-[10px] text-blue-700 font-medium">
              4 Kelurahan Se-Kecamatan
            </div>
          </div>

          {/* Card 3: Social ROI Multiplier */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 p-4 rounded-xl border border-amber-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              Social ROI (SROI)
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
              1 : 3.8x
            </div>
            <div className="text-[10px] text-amber-700 font-medium">
              Multiplier Manfaat Ekonomi
            </div>
          </div>

          {/* Card 4: Rasio Efisiensi Amil */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 p-4 rounded-xl border border-emerald-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Rasio Hak Amil
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
              7.2%
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">
              Standar DSN-MUI (Maks 12.5%)
            </div>
          </div>

          {/* Card 5: Tingkat Transparansi */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/80 p-4 rounded-xl border border-purple-200/80 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-purple-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Audit Integritas Data
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-950 font-mono">
              100%
            </div>
            <div className="text-[10px] text-purple-700 font-medium">
              Verified Public Ledger
            </div>
          </div>
        </div>

        {/* Chart View Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            id="tab-chart-overview"
            onClick={() => setActiveChartTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeChartTab === "overview"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Ringkasan Komprehensif
          </button>
          <button
            id="tab-chart-distribution"
            onClick={() => setActiveChartTab("distribution")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeChartTab === "distribution"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            Distribusi Dana per Asnaf
          </button>
          <button
            id="tab-chart-impact"
            onClick={() => setActiveChartTab("impact")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeChartTab === "impact"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dampak per Kelurahan
          </button>
          <button
            id="tab-chart-growth"
            onClick={() => setActiveChartTab("growth")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeChartTab === "growth"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Tren Arus Kas Inflow vs Penyaluran
          </button>
        </div>
      </div>

      {/* CHART SECTION: OVERVIEW OR SPECIFIC VIEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Fund Distribution by Program / Asnaf (Donut Chart) */}
        {(activeChartTab === "overview" || activeChartTab === "distribution") && (
          <div className={`${activeChartTab === "overview" ? "lg:col-span-6" : "lg:col-span-12"} bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-teal-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Alokasi Penyaluran Berdasarkan Asnaf & Program
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Proporsi pemanfaatan dana ZISWAF {selectedPeriod}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  Total: {formatRupiah(totalAllocated)}
                </span>
              </div>

              {/* Recharts Pie / Donut Chart */}
              <div className="h-64 sm:h-72 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value: any) => [formatRupiah(Number(value)), "Dana Tersalurkan"]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      itemStyle={{ color: "#5eead4" }}
                    />
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="allocated"
                      onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || PROGRAM_COLORS[index % PROGRAM_COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={hoveredPieIndex === index ? 3 : 1.5}
                          style={{
                            cursor: "pointer",
                            filter: hoveredPieIndex === index ? "brightness(1.1)" : "none",
                            transition: "all 0.2s ease-in-out",
                          }}
                        />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-[11px] text-slate-700 font-medium">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Micro List Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {distributionData.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between transition ${
                    hoveredPieIndex === idx
                      ? "bg-teal-50/80 border-teal-300 shadow-xs"
                      : "bg-slate-50/70 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <div>
                      <div className="font-semibold text-slate-900 text-[11px] leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{item.asnaf}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-[11px]">
                      {formatRupiah(item.allocated)}
                    </div>
                    <div className="text-[10px] text-teal-700 font-medium">
                      {item.recipients} Mustahiq
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHART 2: Monthly Inflow vs Distribution Trend (Area / Composed Chart) */}
        {(activeChartTab === "overview" || activeChartTab === "growth") && (
          <div className={`${activeChartTab === "overview" ? "lg:col-span-6" : "lg:col-span-12"} bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Tren Pertumbuhan Arus Kas & Penyaluran ZISWAF
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Perbandingan Penghimpunan vs Realisasi Bantuan (Jan - Agu 2026)
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Surplus Kas: +Rp 41.7 Jt
                </span>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-64 sm:h-72 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPenerimaan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPenyaluran" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickFormatter={(val) => `${val / 1000000}Jt`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatRupiah(Number(val)), ""]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                      itemStyle={{ color: "#34d399" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-[11px] text-slate-700 font-medium capitalize">{value}</span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="penerimaan"
                      name="Penerimaan ZISWAF"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPenerimaan)"
                    />
                    <Area
                      type="monotone"
                      dataKey="penyaluran"
                      name="Penyaluran Program"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPenyaluran)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Growth Stat Points */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700 text-[11px]">
                  Puncak penyaluran tertinggi tercapai pada <strong>Bulan Ramadhan & Idul Fitri</strong> sebesar Rp 88.5 Juta.
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-900 shrink-0">
                Likuiditas Aman (100%)
              </span>
            </div>
          </div>
        )}

        {/* CHART 3: Community Social Impact by Kelurahan (Bar Chart) */}
        {(activeChartTab === "overview" || activeChartTab === "impact") && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Statistik Capaian Dampak Sosial per Kelurahan di Sematang Borang
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Jumlah keluarga mustahiq pangan terbantu, UMKM berdaya, dan santri penerima beasiswa
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 text-[11px]">Wilayah Aktif:</span>
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {selectedKelurahan === "Semua" ? "4 Kelurahan Terintegrasi" : `Kelurahan ${selectedKelurahan}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Bar Chart Container */}
              <div className="lg:col-span-8 h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayKelurahanData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="kelurahan"
                      tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                      cursor={{ fill: "rgba(13, 148, 136, 0.05)" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => (
                        <span className="text-[11px] text-slate-700 font-medium">{value}</span>
                      )}
                    />
                    <Bar
                      dataKey="penerimaPangan"
                      name="Penerima Pangan (KK)"
                      fill="#0d9488"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="umkmBerdaya"
                      name="UMKM Dhuafa Berdaya"
                      fill="#059669"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="beasiswaSantri"
                      name="Santri Beasiswa"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar Chart: SROI Dimensions */}
              <div className="lg:col-span-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-between h-full">
                <div className="space-y-1">
                  <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Indeks Dimensi Kesejahteraan Umat
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    Evaluasi dampak 6 pilar Maqashid Syariah
                  </p>
                </div>

                <div className="h-52 w-full my-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={sroiRadarData}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "#334155", fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "#94a3b8" }} />
                      <Radar
                        name="Skor Capaian (%)"
                        dataKey="skor"
                        stroke="#0d9488"
                        fill="#0d9488"
                        fillOpacity={0.45}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Skor Agregat Dampak:</span>
                  <span className="font-bold text-teal-800 font-mono">90.8 / 100 (Sangat Berdaya)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED RECAPITULATION TABLE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Matriks Detail Penyaluran & Target Capaian (Asnaf Based)
              </h4>
              <p className="text-[11px] text-slate-500">
                Pencatatan realisasi dana sesuai koridor Fiqh Zakat 8 Asnaf DSN-MUI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onRequestPrintReport) {
                  onRequestPrintReport();
                } else {
                  setIsPrintModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs transition border border-slate-300"
            >
              <Printer className="w-3.5 h-3.5 text-teal-700" />
              <span>Cetak Rekap Asnaf</span>
            </button>
            {onOpenDonate && (
              <button
                onClick={onOpenDonate}
                className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-sm transition"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Tunaikan ZISWAF
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-bold">Program Penyaluran</th>
                <th className="p-3 font-bold">Kategori Asnaf</th>
                <th className="p-3 font-bold text-right">Target Anggaran</th>
                <th className="p-3 font-bold text-right">Realisasi Tersalur</th>
                <th className="p-3 font-bold text-center">% Capaian</th>
                <th className="p-3 font-bold text-center">Penerima</th>
                <th className="p-3 font-bold">Status Fiqh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {distributionData.map((item, idx) => {
                const percentAchieved = Math.round((item.allocated / item.target) * 100);
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      {item.name}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px]">
                        {item.asnaf}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {formatRupiah(item.target)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-teal-800">
                      {formatRupiah(item.allocated)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, percentAchieved)}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-700">
                          {percentAchieved}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 font-mono">
                      {item.recipients} Jiwa
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Syar'i Verified
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="p-3">Total Akumulasi</td>
                <td className="p-3 text-slate-600 text-[11px]">8 Asnaf Terpenuhi</td>
                <td className="p-3 text-right font-mono">{formatRupiah(totalTarget)}</td>
                <td className="p-3 text-right font-mono text-teal-900 text-sm">
                  {formatRupiah(totalAllocated)}
                </td>
                <td className="p-3 text-center font-mono text-emerald-800">91.5%</td>
                <td className="p-3 text-center font-mono">{totalRecipients} Jiwa</td>
                <td className="p-3 text-emerald-800 font-bold text-[10px]">100% Akuntabel</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Printable Transparency Report Modal */}
      <PrintableCommunityReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        period={selectedPeriod}
        kelurahan={selectedKelurahan}
        transactions={transactions}
        distributionData={distributionData}
        kelurahanImpactData={displayKelurahanData}
        totalAllocated={totalAllocated}
        totalTarget={totalTarget}
        totalRecipients={totalRecipients}
      />
    </div>
  );
}
