import { useState, useEffect, useMemo, FC, FormEvent } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Heart,
  MessageSquareQuote,
  Building,
  MapPin,
  Clock,
  Briefcase,
  Share2,
  UserCheck,
  Stethoscope,
  Cpu,
  Wrench,
  TrendingUp,
  ThumbsUp,
  Sliders,
  Flame,
  Send,
  X,
  ExternalLink,
  Users,
} from "lucide-react";
import { FeaturedVolunteerSpotlight, MemberTestimonial } from "../types";
import { FEATURED_VOLUNTEER_SPOTLIGHTS } from "../data/featuredVolunteersData";

// Optional Chime for Prayer / Appreciation feedback
const playBarakahChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
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
  } catch {
    // Ignore audio error
  }
};

interface VolunteerHighlightSpotlightProps {
  onSelectVolunteer?: (volunteerId: string) => void;
  onOpenTestimonialModal?: (volunteer: FeaturedVolunteerSpotlight) => void;
  onNavigateToTalentBank?: () => void;
}

export const VolunteerHighlightSpotlight: FC<VolunteerHighlightSpotlightProps> = ({
  onSelectVolunteer,
  onOpenTestimonialModal,
  onNavigateToTalentBank,
}) => {
  const [volunteers, setVolunteers] = useState<FeaturedVolunteerSpotlight[]>(
    FEATURED_VOLUNTEER_SPOTLIGHTS
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progressKey, setProgressKey] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Endorsement Modal State
  const [showQuickEndorseModal, setShowQuickEndorseModal] = useState<boolean>(false);
  const [newEndorserName, setNewEndorserName] = useState<string>("dr. Nurul Azizah");
  const [newEndorserRole, setNewEndorserRole] = useState<string>("Pengurus Posko Kesehatan DKM");
  const [newEndorserMasjid, setNewEndorserMasjid] = useState<string>("Masjid Jami' Al-Ikhlas");
  const [newEndorsementText, setNewEndorsementText] = useState<string>("");
  const [newTrustTag, setNewTrustTag] = useState<string>("Sangat Amanah & Profesional");

  // Track prayers / likes sent per volunteer in this session
  const [prayersGiven, setPrayersGiven] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered List based on category selector
  const filteredVolunteers = useMemo(() => {
    if (selectedCategory === "ALL") return volunteers;
    return volunteers.filter((v) => {
      if (selectedCategory === "MEDIS") {
        return v.profession.toLowerCase().includes("medis") || v.profession.toLowerCase().includes("perawat") || v.profession.toLowerCase().includes("kesehatan");
      }
      if (selectedCategory === "TEKNIK") {
        return v.profession.toLowerCase().includes("arsitek") || v.profession.toLowerCase().includes("akustik") || v.profession.toLowerCase().includes("listrik");
      }
      if (selectedCategory === "FARMASI") {
        return v.profession.toLowerCase().includes("apoteker") || v.profession.toLowerCase().includes("halal");
      }
      if (selectedCategory === "JANAZAH") {
        return v.profession.toLowerCase().includes("janazah") || v.profession.toLowerCase().includes("fardhu kifayah");
      }
      if (selectedCategory === "FINANSIAL") {
        return v.profession.toLowerCase().includes("ekonomi") || v.profession.toLowerCase().includes("keuangan") || v.profession.toLowerCase().includes("umkm");
      }
      return true;
    });
  }, [volunteers, selectedCategory]);

  const currentVolunteer = useMemo(() => {
    if (filteredVolunteers.length === 0) return volunteers[0];
    const safeIndex = Math.min(currentIndex, filteredVolunteers.length - 1);
    return filteredVolunteers[safeIndex] || volunteers[0];
  }, [filteredVolunteers, currentIndex, volunteers]);

  // Handle Rotation Timer (Every 7.5 seconds when active & not hovered)
  useEffect(() => {
    if (!isAutoPlaying || isHovered || filteredVolunteers.length <= 1) return;

    const intervalTime = 7500;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredVolunteers.length);
      setProgressKey((prev) => prev + 1);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, filteredVolunteers.length, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredVolunteers.length);
    setProgressKey((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? filteredVolunteers.length - 1 : prev - 1
    );
    setProgressKey((prev) => prev + 1);
  };

  const handleSelectDot = (index: number) => {
    setCurrentIndex(index);
    setProgressKey((prev) => prev + 1);
  };

  // Send Prayer / Barakah / Heart interaction
  const handleSendPrayer = (volunteerId: string) => {
    if (prayersGiven[volunteerId]) {
      showToast("Doa dan apresiasi Anda sudah terkirim. Jazakallahu khairan!");
      return;
    }

    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId
          ? { ...v, prayersReceivedCount: v.prayersReceivedCount + 1 }
          : v
      )
    );
    setPrayersGiven((prev) => ({ ...prev, [volunteerId]: true }));

    playBarakahChime();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#10b981", "#f59e0b", "#38bdf8", "#ec4899"],
    });

    showToast(`Barakallahu fiik! Doa kebaikan Anda untuk ${currentVolunteer.name} berhasil terkirim.`);
  };

  // Quick submit of a new testimonial
  const handleSubmitQuickEndorsement = (e: FormEvent) => {
    e.preventDefault();
    if (!newEndorsementText.trim()) return;

    const newTestimonial: MemberTestimonial = {
      id: `test-${Date.now()}`,
      authorName: newEndorserName.trim() || "Relawan Sematang Borang",
      authorRole: newEndorserRole.trim() || "Anggota Jamaah",
      authorMasjid: newEndorserMasjid.trim() || currentVolunteer.homeMasjid,
      relationshipContext: "Rekan Tim Khidmah",
      avatarColor: "bg-emerald-600",
      testimonialQuote: newEndorsementText.trim(),
      rating: 5,
      trustTag: newTrustTag,
      date: "Baru saja",
      verifiedStamp: `DKM-COMMUNITY-${Math.floor(100 + Math.random() * 900)}`,
    };

    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === currentVolunteer.id
          ? {
              ...v,
              endorsementCount: v.endorsementCount + 1,
              testimonials: [newTestimonial, ...v.testimonials],
            }
          : v
      )
    );

    setShowQuickEndorseModal(false);
    setNewEndorsementText("");
    playBarakahChime();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast("Alhamdulillah! Testimoni kebaikan Anda telah diverifikasi & ditampilkan.");
  };

  // Share Volunteer Profile
  const handleShareVolunteer = () => {
    const textToCopy = `Tokoh Relawan Teladan: ${currentVolunteer.name} (${currentVolunteer.roleTitle}) - Mengabdi ${currentVolunteer.totalServiceHours} jam khidmah di Sematang Borang.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showToast("Tautan profil teladan berhasil disalin ke clipboard!");
    } else {
      showToast("Profil teladan siap dibagikan.");
    }
  };

  // Icon Helper for Accomplishments
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Stethoscope":
        return <Stethoscope className="w-4 h-4 text-emerald-400" />;
      case "Cpu":
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case "Wrench":
        return <Wrench className="w-4 h-4 text-orange-400" />;
      case "TrendingUp":
        return <TrendingUp className="w-4 h-4 text-sky-400" />;
      case "Heart":
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-4 h-4 text-teal-400" />;
      default:
        return <Award className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div
      id="volunteer-highlight-spotlight-widget"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300"
    >
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-600/10 via-teal-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header & Controls Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-400/60 text-amber-300 text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Volunteer Highlight Spotlight</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
              {currentVolunteer.tierLabel}
            </span>
            {isHovered && (
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                Auto-rotasi di-pause saat mouse hover
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Profil Teladan Khidmah Umat</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Apresiasi dan inspirasi nyata dari para relawan yang mendedikasikan keahlian profesi demi kemaslahatan jamaah Sematang Borang.
          </p>
        </div>

        {/* Carousel Play/Pause & Navigation Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            title={isAutoPlaying ? "Pause Auto-Rotation" : "Play Auto-Rotation"}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              isAutoPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <div className="h-5 w-px bg-slate-800 mx-0.5" />

          <button
            onClick={handlePrev}
            aria-label="Previous Volunteer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-400 px-1">
            {currentIndex + 1} / {filteredVolunteers.length}
          </span>

          <button
            onClick={handleNext}
            aria-label="Next Volunteer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auto-Rotation Progress Bar */}
      {isAutoPlaying && !isHovered && filteredVolunteers.length > 1 && (
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            key={progressKey}
            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 animate-progressBar"
            style={{
              animationDuration: "7500ms",
              animationTimingFunction: "linear",
            }}
          />
        </div>
      )}

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-bold text-[11px] shrink-0 mr-1 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-amber-400" />
          Bidang:
        </span>
        {[
          { id: "ALL", label: "Semua Teladan" },
          { id: "MEDIS", label: "Medis & Tanggap Darurat" },
          { id: "TEKNIK", label: "Akustik & Arsitektur" },
          { id: "FARMASI", label: "Apoteker & Halal" },
          { id: "JANAZAH", label: "Fardhu Kifayah 24 Jam" },
          { id: "FINANSIAL", label: "Finansial Syariah & UMKM" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedCategory(tab.id);
              setCurrentIndex(0);
              setProgressKey((prev) => prev + 1);
            }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
              selectedCategory === tab.id
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Spotlight Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Card: Featured Volunteer Hero Profile (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            {/* Avatar, Rank Badge & Basic Information */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentVolunteer.avatarGradient} flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-amber-500/30`}
                >
                  {currentVolunteer.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="absolute -bottom-2 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full border-2 border-slate-900 shadow">
                  <Award className="w-3.5 h-3.5 fill-slate-950" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{currentVolunteer.titleHonorific}</span>
                </div>
                <h3 className="text-lg font-black text-white leading-tight truncate">
                  {currentVolunteer.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {currentVolunteer.profession}
                </p>
                <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                  <Building className="w-3 h-3" />
                  <span>{currentVolunteer.homeMasjid}</span>
                  <span className="text-slate-500">•</span>
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{currentVolunteer.kelurahan}</span>
                </p>
              </div>
            </div>

            {/* Quote Motto Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 relative">
              <MessageSquareQuote className="w-5 h-5 text-amber-400/40 absolute top-2.5 right-3" />
              <p className="text-xs text-amber-100/90 italic leading-relaxed pr-6">
                &ldquo;{currentVolunteer.quoteMotto}&rdquo;
              </p>
            </div>

            {/* Core Impact Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Jam Khidmah</span>
                </div>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                  {currentVolunteer.totalServiceHours} Jam
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Briefcase className="w-3 h-3 text-emerald-400" />
                  <span>Misi Selesai</span>
                </div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  {currentVolunteer.missionsCompleted} Misi
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-sky-400" />
                  <span>Penerima</span>
                </div>
                <div className="text-base font-black text-sky-400 font-mono mt-0.5">
                  {currentVolunteer.beneficiariesImpacted} Jamaah
                </div>
              </div>
            </div>

            {/* SROI Impact Metric Badge */}
            <div className="p-3 bg-emerald-950/50 rounded-2xl border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-200">
                  Estimasi Nilai Manfaat Sosial (SROI):
                </span>
              </div>
              <span className="font-mono font-black text-emerald-400 text-sm">
                Rp {currentVolunteer.sroiGeneratedRp.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Specialty Tag Pills */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Keahlian & Spesialisasi Terverifikasi:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentVolunteer.specialtyTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Social Interaction Buttons */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <button
              onClick={() => handleSendPrayer(currentVolunteer.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                prayersGiven[currentVolunteer.id]
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md active:scale-95"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  prayersGiven[currentVolunteer.id]
                    ? "fill-emerald-400 text-emerald-400"
                    : "fill-white text-white"
                }`}
              />
              <span>
                {prayersGiven[currentVolunteer.id]
                  ? `Doa Terkirim (${currentVolunteer.prayersReceivedCount})`
                  : `Kirim Doa (${currentVolunteer.prayersReceivedCount})`}
              </span>
            </button>

            <button
              onClick={() => setShowQuickEndorseModal(true)}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              title="Beri Testimoni / Endorsement"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Testimoni ({currentVolunteer.endorsementCount})</span>
            </button>

            <button
              onClick={handleShareVolunteer}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              title="Bagikan Profil"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Section: Recent Accomplishments & Member Testimonials (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Recent Accomplishments & Milestones */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-black text-white">
                  Pencapaian & Aksi Nyata Terkini (Verified)
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                Otentik DKM
              </span>
            </div>

            <div className="space-y-3">
              {currentVolunteer.recentAccomplishments.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getBadgeIcon(acc.badgeIcon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/40">
                          {acc.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {acc.date}
                        </span>
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold text-white mt-1">
                        {acc.title}
                      </h5>
                      <p className="text-xs text-emerald-300 font-semibold mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{acc.impactMetric}</span>
                      </p>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1.5">
                        <span>Lokasi: {acc.location}</span>
                        <span>•</span>
                        <span className="text-slate-300">
                          Verifikator: {acc.dkmVerifier}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 bg-slate-950/60 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                    <div className="text-[10px] text-slate-400">Durasi Khidmah:</div>
                    <div className="text-xs font-mono font-black text-amber-400">
                      {acc.hoursSpent} Jam Lapangan
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Member Testimonials & Community Endorsements */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-black text-white">
                  Testimoni & Rekomendasi Anggota Jamaah
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentVolunteer.testimonials.length} Testimoni Publik
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentVolunteer.testimonials.map((test) => (
                <div
                  key={test.id}
                  className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg ${test.avatarColor} text-white text-xs font-bold flex items-center justify-center`}
                        >
                          {test.authorName[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {test.authorName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {test.relationshipContext}
                          </div>
                        </div>
                      </div>

                      <div className="flex text-amber-400 text-xs">
                        {[...Array(test.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      &ldquo;{test.testimonialQuote}&rdquo;
                    </p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-semibold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/40">
                      {test.trustTag}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {test.verifiedStamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dot Navigation for All Spotlight Profiles */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {filteredVolunteers.map((vol, idx) => (
          <button
            key={vol.id}
            onClick={() => handleSelectDot(idx)}
            title={`Lihat profil ${vol.name}`}
            className={`transition-all rounded-full ${
              currentIndex === idx
                ? "w-8 h-2.5 bg-amber-400 shadow-md"
                : "w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-400/80 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Testimonial Submission Modal */}
      {showQuickEndorseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Beri Testimoni untuk {currentVolunteer.name}
                </h3>
              </div>
              <button
                onClick={() => setShowQuickEndorseModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuickEndorsement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Anda / Gelar:
                </label>
                <input
                  type="text"
                  required
                  value={newEndorserName}
                  onChange={(e) => setNewEndorserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: dr. M. Hidayatullah / Pengurus RW"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Peran / Hubungan Khidmah:
                </label>
                <input
                  type="text"
                  required
                  value={newEndorserRole}
                  onChange={(e) => setNewEndorserRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: Rekan Tim Medis / Pengurus DKM / Jamaah"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Label Kepercayaan (Trust Tag):
                </label>
                <select
                  value={newTrustTag}
                  onChange={(e) => setNewTrustTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Sangat Amanah & Profesional">
                    Sangat Amanah & Profesional
                  </option>
                  <option value="Keahlian Teruji Lapangan">
                    Keahlian Teruji Lapangan
                  </option>
                  <option value="Cepat Tanggap & Ikhlas">
                    Cepat Tanggap & Ikhlas
                  </option>
                  <option value="Solutif & Berpengalaman">
                    Solutif & Berpengalaman
                  </option>
                  <option value="Rekomendasi Utama DKM">
                    Rekomendasi Utama DKM
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Isi Testimoni Kebaikan:
                </label>
                <textarea
                  required
                  rows={4}
                  value={newEndorsementText}
                  onChange={(e) => setNewEndorsementText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Tuliskan pengalaman positif saat berkolaborasi atau menerima manfaat khidmah dari beliau..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickEndorseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Testimoni</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerHighlightSpotlight;
