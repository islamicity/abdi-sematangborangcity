import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import {
  QrCode,
  Building,
  Heart,
  Share2,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Coins,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  RotateCcw,
  Receipt,
  Eye,
  Sliders,
  DollarSign,
  Smartphone,
  ExternalLink,
  ChevronDown,
  User,
  Clock,
  Search,
  FileText,
} from "lucide-react";
import DonationReceiptModal from "./DonationReceiptModal";
import {
  DonationReceiptData,
  downloadDonationReceiptPdf,
} from "../utils/donationReceiptPdf";

// Pre-defined Verified Mosques in Sematang Borang
export interface MosqueItem {
  id: string;
  name: string;
  kelurahan: string;
  address: string;
  dkmRegistrationId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  monthlyTarget: number;
  currentCollected: number;
  activeCampaigns: string[];
}

export const SEMATANG_BORANG_MOSQUES: MosqueItem[] = [
  {
    id: "msj-01",
    name: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya",
    address: "Jl. Sematang Borang Raya No. 45, RT 12 / RW 04",
    dkmRegistrationId: "DKM-SB-01/SKM/2026",
    bankName: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7123-456-789",
    accountHolder: "DKM Masjid Jami' Al-Ikhlas",
    monthlyTarget: 25000000,
    currentCollected: 19850000,
    activeCampaigns: ["Operasional & Listrik Masjid", "Lumbung Pangan Dhuafa", "Renovasi Sound & Karpet"],
  },
  {
    id: "msj-02",
    name: "Masjid Baiturrahman",
    kelurahan: "Lebung Gajah",
    address: "Kompleks Griya Lebung Gajah Blok C No. 01",
    dkmRegistrationId: "DKM-SB-02/LBG/2026",
    bankName: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7234-567-890",
    accountHolder: "Masjid Baiturrahman Lebung Gajah",
    monthlyTarget: 20000000,
    currentCollected: 16400000,
    activeCampaigns: ["Operasional Masjid", "Santunan Anak Yatim & Janda Lansia", "Ambulans Umat Gratis"],
  },
  {
    id: "msj-03",
    name: "Masjid Nurul Huda",
    kelurahan: "Karya Mulya",
    address: "Jl. Karya Bersama RW 04, Karya Mulya",
    dkmRegistrationId: "DKM-SB-03/KRM/2026",
    bankName: "Bank Muamalat Indonesia",
    accountNumber: "345-001-2345",
    accountHolder: "DKM Nurul Huda Karya Mulya",
    monthlyTarget: 18000000,
    currentCollected: 13750000,
    activeCampaigns: ["Operasional Masjid", "Dapur Berkah Makan Siang Jumat", "Honor Guru Ngaji TPA"],
  },
  {
    id: "msj-04",
    name: "Masjid Al-Muhajirin",
    kelurahan: "Srimulya",
    address: "Perumahan Srimulya Indah Blok A1 No. 12",
    dkmRegistrationId: "DKM-SB-04/SRM/2026",
    bankName: "Bank Sumsel Babel Syariah",
    accountNumber: "801-09-12345",
    accountHolder: "Masjid Al-Muhajirin Srimulya",
    monthlyTarget: 15000000,
    currentCollected: 12200000,
    activeCampaigns: ["Operasional Masjid", "Pengadaan AC & Karpet Lembut", "Beasiswa 10 Yatim Penghafal Quran"],
  },
  {
    id: "msj-05",
    name: "Masjid Darussalam",
    kelurahan: "Sako Raya",
    address: "Jl. Musi Raya Timur Blok E No. 08",
    dkmRegistrationId: "DKM-SB-05/SKR/2026",
    bankName: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7345-678-901",
    accountHolder: "DKM Darussalam Sako Raya",
    monthlyTarget: 22000000,
    currentCollected: 18100000,
    activeCampaigns: ["Operasional Masjid", "Perluasan Area Wudhu & Parkir", "Tanggap Bencana Kebakaran/Banjir"],
  },
];

