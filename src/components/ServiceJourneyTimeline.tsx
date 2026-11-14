import { useState, useMemo, FormEvent } from "react";
import confetti from "canvas-confetti";
import {
  Milestone,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Download,
  Share2,
  Sliders,
  User,
  Zap,
  Target,
  BookOpen,
  Heart,
  Stethoscope,
  Building,
  Wrench,
  Cpu,
  Flame,
  Star,
  Check,
  X,
  Plus,
  ArrowRight,
  Compass,
  Briefcase,
  Gift,
  HelpCircle,
  BarChart2,
  RefreshCw,
  Search,
  MessageSquareQuote,
  ThumbsUp,
  UserCheck,
} from "lucide-react";
import CommunityEndorsementSection from "./CommunityEndorsementSection";

export type ServiceJourneyStage = "EXPLORATION" | "ACTIVE_CONTRIBUTOR" | "SENIOR_LEADER" | "MASTER_MENTOR";

export interface SkillGrowthItem {
  id: string;
  skillName: string;
  category: "Kesehatan / Medis" | "Akuntansi & Finansial" | "Teknologi & IT" | "Hukum & Syariah" | "Pendidikan & Tahfidz" | "Teknik & Fisik" | "Sosial & Jenazah";
  initialLevel: number; // 1 - 5
  currentLevel: number; // 1 - 5
  levelLabel: string;
  hoursInvested: number;
  unlockedAt: string;
  verifiedByDkm: boolean;
  proficiencyPct: number; // 0 - 100
}

export interface ServiceMilestone {
  id: string;
  title: string;
  category: "Pencapaian Jam Khidmah" | "Sertifikasi & Pelatihan" | "Kepemimpinan Lapangan" | "Dampak Sosial Umat" | "Inisiasi Proyek Baru";
  date: string;
  hijriDate?: string;
  location: string;
  description: string;
  hoursAccumulatedAtPoint: number;
  badgeAwarded?: {
    title: string;
    icon: string;
    tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    colorHex: string;
  };
  impactMetric: string;
  isCompleted: boolean;
  verifiedBy: string;
  dkmSignatureToken: string;
  tasksCompletedInside: {
    id: string;
    title: string;
    role: string;
    status: "COMPLETED" | "VERIFIED";
  }[];
}

export interface MemberServiceProfile {
  id: string;
  name: string;
  avatarColor: string;
  roleTitle: string;
  profession: string;
  homeMasjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  joinedDate: string;
  serviceStage: ServiceJourneyStage;
  totalServiceHours: number;
  targetYearlyHours: number;
  totalMissionsCompleted: number;
  beneficiariesServed: number;
  sroiContributionRp: number; // Social Return On Investment
  currentRank: string;
  nextMilestoneGoal: string;
  hoursToNextRank: number;
  skillsAcquired: SkillGrowthItem[];
  timelineMilestones: ServiceMilestone[];
}

