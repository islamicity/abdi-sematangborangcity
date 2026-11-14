import { useState, useRef, ChangeEvent, DragEvent, useId } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  User,
  Camera,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  HeartHandshake,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  Award,
  BookOpen,
  Stethoscope,
  Calculator,
  Cpu,
  Scale,
  GraduationCap,
  Wrench,
  Flame,
  Phone,
  Mail,
  Check,
  X,
  Target,
  QrCode,
  Download,
  AlertCircle,
  HelpCircle,
  Share2,
  Calendar,
  Sliders,
  Bell,
  RefreshCw,
  Zap,
} from "lucide-react";
import { UserProfileOnboarding, SkillCategoryType } from "../types";
import { INITIAL_SKILL_CLUSTERS } from "../data/talentRegistryData";

// Preset avatar colors
const AVATAR_COLOR_PRESETS = [
  { id: "emerald", label: "Zamrud Hijau", bg: "bg-emerald-600", border: "border-emerald-400", ring: "ring-emerald-500", text: "text-emerald-300" },
  { id: "amber", label: "Emas Madinah", bg: "bg-amber-600", border: "border-amber-400", ring: "ring-amber-500", text: "text-amber-300" },
  { id: "teal", label: "Pirus Samudra", bg: "bg-teal-600", border: "border-teal-400", ring: "ring-teal-500", text: "text-teal-300" },
  { id: "indigo", label: "Nilakandi Malam", bg: "bg-indigo-600", border: "border-indigo-400", ring: "ring-indigo-500", text: "text-indigo-300" },
  { id: "sky", label: "Langit Biru", bg: "bg-sky-600", border: "border-sky-400", ring: "ring-sky-500", text: "text-sky-300" },
  { id: "rose", label: "Mawar Syams", bg: "bg-rose-600", border: "border-rose-400", ring: "ring-rose-500", text: "text-rose-300" },
];

// Sematang Borang Mosques list
const SEMATANG_BORANG_MOSQUES = [
  { name: "Masjid Jami' Al-Ikhlas", kelurahan: "Sukamulya", address: "Jl. Sematang Borang Raya No. 45" },
  { name: "Masjid Baitul Muttaqin", kelurahan: "Lebung Gajah", address: "Komp. Griya Lebung Gajah Blok B" },
  { name: "Masjid Darussalam", kelurahan: "Karya Mulya", address: "Jl. Karya Bersama RW 04" },
  { name: "Masjid Nurul Huda", kelurahan: "Srimulya", address: "Perumahan Srimulya Indah" },
  { name: "Masjid Al-Amanah", kelurahan: "Sukamulya", address: "Jl. Padat Karya RT 12" },
  { name: "Masjid Al-Hikmah", kelurahan: "Lebung Gajah", address: "Jl. Mayor Zen Ujung" },
  { name: "Masjid Al-Falah", kelurahan: "Karya Mulya", address: "Komp. Borang Permai" },
  { name: "Masjid Ar-Raudhah", kelurahan: "Srimulya", address: "Komp. Srimulya Damai" },
];

