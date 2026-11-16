import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CheckCircle2,
  Coins,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { ZakatMaalHistoryEntry } from "../types";

interface ZakatContributionSummaryChartProps {
  zakatHistory: ZakatMaalHistoryEntry[];
  sessionZakatAddedCount?: number;
}

interface AnnualTrendPoint {
  yearLabel: string;
  gregorianYear: number;
  hijriYear: string;
  paidZakat: number;
  pendingZakat: number;
  totalZakat: number;
  netAssets: number;
  cumulativePaid: number;
  cumulativeObligation: number;
  entryCount: number;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
  payload?: AnnualTrendPoint;
}

const formatRupiah = (value: number) =>
  `Rp ${Math.round(value).toLocaleString("id-ID")}`;

const formatCompactRupiah = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}Rb`;
  return String(Math.round(value));
};

const ASNAF_ALLOCATIONS = [
  {
    key: "fakir_miskin",
    name: "Fakir & Miskin (Lumbung Pangan)",
    share: 0.4,
    color: "#059669",
  },
  {
    key: "umkm_mustahiq",
    name: "Pemberdayaan UMKM Mustahiq",
    share: 0.25,
    color: "#0d9488",
  },
  {
    key: "fisabilillah",
    name: "Fisabilillah (Beasiswa Santri)",
    share: 0.18,
    color: "#2563eb",
  },
  {
    key: "gharimin_ibnu_sabil",
    name: "Gharimin & Ibnu Sabil (Medis)",
    share: 0.1,
    color: "#f59e0b",
  },
  {
    key: "amil_syariah",
    name: "Hak Amil Syariah (Audit DKM)",
    share: 0.07,
    color: "#6366f1",
  },
];

function AnnualTrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-slate-950/95 text-white border border-teal-500/40 rounded-xl p-3 shadow-xl text-xs space-y-2 min-w-[230px]">
      <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-3">
        <span className="font-bold text-teal-300">Tahun {row.yearLabel}</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-200 border border-teal-700/50">
          {row.hijriYear}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-300">Sudah Ditunaikan:</span>
          <span className="font-mono font-bold">{formatRupiah(row.paidZakat)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-amber-300">Belum Ditunaikan:</span>
          <span className="font-mono font-bold">{formatRupiah(row.pendingZakat)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-1">
          <span className="text-slate-300">Total Kewajiban Tahun Ini:</span>
          <span className="font-mono font-black text-white">
            {formatRupiah(row.totalZakat)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-cyan-300">Akumulasi Tunaikan:</span>
          <span className="font-mono font-bold text-cyan-200">
            {formatRupiah(row.cumulativePaid)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-indigo-300">Total Akumulasi Kewajiban:</span>
          <span className="font-mono font-bold text-indigo-200">
            {formatRupiah(row.cumulativeObligation)}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
        Harta Bersih Tercatat: <span className="font-mono text-slate-200">{formatRupiah(row.netAssets)}</span>
      </div>
    </div>
  );
}

function BreakdownPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { name: string; value: number; pct: number; color: string };
  }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-slate-950/95 text-white border border-emerald-500/40 rounded-xl px-3 py-2 shadow-xl text-xs space-y-1">
      <div className="font-bold text-emerald-300">{item.name}</div>
      <div className="font-mono font-black text-white">
        {formatRupiah(item.value)}{" "}
        <span className="text-slate-400 font-normal">({item.pct.toFixed(1)}%)</span>
      </div>
    </div>
  );
}

export default function ZakatContributionSummaryChart({
  zakatHistory,
  sessionZakatAddedCount = 0,
}: ZakatContributionSummaryChartProps) {
  const [trendMode, setTrendMode] = useState<"combined" | "net_assets">("combined");
  const [distributionView, setDistributionView] = useState<"asnaf" | "assets">("asnaf");

  const {
    annualTrendData,
    totalPaidAllTime,
    totalObligationAllTime,
    fulfillmentRatePct,
    yoyGrowthPct,
    asnafDistributionData,
    latestAssetCompositionData,
    distributionBaseAmount,
    latestYearEntry,
  } = useMemo(() => {
    const yearMap = new Map<
      number,
      {
        gregorianYear: number;
        hijriYear: string;
        paidZakat: number;
        pendingZakat: number;
        totalZakat: number;
        netAssets: number;
        entryCount: number;
      }
    >();

    // Sort oldest -> newest so cumulative trend builds accurately over time
    const sortedEntries = [...zakatHistory].sort((a, b) => {
      if (a.gregorianYear !== b.gregorianYear) {
        return a.gregorianYear - b.gregorianYear;
      }
      return new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime();
    });

    for (const entry of sortedEntries) {
      const existing = yearMap.get(entry.gregorianYear) || {
        gregorianYear: entry.gregorianYear,
        hijriYear: entry.hijriYear,
        paidZakat: 0,
        pendingZakat: 0,
        totalZakat: 0,
        netAssets: 0,
        entryCount: 0,
      };

      const obligatoryAmt = entry.isObligatory ? entry.zakatAmount : 0;
      if (entry.status === "SUDAH_TUNAI") {
        existing.paidZakat += obligatoryAmt;
      } else if (entry.status === "BELUM_TUNAI") {
        existing.pendingZakat += obligatoryAmt;
      }
      existing.totalZakat += obligatoryAmt;
      existing.netAssets = Math.max(existing.netAssets, entry.netAssets);
      existing.hijriYear = entry.hijriYear || existing.hijriYear;
      existing.entryCount += 1;

      yearMap.set(entry.gregorianYear, existing);
    }

    let runningPaid = 0;
    let runningObligation = 0;

    const trend: AnnualTrendPoint[] = Array.from(yearMap.values())
      .sort((a, b) => a.gregorianYear - b.gregorianYear)
      .map((yr) => {
        runningPaid += yr.paidZakat;
        runningObligation += yr.totalZakat;
        return {
          yearLabel: String(yr.gregorianYear),
          gregorianYear: yr.gregorianYear,
          hijriYear: yr.hijriYear,
          paidZakat: yr.paidZakat,
          pendingZakat: yr.pendingZakat,
          totalZakat: yr.totalZakat,
          netAssets: yr.netAssets,
          cumulativePaid: runningPaid,
          cumulativeObligation: runningObligation,
          entryCount: yr.entryCount,
        };
      });

    const totalPaid = runningPaid;
    const totalObligation = runningObligation;
    const fulfillmentPct =
      totalObligation > 0 ? Math.round((totalPaid / totalObligation) * 100) : 0;

    let growthPct = 0;
    if (trend.length >= 2) {
      const prev = trend[trend.length - 2].totalZakat;
      const curr = trend[trend.length - 1].totalZakat;
      if (prev > 0) {
        growthPct = Math.round(((curr - prev) / prev) * 1000) / 10;
      }
    }

    // Distribution chart uses paid Zakat Maal if any exists, otherwise total obligation projection
    const baseDistAmount = totalPaid > 0 ? totalPaid : totalObligation;
    const asnafData = ASNAF_ALLOCATIONS.map((item) => ({
      name: item.name,
      value: Math.round(baseDistAmount * item.share),
      pct: item.share * 100,
      color: item.color,
    }));

    const latest = sortedEntries[sortedEntries.length - 1] || null;
    const latestGrossSum = latest
      ? latest.cashSavings +
        latest.goldAssets +
        latest.investments +
        latest.businessAssets
      : 0;

    const assetData = latest
      ? [
          {
            name: "Kas & Tabungan",
            value: latest.cashSavings,
            pct: latestGrossSum > 0 ? (latest.cashSavings / latestGrossSum) * 100 : 0,
            color: "#059669",
          },
          {
            name: "Emas & Logam Mulia",
            value: latest.goldAssets,
            pct: latestGrossSum > 0 ? (latest.goldAssets / latestGrossSum) * 100 : 0,
            color: "#f59e0b",
          },
          {
            name: "Investasi & Saham Halal",
            value: latest.investments,
            pct: latestGrossSum > 0 ? (latest.investments / latestGrossSum) * 100 : 0,
            color: "#0ea5e9",
          },
          {
            name: "Aset Usaha & Piutang",
            value: latest.businessAssets,
            pct: latestGrossSum > 0 ? (latest.businessAssets / latestGrossSum) * 100 : 0,
            color: "#6366f1",
          },
        ].filter((a) => a.value > 0)
      : [];

    return {
      annualTrendData: trend,
      totalPaidAllTime: totalPaid,
      totalObligationAllTime: totalObligation,
      fulfillmentRatePct: fulfillmentPct,
      yoyGrowthPct: growthPct,
      asnafDistributionData: asnafData,
      latestAssetCompositionData: assetData,
      distributionBaseAmount: baseDistAmount,
      latestYearEntry: latest,
    };
  }, [zakatHistory]);

  const activePieData =
    distributionView === "asnaf"
      ? asnafDistributionData
      : latestAssetCompositionData;

  return (
    <div
      id="zakat-maal-summary-chart-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-sm shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Grafik Tren Kontribusi &amp; Distribusi Zakat Maal Tahunan
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                Recharts Analytics
              </span>
              {sessionZakatAddedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  +{sessionZakatAddedCount} Pelunasan Sesi Ini
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi historis kewajiban vs pelunasan Zakat Maal per tahun, akumulasi kontribusi lintas haul, dan proyeksi penyaluran ke 8 Asnaf Mustahiq.
            </p>
          </div>
        </div>

        {/* Summary Metric Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-emerald-700 font-medium">Akumulasi Tunaikan: </span>
            <span className="font-mono font-black text-emerald-900">
              {formatRupiah(totalPaidAllTime)}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
            <span className="text-teal-800 font-semibold">
              Rasio Pelunasan: <strong className="font-mono">{fulfillmentRatePct}%</strong>
            </span>
          </div>
          {annualTrendData.length >= 2 && (
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                yoyGrowthPct >= 0
                  ? "bg-blue-50 border-blue-200 text-blue-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              YoY: {yoyGrowthPct >= 0 ? "+" : ""}
              {yoyGrowthPct}%
            </div>
          )}
        </div>
      </div>

      {annualTrendData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center space-y-2">
          <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-bold text-slate-700">
            Belum ada data riwayat Zakat Maal untuk ditampilkan pada grafik
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hitung kewajiban Anda di Kalkulator Zakat Maal lalu klik &ldquo;Simpan ke Riwayat Tahunan&rdquo; untuk memvisualisasikan tren kontribusi tahunan Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT PANEL: Annual Zakat Maal & Cumulative Contribution Trend (ComposedChart) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  <span>
                    {trendMode === "combined"
                      ? "Tren Tahunan & Akumulasi Kontribusi Zakat Maal"
                      : "Pertumbuhan Harta Bersih vs Kewajiban Zakat Tahunan"}
                  </span>
                </h5>
                <p className="text-[11px] text-slate-500">
                  {trendMode === "combined"
                    ? "Batang: Sudah vs Belum Ditunaikan per tahun • Garis: Akumulasi Total Kontribusi"
                    : "Perbandingan aset bersih kena nisab (Area) dengan kewajiban Zakat 2,5% (Batang)"}
                </p>
              </div>

              <div className="flex bg-white p-0.5 rounded-xl border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTrendMode("combined")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    trendMode === "combined"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Kontribusi &amp; Akumulasi
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMode("net_assets")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    trendMode === "net_assets"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Harta Bersih
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {trendMode === "combined" ? (
                  <ComposedChart
                    data={annualTrendData}
                    margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="yearLabel"
                      tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      tickFormatter={formatCompactRupiah}
                      tick={{ fill: "#475569", fontSize: 11 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      width={56}
                    />
                    <Tooltip content={<AnnualTrendTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    />
                    <Bar
                      dataKey="paidZakat"
                      name="Sudah Ditunaikan"
                      stackId="zakat"
                      fill="#059669"
                      radius={[0, 0, 4, 4]}
                      maxBarSize={46}
                    />
                    <Bar
                      dataKey="pendingZakat"
                      name="Belum Ditunaikan"
                      stackId="zakat"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={46}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativePaid"
                      name="Akumulasi Tunaikan"
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativeObligation"
                      name="Total Akumulasi Kewajiban"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      dot={{ r: 3.5, fill: "#6366f1" }}
                    />
                  </ComposedChart>
                ) : (
                  <ComposedChart
                    data={annualTrendData}
                    margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="netAssetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="yearLabel"
                      tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      tickFormatter={formatCompactRupiah}
                      tick={{ fill: "#475569", fontSize: 11 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      width={58}
                    />
                    <Tooltip content={<AnnualTrendTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="netAssets"
                      name="Harta Bersih (Net Worth)"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fill="url(#netAssetGradient)"
                    />
                    <Bar
                      dataKey="totalZakat"
                      name="Kewajiban Zakat (2,5%)"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={42}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT PANEL: Asnaf Distribution Breakdown / Asset Composition Donut */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <PieChartIcon className="w-4 h-4 text-emerald-600" />
                  <span>
                    {distributionView === "asnaf"
                      ? "Distribusi Zakat per Sektor Asnaf"
                      : `Komposisi Aset (${latestYearEntry?.gregorianYear || "-"})`}
                  </span>
                </h5>
                <p className="text-[11px] text-slate-500">
                  {distributionView === "asnaf"
                    ? totalPaidAllTime > 0
                      ? `Alokasi ${formatRupiah(distributionBaseAmount)} yang telah ditunaikan`
                      : `Proyeksi distribusi dari ${formatRupiah(distributionBaseAmount)}`
                    : "Sebaran portofolio aset harta wajib zakat terbaru"}
                </p>
              </div>

              <div className="flex bg-white p-0.5 rounded-xl border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDistributionView("asnaf")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    distributionView === "asnaf"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  8 Asnaf
                </button>
                <button
                  type="button"
                  onClick={() => setDistributionView("assets")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    distributionView === "assets"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Aset
                </button>
              </div>
            </div>

            {activePieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-500">
                Belum ada rincian nominal untuk ditampilkan.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                <div className="sm:col-span-6 h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={76}
                        paddingAngle={3}
                      >
                        {activePieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<BreakdownPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Compact Breakdown Legend */}
                <div className="sm:col-span-6 space-y-2">
                  {activePieData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span
                          className="text-slate-700 font-medium truncate"
                          title={item.name}
                        >
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900">
                          {formatCompactRupiah(item.value)}
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-mono">
                          {item.pct.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Transparency Note */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sesuai SK BAZNAS &amp; Fatwa MUI</span>
              </span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Total: {formatRupiah(totalObligationAllTime)}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