export interface DonationRecord {
  id: string;
  mosqueId: string;
  mosqueName: string;
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  purpose: string;
  timestamp: string;
  transactionRef: string;
  channel: string;
}

const INITIAL_TRANSPARENT_LEDGER: DonationRecord[] = [
  {
    id: "trx-901",
    mosqueId: "msj-01",
    mosqueName: "Masjid Jami' Al-Ikhlas",
    donorName: "H. Ridwan Sanjaya",
    isAnonymous: false,
    amount: 250000,
    purpose: "Operasional & Listrik Masjid",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    transactionRef: "QRIS-MSJ-881920",
    channel: "BSI Mobile",
  },
  {
    id: "trx-902",
    mosqueId: "msj-01",
    mosqueName: "Masjid Jami' Al-Ikhlas",
    donorName: "Hamba Allah",
    isAnonymous: true,
    amount: 50000,
    purpose: "Lumbung Pangan Dhuafa",
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    transactionRef: "QRIS-MSJ-881921",
    channel: "GoPay QRIS",
  },
  {
    id: "trx-903",
    mosqueId: "msj-02",
    mosqueName: "Masjid Baiturrahman",
    donorName: "dr. Muhammad Hidayatullah",
    isAnonymous: false,
    amount: 500000,
    purpose: "Santunan Anak Yatim & Janda Lansia",
    timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    transactionRef: "QRIS-MSJ-881922",
    channel: "Muamalat Mobile",
  },
  {
    id: "trx-904",
    mosqueId: "msj-03",
    mosqueName: "Masjid Nurul Huda",
    donorName: "Ibu Fatimah Zahra",
    isAnonymous: false,
    amount: 100000,
    purpose: "Dapur Berkah Makan Siang Jumat",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    transactionRef: "QRIS-MSJ-881923",
    channel: "BCA Mobile QRIS",
  },
  {
    id: "trx-905",
    mosqueId: "msj-01",
    mosqueName: "Masjid Jami' Al-Ikhlas",
    donorName: "Hamba Allah",
    isAnonymous: true,
    amount: 20000,
    purpose: "Infaq Subuh Berkah",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    transactionRef: "QRIS-MSJ-881924",
    channel: "Livin by Mandiri",
  },
];

const INFAQ_PURPOSES = [
  { id: "operasional", label: "Operasional, Listrik & Air Masjid", defaultDesc: "Menjaga kenyamanan musholla, AC, sound system, dan air wudhu bersih." },
  { id: "jumat_berkah", label: "Dapur Berkah & Makan Siang Jamaah", defaultDesc: "Menyediakan paket nasi & air mineral untuk jamaah shalat Jumat dan dhuafa." },
  { id: "yatim_dhuafa", label: "Santunan Anak Yatim & Janda Lansia", defaultDesc: "Bantuan biaya hidup, sekolah, dan sembako bagi mustahiq sekitar masjid." },
  { id: "renovasi", label: "Renovasi Sarana Prasarana & Karpet", defaultDesc: "Peremajaan karpet shalat, perbaikan atap bocor, dan pengecatan masjid." },
  { id: "ambulans", label: "Layanan Ambulans & Mobil Jenazah Gratis", defaultDesc: "Operasional bahan bakar & perawatan armada ambulans siaga 24 jam." },
  { id: "guru_tpa", label: "Honor Guru Mengaji & Beasiswa Santri", defaultDesc: "Kesejahteraan asatidz TPA dan beasiswa anak kurang mampu belajar Al-Qur'an." },
];

const PRESET_AMOUNTS = [
  { value: 10000, label: "Rp 10.000", tag: "Infaq Subuh" },
  { value: 25000, label: "Rp 25.000", tag: "Sedekah Berkah" },
  { value: 50000, label: "Rp 50.000", tag: "Populer" },
  { value: 100000, label: "Rp 100.000", tag: "Operasional" },
  { value: 250000, label: "Rp 250.000", tag: "Santunan" },
  { value: 500000, label: "Rp 500.000", tag: "Wakaf Sarpras" },
];