// Community impact causes for survey
const COMMUNITY_CAUSES = [
  {
    id: "cause-kesehatan",
    title: "Kesehatan Dhuafa & Posyandu Lansia",
    desc: "Pemeriksaan medis gratis, donor darah masjid, dan rawat lansia di rumah.",
    icon: Stethoscope,
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "cause-yatim-pendidikan",
    title: "Pendidikan Santri, Yatim & Tahfidz",
    desc: "Bimbingan belajar gratis, beasiswa tahfidz Qur'an, dan literasi digital santri.",
    icon: GraduationCap,
    badgeColor: "bg-blue-950 text-blue-300 border-blue-500/30",
  },
  {
    id: "cause-infrastruktur",
    title: "Infrastruktur, Kebersihan & Fisik Masjid",
    desc: "Perbaikan sanitasi air wudhu, kelistrikan, sound system, dan kenyamanan ibadah.",
    icon: Wrench,
    badgeColor: "bg-amber-950 text-amber-300 border-amber-500/30",
  },
  {
    id: "cause-bencana",
    title: "Tanggap Darurat, Logistik & Bencana",
    desc: "Evakuasi banjir musiman, dapur umum darurat, dan distribusi bantuan sembako.",
    icon: Flame,
    badgeColor: "bg-rose-950 text-rose-300 border-rose-500/30",
  },
  {
    id: "cause-ekonomi-ziswaf",
    title: "Pemberdayaan Ekonomi Mustahiq (ZISWAF)",
    desc: "Pelatihan usaha mikro mustahiq, audit transparansi kas PSAK 109, dan qardhul hasan.",
    icon: Calculator,
    badgeColor: "bg-teal-950 text-teal-300 border-teal-500/30",
  },
  {
    id: "cause-multimedia",
    title: "Multimedia Dakwah & Digitalisasi Umat",
    desc: "Siaran live-streaming kajian, pengelolaan media sosial masjid, dan platform GIS jamaah.",
    icon: Cpu,
    badgeColor: "bg-violet-950 text-violet-300 border-violet-500/30",
  },
  {
    id: "cause-jenazah",
    title: "Pelayanan Fardhu Kifayah & Sosial Duka",
    desc: "Tim pemulasaraan jenazah syar'i, armada ambulans siaga, dan pendampingan duka keluarga.",
    icon: HeartHandshake,
    badgeColor: "bg-slate-800 text-slate-200 border-slate-600/30",
  },
];

// Audio chime helper
const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.4);
    });
  } catch (e) {
    // ignore
  }
};

interface OnboardingWizardProps {
  initialProfile?: UserProfileOnboarding | null;
  onSaveProfile: (profile: UserProfileOnboarding) => void;
  onCancel?: () => void;
  isStandaloneTab?: boolean;
}

