import { useState, FormEvent } from "react";
import confetti from "canvas-confetti";
import {
  Coins,
  Calculator,
  QrCode,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  HeartHandshake,
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  PieChart,
  DollarSign,
  Loader2,
  MessageCircle,
  ExternalLink,
  BarChart3,
  Printer,
  FileText,
} from "lucide-react";
import { ZiswafTransaction, MarketplaceProduct } from "../types";
import { INITIAL_ZISWAF_TRANSACTIONS, INITIAL_MARKETPLACE_PRODUCTS } from "../data/mockData";
import ZiswafVisualReport from "./ZiswafVisualReport";
import PrintableCommunityReportModal from "./PrintableCommunityReportModal";
import ZiswafForecastDashboard from "./ZiswafForecastDashboard";
import ZiswafCircularProgressWidget from "./ZiswafCircularProgressWidget";
import ZiswafhGeospatialMap from "./ZiswafhGeospatialMap";
import MuamalahAwardsBadgeSystem from "./MuamalahAwardsBadgeSystem";
import DigitalQrDonation from "./DigitalQrDonation";
import ZakatMaalCalculator from "./ZakatMaalCalculator";
import { Compass, Trophy, QrCode as QrCodeIcon } from "lucide-react";

export default function BermuamalahModule() {
  const [activeSubTab, setActiveSubTab] = useState<
    "qr_donation" | "zakat_calculator" | "ziswaf_portal" | "marketplace" | "impact_report" | "ziswaf_forecast" | "geospatial_ziswafh" | "muamalah_awards"
  >("qr_donation");

  const [qrDonationPreset, setQrDonationPreset] = useState<{
    amount: number;
    type: "ZAKAT_MAL" | "INFAQ_SHODAQOH";
    nonce: number;
  }>({
    amount: 100000,
    type: "INFAQ_SHODAQOH",
    nonce: 0,
  });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [monthlyZiswafTarget, setMonthlyZiswafTarget] = useState<number>(85000000);

  // Distribution & Impact Visual Data for Summary & Printable Reports
  const defaultDistributionData = [
    {
      name: "Lumbung Pangan Mustahiq",
      asnaf: "Fakir & Miskin",
      allocated: 33500000,
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
      asnaf: "Fisabilillah",
      allocated: 7250000,
      target: 8500000,
      percentage: 8.6,
      recipients: 81,
      color: "#6366f1",
    },
  ];

  const defaultKelurahanImpactData = [
    {
      kelurahan: "Sukamulya",
      penerimaPangan: 120,
      umkmBerdaya: 45,
      beasiswaSantri: 38,
      danaTersalurkanJuta: 29.5,
      indeksMandiri: 88,
    },
    {
      kelurahan: "Lebung Gajah",
      penerimaPangan: 95,
      umkmBerdaya: 38,
      beasiswaSantri: 32,
      danaTersalurkanJuta: 24.2,
      indeksMandiri: 84,
    },
    {
      kelurahan: "Karya Mulya",
      penerimaPangan: 70,
      umkmBerdaya: 35,
      beasiswaSantri: 28,
      danaTersalurkanJuta: 19.8,
      indeksMandiri: 86,
    },
    {
      kelurahan: "Srimulya",
      penerimaPangan: 55,
      umkmBerdaya: 26,
      beasiswaSantri: 22,
      danaTersalurkanJuta: 14.25,
      indeksMandiri: 82,
    },
  ];

  // ZISWAF Transactions State
  const [ziswafList, setZiswafList] = useState<ZiswafTransaction[]>(INITIAL_ZISWAF_TRANSACTIONS);
  const [donorName, setDonorName] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donationType, setDonationType] = useState<"ZAKAT_MAL" | "ZAKAT_PROFESI" | "INFAQ_SHODAQOH" | "WAKAF_PRODUKTIF">("INFAQ_SHODAQOH");
  const [donationAmount, setDonationAmount] = useState<number>(100000);
  const [donationProgram, setDonationProgram] = useState<string>("Lumbung Pangan Mustahiq Sematang Borang");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS_SYARIAH" | "TRANSFER_BSI" | "TUNAI_AMIL">("QRIS_SYARIAH");
  const [isDonationSuccess, setIsDonationSuccess] = useState<boolean>(false);

  // Zakat Calculator State
  const [zakatType, setZakatType] = useState<"mal" | "profesi" | "perdagangan">("mal");
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(1300000); // Rp 1.300.000 / gr
  const [totalAssetValue, setTotalAssetValue] = useState<number>(150000000);
  const [debtValue, setDebtValue] = useState<number>(10000000);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(12000000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(4000000);

  // Marketplace State
  const [productList, setProductList] = useState<MarketplaceProduct[]>(INITIAL_MARKETPLACE_PRODUCTS);
  const [marketCategory, setMarketCategory] = useState<string>("Semua");
  const [marketSearch, setMarketSearch] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);

  // Add Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>("");
  const [newProdSeller, setNewProdSeller] = useState<string>("");
  const [newProdPrice, setNewProdPrice] = useState<number>(50000);
  const [newProdBaseCost, setNewProdBaseCost] = useState<number>(40000);
  const [newProdCategory, setNewProdCategory] = useState<any>("Kuliner Halal");
  const [newProdDesc, setNewProdDesc] = useState<string>("");
  const [newProdHalal, setNewProdHalal] = useState<boolean>(true);

  // Social Impact AI Report State
  const [isGeneratingImpact, setIsGeneratingImpact] = useState<boolean>(false);
  const [impactReportData, setImpactReportData] = useState<any>(null);

  // Zakat calculation logic
  const nisabMal = goldPricePerGram * 85; // 85 gram emas = ~Rp 110.500.000
  const netMalAsset = Math.max(0, totalAssetValue - debtValue);
  const isWajibZakatMal = netMalAsset >= nisabMal;
  const calculatedZakatMal = isWajibZakatMal ? netMalAsset * 0.025 : 0;

  const netIncome = Math.max(0, monthlyIncome - monthlyExpenses);
  const calculatedZakatProfesi = monthlyIncome >= (nisabMal / 12) ? monthlyIncome * 0.025 : 0;

  // Donation Submission
  const handleDonateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (donationAmount <= 0) return;

    const newTrx: ZiswafTransaction = {
      id: `ZW-${Date.now().toString().slice(-5)}`,
      type: donationType,
      donorName: isAnonymous ? "Hamba Allah" : donorName || "Hamba Allah",
      isAnonymous,
      amount: donationAmount,
      timestamp: "Baru Saja (Real-Time)",
      designatedMasjidOrProgram: donationProgram,
      paymentMethod,
      verifiedStatus: "VERIFIED",
      impactCategory:
        donationType === "WAKAF_PRODUKTIF"
          ? "Pemberdayaan UMKM"
          : donationType === "ZAKAT_PROFESI"
          ? "Beasiswa Santri"
          : "Pangan Umat",
    };

    setZiswafList((prev) => [newTrx, ...prev]);
    setIsDonationSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#14b8a6"],
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setIsDonationSuccess(false);
      setDonorName("");
      setDonationAmount(100000);
    }, 3500);
  };

  const handleGenerateImpactReport = async () => {
    setIsGeneratingImpact(true);
    try {
      const totalZakat = ziswafList
        .filter((t) => t.type.startsWith("ZAKAT"))
        .reduce((sum, t) => sum + t.amount, 0);
      const totalInfaq = ziswafList
        .filter((t) => t.type === "INFAQ_SHODAQOH")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalWakaf = ziswafList
        .filter((t) => t.type === "WAKAF_PRODUKTIF")
        .reduce((sum, t) => sum + t.amount, 0);

      const res = await fetch("/api/gemini/social-impact-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalZakat,
          totalInfaq,
          totalWakaf,
          beneficiariesCount: 780,
          period: "Agustus 2026",
        }),
      });
      const data = await res.json();
      setImpactReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImpact(false);
    }
  };

  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdPrice <= 0) return;

    const marginPct = Number((((newProdPrice - newProdBaseCost) / newProdBaseCost) * 100).toFixed(1));

    const newProd: MarketplaceProduct = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      sellerName: newProdSeller || "Jamaah UMKM Berkah",
      sellerMasjid: "Masjid Sematang Borang",
      kelurahan: "Sukamulya",
      price: newProdPrice,
      baseCost: newProdBaseCost,
      profitMarginPercentage: marginPct,
      category: newProdCategory,
      halalCertified: newProdHalal,
      halalRegNo: newProdHalal ? `ID1611000${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
      rating: 5.0,
      soldCount: 1,
      description: newProdDesc || "Produk halal berkualitas dari UMKM jamaah masjid.",
      akadType: "Bai' Murabahah",
      imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=500&q=80",
    };

    setProductList((prev) => [newProd, ...prev]);
    setIsAddProductOpen(false);
    setNewProdName("");
    setNewProdDesc("");
    alert("Produk UMKM Syariah berhasil ditambahkan ke Marketplace!");
  };

  const filteredProducts = productList.filter((p) => {
    const matchesCategory = marketCategory === "Semua" || p.category === marketCategory;
    const matchesSearch =
      marketSearch === "" ||
      p.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
      p.sellerName.toLowerCase().includes(marketSearch.toLowerCase()) ||
      p.kelurahan.toLowerCase().includes(marketSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCollectedZiswaf = ziswafList.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div id="bermuamalah-module" className="space-y-6">
      {/* Pillar Header Card */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white border border-teal-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/60 border border-teal-500/40 text-teal-300 text-xs font-semibold mb-2">
              <Coins className="w-3.5 h-3.5" />
              <span>PILAR 4 : BERMUAMALAH (Transparent FinTech & Economic Hub)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              ZISWAF Digital & Pasar Muamalah Syariah
            </h2>
            <p className="text-sm text-teal-200/90 max-w-2xl mt-1">
              Pengelolaan Zakat, Infaq, Sedekah, dan Wakaf Produktif yang 100% transparan, dilengkapi kalkulator syariah otomatis, QRIS Syariah, dan P2P Marketplace UMKM Jamaah.
            </p>
          </div>

          {/* Sub-Navigation Buttons */}
          <div className="flex flex-wrap gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-teal-800/60">
            <button
              id="subtab-qr-donation"
              onClick={() => setActiveSubTab("qr_donation")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "qr_donation"
                  ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-slate-950 shadow-md font-black"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-950/80 border border-emerald-500/40"
              }`}
            >
              <QrCodeIcon className="w-3.5 h-3.5" />
              <span>QRIS Donasi Dinamis</span>
            </button>
            <button
              id="subtab-zakat-calculator"
              onClick={() => setActiveSubTab("zakat_calculator")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "zakat_calculator"
                  ? "bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-400 text-slate-950 shadow-md font-black"
                  : "text-teal-200 hover:text-white hover:bg-teal-900/70 border border-teal-500/40"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Kalkulator Zakat Maal</span>
            </button>
            <button
              id="subtab-muamalah-awards"
              onClick={() => setActiveSubTab("muamalah_awards")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "muamalah_awards"
                  ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-md font-black"
                  : "text-amber-300 hover:text-white hover:bg-amber-950/80 border border-amber-500/30"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Muamalah Awards & Lencana</span>
            </button>
            <button
              id="subtab-geospatial-ziswafh"
              onClick={() => setActiveSubTab("geospatial_ziswafh")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "geospatial_ziswafh"
                  ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-sm font-black"
                  : "text-teal-300 hover:text-white hover:bg-teal-900/60"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Peta Sebaran ZISWAFH
            </button>
            <button
              id="subtab-ziswaf-portal"
              onClick={() => setActiveSubTab("ziswaf_portal")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "ziswaf_portal"
                  ? "bg-teal-500 text-slate-950 shadow-sm font-bold"
                  : "text-teal-300 hover:text-white hover:bg-teal-900/60"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Portal ZISWAF & Kas Umat
            </button>
            <button
              id="subtab-marketplace"
              onClick={() => setActiveSubTab("marketplace")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "marketplace"
                  ? "bg-teal-500 text-slate-950 shadow-sm font-bold"
                  : "text-teal-300 hover:text-white hover:bg-teal-900/60"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Pasar Muamalah ({filteredProducts.length})
            </button>
            <button
              id="subtab-impact-report"
              onClick={() => setActiveSubTab("impact_report")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "impact_report"
                  ? "bg-teal-500 text-slate-950 shadow-sm font-bold"
                  : "text-teal-300 hover:text-white hover:bg-teal-900/60"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Visual Report & BI Dampak Umat
            </button>
            <button
              id="subtab-ziswaf-forecast"
              onClick={() => setActiveSubTab("ziswaf_forecast")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "ziswaf_forecast"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-sm font-black"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-950/80 border border-emerald-500/30"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-slate-950 sm:text-emerald-400" />
              <span>AI Predictive Forecast</span>
            </button>

            {/* Direct Print-Friendly Summary Generation Button */}
            <button
              id="header-generate-print-report-btn"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-sm"
              title="Generate Ringkasan Transparansi Komunitas Siap Cetak (A4 / Buletin / WA)"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Transparansi
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 0.0: DIGITAL QR DONATION COMPONENT (REAL-TIME QRIS & VALIDATION) */}
      {activeSubTab === "qr_donation" && (
        <DigitalQrDonation
          initialAmount={qrDonationPreset.amount}
          initialType={qrDonationPreset.type}
          onDonationConfirmed={(newTrx) => {
            setZiswafList((prev) => [newTrx, ...prev]);
          }}
        />
      )}

      {/* SUBTAB 0.1: DEDICATED ZAKAT MAAL CALCULATOR TOOL */}
      {activeSubTab === "zakat_calculator" && (
        <ZakatMaalCalculator
          onProceedToQrDonation={(calculatedAmount) => {
            setQrDonationPreset({
              amount: calculatedAmount,
              type: "ZAKAT_MAL",
              nonce: Date.now(),
            });
            setActiveSubTab("qr_donation");
          }}
          onApplyToPortal={(calculatedAmount) => {
            setDonationType("ZAKAT_MAL");
            setDonationAmount(calculatedAmount);
            setActiveSubTab("ziswaf_portal");
          }}
        />
      )}

      {/* SUBTAB 0: MUAMALAH AWARDS & BADGE SYSTEM */}
      {activeSubTab === "muamalah_awards" && (
        <MuamalahAwardsBadgeSystem
          currentTotalZiswaf={totalCollectedZiswaf}
          onOpenDirectDonation={() => setActiveSubTab("qr_donation")}
        />
      )}

      {/* SUBTAB 0.5: GEOSPATIAL ZISWAFH BENEFIT DISTRIBUTION MAP */}
      {activeSubTab === "geospatial_ziswafh" && (
        <ZiswafhGeospatialMap />
      )}


      {/* SUBTAB 1: ZISWAF PORTAL & KALKULATOR */}
      {activeSubTab === "ziswaf_portal" && (
        <div className="space-y-6">
          {/* Quick Banner to Dynamic QR Code */}
          <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <QrCodeIcon className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-emerald-200">
                  Layanan Baru: QRIS Syariah Dinamis & Validasi Real-Time
                </h5>
                <p className="text-xs text-slate-300">
                  Pindai QR code dinamis perbankan dengan otomasi pencatatan kas umat & e-kwitansi sah.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab("qr_donation")}
              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 shrink-0 transition"
            >
              <span>Buka QRIS Dinamis</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Circular Progress Bar Target Goal Widget */}
          <ZiswafCircularProgressWidget
            totalCollected={totalCollectedZiswaf}
            monthlyTarget={monthlyZiswafTarget}
            monthName="Agustus 2026 (Safar 1448 H)"
            transactions={ziswafList}
            onOpenDonate={() => setActiveSubTab("qr_donation")}
            onTargetChange={(newTarget) => setMonthlyZiswafTarget(newTarget)}
            onOpenAwards={() => setActiveSubTab("muamalah_awards")}
          />


          {/* ZISWAF Highlight Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-800 to-teal-950 p-5 rounded-2xl text-white shadow-md border border-emerald-700/50 space-y-1">
              <span className="text-xs text-emerald-300 font-medium">Total Dana ZISWAF Terhimpun</span>
              <div className="text-xl sm:text-2xl font-black font-mono">
                Rp {totalCollectedZiswaf.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-emerald-300/80">
                100% Real-Time Ledger Terbuka & Diaudit Syariah
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">Standar Nisab Emas (85gr)</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
                Rp {nisabMal.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-slate-500">
                Harga Emas: Rp {goldPricePerGram.toLocaleString("id-ID")}/gr
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Penyaluran Mustahiq</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">
                780 Penerima
              </div>
              <p className="text-[11px] text-slate-500">
                Di 4 Kelurahan Sematang Borang
              </p>
            </div>

            <div
              onClick={() => setActiveSubTab("impact_report")}
              className="bg-gradient-to-br from-teal-50 to-emerald-50/70 p-5 rounded-2xl border border-teal-200 shadow-sm space-y-1 cursor-pointer hover:border-teal-400 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-teal-800 font-semibold flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                  Visual Report & SROI
                </span>
                <ArrowUpRight className="w-4 h-4 text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-teal-950 font-mono">
                1 : 3.8x
              </div>
              <p className="text-[11px] text-teal-700 font-medium">
                Buka Grafik & Analitik Recharts →
              </p>
            </div>
          </div>

          {/* Form Transaksi & Kalkulator Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kalkulator Zakat Syariah */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Kalkulator Zakat Syariah
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex bg-slate-100 p-1 rounded-lg text-[11px]">
                    <button
                      onClick={() => setZakatType("mal")}
                      className={`px-2.5 py-1 rounded font-semibold transition ${
                        zakatType === "mal" ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"
                      }`}
                    >
                      Zakat Mal
                    </button>
                    <button
                      onClick={() => setZakatType("profesi")}
                      className={`px-2.5 py-1 rounded font-semibold transition ${
                        zakatType === "profesi" ? "bg-white text-teal-800 shadow-sm" : "text-slate-600"
                      }`}
                    >
                      Profesi
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("zakat_calculator")}
                    className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[10px] font-bold transition"
                  >
                    Rinci →
                  </button>
                </div>
              </div>

              {zakatType === "mal" ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Total Aset Harta (Tabungan, Emas, Saham, Piutang Lancar)
                    </label>
                    <input
                      type="number"
                      value={totalAssetValue}
                      onChange={(e) => setTotalAssetValue(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Hutang Jatuh Tempo / Kebutuhan Pokok Mendesak
                    </label>
                    <input
                      type="number"
                      value={debtValue}
                      onChange={(e) => setDebtValue(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium">Harta Bersih:</span>
                      <span className="font-mono font-bold text-slate-900">
                        Rp {netMalAsset.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">Status Nisab:</span>
                      <span className={`font-bold ${isWajibZakatMal ? "text-emerald-700" : "text-amber-700"}`}>
                        {isWajibZakatMal ? "✓ Wajib Zakat (Mencapai Nisab)" : "Belum Wajib Zakat Mal"}
                      </span>
                    </div>
                    <div className="border-t border-teal-200/80 pt-1.5 flex items-center justify-between">
                      <span className="font-bold text-teal-950">Kewajiban Zakat (2.5%):</span>
                      <span className="text-base font-black text-teal-900 font-mono">
                        Rp {calculatedZakatMal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {isWajibZakatMal && (
                    <button
                      onClick={() => {
                        setDonationType("ZAKAT_MAL");
                        setDonationAmount(calculatedZakatMal);
                      }}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                    >
                      Tunaikan Zakat Mal Ini (Rp {calculatedZakatMal.toLocaleString("id-ID")})
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Penghasilan / Gaji Bulanan (Rp)
                    </label>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">Nisab Bulanan:</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        Rp {Math.round(nisabMal / 12).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="border-t border-teal-200/80 pt-1.5 flex items-center justify-between">
                      <span className="font-bold text-teal-950">Zakat Profesi (2.5%):</span>
                      <span className="text-base font-black text-teal-900 font-mono">
                        Rp {calculatedZakatProfesi.toLocaleString("id-ID")}/Bulan
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDonationType("ZAKAT_PROFESI");
                      setDonationAmount(calculatedZakatProfesi || 100000);
                    }}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    Tunaikan Zakat Profesi Ini
                  </button>
                </div>
              )}
            </div>

            {/* Portal Transaksi ZISWAF QRIS Syariah */}
            <div id="form-tunaikan-ziswaf" className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Formulir Tunaikan ZISWAF (QRIS Syariah Instant)
                  </h4>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded">
                  Amil Resmi Terverifikasi
                </span>
              </div>

              {isDonationSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-3">
                  <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="text-lg font-bold text-emerald-950">
                    Jazakumullah Khairan Katsiran!
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Donasi ZISWAF sebesar <strong>Rp {donationAmount.toLocaleString("id-ID")}</strong> berhasil diterima dan tercatat di buku besar publik kas umat Sematang Borang.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDonateSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Jenis Akad ZISWAF
                      </label>
                      <select
                        value={donationType}
                        onChange={(e: any) => setDonationType(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="INFAQ_SHODAQOH">Infaq & Sedekah Berkah</option>
                        <option value="ZAKAT_MAL">Zakat Mal (Harta)</option>
                        <option value="ZAKAT_PROFESI">Zakat Penghasilan / Profesi</option>
                        <option value="WAKAF_PRODUKTIF">Wakaf Produktif UMKM Santri</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nominal Donasi (Rp)
                      </label>
                      <input
                        type="number"
                        min="10000"
                        step="5000"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Preset Nominal Quick Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[50000, 100000, 250000, 500000, 1000000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setDonationAmount(preset)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-mono font-semibold border transition ${
                          donationAmount === preset
                            ? "bg-teal-700 text-white border-teal-700"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Rp {preset.toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nama Muzakki / Donatur
                      </label>
                      <input
                        type="text"
                        disabled={isAnonymous}
                        value={isAnonymous ? "Hamba Allah" : donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Nama Lengkap / Keluarga"
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg disabled:opacity-60 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <label className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Sembunyikan nama (Hamba Allah)</span>
                      </label>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Peruntukan Program Dakwah & Sosial
                      </label>
                      <select
                        value={donationProgram}
                        onChange={(e) => setDonationProgram(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option>Lumbung Pangan Mustahiq Sematang Borang</option>
                        <option>Beasiswa 10 Penghafal Al-Qur'an Yatim</option>
                        <option>Inkubator Usaha Ternak & Sayur Santri</option>
                        <option>Renovasi Sound & Akustik Masjid</option>
                        <option>Bantuan Medis Darurat Lansia Dhuafa</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 border shadow-xs flex items-center justify-center">
                        <QrCode className="w-9 h-9 text-slate-800" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">QRIS Syariah Nasional</div>
                        <div className="text-[11px] text-slate-500">NMID: ID1020039182391 (BSI Masjid Sematang Borang)</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      Biaya Admin: Rp 0 (Gratis)
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    Tunaikan ZISWAF Sekarang (Rp {donationAmount.toLocaleString("id-ID")})
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Public Transparency Ledger */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Buku Besar Transparansi Kas Umat (Public Ledger)
                </h4>
                <p className="text-xs text-slate-500">
                  Laporan aliran dana masuk & verifikasi amil yang dapat diakses publik secara akuntabel.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="ledger-print-summary-btn"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs transition border border-slate-300 shadow-2xs"
                  title="Buka Format Laporan Transparansi Siap Cetak"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-700" />
                  <span>Format Siap Cetak</span>
                </button>
                <span className="text-xs text-emerald-800 bg-emerald-50 font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Audit Otomatis DSN-MUI
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b">
                    <th className="p-3 font-bold">ID Transaksi</th>
                    <th className="p-3 font-bold">Muzakki / Donatur</th>
                    <th className="p-3 font-bold">Jenis Akad</th>
                    <th className="p-3 font-bold">Nominal (Rp)</th>
                    <th className="p-3 font-bold">Program Penyaluran</th>
                    <th className="p-3 font-bold">Kanal</th>
                    <th className="p-3 font-bold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ziswafList.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">{trx.id}</td>
                      <td className="p-3 font-medium text-slate-900">{trx.donorName}</td>
                      <td className="p-3">
                        <span className="bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {trx.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        Rp {trx.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-slate-600">{trx.designatedMasjidOrProgram}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{trx.paymentMethod}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{trx.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PASAR MUAMALAH SYARIAH */}
      {activeSubTab === "marketplace" && (
        <div className="space-y-6">
          {/* Marketplace Header Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {["Semua", "Kuliner Halal", "Busana Muslim", "Herbal & Thibbun Nabawi"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMarketCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                    marketCategory === cat
                      ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk halal UMKM..."
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                id="btn-add-product-open"
                onClick={() => setIsAddProductOpen(true)}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Daftarkan Produk UMKM
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {prod.halalCertified && (
                    <span className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3" />
                      HALAL BPJPH
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    Akad: {prod.akadType}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {prod.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug line-clamp-2">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {prod.sellerName} • Kel. {prod.kelurahan}
                    </p>
                  </div>

                  <div className="pt-2 border-t space-y-1.5">
                    {/* Transparent Sharia Margin Disclosure */}
                    <div className="bg-slate-50 p-2 rounded-lg text-[10px] text-slate-600 space-y-0.5 border border-slate-100">
                      <div className="flex justify-between">
                        <span>Harga Pokok:</span>
                        <span className="font-mono">Rp {prod.baseCost.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-emerald-800">
                        <span>Margin Keuntungan:</span>
                        <span>{prod.profitMarginPercentage}% (Transparan)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs text-slate-400 font-normal">Harga Jual:</span>
                        <div className="text-base font-black text-slate-900 font-mono">
                          Rp {prod.price.toLocaleString("id-ID")}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Beli Berkah
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SOCIAL IMPACT & VISUAL REPORT (RECHARTS BI) */}
      {activeSubTab === "impact_report" && (
        <div className="space-y-6">
          {/* Main Visual Reporting Component using Recharts */}
          <ZiswafVisualReport
            transactions={ziswafList}
            onOpenDonate={() => setActiveSubTab("ziswaf_portal")}
            onRequestPrintReport={() => setIsPrintModalOpen(true)}
            onOpenForecast={() => setActiveSubTab("ziswaf_forecast")}
          />

          {/* AI Intelligence & Strategic Impact Insights Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    AI Social Impact & Multiplier Analysis Studio
                  </h4>
                  <p className="text-xs text-slate-600">
                    Sintesis naratif otomatis berbasis kecerdasan buatan Gemini AI untuk akuntabilitas publik dan rekomendasi strategis pilar Bermuamalah.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateImpactReport}
                disabled={isGeneratingImpact}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
              >
                {isGeneratingImpact ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengolah Data AI BI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Analisis Naratif AI
                  </>
                )}
              </button>
            </div>

            {impactReportData ? (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="p-5 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
                  <h5 className="font-bold text-xs text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    Executive Summary Dampak Umat (AI Synthesized)
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {impactReportData.executiveSummary}
                  </p>
                </div>

                {/* SDG Metrics */}
                {impactReportData.sdgMetrics && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Capaian Indikator Kesejahteraan Umat (SDG Syariah)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {impactReportData.sdgMetrics.map((sdg: any, sIdx: number) => (
                        <div key={sIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="text-xs font-bold text-slate-900">{sdg.goal}</div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Tingkat Efektivitas:</span>
                            <span className="font-bold text-emerald-700">{sdg.impactLevel}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-600 h-full rounded-full"
                              style={{ width: sdg.progress || "85%" }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-right font-mono text-slate-500">
                            {sdg.progress} Target Tercapai
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Recommendations */}
                {impactReportData.keyRecommendations && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Rekomendasi Strategis Pilar Bermuamalah
                    </h5>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {impactReportData.keyRecommendations.map((rec: string, rIdx: number) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50/70 rounded-xl p-6 text-center space-y-2 border border-slate-200">
                <Sparkles className="w-8 h-8 text-teal-600 mx-auto" />
                <h5 className="font-bold text-slate-800 text-xs">
                  Siap Menghasilkan Sintesis Naratif AI Lanjutan
                </h5>
                <p className="text-[11px] text-slate-500 max-w-lg mx-auto">
                  Klik <strong>Generate Analisis Naratif AI</strong> untuk menghasilkan evaluasi mendalam SDG Syariah, narasi dampak, dan rekomendasi strategis penguatan ekonomi jamaah.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: AI PREDICTIVE FORECAST ZISWAFH DASHBOARD */}
      {activeSubTab === "ziswaf_forecast" && (
        <ZiswafForecastDashboard
          transactions={ziswafList}
          onNavigateToDonation={() => setActiveSubTab("ziswaf_portal")}
        />
      )}

      {/* Modal Beli Produk Syariah */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-base">
                Rincian Transaksi Akad Syariah
              </h4>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex gap-3 items-center">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedProduct.name}</div>
                  <div className="text-slate-500">{selectedProduct.sellerName}</div>
                  <div className="text-teal-700 font-mono font-bold text-base mt-0.5">
                    Rp {selectedProduct.price.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-1">
                <div className="font-bold text-teal-900">Transparansi Akad Murabahah (Jual Beli):</div>
                <div className="text-slate-700">Harga Pokok: Rp {selectedProduct.baseCost.toLocaleString("id-ID")}</div>
                <div className="text-slate-700">Margin Laba: Rp {(selectedProduct.price - selectedProduct.baseCost).toLocaleString("id-ID")} ({selectedProduct.profitMarginPercentage}%)</div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-1">✓ Bebas Riba, Bebas Gharar, dan Transparan</div>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  alert(`Pemesanan produk "${selectedProduct.name}" berhasil diteruskan ke Penjual (${selectedProduct.sellerName}) melalui jalur ukhuwah WhatsApp.`);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Pesan via WhatsApp Penjual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Produk UMKM */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-base">
                Daftarkan Produk UMKM Jamaah
              </h4>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Produk / Jasa</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Contoh: Kopi Robusta Semendo Specialty"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newProdCategory}
                    onChange={(e: any) => setNewProdCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option>Kuliner Halal</option>
                    <option>Busana Muslim</option>
                    <option>Herbal & Thibbun Nabawi</option>
                    <option>Jasa Profesional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Usaha / Penjual</label>
                  <input
                    type="text"
                    value={newProdSeller}
                    onChange={(e) => setNewProdSeller(e.target.value)}
                    placeholder="Nama Toko / UMKM"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Pokok Pembelian (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newProdBaseCost}
                    onChange={(e) => setNewProdBaseCost(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Jual Syariah (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Keterangan bahan baku halal, keunggulan, dan cara konsumsi..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newProdHalal}
                  onChange={(e) => setNewProdHalal(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span className="font-medium">Saya menjamin bahan baku 100% halal dan bebas zat haram.</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Simpan & Terbitkan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Transparency Report Modal */}
      <PrintableCommunityReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        period="Tahun 2026 (Agustus)"
        kelurahan="Semua (Kec. Sematang Borang)"
        transactions={ziswafList}
        distributionData={defaultDistributionData}
        kelurahanImpactData={defaultKelurahanImpactData}
        totalAllocated={87750000}
        totalTarget={91500000}
        totalRecipients={780}
        aiImpactSummary={impactReportData}
      />
    </div>
  );
}