export const INITIAL_MEMBERS_JOURNEY: MemberServiceProfile[] = [
  {
    id: "mem-01",
    name: "Ahmad Rizky Pratama",
    avatarColor: "bg-emerald-600",
    roleTitle: "Koordinator Tim Medis Lapangan",
    profession: "Perawat Klinis & Relawan Kesehatan Dhuafa",
    homeMasjid: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya",
    joinedDate: "12 Januari 2025 (Rajab 1446 H)",
    serviceStage: "SENIOR_LEADER",
    totalServiceHours: 148,
    targetYearlyHours: 200,
    totalMissionsCompleted: 24,
    beneficiariesServed: 420,
    sroiContributionRp: 11100000,
    currentRank: "Khadim Medis Utama (Tier Gold)",
    nextMilestoneGoal: "Master Khidmah Kesehatan Sematang Borang (200 Jam)",
    hoursToNextRank: 52,
    skillsAcquired: [
      {
        id: "sk-01",
        skillName: "Skrining Penyakit Tidak Menular (PTM) Lansia",
        category: "Kesehatan / Medis",
        initialLevel: 2,
        currentLevel: 5,
        levelLabel: "Instruktur / Master Verifikator",
        hoursInvested: 64,
        unlockedAt: "15 Jan 2025",
        verifiedByDkm: true,
        proficiencyPct: 96,
      },
      {
        id: "sk-02",
        skillName: "Triase & Tanggap Darurat Bencana",
        category: "Kesehatan / Medis",
        initialLevel: 1,
        currentLevel: 4,
        levelLabel: "Praktisi Mahir Lapangan",
        hoursInvested: 38,
        unlockedAt: "20 Mar 2025",
        verifiedByDkm: true,
        proficiencyPct: 85,
      },
      {
        id: "sk-03",
        skillName: "Manajemen Logistik Obat & P3K Masjid",
        category: "Teknik & Fisik",
        initialLevel: 1,
        currentLevel: 4,
        levelLabel: "Koordinator Gudang Medis",
        hoursInvested: 26,
        unlockedAt: "10 Jun 2025",
        verifiedByDkm: true,
        proficiencyPct: 80,
      },
      {
        id: "sk-04",
        skillName: "Kepemimpinan & Koordinasi Relawan Remaja",
        category: "Pendidikan & Tahfidz",
        initialLevel: 1,
        currentLevel: 3,
        levelLabel: "Team Lead Lapangan",
        hoursInvested: 20,
        unlockedAt: "05 Agu 2025",
        verifiedByDkm: true,
        proficiencyPct: 75,
      },
    ],
    timelineMilestones: [
      {
        id: "ms-01",
        title: "Ikrarkan Niat Khidmah & Inisiasi Relawan Pertama",
        category: "Inisiasi Proyek Baru",
        date: "12 Jan 2025",
        hijriDate: "12 Rajab 1446 H",
        location: "Masjid Al-Ikhlas Sukamulya",
        description: "Menghadiri orientasi perdana relawan pilar Berjamaah ABDI Sematang Borang dan mendaftar di Talent Registry spesialisasi kesehatan.",
        hoursAccumulatedAtPoint: 4,
        badgeAwarded: {
          title: "Bintang Pemula Berkah",
          icon: "Sparkles",
          tier: "BRONZE",
          colorHex: "#cd7f32",
        },
        impactMetric: "Memulai komitmen khidmah 4 jam",
        isCompleted: true,
        verifiedBy: "Ustadz Faisal Basri (DKM Sukamulya)",
        dkmSignatureToken: "DKM-SUKA-2025-0112",
        tasksCompletedInside: [
          { id: "tk-01", title: "Registrasi KYC Relawan & Pakta Integritas Syariah", role: "Peserta Orientasi", status: "VERIFIED" },
          { id: "tk-02", title: "Pemeriksaan Kelayakan Alat Tensi Medis Masjid", role: "Teknisi P3K", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-02",
        title: "Posko Kesehatan Akbar Lansia Dhuafa Perdana (25 Jam Khidmah)",
        category: "Pencapaian Jam Khidmah",
        date: "18 Feb 2025",
        hijriDate: "19 Sya'ban 1446 H",
        location: "Masjid Baitul Muttaqin Sukamulya",
        description: "Memimpin meja skrining gula darah & tensi melayani 65 lansia mustahiq di Sukamulya, meraih pencapaian 25 jam khidmah pertama.",
        hoursAccumulatedAtPoint: 28,
        badgeAwarded: {
          title: "Satgas Sehat Umat 25 Jam",
          icon: "Stethoscope",
          tier: "BRONZE",
          colorHex: "#10b981",
        },
        impactMetric: "65 Lansia mustahiq diperiksa gratis",
        isCompleted: true,
        verifiedBy: "dr. Nurul Azizah (Koord Medis)",
        dkmSignatureToken: "DKM-SUKA-2025-0218",
        tasksCompletedInside: [
          { id: "tk-03", title: "Skrining 65 Lansia Sukamulya", role: "Pemeriksa Utama", status: "VERIFIED" },
          { id: "tk-04", title: "Konseling Pola Makan Halal Thayyib", role: "Edukator Gizi", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-03",
        title: "Sertifikasi Tanggap Darurat Medis & P3K Kebencanaan",
        category: "Sertifikasi & Pelatihan",
        date: "25 Apr 2025",
        hijriDate: "27 Syawal 1446 H",
        location: "Gedung Diklat Umat Sematang Borang",
        description: "Lulus sertifikasi pelatihan triase bencana dan penanganan henti jantung mandiri berstandar Palang Merah & Lembaga Kesehatan MUI.",
        hoursAccumulatedAtPoint: 52,
        badgeAwarded: {
          title: "Sertifikasi Tanggap Darurat",
          icon: "ShieldCheck",
          tier: "SILVER",
          colorHex: "#94a3b8",
        },
        impactMetric: "Kompetensi Triase Bencana Grade A",
        isCompleted: true,
        verifiedBy: "Badan Penanggulangan Bencana Umat",
        dkmSignatureToken: "DKM-SERTIF-2025-0425",
        tasksCompletedInside: [
          { id: "tk-05", title: "Simulasi Evakuasi Korban Banjir Rawa", role: "First Responder", status: "VERIFIED" },
          { id: "tk-06", title: "Uji Teori Bantuan Hidup Dasar (BHD)", role: "Peserta Ujian", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-04",
        title: "Pencapaian 100 Jam Khidmah: Promosi Koordinator Medis Wilayah",
        category: "Kepemimpinan Lapangan",
        date: "04 Jun 2025",
        hijriDate: "08 Dzulhijjah 1446 H",
        location: "Masjid Baiturrahman Lebung Gajah",
        description: "Mencapai tonggak emas 100 jam pengabdian nyata, diangkat sebagai Koordinator Khidmah Kesehatan lintas 4 kelurahan.",
        hoursAccumulatedAtPoint: 104,
        badgeAwarded: {
          title: "Khadim Teladan 100 Jam",
          icon: "Award",
          tier: "GOLD",
          colorHex: "#f59e0b",
        },
        impactMetric: "100+ Jam Terverifikasi DKM & 300+ Mustahiq",
        isCompleted: true,
        verifiedBy: "Ketua Forum DKM Sematang Borang",
        dkmSignatureToken: "DKM-LEBUNG-2025-0604",
        tasksCompletedInside: [
          { id: "tk-07", title: "Koordinasi Posko Medis Idul Adha 1446 H", role: "Ketua Koordinator", status: "VERIFIED" },
          { id: "tk-08", title: "Penyusunan SOP Pemeriksaan Berkala Masjid", role: "Lead Author SOP", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-05",
        title: "Klinik Keliling Safari Subuh & Skrining Glukosa Terpadu",
        category: "Dampak Sosial Umat",
        date: "16 Agu 2026",
        hijriDate: "03 Safar 1448 H",
        location: "Masjid Al-Ikhlas & Babussalam",
        description: "Memimpin 12 relawan muda dalam aksi pemeriksaan terpadu seusai Kuliah Subuh Gabungan dengan presensi QR instan.",
        hoursAccumulatedAtPoint: 148,
        badgeAwarded: {
          title: "Pahlawan Khidmah Medis",
          icon: "Flame",
          tier: "PLATINUM",
          colorHex: "#06b6d4",
        },
        impactMetric: "420 Akumulasi Mustahiq & Rp 11.1 Juta SROI",
        isCompleted: true,
        verifiedBy: "dr. Nurul Azizah & DKM Al-Ikhlas",
        dkmSignatureToken: "DKM-SUKA-2026-0816",
        tasksCompletedInside: [
          { id: "tk-09", title: "Presensi QR Relawan Medis Live Kiosk", role: "Supervisor Presensi", status: "VERIFIED" },
          { id: "tk-10", title: "Edukasi Obat Halal Pasien Hipertensi", role: "Konselor Farmasi", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-06",
        title: "Target Puncak: Master Khidmah 200 Jam & Pusat Inkubasi Kader",
        category: "Inisiasi Proyek Baru",
        date: "Target Nov 2026",
        hijriDate: "Jumadil Ula 1448 H",
        location: "Sentra Umat Sematang Borang",
        description: "Menuntaskan 200 jam kumulatif dan mendirikan Posko Kesehatan Mandiri berbasis Masjid 24 jam dengan 20 relawan muda binaan.",
        hoursAccumulatedAtPoint: 200,
        badgeAwarded: {
          title: "Grand Master Khidmah Sematang Borang",
          icon: "Star",
          tier: "PLATINUM",
          colorHex: "#8b5cf6",
        },
        impactMetric: "Target 200 Jam & Inkubasi 20 Kader Muda",
        isCompleted: false,
        verifiedBy: "Menunggu Akumulasi Jam (Sisa 52 Jam)",
        dkmSignatureToken: "PENDING-GOAL-200H",
        tasksCompletedInside: [
          { id: "tk-11", title: "Program Magang 20 Mahasiswa Medis di Masjid", role: "Mentor Utama", status: "COMPLETED" },
          { id: "tk-12", title: "Klinik Dhuafa Bebas Biaya 24 Jam", role: "Project Director", status: "COMPLETED" },
        ],
      },
    ],
  },
  {
    id: "mem-02",
    name: "Siti Fatimah Azzahra",
    avatarColor: "bg-pink-600",
    roleTitle: "Apoteker & Edukator Obat Halal",
    profession: "Apoteker Klinis & Formulator Herbal",
    homeMasjid: "Masjid Baiturrahman",
    kelurahan: "Lebung Gajah",
    joinedDate: "10 Februari 2025 (Sya'ban 1446 H)",
    serviceStage: "ACTIVE_CONTRIBUTOR",
    totalServiceHours: 86,
    targetYearlyHours: 150,
    totalMissionsCompleted: 16,
    beneficiariesServed: 280,
    sroiContributionRp: 6450000,
    currentRank: "Khadim Farmasi Pratama (Tier Silver)",
    nextMilestoneGoal: "Pencapaian 100 Jam Khidmah Berkelanjutan",
    hoursToNextRank: 14,
    skillsAcquired: [
      {
        id: "sk-21",
        skillName: "Edukasi Kehalalan Bahan Obat & Kosmetik",
        category: "Kesehatan / Medis",
        initialLevel: 2,
        currentLevel: 4,
        levelLabel: "Auditor Halal Mandiri",
        hoursInvested: 40,
        unlockedAt: "15 Feb 2025",
        verifiedByDkm: true,
        proficiencyPct: 88,
      },
      {
        id: "sk-22",
        skillName: "Pengelolaan Apotek Dhuafa Berkah",
        category: "Akuntansi & Finansial",
        initialLevel: 1,
        currentLevel: 3,
        levelLabel: "Apoteker Lapangan",
        hoursInvested: 28,
        unlockedAt: "10 Apr 2025",
        verifiedByDkm: true,
        proficiencyPct: 78,
      },
      {
        id: "sk-23",
        skillName: "Formulasi Jamu Thibbun Nabawi Standar",
        category: "Pendidikan & Tahfidz",
        initialLevel: 1,
        currentLevel: 3,
        levelLabel: "Praktisi Herbal Thayyib",
        hoursInvested: 18,
        unlockedAt: "20 Mei 2025",
        verifiedByDkm: true,
        proficiencyPct: 72,
      },
    ],
    timelineMilestones: [
      {
        id: "ms-21",
        title: "Pendaftaran Relawan Farmasi & Sertifikasi Bahan Halal",
        category: "Sertifikasi & Pelatihan",
        date: "10 Feb 2025",
        hijriDate: "11 Sya'ban 1446 H",
        location: "Masjid Baiturrahman Lebung Gajah",
        description: "Bergabung dalam jejaring Khidmah Medis Dhuafa untuk mengawal keamanan dan kehalalan obat bagi mustahiq.",
        hoursAccumulatedAtPoint: 6,
        badgeAwarded: {
          title: "Pejuang Obat Halal",
          icon: "ShieldCheck",
          tier: "BRONZE",
          colorHex: "#10b981",
        },
        impactMetric: "6 Jam Orientasi Farmasi Syariah",
        isCompleted: true,
        verifiedBy: "Ustadz Rahmat Hidayat",
        dkmSignatureToken: "DKM-LEBUNG-2025-0210",
        tasksCompletedInside: [
          { id: "tk-21", title: "Inventarisasi 150 Jenis Obat Sumbangan", role: "Pemeriksa Kedaluwarsa", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-22",
        title: "Penyaluran 200 Paket Vitamin & Suplemen Ramadhan",
        category: "Dampak Sosial Umat",
        date: "15 Mar 2025",
        hijriDate: "15 Ramadhan 1446 H",
        location: "Lebung Gajah RW 03",
        description: "Menyalurkan paket nutrisi dan multivitamin kepada 200 keluarga mustahiq dan lansia yang menjalankan ibadah puasa.",
        hoursAccumulatedAtPoint: 42,
        badgeAwarded: {
          title: "Bintang Ramadhan Berkah",
          icon: "Heart",
          tier: "SILVER",
          colorHex: "#ec4899",
        },
        impactMetric: "200 Paket Nutrisi Tersalurkan",
        isCompleted: true,
        verifiedBy: "Ibu Hajjah Maryam",
        dkmSignatureToken: "DKM-LEBUNG-2025-0315",
        tasksCompletedInside: [
          { id: "tk-22", title: "Packaging Vitamin & Petunjuk Minum", role: "Lead Apoteker", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-23",
        title: "Pencapaian 86 Jam: Sesi Edukasi Obat Rutin Posyandu",
        category: "Pencapaian Jam Khidmah",
        date: "15 Agu 2026",
        hijriDate: "02 Safar 1448 H",
        location: "Masjid Al-Ikhlas Sukamulya",
        description: "Memandu penyuluhan pencegahan resistensi antibiotik dan keamanan konsumsi obat herbal bagi 80 jamaah ibu-ibu.",
        hoursAccumulatedAtPoint: 86,
        badgeAwarded: {
          title: "Duta Edukasi Farmasi Umat",
          icon: "Sparkles",
          tier: "SILVER",
          colorHex: "#f59e0b",
        },
        impactMetric: "86 Jam Aktif Terverifikasi",
        isCompleted: true,
        verifiedBy: "dr. Nurul Azizah",
        dkmSignatureToken: "DKM-SUKA-2026-0815",
        tasksCompletedInside: [
          { id: "tk-23", title: "Penyuluhan Obat Halal & Cek Interaksi Obat", role: "Pemateri", status: "VERIFIED" },
        ],
      },
    ],
  },
  {
    id: "mem-03",
    name: "Supriyadi",
    avatarColor: "bg-amber-600",
    roleTitle: "Koordinator Pertukangan & Bedah Fasum",
    profession: "Ahli Sipil, Konstruksi & Bedah Sanitasi Mustahiq",
    homeMasjid: "Masjid Al-Muhajirin",
    kelurahan: "Karya Mulya",
    joinedDate: "05 Januari 2025 (Rajab 1446 H)",
    serviceStage: "MASTER_MENTOR",
    totalServiceHours: 215,
    targetYearlyHours: 250,
    totalMissionsCompleted: 32,
    beneficiariesServed: 18,
    sroiContributionRp: 17200000,
    currentRank: "Arsitek Kebaikan (Tier Platinum)",
    nextMilestoneGoal: "Pembangunan Sentra Air Bersih 4 Kelurahan (250 Jam)",
    hoursToNextRank: 35,
    skillsAcquired: [
      {
        id: "sk-31",
        skillName: "Bedah Rumah & Struktur Tahan Gempa",
        category: "Teknik & Fisik",
        initialLevel: 3,
        currentLevel: 5,
        levelLabel: "Master Mandor & Desainer Struktur",
        hoursInvested: 95,
        unlockedAt: "10 Jan 2025",
        verifiedByDkm: true,
        proficiencyPct: 98,
      },
      {
        id: "sk-32",
        skillName: "Instalasi Filter Air Bersih Rawa Rawan Bakteri",
        category: "Teknik & Fisik",
        initialLevel: 2,
        currentLevel: 5,
        levelLabel: "Ahli Sanitasi & Filtrasi",
        hoursInvested: 70,
        unlockedAt: "12 Mar 2025",
        verifiedByDkm: true,
        proficiencyPct: 95,
      },
      {
        id: "sk-33",
        skillName: "Manajemen Material & Anggaran Bangunan ZISWAF",
        category: "Akuntansi & Finansial",
        initialLevel: 2,
        currentLevel: 4,
        levelLabel: "Estimator RAB Syariah",
        hoursInvested: 50,
        unlockedAt: "20 Mei 2025",
        verifiedByDkm: true,
        proficiencyPct: 88,
      },
    ],
    timelineMilestones: [
      {
        id: "ms-31",
        title: "Perbaikan Atap & Tempat Wudhu Musholla Babussalam",
        category: "Inisiasi Proyek Baru",
        date: "14 Jan 2025",
        hijriDate: "14 Rajab 1446 H",
        location: "Musholla Babussalam Karya Mulya",
        description: "Mengganti seng bocor dan memasang 6 kran wudhu hemat air otomatis bersama tim pemuda.",
        hoursAccumulatedAtPoint: 18,
        badgeAwarded: {
          title: "Pionir Resik Fasum",
          icon: "Wrench",
          tier: "BRONZE",
          colorHex: "#ea580c",
        },
        impactMetric: "Fasum 120 jamaah wudhu tertangani",
        isCompleted: true,
        verifiedBy: "H. Syamsudin (DKM Al-Muhajirin)",
        dkmSignatureToken: "DKM-KARYA-2025-0114",
        tasksCompletedInside: [
          { id: "tk-31", title: "Pemasangan Talang & Kran Otomatis", role: "Mandor Sipil", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-32",
        title: "Bedah Rumah Mustahiq Ibu Aminah: Sanitasi & Kamar Layak",
        category: "Dampak Sosial Umat",
        date: "28 Mei 2025",
        hijriDate: "01 Dzulhijjah 1446 H",
        location: "Karya Mulya RW 03",
        description: "Memimpin bedah rumah 3 hari penuh dari lantai tanah menjadi plester keramik dan instalasi septic tank bersih.",
        hoursAccumulatedAtPoint: 110,
        badgeAwarded: {
          title: "Pahlawan Bedah Rumah",
          icon: "Building",
          tier: "GOLD",
          colorHex: "#f59e0b",
        },
        impactMetric: "1 Rumah mustahiq dhuafa layak huni",
        isCompleted: true,
        verifiedBy: "Camat & DKM Al-Muhajirin",
        dkmSignatureToken: "DKM-KARYA-2025-0528",
        tasksCompletedInside: [
          { id: "tk-32", title: "Pengecoran Pondasi & Plesteran", role: "Ketua Tim Sipil", status: "VERIFIED" },
          { id: "tk-33", title: "Pemasangan Septic Tank Bio-Filter", role: "Teknisi Sanitasi", status: "VERIFIED" },
        ],
      },
      {
        id: "ms-33",
        title: "Pencapaian 200+ Jam: Master Mentor Pelatihan Pertukangan Pemuda",
        category: "Kepemimpinan Lapangan",
        date: "14 Agu 2026",
        hijriDate: "01 Safar 1448 H",
        location: "Balai Karya Umat Karya Mulya",
        description: "Mencapai rekor 215 jam khidmah dan melatih 15 pemuda pengangguran memiliki keterampilan tukang sipil bersertifikat.",
        hoursAccumulatedAtPoint: 215,
        badgeAwarded: {
          title: "Mahaguru Khidmah Sipil",
          icon: "Award",
          tier: "PLATINUM",
          colorHex: "#8b5cf6",
        },
        impactMetric: "215 Jam Khidmah & 15 Kader Terlatih",
        isCompleted: true,
        verifiedBy: "Forum DKM & Tokoh Masyarakat",
        dkmSignatureToken: "DKM-KARYA-2026-0814",
        tasksCompletedInside: [
          { id: "tk-34", title: "Workshop Woodworking & Pipa untuk Remaja", role: "Instruktur Utama", status: "VERIFIED" },
        ],
      },
    ],
  },
];

export default function ServiceJourneyTimeline() {
  const [members, setMembers] = useState<MemberServiceProfile[]>(INITIAL_MEMBERS_JOURNEY);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(INITIAL_MEMBERS_JOURNEY[0].id);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "COMPLETED" | "UPCOMING">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeViewTab, setActiveViewTab] = useState<"TIMELINE_VIEW" | "SKILL_GROWTH_MATRIX" | "MILESTONES_OVERVIEW" | "COMMUNITY_ENDORSEMENTS">("TIMELINE_VIEW");
  const [selectedMilestoneModal, setSelectedMilestoneModal] = useState<ServiceMilestone | null>(null);

  // New Milestone Form State
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState<boolean>(false);
  const [newMsTitle, setNewMsTitle] = useState<string>("");
  const [newMsCategory, setNewMsCategory] = useState<ServiceMilestone["category"]>("Pencapaian Jam Khidmah");
  const [newMsDate, setNewMsDate] = useState<string>("16 Agustus 2026");
  const [newMsLocation, setNewMsLocation] = useState<string>("Masjid Al-Ikhlas Sukamulya");
  const [newMsDescription, setNewMsDescription] = useState<string>("");
  const [newMsHours, setNewMsHours] = useState<number>(8);
  const [newMsImpact, setNewMsImpact] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Milestones
  const filteredMilestones = useMemo(() => {
    return selectedMember.timelineMilestones.filter((ms) => {
      const matchCat = filterCategory === "ALL" || ms.category === filterCategory;
      const matchStatus =
        filterStatus === "ALL" ||
        (filterStatus === "COMPLETED" && ms.isCompleted) ||
        (filterStatus === "UPCOMING" && !ms.isCompleted);
      const matchSearch =
        searchQuery.trim() === "" ||
        ms.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ms.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ms.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [selectedMember, filterCategory, filterStatus, searchQuery]);

  // Skill growth summary
  const avgProficiency = useMemo(() => {
    if (selectedMember.skillsAcquired.length === 0) return 0;
    const sum = selectedMember.skillsAcquired.reduce((acc, s) => acc + s.proficiencyPct, 0);
    return Math.round(sum / selectedMember.skillsAcquired.length);
  }, [selectedMember]);

  const handleAddMilestone = (e: FormEvent) => {
    e.preventDefault();
    if (!newMsTitle.trim() || !newMsDescription.trim()) return;

    const newMilestone: ServiceMilestone = {
      id: `ms-${Date.now()}`,
      title: newMsTitle,
      category: newMsCategory,
      date: newMsDate,
      hijriDate: "03 Safar 1448 H",
      location: newMsLocation,
      description: newMsDescription,
      hoursAccumulatedAtPoint: selectedMember.totalServiceHours + newMsHours,
      badgeAwarded: {
        title: `Pencapaian: ${newMsTitle.slice(0, 24)}`,
        icon: "Award",
        tier: "SILVER",
        colorHex: "#10b981",
      },
      impactMetric: newMsImpact || `${newMsHours} Jam Khidmah Tambahan`,
      isCompleted: true,
      verifiedBy: "DKM & Supervisor Presensi (Terverifikasi)",
      dkmSignatureToken: `DKM-SIG-${Date.now().toString().slice(-6)}`,
      tasksCompletedInside: [
        { id: `tk-${Date.now()}-1`, title: newMsTitle, role: selectedMember.roleTitle, status: "VERIFIED" },
      ],
    };

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === selectedMember.id) {
          return {
            ...m,
            totalServiceHours: m.totalServiceHours + newMsHours,
            totalMissionsCompleted: m.totalMissionsCompleted + 1,
            timelineMilestones: [newMilestone, ...m.timelineMilestones],
          };
        }
        return m;
      })
    );

    // Fire celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setShowAddMilestoneModal(false);
    setNewMsTitle("");
    setNewMsDescription("");
    setNewMsImpact("");
    showToast(`Alhamdulillah! Tonggak Khidmah baru berhasil dicatat di perjalanan ${selectedMember.name}.`);
  };

  const handleExportTimelinePdf = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Nama Relawan,Peran,Masjid Asal,Kelurahan,Total Jam Khidmah,Peringkat,Level Keterampilan Rata-rata",
        `"${selectedMember.name}","${selectedMember.roleTitle}","${selectedMember.homeMasjid}","${selectedMember.kelurahan}",${selectedMember.totalServiceHours},"${selectedMember.currentRank}",${avgProficiency}%`,
        "",
        "Tanggal,Kategori Tonggak,Judul Milestone,Lokasi,Jam Kumulatif,Dampak Sosial,Status Verifikasi DKM",
        ...selectedMember.timelineMilestones.map((ms) => {
          return `"${ms.date}","${ms.category}","${ms.title}","${ms.location}",${ms.hoursAccumulatedAtPoint},"${ms.impactMetric}","${ms.isCompleted ? 'Terverifikasi' : 'Target Mendatang'}"`;
        }),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Service_Journey_Timeline_${selectedMember.name.replace(/\s+/g, "_")}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Rekam Jejak Khidmah & Milestone berhasil diekspor.");
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "PLATINUM":
        return "from-cyan-500 to-blue-600 text-white border-cyan-400";
      case "GOLD":
        return "from-amber-400 to-yellow-600 text-slate-950 border-amber-300";
      case "SILVER":
        return "from-slate-300 to-slate-400 text-slate-950 border-slate-200";
      case "BRONZE":
      default:
        return "from-amber-700 to-amber-900 text-amber-100 border-amber-600";
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "Pencapaian Jam Khidmah":
        return "bg-emerald-950 text-emerald-300 border-emerald-500/40";
      case "Sertifikasi & Pelatihan":
        return "bg-blue-950 text-blue-300 border-blue-500/40";
      case "Kepemimpinan Lapangan":
        return "bg-purple-950 text-purple-300 border-purple-500/40";
      case "Dampak Sosial Umat":
        return "bg-pink-950 text-pink-300 border-pink-500/40";
      case "Inisiasi Proyek Baru":
      default:
        return "bg-amber-950 text-amber-300 border-amber-500/40";
    }
  };

  return (
    <div
      id="service-journey-timeline-root"
      className="space-y-6 bg-slate-950 text-slate-100 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      {/* Toast Notification */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>MEMBER SERVICE JOURNEY & SKILL GROWTH TIMELINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Service Journey Timeline</span>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
              Pilar Berjamaah
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Visualisasi kronologis interaktif yang merekam <strong>perjalanan khidmah pengabdian jamaah (Service Journey)</strong>, tonggak capaian kunci (<em>Key Milestones</em>), penugasan terselesaikan (<em>Completed Tasks</em>), dan evolusi pertumbuhan keterampilan (<em>Skill Growth</em>) berstandar verifikasi DKM.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-add-service-milestone"
            onClick={() => setShowAddMilestoneModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-bold text-slate-950 transition shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Tambah Milestone Khidmah</span>
          </button>

          <button
            id="btn-export-service-timeline"
            onClick={handleExportTimelinePdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor Perjalanan (CSV)</span>
          </button>
        </div>
      </div>

      {/* Member Profile Switcher Card */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 relative z-10 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pilih Profil Jamaah / Relawan:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {members.map((m) => {
                const isSelected = m.id === selectedMember.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 text-white border-2 border-amber-400 shadow-md ring-1 ring-amber-400/40"
                        : "bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${m.avatarColor} text-white font-bold flex items-center justify-center text-[10px]`}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="text-white text-xs font-bold leading-none">{m.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.totalServiceHours} Jam • {m.kelurahan}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-left text-xs">
              <span className="text-slate-400 text-[10px]">Status Verifikasi Khidmah:</span>
              <div className="font-bold text-emerald-400">100% Terverifikasi DKM & QRIS</div>
            </div>
          </div>
        </div>

        {/* Selected Member Hero Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left info (7 cols) */}
          <div className="md:col-span-7 flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl ${selectedMember.avatarColor} text-white font-black flex items-center justify-center text-2xl shadow-lg shrink-0`}>
              {selectedMember.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{selectedMember.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {selectedMember.currentRank}
                </span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{selectedMember.roleTitle}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{selectedMember.profession}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-0.5">
                <span>📍 {selectedMember.homeMasjid} ({selectedMember.kelurahan})</span>
                <span>•</span>
                <span>🗓️ Bergabung: {selectedMember.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Right metric highlights (5 cols) */}
          <div className="md:col-span-5 grid grid-cols-3 gap-2.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/90 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Jam Khidmah</span>
              <div className="text-xl font-black font-mono text-amber-400">{selectedMember.totalServiceHours}j</div>
              <span className="text-[9px] text-slate-500 font-mono">/ {selectedMember.targetYearlyHours}j Target</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Misi Selesai</span>
              <div className="text-xl font-black font-mono text-emerald-400">{selectedMember.totalMissionsCompleted}</div>
              <span className="text-[9px] text-emerald-500/80 font-mono">100% Sukses</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Nilai SROI</span>
              <div className="text-base font-black font-mono text-sky-400">Rp {(selectedMember.sroiContributionRp / 1000000).toFixed(1)}Jt</div>
              <span className="text-[9px] text-slate-500">Laba Sosial</span>
            </div>
          </div>
        </div>

        {/* Progress to Next Milestone Bar */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Berikutnya: <span className="text-white">{selectedMember.nextMilestoneGoal}</span></span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              Sisa {selectedMember.hoursToNextRank} Jam Lagi
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (selectedMember.totalServiceHours / selectedMember.targetYearlyHours) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 relative z-10">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            id="tab-timeline-view"
            onClick={() => setActiveViewTab("TIMELINE_VIEW")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewTab === "TIMELINE_VIEW"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Milestone className="w-3.5 h-3.5" />
            <span>Interactive Timeline ({filteredMilestones.length} Tonggak)</span>
          </button>

          <button
            id="tab-skill-growth"
            onClick={() => setActiveViewTab("SKILL_GROWTH_MATRIX")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewTab === "SKILL_GROWTH_MATRIX"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pertumbuhan Keterampilan ({selectedMember.skillsAcquired.length} Skills • {avgProficiency}%)</span>
          </button>

          <button
            id="tab-milestones-overview"
            onClick={() => setActiveViewTab("MILESTONES_OVERVIEW")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewTab === "MILESTONES_OVERVIEW"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Lencana & Prestasi ({selectedMember.timelineMilestones.filter(m => m.isCompleted).length})</span>
          </button>

          <button
            id="tab-community-endorsements"
            onClick={() => setActiveViewTab("COMMUNITY_ENDORSEMENTS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewTab === "COMMUNITY_ENDORSEMENTS"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm font-black ring-1 ring-emerald-400/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validasi Rekan Jamaah (Endorsements)</span>
          </button>
        </div>

        {/* Filter Strip when in Timeline Mode */}
        {activeViewTab === "TIMELINE_VIEW" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">Semua Kategori Tonggak</option>
                <option value="Pencapaian Jam Khidmah" className="bg-slate-900 text-slate-200">Pencapaian Jam Khidmah</option>
                <option value="Sertifikasi & Pelatihan" className="bg-slate-900 text-slate-200">Sertifikasi & Pelatihan</option>
                <option value="Kepemimpinan Lapangan" className="bg-slate-900 text-slate-200">Kepemimpinan Lapangan</option>
                <option value="Dampak Sosial Umat" className="bg-slate-900 text-slate-200">Dampak Sosial Umat</option>
                <option value="Inisiasi Proyek Baru" className="bg-slate-900 text-slate-200">Inisiasi Proyek Baru</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">Semua Status</option>
                <option value="COMPLETED" className="bg-slate-900 text-slate-200">Tercapai (Selesai)</option>
                <option value="UPCOMING" className="bg-slate-900 text-slate-200">Target Mendatang</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: INTERACTIVE VERTICAL SERVICE JOURNEY TIMELINE */}
      {activeViewTab === "TIMELINE_VIEW" && (
        <div className="space-y-6 relative z-10">
          {filteredMilestones.length === 0 ? (
            <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-white font-bold">Tidak ada tonggak yang cocok dengan filter</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Silakan ganti kategori filter atau kata kunci pencarian Anda untuk melihat tonggak khidmah relawan.
              </p>
              <button
                onClick={() => {
                  setFilterCategory("ALL");
                  setFilterStatus("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200 transition"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-emerald-500 before:to-slate-800">
              {filteredMilestones.map((milestone, idx) => {
                const isGoal = !milestone.isCompleted;

                return (
                  <div key={milestone.id} className="relative group">
                    {/* Node on Vertical Line */}
                    <div
                      className={`absolute -left-6 sm:-left-10 top-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isGoal
                          ? "bg-slate-950 border-dashed border-amber-400 text-amber-400 shadow-md animate-pulse"
                          : "bg-gradient-to-tr from-amber-500 to-emerald-400 border-slate-950 text-slate-950 font-black shadow-lg ring-4 ring-slate-900 group-hover:scale-110"
                      }`}
                    >
                      {isGoal ? (
                        <Target className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                    </div>

                    {/* Timeline Card */}
                    <div
                      onClick={() => setSelectedMilestoneModal(milestone)}
                      className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer ${
                        isGoal
                          ? "bg-slate-900/40 border-dashed border-amber-500/40 hover:border-amber-400 hover:bg-slate-900/70"
                          : "bg-slate-900/90 border-slate-800 hover:border-amber-400/80 hover:shadow-xl hover:bg-slate-900"
                      }`}
                    >
                      {/* Top metadata strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeColor(milestone.category)}`}>
                            {milestone.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            {milestone.date} {milestone.hijriDate ? `(${milestone.hijriDate})` : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            ⏱️ {milestone.hoursAccumulatedAtPoint} Jam Kumulatif
                          </span>
                          {isGoal ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                              Target Mendatang
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Tuntas & Terverifikasi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Title & Description */}
                      <div className="mt-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition flex items-center gap-2">
                            <span>{milestone.title}</span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-amber-400 transition" />
                          </h4>

                          {milestone.badgeAwarded && (
                            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-gradient-to-r ${getTierColor(milestone.badgeAwarded.tier)} text-xs font-bold shadow-md shrink-0`}>
                              <Award className="w-3.5 h-3.5" />
                              <span>{milestone.badgeAwarded.title}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {milestone.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <span>📍</span>
                            <span className="text-slate-300 font-medium">{milestone.location}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-300 font-semibold">{milestone.impactMetric}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <span>Token: {milestone.dkmSignatureToken}</span>
                          </span>
                        </div>
                      </div>

                      {/* Sub-tasks completed inside strip */}
                      {milestone.tasksCompletedInside && milestone.tasksCompletedInside.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                            <span>Tugas Selesai Terkait ({milestone.tasksCompletedInside.length} Task):</span>
                            <span className="text-[10px] text-emerald-400">Klik kartu untuk rincian digital</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {milestone.tasksCompletedInside.map((task) => (
                              <div key={task.id} className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 truncate">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="text-slate-200 font-medium truncate">{task.title}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-900 px-1.5 py-0.5 rounded">
                                  {task.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SKILL GROWTH & COMPETENCY MATRIX (Visualizing Evolution) */}
      {activeViewTab === "SKILL_GROWTH_MATRIX" && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Matriks Evolusi Keterampilan (Skill Growth & Competency Radar)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pelacakan kenaikan tingkat kemahiran dari level awal saat pertama bergabung hingga level saat ini yang telah diverifikasi oleh DKM.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                <span>Rata-rata Kemahiran: {avgProficiency}%</span>
              </div>
            </div>

            {/* Skill Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMember.skillsAcquired.map((skill) => {
                const growth = skill.currentLevel - skill.initialLevel;

                return (
                  <div key={skill.id} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 hover:border-emerald-500/40 transition space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{skill.category}</span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{skill.skillName}</h4>
                        <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>{skill.levelLabel}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          +{growth} Level Up!
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {skill.hoursInvested} Jam Praktik
                        </div>
                      </div>
                    </div>

                    {/* Visual 5-Star / 5-Bar Level Stepper */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Level Awal: <strong className="text-slate-200">Lvl {skill.initialLevel}</strong></span>
                        <span className="text-emerald-400 font-bold font-mono">Level Saat Ini: Lvl {skill.currentLevel} / 5 ({skill.proficiencyPct}%)</span>
                      </div>

                      {/* 5-Segment Level Step Bar */}
                      <div className="grid grid-cols-5 gap-1.5 h-2.5">
                        {[1, 2, 3, 4, 5].map((lvl) => {
                          const isInitial = lvl <= skill.initialLevel;
                          const isCurrent = lvl <= skill.currentLevel;

                          return (
                            <div
                              key={lvl}
                              className={`rounded-full transition-all duration-500 ${
                                isCurrent
                                  ? isInitial
                                    ? "bg-emerald-600"
                                    : "bg-gradient-to-r from-amber-400 to-emerald-400 shadow-sm"
                                  : "bg-slate-800"
                              }`}
                              title={`Level ${lvl}`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer tags */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Dibuka: {skill.unlockedAt}</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        Terverifikasi DKM
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BADGES & CERTIFICATE REPOSITORY */}
      {activeViewTab === "MILESTONES_OVERVIEW" && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Koleksi Lencana Penghargaan & Bukti Khidmah Digital</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Setiap lencana diberikan atas pencapaian jam khidmah, kelulusan sertifikasi syariah, kepemimpinan proyek maslahat umat di Sematang Borang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedMember.timelineMilestones
                .filter((m) => m.badgeAwarded)
                .map((m) => {
                  const badge = m.badgeAwarded!;
                  const isGoal = !m.isCompleted;

                  return (
                    <div
                      key={m.id}
                      className={`p-5 rounded-3xl border transition-all ${
                        isGoal
                          ? "bg-slate-950/40 border-dashed border-slate-800 opacity-60"
                          : "bg-slate-950 border-slate-800/90 hover:border-amber-500/50 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getTierColor(badge.tier)} flex items-center justify-center font-black shadow-lg shrink-0`}>
                          <Award className="w-6 h-6" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          badge.tier === "PLATINUM" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40" :
                          badge.tier === "GOLD" ? "bg-amber-950 text-amber-300 border border-amber-500/40" :
                          badge.tier === "SILVER" ? "bg-slate-800 text-slate-300 border border-slate-700" :
                          "bg-amber-900/60 text-amber-200 border border-amber-700"
                        }`}>
                          Tier {badge.tier}
                        </span>
                      </div>

                      <div className="mt-3.5 space-y-1">
                        <h4 className="text-sm font-bold text-white">{badge.title}</h4>
                        <div className="text-[11px] text-amber-400 font-medium">{m.title}</div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {m.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>🗓️ {m.date}</span>
                        <span className="font-mono text-emerald-400">{m.hoursAccumulatedAtPoint} Jam</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: PEER-TO-PEER COMMUNITY ENDORSEMENTS SYSTEM */}
      {activeViewTab === "COMMUNITY_ENDORSEMENTS" && (
        <div className="relative z-10 animate-fadeIn">
          <CommunityEndorsementSection
            selectedMember={selectedMember}
            allMembers={members}
          />
        </div>
      )}

      {/* MODAL: DETAIL OF MILESTONE */}
      {selectedMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeColor(selectedMilestoneModal.category)}`}>
                  {selectedMilestoneModal.category}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">{selectedMilestoneModal.title}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  🗓️ {selectedMilestoneModal.date} {selectedMilestoneModal.hijriDate ? `(${selectedMilestoneModal.hijriDate})` : ""} • 📍 {selectedMilestoneModal.location}
                </div>
              </div>
              <button
                onClick={() => setSelectedMilestoneModal(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi Capaian</span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  {selectedMilestoneModal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Total Jam Kumulatif:</span>
                  <div className="text-base font-black font-mono text-amber-400 mt-0.5">
                    {selectedMilestoneModal.hoursAccumulatedAtPoint} Jam Khidmah
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Dampak Terukur:</span>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    {selectedMilestoneModal.impactMetric}
                  </div>
                </div>
              </div>

              {selectedMilestoneModal.badgeAwarded && (
                <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getTierColor(selectedMilestoneModal.badgeAwarded.tier)} flex items-center justify-center font-black shrink-0`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase">Lencana Penghargaan Diberikan:</div>
                    <div className="text-xs font-black text-white">{selectedMilestoneModal.badgeAwarded.title} (Tier {selectedMilestoneModal.badgeAwarded.tier})</div>
                  </div>
                </div>
              )}

              {/* Tasks Checklist */}
              {selectedMilestoneModal.tasksCompletedInside && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rincian Penugasan Terverifikasi DKM</span>
                  <div className="space-y-1.5">
                    {selectedMilestoneModal.tasksCompletedInside.map((t) => (
                      <div key={t.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 font-medium">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                          {t.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Diverifikasi: {selectedMilestoneModal.verifiedBy}</span>
                </span>
                <span className="font-mono text-slate-500">
                  Sig: {selectedMilestoneModal.dkmSignatureToken}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedMilestoneModal(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW SERVICE MILESTONE */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span>Catat Milestone Khidmah Baru</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tambahkan tonggak capaian pengabdian untuk <strong>{selectedMember.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => setShowAddMilestoneModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Judul Tonggak / Pencapaian <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Memimpin Posko Medis Khidmah Dhuafa 50 Pasien"
                  value={newMsTitle}
                  onChange={(e) => setNewMsTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Kategori</label>
                  <select
                    value={newMsCategory}
                    onChange={(e) => setNewMsCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  >
                    <option value="Pencapaian Jam Khidmah">Pencapaian Jam Khidmah</option>
                    <option value="Sertifikasi & Pelatihan">Sertifikasi & Pelatihan</option>
                    <option value="Kepemimpinan Lapangan">Kepemimpinan Lapangan</option>
                    <option value="Dampak Sosial Umat">Dampak Sosial Umat</option>
                    <option value="Inisiasi Proyek Baru">Inisiasi Proyek Baru</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Jam Tambahan (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newMsHours}
                    onChange={(e) => setNewMsHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Tanggal Kegiatan</label>
                  <input
                    type="text"
                    value={newMsDate}
                    onChange={(e) => setNewMsDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Lokasi Pelaksanaan</label>
                  <input
                    type="text"
                    value={newMsLocation}
                    onChange={(e) => setNewMsLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Dampak Sosial Terukur (Metric)</label>
                <input
                  type="text"
                  placeholder="Misal: 50 Lansia dhuafa menerima obat & vitamin gratis"
                  value={newMsImpact}
                  onChange={(e) => setNewMsImpact(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Deskripsi Lengkap Penugasan <span className="text-rose-400">*</span></label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ceritakan peran yang dijalankan, tantangan yang diselesaikan, dan hasil kemaslahatan untuk umat..."
                  value={newMsDescription}
                  onChange={(e) => setNewMsDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Milestone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
