import { useState, useMemo, FormEvent } from "react";
import confetti from "canvas-confetti";
import {
  Briefcase,
  Search,
  Filter,
  UserPlus,
  Stethoscope,
  Calculator,
  Cpu,
  Scale,
  GraduationCap,
  Wrench,
  HeartHandshake,
  CheckCircle2,
  PhoneCall,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building,
  Award,
  Layers,
  Share2,
  ExternalLink,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  X,
  Send,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Flame,
  Check,
  Zap,
  MessageSquareQuote,
  Star,
  ThumbsUp,
} from "lucide-react";
import {
  TalentVolunteer,
  SkillClusterData,
  CommunityVolunteerOpportunity,
  SkillCategoryType,
} from "../types";
import {
  INITIAL_SKILL_CLUSTERS,
  INITIAL_TALENT_VOLUNTEERS_EXPANDED,
  INITIAL_COMMUNITY_OPPORTUNITIES,
} from "../data/talentRegistryData";

// Harmonic Audio notification
const playSuccessSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const freqs = [440, 554.37, 659.25, 880];
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
    console.log("Audio not supported", e);
  }
};

const getClusterIcon = (iconName: string) => {
  switch (iconName) {
    case "Stethoscope":
      return <Stethoscope className="w-5 h-5" />;
    case "Calculator":
      return <Calculator className="w-5 h-5" />;
    case "Cpu":
      return <Cpu className="w-5 h-5" />;
    case "Scale":
      return <Scale className="w-5 h-5" />;
    case "GraduationCap":
      return <GraduationCap className="w-5 h-5" />;
    case "Wrench":
      return <Wrench className="w-5 h-5" />;
    case "HeartHandshake":
    default:
      return <HeartHandshake className="w-5 h-5" />;
  }
};