export default function MosqueDonationQrGenerator() {
  // Mosque Selection State
  const [selectedMosqueId, setSelectedMosqueId] = useState<string>("msj-01");
  const [customMosqueName, setCustomMosqueName] = useState<string>("");
  const [customKelurahan, setCustomKelurahan] = useState<string>("Sukamulya");
  const [isCustomMosque, setIsCustomMosque] = useState<boolean>(false);

  // Infaq Configuration State
  const [selectedPurpose, setSelectedPurpose] = useState<string>("Operasional, Listrik & Air Masjid");
  const [infaqMode, setInfaqMode] = useState<"fixed" | "open">("fixed");
  const [amount, setAmount] = useState<number>(50000);
  const [customAmountInput, setCustomAmountInput] = useState<string>("50000");
  const [donorName, setDonorName] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donorNotes, setDonorNotes] = useState<string>("Bismillah, semoga berkah bagi kemakmuran masjid.");

  // QR Code Generation State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showStandeePreview, setShowStandeePreview] = useState<boolean>(false);

  // Simulation & Receipt State
  const [ledger, setLedger] = useState<DonationRecord[]>(() => {
    try {
      const stored = localStorage.getItem("mosque_donation_transparent_ledger");
      return stored ? JSON.parse(stored) : INITIAL_TRANSPARENT_LEDGER;
    } catch {
      return INITIAL_TRANSPARENT_LEDGER;
    }
  });

  const [simulatedReceipt, setSimulatedReceipt] = useState<DonationRecord | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);
  const [printableReceiptData, setPrintableReceiptData] = useState<DonationReceiptData | null>(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);

  // Selected Mosque Object
  const currentMosque = useMemo(() => {
    if (isCustomMosque) {
      return {
        id: "msj-custom",
        name: customMosqueName.trim() || "Masjid Jami' Sematang Borang",
        kelurahan: customKelurahan,
        address: `Kecamatan Sematang Borang, Kota Palembang`,
        dkmRegistrationId: `DKM-SB-KUSTOM/2026`,
        bankName: "Bank Syariah Indonesia (BSI)",
        accountNumber: "7700-1122-33",
        accountHolder: `DKM ${customMosqueName || "Masjid Mandiri"}`,
        monthlyTarget: 15000000,
        currentCollected: 8500000,
        activeCampaigns: ["Operasional Masjid", "Infaq Jumat Berkah"],
      };
    }
    return (
      SEMATANG_BORANG_MOSQUES.find((m) => m.id === selectedMosqueId) ||
      SEMATANG_BORANG_MOSQUES[0]
    );
  }, [isCustomMosque, selectedMosqueId, customMosqueName, customKelurahan]);

  // Generate QR Code data whenever parameters change
  const generateMosqueQrCode = async () => {
    setIsGenerating(true);
    try {
      const finalAmount = infaqMode === "fixed" ? amount : 0;
      const qrisPayload = JSON.stringify({
        standard: "QRIS.ID",
        ver: "01",
        merchantType: "MOSQUE_RELIGIOUS_INFAQ",
        merchantName: currentMosque.name,
        merchantCity: "PALEMBANG",
        postalCode: "30128",
        dkmId: currentMosque.dkmRegistrationId,
        allocation: selectedPurpose,
        nominal: finalAmount > 0 ? finalAmount : "OPEN_NOMINAL",
        fee: 0,
        currency: "IDR",
        note: donorNotes.trim() || "Infaq Digital Masjid",
        validThrough: "2026-12-31T23:59:59Z",
        auditVerificationUrl: `https://abdi.sematangborangcity.cloud/infaq-audit/${currentMosque.id}`,
      });

      const url = await QRCode.toDataURL(qrisPayload, {
        width: 420,
        margin: 2,
        color: {
          dark: "#022c22", // Deep emerald
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });

      setQrCodeDataUrl(url);
    } catch (err) {
      console.error("Error generating Mosque QR Code:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateMosqueQrCode();
  }, [currentMosque, selectedPurpose, infaqMode, amount, donorNotes]);

  // Handle donation simulation for transparency test
  const handleSimulatePayment = () => {
    setIsSimulatingPayment(true);
    const finalAmount = infaqMode === "fixed" ? amount : (Number(customAmountInput) || 50000);
    const effectiveDonor = isAnonymous ? "Hamba Allah" : (donorName.trim() || "Jamaah Peduli Masjid");

    setTimeout(() => {
      const newRecord: DonationRecord = {
        id: `trx-${Date.now()}`,
        mosqueId: currentMosque.id,
        mosqueName: currentMosque.name,
        donorName: effectiveDonor,
        isAnonymous,
        amount: finalAmount,
        purpose: selectedPurpose,
        timestamp: new Date().toISOString(),
        transactionRef: `QRIS-MSJ-${Math.floor(100000 + Math.random() * 900000)}`,
        channel: "BSI Mobile QRIS (Verified)",
      };

      const updatedLedger = [newRecord, ...ledger];
      setLedger(updatedLedger);
      try {
        localStorage.setItem("mosque_donation_transparent_ledger", JSON.stringify(updatedLedger));
      } catch {}

      setSimulatedReceipt(newRecord);
      setIsSimulatingPayment(false);

      // Play chime & burst celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#10b981", "#f59e0b", "#0284c7"],
        });
      } catch {}
    }, 900);
  };

  // Download QR Code PNG
  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `QRIS-Infaq-${currentMosque.name.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Infaq Link / Text
  const handleCopyShare = () => {
    const shareText = `🕌 *QRIS Infaq Digital Transparan Masjid*
