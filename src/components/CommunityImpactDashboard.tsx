import { useState, useId, useMemo, FormEvent } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Users,
  Award,
  Clock,
  Target,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building,
  Heart,
  Activity,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Download,
  Share2,
  Sliders,
  Edit3,
  Check,
  X,
  Stethoscope,
  ShoppingBag,
  BookOpen,
  Wrench,
  Flame,
  Smartphone,
  Info,
  RefreshCw,
  Plus,
  FileText,
  FileSpreadsheet,
  Printer,
  Coins,
} from "lucide-react";
import { FinancialStewardshipBreakdown } from "./FinancialStewardshipBreakdown";

export interface ServiceCategoryImpact {
  id: string;
  categoryName: string;
  shortLabel: string;
  iconName: "Stethoscope" | "ShoppingBag" | "BookOpen" | "Wrench" | "Heart" | "Building" | "Smartphone";
  colorHex: string;
  bgTailwind: string;
  borderTailwind: string;
  textTailwind: string;
  gradientFrom: string;
  gradientTo: string;
  accumulatedHours: number; // actual verified + logged volunteer hours
  monthlyTargetHours: number; // monthly target goal in hours
  activeVolunteers: number;
  totalSessionsCompleted: number;
  beneficiariesCount: number;
  beneficiariesUnit: string;
  socialMonetaryValueRatePerHour: number; // IDR per hour (SROI)
  keyProjects: {
    name: string;
    location: string;
    hours: number;
    volunteers: number;
    status: "SELESAI" | "BERJALAN";
  }[];
  topContributors: {
    name: string;
    role: string;
    hours: number;
    badge: string;
  }[];
  focusKelurahanShare: {
    sukamulya: number;
    lebungGajah: number;
    karyaMulya: number;
    srimulya: number;
  };
}