export default function TalentSkillRegistry() {
  // Main state
  const [volunteers, setVolunteers] = useState<TalentVolunteer[]>(INITIAL_TALENT_VOLUNTEERS_EXPANDED);
  const [clusters, setClusters] = useState<SkillClusterData[]>(INITIAL_SKILL_CLUSTERS);
  const [opportunities, setOpportunities] = useState<CommunityVolunteerOpportunity[]>(INITIAL_COMMUNITY_OPPORTUNITIES);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCluster, setSelectedCluster] = useState<string>("ALL");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("ALL");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("ALL");
  const [chartViewMode, setChartViewMode] = useState<"BUBBLE_MAP" | "CLUSTER_GRID" | "RADAR_DENSITY">("BUBBLE_MAP");

  // Sub view tabs
  const [activeTab, setActiveTab] = useState<"EXPLORE_TALENTS" | "OPPORTUNITIES_MATCH" | "VOLUNTEER_REGISTRATION">("EXPLORE_TALENTS");

  // Selected Volunteer for Detail Modal
  const [selectedVolunteerModal, setSelectedVolunteerModal] = useState<TalentVolunteer | null>(null);
  const [contactSuccessMessage, setContactSuccessMessage] = useState<string | null>(null);

  // Registration Form State
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    skillCategory: "Kesehatan / Medis" as SkillCategoryType,
    subSkills: "",
    kelurahan: "Sukamulya",
    masjidBase: "Masjid Jami' Al-Ikhlas",
    availableDays: "Sabtu & Ahad",
    contributionType: "Konsultasi Gratis" as "Konsultasi Gratis" | "Aksi Lapangan & Darurat" | "Pelatihan & Workshop" | "Audit & Review",
    experienceYears: 5,
    contactPhone: "",
    email: "",
    bio: "",
  });
  const [newlyRegisteredBadge, setNewlyRegisteredBadge] = useState<TalentVolunteer | null>(null);

  // Dynamic calculations for clusters based on current volunteer pool
  const dynamicClusters = useMemo(() => {
    return clusters.map((cl) => {
      const matchingVols = volunteers.filter((v) => v.skillCategory === cl.category);
      const availCount = matchingVols.filter((v) => v.contactStatus === "Tersedia" || v.contactStatus === "Siaga 24 Jam").length;
      return {
        ...cl,
        totalVolunteers: matchingVols.length,
        availableVolunteers: availCount,
      };
    });
  }, [clusters, volunteers]);

  // Total summary metrics
  const totalVolunteersCount = volunteers.length;
  const totalHoursContributed = volunteers.reduce((acc, curr) => acc + (curr.hoursContributed || 0), 0);
  const totalMissionsCompleted = volunteers.reduce((acc, curr) => acc + (curr.missionsCompleted || 0), 0);
  const totalUrgentNeeds = opportunities.filter((o) => o.urgency === "Tinggi").length;

  // Filtered Volunteers
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((v) => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = v.name.toLowerCase().includes(q);
        const matchProf = v.profession.toLowerCase().includes(q);
        const matchMasjid = v.masjidBase.toLowerCase().includes(q);
        const matchBio = (v.bio || "").toLowerCase().includes(q);
        const matchSkills = (v.subSkills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchProf && !matchMasjid && !matchBio && !matchSkills) {
          return false;
        }
      }

      // Cluster filter
      if (selectedCluster !== "ALL" && v.skillCategory !== selectedCluster) {
        return false;
      }

      // Kelurahan filter
      if (selectedKelurahan !== "ALL" && v.kelurahan !== selectedKelurahan) {
        return false;
      }

      // Availability filter
      if (selectedAvailability !== "ALL" && v.contactStatus !== selectedAvailability) {
        return false;
      }

      return true;
    });
  }, [volunteers, searchQuery, selectedCluster, selectedKelurahan, selectedAvailability]);

  // Handle New Volunteer Form Submission
  const handleRegisterVolunteer = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.profession.trim()) {
      alert("Mohon lengkapi nama dan profesi Anda.");
      return;
    }

    const subSkillsArray = formData.subSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newVolunteer: TalentVolunteer = {
      id: `tv-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      profession: formData.profession.trim(),
      skillCategory: formData.skillCategory,
      subSkills: subSkillsArray.length > 0 ? subSkillsArray : ["Konsultasi Keahlian Jamaah", "Pemberdayaan Umat"],
      kelurahan: formData.kelurahan,
      masjidBase: formData.masjidBase,
      availableDays: [formData.availableDays],
      contactStatus: "Tersedia",
      contributionType: formData.contributionType,
      experienceYears: Number(formData.experienceYears) || 3,
      missionsCompleted: 1,
      hoursContributed: 4,
      verifiedByDkm: true,
      contactPhone: formData.contactPhone || "0812-xxxx-xxxx",
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      bio: formData.bio || "Berniat mewakafkan waktu dan keahlian profesional untuk kemaslahatan masjid dan masyarakat dhuafa.",
      avatarColor:
        formData.skillCategory === "Kesehatan / Medis"
          ? "bg-emerald-600"
          : formData.skillCategory === "Akuntansi & Finansial"
          ? "bg-sky-600"
          : formData.skillCategory === "Teknologi & IT"
          ? "bg-violet-600"
          : formData.skillCategory === "Hukum & Syariah"
          ? "bg-amber-600"
          : formData.skillCategory === "Teknik, Bangunan & Logistik"
          ? "bg-orange-600"
          : "bg-rose-600",
    };

    setVolunteers((prev) => [newVolunteer, ...prev]);
    setNewlyRegisteredBadge(newVolunteer);

    // Audio & Confetti
    playSuccessSound();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"],
    });

    // Reset form
    setFormData({
      name: "",
      profession: "",
      skillCategory: "Kesehatan / Medis",
      subSkills: "",
      kelurahan: "Sukamulya",
      masjidBase: "Masjid Jami' Al-Ikhlas",
      availableDays: "Sabtu & Ahad",
      contributionType: "Konsultasi Gratis",
      experienceYears: 5,
      contactPhone: "",
      email: "",
      bio: "",
    });
  };

  // Handle Contact / Dispatch Volunteer
  const handleContactVolunteer = (vol: TalentVolunteer) => {
    setSelectedVolunteerModal(vol);
    setContactSuccessMessage(null);
  };

  const handleSendDispatchAlert = (vol: TalentVolunteer) => {
    setContactSuccessMessage(
      `Pesan permohonan ta'awun ukhuwah telah diteruskan ke WhatsApp ${vol.name} & Takmir ${vol.masjidBase}.`
    );
    setTimeout(() => {
      setContactSuccessMessage(null);
      setSelectedVolunteerModal(null);
    }, 2500);
  };

  // Handle Apply to Community Program
  const handleAssignVolunteerToOpportunity = (oppId: string, volId: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== oppId) return opp;
        if (opp.assignedVolunteerIds.includes(volId)) return opp;
        return {
          ...opp,
          volunteersJoined: opp.volunteersJoined + 1,
          assignedVolunteerIds: [...opp.assignedVolunteerIds, volId],
        };
      })
    );

    playSuccessSound();
    alert("Relawan berhasil ditautkan ke program umat!");
  };

  return (
    <div id="talent-skill-registry-module" className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-stone-900 border border-amber-800/60 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                Talent & Professional Skill Registry
              </span>
              <span className="text-xs text-amber-200/80 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Wakaf Keahlian & Ta'awun Profesi Jamaah
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bank Keahlian & Jaringan Relawan Profesional Umat
            </h3>

            <p className="text-xs sm:text-sm text-amber-100/80 max-w-2xl leading-relaxed">
              Mewadahi potensi profesi jamaah masjid (dokter, akuntan, insinyur, pakar IT, notaris, guru tahfidz) untuk bersinergi menyelesaikan kebutuhan sosial, klinik dhuafa, audit kas, dan tata kelola masjid di Sematang Borang.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("VOLUNTEER_REGISTRATION")}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan Keahlian Anda</span>
            </button>
            <div className="text-[11px] text-amber-300/90 font-mono text-center md:text-right">
              {totalVolunteersCount} Relawan Aktif • {totalHoursContributed} Jam Kontribusi
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab("EXPLORE_TALENTS")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "EXPLORE_TALENTS"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Peta Kluster & Direktori Relawan ({volunteers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("OPPORTUNITIES_MATCH")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "OPPORTUNITIES_MATCH"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Kebutuhan Relawan Program Umat ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("VOLUNTEER_REGISTRATION")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "VOLUNTEER_REGISTRATION"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Formulir Ikrar Wakaf Keahlian</span>
          </button>
        </div>

        {/* View Mode Toggle for Chart */}
        {activeTab === "EXPLORE_TALENTS" && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs border border-slate-200">
            <button
              onClick={() => setChartViewMode("BUBBLE_MAP")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                chartViewMode === "BUBBLE_MAP"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Cluster Visualizer
            </button>
            <button
              onClick={() => setChartViewMode("CLUSTER_GRID")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                chartViewMode === "CLUSTER_GRID"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Grid Matriks
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: EXPLORE TALENTS & SKILL CLUSTER CHART */}
      {activeTab === "EXPLORE_TALENTS" && (
        <div className="space-y-6">
          {/* INTERACTIVE SEARCHABLE SKILL-CLUSTER CHART / VISUALIZER */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    Searchable Skill-Cluster Chart & Hub Interaktif
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Klik gelembung kluster keahlian untuk memfokuskan daftar relawan dan melihat densitas kompetensi.
                </p>
              </div>

              {/* Reset Cluster Filter */}
              {selectedCluster !== "ALL" && (
                <button
                  onClick={() => setSelectedCluster("ALL")}
                  className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-semibold hover:bg-amber-500/30 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Reset Filter: {selectedCluster}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* BUBBLE / NODE CLUSTER MAP VIEW */}
            {chartViewMode === "BUBBLE_MAP" ? (
              <div className="relative bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 overflow-hidden min-h-[320px] flex flex-col justify-between">
                {/* Visual Connection Lines background simulation */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <svg className="w-full h-full">
                    <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,4" />
                    <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,4" />
                    <line x1="30%" y1="80%" x2="50%" y2="50%" stroke="#34d399" strokeWidth="2" strokeDasharray="4,4" />
                    <line x1="70%" y1="80%" x2="50%" y2="50%" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4,4" />
                    <circle cx="50%" cy="50%" r="60" fill="none" stroke="#f59e0b" strokeWidth="1" />
                  </svg>
                </div>

                {/* Central Hub Badge */}
                <div className="relative z-10 text-center py-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-md">
                    <Building className="w-3.5 h-3.5" />
                    <span>Central Baitul Maal & Takmir Sematang Borang Talent Hub</span>
                  </div>
                </div>

                {/* Interactive Dynamic Clusters in responsive layout */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                  {dynamicClusters.map((cluster) => {
                    const isSelected = selectedCluster === cluster.category;
                    return (
                      <div
                        key={cluster.id}
                        onClick={() =>
                          setSelectedCluster(isSelected ? "ALL" : cluster.category)
                        }
                        className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between ${
                          isSelected
                            ? "bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/50 shadow-xl scale-[1.02]"
                            : "bg-slate-900/80 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                              style={{ backgroundColor: cluster.color }}
                            >
                              {getClusterIcon(cluster.iconName)}
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 border border-slate-600 text-slate-200">
                              {cluster.totalVolunteers} Ahli
                            </span>
                          </div>

                          <div>
                            <h5 className="font-bold text-white text-xs leading-snug">
                              {cluster.label}
                            </h5>
                            <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-1">
                              {cluster.description}
                            </p>
                          </div>
                        </div>

                        {/* Subskills pills */}
                        <div className="pt-3 border-t border-slate-800 mt-2">
                          <div className="flex flex-wrap gap-1">
                            {cluster.coreSkills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                              >
                                {skill}
                              </span>
                            ))}
                            {cluster.coreSkills.length > 3 && (
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                                +{cluster.coreSkills.length - 3} lagi
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold pt-2">
                            <span>{cluster.availableVolunteers} Siap Bertugas</span>
                            <span className="text-amber-300 font-bold flex items-center gap-0.5">
                              {isSelected ? "Sedang Difilter" : "Pilih Kluster"} <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* GRID MATRIKS VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dynamicClusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    onClick={() => setSelectedCluster(cluster.category)}
                    className="p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-400/60 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: cluster.color }}
                        >
                          {getClusterIcon(cluster.iconName)}
                        </div>
                        <h5 className="font-bold text-white text-xs">{cluster.label}</h5>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {cluster.totalVolunteers} Ahli
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: cluster.color,
                          width: `${Math.min(100, (cluster.totalVolunteers / 15) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {cluster.coreSkills.join(" • ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEARCH & MULTI-FACETED FILTER BAR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama relawan, profesi, keahlian teknis (contoh: Penyakit Dalam, Notaris, PSAK 109, Cloud)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Cluster Filter */}
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="ALL">Semua Kluster Keahlian</option>
                  <option value="Kesehatan / Medis">Kesehatan / Medis</option>
                  <option value="Akuntansi & Finansial">Akuntansi & Finansial</option>
                  <option value="Teknologi & IT">Teknologi & IT</option>
                  <option value="Hukum & Syariah">Hukum & Syariah</option>
                  <option value="Pendidikan & Tahfidz">Pendidikan & Tahfidz</option>
                  <option value="Teknik, Bangunan & Logistik">Teknik & Logistik</option>
                  <option value="Penyelenggaraan Jenazah & Sosial">Jenazah & Sosial</option>
                </select>

                {/* Kelurahan Filter */}
                <select
                  value={selectedKelurahan}
                  onChange={(e) => setSelectedKelurahan(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="ALL">Semua Kelurahan</option>
                  <option value="Sukamulya">Sukamulya</option>
                  <option value="Lebung Gajah">Lebung Gajah</option>
                  <option value="Karya Mulya">Karya Mulya</option>
                  <option value="Srimulya">Srimulya</option>
                </select>

                {/* Availability Filter */}
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="ALL">Semua Status Siaga</option>
                  <option value="Tersedia">Tersedia (Ready)</option>
                  <option value="Siaga 24 Jam">Siaga 24 Jam Darurat</option>
                  <option value="Sedang Bertugas">Sedang Bertugas</option>
                </select>
              </div>
            </div>

            {/* Filter Results Info */}
            <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-2">
              <div>
                Menampilkan <strong>{filteredVolunteers.length}</strong> relawan profesional terverifikasi DKM
              </div>
              {(selectedCluster !== "ALL" || selectedKelurahan !== "ALL" || selectedAvailability !== "ALL" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCluster("ALL");
                    setSelectedKelurahan("ALL");
                    setSelectedAvailability("ALL");
                    setSearchQuery("");
                  }}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          </div>

          {/* VOLUNTEER CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVolunteers.map((vol) => (
              <div
                key={vol.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition flex flex-col justify-between relative group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Cluster Tag & Availability */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px]">
                      {vol.skillCategory}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        vol.contactStatus === "Tersedia"
                          ? "bg-emerald-100 text-emerald-800"
                          : vol.contactStatus === "Siaga 24 Jam"
                          ? "bg-rose-100 text-rose-800 animate-pulse font-extrabold"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          vol.contactStatus === "Tersedia"
                            ? "bg-emerald-600"
                            : vol.contactStatus === "Siaga 24 Jam"
                            ? "bg-rose-600"
                            : "bg-slate-400"
                        }`}
                      />
                      {vol.contactStatus}
                    </span>
                  </div>

                  {/* Header Profile with Avatar */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm ${
                        vol.avatarColor || "bg-amber-600"
                      }`}
                    >
                      {vol.name
                        .replace(/(dr\.|H\.|Ir\.|Ust\.|Hj\.)/g, "")
                        .trim()
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-amber-700 transition">
                        {vol.name}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {vol.profession}
                      </p>
                      <div className="flex items-center gap-1 text-[10.5px] text-emerald-700 font-semibold mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Terverifikasi DKM ({vol.experienceYears || 5}+ thn pengalaman)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio statement */}
                  {vol.bio && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      "{vol.bio}"
                    </p>
                  )}

                  {/* Sub-skills Tags */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Spesialisasi & Keahlian:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(vol.subSkills || []).map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-amber-50 text-slate-700 rounded-md text-[10.5px] font-medium border border-slate-200/80"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Masjid & Schedule */}
                  <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Basis: <strong>{vol.masjidBase}</strong> (Kel. {vol.kelurahan})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Waktu Siaga: {vol.availableDays.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        Jejak Ta'awun: <strong>{vol.missionsCompleted || 10} Misi</strong> ({vol.hoursContributed || 30} Jam)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleContactVolunteer(vol)}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Hubungi Relawan</span>
                  </button>

                  <button
                    onClick={() => setSelectedVolunteerModal(vol)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs"
                    title="Lihat Detail Profil & Kartu Relawan"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredVolunteers.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h5 className="font-bold text-slate-800 text-sm">
                Tidak ada relawan yang sesuai dengan kriteria pencarian
              </h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba ubah kata kunci atau reset filter kluster keahlian Anda.
              </p>
              <button
                onClick={() => {
                  setSelectedCluster("ALL");
                  setSelectedKelurahan("ALL");
                  setSelectedAvailability("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMMUNITY PROGRAM VOLUNTEER MATCHING BOARD */}
      {activeTab === "OPPORTUNITIES_MATCH" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-teal-800/80 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-bold text-white">
                  Papan Kebutuhan Relawan Program Umat & Masjid
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Daftar inisiatif sosial, klinik keliling, audit keuangan, dan pemeliharaan masjid yang memerlukan keahlian spesifik jamaah.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-400/40 rounded-xl text-xs font-bold">
                {totalUrgentNeeds} Program Butuh Penugasan Segera
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {opportunities.map((opp) => {
              const matchedVolunteers = volunteers.filter(
                (v) => v.skillCategory === opp.targetCategory
              );
              const isFulfilled = opp.volunteersJoined >= opp.volunteersNeeded;

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[10px]">
                        {opp.targetCategory}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          opp.urgency === "Tinggi"
                            ? "bg-rose-100 text-rose-800"
                            : opp.urgency === "Sedang"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        Urgensi: {opp.urgency}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {opp.programTitle}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">{opp.description}</p>
                    </div>

                    {/* Meta info */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Penyelenggara:</span>
                        <strong className="text-slate-800">{opp.organizerMasjid}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Jadwal Pelaksanaan:</span>
                        <strong className="text-slate-800">{opp.dateSchedule}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Kebutuhan Relawan:</span>
                        <strong className="font-mono text-teal-700 font-bold">
                          {opp.volunteersJoined} / {opp.volunteersNeeded} Orang
                        </strong>
                      </div>
                    </div>

                    {/* Required Skills Tags */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Keahlian yang Dibutuhkan:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {opp.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10.5px] font-semibold"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Matched Volunteers from Registry */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Relawan Terdaftar & Cocok ({matchedVolunteers.length} orang tersedia):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedVolunteers.slice(0, 3).map((mv) => {
                          const isAssigned = opp.assignedVolunteerIds.includes(mv.id);
                          return (
                            <div
                              key={mv.id}
                              className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border ${
                                isAssigned
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold"
                                  : "bg-white text-slate-700 border-slate-200"
                              }`}
                            >
                              <span>{mv.name}</span>
                              {isAssigned ? (
                                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1 rounded">
                                  Tergabung
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAssignVolunteerToOpportunity(opp.id, mv.id)}
                                  className="text-[10px] text-amber-800 bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded font-bold transition"
                                >
                                  + Tugaskan
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        const firstMatch = matchedVolunteers[0];
                        if (firstMatch) {
                          handleAssignVolunteerToOpportunity(opp.id, firstMatch.id);
                        } else {
                          alert("Mohon daftarkan relawan baru pada formulir pendaftaran.");
                        }
                      }}
                      disabled={isFulfilled}
                      className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition ${
                        isFulfilled
                          ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                          : "bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isFulfilled ? "Kuota Relawan Terpenuhi" : "Daftarkan Diri untuk Program Ini"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: VOLUNTEER ONBOARDING / IKRAR WAKAF KEAHLIAN FORM */}
      {activeTab === "VOLUNTEER_REGISTRATION" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  <span>Formulir Pendaftaran Relawan Keahlian Jamaah</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Wakafkan keahlian profesional Anda untuk kemaslahatan umat & syiar dakwah.
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Pendaftaran Terbuka
              </span>
            </div>

            <form onSubmit={handleRegisterVolunteer} className="space-y-4 text-xs">
              {/* Nama & Profesi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: dr. H. Muhammad Ihsan, Sp.A"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Profesi / Jabatan Utama *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="Contoh: Dokter Spesialis Anak / Akuntan Publik"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Kluster Keahlian & Tipe Kontribusi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kluster Keahlian Utama
                  </label>
                  <select
                    value={formData.skillCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, skillCategory: e.target.value as SkillCategoryType })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Kesehatan / Medis">Kesehatan, Medis & Farmasi</option>
                    <option value="Akuntansi & Finansial">Akuntansi, Pajak & Keuangan Syariah</option>
                    <option value="Teknologi & IT">Teknologi, IT & Multimedia Dakwah</option>
                    <option value="Hukum & Syariah">Hukum, Notariat & Konsultasi Syariah</option>
                    <option value="Pendidikan & Tahfidz">Pendidikan, Tahfidz & Bahasa Asing</option>
                    <option value="Teknik, Bangunan & Logistik">Teknik, Akustik Masjid & Logistik</option>
                    <option value="Penyelenggaraan Jenazah & Sosial">Penyelenggaraan Jenazah & Sosial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bentuk Kontribusi yang Disanggupi
                  </label>
                  <select
                    value={formData.contributionType}
                    onChange={(e) =>
                      setFormData({ ...formData, contributionType: e.target.value as any })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Konsultasi Gratis">Konsultasi Gratis / Pro Bono</option>
                    <option value="Aksi Lapangan & Darurat">Aksi Lapangan & Siaga Darurat</option>
                    <option value="Pelatihan & Workshop">Pelatihan & Workshop Jamaah</option>
                    <option value="Audit & Review">Audit & Review Tata Kelola</option>
                  </select>
                </div>
              </div>

              {/* Sub-skills tags comma separated */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Spesialisasi / Keterampilan Teknis (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.subSkills}
                  onChange={(e) => setFormData({ ...formData, subSkills: e.target.value })}
                  placeholder="Contoh: USG Abdomen, Audit PSAK 109, React Web, Setup WiFi, Notaris Wakaf"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Kelurahan & Masjid Base */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelurahan Domisili
                  </label>
                  <select
                    value={formData.kelurahan}
                    onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Sukamulya">Sukamulya</option>
                    <option value="Lebung Gajah">Lebung Gajah</option>
                    <option value="Karya Mulya">Karya Mulya</option>
                    <option value="Srimulya">Srimulya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Simpul Masjid / Musholla Binaan
                  </label>
                  <select
                    value={formData.masjidBase}
                    onChange={(e) => setFormData({ ...formData, masjidBase: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Masjid Jami' Al-Ikhlas">Masjid Jami' Al-Ikhlas (Sukamulya)</option>
                    <option value="Masjid Baiturrahman">Masjid Baiturrahman (Lebung Gajah)</option>
                    <option value="Masjid Nurul Huda">Masjid Nurul Huda (Karya Mulya)</option>
                    <option value="Masjid Al-Muhajirin">Masjid Al-Muhajirin (Srimulya)</option>
                  </select>
                </div>
              </div>

              {/* Kontak & Waktu Siaga */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Kontak
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Waktu / Hari Siaga
                  </label>
                  <input
                    type="text"
                    value={formData.availableDays}
                    onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                    placeholder="Contoh: Ahad Pagi / Fleksibel"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio & Niat */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivasi / Niat Ta'awun Umat
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Ceritakan pengalaman singkat atau komitmen Anda dalam membantu kegiatan sosial masjid..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pendaftaran & Dapatkan ID Relawan Resmi</span>
              </button>
            </form>
          </div>

          {/* Right Column: Dynamic Preview ID Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-950 text-white rounded-3xl p-6 border-2 border-amber-400/80 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                      Kartu Relawan Keahlian Umat
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      ID: REL-2026-{(formData.name.length * 17 + 82).toString().padStart(4, "0")}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold">
                  VERIFIED DKM
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="text-base font-black text-white">
                  {formData.name || "Nama Lengkap Calon Relawan"}
                </div>
                <div className="text-xs text-amber-300 font-semibold">
                  {formData.profession || "Profesi / Bidang Keahlian"}
                </div>
                <div className="text-[11px] text-slate-300">
                  📍 Basis: {formData.masjidBase} (Kel. {formData.kelurahan})
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 space-y-1 text-xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  Spesialisasi Kluster:
                </div>
                <div className="font-bold text-amber-400">{formData.skillCategory}</div>
                <div className="text-[11px] text-slate-300">
                  Waktu Siaga: {formData.availableDays || "Fleksibel"}
                </div>
              </div>

              <div className="text-[10.5px] text-slate-400 leading-relaxed italic border-t border-slate-800 pt-3">
                "Sebaik-baik manusia adalah yang paling bermanfaat bagi sesamanya." (HR. Ahmad)
              </div>
            </div>

            {/* If newly registered, show celebration box */}
            {newlyRegisteredBadge && (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-emerald-950 text-sm">
                  Alhamdulillah! Pendaftaran Berhasil
                </h5>
                <p className="text-xs text-emerald-800">
                  Keahlian <strong>{newlyRegisteredBadge.name}</strong> telah masuk ke dalam direktori relawan & sistem pencocokan program masjid.
                </p>
                <button
                  onClick={() => setActiveTab("EXPLORE_TALENTS")}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Lihat di Direktori Kluster
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL VOLUNTEER & CONTACT MODAL */}
      {selectedVolunteerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Profil Relawan & Kontak Ukhuwah
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    ID Relawan: {selectedVolunteerModal.id.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVolunteerModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactSuccessMessage ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h5 className="font-bold text-slate-900 text-base">
                  Permohonan Ta'awun Terkirim!
                </h5>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  {contactSuccessMessage}
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Volunteer Header */}
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div
                    className={`w-12 h-12 rounded-2xl text-white font-bold flex items-center justify-center text-base shrink-0 ${
                      selectedVolunteerModal.avatarColor || "bg-amber-600"
                    }`}
                  >
                    {selectedVolunteerModal.name
                      .replace(/(dr\.|H\.|Ir\.|Ust\.|Hj\.)/g, "")
                      .trim()
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {selectedVolunteerModal.name}
                    </h5>
                    <p className="text-slate-600 font-medium">
                      {selectedVolunteerModal.profession}
                    </p>
                    <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                      Kluster: {selectedVolunteerModal.skillCategory}
                    </div>
                  </div>
                </div>

                {/* Bio statement */}
                {selectedVolunteerModal.bio && (
                  <div className="text-slate-700 italic bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                    "{selectedVolunteerModal.bio}"
                  </div>
                )}

                {/* Sub skills */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Keahlian & Layanan Pro Bono:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(selectedVolunteerModal.subSkills || []).map((sub, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-semibold text-[11px]"
                      >
                        ✓ {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats & Base */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11.5px]">
                  <div>
                    <span className="text-slate-500 block">Basis Masjid:</span>
                    <strong className="text-slate-900">{selectedVolunteerModal.masjidBase}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Jadwal Siaga:</span>
                    <strong className="text-slate-900">
                      {selectedVolunteerModal.availableDays.join(", ")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Misi Selesai:</span>
                    <strong className="text-emerald-700 font-mono">
                      {selectedVolunteerModal.missionsCompleted || 12} Program
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Kontribusi Waktu:</span>
                    <strong className="text-amber-700 font-mono">
                      {selectedVolunteerModal.hoursContributed || 40} Jam
                    </strong>
                  </div>
                </div>

                {/* Peer-to-Peer Endorsement Highlights in Modal */}
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                      <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Validasi & Rekomendasi Umat (Endorsements)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      5.0 (P2P Verified)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-950 italic leading-relaxed">
                    &ldquo;Keahlian dan dedikasi relawan ini telah diverifikasi oleh DKM dan direkomendasikan secara publik oleh sesama relawan aktif di Sematang Borang.&rdquo;
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleSendDispatchAlert(selectedVolunteerModal)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Kirim Permohonan Ta'awun via WA</span>
                  </button>

                  <button
                    onClick={() => {
                      const text = `Assalamu'alaikum, saya ingin bersilaturahmi dan memohon bantuan keahlian ukhuwah dari ${selectedVolunteerModal.name} (${selectedVolunteerModal.profession}) untuk kegiatan masjid di Sematang Borang.`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="Bagikan Kontak"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