*${currentMosque.name} (${currentMosque.kelurahan})*
Nomor Registrasi DKM: ${currentMosque.dkmRegistrationId}

📌 Alokasi Khusus: *${selectedPurpose}*
💰 Nominal: ${infaqMode === "fixed" ? `Rp ${amount.toLocaleString("id-ID")}` : "Nominal Bebas (Bisa diisi via aplikasi bank/e-wallet)"}
💳 Rekening Resmi: ${currentMosque.bankName} - ${currentMosque.accountNumber} a.n. ${currentMosque.accountHolder}

"Siapa yang membangun/memakmurkan masjid karena Allah, maka Allah akan membangunkan untuknya rumah di surga." (HR. Bukhari & Muslim)

Scan QRIS ini langsung di aplikasi BSI Mobile, BCA Mobile, Livin, GoPay, OVO, atau Dana Anda.
Verifikasi Transparansi di abdi.sematangborangcity.cloud/berjamaah`;

    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filter ledger for current mosque
  const mosqueLedger = ledger.filter(
    (l) => l.mosqueId === currentMosque.id || l.mosqueName.toLowerCase() === currentMosque.name.toLowerCase()
  );

  const totalCollectedInLedger = mosqueLedger.reduce((sum, item) => sum + item.amount, 0);
  const targetPct = Math.min(
    100,
    Math.round(((currentMosque.currentCollected + totalCollectedInLedger) / currentMosque.monthlyTarget) * 100)
  );

  // Build standardized e-Kwitansi receipt payload from a Mosque DonationRecord
  const buildReceiptData = (record: DonationRecord): DonationReceiptData => {
    const matchedMosque =
      SEMATANG_BORANG_MOSQUES.find((m) => m.id === record.mosqueId) || currentMosque;
    return {
      receiptNumber: record.transactionRef,
      bankReference: `${record.transactionRef}-${matchedMosque.id.toUpperCase()}`,
      donorName: record.donorName,
      isAnonymous: record.isAnonymous,
      recipientName: record.mosqueName,
      recipientAddress: `${matchedMosque.address}, Kel. ${matchedMosque.kelurahan}`,
      dkmRegistrationId: matchedMosque.dkmRegistrationId,
      bankAccountInfo: `${matchedMosque.bankName} • ${matchedMosque.accountNumber} a.n. ${matchedMosque.accountHolder}`,
      categoryLabel: "Infaq & Sedekah Masjid",
      purpose: record.purpose,
      paymentChannel: record.channel,
      amount: record.amount,
      timestamp: record.timestamp,
      notes: record.id === simulatedReceipt?.id ? donorNotes.trim() : undefined,
      doaTranslation:
        '"Jazaakumullahu khairan katsiran. Semoga infaq ini menjadi saksi kebaikan di akhirat, membersihkan harta, dan menjadi amal jariyah yang terus mengalir."',
    };
  };

  const handleDownloadReceiptPdf = async (record: DonationRecord) => {
    setDownloadingReceiptId(record.id);
    try {
      await downloadDonationReceiptPdf(buildReceiptData(record));
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const handleOpenPrintableReceipt = (record: DonationRecord) => {
    const data = buildReceiptData(record);
    setSimulatedReceipt(null);
    setPrintableReceiptData(data);
  };

  return (
    <div id="mosque-donation-qr-generator" className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-6 sm:p-7 border border-emerald-600/40 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-400/50 text-emerald-200 text-xs font-bold">
              <QrCode className="w-3.5 h-3.5 text-amber-300" />
              <span>GENERATOR QRIS INFAQ MASJID TRANSPARAN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Digitalisasi Infaq &amp; Sedekah Berjamaah
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Fasilitasi jamaah berinfaq mudah, cepat, dan 100% transparan melalui QRIS standar Bank Indonesia.
              Dilengkapi pencatatan buku kas digital realtime, alokasi program khusus, dan template cetak standee kotak amal masjid.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-slate-900/90 border border-emerald-700/60 rounded-2xl p-4 flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Standar QRIS Nasional &amp; DKM Terverifikasi</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>0% Potongan Biaya Admin (Nir-Riba)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-teal-300">
              <Eye className="w-4 h-4 text-teal-400" />
              <span>Buku Kas &amp; Alokasi Terbuka untuk Jamaah</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: CONFIGURATION & LIVE QR PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: MOSQUE SELECTOR & INFAQ CONFIGURATION (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Pilih Masjid Sematang Borang */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Pilih Masjid Tujuan Infaq
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomMosque(!isCustomMosque)}
                className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold"
              >
                {isCustomMosque ? "Kembali ke Daftar Masjid Resmi" : "+ Input Masjid Lainnya"}
              </button>
            </div>

            {!isCustomMosque ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SEMATANG_BORANG_MOSQUES.map((m) => {
                  const isSelected = m.id === selectedMosqueId;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMosqueId(m.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? "bg-emerald-950/80 border-emerald-400 shadow-md ring-1 ring-emerald-400"
                          : "bg-slate-800/60 border-slate-700/80 hover:border-slate-600 text-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-white text-sm truncate">{m.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300 font-mono">
                          {m.kelurahan}
                        </span>
                        <span className="truncate">{m.dkmRegistrationId}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    Nama Masjid / Musholla Kustom:
                  </label>
                  <input
                    type="text"
                    value={customMosqueName}
                    onChange={(e) => setCustomMosqueName(e.target.value)}
                    placeholder="Contoh: Masjid Nurul Iman"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">
                    Kelurahan / Wilayah:
                  </label>
                  <select
                    value={customKelurahan}
                    onChange={(e) => setCustomKelurahan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Sukamulya">Sukamulya</option>
                    <option value="Lebung Gajah">Lebung Gajah</option>
                    <option value="Karya Mulya">Karya Mulya</option>
                    <option value="Srimulya">Srimulya</option>
                    <option value="Sako Raya">Sako Raya</option>
                  </select>
                </div>
              </div>
            )}

            {/* Selected Mosque Details Strip */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Rekening Giro Resmi DKM (Auto-Verification):
                </span>
                <span className="font-bold text-emerald-300 text-xs">
                  {currentMosque.bankName} - {currentMosque.accountNumber}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  a.n. {currentMosque.accountHolder}
                </span>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Target Infaq Bulan Ini:</span>
                <span className="font-mono font-bold text-amber-300 text-xs">
                  Rp {currentMosque.monthlyTarget.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-emerald-400 block font-semibold">
                  Tercapai {targetPct}%
                </span>
              </div>
            </div>
          </div>

          {/* 2. Pilih Alokasi Program Infaq */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-white space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Tentukan Alokasi Khusus Infaq
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INFAQ_PURPOSES.map((purp) => {
                const isSelected = selectedPurpose === purp.label;
                return (
                  <div
                    key={purp.id}
                    onClick={() => setSelectedPurpose(purp.label)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-rose-950/40 border-rose-500 text-white font-bold ring-1 ring-rose-500/50"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span>{purp.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal mt-1 leading-snug">
                      {purp.defaultDesc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Tentukan Nominal & Konfigurasi QRIS */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Nominal &amp; Opsi Nominal Bebas
                </h3>
              </div>

              {/* Toggle Fixed vs Open */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setInfaqMode("fixed")}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    infaqMode === "fixed"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Nominal Tetap
                </button>
                <button
                  type="button"
                  onClick={() => setInfaqMode("open")}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    infaqMode === "open"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bebas / Terbuka
                </button>
              </div>
            </div>

            {infaqMode === "fixed" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((p) => {
                    const isSelected = amount === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          setAmount(p.value);
                          setCustomAmountInput(String(p.value));
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md"
                            : "bg-slate-800 hover:bg-slate-755 text-slate-200 border-slate-700"
                        }`}
                      >
                        <span>{p.label}</span>
                        <span className={`text-[10px] font-normal ${isSelected ? "text-slate-900 font-semibold" : "text-amber-300"}`}>
                          {p.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Atau Masukkan Nominal Kustom (Rp):
                  </label>
                  <input
                    type="number"
                    value={customAmountInput}
                    onChange={(e) => {
                      setCustomAmountInput(e.target.value);
                      const parsed = parseInt(e.target.value, 10);
                      if (!isNaN(parsed) && parsed > 0) {
                        setAmount(parsed);
                      }
                    }}
                    placeholder="Contoh: 150000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-xs text-emerald-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Mode QRIS Nominal Terbuka (Open Amount)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Jamaah dapat mengetikkan nominal infaq sesuka hati di layar aplikasi m-banking atau e-wallet masing-masing saat memindai QRIS ini. Sangat cocok ditempel pada kotak amal masjid.
                </p>
              </div>
            )}

            {/* Optional Donor & Note Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Nama Munfiq (Opsional):
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    disabled={isAnonymous}
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Contoh: dr. Muhammad Hidayat"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Sembunyikan nama (Tampilkan sebagai Hamba Allah)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Doa / Hajat / Catatan (Opsional):
                </label>
                <input
                  type="text"
                  value={donorNotes}
                  onChange={(e) => setDonorNotes(e.target.value)}
                  placeholder="Contoh: Mohon doa kesembuhan orang tua"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE QRIS STANDEE & ACTIONS (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* THE OFFICIAL QRIS MOSQUE STANDEE CARD */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/60 shadow-2xl text-white space-y-4 relative overflow-hidden">
            {/* Top QRIS Header Stamp */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-xs tracking-wider">
                  QRIS
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  PEMBAYARAN DIGITAL
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DKM VERIFIED</span>
              </div>
            </div>

            {/* Mosque Identity on Card */}
            <div className="text-center space-y-1">
              <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                {currentMosque.name}
              </h4>
              <p className="text-[11px] text-emerald-300 font-medium">
                Kelurahan {currentMosque.kelurahan}, Sematang Borang
              </p>
              <div className="inline-block px-2.5 py-0.5 bg-slate-800/90 text-amber-300 rounded-full text-[10px] font-mono border border-slate-700">
                Alokasi: {selectedPurpose}
              </div>
            </div>

            {/* THE QR CODE CANVAS CONTAINER */}
            <div className="bg-white p-4 rounded-2xl shadow-inner flex flex-col items-center justify-center relative group">
              {isGenerating ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-700 space-y-2">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold">Menghasilkan QRIS Masjid...</span>
                </div>
              ) : qrCodeDataUrl ? (
                <div className="relative">
                  <img
                    src={qrCodeDataUrl}
                    alt="QRIS Infaq Masjid"
                    className="w-60 h-60 sm:w-64 sm:h-64 object-contain rounded-lg"
                  />
                  {/* Center QR Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-1 rounded-full shadow-md border-2 border-emerald-600">
                      <Building className="w-6 h-6 text-emerald-700" />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Supported payment networks banner below QR */}
              <div className="mt-3 pt-2 border-t border-slate-200 w-full flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                <span>BSI</span> • <span>BCA</span> • <span>Mandiri</span> • <span>GoPay</span> • <span>OVO</span> • <span>Dana</span>
              </div>
            </div>

            {/* Amount Summary in Standee */}
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Nominal Infaq / Sedekah:
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {infaqMode === "fixed" ? (
                  `Rp ${amount.toLocaleString("id-ID")}`
                ) : (
                  <span className="text-base text-emerald-300 font-sans">
                    Nominal Bebas (Input di m-Banking)
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block italic">
                NMID: ID10260{currentMosque.dkmRegistrationId.replace(/[^0-9]/g, "").padEnd(7, "0")}
              </span>
            </div>

            {/* Hadits Quote on Standee */}
            <p className="text-[10px] text-emerald-200/90 text-center italic font-serif leading-relaxed px-2">
              &ldquo;Siapa yang membangun/memakmurkan masjid karena Allah, maka Allah akan membangunkan untuknya istana di surga.&rdquo; (HR. Bukhari)
            </p>

            {/* ACTION BUTTONS TOOLBAR */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStandeePreview(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Standee A4</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Tersalin!" : "Salin Info"}</span>
                </button>

                {/* Simulate Payment Test Button */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulatingPayment}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                  title="Simulasi scan & bayar QRIS untuk menguji transparansi buku kas digital"
                >
                  {isSimulatingPayment ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Receipt className="w-3.5 h-3.5" />
                  )}
                  <span>Simulasi Bayar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFIED DONATION RECEIPT MODAL (E-KWITANSI TRANSPARAN) */}
      {simulatedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-7 max-w-md w-full border-2 border-emerald-500/80 shadow-2xl text-white space-y-4 relative">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-400/50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                ALHAMDULILLAH • INFAQ DIGITAL TERVERIFIKASI
              </span>
              <h3 className="text-lg font-black text-white">e-Kwitansi Sahabat Masjid</h3>
              <p className="text-xs text-slate-400">
                Tercatat resmi dalam buku kas publik {simulatedReceipt.mosqueName}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">No. Transaksi:</span>
                <span className="text-amber-300 font-bold">{simulatedReceipt.transactionRef}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">Nama Munfiq:</span>
                <span className="text-white font-bold">{simulatedReceipt.donorName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">Masjid Tujuan:</span>
                <span className="text-emerald-300 font-bold">{simulatedReceipt.mosqueName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">Alokasi Khusus:</span>
                <span className="text-slate-200">{simulatedReceipt.purpose}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-400">Kanal QRIS:</span>
                <span className="text-teal-300">{simulatedReceipt.channel}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm font-sans">
                <span className="text-slate-300 font-semibold">Total Infaq:</span>
                <span className="text-amber-300 font-black text-base font-mono">
                  Rp {simulatedReceipt.amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center text-xs text-emerald-200 italic font-serif">
              &ldquo;Jazaakumullahu khairan katsiran. Semoga infaq ini menjadi saksi kebaikan di akhirat dan pelindung dari marabahaya.&rdquo;
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDownloadReceiptPdf(simulatedReceipt)}
                disabled={downloadingReceiptId === simulatedReceipt.id}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {downloadingReceiptId === simulatedReceipt.id
                    ? "Membuat PDF..."
                    : "Unduh PDF"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenPrintableReceipt(simulatedReceipt)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kwitansi</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSimulatedReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Tutup &amp; Lihat Buku Kas Terbuka
            </button>
          </div>
        </div>
      )}

      {/* FULL A4 PRINTABLE STANDEE MODAL */}
      {showStandeePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Pratinjau Standee Meja / Kotak Amal A4
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStandeePreview(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1 bg-slate-100 rounded-lg"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Print Area Preview */}
            <div id="printable-standee-card" className="border-4 border-emerald-800 rounded-2xl p-6 text-center space-y-3 bg-gradient-to-b from-emerald-50/50 to-white">
              <div className="bg-red-600 text-white font-black px-3 py-1 rounded inline-block text-xs tracking-wider">
                QRIS • STANDAR PEMBAYARAN NASIONAL
              </div>

              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-emerald-950">{currentMosque.name}</h2>
                <p className="text-xs text-slate-600 font-medium">
                  {currentMosque.address}
                </p>
                <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] mt-1">
                  Program: {selectedPurpose}
                </div>
              </div>

              {/* QR Image */}
              <div className="py-2 flex justify-center">
                <img
                  src={qrCodeDataUrl}
                  alt="QRIS Print"
                  className="w-56 h-56 object-contain border-2 border-emerald-200 rounded-xl p-2 bg-white shadow-sm"
                />
              </div>

              <div className="text-lg font-black text-emerald-900 font-mono">
                {infaqMode === "fixed" ? (
                  `Rp ${amount.toLocaleString("id-ID")}`
                ) : (
                  "Nominal Bebas (Sesuai Keikhlasan Hati)"
                )}
              </div>

              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                <p className="font-bold text-slate-800">
                  Dapat dipindai melalui BSI Mobile, BCA Mobile, Livin, GoPay, OVO, Dana, LinkAja
                </p>
                <p className="italic font-serif text-slate-600">
                  &ldquo;Perumpamaan orang yang menafkahkan hartanya di jalan Allah serupa dengan sebutir benih yang menumbuhkan tujuh bulir, pada tiap bulir seratus biji.&rdquo; (QS. Al-Baqarah: 261)
                </p>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 font-mono">
                DKM Registrasi: {currentMosque.dkmRegistrationId} • Rekening: {currentMosque.bankName} {currentMosque.accountNumber}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Standee Sekarang</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition"
              >
                Unduh Gambar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSPARENT DIGITAL INFAQ LEDGER (BUKU KAS DIGITAL TERBUKA) */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 text-white space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Buku Kas Digital &amp; Transparansi Infaq Publik
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Setiap rupiah yang masuk melalui QRIS tercatat otomatis dan dapat dipantau oleh seluruh jamaah demi menjaga amanah umat.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Total Masuk Tercatat:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              Rp {(currentMosque.currentCollected + totalCollectedInLedger).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Progress Bar towards Mosque Monthly Budget */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-850">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold">
              Progres Anggaran Kemakmuran {currentMosque.name}
            </span>
            <span className="font-mono text-emerald-300 font-bold">
              {targetPct}% dari Target Rp {currentMosque.monthlyTarget.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${targetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Sisa Kebutuhan: Rp {Math.max(0, currentMosque.monthlyTarget - (currentMosque.currentCollected + totalCollectedInLedger)).toLocaleString("id-ID")}</span>
            <span className="text-emerald-400 font-medium">Status: Kas Sehat &amp; Berkelanjutan</span>
          </div>
        </div>

        {/* Recent Transparent Transactions Feed */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              Transaksi Terkini (Masuk via QRIS)
            </span>
            <span>{mosqueLedger.length} Infaq Terdata</span>
          </div>

          <div className="space-y-2">
            {mosqueLedger.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/60 flex items-center justify-center font-bold text-xs shrink-0">
                    <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.donorName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                        {item.channel}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-300 block">
                      Alokasi: {item.purpose}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="font-mono font-bold text-amber-300 text-sm block">
                      +Rp {item.amount.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • Ref: {item.transactionRef}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadReceiptPdf(item)}
                      disabled={downloadingReceiptId === item.id}
                      title="Unduh Kwitansi PDF"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-[11px] font-bold transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{downloadingReceiptId === item.id ? "..." : "PDF"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPrintableReceipt(item)}
                      title="Pratinjau & Cetak Kwitansi"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Cetak</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Printable & Downloadable e-Kwitansi Modal */}
      <DonationReceiptModal
        receipt={printableReceiptData}
        onClose={() => setPrintableReceiptData(null)}
      />
    </div>
  );
}
