import { useState } from "react";
import {
  Users,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HeartHandshake,
  Activity,
  Search,
  Download,
  Copy,
  Check,
  Building,
  ShieldCheck,
  Send,
  Zap,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  UserCheck,
  Stethoscope,
  BookOpen,
  ShoppingBag,
  Package,
} from "lucide-react";
import { KELURAHAN_GIS_DATA } from "../data/mockData";

// Grid cluster node representing RW/Mosque sectors in Sematang Borang
export interface DistrictClusterNode {
  id: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  sectorName: string; // e.g. "RW 01 - Masjid Al-Ikhlas"
  masjidName: string;
  gridRow: number;
  gridCol: number;
  totalMuslims: number;
  mustahiqCount: number;
  muzakkiCount: number;
  activeVolunteers: number;
  engagementScore: number; // 0 - 100
  subuhAttendanceRate: number; // percentage %
  youthParticipationRate: number; // %
  taklimActivityRate: number; // %
  resourceDistribution: {
    panganSembakoPackages: number; // distributed units
    panganTarget: number;
    healthServicesCount: number; // health clinic sessions
    healthTarget: number;
    scholarshipStudents: number; // recipient students
    scholarshipTarget: number;
    umkmQardhCapital: number; // in Millions IDR
    umkmTarget: number;
    ambulanceCoverageHours: number; // hrs/week
  };
  priorityUrgency: "RENDAH" | "SEDANG" | "TINGGI" | "KRITIS";
  urgentNeedNotes: string;
  communityHighlights: string[];
}

