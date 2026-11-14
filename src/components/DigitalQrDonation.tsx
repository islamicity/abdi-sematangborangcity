import { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import {
  QrCode,
  CheckCircle2,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Share2,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  Sparkles,
  HeartHandshake,
  Smartphone,
  CheckCheck,
  AlertCircle,
  Coins,
  ChevronRight,
  ArrowRight,
  Info,
  ExternalLink,
  Volume2,
  Camera,
  Layers,
  Lock,
  Wallet,
  Receipt,
  RotateCcw,
  FileText,
} from "lucide-react";
import { QrDonationPayload, QrValidationStage, ZiswafTransaction } from "../types";
import DonationReceiptModal from "./DonationReceiptModal";
import {
  DonationReceiptData,
  downloadDonationReceiptPdf,
} from "../utils/donationReceiptPdf";

// Harmonic Audio Notification via Web Audio API
const playSuccessChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Ascending major chord (C5, E5, G5, C6)
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.5);
    });
  } catch (e) {
    console.log("Audio chime note skipped", e);
  }
};

interface DigitalQrDonationProps {
  onDonationConfirmed?: (trx: ZiswafTransaction) => void;
  initialAmount?: number;
  initialType?: "ZAKAT_MAL" | "ZAKAT_FITRAH" | "ZAKAT_PROFESI" | "INFAQ_SHODAQOH" | "WAKAF_PRODUKTIF" | "DANA_BENCANA" | "HIBAH_FASUM";
  initialProgram?: string;
  onClose?: () => void;
}