export const INITIAL_SERVICE_CATEGORIES_IMPACT: ServiceCategoryImpact[] = [
  {
    id: "cat-medis",
    categoryName: "Layanan Kesehatan & Khidmah Medis Dhuafa",
    shortLabel: "Kesehatan & Medis",
    iconName: "Stethoscope",
    colorHex: "#10b981", // emerald-500
    bgTailwind: "bg-emerald-500/10",
    borderTailwind: "border-emerald-500/30",
    textTailwind: "text-emerald-400",
    gradientFrom: "#10b981",
    gradientTo: "#059669",
    accumulatedHours: 218,
    monthlyTargetHours: 250,
    activeVolunteers: 42,
    totalSessionsCompleted: 14,
    beneficiariesCount: 460,
    beneficiariesUnit: "Pasien Dhuafa & Lansia Terlayani",
    socialMonetaryValueRatePerHour: 75000,
    keyProjects: [
      { name: "Posko Skrining Tensi & Glukosa Sukamulya", location: "Masjid Al-Ikhlas", hours: 48, volunteers: 12, status: "SELESAI" },
      { name: "Layanan Dokter Keliling Lansia Rawa Lebung Gajah", location: "Masjid Baiturrahman", hours: 56, volunteers: 10, status: "BERJALAN" },
      { name: "Pelatihan P3K & Tanggap Darurat Remas", location: "Masjid Al-Muhajirin", hours: 34, volunteers: 8, status: "SELESAI" },
    ],
    topContributors: [
      { name: "dr. Nurul Azizah", role: "Dokter Penanggung Jawab", hours: 38, badge: "Master Khidmah Medis" },
      { name: "Ahmad Rizky Pratama", role: "Perawat Tensi", hours: 32, badge: "Relawan Teladan" },
      { name: "Siti Fatimah Azzahra", role: "Apoteker Herbal & Obat", hours: 26, badge: "Khidmah Prima" },
    ],
    focusKelurahanShare: { sukamulya: 35, lebungGajah: 30, karyaMulya: 20, srimulya: 15 },
  },
  {
    id: "cat-pangan",
    categoryName: "Lumbung Pangan & Dapur Berkah Berbagi",
    shortLabel: "Pangan & Sembako",
    iconName: "ShoppingBag",
    colorHex: "#f59e0b", // amber-500
    bgTailwind: "bg-amber-500/10",
    borderTailwind: "border-amber-500/30",
    textTailwind: "text-amber-400",
    gradientFrom: "#f59e0b",
    gradientTo: "#d97706",
    accumulatedHours: 324,
    monthlyTargetHours: 300,
    activeVolunteers: 65,
    totalSessionsCompleted: 22,
    beneficiariesCount: 920,
    beneficiariesUnit: "Paket Sembako & Nasi Berkah Tersalur",
    socialMonetaryValueRatePerHour: 60000,
    keyProjects: [
      { name: "Distribusi Sembako Berkah Subuh Akbar", location: "Masjid Jami' Al-Ikhlas", hours: 72, volunteers: 20, status: "SELESAI" },
      { name: "Dapur Berkah Jumat 350 Porsi", location: "Masjid Baiturrahman", hours: 96, volunteers: 24, status: "SELESAI" },
      { name: "Lumbung Pangan Darurat Srimulya", location: "Masjid Babussalam", hours: 44, volunteers: 9, status: "BERJALAN" },
    ],
    topContributors: [
      { name: "Hajjah Maryam", role: "Koordinator Dapur Umat", hours: 45, badge: "Pahlawan Lumbung Pangan" },
      { name: "Umar Hamzah", role: "Logistik & Transportasi", hours: 36, badge: "Satgas Siaga Pangan" },
      { name: "Fathimah Zahro", role: "Packaging Sembako", hours: 30, badge: "Relawan Berkah" },
    ],
    focusKelurahanShare: { sukamulya: 40, lebungGajah: 25, karyaMulya: 15, srimulya: 20 },
  },
  {
    id: "cat-pendidikan",
    categoryName: "Pendidikan, Rumah Tahfidz & Literasi Santri",
    shortLabel: "Pendidikan & Tahfidz",
    iconName: "BookOpen",
    colorHex: "#38bdf8", // sky-400
    bgTailwind: "bg-sky-500/10",
    borderTailwind: "border-sky-500/30",
    textTailwind: "text-sky-400",
    gradientFrom: "#38bdf8",
    gradientTo: "#0284c7",
    accumulatedHours: 246,
    monthlyTargetHours: 280,
    activeVolunteers: 38,
    totalSessionsCompleted: 18,
    beneficiariesCount: 195,
    beneficiariesUnit: "Santri & Anak Dhuafa Terbina",
    socialMonetaryValueRatePerHour: 70000,
    keyProjects: [
      { name: "Kelas Tahsin & Hafalan Juz 'Amma Sore", location: "Masjid An-Nur Griya", hours: 80, volunteers: 14, status: "BERJALAN" },
      { name: "Bimbingan Belajar Matematika & IPA Santri", location: "Masjid Baitul Muttaqin", hours: 64, volunteers: 12, status: "BERJALAN" },
      { name: "Pesantren Akhir Pekan Pemuda Sukamulya", location: "Masjid Al-Ikhlas", hours: 42, volunteers: 8, status: "SELESAI" },
    ],
    topContributors: [
      { name: "Ustadz Faisal Basri, Lc.", role: "Kepala Tutor Tahfidz", hours: 44, badge: "Mahaguru Khidmah" },
      { name: "Rahmawati, S.Pd.", role: "Pengajar Bimbel Santri", hours: 38, badge: "Tutor Teladan" },
      { name: "Zaid bin Harits", role: "Mentor Karakter Pemuda", hours: 28, badge: "Pembina Santri" },
    ],
    focusKelurahanShare: { sukamulya: 30, lebungGajah: 20, karyaMulya: 25, srimulya: 25 },
  },
  {
    id: "cat-infrastruktur",
    categoryName: "Infrastruktur, Sanitasi Air Bersih & Bedah Rumah",
    shortLabel: "Infrastruktur & Air Bersih",
    iconName: "Wrench",
    colorHex: "#a855f7", // purple-500
    bgTailwind: "bg-purple-500/10",
    borderTailwind: "border-purple-500/30",
    textTailwind: "text-purple-400",
    gradientFrom: "#a855f7",
    gradientTo: "#7e22ce",
    accumulatedHours: 168,
    monthlyTargetHours: 200,
    activeVolunteers: 32,
    totalSessionsCompleted: 10,
    beneficiariesCount: 24,
    beneficiariesUnit: "Titik Fasum & Rumah Mustahiq Diperbaiki",
    socialMonetaryValueRatePerHour: 80000,
    keyProjects: [
      { name: "Instalasi Filter Air Bersih Rawa", location: "Masjid Al-Falah", hours: 46, volunteers: 10, status: "SELESAI" },
      { name: "Bedah Sanitasi & Atap Rumah Ibu Aminah", location: "Karya Mulya RW 03", hours: 58, volunteers: 12, status: "SELESAI" },
      { name: "Peremajaan Sound System & Listrik Musholla", location: "Musholla Babussalam", hours: 32, volunteers: 6, status: "BERJALAN" },
    ],
    topContributors: [
      { name: "Supriyadi", role: "Koordinator Pertukangan & Sipil", hours: 42, badge: "Arsitek Kebaikan" },
      { name: "Hendra Gunawan", role: "Teknisi Pipa Sanitasi", hours: 36, badge: "Pelopor Air Bersih" },
      { name: "M. Taufik", role: "Instalatur Listrik Masjid", hours: 24, badge: "Relawan Mandiri" },
    ],
    focusKelurahanShare: { sukamulya: 20, lebungGajah: 35, karyaMulya: 30, srimulya: 15 },
  },
  {
    id: "cat-umkm",
    categoryName: "Pemberdayaan Ekonomi & Sertifikasi Halal UMKM",
    shortLabel: "Ekonomi & Halal UMKM",
    iconName: "Building",
    colorHex: "#ec4899", // pink-500
    bgTailwind: "bg-pink-500/10",
    borderTailwind: "border-pink-500/30",
    textTailwind: "text-pink-400",
    gradientFrom: "#ec4899",
    gradientTo: "#be185d",
    accumulatedHours: 152,
    monthlyTargetHours: 170,
    activeVolunteers: 25,
    totalSessionsCompleted: 12,
    beneficiariesCount: 48,
    beneficiariesUnit: "UMKM Jamaah Naik Kelas & Berkah",
    socialMonetaryValueRatePerHour: 85000,
    keyProjects: [
      { name: "Pendampingan Self-Declare Sertifikasi Halal", location: "Aula Masjid Al-Ikhlas", hours: 45, volunteers: 8, status: "BERJALAN" },
      { name: "Workshop Pembukuan Sederhana & QRIS Masjid", location: "Masjid Al-Barokah", hours: 38, volunteers: 7, status: "SELESAI" },
      { name: "Kurasi Produk P2P Syariah Marketplace", location: "Sentra Sukamulya", hours: 35, volunteers: 6, status: "BERJALAN" },
    ],
    topContributors: [
      { name: "Rina Marlina, SE, M.Ak", role: "Auditor Pembukuan Syariah", hours: 36, badge: "Konsultan Halal" },
      { name: "Dimas Suryo", role: "Pendamping Sertifikasi Halal", hours: 30, badge: "Pelopor UMKM Berkah" },
      { name: "Siti Rahayu", role: "Kurator Produk Halal", hours: 22, badge: "Mitra Muamalah" },
    ],
    focusKelurahanShare: { sukamulya: 35, lebungGajah: 25, karyaMulya: 20, srimulya: 20 },
  },
  {
    id: "cat-sosial-jenazah",
    categoryName: "Penyelenggaraan Jenazah, Fardhu Kifayah & Tanggap Darurat",
    shortLabel: "Jenazah & Siaga Darurat",
    iconName: "Heart",
    colorHex: "#f43f5e", // rose-500
    bgTailwind: "bg-rose-500/10",
    borderTailwind: "border-rose-500/30",
    textTailwind: "text-rose-400",
    gradientFrom: "#f43f5e",
    gradientTo: "#be123c",
    accumulatedHours: 128,
    monthlyTargetHours: 135,
    activeVolunteers: 28,
    totalSessionsCompleted: 16,
    beneficiariesCount: 36,
    beneficiariesUnit: "Keluarga Berduka & Kasus Darurat Ditangani",
    socialMonetaryValueRatePerHour: 75000,
    keyProjects: [
      { name: "Posko Siaga Ambulans Umat 24 Jam", location: "Posko Utama Srimulya", hours: 60, volunteers: 12, status: "BERJALAN" },
      { name: "Pelatihan Pemulasaraan Jenazah Muslimah", location: "Masjid Nurul Huda", hours: 30, volunteers: 8, status: "SELESAI" },
      { name: "Santunan Kematian & Pendampingan Takziyah", location: "Lebung Gajah RW 02", hours: 24, volunteers: 5, status: "SELESAI" },
    ],
    topContributors: [
      { name: "H. Syamsudin", role: "Ketua Tim Fardhu Kifayah", hours: 34, badge: "Khadim Jenazah Utama" },
      { name: "Bambang Kurniawan", role: "Driver Ambulans Siaga", hours: 32, badge: "Ksatria Tanggap Cepat" },
      { name: "Ibu Romlah", role: "Pemulasaraan Jenazah Wanita", hours: 22, badge: "Khadimah Umat" },
    ],
    focusKelurahanShare: { sukamulya: 25, lebungGajah: 30, karyaMulya: 20, srimulya: 25 },
  },
  {
    id: "cat-teknologi",
    categoryName: "Teknologi, Media Dakwah & Digitalisasi Masjid",
    shortLabel: "IT & Media Dakwah",
    iconName: "Smartphone",
    colorHex: "#06b6d4", // cyan-500
    bgTailwind: "bg-cyan-500/10",
    borderTailwind: "border-cyan-500/30",
    textTailwind: "text-cyan-400",
    gradientFrom: "#06b6d4",
    gradientTo: "#0891b2",
    accumulatedHours: 138,
    monthlyTargetHours: 150,
    activeVolunteers: 20,
    totalSessionsCompleted: 15,
    beneficiariesCount: 24,
    beneficiariesUnit: "Masjid Terdigitalisasi Sistem ABDI",
    socialMonetaryValueRatePerHour: 90000,
    keyProjects: [
      { name: "Pemasangan Display Jadwal Sholat & Sound Digital", location: "Masjid Al-Istiqomah", hours: 42, volunteers: 6, status: "SELESAI" },
      { name: "Live Streaming Multi-Kamera Kajian Akbar", location: "Masjid Al-Ikhlas", hours: 48, volunteers: 8, status: "BERJALAN" },
      { name: "Edukasi QRIS Infaq & Presensi Relawan DKM", location: "Masjid Al-Muhajirin", hours: 32, volunteers: 4, status: "SELESAI" },
    ],
    topContributors: [
      { name: "Fathur Rahman, S.Kom", role: "Lead Engineer IT Dakwah", hours: 38, badge: "Pioneer Digitalisasi" },
      { name: "M. Farhan", role: "Operator Audio & Streaming", hours: 30, badge: "Broadcaster Dakwah" },
      { name: "Bayu Pratama", role: "Admin Konten & Media Sosial", hours: 24, badge: "Kreator Berkah" },
    ],
    focusKelurahanShare: { sukamulya: 30, lebungGajah: 25, karyaMulya: 25, srimulya: 20 },
  },
];

