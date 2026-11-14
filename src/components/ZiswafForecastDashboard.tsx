import { useState, useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Coins,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  HelpCircle,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Users,
  Target,
  Building2,
  Share2,
  Check,
} from "lucide-react";
import { ZiswafhForecastResult, ZiswafTransaction } from "../types";

interface ZiswafForecastDashboardProps {
  transactions?: ZiswafTransaction[];
  onNavigateToDonation?: () => void;
}

export default function ZiswafForecastDashboard({
  onNavigateToDonation,
}: ZiswafForecastDashboardProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q4 2026 (Oktober - Desember)");
  const [targetGrowth, setTargetGrowth] = useState<number>(18.5);
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Semua (Kec. Sematang Borang)");
  const [activeTab, setActiveTab] = useState<"timeseries" | "categories" | "scenarios" | "impact_budget" | "action_plan">("timeseries");
  const [chartType, setChartType] = useState<"composite" | "stacked">("composite");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Default forecast state based on model schema
  const [forecastData, setForecastData] = useState<ZiswafhForecastResult>({
    forecastPeriod: "Q4 2026 (Oktober - Desember)",
    forecastSummary:
      "Model Prediktif AI ABDI Islamicity memproyeksikan pertumbuhan total penghimpunan dana ZISWAFH pada Q4 2026 sebesar +18.5% (mencapai Rp 109.6 Juta). Akselerasi didorong oleh momentum Maulid Nabi 1448H, ekspansi kanal QRIS Digital di 24 masjid, dan siklus tutup buku usaha halal UMKM binaan di 4 kelurahan Sematang Borang.",
    projectedTotalFunds: 109600000,
    currentBaselineFunds: 92500000,
    predictedGrowthRate: 18.5,
    confidenceLevel: 93.4,
    historicalTrendInsight:
      "Analisis time-series menunjukkan tren pertumbuhan organik non-musiman rata-rata 8.2% MoM pasca Ramadhan, dengan lonjakan spesifik pada momentum kalender Hijriyah dan akhir bulan gajian jamaah.",
    monthlyProjections: [
      {
        month: "Oktober 2026",
        projectedInflow: 34500000,
        projectedZakat: 18500000,
        projectedInfaq: 8200000,
        projectedShodaqoh: 3800000,
        projectedWakaf: 2800000,
        projectedHibah: 1200000,
        keyDrivers: "Momentum Maulid Nabi & peluncuran program Beasiswa Santri Semester Genap",
        seasonalEvent: "Maulid Nabi 1448 H & Gerakan Sedekah Berjamaah",
      },
      {
        month: "November 2026",
        projectedInflow: 36200000,
        projectedZakat: 19800000,
        projectedInfaq: 8600000,
        projectedShodaqoh: 4100000,
        projectedWakaf: 2500000,
        projectedHibah: 1200000,
        keyDrivers: "Aktivasi infaq payroll otomatis jamaah ASN/BUMD & penyaluran modal bergulir UMKM",
        seasonalEvent: "Pekan Penguatan UMKM Berkah Halal",
      },
      {
        month: "Desember 2026",
        projectedInflow: 38900000,
        projectedZakat: 21500000,
        projectedInfaq: 9200000,
        projectedShodaqoh: 4500000,
        projectedWakaf: 2400000,
        projectedHibah: 1300000,
        keyDrivers: "Tutup buku tahunan muzakki korporat/pengusaha lokal & zakat perniagaan",
        seasonalEvent: "Zakat Akhir Tahun & Evaluasi Maqashid Syariah",
      },
    ],
    categoryForecasts: [
      {
        category: "Zakat (Maal & Profesi)",
        baseline: 48500000,
        projected: 59800000,
        growthPercent: 23.3,
        seasonalMultiplier: 1.25,
        growthDriver: "Kepatuhan zakat penghasilan rutin via integrasi payroll masjid & zakat perniagaan UMKM",
        riskFactor: "Fluktuasi cashflow perdagangan komoditas pasar tradisional",
      },
      {
        category: "Infaq Operasional",
        baseline: 21200000,
        projected: 26000000,
        growthPercent: 22.6,
        seasonalMultiplier: 1.18,
        growthDriver: "Digitalisasi kotak infaq berbasis QRIS Dinamis & Subuh Berjamaah gabungan",
        riskFactor: "Tingkat kehadiran jamaah saat musim penghujan",
      },
      {
        category: "Shodaqoh Terikat",
        baseline: 9800000,
        projected: 12400000,
        growthPercent: 26.5,
        seasonalMultiplier: 1.3,
        growthDriver: "Kampanye spesifik Paket Sembako Dhuafa & Tanggap Banjir Dataran Rendah",
        riskFactor: "Kompetisi program donasi eksternal",
      },
      {
        category: "Wakaf Uang & Produktif",
        baseline: 8500000,
        projected: 7700000,
        growthPercent: 9.4,
        seasonalMultiplier: 1.08,
        growthDriver: "Sertifikat Wakaf Tunai Pembebasan Lahan Balai Latihan Santri",
        riskFactor: "Edukasi literasi wakaf produktif yang perlu terus diperkuat",
      },
      {
        category: "Hibah & Dana Kebajikan",
        baseline: 4500000,
        projected: 3700000,
        growthPercent: 12.1,
        seasonalMultiplier: 1.1,
        growthDriver: "Dana ta'widh non-halal cleansing dari mitra perbankan syariah",
        riskFactor: "Sifat penghimpunan insidentil",
      },
    ],
    scenarios: {
      conservative: {
        projectedTotal: 96500000,
        growthRate: 11.2,
        keyAssumption: "Kondisi ekonomi flat, pertumbuhan hanya berasal dari donatur terdaftar tanpa kampanye agresif.",
      },
      moderate: {
        projectedTotal: 109600000,
        growthRate: 18.5,
        keyAssumption: "Implementasi penuh rekomendasi amil: QRIS di 24 masjid, reminder zakat profesi, dan roadshow kajian.",
      },
      optimistic: {
        projectedTotal: 124200000,
        growthRate: 26.8,
        keyAssumption: "Kemitraan strategis dengan 10 muzakki korporat baru dan lonjakan zakat saham akhir tahun.",
      },
    },
    recommendedProgramAllocations: [
      {
        id: "prog-1",
        programName: "Lumbung Pangan & Ketahanan Mustahiq",
        targetAsnaf: "Fakir & Miskin",
        suggestedBudget: 38500000,
        suggestedPercentage: 35.1,
        targetBeneficiaries: 380,
        expectedMultiplierSROI: "1 : 2.9x",
        priority: "CRITICAL",
        rationale: "Menghadapi potensi inflasi pangan akhir tahun, alokasi beras dan sembako bergizi perlu ditingkatkan di Sukamulya & Srimulya.",
      },
      {
        id: "prog-2",
        programName: "Modal Usaha Bergulir UMKM Berkah (Qardhul Hasan)",
        targetAsnaf: "Gharimin / Mustahiq Produktif",
        suggestedBudget: 31000000,
        suggestedPercentage: 28.3,
        targetBeneficiaries: 55,
        expectedMultiplierSROI: "1 : 4.4x",
        priority: "CRITICAL",
        rationale: "Pemberdayaan 55 pelaku usaha mikro jamaah agar bertransformasi dari mustahiq menjadi muzakki (Mustahiq to Muzakki).",
      },
      {
        id: "prog-3",
        programName: "Beasiswa Santri & Tahfidz Berkelanjutan",
        targetAsnaf: "Fisabilillah",
        suggestedBudget: 19500000,
        suggestedPercentage: 17.8,
        targetBeneficiaries: 140,
        expectedMultiplierSROI: "1 : 3.6x",
        priority: "HIGH",
        rationale: "Pembiayaan SPP, kitab, dan uang saku santri dhuafa berprestasi untuk semester baru.",
      },
      {
        id: "prog-4",
        programName: "Layanan Kesehatan & Tanggap Darurat Dhuafa",
        targetAsnaf: "Ibnu Sabil & Miskin",
        suggestedBudget: 11800000,
        suggestedPercentage: 10.8,
        targetBeneficiaries: 110,
        expectedMultiplierSROI: "1 : 2.5x",
        priority: "HIGH",
        rationale: "Ambulans gratis, bantuan tebus resep obat, dan santunan pasien kritis pra-sejahtera.",
      },
      {
        id: "prog-5",
        programName: "Optimalisasi Dakwah & Fasilitas Masjid Terpadu",
        targetAsnaf: "Fisabilillah & Amil",
        suggestedBudget: 8800000,
        suggestedPercentage: 8.0,
        targetBeneficiaries: 95,
        expectedMultiplierSROI: "1 : 2.1x",
        priority: "MEDIUM",
        rationale: "Peralatan audio digital, sanitasi ramah lansia/disabilitas, dan operasional amil bersertifikasi.",
      },
    ],
    strategicRecommendations: [
      "Bentuk Satgas 'Amil Jemput Zakat' khusus akhir tahun untuk menyambangi muzakki korporat dan pelaku bisnis pasar di Sematang Borang.",
      "Otomatisasi pengiriman notifikasi pengingat hisab nishab zakat maal via WhatsApp bot kepada para muzakki tetap.",
      "Segera lakukan pre-ordering gabah/beras dari petani lokal untuk mengunci harga lumbung pangan sebelum kenaikan akhir tahun.",
      "Publikasikan proyeksi ini pada Rapat Kerja Pengurus DKM se-Kecamatan Sematang Borang untuk penyelarasan target dakwah.",
    ],
    calendarSeasonalFactors: [
      {
        event: "Maulid Nabi 1448 H (Oktober)",
        expectedSpike: "+28% Infaq & Shodaqoh",
        recommendedAmilAction: "Siapkan kampanye santunan 100 yatim & tablig akbar gabungan.",
      },
      {
        event: "Siklus Gajian Akhir Bulan (Okt, Nov, Des)",
        expectedSpike: "+45% Zakat Profesi",
        recommendedAmilAction: "Kirim blast laporan transparansi 3 hari sebelum tanggal gajian (T-3).",
      },
      {
        event: "Tutup Buku Finansial (Desember)",
        expectedSpike: "+60% Zakat Maal Perniagaan",
        recommendedAmilAction: "Buka layanan konsultasi hisab zakat perniagaan dan audit syariah gratis untuk UMKM.",
      },
    ],
  });

  // Local interactive budget allocation simulation state
  const [simulatedAllocations, setSimulatedAllocations] = useState<{ [key: string]: number }>({
    "prog-1": 35.1,
    "prog-2": 28.3,
    "prog-3": 17.8,
    "prog-4": 10.8,
    "prog-5": 8.0,
  });

  // Unique IDs for SVG gradients
  const areaHistoricalGradId = useId();
  const areaForecastGradId = useId();

  // Historical + Forecast Combined Time Series Data for Recharts
  const combinedTimelineData = [
    { period: "Jan 2026", actual: 10.2, forecast: null, upper: null, lower: null, type: "Historis", note: "Awal Tahun" },
    { period: "Feb 2026", actual: 11.5, forecast: null, upper: null, lower: null, type: "Historis", note: "Rutin" },
    { period: "Mar 2026", actual: 24.8, forecast: null, upper: null, lower: null, type: "Historis", note: "Ramadhan 1447H" },
    { period: "Apr 2026", actual: 21.5, forecast: null, upper: null, lower: null, type: "Historis", note: "Idul Fitri" },
    { period: "Mei 2026", actual: 12.0, forecast: null, upper: null, lower: null, type: "Historis", note: "Normal" },
    { period: "Jun 2026", actual: 18.5, forecast: null, upper: null, lower: null, type: "Historis", note: "Idul Adha & Qurban" },
    { period: "Jul 2026", actual: 14.2, forecast: null, upper: null, lower: null, type: "Historis", note: "Muharram 1448H" },
    { period: "Agu 2026", actual: 13.8, forecast: 13.8, upper: 13.8, lower: 13.8, type: "Aktual Terkini", note: "Baseline Aktual" },
    { period: "Sep 2026 (Est)", actual: null, forecast: 14.5, upper: 15.6, lower: 13.4, type: "Transisi Q3", note: "Transisi" },
    { period: "Okt 2026", actual: null, forecast: (forecastData.monthlyProjections[0]?.projectedInflow || 34500000) / 1000000, upper: ((forecastData.monthlyProjections[0]?.projectedInflow || 34500000) * 1.08) / 1000000, lower: ((forecastData.monthlyProjections[0]?.projectedInflow || 34500000) * 0.92) / 1000000, type: "Proyeksi AI", note: "Maulid Nabi" },
    { period: "Nov 2026", actual: null, forecast: (forecastData.monthlyProjections[1]?.projectedInflow || 36200000) / 1000000, upper: ((forecastData.monthlyProjections[1]?.projectedInflow || 36200000) * 1.1) / 1000000, lower: ((forecastData.monthlyProjections[1]?.projectedInflow || 36200000) * 0.9) / 1000000, type: "Proyeksi AI", note: "Pekan UMKM" },
    { period: "Des 2026", actual: null, forecast: (forecastData.monthlyProjections[2]?.projectedInflow || 38900000) / 1000000, upper: ((forecastData.monthlyProjections[2]?.projectedInflow || 38900000) * 1.12) / 1000000, lower: ((forecastData.monthlyProjections[2]?.projectedInflow || 38900000) * 0.88) / 1000000, type: "Proyeksi AI", note: "Tutup Buku" },
  ];

  // Monthly Stacked Composition Data
  const monthlyCompositionData = forecastData.monthlyProjections.map((m) => ({
    month: m.month,
    Zakat: m.projectedZakat / 1000000,
    Infaq: m.projectedInfaq / 1000000,
    Shodaqoh: m.projectedShodaqoh / 1000000,
    Wakaf: m.projectedWakaf / 1000000,
    Hibah: m.projectedHibah / 1000000,
    Total: m.projectedInflow / 1000000,
  }));

  // Radar Data Comparison (Baseline vs Projected)
  const radarCategoryData = forecastData.categoryForecasts.map((c) => ({
    subject: c.category.replace(" (Maal & Profesi)", "").replace(" & Dana Kebajikan", "").replace(" & Produktif", ""),
    Baseline: Math.round(c.baseline / 1000000),
    Proyeksi: Math.round(c.projected / 1000000),
    fullMark: 70,
  }));

  // Trigger Predictive AI Generation via Server Endpoint
  const handleRunForecast = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/ziswaf-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upcomingQuarter: selectedQuarter,
          targetGrowthRate: targetGrowth,
          kelurahanScope: selectedKelurahan,
          currentBaselineFunds: 92500000,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: ZiswafhForecastResult = await res.json();
      if (data && data.projectedTotalFunds) {
        setForecastData(data);
        // Sync simulation allocations
        const newSims: { [key: string]: number } = {};
        data.recommendedProgramAllocations?.forEach((p) => {
          newSims[p.id] = p.suggestedPercentage;
        });
        setSimulatedAllocations(newSims);
      }
    } catch (err) {
      console.error("Error executing predictive AI forecast:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Adjust simulation percentage
  const handleSliderChange = (id: string, value: number) => {
    setSimulatedAllocations((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Calculate live simulated budget from total projected
  const totalSimulatedPercentage: number = (Object.values(simulatedAllocations) as number[]).reduce((a: number, b: number) => a + b, 0);

  const handleApplyScenario = (scenarioKey: "conservative" | "moderate" | "optimistic") => {
    const sc = forecastData.scenarios[scenarioKey];
    if (!sc) return;
    setTargetGrowth(sc.growthRate);
    setForecastData((prev) => ({
      ...prev,
      projectedTotalFunds: sc.projectedTotal,
      predictedGrowthRate: sc.growthRate,
    }));
    setActiveTab("impact_budget");
  };

  const handleSaveToRkt = () => {
    setSaveSuccessMsg("Rencana Alokasi Program Berhasil Disimpan ke RKT DKM 2026/2027!");
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleCopySummary = () => {
    const summaryText = `[PROYEKSI PREDIKTIF AI ZISWAFH - ${forecastData.forecastPeriod}]
Platform: abdi.sematangborangcity.cloud
Total Dana Terproyeksi: Rp ${(forecastData.projectedTotalFunds / 1000000).toFixed(1)} Juta (+${forecastData.predictedGrowthRate}%)
Confidence Level: ${forecastData.confidenceLevel}%

Ringkasan:
${forecastData.forecastSummary}

Alokasi Program Direkomendasikan:
${forecastData.recommendedProgramAllocations
  .map(
    (p, i) =>
      `${i + 1}. ${p.programName} (${p.suggestedPercentage}% - Rp ${(
        p.suggestedBudget / 1000000
      ).toFixed(1)} Juta) -> Target: ${p.targetBeneficiaries} Mustahiq (SROI: ${p.expectedMultiplierSROI})`
  )
  .join("\n")}

Disahkan untuk Pengurus DKM & Badan Amil ZISWAF Kecamatan Sematang Borang.`;

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div id="ziswaf-forecast-dashboard" className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 rounded-3xl text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Gemini 3.7 Flash Predictive Intelligence
              </span>
              <span className="bg-teal-900/60 text-teal-200 text-xs px-2.5 py-1 rounded-full border border-teal-700/50">
                Akad & Maqashid Syariah Verified
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-forecast-summary"
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-teal-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-teal-700/40 transition shadow-2xs"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{isCopied ? "Tersalin!" : "Salin Ringkasan"}</span>
              </button>

              <button
                id="btn-save-rkt-action"
                onClick={handleSaveToRkt}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Simpan ke RKT DKM</span>
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-400" />
              Peramalan AI Pertumbuhan Dana ZISWAFH Kuartal Mendatang
            </h2>
            <p className="text-sm text-teal-100/85 leading-relaxed">
              Model analisis time-series prediktif yang mengombinasikan tren historis, momentum kalender Hijriyah (Maulid Nabi & tutup buku zakat), serta ekosistem QRIS masjid untuk memetakan alokasi program dampak umat berkeadilan.
            </p>
          </div>

          {/* Interactive Control Filter Toolbar */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-teal-800/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            {/* Quarter Selector */}
            <div className="space-y-1">
              <label htmlFor="forecast-quarter-select" className="text-[11px] font-semibold text-teal-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-teal-400" />
                Kuartal Target Peramalan
              </label>
              <select
                id="forecast-quarter-select"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="w-full bg-slate-900 border border-teal-700/60 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-400 outline-hidden font-medium"
              >
                <option value="Q4 2026 (Oktober - Desember)">Q4 2026 (Okt - Des 2026)</option>
                <option value="Q1 2027 (Januari - Maret)">Q1 2027 (Jan - Mar 2027 - Pra Ramadhan)</option>
                <option value="Q2 2027 (April - Juni)">Q2 2027 (Apr - Jun 2027 - Idul Fitri & Qurban)</option>
                <option value="Semester II 2026 (Proyeksi 6 Bulan)">Semester II 2026 (Juli - Des)</option>
              </select>
            </div>

            {/* Target Growth Selector */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold text-teal-300">
                <span>Target Pertumbuhan:</span>
                <span className="font-mono text-emerald-400 font-bold">+{targetGrowth}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="target-growth-slider"
                  type="range"
                  min={5}
                  max={40}
                  step={0.5}
                  value={targetGrowth}
                  onChange={(e) => setTargetGrowth(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Kelurahan Scope */}
            <div className="space-y-1">
              <label htmlFor="forecast-kelurahan-scope" className="text-[11px] font-semibold text-teal-300 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-teal-400" />
                Cakupan Wilayah Masjid
              </label>
              <select
                id="forecast-kelurahan-scope"
                value={selectedKelurahan}
                onChange={(e) => setSelectedKelurahan(e.target.value)}
                className="w-full bg-slate-900 border border-teal-700/60 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-400 outline-hidden font-medium"
              >
                <option value="Semua (Kec. Sematang Borang)">Semua (Kec. Sematang Borang)</option>
                <option value="Kelurahan Sukamulya">Kelurahan Sukamulya</option>
                <option value="Kelurahan Lebung Gajah">Kelurahan Lebung Gajah</option>
                <option value="Kelurahan Karya Mulya">Kelurahan Karya Mulya</option>
                <option value="Kelurahan Srimulya">Kelurahan Srimulya</option>
              </select>
            </div>

            {/* Run Forecast Button */}
            <div className="pt-2 sm:pt-4">
              <button
                id="btn-run-predictive-forecast"
                onClick={handleRunForecast}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>{isLoading ? "Menghitung Prediksi AI..." : "Simulasi Ulang AI"}</span>
              </button>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="bg-emerald-900/90 border border-emerald-400 text-emerald-100 text-xs px-4 py-2 rounded-xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top 4 KPI Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Projected Funds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group hover:border-teal-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Total Proyeksi Penghimpunan</span>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              +{forecastData.predictedGrowthRate}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            Rp {(forecastData.projectedTotalFunds / 1000000).toFixed(1)} Jt
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Baseline Q3: Rp {(forecastData.currentBaselineFunds / 1000000).toFixed(1)} Jt</span>
            <span className="font-semibold text-teal-700">CI {forecastData.confidenceLevel}%</span>
          </div>
        </div>

        {/* Metric 2: Estimated Beneficiaries Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group hover:border-teal-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Kapasitas Mustahiq Terbantu</span>
            <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Users className="w-3 h-3 text-teal-700" />
              8 Asnaf
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-800 font-mono tracking-tight">
            865 Jiwa
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>+11.8% dari Kuartal Lalu</span>
            <span className="font-semibold text-emerald-700">4 Kelurahan</span>
          </div>
        </div>

        {/* Metric 3: Multiplier Social Return (SROI) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group hover:border-teal-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Estimasi Efek Multiplier (SROI)</span>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Target className="w-3 h-3 text-blue-700" />
              Berkah
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 font-mono tracking-tight">
            1 : 3.8x
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>1 Rupiah Menghasilkan Rp 3.8 Nilai Sosial</span>
          </div>
        </div>

        {/* Metric 4: Sharia Compliance & Amil Governance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group hover:border-teal-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Indeks Kesiapan Amil DKM</span>
            <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 text-amber-700" />
              Syar'i
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800 font-mono tracking-tight">
            96.5 / 100
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Audit Otomatis DSN-MUI</span>
            <span className="font-semibold text-slate-700">Rasio Amil 7.8%</span>
          </div>
        </div>
      </div>

      {/* AI Narrative Analysis Insight Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start shadow-2xs">
        <div className="p-3 bg-emerald-600 text-white rounded-xl shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              Sintesis Strategis AI: Peluang & Rekomendasi Alokasi {forecastData.forecastPeriod}
            </h4>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
              Tingkat Akurasi Model: {forecastData.confidenceLevel}%
            </span>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            {forecastData.forecastSummary}
          </p>
          <div className="text-[11px] text-emerald-800/90 font-medium pt-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{forecastData.historicalTrendInsight}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for In-Depth Analytics */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          id="forecast-tab-timeseries"
          onClick={() => setActiveTab("timeseries")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "timeseries"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
          <span>Tren & Proyeksi Bulanan</span>
        </button>

        <button
          id="forecast-tab-categories"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "categories"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>Analisis 5 Kategori ZISWAFH</span>
        </button>

        <button
          id="forecast-tab-scenarios"
          onClick={() => setActiveTab("scenarios")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "scenarios"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
          <span>3 Skenario Prediktif (Konservatif/Moderat/Optimis)</span>
        </button>

        <button
          id="forecast-tab-impact-budget"
          onClick={() => setActiveTab("impact_budget")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "impact_budget"
              ? "bg-teal-700 text-white shadow-sm font-black"
              : "bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-teal-300" />
          <span>Simulasi Alokasi Program DKM</span>
        </button>

        <button
          id="forecast-tab-action-plan"
          onClick={() => setActiveTab("action_plan")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === "action_plan"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Rencana Aksi Amil & Takmir</span>
        </button>
      </div>

      {/* TAB 1: TIME SERIES & MONTHLY FORECAST CHART */}
      {activeTab === "timeseries" && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Visualisasi Time-Series Historis (Jan - Agu 2026) & Proyeksi AI (Okt - Des 2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Satuan dalam Juta Rupiah (IDR). Menampilkan koridor estimasi atas (Upper Band) dan bawah (Lower Band).
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setChartType("composite")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    chartType === "composite"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Kurva Tren Kontinu
                </button>
                <button
                  onClick={() => setChartType("stacked")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    chartType === "stacked"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Komposisi Kategori
                </button>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full pt-2">
              {chartType === "composite" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedTimelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={areaHistoricalGradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id={areaForecastGradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `Rp ${val}Jt`} />
                    <Tooltip
                      formatter={(val: any, name: string) => [
                        val ? `Rp ${Number(val).toFixed(1)} Juta` : "-",
                        name === "actual" ? "Realisasi Aktual" : name === "forecast" ? "Proyeksi AI" : name === "upper" ? "Batas Atas (Optimis)" : "Batas Bawah (Konservatif)",
                      ]}
                      labelFormatter={(label) => `Periode: ${label}`}
                      contentStyle={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "12px", border: "1px solid #334155" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      name="Realisasi Aktual (Jan-Agu 2026)"
                      stroke="#0d9488"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={`url(#${areaHistoricalGradId})`}
                    />
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      name="Proyeksi Prediktif AI (Okt-Des 2026)"
                      stroke="#059669"
                      strokeWidth={3}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill={`url(#${areaForecastGradId})`}
                    />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      name="Batas Atas (Optimis)"
                      stroke="#10b981"
                      strokeWidth={1}
                      fill="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      name="Batas Bawah (Konservatif)"
                      stroke="#64748b"
                      strokeWidth={1}
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCompositionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `Rp ${val}Jt`} />
                    <Tooltip
                      formatter={(val: any, name: string) => [`Rp ${Number(val).toFixed(1)} Juta`, name]}
                      contentStyle={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "12px", border: "1px solid #334155" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="Zakat" stackId="a" fill="#0d9488" />
                    <Bar dataKey="Infaq" stackId="a" fill="#059669" />
                    <Bar dataKey="Shodaqoh" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Wakaf" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Hibah" stackId="a" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly Forecast Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {forecastData.monthlyProjections.map((m, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 hover:border-teal-300 transition">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">{m.month}</span>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                      Rp {(m.projectedInflow / 1000000).toFixed(1)} Jt
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>• Zakat:</span>
                      <span className="font-semibold text-slate-800">Rp {(m.projectedZakat / 1000000).toFixed(1)} Jt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Infaq & Shodaqoh:</span>
                      <span className="font-semibold text-slate-800">Rp {((m.projectedInfaq + m.projectedShodaqoh) / 1000000).toFixed(1)} Jt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Wakaf & Hibah:</span>
                      <span className="font-semibold text-slate-800">Rp {((m.projectedWakaf + m.projectedHibah) / 1000000).toFixed(1)} Jt</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg font-medium">
                    <span className="font-bold">Faktor Kunci: </span>
                    {m.keyDrivers}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hijriyah Calendar Seasonal Drivers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Faktor Musiman Kalender Hijriyah & Siklus Ekonomi Jamaah
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecastData.calendarSeasonalFactors.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-emerald-950">{item.event}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                      {item.expectedSpike}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900/90 leading-relaxed">
                    <span className="font-semibold">Langkah Amil: </span>
                    {item.recommendedAmilAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 5 CATEGORIES DETAIL */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart Visual Comparison */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col items-center justify-center">
              <div className="text-center space-y-1 w-full">
                <h4 className="text-sm font-bold text-slate-900">Perbandingan Radar Baseline vs Proyeksi</h4>
                <p className="text-[11px] text-slate-500">Keseimbangan 5 Pilar Dana Sosial Islam (Juta Rp)</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarCategoryData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 70]} tick={{ fontSize: 10 }} />
                    <Radar name="Baseline (Aktual)" dataKey="Baseline" stroke="#64748b" fill="#64748b" fillOpacity={0.3} />
                    <Radar name="Proyeksi AI" dataKey="Proyeksi" stroke="#059669" fill="#059669" fillOpacity={0.5} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "10px", fontSize: "12px" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Detailed Breakdown Cards */}
            <div className="lg:col-span-2 space-y-3">
              {forecastData.categoryForecasts.map((cat, idx) => (
                <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-teal-300 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
                        0{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{cat.category}</h4>
                        <span className="text-[11px] text-slate-500">
                          Pengganda Musiman: <span className="font-semibold text-teal-700 font-mono">{cat.seasonalMultiplier}x</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 font-mono">
                        Rp {(cat.projected / 1000000).toFixed(1)} Jt
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        +{cat.growthPercent}% dari Baseline
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">Pendorong Pertumbuhan:</span>
                      <span className="text-emerald-900/90 leading-relaxed text-[11px]">{cat.growthDriver}</span>
                    </div>
                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                      <span className="font-bold text-amber-950 block text-[11px] mb-0.5">Mitigasi Risiko:</span>
                      <span className="text-amber-900/90 leading-relaxed text-[11px]">{cat.riskFactor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 3 PREDICTIVE SCENARIOS */}
      {activeTab === "scenarios" && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Perbandingan 3 Skenario Proyeksi ZISWAFH</h3>
            <p className="text-xs text-slate-500">
              Pilih salah satu skenario untuk langsung memuat target ke dalam Rencana Kerja Takmir & Anggaran Program Dampak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Scenario 1: Conservative */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-400 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    Skenario 1
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Konservatif</span>
                </div>

                <div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    Rp {(forecastData.scenarios.conservative.projectedTotal / 1000000).toFixed(1)} Jt
                  </div>
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    +{forecastData.scenarios.conservative.growthRate}% Pertumbuhan
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block text-[11px]">Asumsi Kunci:</span>
                  <p className="text-[11px] leading-relaxed">
                    {forecastData.scenarios.conservative.keyAssumption}
                  </p>
                </div>
              </div>

              <button
                id="btn-apply-conservative-scenario"
                onClick={() => handleApplyScenario("conservative")}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition border border-slate-300 flex items-center justify-center gap-1.5"
              >
                <span>Gunakan Target Konservatif</span>
              </button>
            </div>

            {/* Scenario 2: Moderate (Recommended) */}
            <div className="bg-gradient-to-b from-teal-900 to-slate-950 text-white p-5 rounded-2xl border-2 border-teal-400 shadow-lg space-y-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-emerald-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Rekomendasi AI
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-800/60 px-2.5 py-1 rounded-full border border-teal-500/40">
                    Skenario 2
                  </span>
                  <span className="text-xs font-semibold text-teal-200">Moderat / Realistis</span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    Rp {(forecastData.scenarios.moderate.projectedTotal / 1000000).toFixed(1)} Jt
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    +{forecastData.scenarios.moderate.growthRate}% Pertumbuhan Target
                  </span>
                </div>

                <div className="text-xs text-teal-100 space-y-2 pt-2 border-t border-teal-700/60">
                  <span className="font-bold text-white block text-[11px]">Asumsi Kunci:</span>
                  <p className="text-[11px] leading-relaxed text-teal-100/90">
                    {forecastData.scenarios.moderate.keyAssumption}
                  </p>
                </div>
              </div>

              <button
                id="btn-apply-moderate-scenario"
                onClick={() => handleApplyScenario("moderate")}
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 text-xs font-black py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Pilih Skenario Moderat Ini</span>
              </button>
            </div>

            {/* Scenario 3: Optimistic */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-emerald-400 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Skenario 3
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">Optimis / Akselerasi</span>
                </div>

                <div>
                  <div className="text-2xl font-black text-emerald-900 font-mono">
                    Rp {(forecastData.scenarios.optimistic.projectedTotal / 1000000).toFixed(1)} Jt
                  </div>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    +{forecastData.scenarios.optimistic.growthRate}% Pertumbuhan Maksimal
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block text-[11px]">Asumsi Kunci:</span>
                  <p className="text-[11px] leading-relaxed">
                    {forecastData.scenarios.optimistic.keyAssumption}
                  </p>
                </div>
              </div>

              <button
                id="btn-apply-optimistic-scenario"
                onClick={() => handleApplyScenario("optimistic")}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold py-2 rounded-xl transition border border-emerald-300 flex items-center justify-center gap-1.5"
              >
                <span>Gunakan Target Optimis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMPACT BUDGET ALLOCATION SIMULATOR */}
      {activeTab === "impact_budget" && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  Simulator Anggaran Program Dampak Sosial (Mosque Impact Budgeting)
                </h3>
                <p className="text-xs text-slate-500">
                  Geser persentase alokasi untuk melihat proyeksi realisasi dana (IDR), jangkauan mustahiq, dan nilai SROI secara interaktif.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  Math.abs(totalSimulatedPercentage - 100) < 0.2
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}>
                  Total Alokasi: {totalSimulatedPercentage.toFixed(1)}% {Math.abs(totalSimulatedPercentage - 100) < 0.2 ? "(Optimal 100%)" : "(Perlu Penyesuaian)"}
                </span>
                <button
                  id="btn-reset-allocation-baseline"
                  onClick={() => {
                    const newSims: { [key: string]: number } = {};
                    forecastData.recommendedProgramAllocations.forEach((p) => {
                      newSims[p.id] = p.suggestedPercentage;
                    });
                    setSimulatedAllocations(newSims);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  Reset Default
                </button>
              </div>
            </div>

            {/* List of 5 Core Programs with Live Sliders */}
            <div className="space-y-4">
              {forecastData.recommendedProgramAllocations.map((prog, idx) => {
                const currentPct = simulatedAllocations[prog.id] ?? prog.suggestedPercentage;
                const calculatedBudget = (forecastData.projectedTotalFunds * currentPct) / 100;
                const calculatedBeneficiaries = Math.round((prog.targetBeneficiaries * (currentPct / prog.suggestedPercentage)));

                return (
                  <div key={prog.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {idx + 1}. {prog.programName}
                          </span>
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                            Asnaf: {prog.targetAsnaf}
                          </span>
                          {prog.priority === "CRITICAL" && (
                            <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-md">
                              Prioritas Kritis
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 italic">{prog.rationale}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900 font-mono">
                          Rp {(calculatedBudget / 1000000).toFixed(1)} Jt
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700">
                          ~ {calculatedBeneficiaries} Mustahiq | SROI {prog.expectedMultiplierSROI}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Percentage Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                        <span>Porsi Alokasi Dana:</span>
                        <span className="font-mono font-bold text-teal-800">{currentPct.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        step={0.5}
                        value={currentPct}
                        onChange={(e) => handleSliderChange(prog.id, Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Kepatuhan Pembagian 8 Asnaf Fiqh Syariah: 100% Sesuai Fatwa DSN-MUI No. 14/2000</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-apply-save-budget-rkt"
                  onClick={handleSaveToRkt}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kukuhkan Anggaran RKT DKM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STRATEGIC ACTION PLAN FOR AMIL & DKM */}
      {activeTab === "action_plan" && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-600" />
              Rencana Aksi Amil & Strategi Eksekusi Pencapaian Target ({forecastData.forecastPeriod})
            </h3>
            <p className="text-xs text-slate-500">
              Panduan implementasi teknis untuk Dewan Kemakmuran Masjid (DKM) dan Relawan Amil di seluruh kelurahan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {forecastData.strategicRecommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:border-teal-300 transition">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900">Langkah Strategis #{i + 1}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-8">
                    {rec}
                  </p>
                </div>
              ))}
            </div>

            {/* Amil Duty Checklist Summary */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 mt-4">
              <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                Daftar Periksa Kesiapan Satgas Amil Kecamatan Sematang Borang
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-teal-900">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600 accent-teal-600" />
                  <span>Integrasi QRIS Statis & Dinamis di 24 Masjid Jami'</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600 accent-teal-600" />
                  <span>Sinkronisasi Data Mustahiq 4 Kelurahan via Cloud</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600 accent-teal-600" />
                  <span>Pelatihan Akad Qardhul Hasan untuk Pengelola UMKM</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-teal-600 accent-teal-600" />
                  <span>Penerbitan Kuitansi Digital Zakat Ber-QR Signature</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