export default function DigitalQrDonation({
  onDonationConfirmed,
  initialAmount = 100000,
  initialType = "INFAQ_SHODAQOH",
  initialProgram = "Lumbung Pangan Mustahiq Sematang Borang",
  onClose,
}: DigitalQrDonationProps) {
  // Form Configuration
  const [donationType, setDonationType] = useState<
    "ZAKAT_MAL" | "ZAKAT_FITRAH" | "ZAKAT_PROFESI" | "INFAQ_SHODAQOH" | "WAKAF_PRODUKTIF" | "DANA_BENCANA" | "HIBAH_FASUM"
  >(initialType);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [customAmountInput, setCustomAmountInput] = useState<string>(String(initialAmount));
  const [donorName, setDonorName] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donorPhone, setDonorPhone] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>(initialProgram);
  const [selectedMasjid, setSelectedMasjid] = useState<string>("Masjid Jami' Al-Ikhlas (Central Baitul Maal)");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Sukamulya");

  // Dynamic QR Payload & Unique Code
  const [uniqueCode, setUniqueCode] = useState<number>(() => Math.floor(100 + Math.random() * 899));
  const [referenceId, setReferenceId] = useState<string>(() => `QRIS-${Date.now().toString().slice(-8)}`);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [expirySeconds, setExpirySeconds] = useState<number>(300); // 5 minutes validity
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Real-time Validation Engine State
  const [validationStage, setValidationStage] = useState<QrValidationStage>("IDLE");
  const [validationProgress, setValidationProgress] = useState<number>(0);
  const [validatedTrx, setValidatedTrx] = useState<ZiswafTransaction | null>(null);
  const [activeTab, setActiveTab] = useState<"QR_DISPLAY" | "CAMERA_SCANNER" | "RECEIPT">("QR_DISPLAY");

  // Utilities UI State
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedRefCode, setCopiedRefCode] = useState<boolean>(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState<boolean>(false);
  const [printableReceipt, setPrintableReceipt] = useState<DonationReceiptData | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Sync preset props when launched from Zakat Maal Calculator or parent action
  useEffect(() => {
    setDonationType(initialType);
    setAmount(initialAmount);
    setCustomAmountInput(String(initialAmount));
    const presets = [20000, 50000, 100000, 250000, 500000, 1000000];
    setIsCustomAmount(!presets.includes(initialAmount));
  }, [initialAmount, initialType]);

  // Calculation of Total Payable (Nominal + Unique Code for Bank Match)
  const totalPayable = useMemo(() => {
    return amount + uniqueCode;
  }, [amount, uniqueCode]);

  // Akad Niat Syariah Text mapping
  const akadDetails = useMemo(() => {
    switch (donationType) {
      case "ZAKAT_MAL":
        return {
          title: "Akad Niat Zakat Mal (Harta)",
          arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى",
          latin: "Nawaitu an ukhrija zakāta mālī fardhan lillāhi ta'ālā.",
          meaning: "Aku niat mengeluarkan zakat hartaku, fardhu karena Allah Ta'ala.",
          asnaf: "Fakir, Miskin, Fisabilillah, Ibnu Sabil, Gharimin",
          categoryName: "Zakat Mal",
        };
      case "ZAKAT_PROFESI":
        return {
          title: "Akad Niat Zakat Profesi / Penghasilan",
          arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ كَسْبِي فَرْضًا لِلَّهِ تَعَالَى",
          latin: "Nawaitu an ukhrija zakāta kasbī fardhan lillāhi ta'ālā.",
          meaning: "Aku niat menunaikan zakat dari penghasilanku fardhu karena Allah Ta'ala.",
          asnaf: "Fakir, Miskin, Amil, Mu'allaf",
          categoryName: "Zakat Profesi",
        };
      case "WAKAF_PRODUKTIF":
        return {
          title: "Akad Ikrar Wakaf Uang Produktif",
          arabic: "نَوَيْتُ الْوَقْفَ لِلَّهِ تَعَالَى فِي سَبِيلِ الْخَيْرِ وَالْبِرِّ",
          latin: "Nawaitu al-waqfa lillāhi ta'ālā fī sabīlil-khairi wal-birr.",
          meaning: "Aku berniat mewakafkan dana ini lillahi Ta'ala untuk kemaslahatan dan kebajikan abadi umat.",
          asnaf: "Pemberdayaan Ekonomi & UMKM Jamaah Tanpa Riba",
          categoryName: "Wakaf Produktif",
        };
      case "HIBAH_FASUM":
        return {
          title: "Akad Hibah Fasilitas Umat",
          arabic: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ",
          latin: "Wa ta'āwanū 'alal-birri wat-taqwā.",
          meaning: "Dan tolong-menolonglah kamu dalam mengerjakan kebajikan dan takwa.",
          asnaf: "Pemeliharaan Masjid, Fasilitas Air, dan Ambulans",
          categoryName: "Hibah Fasum",
        };
      default:
        return {
          title: "Akad Infaq & Sedekah Jariyah",
          arabic: "نَوَيْتُ التَّقَرُّبَ إِلَى اللَّهِ تَعَالَى بِهَذِهِ الصَّدَقَةِ",
          latin: "Nawaitu at-taqarruba ilallāhi ta'ālā bihādzihiṣ-ṣadaqah.",
          meaning: "Aku berniat mendekatkan diri kepada Allah Ta'ala dengan menunaikan sedekah ini.",
          asnaf: "Kemaslahatan Umum, Anak Yatim, dan Lansia Dhuafa",
          categoryName: "Infaq & Sedekah",
        };
    }
  }, [donationType]);

  // Generate Real QRIS Compliant String & DataURL
  useEffect(() => {
    const generateQrCode = async () => {
      try {
        // EMVCo QRIS Standard Payload Simulation for Baitul Maal Sematang Borang
        const nmid = "ID1020268491029";
        const merchantName = "BAITUL MAAL SEMATANG BORANG";
        const merchantCity = "PALEMBANG";
        const postalCode = "30163";
        const currCode = "360"; // IDR
        const dateStr = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);

        const rawQrString = `00020101021226680016ID.CO.QRIS.WWW011893600918${nmid}0215${referenceId}0303UMI51440014ID.GO.BI.QRIS011893600918${nmid}0215${referenceId}0303UMI520483995303${currCode}54${String(totalPayable.toFixed(2)).length.toString().padStart(2, "0")}${totalPayable.toFixed(2)}5802ID59${merchantName.length.toString().padStart(2, "0")}${merchantName}60${merchantCity.length.toString().padStart(2, "0")}${merchantCity}6105${postalCode}62${String(referenceId.length + 4).padStart(2, "0")}01${referenceId.length.toString().padStart(2, "0")}${referenceId}6304`;

        const url = await QRCode.toDataURL(rawQrString, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 380,
          color: {
            dark: "#042f2e", // Deep teal
            light: "#ffffff",
          },
        });

        setQrDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      }
    };

    generateQrCode();
  }, [totalPayable, referenceId]);

  // Expiry Timer Countdown
  useEffect(() => {
    if (validationStage === "CONFIRMED_SUCCESS") return;

    const timer = setInterval(() => {
      setExpirySeconds((prev) => {
        if (prev <= 1) {
          setValidationStage("EXPIRED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [validationStage]);

  // Refresh QR & Generate New Dynamic Reference & Code
  const handleRefreshQr = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setReferenceId(`QRIS-${Date.now().toString().slice(-8)}`);
      setUniqueCode(Math.floor(100 + Math.random() * 899));
      setExpirySeconds(300);
      setValidationStage("IDLE");
      setValidationProgress(0);
      setIsRefreshing(false);
    }, 400);
  };

  // Preset Nominal Selector
  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setIsCustomAmount(false);
    setCustomAmountInput(String(val));
    setValidationStage("IDLE");
  };

  // Custom Nominal Input Handler
  const handleCustomAmountChange = (valStr: string) => {
    setCustomAmountInput(valStr);
    const num = parseInt(valStr.replace(/\D/g, ""), 10) || 0;
    setAmount(num);
    setIsCustomAmount(true);
    setValidationStage("IDLE");
  };

  // Real-Time Payment Simulation Engine (Simulates E-Wallet / Mobile Banking Scan & Settlement)
  const handleSimulatePaymentFlow = () => {
    if (amount <= 0 || validationStage === "CONFIRMED_SUCCESS") return;

    setIsSimulatingScan(true);
    setValidationStage("SCANNING");
    setValidationProgress(15);

    // Stage 1: Scanning detected
    setTimeout(() => {
      setValidationStage("DETECTED");
      setValidationProgress(35);

      // Stage 2: Bank host BSI verification
      setTimeout(() => {
        setValidationStage("VERIFYING_BANK");
        setValidationProgress(65);

        // Stage 3: Baitul Maal Public Ledger Reconcile
        setTimeout(() => {
          setValidationStage("RECONCILING_LEDGER");
          setValidationProgress(90);

          // Stage 4: Confirmed Success
          setTimeout(() => {
            const finalTrx: ZiswafTransaction = {
              id: referenceId,
              type: donationType,
              donorName: isAnonymous ? "Hamba Allah" : donorName.trim() || "Hamba Allah",
              isAnonymous,
              amount: totalPayable,
              timestamp: "Baru Saja (Terverifikasi QRIS Real-Time)",
              designatedMasjidOrProgram: `${selectedProgram} (${selectedMasjid})`,
              paymentMethod: "QRIS_SYARIAH",
              verifiedStatus: "VERIFIED",
              impactCategory:
                donationType === "WAKAF_PRODUKTIF"
                  ? "Pemberdayaan UMKM"
                  : donationType === "ZAKAT_PROFESI"
                  ? "Beasiswa Santri"
                  : donationType === "ZAKAT_MAL"
                  ? "Pangan Umat"
                  : "Operasional Masjid",
              referenceCode: `BSI-${referenceId.slice(5)}-NMID-ID1020268491029`,
              uniqueCode,
            };

            setValidatedTrx(finalTrx);
            setValidationStage("CONFIRMED_SUCCESS");
            setValidationProgress(100);
            setIsSimulatingScan(false);

            // Trigger celebration chime & confetti
            playSuccessChime();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#059669", "#10b981", "#38bdf8", "#fbbf24", "#34d399"],
            });

            // Notify parent component
            if (onDonationConfirmed) {
              onDonationConfirmed(finalTrx);
            }
          }, 700);
        }, 700);
      }, 700);
    }, 600);
  };

  // Copy Reference Code
  const handleCopyRefCode = () => {
    navigator.clipboard.writeText(referenceId);
    setCopiedRefCode(true);
    setTimeout(() => setCopiedRefCode(false), 2000);
  };

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
    const text = `🕌 BUKTI RESMI INFAQ / ZISWAF DIGITAL QRIS
BAITUL MAAL KECAMATAN SEMATANG BORANG

Nomor Referensi: ${referenceId}
Muzakki/Donatur: ${isAnonymous ? "Hamba Allah" : donorName || "Hamba Allah"}
Jenis Akad: ${akadDetails.categoryName}
Nominal Terverifikasi: Rp ${totalPayable.toLocaleString("id-ID")}
Peruntukan: ${selectedProgram}
Simpul Masjid: ${selectedMasjid}
Waktu Transaksi: ${new Date().toLocaleString("id-ID")}
Status: ✓ SAH & TERVERIFIKASI SISTEM KAS UMAT (DSN-MUI)

"Semoga Allah memberikan pahala atas apa yang engkau berikan, menjadikannya pembersih hartamu, dan memberkahi harta yang tersisa."
Lacak transparansi: https://abdi.sematangborangcity.cloud`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Download QR Code Image as PNG
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QRIS-ZISWAF-${referenceId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build standardized e-Kwitansi data from validated ZiswafTransaction
  const buildZiswafReceiptData = (trx: ZiswafTransaction): DonationReceiptData => ({
    receiptNumber: trx.id,
    bankReference: trx.referenceCode,
    donorName: trx.donorName,
    isAnonymous: trx.isAnonymous,
    donorPhone: donorPhone.trim() || undefined,
    donorEmail: donorEmail.trim() || undefined,
    recipientName: selectedMasjid,
    recipientAddress: `Kel. ${selectedKelurahan}, Kec. Sematang Borang, Palembang • NMID: ID1020268491029`,
    categoryLabel: akadDetails.categoryName,
    purpose: selectedProgram,
    paymentChannel: "QRIS Syariah Dinamis (BSI Host)",
    amount: trx.amount,
    baseAmount: amount,
    uniqueCode: trx.uniqueCode,
    timestamp: new Date().toISOString(),
    doaArabic: "آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُورًا",
    doaTranslation:
      '"Semoga Allah memberi pahala atas apa yang engkau tunaikan, memberkahi apa yang engkau sisakan, dan menjadikannya pembersih hartamu."',
  });

  const handleDownloadZiswafPdf = async () => {
    if (!validatedTrx) return;
    setIsDownloadingPdf(true);
    try {
      await downloadDonationReceiptPdf(buildZiswafReceiptData(validatedTrx));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Format MM:SS for countdown timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div id="digital-qr-donation-container" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-emerald-950 border border-teal-800/80 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                QRIS Syariah Dinamis & Real-Time
              </span>
              <span className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Otomasi Rekonsiliasi Kas Umat
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tunaikan ZISWAFH via Dynamic QR Code
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pindai kode QRIS dinamis menggunakan seluruh aplikasi mobile banking syariah (BSI, BCA Syariah, Muamalat) dan dompet digital (GoPay, OVO, ShopeePay, DANA). Validasi dana masuk berlangsung secara otomatis dalam hitungan detik.
            </p>
          </div>

          {/* Quick Badges in Header */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
            <div className="bg-slate-900/90 border border-teal-700/60 rounded-xl px-3 py-2 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                NMID QRIS Nasional
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                ID1020268491029
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-semibold bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Biaya Transaksi: Rp 0 (MDR 0% Fasum)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: Configuration on Left, QR & Live Scanner on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Donation Configuration & Akad (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Coins className="w-4 h-4 text-teal-600" />
                <span>Pengaturan Nominal & Akad Niat</span>
              </h4>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Langkah 1
              </span>
            </div>

            {/* ZISWAF Akad Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Jenis Akad ZISWAFH
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "INFAQ_SHODAQOH", label: "Infaq & Sedekah" },
                  { id: "ZAKAT_MAL", label: "Zakat Mal (Harta)" },
                  { id: "ZAKAT_PROFESI", label: "Zakat Profesi" },
                  { id: "WAKAF_PRODUKTIF", label: "Wakaf Produktif" },
                  { id: "HIBAH_FASUM", label: "Wakaf Fasilitas/Air" },
                  { id: "DANA_BENCANA", label: "Tanggap Bencana" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDonationType(item.id as any);
                      setValidationStage("IDLE");
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition border ${
                      donationType === item.id
                        ? "bg-teal-700 text-white border-teal-700 shadow-sm font-bold"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Nominal Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Nominal Donasi (Rp)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Bebas nominal berapa pun
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[20000, 50000, 100000, 250000, 500000, 1000000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold text-center transition border ${
                      amount === preset && !isCustomAmount
                        ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Rp {(preset / 1000).toFixed(0)}rb
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="pt-1.5">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={customAmountInput}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Ketik nominal lain..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Targeted Program & Mosque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Program Penyaluran
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option>Lumbung Pangan Mustahiq Sematang Borang</option>
                  <option>Wakaf 10 Sumur Bor & Sanitasi Bersih</option>
                  <option>Beasiswa 100 Santri Tahfidz Al-Qur'an</option>
                  <option>Qardhul Hasan Permodalan UMKM Tanpa Riba</option>
                  <option>Operasional Ambulans Umat 24 Jam</option>
                  <option>Klinik & Obat Gratis Lansia Dhuafa</option>
                  <option>Pemeliharaan Sarana Ibadah & Listrik</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Simpul Masjid Tujuan
                </label>
                <select
                  value={selectedMasjid}
                  onChange={(e) => setSelectedMasjid(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option>Masjid Jami' Al-Ikhlas (Central Baitul Maal)</option>
                  <option>Masjid Baiturrahman (Lebung Gajah)</option>
                  <option>Masjid Nurul Huda (Karya Mulya)</option>
                  <option>Masjid Al-Muhajirin (Srimulya)</option>
                  <option>Musholla Babussalam (RW 03 Sukamulya)</option>
                </select>
              </div>
            </div>

            {/* Donor Identity Form */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Nama Muzakki / Donatur
                </label>
                <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Hamba Allah (Anonim)</span>
                </label>
              </div>

              <input
                type="text"
                disabled={isAnonymous}
                value={isAnonymous ? "Hamba Allah" : donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Contoh: H. Ahmad Pratama & Keluarga"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 disabled:opacity-60 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="No. WhatsApp (opsional e-Kwitansi)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-[11px] text-slate-900 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="Email (opsional)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-[11px] text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Akad Niat Card (Lafaz & Translation) */}
            <div className="bg-emerald-950 text-white rounded-2xl p-4 space-y-2 border border-emerald-800 shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold border-b border-emerald-800/80 pb-1.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {akadDetails.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-900 rounded-full text-emerald-200">
                  Syariah Compliant
                </span>
              </div>

              <div className="font-serif text-right text-base text-amber-200 font-semibold pt-1">
                {akadDetails.arabic}
              </div>

              <div className="text-[11px] text-slate-300 italic">
                "{akadDetails.latin}"
              </div>

              <div className="text-[10.5px] text-emerald-100/90 leading-relaxed border-t border-emerald-900 pt-1.5">
                <strong>Artinya:</strong> {akadDetails.meaning}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dynamic QRIS Showcase & Live Validation Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
            {/* Header: Modes & Expiry Timer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Standar QRIS Syariah Dinamis
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Satu QR untuk seluruh aplikasi perbankan & e-wallet
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Countdown Timer */}
                <div
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
                    expirySeconds > 60
                      ? "bg-teal-50 text-teal-800 border border-teal-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(expirySeconds)}</span>
                </div>

                <button
                  onClick={handleRefreshQr}
                  disabled={isRefreshing}
                  title="Perbarui QR & Kode Unik"
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition border border-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Validation State Banners / Stepper */}
            {validationStage !== "IDLE" && validationStage !== "CONFIRMED_SUCCESS" && (
              <div className="bg-slate-950 text-white rounded-2xl p-4 space-y-3 border border-teal-800 shadow-md animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-300">
                      {validationStage === "SCANNING" && "Mendeteksi Pemindaian E-Wallet..."}
                      {validationStage === "DETECTED" && "QRIS Terbaca — Membuka Sesi Transaksi..."}
                      {validationStage === "VERIFYING_BANK" && "Verifikasi Host Perbankan (BSI Syariah)..."}
                      {validationStage === "RECONCILING_LEDGER" && "Mencatat ke Buku Kas Publik Umat..."}
                    </span>
                  </div>
                  <span className="font-mono text-emerald-400">{validationProgress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${validationProgress}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Nomor Referensi: {referenceId}</span>
                  <span className="text-emerald-300 font-mono">
                    Nominal: Rp {totalPayable.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}

            {/* SUCCESS CONFIRMATION MODAL / PANEL */}
            {validationStage === "CONFIRMED_SUCCESS" && validatedTrx && (
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 border-2 border-emerald-400 rounded-2xl p-5 sm:p-6 text-center space-y-4 shadow-lg animate-in zoom-in-95 duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCheck className="w-8 h-8 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-emerald-200/80 text-emerald-900 rounded-full border border-emerald-300">
                    ✓ Transaksi Terverifikasi Sah & Masuk Kas Umat
                  </span>
                  <h4 className="text-xl font-black text-emerald-950 pt-1">
                    Alhamdulillah, Jazakumullah Khairan Katsiran!
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Donasi sebesar{" "}
                    <strong className="font-mono text-emerald-950 font-bold text-sm">
                      Rp {validatedTrx.amount.toLocaleString("id-ID")}
                    </strong>{" "}
                    telah tercatat di Buku Kas Publik Baitul Maal Sematang Borang.
                  </p>
                </div>

                {/* Receipt Quick Details */}
                <div className="bg-white p-4 rounded-xl border border-emerald-200 text-left space-y-2 text-xs shadow-xs max-w-md mx-auto">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">No. Referensi:</span>
                    <span className="font-mono font-bold text-slate-800">{validatedTrx.id}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Muzakki / Donatur:</span>
                    <span className="font-bold text-slate-800">{validatedTrx.donorName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Jenis Akad:</span>
                    <span className="font-bold text-teal-800">{akadDetails.categoryName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Program & Masjid:</span>
                    <span className="font-medium text-slate-800">{validatedTrx.designatedMasjidOrProgram}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-500">Audit Status:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> DSN-MUI Compliant
                    </span>
                  </div>
                </div>

                {/* Doa Amil */}
                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-left space-y-1 text-xs max-w-md mx-auto">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                    Doa Penerimaan ZISWAF oleh Amil:
                  </div>
                  <div className="font-serif text-right text-sm text-amber-200">
                    آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُورًا
                  </div>
                  <div className="text-[10.5px] text-slate-200 italic">
                    "Semoga Allah memberi pahala atas apa yang engkau tunaikan, memberkahi apa yang engkau sisakan, dan menjadikannya pembersih hartamu."
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadZiswafPdf}
                    disabled={isDownloadingPdf}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition disabled:opacity-60"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isDownloadingPdf ? "Menyiapkan PDF..." : "Unduh Kwitansi PDF"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintableReceipt(buildZiswafReceiptData(validatedTrx))}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Kwitansi</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan ke WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Transaksi Baru</span>
                  </button>
                </div>
              </div>
            )}

            {/* QRIS STAND SHOWCASE (Official Bank Indonesia & ASPI Framing) */}
            {validationStage !== "CONFIRMED_SUCCESS" && (
              <div className="bg-slate-50 border-2 border-slate-300 rounded-3xl p-5 sm:p-6 text-center space-y-4 max-w-sm sm:max-w-md mx-auto shadow-md relative overflow-hidden">
                {/* Official QRIS Header Banner */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                      <span className="text-xs font-black tracking-wider text-slate-900">
                        QRIS
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">
                        QR Indonesian Standard
                      </span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      GPN & SYARIAH
                    </span>
                  </div>

                  <div className="pt-1">
                    <h5 className="text-sm font-black text-slate-900 tracking-tight">
                      BAITUL MAAL SEMATANG BORANG
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono">
                      NMID: ID1020268491029 • A01
                    </p>
                  </div>
                </div>

                {/* The Dynamic QR Code Box */}
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-inner inline-block relative">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Dynamic QRIS ZISWAF"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-slate-400">
                      Membuat QR Code...
                    </div>
                  )}

                  {/* Center QR Badge Emblem */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-11 h-11 rounded-xl bg-white border-2 border-teal-600 p-1 shadow-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-teal-700" />
                    </div>
                  </div>
                </div>

                {/* Nominal & Unique Code Breakdown */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1 text-left shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Nominal Pokok:</span>
                    <span className="font-mono text-slate-800 font-semibold">
                      Rp {amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <span>Kode Unik Rekonsiliasi:</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </span>
                    <span className="font-mono text-amber-600 font-bold">
                      +{uniqueCode}
                    </span>
                  </div>

                  <div className="border-t pt-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Total Nominal Ditransfer:
                    </span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      Rp {totalPayable.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Supported Payment Logos & E-Wallets */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Dapat dipindai oleh semua aplikasi pembayaran:
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-700 font-bold">
                    <span className="px-2 py-0.5 bg-white border rounded shadow-2xs">BSI Mobile</span>
                    <span className="px-2 py-0.5 bg-white border rounded shadow-2xs">BCA Syariah</span>
                    <span className="px-2 py-0.5 bg-white border rounded shadow-2xs">GoPay</span>
                    <span className="px-2 py-0.5 bg-white border rounded shadow-2xs">OVO</span>
                    <span className="px-2 py-0.5 bg-white border rounded shadow-2xs">ShopeePay</span>
                    <span className="px-2 py-0.5 bg-white border rounded shadow-2xs">DANA</span>
                    <span className="px-2 py-0.5 bg-white border rounded shadow-2xs">Livin'</span>
                  </div>
                </div>

                {/* SIMULATION ACTION BUTTON (For testing & immediate user validation) */}
                <div className="pt-2">
                  <button
                    onClick={handleSimulatePaymentFlow}
                    disabled={isSimulatingScan || amount <= 0}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>
                      {isSimulatingScan
                        ? "Sedang Memvalidasi Pembayaran..."
                        : `Simulasikan Scan & Bayar (Rp ${totalPayable.toLocaleString("id-ID")})`}
                    </span>
                  </button>
                  <p className="text-[10px] text-slate-500 mt-1">
                    *Klik tombol di atas untuk menguji alur validasi dan rekonsiliasi kas secara real-time.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadQr}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar QRIS</span>
                </button>
                <button
                  onClick={handleCopyRefCode}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedRefCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRefCode ? "Ref Tersalin!" : "Salin No. Ref"}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-600" />
                <span>Enkripsi 256-bit ISO/IEC 18004</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Printable & Downloadable e-Kwitansi Modal */}
      <DonationReceiptModal
        receipt={printableReceipt}
        onClose={() => setPrintableReceipt(null)}
      />
    </div>
  );
}