export default function OnboardingWizard({
  initialProfile,
  onSaveProfile,
  onCancel,
  isStandaloneTab = false,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Form State
  const [fullName, setFullName] = useState<string>(initialProfile?.fullName || "dr. Muhammad Hidayatullah");
  const [email, setEmail] = useState<string>(initialProfile?.email || "m.hidayat@relawan.islamicity.org");
  const [phone, setPhone] = useState<string>(initialProfile?.phone || "0812-7890-4432");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>(initialProfile?.profilePictureUrl || "");
  const [avatarPresetColor, setAvatarPresetColor] = useState<string>(initialProfile?.avatarPresetColor || "emerald");
  const [kelurahan, setKelurahan] = useState<"Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya">(
    initialProfile?.kelurahan || "Sukamulya"
  );
  const [homeMasjid, setHomeMasjid] = useState<string>(initialProfile?.homeMasjid || "Masjid Jami' Al-Ikhlas");
  const [profession, setProfession] = useState<string>(initialProfile?.profession || "Dokter Umum & Praktisi Kesehatan Masyarakat");

  // Step 2: Skills
  const [primarySkillCategory, setPrimarySkillCategory] = useState<SkillCategoryType>(
    initialProfile?.primarySkillCategory || "Kesehatan / Medis"
  );
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>(
    initialProfile?.selectedSubSkills || ["Pertolongan Pertama Gawat Darurat", "Penyuluhan Gizi Lansia", "Pemeriksaan Lab Sederhana"]
  );
  const [customSkillInput, setCustomSkillInput] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<"Pemula / Belajar" | "Praktisi Menengah" | "Profesional / Senior" | "Pakar / Bersertifikasi">(
    initialProfile?.experienceLevel || "Profesional / Senior"
  );
  const [availabilityDays, setAvailabilityDays] = useState<string[]>(
    initialProfile?.availabilityDays || ["Jumat Berkah", "Sabtu", "Ahad (Pagi)"]
  );
  const [weeklyHoursTarget, setWeeklyHoursTarget] = useState<number>(initialProfile?.weeklyHoursTarget || 4);
  const [contributionType, setContributionType] = useState<"Aksi Lapangan & Darurat" | "Konsultasi Gratis" | "Pelatihan & Workshop" | "Audit & Review">(
    initialProfile?.contributionType || "Aksi Lapangan & Darurat"
  );

  // Step 3: Interest Survey
  const [priorityCauses, setPriorityCauses] = useState<string[]>(
    initialProfile?.priorityCauses || ["cause-kesehatan", "cause-yatim-pendidikan", "cause-bencana"]
  );
  const [preferredTeamRole, setPreferredTeamRole] = useState<string>(
    initialProfile?.preferredTeamRole || "Koordinator Tim Medis & Logistik Darurat"
  );
  const [pledgeMotivation, setPledgeMotivation] = useState<string>(
    initialProfile?.pledgeMotivation ||
      "Bismillah, saya berniat mewakafkan waktu dan keahlian profesi medis saya demi melayani jamaah lansia, mustahiq dhuafa, dan kemakmuran masjid di wilayah Sematang Borang secara ikhlas lillahi ta'ala."
  );
  const [emergencyAlertOptIn, setEmergencyAlertOptIn] = useState<boolean>(
    initialProfile?.emergencyAlertOptIn !== undefined ? initialProfile.emergencyAlertOptIn : true
  );
  const [weekendWorkshopOptIn, setWeekendWorkshopOptIn] = useState<boolean>(
    initialProfile?.weekendWorkshopOptIn !== undefined ? initialProfile.weekendWorkshopOptIn : true
  );

  // Handle Photo Upload
  const handlePhotoUpload = (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProfilePictureUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  // Toggle Sub-Skill
  const toggleSubSkill = (skill: string) => {
    setSelectedSubSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    if (!selectedSubSkills.includes(customSkillInput.trim())) {
      setSelectedSubSkills((prev) => [...prev, customSkillInput.trim()]);
    }
    setCustomSkillInput("");
  };

  // Toggle Cause
  const toggleCause = (causeId: string) => {
    setPriorityCauses((prev) =>
      prev.includes(causeId) ? prev.filter((id) => id !== causeId) : [...prev, causeId]
    );
  };

  // Toggle Day
  const toggleDay = (day: string) => {
    setAvailabilityDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Get active cluster details
  const activeCluster = INITIAL_SKILL_CLUSTERS.find(
    (c) => c.category === primarySkillCategory
  ) || INITIAL_SKILL_CLUSTERS[0];

  // Finish Wizard
  const handleCompleteWizard = () => {
    const memberId = initialProfile?.id || `vol-${Date.now().toString().slice(-6)}`;
    const cardNumber = initialProfile?.memberIdCardNumber || `DKM-SB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const completedProfile: UserProfileOnboarding = {
      id: memberId,
      fullName: fullName.trim() || "Relawan Berjamaah",
      email: email.trim(),
      phone: phone.trim(),
      profilePictureUrl,
      avatarPresetColor,
      homeMasjid,
      kelurahan,
      profession: profession.trim() || "Praktisi & Relawan Masyarakat",
      primarySkillCategory,
      selectedSubSkills: selectedSubSkills.length > 0 ? selectedSubSkills : activeCluster.coreSkills.slice(0, 3),
      experienceLevel,
      availabilityDays: availabilityDays.length > 0 ? availabilityDays : ["Jumat Berkah", "Ahad"],
      weeklyHoursTarget,
      contributionType,
      priorityCauses: priorityCauses.length > 0 ? priorityCauses : ["cause-kesehatan", "cause-infrastruktur"],
      preferredTeamRole,
      pledgeMotivation: pledgeMotivation.trim(),
      emergencyAlertOptIn,
      weekendWorkshopOptIn,
      onboardingCompletedAt: new Date().toISOString(),
      memberIdCardNumber: cardNumber,
    };

    setIsCompleted(true);
    playChime();

    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"],
    });

    // Save to parent & storage
    onSaveProfile(completedProfile);
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .filter((n) => !n.startsWith("dr.") && !n.startsWith("H.") && !n.startsWith("Ust."))
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "RB";
  };

  const activeAvatarObj = AVATAR_COLOR_PRESETS.find((a) => a.id === avatarPresetColor) || AVATAR_COLOR_PRESETS[0];

  return (
    <div id="onboarding-wizard-container" className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100">
      {/* Wizard Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 p-6 border-b border-slate-800 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Panduan Aktivasi Relawan Khidmah Berjamaah</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Onboarding Wizard Profil Relawan Masjid
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Lengkapi profil keahlian, pasang foto resmi, dan ikuti survei minat kemaslahatan untuk mempersonalisasi seluruh dasbor & orkestrasi khidmah Anda di Sematang Borang.
            </p>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              Tutup Wizard
            </button>
          )}
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {/* Step 1 */}
            <button
              onClick={() => setCurrentStep(1)}
              className={`p-2 rounded-xl text-left transition border ${
                currentStep === 1
                  ? "bg-emerald-950/90 border-emerald-400 ring-1 ring-emerald-400/40 shadow-sm"
                  : currentStep > 1
                  ? "bg-slate-950/60 border-emerald-700/60 text-emerald-300"
                  : "bg-slate-950/30 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-400">01</span>
                {currentStep > 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-bold text-white text-[11px] truncate mt-0.5">Identitas & Foto</div>
            </button>

            {/* Step 2 */}
            <button
              onClick={() => setCurrentStep(2)}
              className={`p-2 rounded-xl text-left transition border ${
                currentStep === 2
                  ? "bg-emerald-950/90 border-emerald-400 ring-1 ring-emerald-400/40 shadow-sm"
                  : currentStep > 2
                  ? "bg-slate-950/60 border-emerald-700/60 text-emerald-300"
                  : "bg-slate-950/30 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-400">02</span>
                {currentStep > 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-bold text-white text-[11px] truncate mt-0.5">Profil Keahlian</div>
            </button>

            {/* Step 3 */}
            <button
              onClick={() => setCurrentStep(3)}
              className={`p-2 rounded-xl text-left transition border ${
                currentStep === 3
                  ? "bg-emerald-950/90 border-emerald-400 ring-1 ring-emerald-400/40 shadow-sm"
                  : currentStep > 3
                  ? "bg-slate-950/60 border-emerald-700/60 text-emerald-300"
                  : "bg-slate-950/30 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-400">03</span>
                {currentStep > 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-bold text-white text-[11px] truncate mt-0.5">Survei Minat</div>
            </button>

            {/* Step 4 */}
            <button
              onClick={() => setCurrentStep(4)}
              className={`p-2 rounded-xl text-left transition border ${
                currentStep === 4
                  ? "bg-emerald-950/90 border-emerald-400 ring-1 ring-emerald-400/40 shadow-sm"
                  : isCompleted
                  ? "bg-slate-950/60 border-emerald-700/60 text-emerald-300"
                  : "bg-slate-950/30 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-400">04</span>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-bold text-white text-[11px] truncate mt-0.5">Ikrar & Dasbor</div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Content Body */}
      <div className="p-6 space-y-6">
        {/* ================= STEP 1: IDENTITY & PROFILE PHOTO ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                <span>Langkah 1: Identitas Relawan & Unggah Foto Resmi</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Foto dan profil ini akan tercetak pada Kartu Tanda Anggota (KTA) Digital dan verifikasi presensi QR DKM.
              </p>
            </div>

            {/* Two Column Layout: Photo Manager on Left, Details on Right */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo & Avatar Customizer */}
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt={fullName}
                      referrerPolicy="no-referrer"
                      className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 shadow-xl ring-4 ring-emerald-500/20"
                    />
                  ) : (
                    <div
                      className={`w-28 h-28 rounded-full ${activeAvatarObj.bg} flex items-center justify-center text-white text-3xl font-black border-4 ${activeAvatarObj.border} shadow-xl ring-4 ring-emerald-500/20`}
                    >
                      {getInitials(fullName)}
                    </div>
                  )}

                  {/* Verified Badge Overlay */}
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-950 shadow-md">
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{fullName || "Nama Relawan"}</h4>
                  <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                    {profession || "Profesi Khidmah"}
                  </p>
                  <p className="text-[10px] text-slate-400">{homeMasjid}</p>
                </div>

                {/* Drag and drop upload zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-4 rounded-xl border-2 border-dashed cursor-pointer transition text-center space-y-1.5 ${
                    dragActive
                      ? "border-emerald-400 bg-emerald-950/40"
                      : "border-slate-700 bg-slate-900/60 hover:border-emerald-500 hover:bg-slate-900"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileInputChange}
                    className="hidden"
                  />
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 mx-auto">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-200">
                    Unggah Foto Profil
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Klik atau seret foto ke sini (JPG, PNG maks 5MB)
                  </div>
                </div>

                {profilePictureUrl && (
                  <button
                    type="button"
                    onClick={() => setProfilePictureUrl("")}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline font-semibold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hapus Foto & Gunakan Inisial</span>
                  </button>
                )}

                {/* Avatar Color Palette (If no photo or avatar theme) */}
                <div className="w-full pt-3 border-t border-slate-800/80 space-y-2 text-left">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Tema Warna Inisial KTA:
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {AVATAR_COLOR_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAvatarPresetColor(p.id)}
                        className={`w-6 h-6 rounded-full ${p.bg} transition transform ${
                          avatarPresetColor === p.id
                            ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950 shadow-md"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        title={p.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Details Form Inputs */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Full Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-slate-200 flex items-center justify-between">
                      <span>Nama Lengkap & Gelar *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Sesuai KTP / Pengenal Resmi</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: dr. Muhammad Hidayatullah, Sp.A"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  {/* Profession */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-slate-200 block">
                      Profesi / Keahlian Utama di Masyarakat *
                    </label>
                    <input
                      type="text"
                      required
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="Contoh: Dokter Umum / Guru Ngaji / Arsitek / Teknisi Listrik"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Nomor WhatsApp Aktif *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Alamat Email</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Kelurahan Domisili */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kelurahan Domisili (Sematang Borang) *</span>
                    </label>
                    <select
                      value={kelurahan}
                      onChange={(e) => setKelurahan(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="Sukamulya">Kelurahan Sukamulya</option>
                      <option value="Lebung Gajah">Kelurahan Lebung Gajah</option>
                      <option value="Karya Mulya">Kelurahan Karya Mulya</option>
                      <option value="Srimulya">Kelurahan Srimulya</option>
                    </select>
                  </div>

                  {/* Home Mosque */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pangkalan Masjid / Markaz Khidmah *</span>
                    </label>
                    <select
                      value={homeMasjid}
                      onChange={(e) => setHomeMasjid(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    >
                      {SEMATANG_BORANG_MOSQUES.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name} ({m.kelurahan})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Data profil Anda terenkripsi aman dalam ekosistem ABDI Cloud Sematang Borang dan hanya digunakan untuk orkestrasi kebaikan dakwah serta transparansi khidmah masjid.
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Next */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition transform active:scale-95"
              >
                <span>Lanjut: Profil Keahlian</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SKILL PROFILE & COMPETENCIES ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>Langkah 2: Pemetaan Keahlian & Spesialisasi Khidmah</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih klaster pilar keahlian utama dan sub-kompetensi teknis yang siap Anda kontribusikan untuk umat.
              </p>
            </div>

            {/* Cluster Selector Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                1. Pilih Klaster Keahlian Utama (Pilar Khidmah):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {INITIAL_SKILL_CLUSTERS.map((cluster) => {
                  const isSelected = primarySkillCategory === cluster.category;
                  return (
                    <button
                      key={cluster.id}
                      type="button"
                      onClick={() => {
                        setPrimarySkillCategory(cluster.category);
                        setSelectedSubSkills(cluster.coreSkills.slice(0, 3));
                      }}
                      className={`p-3 rounded-2xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-950/90 border-emerald-400 shadow-md ring-2 ring-emerald-400/40"
                          : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">
                          {cluster.totalVolunteers} Relawan
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-xs text-white leading-tight">
                        {cluster.category}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                        {cluster.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Skills Tag Selector */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>2. Sub-Keahlian & Kemampuan Spesifik ({activeCluster.category}):</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {selectedSubSkills.length} Keahlian Dipilih
                </span>
              </div>

              {/* Core Skill Chips */}
              <div className="flex flex-wrap gap-2">
                {activeCluster.coreSkills.map((skill) => {
                  const isChecked = selectedSubSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSubSkill(skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isChecked
                          ? "bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-300"
                          : "bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Skill Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  placeholder="Ketik keahlian spesifik lainnya (e.g. USG Dasar, Canva, Desain CAD)..."
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Experience Level & Availability Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Experience Level */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="font-bold text-slate-200 block">
                  3. Tingkat Kemahiran / Pengalaman:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Pemula / Belajar", "Praktisi Menengah", "Profesional / Senior", "Pakar / Bersertifikasi"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`p-2 rounded-xl text-left font-semibold text-[11px] transition border ${
                        experienceLevel === lvl
                          ? "bg-emerald-950 border-emerald-400 text-emerald-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contribution Format */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="font-bold text-slate-200 block">
                  4. Bentuk Kontribusi yang Disukai:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Aksi Lapangan & Darurat", "Konsultasi Gratis", "Pelatihan & Workshop", "Audit & Review"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setContributionType(fmt)}
                      className={`p-2 rounded-xl text-left font-semibold text-[11px] transition border ${
                        contributionType === fmt
                          ? "bg-emerald-950 border-emerald-400 text-emerald-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability Days & Weekly Target Hours Slider */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  5. Ketersediaan Hari Khidmah:
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Senin - Kamis", "Jumat Berkah", "Sabtu", "Ahad (Pagi)", "Ahad (Malam)", "Siaga 24 Jam Darurat"].map((day) => {
                    const isSelected = availabilityDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                            : "bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider for Hours */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Target Jam Khidmah per Pekan:</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-sm bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                    {weeklyHoursTarget} Jam / Pekan ({weeklyHoursTarget * 4} Jam / Bulan)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  value={weeklyHoursTarget}
                  onChange={(e) => setWeeklyHoursTarget(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 Jam (Ringan)</span>
                  <span>4 Jam (Direkomendasikan)</span>
                  <span>8 Jam (Aktif)</span>
                  <span>16+ Jam (Intensif)</span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition transform active:scale-95"
              >
                <span>Lanjut: Survei Minat & Fokus</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: INTEREST SURVEY & CAUSES ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-400" />
                <span>Langkah 3: Survei Minat Kemaslahatan & Komitmen Khidmah</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Survei ini memetakan preferensi program sosial agar sistem dapat merekomendasikan misi dan agenda masjid yang paling relevan untuk Anda.
              </p>
            </div>

            {/* Causes Selector Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 block">
                1. Pilih Bidang Kemaslahatan & Dampak Sosial yang Menjadi Minat Anda:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMMUNITY_CAUSES.map((cause) => {
                  const isSelected = priorityCauses.includes(cause.id);
                  const IconComp = cause.icon;
                  return (
                    <button
                      key={cause.id}
                      type="button"
                      onClick={() => toggleCause(cause.id)}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 relative ${
                        isSelected
                          ? "bg-emerald-950/90 border-emerald-400 ring-1 ring-emerald-400/40 shadow-sm"
                          : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cause.badgeColor}`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white truncate">{cause.title}</h4>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 ml-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {cause.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Role in Teams */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <label className="font-bold text-slate-200 block">
                2. Peran yang Anda Inginkan dalam Satuan Tugas / Tim Masjid:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  "Koordinator / PJ Tim Lapangan",
                  "Eksekutor / Tenaga Teknis Khidmah",
                  "Konsultan & Penasihat Ahli",
                  "Mentor & Pelatih Generasi Muda",
                  "Logistik, Konsumsi & Perlengkapan",
                  "Hubungan Masyarakat & Dokumentasi",
                ].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setPreferredTeamRole(role)}
                    className={`p-2.5 rounded-xl text-left font-semibold text-[11px] transition border ${
                      preferredTeamRole === role
                        ? "bg-emerald-950 border-emerald-400 text-emerald-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Motivation Statement */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <label className="font-bold text-slate-200 block">
                3. Pernyataan Niat Khidmah & Harapan Pribadi:
              </label>
              <textarea
                rows={3}
                value={pledgeMotivation}
                onChange={(e) => setPledgeMotivation(e.target.value)}
                placeholder="Tuliskan niat tulus dan harapan Anda dalam berkhidmat untuk jamaah di Sematang Borang..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 leading-relaxed font-medium"
              />
            </div>

            {/* Notification & Emergency Alerts Preferences */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>4. Preferensi Notifikasi & Panggilan Ukhuwah:</span>
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emergencyAlertOptIn}
                    onChange={(e) => setEmergencyAlertOptIn(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-white block">
                      Notifikasi Panggilan Darurat Medis / Bencana (Emergency SOS)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Terima notifikasi instan jika ada kebutuhan relawan darurat di masjid sekitar domisili Anda.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weekendWorkshopOptIn}
                    onChange={(e) => setWeekendWorkshopOptIn(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-white block">
                      Undangan Pelatihan Upgrade Skill & Safari Subuh Gabungan
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Dapatkan jadwal lokakarya gratis untuk mengasah keterampilan sosial dan ukhuwah antar-masjid.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition transform active:scale-95"
              >
                <span>Lihat Kartu Anggota & Dasbor</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: KTA DIGITAL, PREVIEW & ACTIVATION ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Langkah 4: Kartu Tanda Anggota (KTA) Digital & Personalisasi Dasbor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Selamat! Profil Anda siap diintegrasikan. Berikut pratinjau KTA Digital resmi dan personalisasi dasbor khidmah Anda.
              </p>
            </div>

            {/* Digital Volunteer ID Card (KTA Berjamaah) */}
            <div className="max-w-md mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl border-2 border-emerald-500/50 p-6 shadow-2xl relative overflow-hidden text-white">
              {/* Background Islamic Watermark Accent */}
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                    SB
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 tracking-wider">
                      FORUM KOMUNIKASI DKM
                    </div>
                    <div className="text-xs font-black text-white">
                      RELAWAN BERJAMAAH 4B
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600/40">
                  VERIFIED DKM
                </span>
              </div>

              {/* Member Photo & Core Details */}
              <div className="flex items-center gap-4 py-4 relative z-10">
                <div className="relative shrink-0">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt={fullName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-md ring-2 ring-emerald-500/30"
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-full ${activeAvatarObj.bg} flex items-center justify-center text-white text-xl font-black border-2 ${activeAvatarObj.border} shadow-md`}
                    >
                      {getInitials(fullName)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full border border-slate-950">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h4 className="font-black text-sm text-white truncate">{fullName}</h4>
                  <p className="text-[11px] font-bold text-amber-300 truncate mt-0.5">{profession}</p>
                  <p className="text-[10px] text-slate-300 truncate">
                    🕌 {homeMasjid} ({kelurahan})
                  </p>
                  <p className="text-[9px] font-mono text-emerald-400 mt-1">
                    ID: {initialProfile?.memberIdCardNumber || `DKM-SB-2026-9814`}
                  </p>
                </div>
              </div>

              {/* Skills & Badges Strip */}
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2 text-[10px] relative z-10">
                <div className="flex items-center justify-between text-slate-400 font-semibold">
                  <span>Pilar: <strong>{primarySkillCategory}</strong></span>
                  <span className="text-emerald-400">Target: {weeklyHoursTarget}j / pekan</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedSubSkills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 px-2 py-0.5 rounded-md font-medium"
                    >
                      {s}
                    </span>
                  ))}
                  {selectedSubSkills.length > 3 && (
                    <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">
                      +{selectedSubSkills.length - 3} lagi
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: QR & Security Token */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-[9px] text-slate-400 relative z-10">
                <div className="space-y-0.5">
                  <div>Status: <strong>Siaga Khidmah</strong></div>
                  <div>Wilayah: <strong>Kec. Sematang Borang</strong></div>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-emerald-300">QR-READY</span>
                </div>
              </div>
            </div>

            {/* Personalized Dashboard Benefits Preview */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Fitur Dasbor yang Dipersonalisasi Khusus untuk Anda:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Rekomendasi Misi</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Agenda masjid di {kelurahan} dengan kebutuhan <strong>{primarySkillCategory}</strong> akan diprioritaskan di feed Anda.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Presensi Digital Cepat</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Scan barcode sesi khidmah di {homeMasjid} langsung terverifikasi atas nama {fullName}.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-400" />
                    <span>Milestone & SROI</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Target {weeklyHoursTarget * 4} jam/bulan akan memproyeksikan estimasi nilai manfaat sosial (SROI) secara real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Final Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Ubah Data Survei</span>
              </button>

              <button
                id="btn-complete-onboarding-wizard"
                type="button"
                onClick={handleCompleteWizard}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Aktifkan Profil & Masuk Dasbor Berjamaah</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
