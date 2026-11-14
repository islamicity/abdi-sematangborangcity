import { useState, useMemo, FC } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Building,
  Briefcase,
  Sliders,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  Award,
  TrendingUp,
  Share2,
  Copy,
  Check,
  X,
  Stethoscope,
  Calculator,
  Cpu,
  Scale,
  GraduationCap,
  Wrench,
  Flame,
  ArrowRight,
  RefreshCw,
  QrCode,
  Calendar,
  Users,
} from "lucide-react";
import {
  UserProfileOnboarding,
  SkillSyncProject,
  SkillSyncMatchResult,
  SkillCategoryType,
} from "../types";
import { INITIAL_COMMUNITY_OPPORTUNITIES } from "../data/talentRegistryData";

// Comprehensive catalog of open community projects across Sematang Borang
const MASTER_COMMUNITY_PROJECTS: SkillSyncProject[] = [
  {
    id: "proj-01",
    title: "Pemeriksaan Kesehatan & Klinik Keliling Lansia Dhuafa",
    organizerMasjid: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya",
    category: "Kesehatan / Medis",
    requiredSkills: [
      "Dokter Umum",
      "Perawat",
      "Apoteker Farmasi",
      "Pertolongan Pertama Gawat Darurat",
      "Penyakit Dalam & Anak",
      "Penyuluhan Gizi Lansia",
    ],
    recommendedRole: "Dokter Pemeriksa Utama & Skrining Lansia",
    schedule: "Ahad Depan, 08:00 - 12:00 WIB",
    urgency: "Tinggi",
    volunteersNeeded: 3,
    volunteersJoined: 2,
    description:
      "Membutuhkan 1 dokter tambahan dan 1 tenaga apoteker/perawat untuk melayani 150 warga lansia penerima manfaat sembako berkah di Kelurahan Sukamulya.",
    impactScore: 98,
    estimatedHours: 4,
    tags: ["Medis", "Lansia", "Sukamulya", "Dhuafa"],
  },
  {
    id: "proj-02",
    title: "Audit Neraca Keuangan ZISWAF PSAK 109 & Transparansi Kas",
    organizerMasjid: "Baitul Maal Kecamatan Sematang Borang",
    kelurahan: "Sukamulya",
    category: "Akuntansi & Finansial",
    requiredSkills: [
      "Akuntansi PSAK 109",
      "Audit Kas Baitul Maal",
      "Penyusunan Anggaran DKM",
      "Konsultasi Pajak UMKM",
      "Laporan Keuangan Zakat",
    ],
    recommendedRole: "Auditor Independen Transparansi Kas ZISWAF",
    schedule: "20 - 25 Agustus 2026",
    urgency: "Sedang",
    volunteersNeeded: 2,
    volunteersJoined: 1,
    description:
      "Penyusunan laporan transparansi keuangan publik semester I untuk dipublikasikan pada portal open-data dan majelis taklim se-Sematang Borang.",
    impactScore: 92,
    estimatedHours: 6,
    tags: ["Keuangan", "Audit", "PSAK 109", "Transparansi"],
  },
  {
    id: "proj-03",
    title: "Tanggap Darurat Medis & Posko Siaga Bencana Banjir Musiman",
    organizerMasjid: "Masjid Darussalam",
    kelurahan: "Karya Mulya",
    category: "Kesehatan / Medis",
    requiredSkills: [
      "Pertolongan Pertama Gawat Darurat",
      "Keperawatan Darurat",
      "Pengemudi Ambulans",
      "Fisioterapi",
      "Penyakit Dalam & Anak",
    ],
    recommendedRole: "Koordinator Triase Medis Lapangan",
    schedule: "Siaga 24 Jam (Jumat - Ahad)",
    urgency: "Tinggi",
    volunteersNeeded: 4,
    volunteersJoined: 2,
    description:
      "Tim siaga reaksi cepat untuk memeriksa kesehatan warga terdampak luapan drainase dan distribusi obat-obatan dasar di RW 04 Karya Mulya.",
    impactScore: 96,
    estimatedHours: 8,
    tags: ["Darurat", "Banjir", "Medis", "Ambulans"],
  },
  {
    id: "proj-04",
    title: "Pelatihan Koding & Desain Grafis Media Dakwah Santri Yatim",
    organizerMasjid: "Masjid Nurul Huda",
    kelurahan: "Karya Mulya",
    category: "Teknologi & IT",
    requiredSkills: [
      "Web & Cloud Dev",
      "Desain Grafis Dakwah",
      "Database Jamaah",
      "Pelatihan Coding Santri",
      "Live Streaming & Audio Visual",
    ],
    recommendedRole: "Instruktur Workshop Multimedia & Web",
    schedule: "Sabtu Pagi, 09:00 - 12:00 WIB",
    urgency: "Rutin",
    volunteersNeeded: 3,
    volunteersJoined: 1,
    description:
      "Workshop intensif pembuatan website profil masjid dan poster kajian dakwah media sosial bagi 30 remaja dan santri tahfidz.",
    impactScore: 88,
    estimatedHours: 3,
    tags: ["IT", "Coding", "Santri", "Desain"],
  },
  {
    id: "proj-05",
    title: "Sertifikasi & Pemetaan 4 Titik Tanah Wakaf Produktif",
    organizerMasjid: "Masjid Al-Muhajirin",
    kelurahan: "Srimulya",
    category: "Hukum & Syariah",
    requiredSkills: [
      "Legalitas Tanah Wakaf",
      "Notariat & PPAT",
      "Konsultasi Faraidh (Waris)",
      "Advokasi Warga Dhuafa",
    ],
    recommendedRole: "Konsultan Hukum & Notariat AIW",
    schedule: "Senin - Rabu Pekan Depan",
    urgency: "Sedang",
    volunteersNeeded: 2,
    volunteersJoined: 1,
    description:
      "Penerbitan Akta Ikrar Wakaf (AIW) dan pengawalan proses konversi sertifikat hak milik ke sertifikat wakaf di BPN Kota Palembang.",
    impactScore: 90,
    estimatedHours: 5,
    tags: ["Hukum", "Wakaf", "BPN", "Syariah"],
  },
  {
    id: "proj-06",
    title: "Optimalisasi Akustik & Setup Sound System Sholat Jumat",
    organizerMasjid: "Masjid Baiturrahman",
    kelurahan: "Lebung Gajah",
    category: "Teknik, Bangunan & Logistik",
    requiredSkills: [
      "Akustik Sound Masjid",
      "Teknisi Listrik",
      "Instalasi Panel Tenaga Surya",
      "Renovasi Sanitasi Tempat Wudhu",
    ],
    recommendedRole: "Teknisi Akustik & Tata Suara Ruang Utama",
    schedule: "Kamis Sore, 16:00 - 19:30 WIB",
    urgency: "Tinggi",
    volunteersNeeded: 2,
    volunteersJoined: 1,
    description:
      "Perbaikan feedback microphone imam dan pemerataan desibel suara di area sholat akhwat lantai 2 agar khutbah terdengar jernih.",
    impactScore: 85,
    estimatedHours: 3.5,
    tags: ["Teknik", "Audio", "Sound", "Listrik"],
  },
  {
    id: "proj-07",
    title: "Bimbingan Tahsin & Sertifikasi Qari Remaja Masjid",
    organizerMasjid: "Masjid Baitul Muttaqin",
    kelurahan: "Lebung Gajah",
    category: "Pendidikan & Tahfidz",
    requiredSkills: [
      "Guru Quran & Tajwid",
      "Tahfidz Bersanad",
      "Bahasa Arab Praktis",
      "Psikologi Remaja Islami",
    ],
    recommendedRole: "Mentor Tahsin Al-Qur'an & Tajwid",
    schedule: "Jumat Ba'da Ashar, 16:00 - 17:30 WIB",
    urgency: "Rutin",
    volunteersNeeded: 3,
    volunteersJoined: 2,
    description:
      "Program pemantapan makhraj huruf dan tajwid untuk 25 calon muadzin dan imam muda di Kelurahan Lebung Gajah.",
    impactScore: 89,
    estimatedHours: 2,
    tags: ["Tahfidz", "Quran", "Remaja", "Tahsin"],
  },
  {
    id: "proj-08",
    title: "Pelatihan Pemulasaraan Jenazah Syar'i & Siaga Duka",
    organizerMasjid: "Masjid Al-Amanah",
    kelurahan: "Sukamulya",
    category: "Penyelenggaraan Jenazah & Sosial",
    requiredSkills: [
      "Fardhu Kifayah Jenazah",
      "Ambulans & Evakuasi",
      "Konseling Duka",
      "Pertolongan Pertama Gawat Darurat",
    ],
    recommendedRole: "Instruktur Praktik Tajhizul Janazah",
    schedule: "Sabtu Siang, 13:30 - 16:00 WIB",
    urgency: "Sedang",
    volunteersNeeded: 2,
    volunteersJoined: 1,
    description:
      "Pelatihan fardhu kifayah memandikan, mengkafani, dan mensholatkan jenazah sesuai sunnah bagi pengurus rukun kematian.",
    impactScore: 91,
    estimatedHours: 3,
    tags: ["Sosial", "Jenazah", "Fardhu Kifayah"],
  },
];