// 16 Structured Sector Nodes representing 4x4 Grid in Sematang Borang District
export const SEMATANG_BORANG_GRID_NODES: DistrictClusterNode[] = [
  // Sukamulya (North-West Sector)
  {
    id: "SKM-01",
    kelurahan: "Sukamulya",
    sectorName: "Sektor 1 (RW 01-02)",
    masjidName: "Masjid Jami' Al-Ikhlas",
    gridRow: 0,
    gridCol: 0,
    totalMuslims: 5200,
    mustahiqCount: 68,
    muzakkiCount: 210,
    activeVolunteers: 28,
    engagementScore: 92,
    subuhAttendanceRate: 84,
    youthParticipationRate: 88,
    taklimActivityRate: 90,
    resourceDistribution: {
      panganSembakoPackages: 120,
      panganTarget: 130,
      healthServicesCount: 8,
      healthTarget: 8,
      scholarshipStudents: 22,
      scholarshipTarget: 25,
      umkmQardhCapital: 45,
      umkmTarget: 50,
      ambulanceCoverageHours: 24,
    },
    priorityUrgency: "RENDAH",
    urgentNeedNotes: "Kebutuhan stabil. Fokus perluasan inkubasi usaha kuliner halal pemuda.",
    communityHighlights: [
      "Pelopor Gerakan Subuh Berjamaah Akbar 600 jamaah",
      "Pusat Lumbung Pangan Mandiri Sematang Borang",
      "Koleksi ZISWAF QRIS digital tertinggi di kecamatan",
    ],
  },
  {
    id: "SKM-02",
    kelurahan: "Sukamulya",
    sectorName: "Sektor 2 (RW 03-04)",
    masjidName: "Masjid Baitul Muttaqin",
    gridRow: 0,
    gridCol: 1,
    totalMuslims: 4800,
    mustahiqCount: 74,
    muzakkiCount: 165,
    activeVolunteers: 22,
    engagementScore: 78,
    subuhAttendanceRate: 71,
    youthParticipationRate: 76,
    taklimActivityRate: 82,
    resourceDistribution: {
      panganSembakoPackages: 95,
      panganTarget: 110,
      healthServicesCount: 5,
      healthTarget: 6,
      scholarshipStudents: 16,
      scholarshipTarget: 20,
      umkmQardhCapital: 28,
      umkmTarget: 40,
      ambulanceCoverageHours: 18,
    },
    priorityUrgency: "SEDANG",
    urgentNeedNotes: "Tambahan modal bergulir bagi 12 pedagang sayur keliling pasar kaget.",
    communityHighlights: [
      "Majelis Taklim rutin 3 kali sepekan",
      "Program tebus beras murah bersubsidi Zakat",
    ],
  },
  {
    id: "SKM-03",
    kelurahan: "Sukamulya",
    sectorName: "Sektor 3 (RW 05-06)",
    masjidName: "Masjid An-Nur Griya",
    gridRow: 1,
    gridCol: 0,
    totalMuslims: 4450,
    mustahiqCount: 58,
    muzakkiCount: 175,
    activeVolunteers: 20,
    engagementScore: 86,
    subuhAttendanceRate: 79,
    youthParticipationRate: 82,
    taklimActivityRate: 88,
    resourceDistribution: {
      panganSembakoPackages: 80,
      panganTarget: 85,
      healthServicesCount: 6,
      healthTarget: 6,
      scholarshipStudents: 14,
      scholarshipTarget: 15,
      umkmQardhCapital: 32,
      umkmTarget: 35,
      ambulanceCoverageHours: 24,
    },
    priorityUrgency: "RENDAH",
    urgentNeedNotes: "Optimalisasi sarana sound system dan ruang belajar Rumah Tahfidz anak.",
    communityHighlights: [
      "Sentra Rumah Qur'an Balita dan Lansia",
      "Bank Sampah Berkah sedekah barang bekas",
    ],
  },
  {
    id: "SKM-04",
    kelurahan: "Sukamulya",
    sectorName: "Sektor 4 (Griya Sukamulya)",
    masjidName: "Masjid Nurul Huda",
    gridRow: 1,
    gridCol: 1,
    totalMuslims: 4000,
    mustahiqCount: 45,
    muzakkiCount: 130,
    activeVolunteers: 16,
    engagementScore: 81,
    subuhAttendanceRate: 75,
    youthParticipationRate: 72,
    taklimActivityRate: 85,
    resourceDistribution: {
      panganSembakoPackages: 65,
      panganTarget: 70,
      healthServicesCount: 4,
      healthTarget: 4,
      scholarshipStudents: 12,
      scholarshipTarget: 12,
      umkmQardhCapital: 20,
      umkmTarget: 25,
      ambulanceCoverageHours: 12,
    },
    priorityUrgency: "RENDAH",
    urgentNeedNotes: "Penambahan relawan pemulasaraan jenazah wanita (Fardhu Kifayah).",
    communityHighlights: [
      "Komunitas Remaja Masjid Produktif (Remas)",
      "Program Kopi Ukhuwah Ba'da Subuh Ahad",
    ],
  },

  // Lebung Gajah (South-West Sector)
  {
    id: "LBG-01",
    kelurahan: "Lebung Gajah",
    sectorName: "Sektor 1 (Pusat Lebung Gajah)",
    masjidName: "Masjid Baiturrahman",
    gridRow: 2,
    gridCol: 0,
    totalMuslims: 4600,
    mustahiqCount: 82,
    muzakkiCount: 140,
    activeVolunteers: 22,
    engagementScore: 84,
    subuhAttendanceRate: 76,
    youthParticipationRate: 79,
    taklimActivityRate: 89,
    resourceDistribution: {
      panganSembakoPackages: 110,
      panganTarget: 125,
      healthServicesCount: 6,
      healthTarget: 8,
      scholarshipStudents: 18,
      scholarshipTarget: 24,
      umkmQardhCapital: 30,
      umkmTarget: 45,
      ambulanceCoverageHours: 24,
    },
    priorityUrgency: "SEDANG",
    urgentNeedNotes: "Kebutuhan percepatan program pemeriksaan gula darah & tensi lansia dhuafa.",
    communityHighlights: [
      "Basis Posbindu Lansia Sehat Mandiri",
      "Kemitraan pelatihan las dan perbengkelan remaja",
    ],
  },
  {
    id: "LBG-02",
    kelurahan: "Lebung Gajah",
    sectorName: "Sektor 2 (Bantaran Rawa)",
    masjidName: "Masjid Al-Falah",
    gridRow: 2,
    gridCol: 1,
    totalMuslims: 3800,
    mustahiqCount: 62,
    muzakkiCount: 95,
    activeVolunteers: 14,
    engagementScore: 68,
    subuhAttendanceRate: 60,
    youthParticipationRate: 58,
    taklimActivityRate: 72,
    resourceDistribution: {
      panganSembakoPackages: 70,
      panganTarget: 95,
      healthServicesCount: 3,
      healthTarget: 6,
      scholarshipStudents: 10,
      scholarshipTarget: 16,
      umkmQardhCapital: 15,
      umkmTarget: 30,
      ambulanceCoverageHours: 12,
    },
    priorityUrgency: "TINGGI",
    urgentNeedNotes: "Filter air bersih sanitasi musholla dan bantuan pangan balita stunting.",
    communityHighlights: [
      "Wilayah prioritas intervensi gizi anak balita",
      "Kelompok pengajian tadarus ibu-ibu rumah tangga",
    ],
  },
  {
    id: "LBG-03",
    kelurahan: "Lebung Gajah",
    sectorName: "Sektor 3 (Komplek Melati)",
    masjidName: "Masjid Al-Barokah",
    gridRow: 3,
    gridCol: 0,
    totalMuslims: 3500,
    mustahiqCount: 32,
    muzakkiCount: 155,
    activeVolunteers: 16,
    engagementScore: 89,
    subuhAttendanceRate: 82,
    youthParticipationRate: 85,
    taklimActivityRate: 91,
    resourceDistribution: {
      panganSembakoPackages: 55,
      panganTarget: 55,
      healthServicesCount: 4,
      healthTarget: 4,
      scholarshipStudents: 14,
      scholarshipTarget: 14,
      umkmQardhCapital: 25,
      umkmTarget: 25,
      ambulanceCoverageHours: 24,
    },
    priorityUrgency: "RENDAH",
    urgentNeedNotes: "Kapasitas surplus muzakki, siap menjadi penopang sektor sekitar.",
    communityHighlights: [
      "Klaster muzakki donatur rutin beasiswa santri",
      "Kajian Fiqih Muamalah eksekutif bulanan",
    ],
  },
  {
    id: "LBG-04",
    kelurahan: "Lebung Gajah",
    sectorName: "Sektor 4 (Kawasan Rintisan)",
    masjidName: "Musholla Nurul Yaqin",
    gridRow: 3,
    gridCol: 1,
    totalMuslims: 3300,
    mustahiqCount: 22,
    muzakkiCount: 120,
    activeVolunteers: 12,
    engagementScore: 74,
    subuhAttendanceRate: 69,
    youthParticipationRate: 65,
    taklimActivityRate: 78,
    resourceDistribution: {
      panganSembakoPackages: 40,
      panganTarget: 50,
      healthServicesCount: 3,
      healthTarget: 4,
      scholarshipStudents: 8,
      scholarshipTarget: 10,
      umkmQardhCapital: 12,
      umkmTarget: 20,
      ambulanceCoverageHours: 12,
    },
    priorityUrgency: "SEDANG",
    urgentNeedNotes: "Peningkatan fasilitas wudhu dan sarana TPA sore.",
    communityHighlights: [
      "TPA mandiri binaan relawan guru ngaji",
      "Program sedekah minyak jelantah berkah",
    ],
  },

  // Karya Mulya (North-East Sector)
  {
    id: "KYM-01",
    kelurahan: "Karya Mulya",
    sectorName: "Sektor 1 (Sentra Niaga)",
    masjidName: "Masjid Al-Hidayah",
    gridRow: 0,
    gridCol: 2,
    totalMuslims: 4100,
    mustahiqCount: 48,
    muzakkiCount: 160,
    activeVolunteers: 18,
    engagementScore: 87,
    subuhAttendanceRate: 80,
    youthParticipationRate: 84,
    taklimActivityRate: 92,
    resourceDistribution: {
      panganSembakoPackages: 70,
      panganTarget: 75,
      healthServicesCount: 5,
      healthTarget: 5,
      scholarshipStudents: 15,
      scholarshipTarget: 16,
      umkmQardhCapital: 38,
      umkmTarget: 40,
      ambulanceCoverageHours: 24,
    },
    priorityUrgency: "RENDAH",
    urgentNeedNotes: "Fasilitasi sertifikasi Halal gratis bagi 15 warung binaan.",
    communityHighlights: [
      "Sentra Inkubasi UMKM Halal Digital",
      "Pojok Konsultasi Syariah & Fiqih Bisnis",
    ],
  },
  {
    id: "KYM-02",
    kelurahan: "Karya Mulya",
    sectorName: "Sektor 2 (Perumahan Asri)",
    masjidName: "Masjid Darussalam",
    gridRow: 0,
    gridCol: 3,
    totalMuslims: 3400,
    mustahiqCount: 38,
    muzakkiCount: 135,
    activeVolunteers: 15,
    engagementScore: 82,
    subuhAttendanceRate: 77,
    youthParticipationRate: 74,
    taklimActivityRate: 85,
    resourceDistribution: {
      panganSembakoPackages: 50,
      panganTarget: 55,
      healthServicesCount: 4,
      healthTarget: 4,
      scholarshipStudents: 10,
      scholarshipTarget: 12,
      umkmQardhCapital: 20,
      umkmTarget: 25,
      ambulanceCoverageHours: 18,
    },
    priorityUrgency: "RENDAH",
    urgentNeedNotes: "Pengadaan proyektor dan perpustakaan digital masjid.",
    communityHighlights: [
      "Kajian Tematik Parenting Islami Ahad Pagi",
      "Grup relawan tanggap bencana kelurahan",
    ],
  },
  {
    id: "KYM-03",
    kelurahan: "Karya Mulya",
    sectorName: "Sektor 3 (Karya Jaya)",
    masjidName: "Masjid Nurul Iman",
    gridRow: 1,
    gridCol: 2,
    totalMuslims: 2800,
    mustahiqCount: 44,
    muzakkiCount: 75,
    activeVolunteers: 11,
    engagementScore: 65,
    subuhAttendanceRate: 58,
    youthParticipationRate: 52,
    taklimActivityRate: 70,
    resourceDistribution: {
      panganSembakoPackages: 55,
      panganTarget: 70,
      healthServicesCount: 2,
      healthTarget: 5,
      scholarshipStudents: 7,
      scholarshipTarget: 14,
      umkmQardhCapital: 10,
      umkmTarget: 25,
      ambulanceCoverageHours: 8,
    },
    priorityUrgency: "TINGGI",
    urgentNeedNotes: "Defisit relawan pemuda dan perluasan beasiswa santri dhuafa.",
    communityHighlights: [
      "Perlu revitalisasi Remaja Masjid & kepanitiaan",
      "Kebutuhan program bantuan biaya SPP santri",
    ],
  },
  {
    id: "KYM-04",
    kelurahan: "Karya Mulya",
    sectorName: "Sektor 4 (Griya Indah)",
    masjidName: "Musholla Al-Kautsar",
    gridRow: 1,
    gridCol: 3,
    totalMuslims: 2500,
    mustahiqCount: 35,
    muzakkiCount: 60,
    activeVolunteers: 8,
    engagementScore: 70,
    subuhAttendanceRate: 64,
    youthParticipationRate: 61,
    taklimActivityRate: 75,
    resourceDistribution: {
      panganSembakoPackages: 45,
      panganTarget: 55,
      healthServicesCount: 2,
      healthTarget: 4,
      scholarshipStudents: 6,
      scholarshipTarget: 10,
      umkmQardhCapital: 8,
      umkmTarget: 15,
      ambulanceCoverageHours: 8,
    },
    priorityUrgency: "SEDANG",
    urgentNeedNotes: "Pemberian paket nutrisi anak dan bantuan modal warung kecil.",
    communityHighlights: [
      "Kelompok rebana qasidah ibu-ibu",
      "Gerakan jumat berkah nasi bungkus",
    ],
  },

  // Srimulya (South-East Sector)
  {
    id: "SRM-01",
    kelurahan: "Srimulya",
    sectorName: "Sektor 1 (Srimulya Indah)",
    masjidName: "Masjid Al-Muhajirin",
    gridRow: 2,
    gridCol: 2,
    totalMuslims: 4300,
    mustahiqCount: 52,
    muzakkiCount: 170,
    activeVolunteers: 20,
    engagementScore: 90,
    subuhAttendanceRate: 85,
    youthParticipationRate: 86,
    taklimActivityRate: 94,
    resourceDistribution: {
      panganSembakoPackages: 85,
      panganTarget: 90,
      healthServicesCount: 6,
      healthTarget: 6,
      scholarshipStudents: 18,
      scholarshipTarget: 18,
      umkmQardhCapital: 35,
      umkmTarget: 35,
      ambulanceCoverageHours: 24,
    },
    priorityUrgency: "RENDAH",
    urgentNeedNotes: "Perluasan garasi ambulans umat dan unit cold-storage lumbung pangan.",
    communityHighlights: [
      "Posko Ambulans Jenazah & Medis Siaga 24 Jam",
      "Kajian Hadits Arba'in mingguan teramai",
    ],
  },
  {
    id: "SRM-02",
    kelurahan: "Srimulya",
    sectorName: "Sektor 2 (Borneo Raya)",
    masjidName: "Masjid Al-Istiqomah",
    gridRow: 2,
    gridCol: 3,
    totalMuslims: 3600,
    mustahiqCount: 46,
    muzakkiCount: 125,
    activeVolunteers: 15,
    engagementScore: 80,
    subuhAttendanceRate: 74,
    youthParticipationRate: 71,
    taklimActivityRate: 83,
    resourceDistribution: {
      panganSembakoPackages: 60,
      panganTarget: 70,
      healthServicesCount: 4,
      healthTarget: 5,
      scholarshipStudents: 11,
      scholarshipTarget: 14,
      umkmQardhCapital: 18,
      umkmTarget: 25,
      ambulanceCoverageHours: 18,
    },
    priorityUrgency: "SEDANG",
    urgentNeedNotes: "Bantuan modal usaha qardhul hasan bagi penjahit busana muslimah.",
    communityHighlights: [
      "Koperasi simpan pinjam syariah tanpa riba",
      "Pengajian kitab fiqih wanita bulanan",
    ],
  },
  {
    id: "SRM-03",
    kelurahan: "Srimulya",
    sectorName: "Sektor 3 (Perumahan Griya)",
    masjidName: "Masjid Al-Ihsan",
    gridRow: 3,
    gridCol: 2,
    totalMuslims: 3200,
    mustahiqCount: 48,
    muzakkiCount: 110,
    activeVolunteers: 13,
    engagementScore: 76,
    subuhAttendanceRate: 70,
    youthParticipationRate: 68,
    taklimActivityRate: 80,
    resourceDistribution: {
      panganSembakoPackages: 55,
      panganTarget: 65,
      healthServicesCount: 3,
      healthTarget: 4,
      scholarshipStudents: 9,
      scholarshipTarget: 12,
      umkmQardhCapital: 15,
      umkmTarget: 20,
      ambulanceCoverageHours: 12,
    },
    priorityUrgency: "SEDANG",
    urgentNeedNotes: "Beasiswa santri berprestasi tingkat SMP dan SMA dhuafa.",
    communityHighlights: [
      "Program mentoring tahsin Al-Qur'an bapak-bapak",
      "Dapur berkah mingguan Jumat",
    ],
  },
  {
    id: "SRM-04",
    kelurahan: "Srimulya",
    sectorName: "Sektor 4 (Ujung Timur)",
    masjidName: "Musholla Babussalam",
    gridRow: 3,
    gridCol: 3,
    totalMuslims: 3000,
    mustahiqCount: 36,
    muzakkiCount: 85,
    activeVolunteers: 10,
    engagementScore: 72,
    subuhAttendanceRate: 66,
    youthParticipationRate: 64,
    taklimActivityRate: 76,
    resourceDistribution: {
      panganSembakoPackages: 45,
      panganTarget: 55,
      healthServicesCount: 2,
      healthTarget: 4,
      scholarshipStudents: 7,
      scholarshipTarget: 10,
      umkmQardhCapital: 10,
      umkmTarget: 15,
      ambulanceCoverageHours: 8,
    },
    priorityUrgency: "SEDANG",
    urgentNeedNotes: "Kebutuhan perbaikan atap ruang TPA dan suplai mushaf Al-Qur'an.",
    communityHighlights: [
      "Gerakan wakaf mushaf Al-Qur'an terjemahan",
      "Kepanitiaan qurban mandiri terorganisir",
    ],
  },
];