export default function CommunityImpactDashboard() {
  const [categoriesData, setCategoriesData] = useState<ServiceCategoryImpact[]>(INITIAL_SERVICE_CATEGORIES_IMPACT);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL"); // "ALL" for multi-ring or specific cat id
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("Semua");
  const [selectedMonth, setSelectedMonth] = useState<string>("Agustus 2026 (Safar 1448 H)");
  const [viewMode, setViewMode] = useState<"radial_multi" | "radial_focus" | "matrix_table" | "financial_stewardship">("radial_multi");
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [targetInputVal, setTargetInputVal] = useState<number>(0);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<"ALL" | "CURRENT_FILTER">("ALL");
  const [exportSignatoryRole, setExportSignatoryRole] = useState<string>("Ketua Forum DKM Sematang Borang");
  const [exportSignatoryName, setExportSignatoryName] = useState<string>("Ustadz Faisal Basri, S.Pd.I");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [simCatId, setSimCatId] = useState<string>(categoriesData[0].id);
  const [simHours, setSimHours] = useState<number>(4);
  const [simVolunteerName, setSimVolunteerName] = useState<string>("Ahmad Rizky");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const uniqueId = useId();

  // Aggregate Calculations
  const totalAccumulatedHours = useMemo(() => {
    return categoriesData.reduce((sum, c) => sum + c.accumulatedHours, 0);
  }, [categoriesData]);

  const totalMonthlyTargetHours = useMemo(() => {
    return categoriesData.reduce((sum, c) => sum + c.monthlyTargetHours, 0);
  }, [categoriesData]);

  const overallProgressPct = Math.min(100, Math.round((totalAccumulatedHours / (totalMonthlyTargetHours || 1)) * 100));
  const totalActiveVolunteers = categoriesData.reduce((sum, c) => sum + c.activeVolunteers, 0);
  const totalBeneficiaries = categoriesData.reduce((sum, c) => sum + c.beneficiariesCount, 0);

  // Total Social Economic Impact Value (SROI in Rupiah)
  const totalSocialImpactValueIDR = useMemo(() => {
    return categoriesData.reduce((sum, c) => sum + c.accumulatedHours * c.socialMonetaryValueRatePerHour, 0);
  }, [categoriesData]);

  const selectedCategory = useMemo(() => {
    if (selectedCategoryId === "ALL") return null;
    return categoriesData.find((c) => c.id === selectedCategoryId) || categoriesData[0];
  }, [categoriesData, selectedCategoryId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStartEditTarget = (cat: ServiceCategoryImpact) => {
    setEditingTargetId(cat.id);
    setTargetInputVal(cat.monthlyTargetHours);
  };

  const handleSaveEditTarget = (catId: string) => {
    if (targetInputVal <= 0) return;
    setCategoriesData((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, monthlyTargetHours: targetInputVal } : c))
    );
    setEditingTargetId(null);
    showToast("Target bulanan jam khidmah berhasil diperbarui.");
  };

  const handleSimulateLogHours = (e: FormEvent) => {
    e.preventDefault();
    if (simHours <= 0) return;

    setCategoriesData((prev) =>
      prev.map((c) =>
        c.id === simCatId
          ? {
              ...c,
              accumulatedHours: c.accumulatedHours + simHours,
              totalSessionsCompleted: c.totalSessionsCompleted + 1,
            }
          : c
      )
    );

    setShowSimulateModal(false);
    showToast(`Alhamdulillah! ${simHours} jam khidmah atas nama ${simVolunteerName} berhasil ditambahkan ke dasbor.`);
  };

  // CSV Export for Institutional Record-Keeping
  const handleExportCSV = () => {
    const dataToExport =
      exportScope === "CURRENT_FILTER" && selectedCategory
        ? [selectedCategory]
        : categoriesData;

    const subAccumulated = dataToExport.reduce((s, c) => s + c.accumulatedHours, 0);
    const subTarget = dataToExport.reduce((s, c) => s + c.monthlyTargetHours, 0);
    const subPct = Math.round((subAccumulated / (subTarget || 1)) * 100);
    const subVolunteers = dataToExport.reduce((s, c) => s + c.activeVolunteers, 0);
    const subBeneficiaries = dataToExport.reduce((s, c) => s + c.beneficiariesCount, 0);
    const subSROI = dataToExport.reduce((s, c) => s + c.accumulatedHours * c.socialMonetaryValueRatePerHour, 0);

    const rows = [
      ["LAPORAN KONTRIBUSI LAYANAN SOSIAL & JAM KHIDMAH RELAWAN MASJID"],
      ["Wilayah", "Kecamatan Sematang Borang, Kota Palembang"],
      ["Periode", selectedMonth],
      ["Kelurahan Fokus", selectedKelurahan],
      ["Tanggal Ekspor", new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
      ["Pengesah Laporan", `${exportSignatoryName} (${exportSignatoryRole})`],
      [""],
      [
        "No",
        "Kategori Layanan",
        "Label Ringkas",
        "Jam Terkumpul (Akumulasi)",
        "Target Bulanan (Jam)",
        "Capaian (%)",
        "Status Target",
        "Relawan Aktif (Jiwa)",
        "Sesi Terlaksana",
        "Penerima Manfaat",
        "Satuan Penerima",
        "Tarif SROI per Jam (Rp)",
        "Valuasi Dampak Sosial (Rp)",
        "Proyek Lapangan Utama",
      ],
      ...dataToExport.map((c, idx) => {
        const pct = Math.round((c.accumulatedHours / (c.monthlyTargetHours || 1)) * 100);
        const val = c.accumulatedHours * c.socialMonetaryValueRatePerHour;
        const status = c.accumulatedHours >= c.monthlyTargetHours ? "TERLAMPAUI" : "DALAM PROSES";
        const projectsStr = c.keyProjects.map((p) => `${p.name} [${p.location}, ${p.hours}j]`).join("; ");

        return [
          idx + 1,
          `"${c.categoryName}"`,
          `"${c.shortLabel}"`,
          c.accumulatedHours,
          c.monthlyTargetHours,
          `${pct}%`,
          status,
          c.activeVolunteers,
          c.totalSessionsCompleted,
          c.beneficiariesCount,
          `"${c.beneficiariesUnit}"`,
          c.socialMonetaryValueRatePerHour,
          `"Rp ${val.toLocaleString("id-ID")}"`,
          `"${projectsStr}"`,
        ];
      }),
      [""],
      [
        "TOTAL",
        `"${dataToExport.length} Kategori Layanan"`,
        "-",
        subAccumulated,
        subTarget,
        `${subPct}%`,
        subAccumulated >= subTarget ? "TARGET TERCAPAI" : "PROGRES",
        subVolunteers,
        dataToExport.reduce((s, c) => s + c.totalSessionsCompleted, 0),
        subBeneficiaries,
        "Total Manfaat",
        "-",
        `"Rp ${subSROI.toLocaleString("id-ID")}"`,
        "-",
      ],
    ];

    const csvString = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Kontribusi_Relawan_SematangBorang_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
    showToast("Laporan Kontribusi Layanan (CSV) untuk Arsip Kelembagaan berhasil diunduh.");
  };

  // PDF Export for Official Institutional Record-Keeping
  const handleExportPDF = () => {
    try {
      setIsExportingPdf(true);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const dataToExport =
        exportScope === "CURRENT_FILTER" && selectedCategory
          ? [selectedCategory]
          : categoriesData;

      const subAccumulated = dataToExport.reduce((s, c) => s + c.accumulatedHours, 0);
      const subTarget = dataToExport.reduce((s, c) => s + c.monthlyTargetHours, 0);
      const subPct = Math.round((subAccumulated / (subTarget || 1)) * 100);
      const subVolunteers = dataToExport.reduce((s, c) => s + c.activeVolunteers, 0);
      const subBeneficiaries = dataToExport.reduce((s, c) => s + c.beneficiariesCount, 0);
      const subSROI = dataToExport.reduce((s, c) => s + c.accumulatedHours * c.socialMonetaryValueRatePerHour, 0);

      // Header Branding
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 36, "F");

      // Gold / Emerald accent bar
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(0, 36, 210, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text("FORUM KOMUNIKASI MASJID & RELAWAN BERJAMAAH", 14, 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text("Kecamatan Sematang Borang, Kota Palembang • Sekretariat Bersama DKM", 14, 20);
      doc.text("Laporan Resmi Kontribusi Layanan & Jam Khidmah Sosial Kemaslahatan Umat", 14, 26);

      doc.setFontSize(8);
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text(`KODE DOKUMEN: DKM-SB-IMPACT-${Date.now().toString().slice(-6)}`, 14, 32);

      // Metadata Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(14, 43, 182, 28, 3, 3, "FD");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("PARAMETER LAPORAN KELEMBAGAAN", 20, 50);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`• Periode Evaluasi : ${selectedMonth}`, 20, 56);
      doc.text(`• Wilayah Kerja   : Kel. Sukamulya, Lebung Gajah, Karya Mulya, Srimulya`, 20, 62);
      doc.text(`• Tanggal Cetak    : ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 20, 68);

      doc.text(`• Status Capaian  : ${subAccumulated} / ${subTarget} Jam (${subPct}%)`, 110, 56);
      doc.text(`• Relawan Aktif   : ${subVolunteers} Jiwa Terverifikasi`, 110, 62);
      doc.text(`• Valuasi SROI    : Rp ${subSROI.toLocaleString("id-ID")} (Nilai Manfaat)`, 110, 68);

      // Main Table of Service Categories
      const tableHeaders = [
        ["No", "Kategori Layanan", "Jam Akumulasi", "Target", "Capaian", "Relawan", "Penerima Manfaat", "Valuasi SROI (Rp)"]
      ];

      const tableRows = dataToExport.map((cat, idx) => {
        const pct = Math.round((cat.accumulatedHours / (cat.monthlyTargetHours || 1)) * 100);
        const sroi = cat.accumulatedHours * cat.socialMonetaryValueRatePerHour;
        return [
          (idx + 1).toString(),
          cat.shortLabel,
          `${cat.accumulatedHours} Jam`,
          `${cat.monthlyTargetHours} Jam`,
          `${pct}%`,
          `${cat.activeVolunteers} Org`,
          `${cat.beneficiariesCount.toLocaleString("id-ID")} ${cat.beneficiariesUnit.split(" ")[0]}`,
          `Rp ${sroi.toLocaleString("id-ID")}`
        ];
      });

      // Total Row
      tableRows.push([
        "",
        "TOTAL KESELURUHAN",
        `${subAccumulated} Jam`,
        `${subTarget} Jam`,
        `${subPct}%`,
        `${subVolunteers} Org`,
        `${subBeneficiaries.toLocaleString("id-ID")} Manfaat`,
        `Rp ${subSROI.toLocaleString("id-ID")}`
      ]);

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        startY: 76,
        theme: "striped",
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 42, fontStyle: "bold" },
          2: { cellWidth: 24, halign: "center", fontStyle: "bold", textColor: [5, 150, 105] },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 18, halign: "center", fontStyle: "bold" },
          5: { cellWidth: 18, halign: "center" },
          6: { cellWidth: 24, halign: "center" },
          7: { cellWidth: 28, halign: "right", fontStyle: "bold", textColor: [180, 83, 9] },
        },
        didParseCell: (data) => {
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [241, 245, 249];
            data.cell.styles.textColor = [15, 23, 42];
          }
        },
      });

      // Key Projects & Field Activities Section
      const finalY = (doc as any).lastAutoTable?.finalY || 160;

      if (finalY < 210) {
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("IKHTISAR PROYEK KHIDMAH & AKSI LAPANGAN UNGGULAN", 14, finalY + 10);

        const projectRows: string[][] = [];
        dataToExport.forEach((c) => {
          c.keyProjects.forEach((p) => {
            projectRows.push([
              c.shortLabel,
              p.name,
              p.location,
              `${p.hours} Jam`,
              `${p.volunteers} Relawan`,
              p.status
            ]);
          });
        });

        autoTable(doc, {
          head: [["Kategori", "Nama Proyek", "Lokasi Masjid/Titik", "Jam", "Tim", "Status"]],
          body: projectRows.slice(0, 7), // Fit nicely on first page
          startY: finalY + 13,
          theme: "grid",
          headStyles: {
            fillColor: [51, 65, 85],
            textColor: [255, 255, 255],
            fontSize: 7.5,
            fontStyle: "bold",
          },
          bodyStyles: {
            fontSize: 7,
            textColor: [51, 65, 85],
          },
          columnStyles: {
            0: { cellWidth: 30, fontStyle: "bold" },
            1: { cellWidth: 52 },
            2: { cellWidth: 40 },
            3: { cellWidth: 16, halign: "center" },
            4: { cellWidth: 20, halign: "center" },
            5: { cellWidth: 24, halign: "center", fontStyle: "bold" },
          },
        });
      }

      // Institutional Signatures at Bottom
      const sigY = 248;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);

      doc.text("Mengetahui & Mengesahkan,", 14, sigY);
      doc.text(exportSignatoryRole, 14, sigY + 5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(exportSignatoryName, 14, sigY + 24);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("NIP/ID Relawan: DKM-SB-VERIFIED-2026", 14, sigY + 28);

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Palembang, " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), 130, sigY);
      doc.text("Koordinator Divisi Berjamaah & Relawan,", 130, sigY + 5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Ahmad Rizky Pratama, S.Kep", 130, sigY + 24);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text("Sertifikasi Khidmah: STR-MED-99218", 130, sigY + 28);

      // Save PDF
      doc.save(`Laporan_Resmi_Kontribusi_Khidmah_SematangBorang_${Date.now()}.pdf`);
      setShowExportModal(false);
      showToast("Laporan Resmi Kontribusi Layanan (PDF) berhasil diunduh.");
    } catch (err) {
      console.error("PDF Export Error:", err);
      showToast("Gagal membuat PDF. Silakan gunakan opsi Ekspor CSV.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      id="community-impact-dashboard-root"
      className="space-y-6 bg-slate-950 text-slate-100 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-emerald-100 px-5 py-3.5 rounded-2xl border border-emerald-500/50 shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10 border-b border-slate-800/80 pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>COMMUNITY IMPACT & VOLUNTEER HOURS RADIAL ANALYTICS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Community Impact Dashboard</span>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40">
              Pilar Berjamaah
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Visualisasi <strong>Indikator Progres Radial (Radial Progress Indicator)</strong> yang membedakan secara visual antara <strong>Total Jam Khidmah Terkumpul (Accumulated Hours)</strong> versus <strong>Target Bulanan (Monthly Target)</strong> untuk 7 kategori layanan sosial kemaslahatan umat di Kecamatan Sematang Borang.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-simulate-add-hours"
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            <span>Log Jam Khidmah</span>
          </button>

          <button
            id="btn-open-export-modal"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-slate-700 hover:border-amber-400/50 text-xs font-bold text-white transition shadow-lg active:scale-95 group"
          >
            <Download className="w-3.5 h-3.5 text-amber-400 group-hover:animate-bounce" />
            <span className="text-slate-100">Ekspor Laporan (PDF / CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Jam Khidmah</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            {totalAccumulatedHours.toLocaleString("id-ID")}{" "}
            <span className="text-xs text-emerald-400 font-normal">/ {totalMonthlyTargetHours} Jam</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${overallProgressPct}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{overallProgressPct}%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target Bulan Ini ({selectedMonth.split(" ")[0]})
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Valuasi Dampak Sosial (SROI)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 mt-1">
            Rp {(totalSocialImpactValueIDR / 1000000).toFixed(1)}{" "}
            <span className="text-xs text-slate-300 font-normal">Juta</span>
          </div>
          <div className="text-[11px] text-amber-400/90 font-medium mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Konversi Tenaga Khidmah Relawan</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Rata-rata Rp 73.500/jam standar kerja sosial
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Relawan Aktif Terlibat</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-sky-300 mt-1">
            {totalActiveVolunteers}{" "}
            <span className="text-xs text-slate-300 font-normal">Jiwa</span>
          </div>
          <div className="text-[11px] text-sky-400/90 font-medium mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tersebar di 24 Masjid Sematang Borang</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            100% Terverifikasi DKM & Presensi QR
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Penerima Manfaat Umat</span>
            <Heart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300 mt-1">
            {totalBeneficiaries.toLocaleString("id-ID")}{" "}
            <span className="text-xs text-slate-300 font-normal">Mustahiq/Jiwa</span>
          </div>
          <div className="text-[11px] text-purple-400/90 font-medium mt-2 flex items-center gap-1">
            <Building className="w-3.5 h-3.5" />
            <span>4 Kelurahan (Sukamulya dkk)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Keluarga dhuafa, santri, lansia & UMKM
          </div>
        </div>
      </div>

      {/* Controls & Filter Strip */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            id="view-radial-multi"
            onClick={() => {
              setViewMode("radial_multi");
              setSelectedCategoryId("ALL");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "radial_multi"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Radial Multi-Ring (Semua Kategori)</span>
          </button>

          <button
            id="view-radial-focus"
            onClick={() => {
              setViewMode("radial_focus");
              if (selectedCategoryId === "ALL") setSelectedCategoryId(categoriesData[0].id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "radial_focus"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Fokus Dial Radial Tunggal</span>
          </button>

          <button
            id="view-matrix-table"
            onClick={() => setViewMode("matrix_table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "matrix_table"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Matriks Rincian & Target</span>
          </button>

          <button
            id="view-financial-stewardship"
            onClick={() => setViewMode("financial_stewardship")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "financial_stewardship"
                ? "bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Financial Stewardship (Donut Chart)</span>
            <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-400/40">
              NEW
            </span>
          </button>
        </div>

        {/* Scope Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500 font-semibold">Wilayah:</span>
            <select
              value={selectedKelurahan}
              onChange={(e) => setSelectedKelurahan(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900 text-slate-200">Semua Kelurahan (Kec. Sematang Borang)</option>
              <option value="Sukamulya" className="bg-slate-900 text-slate-200">Kelurahan Sukamulya</option>
              <option value="Lebung Gajah" className="bg-slate-900 text-slate-200">Kelurahan Lebung Gajah</option>
              <option value="Karya Mulya" className="bg-slate-900 text-slate-200">Kelurahan Karya Mulya</option>
              <option value="Srimulya" className="bg-slate-900 text-slate-200">Kelurahan Srimulya</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-200 font-mono font-bold">{selectedMonth}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: RADIAL MULTI-RING CONCENTRIC VISUALIZER (Main Feature) */}
      {viewMode === "radial_multi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Left / Center: Grand Concentric Radial Progress Rings Visualizer (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-between relative overflow-hidden">
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Multi-Ring Radial Progress: 7 Kategori Layanan</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setiap cincin radial membandingkan <strong>Jam Terkumpul</strong> (busur berwarna) vs <strong>Target Bulanan 100%</strong> (lingkaran abu-abu dasar).
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Live Sync
              </span>
            </div>

            {/* SVG Concentric Rings Canvas */}
            <div className="relative my-6 flex items-center justify-center">
              <svg
                width="340"
                height="340"
                viewBox="0 0 340 340"
                className="transform -rotate-90 filter drop-shadow-xl"
              >
                <defs>
                  {categoriesData.map((cat) => (
                    <linearGradient
                      key={`grad-${cat.id}`}
                      id={`grad-${cat.id}-${uniqueId}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={cat.gradientFrom} />
                      <stop offset="100%" stopColor={cat.gradientTo} />
                    </linearGradient>
                  ))}
                </defs>

                {/* Draw 7 Concentric Rings: Inner to Outer */}
                {categoriesData.map((cat, idx) => {
                  const ringRadius = 40 + idx * 16; // radius from 40 to 136
                  const strokeWidth = 10;
                  const circumference = 2 * Math.PI * ringRadius;
                  const ratio = Math.min(1.2, cat.accumulatedHours / (cat.monthlyTargetHours || 1));
                  const strokeDashoffset = circumference - ratio * circumference;

                  return (
                    <g key={`ring-group-${cat.id}`} className="group/ring cursor-pointer">
                      {/* Base Track (Monthly Target 100% boundary) */}
                      <circle
                        cx="170"
                        cy="170"
                        r={ringRadius}
                        stroke="#1e293b" // slate-800
                        strokeWidth={strokeWidth}
                        fill="transparent"
                      />

                      {/* Milestone 100% Target Marker Tick */}
                      <circle
                        cx={170 + ringRadius}
                        cy="170"
                        r={strokeWidth / 3.5}
                        fill="#64748b" // slate-500 target tick
                        opacity={0.8}
                      />

                      {/* Progress Filled Arc (Accumulated Volunteer Hours) */}
                      <circle
                        cx="170"
                        cy="170"
                        r={ringRadius}
                        stroke={`url(#grad-${cat.id}-${uniqueId})`}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out hover:opacity-90"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center Info Hub */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Capaian</span>
                <span className="text-3xl font-black font-mono text-white tracking-tight">
                  {overallProgressPct}%
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {totalAccumulatedHours} / {totalMonthlyTargetHours} Jam
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">7 Kategori Layanan</span>
              </div>
            </div>

            {/* Concentric Legend & Visual Key */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-[11px]">
              {categoriesData.slice(0, 4).map((c, i) => {
                const pct = Math.round((c.accumulatedHours / c.monthlyTargetHours) * 100);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCategoryId(c.id);
                      setViewMode("radial_focus");
                    }}
                    className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-600 cursor-pointer transition flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.colorHex }}></span>
                    <div className="truncate">
                      <div className="text-slate-200 font-bold truncate">{c.shortLabel}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.accumulatedHours} / {c.monthlyTargetHours}j ({pct}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Interactive Category Cards with Radial Mini-Gauges (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Rincian Target per Kategori Layanan</span>
              </h4>
              <span className="text-xs text-slate-400">Klik kartu untuk detail</span>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {categoriesData.map((cat) => {
                const pct = Math.round((cat.accumulatedHours / cat.monthlyTargetHours) * 100);
                const isOverTarget = cat.accumulatedHours >= cat.monthlyTargetHours;
                const hoursRemaining = Math.max(0, cat.monthlyTargetHours - cat.accumulatedHours);

                // Mini radial gauge math
                const radius = 24;
                const strokeWidth = 5;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - Math.min(1, cat.accumulatedHours / cat.monthlyTargetHours) * circumference;

                return (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 ${
                      selectedCategoryId === cat.id
                        ? "bg-slate-900 border-emerald-400/80 shadow-lg ring-1 ring-emerald-500/30"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Mini SVG Radial Gauge */}
                        <div className="relative shrink-0 w-14 h-14 flex items-center justify-center">
                          <svg width="56" height="56" viewBox="0 0 56 56" className="transform -rotate-90">
                            {/* Track (Target 100%) */}
                            <circle cx="28" cy="28" r={radius} stroke="#334155" strokeWidth={strokeWidth} fill="transparent" />
                            {/* Progress (Accumulated) */}
                            <circle
                              cx="28"
                              cy="28"
                              r={radius}
                              stroke={cat.colorHex}
                              strokeWidth={strokeWidth}
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              fill="transparent"
                              className="transition-all duration-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[11px] font-mono font-black text-white">{pct}%</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.colorHex }}></span>
                            <h5 className="font-bold text-white text-xs leading-snug">{cat.categoryName}</h5>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                            <span className="text-emerald-300 font-bold">{cat.accumulatedHours} Jam</span>
                            <span>/ Target {cat.monthlyTargetHours} Jam</span>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-0.5">
                            👥 {cat.activeVolunteers} Relawan • 📦 {cat.beneficiariesCount} {cat.beneficiariesUnit}
                          </div>
                        </div>
                      </div>

                      {/* Status pill & Quick Action */}
                      <div className="text-right shrink-0">
                        {isOverTarget ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" />
                            Melampaui Target
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3" />
                            Sisa {hoursRemaining}j
                          </span>
                        )}

                        <div className="mt-2 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditTarget(cat)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] transition"
                            title="Edit Target Bulanan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategoryId(cat.id);
                              setViewMode("radial_focus");
                            }}
                            className="px-2 py-0.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold transition"
                          >
                            Fokus
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Edit Target Form Inline */}
                    {editingTargetId === cat.id && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl animate-fadeIn">
                        <span className="text-[11px] text-slate-300 font-bold">Target Jam:</span>
                        <input
                          type="number"
                          min="10"
                          max="2000"
                          value={targetInputVal}
                          onChange={(e) => setTargetInputVal(Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-lg outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                        <button
                          onClick={() => handleSaveEditTarget(cat.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                        <button
                          onClick={() => setEditingTargetId(null)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Executive Preview Banner for Financial Stewardship & Sadaqah Allocation */}
          <div className="lg:col-span-12 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 rounded-3xl p-5 sm:p-6 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/30">
                    Amanah Umat & SROI Analytics
                  </span>
                  <span className="text-xs text-slate-400">21 Proyek Relawan</span>
                </div>
                <h4 className="text-base font-black text-white">
                  Financial Stewardship: Alokasi Dana Sedekah Umat (Donut Chart)
                </h4>
                <p className="text-xs text-slate-300">
                  Pantau penyerapan dana amanah (Rp 243,5 Jt) di 7 pilar layanan sosial dengan rasio kemanfaatan 98.6% tanpa potongan admin.
                </p>
              </div>
            </div>

            <button
              id="btn-switch-to-financial-stewardship"
              onClick={() => setViewMode("financial_stewardship")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-xs font-bold text-white shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Coins className="w-4 h-4 text-amber-200" />
              <span>Buka Analisis Donut Chart</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: RADIAL FOCUS SINGLE-DIAL (High Precision Dual-Stroke Indicator) */}
      {viewMode === "radial_focus" && selectedCategory && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          {/* Category Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {categoriesData.map((cat) => {
              const isSelected = selectedCategory.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? "bg-slate-900 text-white border border-emerald-400 shadow-md ring-1 ring-emerald-400/30"
                      : "bg-slate-900/50 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.colorHex }}></span>
                  <span>{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Deep-Dive Dial Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: High-Precision Dual-Stroke Radial Gauge (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900/90 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-between text-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dial Presisi Tinggi</div>
                  <h3 className="text-base font-bold text-white">{selectedCategory.categoryName}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
                  Target: {selectedCategory.monthlyTargetHours} Jam
                </span>
              </div>

              {/* Large Radial SVG Gauge */}
              <div className="relative my-8 flex items-center justify-center">
                {(() => {
                  const radius = 100;
                  const strokeWidth = 18;
                  const circumference = 2 * Math.PI * radius;
                  const pct = Math.round((selectedCategory.accumulatedHours / selectedCategory.monthlyTargetHours) * 100);
                  const progressRatio = Math.min(1.25, selectedCategory.accumulatedHours / selectedCategory.monthlyTargetHours);
                  const strokeDashoffset = circumference - progressRatio * circumference;

                  return (
                    <div className="relative">
                      <svg width="260" height="260" viewBox="0 0 260 260" className="transform -rotate-90 filter drop-shadow-2xl">
                        {/* Target Base Arc (Grey boundary for 100% Target) */}
                        <circle
                          cx="130"
                          cy="130"
                          r={radius}
                          stroke="#1e293b"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                        />

                        {/* Quarter milestone ticks at 25%, 50%, 75%, 100% */}
                        {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                          const angle = frac * 2 * Math.PI - Math.PI / 2;
                          const tx = 130 + (radius + strokeWidth / 2 + 6) * Math.cos(angle);
                          const ty = 130 + (radius + strokeWidth / 2 + 6) * Math.sin(angle);
                          return (
                            <circle key={idx} cx={tx} cy={ty} r="3" fill="#64748b" />
                          );
                        })}

                        {/* Progress Filled Arc (Accumulated Volunteer Hours) */}
                        <circle
                          cx="130"
                          cy="130"
                          r={radius}
                          stroke={selectedCategory.colorHex}
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>

                      {/* Center Display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs uppercase font-bold text-slate-400">Jam Terkumpul</span>
                        <span className="text-4xl font-black font-mono text-white tracking-tight">
                          {selectedCategory.accumulatedHours}
                        </span>
                        <span className="text-xs font-mono font-bold mt-0.5" style={{ color: selectedCategory.colorHex }}>
                          {pct}% dari Target {selectedCategory.monthlyTargetHours} Jam
                        </span>
                        <div className="mt-2">
                          {selectedCategory.accumulatedHours >= selectedCategory.monthlyTargetHours ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                              ✓ Target Tercapai (+{selectedCategory.accumulatedHours - selectedCategory.monthlyTargetHours}j)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                              Sisa {selectedCategory.monthlyTargetHours - selectedCategory.accumulatedHours} Jam Lagi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Quick Math Comparison Strip */}
              <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Laju Harian Rata-rata</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">
                    {(selectedCategory.accumulatedHours / 16).toFixed(1)} Jam/hari
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Kebutuhan Harian Sisa</div>
                  <div className="font-mono font-bold text-amber-300 mt-0.5">
                    {Math.max(0, (selectedCategory.monthlyTargetHours - selectedCategory.accumulatedHours) / 15).toFixed(1)} Jam/hari
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Valuasi SROI Kategori</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    Rp {((selectedCategory.accumulatedHours * selectedCategory.socialMonetaryValueRatePerHour) / 1000000).toFixed(1)} Jt
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Key Projects & Top Volunteer Champions (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Projects Breakdown */}
              <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span>Proyek Khidmah Utama ({selectedCategory.keyProjects.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">{selectedCategory.totalSessionsCompleted} Sesi Tuntas</span>
                </div>

                <div className="space-y-2">
                  {selectedCategory.keyProjects.map((p, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{p.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>📍 {p.location}</span>
                          <span>•</span>
                          <span>👥 {p.volunteers} Relawan</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400">{p.hours} Jam</span>
                        <div className="text-[10px]">
                          <span className={`px-1.5 py-0.2 rounded font-bold ${p.status === "SELESAI" ? "text-emerald-400" : "text-amber-400"}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Volunteer Champions */}
              <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Relawan Teladan (Top Contributors)</span>
                  </h4>
                  <span className="text-[11px] text-amber-400 font-semibold">{selectedCategory.activeVolunteers} Relawan Aktif</span>
                </div>

                <div className="space-y-2">
                  {selectedCategory.topContributors.map((c, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-200">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{c.role} • <span className="text-amber-300">{c.badge}</span></div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-white text-xs">
                        {c.hours} Jam
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE DATA MATRIX TABLE */}
      {viewMode === "matrix_table" && (
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-4 relative z-10 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Tabel Matriks Capaian & Alokasi Target Jam Khidmah</span>
              </h3>
              <p className="text-xs text-slate-400">
                Data komparasi performa relawan antarkategori dan kalkulasi Laba Sosial (SROI)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Unduh Laporan (PDF / CSV)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                  <th className="p-3 rounded-l-xl">Kategori Layanan</th>
                  <th className="p-3">Jam Terkumpul</th>
                  <th className="p-3">Target Bulanan</th>
                  <th className="p-3">Progres Radial</th>
                  <th className="p-3">Relawan Aktif</th>
                  <th className="p-3">Penerima Manfaat</th>
                  <th className="p-3">Valuasi SROI (Rp)</th>
                  <th className="p-3 rounded-r-xl text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categoriesData.map((cat) => {
                  const pct = Math.round((cat.accumulatedHours / cat.monthlyTargetHours) * 100);
                  const isOver = cat.accumulatedHours >= cat.monthlyTargetHours;
                  const sroi = cat.accumulatedHours * cat.socialMonetaryValueRatePerHour;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.colorHex }}></span>
                          <span>{cat.categoryName}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-300">
                        {cat.accumulatedHours} Jam
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {cat.monthlyTargetHours} Jam
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(100, pct)}%`, backgroundColor: cat.colorHex }}
                            ></div>
                          </div>
                          <span className={isOver ? "text-emerald-400" : "text-amber-400"}>{pct}%</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{cat.activeVolunteers} Relawan</td>
                      <td className="p-3 text-slate-300">{cat.beneficiariesCount} {cat.beneficiariesUnit}</td>
                      <td className="p-3 font-mono font-bold text-amber-300">
                        Rp {sroi.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setViewMode("radial_focus");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                        >
                          Detail Dial
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: FINANCIAL STEWARDSHIP & SADAQAH ALLOCATION DONUT BREAKDOWN */}
      {viewMode === "financial_stewardship" && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          <FinancialStewardshipBreakdown
            onSelectCategory={(catId) => {
              setSelectedCategoryId(catId);
            }}
          />
        </div>
      )}

      {/* Modal Simulasi Log Jam Khidmah */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Simulasi Tambah Jam Khidmah</span>
              </h4>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateLogHours} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Pilih Kategori Layanan</label>
                <select
                  value={simCatId}
                  onChange={(e) => setSimCatId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categoriesData.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName} ({c.accumulatedHours} / {c.monthlyTargetHours}j)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Relawan</label>
                <input
                  type="text"
                  required
                  value={simVolunteerName}
                  onChange={(e) => setSimVolunteerName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Jumlah Jam Khidmah yang Ditambahkan</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  step="0.5"
                  required
                  value={simHours}
                  onChange={(e) => setSimHours(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-200 text-[11px]">
                💡 Jam khidmah yang diinput akan langsung memperbarui kalkulasi busur radial progress indicator dan valuasi dampak sosial secara real-time.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  Tambahkan ke Dasbor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSTITUTIONAL SERVICE CONTRIBUTION EXPORT (PDF & CSV) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Arsip Resmi Kelembagaan DKM</span>
                </div>
                <h3 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                  <span>Unduh Laporan Kontribusi Khidmah</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Cetak dokumen resmi rekam jejak pengabdian relawan & capaian jam khidmah kemaslahatan umat untuk pelaporan pengurus masjid, instansi donatur, dan arsip kelembagaan.
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Scope Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Cakupan Data yang Diekspor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setExportScope("ALL")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    exportScope === "ALL"
                      ? "bg-emerald-950/80 border-emerald-400 ring-1 ring-emerald-400/40 shadow-sm"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Semua 7 Kategori</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-md">
                      {totalAccumulatedHours} Jam Total
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Laporan komprehensif seluruh pilar layanan (Medis, Pangan, Pendidikan, Fasum, dll.)
                  </p>
                </div>

                <div
                  onClick={() => setExportScope("CURRENT_FILTER")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    exportScope === "CURRENT_FILTER"
                      ? "bg-emerald-950/80 border-emerald-400 ring-1 ring-emerald-400/40 shadow-sm"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">
                      {selectedCategory ? selectedCategory.shortLabel : "Kategori Terpilih"}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded-md">
                      {selectedCategory ? `${selectedCategory.accumulatedHours}j` : "Spesifik"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Hanya kategori yang sedang aktif difokuskan pada ring radial
                  </p>
                </div>
              </div>
            </div>

            {/* Signatory & Institutional Info */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Pengesahan Dokumen Kelembagaan (Kop & Tanda Tangan)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium block">
                    Nama Penandatangan / Pejabat DKM
                  </label>
                  <input
                    type="text"
                    value={exportSignatoryName}
                    onChange={(e) => setExportSignatoryName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    placeholder="Contoh: Ustadz Faisal Basri, S.Pd.I"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium block">
                    Jabatan / Struktur Kelembagaan
                  </label>
                  <input
                    type="text"
                    value={exportSignatoryRole}
                    onChange={(e) => setExportSignatoryRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    placeholder="Contoh: Ketua Forum DKM Sematang Borang"
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>🗓️ Periode Evaluasi: <strong>{selectedMonth}</strong></span>
                <span>🏛️ Wilayah: <strong>Kec. Sematang Borang</strong></span>
              </div>
            </div>

            {/* Export Format Action Cards */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Pilih Format Unduhan
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* PDF Option */}
                <button
                  id="btn-download-official-pdf"
                  type="button"
                  disabled={isExportingPdf}
                  onClick={handleExportPDF}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-900 text-left transition space-y-2 group shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-black text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800">
                      OFFICIAL PDF
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition">
                      {isExportingPdf ? "Menyusun Dokumen..." : "Dokumen Resmi PDF (A4)"}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Format siap cetak dengan Kop Resmi DKM, tabel matrikulasi jam khidmah, rincian proyek lapangan, dan lembar legalitas tanda tangan.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 pt-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Sekarang</span>
                  </div>
                </button>

                {/* CSV Option */}
                <button
                  id="btn-download-official-csv"
                  type="button"
                  onClick={handleExportCSV}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/40 hover:border-amber-400 hover:bg-slate-900 text-left transition space-y-2 group shadow-lg active:scale-95"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                      EXCEL / CSV
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition">
                      Tabel Data Mentah (CSV)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Cocok untuk analisis lanjutan di Microsoft Excel, Google Sheets, atau integrasi database kas & audit DKM.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 pt-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Sekarang</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terstandarisasi format laporan DKM Sematang Borang</span>
              </span>

              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