// Success audio chime
const playSuccessSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
    });
  } catch (e) {
    // Ignore audio error
  }
};

interface SkillSyncOverlayProps {
  userProfile: UserProfileOnboarding;
  onClose: () => void;
  onSelectProject?: (project: SkillSyncProject) => void;
}

export const SkillSyncOverlay: FC<SkillSyncOverlayProps> = ({
  userProfile,
  onClose,
  onSelectProject,
}) => {
  const [activeTab, setActiveTab] = useState<"top3" | "simulator" | "comparison">("top3");
  const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([]);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [lastSyncTime] = useState<string>(
    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB"
  );

  // Skill Simulator State
  const [simulatedCategory, setSimulatedCategory] = useState<SkillCategoryType>(
    userProfile.primarySkillCategory || "Kesehatan / Medis"
  );
  const [simulatedSubSkills, setSimulatedSubSkills] = useState<string[]>(
    userProfile.selectedSubSkills || []
  );
  const [simulatedKelurahan, setSimulatedKelurahan] = useState<string>(
    userProfile.kelurahan || "Sukamulya"
  );

  // Match Calculation Engine
  const matchResults: SkillSyncMatchResult[] = useMemo(() => {
    return MASTER_COMMUNITY_PROJECTS.map((proj) => {
      let score = 0;
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      // 1. Skill Category Alignment (Weight: max 40 pts)
      let categoryWeight = 0;
      if (proj.category === simulatedCategory) {
        categoryWeight = 40;
      } else if (
        (simulatedCategory === "Kesehatan / Medis" && proj.category === "Penyelenggaraan Jenazah & Sosial") ||
        (simulatedCategory === "Teknologi & IT" && proj.category === "Teknik, Bangunan & Logistik")
      ) {
        categoryWeight = 22;
      } else {
        categoryWeight = 10;
      }

      // 2. Sub-Skills keyword overlap (Weight: max 25 pts)
      const userSkillsNormalized = simulatedSubSkills.map((s) => s.toLowerCase());
      proj.requiredSkills.forEach((reqSkill) => {
        const isMatched = userSkillsNormalized.some(
          (uSkill) =>
            reqSkill.toLowerCase().includes(uSkill) ||
            uSkill.includes(reqSkill.toLowerCase()) ||
            (uSkill.includes("dokter") && reqSkill.toLowerCase().includes("dokter")) ||
            (uSkill.includes("gawat") && reqSkill.toLowerCase().includes("darurat")) ||
            (uSkill.includes("lab") && reqSkill.toLowerCase().includes("lab")) ||
            (uSkill.includes("akuntansi") && reqSkill.toLowerCase().includes("akuntan")) ||
            (uSkill.includes("coding") && reqSkill.toLowerCase().includes("web"))
        );

        if (isMatched) {
          matchedSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      });

      const skillRatio = proj.requiredSkills.length > 0
        ? matchedSkills.length / proj.requiredSkills.length
        : 0;
      const subSkillsWeight = Math.round(skillRatio * 25);

      // 3. Location & Mosque Proximity (Weight: max 15 pts)
      const locationMatch = proj.kelurahan === simulatedKelurahan;
      const locationWeight = locationMatch ? 15 : 6;

      // 4. Schedule & Availability Alignment (Weight: max 10 pts)
      const scheduleMatch = userProfile.availabilityDays.some((day) =>
        proj.schedule.toLowerCase().includes(day.toLowerCase().slice(0, 4))
      );
      const scheduleWeight = scheduleMatch ? 10 : 5;

      // 5. Experience Level & Motivation Match (Weight: max 10 pts)
      let experienceWeight = 7;
      if (userProfile.experienceLevel === "Pakar / Bersertifikasi") {
        experienceWeight = 10;
      } else if (userProfile.experienceLevel === "Profesional / Senior") {
        experienceWeight = 9;
      } else if (userProfile.experienceLevel === "Praktisi Menengah") {
        experienceWeight = 8;
      }

      // Total Score
      score = Math.min(100, Math.round(categoryWeight + subSkillsWeight + locationWeight + scheduleWeight + experienceWeight));

      // Build Rationale
      let recommendationReason = "";
      if (score >= 90) {
        recommendationReason = `Sangat direkomendasikan (${score}% Match): Profil ${simulatedCategory} dan keahlian "${matchedSkills[0] || "spesialis"}" Anda sangat selaras dengan kebutuhan di ${proj.kelurahan}.`;
      } else if (score >= 75) {
        recommendationReason = `Kecocokan kuat (${score}% Match): Memiliki basis keahlian ${proj.category} dan waktu yang cocok dengan agenda ${proj.organizerMasjid}.`;
      } else {
        recommendationReason = `Peluang khidmah pendukung (${score}% Match): Kontribusi Anda pada tugas pendukung akan sangat membantu kemakmuran kegiatan.`;
      }

      return {
        project: proj,
        matchScore: score,
        matchedSkills,
        missingSkills,
        locationMatch,
        scheduleMatch,
        causeMatch: true,
        scoreBreakdown: {
          categoryWeight,
          subSkillsWeight,
          locationWeight,
          scheduleWeight,
          experienceWeight,
        },
        recommendationReason,
        rank: 0,
      };
    })
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [simulatedCategory, simulatedSubSkills, simulatedKelurahan, userProfile]);

  // Extract Top 3 projects
  const top3Matches = useMemo(() => matchResults.slice(0, 3), [matchResults]);

  // Handle Assign Mission
  const handleAssignMission = (project: SkillSyncProject) => {
    if (!assignedProjectIds.includes(project.id)) {
      setAssignedProjectIds((prev) => [...prev, project.id]);
      playSuccessSound();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#10b981", "#f59e0b", "#06b6d4", "#3b82f6"],
      });

      if (onSelectProject) {
        onSelectProject(project);
      }
    }
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const summaryText = `*⚡ REKOMENDASI SKILL SYNC RELAWAN DKM SEMATANG BORANG*\nNama: ${userProfile.fullName}\nKeahlian: ${simulatedCategory}\nDomisili: ${simulatedKelurahan}\n\n*Top 3 Proyek Paling Sesuai:*\n${top3Matches
      .map(
        (m) =>
          `1. [${m.matchScore}% Match] ${m.project.title}\n   Masjid: ${m.project.organizerMasjid} (${m.project.kelurahan})\n   Jadwal: ${m.project.schedule}\n   Peran: ${m.project.recommendedRole}\n`
      )
      .join("\n")}\n_Diverifikasi oleh Forum Komunikasi DKM Sematang Borang_`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Reset simulator
  const handleResetSimulator = () => {
    setSimulatedCategory(userProfile.primarySkillCategory || "Kesehatan / Medis");
    setSimulatedSubSkills(userProfile.selectedSubSkills || []);
    setSimulatedKelurahan(userProfile.kelurahan || "Sukamulya");
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          label: "#1 REKOMENDASI UTAMA",
          border: "border-amber-400/80 ring-2 ring-amber-400/30",
          bg: "bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950",
          badge: "bg-amber-500 text-slate-950 font-black",
          text: "text-amber-300",
        };
      case 2:
        return {
          label: "#2 SANGAT COCOK",
          border: "border-emerald-500/70",
          bg: "bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950",
          badge: "bg-emerald-500 text-slate-950 font-black",
          text: "text-emerald-300",
        };
      case 3:
        return {
          label: "#3 REKOMENDASI PENDUKUNG",
          border: "border-sky-500/60",
          bg: "bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950",
          badge: "bg-sky-500 text-slate-950 font-black",
          text: "text-sky-300",
        };
      default:
        return {
          label: `#${rank}`,
          border: "border-slate-800",
          bg: "bg-slate-900",
          badge: "bg-slate-700 text-white font-bold",
          text: "text-slate-300",
        };
    }
  };

  return (
    <div
      id="skill-sync-overlay-modal"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full my-auto overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[92vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 p-5 sm:p-6 border-b border-slate-800 relative shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-bold shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Real-Time Skill Sync Engine</span>
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Synced: {lastSyncTime}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Pencocokan Kompetensi & Top 3 Proyek Terpilih</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
                Sistem secara real-time membandingkan profil kompetensi, domisili, dan jadwal Anda terhadap kebutuhan terbuka tugas masjid se-Sematang Borang.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                title="Salin Ringkasan Rekomendasi"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-300" />
                    <span>Bagikan</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Diagnostic User Profile Strip */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                {userProfile.fullName.replace(/dr\.|H\.|Ust\./g, "").trim().slice(0, 2).toUpperCase() || "MH"}
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{userProfile.fullName}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">({userProfile.memberIdCardNumber})</span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-amber-300 font-semibold">{simulatedCategory}</span>
                  <span>•</span>
                  <span>📍 {simulatedKelurahan}</span>
                </div>
              </div>
            </div>

            {/* Navigation tabs inside modal */}
            <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab("top3")}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                  activeTab === "top3"
                    ? "bg-emerald-600 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Top 3 Rekomendasi
              </button>
              <button
                onClick={() => setActiveTab("simulator")}
                className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition ${
                  activeTab === "simulator"
                    ? "bg-emerald-600 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Simulasi Skill</span>
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                  activeTab === "comparison"
                    ? "bg-emerald-600 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Matriks SROI & Fit
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ================= TAB 1: TOP 3 MATCH RECOMMENDATIONS ================= */}
          {activeTab === "top3" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">
                    3 Proyek Terbaik Sesuai Kualifikasi Anda ({simulatedCategory})
                  </h3>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                  {MASTER_COMMUNITY_PROJECTS.length} Proyek Aktif Dianalisis
                </span>
              </div>

              {/* 3 Ranked Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {top3Matches.map((match) => {
                  const styling = getRankBadge(match.rank);
                  const isAssigned = assignedProjectIds.includes(match.project.id);

                  return (
                    <div
                      key={match.project.id}
                      className={`rounded-3xl border ${styling.border} ${styling.bg} p-5 shadow-xl flex flex-col justify-between relative overflow-hidden transition transform hover:-translate-y-1`}
                    >
                      {/* Top Rank Badge */}
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase ${styling.badge} shadow-sm`}>
                          {styling.label}
                        </span>
                        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
                          <span className="text-xs font-black text-emerald-400 font-mono">
                            {match.matchScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">Match</span>
                        </div>
                      </div>

                      {/* Project Title & Location */}
                      <div className="space-y-2 relative z-10">
                        <h4 className="font-black text-base text-white leading-tight">
                          {match.project.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-300">
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Building className="w-3.5 h-3.5" />
                            {match.project.organizerMasjid}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            {match.project.kelurahan}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {match.project.description}
                        </p>
                      </div>

                      {/* Why You Match / Skill Alignment Breakdown */}
                      <div className="my-4 pt-3 border-t border-slate-800/90 space-y-2 text-xs relative z-10">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Kesesuaian Spesifik:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {match.matchedSkills.map((sk) => (
                            <span
                              key={sk}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-medium"
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{sk}</span>
                            </span>
                          ))}
                          {match.locationMatch && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-medium">
                              <Check className="w-3 h-3 text-amber-400" />
                              <span>Domisili Dekat</span>
                            </span>
                          )}
                        </div>

                        {/* Schedule & Slot Info */}
                        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              Jadwal:
                            </span>
                            <span className="font-semibold text-white">{match.project.schedule}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Users className="w-3 h-3 text-emerald-400" />
                              Kebutuhan Relawan:
                            </span>
                            <span className="font-semibold text-amber-300">
                              {match.project.volunteersJoined} / {match.project.volunteersNeeded} Relawan
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 relative z-10">
                        {isAssigned ? (
                          <div className="w-full py-2.5 px-4 bg-emerald-950 border border-emerald-500 text-emerald-300 font-black text-xs rounded-xl flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Misi Khidmah Diterima!</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAssignMission(match.project)}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95"
                          >
                            <span>Daftar / Ambil Misi Ini</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SROI & Impact Projection Summary Banner */}
              <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      Proyeksi Nilai Manfaat Sosial Khidmah Anda
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Jika Anda mengambil 1 dari 3 misi rekomendasi di atas, estimasi kontribusi SROI Anda bernilai <strong>Rp 4.200.000 / bulan</strong> dalam penghematan layanan umat.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("comparison")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 shrink-0 transition"
                >
                  Lihat Matriks Perbandingan Proyek
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SKILL SIMULATOR (LIVE TUNING) ================= */}
          {activeTab === "simulator" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Simulasi Penyesuaian Keahlian & Domisili (Live Recalculation)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ubah parameter keahlian atau lokasi sementara untuk melihat bagaimana algoritma secara instan menyusun ulang Top 3 proyek khidmah.
                  </p>
                </div>

                <button
                  onClick={handleResetSimulator}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Profil Asli</span>
                </button>
              </div>

              {/* Interactive Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Category Switcher */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="font-bold text-slate-200 block">
                    1. Pilih Bidang Pilar Utama:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      "Kesehatan / Medis",
                      "Akuntansi & Finansial",
                      "Teknologi & IT",
                      "Hukum & Syariah",
                      "Pendidikan & Tahfidz",
                      "Teknik, Bangunan & Logistik",
                      "Penyelenggaraan Jenazah & Sosial",
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSimulatedCategory(cat as any)}
                        className={`w-full p-2 rounded-xl text-left font-semibold transition border ${
                          simulatedCategory === cat
                            ? "bg-emerald-950 border-emerald-400 text-emerald-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Kelurahan Proximity */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="font-bold text-slate-200 block">
                    2. Simulasi Domisili Markaz:
                  </label>
                  <div className="space-y-1.5">
                    {["Sukamulya", "Lebung Gajah", "Karya Mulya", "Srimulya"].map((kel) => (
                      <button
                        key={kel}
                        onClick={() => setSimulatedKelurahan(kel)}
                        className={`w-full p-2.5 rounded-xl text-left font-semibold transition border ${
                          simulatedKelurahan === kel
                            ? "bg-amber-950 border-amber-400 text-amber-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Kelurahan {kel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Live Top Recalculated Output */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Hasil Rekalkulasi Instan:</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
                  </div>

                  <div className="space-y-2">
                    {top3Matches.map((m, idx) => (
                      <div
                        key={m.project.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white truncate">
                            #{idx + 1} {m.project.title}
                          </span>
                          <span className="font-mono font-bold text-emerald-400 ml-1">
                            {m.matchScore}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>{m.project.organizerMasjid}</span>
                          <span className="text-amber-400">{m.project.kelurahan}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab("top3")}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                  >
                    Terapkan & Lihat Detail Proyek
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: PROJECT COMPARISON MATRIX ================= */}
          {activeTab === "comparison" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Matriks Komparasi 3 Proyek Teratas</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bandingkan bobot kecocokan, lokasi, durasi waktu, dan proyeksi nilai kemaslahatan umat antar proyek.
                </p>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                      <th className="p-3.5">Parameter Evaluasi</th>
                      {top3Matches.map((m, idx) => (
                        <th key={m.project.id} className="p-3.5 text-white">
                          <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded mr-1 font-mono">
                            #{idx + 1}
                          </span>
                          {m.project.title.slice(0, 24)}...
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {/* Match Score */}
                    <tr>
                      <td className="p-3.5 font-bold text-slate-300">Skor Keselarasan (Match Score)</td>
                      {top3Matches.map((m) => (
                        <td key={m.project.id} className="p-3.5 font-mono font-bold text-emerald-400">
                          {m.matchScore}% Perfect Fit
                        </td>
                      ))}
                    </tr>

                    {/* Organizer Mosque */}
                    <tr>
                      <td className="p-3.5 font-bold text-slate-300">Masjid Pangkalan & Kelurahan</td>
                      {top3Matches.map((m) => (
                        <td key={m.project.id} className="p-3.5 text-slate-200">
                          {m.project.organizerMasjid} ({m.project.kelurahan})
                        </td>
                      ))}
                    </tr>

                    {/* Schedule */}
                    <tr>
                      <td className="p-3.5 font-bold text-slate-300">Jadwal & Komitmen Waktu</td>
                      {top3Matches.map((m) => (
                        <td key={m.project.id} className="p-3.5 text-slate-200">
                          {m.project.schedule} (~{m.project.estimatedHours} Jam)
                        </td>
                      ))}
                    </tr>

                    {/* Urgency */}
                    <tr>
                      <td className="p-3.5 font-bold text-slate-300">Tingkat Urgensi Kebutuhan</td>
                      {top3Matches.map((m) => (
                        <td key={m.project.id} className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.project.urgency === "Tinggi"
                                ? "bg-rose-950 text-rose-300 border border-rose-600/40"
                                : "bg-amber-950 text-amber-300 border border-amber-600/40"
                            }`}
                          >
                            {m.project.urgency}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Recommended Role */}
                    <tr>
                      <td className="p-3.5 font-bold text-slate-300">Posisi / Peran yang Disiapkan</td>
                      {top3Matches.map((m) => (
                        <td key={m.project.id} className="p-3.5 font-semibold text-amber-300">
                          {m.project.recommendedRole}
                        </td>
                      ))}
                    </tr>

                    {/* Action */}
                    <tr>
                      <td className="p-3.5 font-bold text-slate-300">Aksi Pendaftaran</td>
                      {top3Matches.map((m) => (
                        <td key={m.project.id} className="p-3.5">
                          <button
                            onClick={() => handleAssignMission(m.project)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg transition"
                          >
                            {assignedProjectIds.includes(m.project.id) ? "Terdaftar ✓" : "Ambil Misi"}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Terintegrasi dengan Data Presensi QR & Forum Silaturahim DKM Sematang Borang.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              Tutup Overlay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillSyncOverlay;