export default function CommunityIntelligenceSocialMapping() {
  const [selectedKelurahanFilter, setSelectedKelurahanFilter] = useState<string>("Semua");
  const [activeLayer, setActiveLayer] = useState<
    "all" | "engagement" | "resources" | "vulnerability" | "volunteers"
  >("all");
  const [activeViewMode, setActiveViewMode] = useState<
    "spatial_grid" | "district_scorecards" | "resource_matrix" | "engagement_radar"
  >("spatial_grid");
  const [selectedNode, setSelectedNode] = useState<DistrictClusterNode>(SEMATANG_BORANG_GRID_NODES[0]);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Filtered nodes
  const filteredNodes = SEMATANG_BORANG_GRID_NODES.filter((node) => {
    return selectedKelurahanFilter === "Semua" || node.kelurahan === selectedKelurahanFilter;
  });

  // Calculate aggregated intelligence metrics
  const totalMuslims = SEMATANG_BORANG_GRID_NODES.reduce((sum, n) => sum + n.totalMuslims, 0);
  const totalMustahiq = SEMATANG_BORANG_GRID_NODES.reduce((sum, n) => sum + n.mustahiqCount, 0);
  const totalMuzakki = SEMATANG_BORANG_GRID_NODES.reduce((sum, n) => sum + n.muzakkiCount, 0);
  const totalVolunteers = SEMATANG_BORANG_GRID_NODES.reduce((sum, n) => sum + n.activeVolunteers, 0);
  const avgEngagement = Math.round(
    SEMATANG_BORANG_GRID_NODES.reduce((sum, n) => sum + n.engagementScore, 0) /
      SEMATANG_BORANG_GRID_NODES.length
  );

  const totalSembakoDist = SEMATANG_BORANG_GRID_NODES.reduce(
    (sum, n) => sum + n.resourceDistribution.panganSembakoPackages,
    0
  );
  const totalSembakoTarget = SEMATANG_BORANG_GRID_NODES.reduce(
    (sum, n) => sum + n.resourceDistribution.panganTarget,
    0
  );

  const totalUmkmCapital = SEMATANG_BORANG_GRID_NODES.reduce(
    (sum, n) => sum + n.resourceDistribution.umkmQardhCapital,
    0
  );

  const totalScholarships = SEMATANG_BORANG_GRID_NODES.reduce(
    (sum, n) => sum + n.resourceDistribution.scholarshipStudents,
    0
  );

  // Helper color for node engagement
  const getNodeColorClass = (node: DistrictClusterNode) => {
    if (activeLayer === "engagement") {
      if (node.engagementScore >= 85) return "bg-emerald-800/80 border-emerald-400 text-emerald-100";
      if (node.engagementScore >= 75) return "bg-teal-800/70 border-teal-400 text-teal-100";
      if (node.engagementScore >= 68) return "bg-amber-900/70 border-amber-400 text-amber-100";
      return "bg-rose-950/80 border-rose-500 text-rose-100";
    }

    if (activeLayer === "resources") {
      const fulfillRatio = node.resourceDistribution.panganSembakoPackages / node.resourceDistribution.panganTarget;
      if (fulfillRatio >= 0.9) return "bg-emerald-900/80 border-emerald-400 text-emerald-100";
      if (fulfillRatio >= 0.75) return "bg-teal-900/70 border-teal-400 text-teal-100";
      return "bg-amber-950/80 border-amber-500 text-amber-100";
    }

    if (activeLayer === "vulnerability") {
      if (node.priorityUrgency === "KRITIS") return "bg-rose-950 border-rose-500 text-rose-100";
      if (node.priorityUrgency === "TINGGI") return "bg-rose-900/70 border-rose-400 text-rose-100";
      if (node.priorityUrgency === "SEDANG") return "bg-amber-900/70 border-amber-400 text-amber-100";
      return "bg-emerald-950/70 border-emerald-400 text-emerald-100";
    }

    if (activeLayer === "volunteers") {
      if (node.activeVolunteers >= 20) return "bg-purple-900/80 border-purple-400 text-purple-100";
      if (node.activeVolunteers >= 14) return "bg-blue-900/70 border-blue-400 text-blue-100";
      return "bg-slate-900/80 border-slate-500 text-slate-200";
    }

    // Default 'all'
    if (node.priorityUrgency === "TINGGI" || node.priorityUrgency === "KRITIS") {
      return "bg-amber-950/80 border-amber-400 text-amber-100";
    }
    return "bg-emerald-950/80 border-emerald-500/60 text-emerald-100";
  };

  const handleCopyIntelligenceSummary = () => {
    const summary = `=== LAPORAN COMMUNITY INTELLIGENCE & SOCIAL MAPPING ===
Kecamatan Sematang Borang, Kota Palembang
Waktu Sinkronisasi: Agustus 2026 (Safar 1448 H)

📊 DEMOGRAFI & UKHUWAH UMUM:
- Total Populasi Muslim: ${totalMuslims.toLocaleString("id-ID")} Jiwa
- Rata-rata Indeks Keterikatan (Engagement Index): ${avgEngagement}%
- Total Mustahiq Terdata: ${totalMustahiq} KK
- Total Muzakki Aktif: ${totalMuzakki} Donatur (Rasio Penopang ${(totalMuzakki / (totalMustahiq || 1)).toFixed(2)}x)
- Korps Relawan Siaga: ${totalVolunteers} Relawan

📦 DISTRIBUSI LOGISTIK & SUMBER DAYA:
- Lumbung Pangan Sembako: ${totalSembakoDist} / ${totalSembakoTarget} Paket (${Math.round((totalSembakoDist / totalSembakoTarget) * 100)}% Terpenuhi)
- Modal Usaha Bergulir (Qardhul Hasan): Rp ${totalUmkmCapital} Juta
- Penerima Beasiswa Santri: ${totalScholarships} Siswa
- Wilayah Prioritas Intervensi: Lebung Gajah Sektor 2 (Sanitasi Rawa) & Karya Mulya Sektor 3

Disusun otomatis oleh Engine ABDI Islamicity 4B Kaffah.`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleSimulateQuickDispatch = (actionType: string) => {
    setDispatchSuccess(`Instruksi ${actionType} untuk ${selectedNode.sectorName} (${selectedNode.masjidName}) berhasil diproses dan dikirimkan ke Satgas Relawan.`);
    setTimeout(() => setDispatchSuccess(null), 4000);
  };

  return (
    <div
      id="community-intelligence-social-mapping-root"
      className="space-y-6 bg-slate-50/50 p-1 sm:p-2 rounded-3xl"
    >
      {/* Header Banner: Islamic Community Intelligence & Social Mapping */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-emerald-950 rounded-3xl p-6 sm:p-7 text-white border border-teal-800/50 shadow-xl relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>SISTEM INTELIJEN SOSIAL & PEMETAAN UMAT BERBASIS GRID SPASIAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Community Intelligence & Social Mapping</span>
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                16 Klaster Sektor
              </span>
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Matriks pemetaan keterikatan jamaah (*engagement*), distribusi logistik lumbung pangan, kesejahteraan mustahiq vs muzakki, dan kesiapsiagaan relawan di 4 kelurahan Kecamatan Sematang Borang.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-copy-social-mapping-summary"
              onClick={handleCopyIntelligenceSummary}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-teal-700/60 text-xs font-bold text-teal-200 transition shadow-sm"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-teal-300" />
                  <span>Salin Briefing Intelijen</span>
                </>
              )}
            </button>

            <button
              id="btn-trigger-ai-refresh"
              onClick={() => {
                alert("Sinkronisasi data lapangan GIS dan buku tamu digital 24 masjid berhasil diperbarui.");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition shadow-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sinkronisasi GIS Live</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Counter Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-teal-800/40">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-teal-900/80">
            <div className="text-[11px] text-teal-300 font-medium">Populasi Muslim</div>
            <div className="text-base sm:text-lg font-black font-mono text-white mt-0.5">
              {totalMuslims.toLocaleString("id-ID")}
            </div>
            <span className="text-[10px] text-slate-400">4 Kelurahan Utama</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-teal-900/80">
            <div className="text-[11px] text-emerald-300 font-medium">Indeks Engagement</div>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-300 mt-0.5">
              {avgEngagement}%
            </div>
            <span className="text-[10px] text-emerald-400/80 font-semibold">Tingkat Keaktifan Umat</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-teal-900/80">
            <div className="text-[11px] text-amber-300 font-medium">Mustahiq Dhuafa</div>
            <div className="text-base sm:text-lg font-black font-mono text-amber-300 mt-0.5">
              {totalMustahiq} KK
            </div>
            <span className="text-[10px] text-amber-400/80">Binaan ZISWAF</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-teal-900/80">
            <div className="text-[11px] text-blue-300 font-medium">Muzakki Terdaftar</div>
            <div className="text-base sm:text-lg font-black font-mono text-blue-300 mt-0.5">
              {totalMuzakki} Jiwa
            </div>
            <span className="text-[10px] text-blue-400/80">Penopang Ukhuwah</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-teal-900/80">
            <div className="text-[11px] text-purple-300 font-medium">Lumbung Pangan</div>
            <div className="text-base sm:text-lg font-black font-mono text-purple-300 mt-0.5">
              {totalSembakoDist} Pkt
            </div>
            <span className="text-[10px] text-purple-400/80">{Math.round((totalSembakoDist / totalSembakoTarget) * 100)}% Kuota Sembako</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-teal-900/80">
            <div className="text-[11px] text-rose-300 font-medium">Relawan Terjun</div>
            <div className="text-base sm:text-lg font-black font-mono text-rose-300 mt-0.5">
              {totalVolunteers} Relawan
            </div>
            <span className="text-[10px] text-rose-400/80">Siaga Tanggap Cepat</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar: View Modes & Metric Layers */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            id="viewmode-spatial-grid"
            onClick={() => setActiveViewMode("spatial_grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewMode === "spatial_grid"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grid Matriks Spasial (4x4)</span>
          </button>

          <button
            id="viewmode-district-scorecards"
            onClick={() => setActiveViewMode("district_scorecards")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewMode === "district_scorecards"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Komparasi 4 Kelurahan</span>
          </button>

          <button
            id="viewmode-resource-matrix"
            onClick={() => setActiveViewMode("resource_matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewMode === "resource_matrix"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Matriks Sumber Daya Logistik</span>
          </button>

          <button
            id="viewmode-engagement-radar"
            onClick={() => setActiveViewMode("engagement_radar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewMode === "engagement_radar"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Indeks Keaktifan Umat</span>
          </button>
        </div>

        {/* Kelurahan & Layer Dropdowns / Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Switcher */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
            <span className="text-slate-500 font-semibold px-1.5">Layer:</span>
            <button
              onClick={() => setActiveLayer("all")}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                activeLayer === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveLayer("engagement")}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                activeLayer === "engagement" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Keaktifan
            </button>
            <button
              onClick={() => setActiveLayer("resources")}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                activeLayer === "resources" ? "bg-purple-700 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Logistik
            </button>
            <button
              onClick={() => setActiveLayer("vulnerability")}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                activeLayer === "vulnerability" ? "bg-rose-700 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Urgensi
            </button>
          </div>

          {/* District Filter */}
          <select
            id="filter-kelurahan-social-mapping"
            value={selectedKelurahanFilter}
            onChange={(e) => setSelectedKelurahanFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Semua">Semua Kelurahan (16 Sektor)</option>
            <option value="Sukamulya">Kelurahan Sukamulya</option>
            <option value="Lebung Gajah">Kelurahan Lebung Gajah</option>
            <option value="Karya Mulya">Kelurahan Karya Mulya</option>
            <option value="Srimulya">Kelurahan Srimulya</option>
          </select>
        </div>
      </div>

      {/* Notification Banner for Dispatch Action */}
      {dispatchSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-2xl flex items-center justify-between text-xs animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dispatchSuccess}</span>
          </div>
          <button
            onClick={() => setDispatchSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* VIEW MODE 1: SPATIAL 4x4 GRID MATRIX (Flagship Grid-based visualization) */}
      {activeViewMode === "spatial_grid" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 4x4 Spatial Grid Cluster Map (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-800 text-white space-y-4 shadow-lg relative overflow-hidden">
            {/* Grid Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Matriks Klaster Spasial Sematang Borang (4x4 Grid Heatmap)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>Total 16 Klaster RW</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">24 Masjid Terpetakan</span>
              </div>
            </div>

            {/* Grid Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-semibold text-slate-400">Skala Indikator:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                  <span>Optimal (&gt;85%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-teal-500"></span>
                  <span>Stabil (75-84%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                  <span>Perhatian (65-74%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                  <span>Prioritas Intervensi</span>
                </span>
              </div>
            </div>

            {/* District Quadrant Labels */}
            <div className="grid grid-cols-2 gap-4 text-center font-bold text-xs text-slate-400 pt-1">
              <div className="bg-slate-900/50 py-1 rounded-lg border border-slate-800/80 text-emerald-400">
                BARAT LAUT : KEL. SUKAMULYA
              </div>
              <div className="bg-slate-900/50 py-1 rounded-lg border border-slate-800/80 text-teal-400">
                TIMUR LAUT : KEL. KARYA MULYA
              </div>
            </div>

            {/* Interactive 4x4 Grid Matrix Container */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const nodeColor = getNodeColorClass(node);

                return (
                  <button
                    key={node.id}
                    id={`grid-node-${node.id}`}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[135px] ${nodeColor} ${
                      isSelected
                        ? "ring-3 ring-amber-400 scale-[1.03] shadow-xl z-10"
                        : "hover:scale-[1.01] hover:brightness-110 opacity-95"
                    }`}
                  >
                    {/* Top Row in Cell */}
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase opacity-80 block">
                          {node.kelurahan}
                        </span>
                        <h4 className="font-extrabold text-xs leading-snug line-clamp-1">
                          {node.masjidName}
                        </h4>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                          node.priorityUrgency === "KRITIS" || node.priorityUrgency === "TINGGI"
                            ? "bg-rose-500/30 text-rose-200 border border-rose-400/50"
                            : "bg-emerald-500/30 text-emerald-200 border border-emerald-400/50"
                        }`}
                      >
                        {node.id}
                      </span>
                    </div>

                    {/* Middle: Engagement & Volunteers Indicators */}
                    <div className="my-1.5 space-y-1">
                      <div className="flex justify-between items-baseline text-[11px]">
                        <span className="opacity-80">Keaktifan:</span>
                        <span className="font-mono font-extrabold text-white">
                          {node.engagementScore}%
                        </span>
                      </div>
                      {/* Mini Bar */}
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all"
                          style={{ width: `${node.engagementScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Bottom Stats Row */}
                    <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] opacity-90">
                      <span>Mustahiq: <strong>{node.mustahiqCount}</strong> KK</span>
                      <span>Relawan: <strong>{node.activeVolunteers}</strong></span>
                    </div>

                    {/* Selected Active Indicator */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Quadrant Labels */}
            <div className="grid grid-cols-2 gap-4 text-center font-bold text-xs text-slate-400 pt-1">
              <div className="bg-slate-900/50 py-1 rounded-lg border border-slate-800/80 text-blue-400">
                BARAT DAYA : KEL. LEBUNG GAJAH
              </div>
              <div className="bg-slate-900/50 py-1 rounded-lg border border-slate-800/80 text-purple-400">
                TENGGARA : KEL. SRIMULYA
              </div>
            </div>

            {/* Footer Notice */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              <span>📍 Navigasi Spasial: Klik salah satu sel sektor untuk memuat dossier intelijen lengkap</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Data Terverifikasi Amil & Takmir DKM
              </span>
            </div>
          </div>

          {/* Deep-Dive Intelligence Dossier Panel (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header Dossier */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {selectedNode.id} • {selectedNode.kelurahan}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedNode.priorityUrgency === "RENDAH"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedNode.priorityUrgency === "SEDANG"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    Urgensi: {selectedNode.priorityUrgency}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-2 leading-snug">
                  {selectedNode.sectorName}
                </h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-teal-600" />
                  <span>Basis Posko: <strong>{selectedNode.masjidName}</strong></span>
                </p>
              </div>

              {/* Engagement Core Metrics Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    Keterikatan Jamaah (Engagement Radar)
                  </span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    {selectedNode.engagementScore}%
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Sholat Subuh Berjamaah</span>
                      <span className="font-mono font-bold text-slate-900">{selectedNode.subuhAttendanceRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full"
                        style={{ width: `${selectedNode.subuhAttendanceRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Remaja Masjid & Kepemudaan</span>
                      <span className="font-mono font-bold text-slate-900">{selectedNode.youthParticipationRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${selectedNode.youthParticipationRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Majelis Taklim & Pengajian</span>
                      <span className="font-mono font-bold text-slate-900">{selectedNode.taklimActivityRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${selectedNode.taklimActivityRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Distribution Status */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  Alokasi Logistik & Bantuan Sosial
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 font-medium block">Lumbung Pangan</span>
                    <div className="font-mono font-black text-emerald-950 text-sm mt-0.5">
                      {selectedNode.resourceDistribution.panganSembakoPackages} / {selectedNode.resourceDistribution.panganTarget} Pkt
                    </div>
                    <span className="text-[10px] text-emerald-700">
                      {Math.round(
                        (selectedNode.resourceDistribution.panganSembakoPackages /
                          selectedNode.resourceDistribution.panganTarget) *
                          100
                      )}% Terpenuhi
                    </span>
                  </div>

                  <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-800 font-medium block">Layanan Kesehatan</span>
                    <div className="font-mono font-black text-blue-950 text-sm mt-0.5">
                      {selectedNode.resourceDistribution.healthServicesCount} / {selectedNode.resourceDistribution.healthTarget} Sesi
                    </div>
                    <span className="text-[10px] text-blue-700">Pemeriksaan Dhuafa</span>
                  </div>

                  <div className="bg-purple-50/70 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-[10px] text-purple-800 font-medium block">Beasiswa Santri</span>
                    <div className="font-mono font-black text-purple-950 text-sm mt-0.5">
                      {selectedNode.resourceDistribution.scholarshipStudents} Anak
                    </div>
                    <span className="text-[10px] text-purple-700">Yatim & Dhuafa</span>
                  </div>

                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-800 font-medium block">Modal Qardh UMKM</span>
                    <div className="font-mono font-black text-amber-950 text-sm mt-0.5">
                      Rp {selectedNode.resourceDistribution.umkmQardhCapital} Juta
                    </div>
                    <span className="text-[10px] text-amber-700">Usaha Berkah</span>
                  </div>
                </div>
              </div>

              {/* Urgent Needs & Highlights */}
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1.5 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rekomendasi Intervensi:</span>
                </div>
                <p className="text-amber-950 leading-relaxed text-[11px] font-medium">
                  {selectedNode.urgentNeedNotes}
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700 text-[11px]">Keunggulan Komunitas:</span>
                <ul className="space-y-1 text-[11px] text-slate-600">
                  {selectedNode.communityHighlights.map((hl, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Dispatch / Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-700">Orkestrasi Bantuan Cepat:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id={`btn-dispatch-sembako-${selectedNode.id}`}
                  onClick={() => handleSimulateQuickDispatch("Penyaluran 25 Paket Sembako")}
                  className="py-2 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition shadow-xs"
                >
                  <Package className="w-3 h-3" />
                  <span>Kirim Sembako</span>
                </button>

                <button
                  id={`btn-dispatch-medis-${selectedNode.id}`}
                  onClick={() => handleSimulateQuickDispatch("Pemberangkatan Tim Medis Keliling")}
                  className="py-2 px-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition shadow-xs"
                >
                  <Stethoscope className="w-3 h-3" />
                  <span>Layanan Medis</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DISTRICT COMPARISON SCORECARDS */}
      {activeViewMode === "district_scorecards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {KELURAHAN_GIS_DATA.map((kel) => {
            const relatedNodes = SEMATANG_BORANG_GRID_NODES.filter((n) => n.kelurahan === kel.name);
            const districtAvgEngagement = Math.round(
              relatedNodes.reduce((sum, n) => sum + n.engagementScore, 0) / (relatedNodes.length || 1)
            );
            const districtMustahiq = relatedNodes.reduce((sum, n) => sum + n.mustahiqCount, 0);
            const districtMuzakki = relatedNodes.reduce((sum, n) => sum + n.muzakkiCount, 0);
            const districtVolunteers = relatedNodes.reduce((sum, n) => sum + n.activeVolunteers, 0);
            const districtSembako = relatedNodes.reduce(
              (sum, n) => sum + n.resourceDistribution.panganSembakoPackages,
              0
            );

            return (
              <div
                key={kel.name}
                id={`card-district-score-${kel.name}`}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Kelurahan
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {kel.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-1 rounded-xl">
                      {districtAvgEngagement}% Skor
                    </span>
                  </div>
                </div>

                {/* Demographics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Populasi Muslim</span>
                    <span className="font-mono font-bold text-slate-900">{kel.totalMuslims.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Masjid & Musholla</span>
                    <span className="font-mono font-bold text-slate-900">{kel.activeMasjids} M / {kel.mushollas} Mus</span>
                  </div>
                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-800 block">Mustahiq Binaan</span>
                    <span className="font-mono font-bold text-amber-900">{districtMustahiq} KK</span>
                  </div>
                  <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-800 block">Muzakki Donatur</span>
                    <span className="font-mono font-bold text-blue-900">{districtMuzakki} Jiwa</span>
                  </div>
                </div>

                {/* Resource Summary */}
                <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-teal-900">
                    <span>Distribusi Pangan Umat:</span>
                    <span>{districtSembako} Paket</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Relawan Siaga Aktif:</span>
                    <span className="font-bold text-slate-900">{districtVolunteers} Orang</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>UMKM Halal Binaan:</span>
                    <span className="font-bold text-slate-900">{kel.umkmHalalCount} Usaha</span>
                  </div>
                </div>

                {/* Priority Need */}
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-700 text-[11px] block">Kebutuhan Prioritas:</span>
                  <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                    "{kel.priorityNeed}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedKelurahanFilter(kel.name);
                    setActiveViewMode("spatial_grid");
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                >
                  <span>Lihat 4 Sektor {kel.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: RESOURCE DISTRIBUTION MATRIX */}
      {activeViewMode === "resource_matrix" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Matriks Sebaran Logistik & Program Penyaluran ZISWAFH
              </h3>
              <p className="text-xs text-slate-500">
                Penyaluran riil vs target kuota kebutuhan di setiap sektor Kecamatan Sematang Borang
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              100% Tercatat Transparan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3 rounded-l-xl">Klaster & Masjid Basis</th>
                  <th className="p-3">Kelurahan</th>
                  <th className="p-3">Lumbung Pangan</th>
                  <th className="p-3">Layanan Medis</th>
                  <th className="p-3">Beasiswa Santri</th>
                  <th className="p-3">Modal Qardh</th>
                  <th className="p-3">Ambulans Siaga</th>
                  <th className="p-3 rounded-r-xl">Status Urgensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNodes.map((n) => {
                  const sembakoRatio = Math.round(
                    (n.resourceDistribution.panganSembakoPackages / n.resourceDistribution.panganTarget) * 100
                  );

                  return (
                    <tr
                      key={n.id}
                      onClick={() => {
                        setSelectedNode(n);
                        setActiveViewMode("spatial_grid");
                      }}
                      className="hover:bg-teal-50/50 cursor-pointer transition"
                    >
                      <td className="p-3 font-bold text-slate-900">
                        <div>{n.masjidName}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{n.sectorName} ({n.id})</div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{n.kelurahan}</td>
                      <td className="p-3 font-mono font-semibold">
                        <div className="text-slate-900">
                          {n.resourceDistribution.panganSembakoPackages} / {n.resourceDistribution.panganTarget} Pkt
                        </div>
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${sembakoRatio >= 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${sembakoRatio}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        {n.resourceDistribution.healthServicesCount} Sesi / bln
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-900">
                        {n.resourceDistribution.scholarshipStudents} Santri
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        Rp {n.resourceDistribution.umkmQardhCapital} Jt
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {n.resourceDistribution.ambulanceCoverageHours} Jam/mgg
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            n.priorityUrgency === "RENDAH"
                              ? "bg-emerald-100 text-emerald-800"
                              : n.priorityUrgency === "SEDANG"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {n.priorityUrgency}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: ENGAGEMENT RADAR & YOUTH/TAKLIM INDEX */}
      {activeViewMode === "engagement_radar" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top 3 High Engagement Hubs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Flame className="w-5 h-5 text-amber-500" />
              <h4 className="font-extrabold text-slate-900 text-sm">
                Sektor Teraktif (Top Engagement)
              </h4>
            </div>

            <div className="space-y-3">
              {SEMATANG_BORANG_GRID_NODES.slice()
                .sort((a, b) => b.engagementScore - a.engagementScore)
                .slice(0, 4)
                .map((n, idx) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setSelectedNode(n);
                      setActiveViewMode("spatial_grid");
                    }}
                    className="p-3 bg-emerald-50/50 hover:bg-emerald-100/70 cursor-pointer rounded-2xl border border-emerald-100 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{n.masjidName}</div>
                        <div className="text-[10px] text-slate-500">{n.kelurahan} • {n.sectorName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-800 text-sm">{n.engagementScore}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Subuh Attendance Leadership */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Users className="w-5 h-5 text-teal-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">
                Kehadiran Subuh Berjamaah Tertinggi
              </h4>
            </div>

            <div className="space-y-3">
              {SEMATANG_BORANG_GRID_NODES.slice()
                .sort((a, b) => b.subuhAttendanceRate - a.subuhAttendanceRate)
                .slice(0, 4)
                .map((n, idx) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setSelectedNode(n);
                      setActiveViewMode("spatial_grid");
                    }}
                    className="p-3 bg-teal-50/50 hover:bg-teal-100/70 cursor-pointer rounded-2xl border border-teal-100 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{n.masjidName}</div>
                        <div className="text-[10px] text-slate-500">{n.kelurahan}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-teal-800 text-sm">{n.subuhAttendanceRate}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Youth & Remaja Masjid Engagement */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">
                Aktivisme Pemuda & Remaja Masjid
              </h4>
            </div>

            <div className="space-y-3">
              {SEMATANG_BORANG_GRID_NODES.slice()
                .sort((a, b) => b.youthParticipationRate - a.youthParticipationRate)
                .slice(0, 4)
                .map((n, idx) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setSelectedNode(n);
                      setActiveViewMode("spatial_grid");
                    }}
                    className="p-3 bg-purple-50/50 hover:bg-purple-100/70 cursor-pointer rounded-2xl border border-purple-100 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{n.masjidName}</div>
                        <div className="text-[10px] text-slate-500">{n.kelurahan}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-purple-800 text-sm">{n.youthParticipationRate}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
