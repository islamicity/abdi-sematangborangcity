import { useState, useEffect, FormEvent } from "react";
import {
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  Plus,
  Heart,
  Activity,
  Layers,
  Search,
  Filter,
  PhoneCall,
  UserPlus,
  Send,
  Building,
  Sparkles,
  Share2,
  QrCode,
  Target,
  Milestone,
  UserCheck,
  Award,
  ShieldCheck,
  Edit3,
  Flame,
  X,
  Vote,
  Network,
  Trophy,
  History,
} from "lucide-react";
import { KelurahanData, CommunityEvent, UserProfileOnboarding } from "../types";
import { KELURAHAN_GIS_DATA, COMMUNITY_EVENTS } from "../data/mockData";
import CommunityIntelligenceSocialMapping from "./CommunityIntelligenceSocialMapping";
import TalentSkillRegistry from "./TalentSkillRegistry";
import CommunityResourceLibrary from "./CommunityResourceLibrary";
import VolunteerDigitalAttendance from "./VolunteerDigitalAttendance";
import CommunityImpactDashboard from "./CommunityImpactDashboard";
import ServiceJourneyTimeline from "./ServiceJourneyTimeline";
import OnboardingWizard from "./OnboardingWizard";
import SkillSyncOverlay from "./SkillSyncOverlay";
import SadaqahImpactTracker from "./SadaqahImpactTracker";
import VolunteerHighlightSpotlight from "./VolunteerHighlightSpotlight";
import InteractiveCommunityPolls from "./InteractiveCommunityPolls";
import CommunitySkillMap from "./CommunitySkillMap";
import DigitalMosqueHonors from "./DigitalMosqueHonors";
import ContributorLeaderboard from "./ContributorLeaderboard";
import ContributionTimelineModal from "./ContributionTimelineModal";
import MosqueQrAttendanceModal from "./MosqueQrAttendanceModal";
import MosqueDonationQrGenerator from "./MosqueDonationQrGenerator";

// Default Initial Personalized Volunteer Profile
const DEFAULT_ONBOARDED_USER: UserProfileOnboarding = {
  id: "vol-9814",
  fullName: "dr. Muhammad Hidayatullah, Sp.A",
  email: "m.hidayat@relawan.islamicity.org",
  phone: "0812-7890-4432",
  profilePictureUrl: "",
  avatarPresetColor: "emerald",
  homeMasjid: "Masjid Jami' Al-Ikhlas",
  kelurahan: "Sukamulya",
  profession: "Dokter Spesialis Anak & Relawan Posyandu Dhuafa",
  primarySkillCategory: "Kesehatan / Medis",
  selectedSubSkills: ["Penyakit Dalam & Anak", "Pertolongan Pertama Gawat Darurat", "Pemeriksaan Lab Sederhana", "Penyuluhan Gizi Lansia"],
  experienceLevel: "Profesional / Senior",
  availabilityDays: ["Jumat Berkah", "Sabtu", "Ahad (Pagi)"],
  weeklyHoursTarget: 4,
  contributionType: "Aksi Lapangan & Darurat",
  priorityCauses: ["cause-kesehatan", "cause-yatim-pendidikan", "cause-bencana"],
  preferredTeamRole: "Koordinator Tim Medis & Logistik Darurat",
  pledgeMotivation: "Bismillah, saya berniat mewakafkan waktu dan keahlian profesi medis saya demi melayani jamaah lansia, mustahiq dhuafa, dan kemakmuran masjid di wilayah Sematang Borang secara ikhlas lillahi ta'ala.",
  emergencyAlertOptIn: true,
  weekendWorkshopOptIn: true,
  onboardingCompletedAt: "2026-08-17T08:00:00.000Z",
  memberIdCardNumber: "DKM-SB-2026-9814",
};

export default function BerjamaahModule() {
  const [activeSubTab, setActiveSubTab] = useState<
    | "digital_honors"
    | "leaderboard"
    | "mosque_qr_donation"
    | "skill_map"
    | "community_polls"
    | "volunteer_spotlight"
    | "service_journey"
    | "sadaqah_tracker"
    | "impact_dashboard"
    | "social_mapping"
    | "gis_map"
    | "events"
    | "talent_bank"
    | "resource_library"
    | "digital_attendance"
    | "onboarding_wizard"
  >("digital_honors");

  // User Profile State from LocalStorage or Default
  const [userProfile, setUserProfile] = useState<UserProfileOnboarding>(() => {
    try {
      const saved = localStorage.getItem("berjamaah_user_onboarding_profile");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.log("Could not load stored profile", e);
    }
    return DEFAULT_ONBOARDED_USER;
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showKtaModal, setShowKtaModal] = useState<boolean>(false);
  const [showSkillSyncOverlay, setShowSkillSyncOverlay] = useState<boolean>(false);
  const [showContributionTimelineModal, setShowContributionTimelineModal] = useState<boolean>(false);
  const [showMosqueQrModal, setShowMosqueQrModal] = useState<boolean>(false);
  const [selectedTimelineUser, setSelectedTimelineUser] = useState<string>(DEFAULT_ONBOARDED_USER.fullName);
  const [onboardingToast, setOnboardingToast] = useState<string | null>(null);

  const [selectedKelurahan, setSelectedKelurahan] = useState<KelurahanData>(KELURAHAN_GIS_DATA[0]);
  const [eventsList, setEventsList] = useState<CommunityEvent[]>(COMMUNITY_EVENTS);

  // Save profile handler
  const handleSaveUserProfile = (profile: UserProfileOnboarding) => {
    setUserProfile(profile);
    try {
      localStorage.setItem("berjamaah_user_onboarding_profile", JSON.stringify(profile));
    } catch (e) {
      console.log("Could not save profile to localStorage", e);
    }
    setShowOnboardingModal(false);
    setOnboardingToast(`Alhamdulillah! Profil Relawan atas nama ${profile.fullName} berhasil dipersonalisasi.`);
    setTimeout(() => {
      setOnboardingToast(null);
    }, 4500);
    // Switch to service journey or personalized view
    if (activeSubTab === "onboarding_wizard") {
      setActiveSubTab("service_journey");
    }
  };

  // Registration modal
  const [rsvpEvent, setRsvpEvent] = useState<CommunityEvent | null>(null);
  const [rsvpName, setRsvpName] = useState<string>("");
  const [rsvpPhone, setRsvpPhone] = useState<string>("");
  const [rsvpSuccess, setRsvpSuccess] = useState<boolean>(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [selectedEventForTask, setSelectedEventForTask] = useState<string>(eventsList[0].id);

  const handleToggleTaskStatus = (eventId: string, taskId: string) => {
    setEventsList((prev) =>
      prev.map((evt) => {
        if (evt.id !== eventId) return evt;
        return {
          ...evt,
          tasks: evt.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const nextStatus =
              task.status === "TODO"
                ? "IN_PROGRESS"
                : task.status === "IN_PROGRESS"
                ? "COMPLETED"
                : "TODO";
            return { ...task, status: nextStatus };
          }),
        };
      })
    );
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setEventsList((prev) =>
      prev.map((evt) => {
        if (evt.id !== selectedEventForTask) return evt;
        return {
          ...evt,
          tasks: [
            ...evt.tasks,
            {
              id: `task-${Date.now()}`,
              title: newTaskTitle,
              assignedTo: newTaskAssignee || "Relawan Jamaah",
              status: "TODO",
            },
          ],
        };
      })
    );

    setNewTaskTitle("");
    setNewTaskAssignee("");
    alert("Tugas kepanitiaan berhasil ditambahkan!");
  };

  const handleRsvpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!rsvpEvent || !rsvpName.trim()) return;

    setEventsList((prev) =>
      prev.map((evt) =>
        evt.id === rsvpEvent.id
          ? { ...evt, registeredCount: evt.registeredCount + 1 }
          : evt
      )
    );

    setRsvpSuccess(true);
    setTimeout(() => {
      setRsvpSuccess(false);
      setRsvpEvent(null);
      setRsvpName("");
      setRsvpPhone("");
    }, 2000);
  };

  const totalMuslims = KELURAHAN_GIS_DATA.reduce((acc, curr) => acc + curr.totalMuslims, 0);
  const totalMasjids = KELURAHAN_GIS_DATA.reduce((acc, curr) => acc + curr.activeMasjids, 0);
  const totalMushollas = KELURAHAN_GIS_DATA.reduce((acc, curr) => acc + curr.mushollas, 0);
  const totalMustahiq = KELURAHAN_GIS_DATA.reduce((acc, curr) => acc + curr.mustahiqFamilies, 0);
  const totalMuzakki = KELURAHAN_GIS_DATA.reduce((acc, curr) => acc + curr.muzakkiCount, 0);
  const totalRelawan = KELURAHAN_GIS_DATA.reduce((acc, curr) => acc + curr.activeRelawan, 0);

  return (
    <div id="berjamaah-module" className="space-y-6">
      {/* Pillar Header Card */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 rounded-2xl p-6 text-white border border-amber-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800/60 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>PILAR 3 : BERJAMAAH (Community Intelligence & Social Mapping)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              GIS Pemetaan Jamaah & Orkestrasi Umat
            </h2>
            <p className="text-sm text-amber-200/90 max-w-2xl mt-1">
              Platform Visual Reporting berbasis GIS/peta spasial untuk memetakan sebaran jamaah, masjid, mustahiq vs muzakki di Sematang Borang serta orkestrasi kegiatan berjamaah.
            </p>
          </div>

          {/* Sub-Navigation Buttons */}
          <div className="flex flex-wrap gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-amber-800/60">
            <button
              id="subtab-digital-honors"
              onClick={() => setActiveSubTab("digital_honors")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "digital_honors"
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/40"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60 border border-amber-500/40"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              Digital Mosque Honors (Prasasti Pengabdi)
            </button>
            <button
              id="subtab-leaderboard"
              onClick={() => setActiveSubTab("leaderboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "leaderboard"
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/40"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60 border border-amber-500/40"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Leaderboard Pengabdi (Progress Bar)
            </button>
            <button
              id="subtab-contribution-timeline"
              onClick={() => {
                setSelectedTimelineUser(userProfile.fullName);
                setShowContributionTimelineModal(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 text-amber-300 hover:text-white hover:bg-amber-900/60 border border-amber-400/50 shadow-sm cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Contribution Timeline (Linimasa Khidmah)</span>
            </button>
            <button
              id="subtab-mosque-qr-scanner"
              onClick={() => setShowMosqueQrModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-emerald-600/25 text-emerald-300 hover:text-white hover:bg-emerald-900/70 border border-emerald-400/60 shadow-sm cursor-pointer ring-1 ring-emerald-400/30"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>QR Check-In Sesi (Kamera & Kiosk)</span>
            </button>
            <button
              id="subtab-mosque-qr-donation"
              onClick={() => setActiveSubTab("mosque_qr_donation")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "mosque_qr_donation"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 shadow-md font-black ring-2 ring-emerald-400/40"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-900/60 border border-emerald-500/40"
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>QR Infaq Masjid (Transparan)</span>
            </button>
            <button
              id="subtab-skill-map"
              onClick={() => setActiveSubTab("skill_map")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "skill_map"
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/40"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60 border border-amber-500/40"
              }`}
            >
              <Network className="w-3.5 h-3.5 text-amber-400" />
              Community Skill Map (D3 Graph)
            </button>
            <button
              id="subtab-community-polls"
              onClick={() => setActiveSubTab("community_polls")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "community_polls"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 shadow-md font-black ring-2 ring-emerald-400/40"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-900/60 border border-emerald-500/40"
              }`}
            >
              <Vote className="w-3.5 h-3.5 text-emerald-400" />
              Community Polls (Jajak Pendapat)
            </button>
            <button
              id="subtab-volunteer-spotlight"
              onClick={() => setActiveSubTab("volunteer_spotlight")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "volunteer_spotlight"
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/40"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60 border border-amber-500/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Volunteer Spotlight (Rotating Showcase)
            </button>
            <button
              id="subtab-service-journey"
              onClick={() => setActiveSubTab("service_journey")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "service_journey"
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60"
              }`}
            >
              <Milestone className="w-3.5 h-3.5" />
              Service Journey Timeline (Interactive)
            </button>
            <button
              id="subtab-sadaqah-tracker"
              onClick={() => setActiveSubTab("sadaqah_tracker")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "sadaqah_tracker"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 shadow-md font-black"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-900/60 border border-emerald-500/40"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              Sadaqah Impact Tracker (Progress Ring)
            </button>
            <button
              id="subtab-impact-dashboard"
              onClick={() => setActiveSubTab("impact_dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "impact_dashboard"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 shadow-md font-black"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Community Impact Dashboard (Radial Progress)
            </button>
            <button
              id="subtab-social-mapping"
              onClick={() => setActiveSubTab("social_mapping")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "social_mapping"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Community Intelligence & Social Mapping
            </button>
            <button
              id="subtab-gis-map"
              onClick={() => setActiveSubTab("gis_map")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "gis_map"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              GIS Resource Map
            </button>
            <button
              id="subtab-events"
              onClick={() => setActiveSubTab("events")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "events"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Event & Task Orchestration
            </button>
            <button
              id="subtab-talent-bank"
              onClick={() => setActiveSubTab("talent_bank")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "talent_bank"
                  ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Talent & Skill Registry
            </button>
            <button
              id="subtab-resource-library"
              onClick={() => setActiveSubTab("resource_library")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "resource_library"
                  ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Resource Library (&apos;Ariyah)
            </button>
            <button
              id="subtab-digital-attendance"
              onClick={() => setActiveSubTab("digital_attendance")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "digital_attendance"
                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black"
                  : "text-amber-300 hover:text-white hover:bg-amber-900/60"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Digital Attendance (QR Presensi)
            </button>
            <button
              id="subtab-onboarding-wizard"
              onClick={() => setActiveSubTab("onboarding_wizard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === "onboarding_wizard"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 shadow-md font-black"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-900/60 border border-emerald-500/40"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Onboarding Wizard & Profil
            </button>
          </div>
        </div>
      </div>

      {/* Onboarding Toast Notification */}
      {onboardingToast && (
        <div className="bg-emerald-950 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{onboardingToast}</span>
          </div>
          <button
            onClick={() => setOnboardingToast(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Personalized Relawan Profile Hub & Header Bar */}
      {activeSubTab !== "onboarding_wizard" && (
        <div id="personalized-relawan-hub" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Profile Picture / Avatar */}
              <div className="relative shrink-0">
                {userProfile.profilePictureUrl ? (
                  <img
                    src={userProfile.profilePictureUrl}
                    alt={userProfile.fullName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md ring-2 ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-700 flex items-center justify-center text-white text-lg font-black border-2 border-emerald-400 shadow-md">
                    {userProfile.fullName.replace(/dr\.|H\.|Ust\./g, "").trim().slice(0, 2).toUpperCase() || "MH"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full border border-slate-900" title="DKM Verified">
                  <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50">
                    {userProfile.primarySkillCategory}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {userProfile.memberIdCardNumber}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {userProfile.fullName}
                </h3>
                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Building className="w-3 h-3 text-emerald-400" />
                    {userProfile.homeMasjid} ({userProfile.kelurahan})
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Target: {userProfile.weeklyHoursTarget} Jam/Pekan
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-open-volunteer-spotlight-quick"
                onClick={() => setActiveSubTab("volunteer_spotlight")}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1.5 transition transform active:scale-95 ring-2 ring-amber-400/40"
                title="Lihat Profil Teladan Khidmah Umat Sematang Borang"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>🌟 Volunteer Spotlight</span>
              </button>
              <button
                id="btn-open-skill-sync-hub"
                onClick={() => setShowSkillSyncOverlay(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                title="Cek Real-Time Skill Sync & Top 3 Proyek Paling Sesuai"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Skill Sync</span>
              </button>
              <button
                onClick={() => setActiveSubTab("sadaqah_tracker")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Sedekah Rutin</span>
              </button>
              <button
                id="btn-open-mosque-qr-donation-quick"
                onClick={() => setActiveSubTab("mosque_qr_donation")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                title="Buka Generator QRIS Infaq Masjid Transparan"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>QR Infaq Masjid</span>
              </button>
              <button
                onClick={() => setShowKtaModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>KTA Digital</span>
              </button>
              <button
                id="btn-open-onboarding-wizard"
                onClick={() => {
                  setActiveSubTab("onboarding_wizard");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Profil / Wizard</span>
              </button>
            </div>
          </div>

          {/* Sub-skills chips */}
          {userProfile.selectedSubSkills && userProfile.selectedSubSkills.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-medium">Spesialisasi Terdaftar:</span>
              {userProfile.selectedSubSkills.slice(0, 4).map((s) => (
                <span key={s} className="bg-slate-800/90 text-emerald-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium">
                  {s}
                </span>
              ))}
              {userProfile.selectedSubSkills.length > 4 && (
                <span className="text-slate-500 text-[10px]">+{userProfile.selectedSubSkills.length - 4} lainnya</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 00: ONBOARDING WIZARD */}
      {activeSubTab === "onboarding_wizard" && (
        <OnboardingWizard
          initialProfile={userProfile}
          onSaveProfile={handleSaveUserProfile}
          onCancel={() => setActiveSubTab("service_journey")}
          isStandaloneTab={true}
        />
      )}

      {/* SUBTAB: DIGITAL MOSQUE HONORS (VIRTUAL PLAQUES WALL) */}
      {activeSubTab === "digital_honors" && (
        <DigitalMosqueHonors
          currentUserName={userProfile.fullName}
          currentUserRole={userProfile.profession || "Dokter Spesialis Penyakit Dalam"}
          currentUserKelurahan={userProfile.kelurahan}
        />
      )}

      {/* SUBTAB: CONTRIBUTOR LEADERBOARD (PROGRESS BAR UI) */}
      {activeSubTab === "leaderboard" && (
        <ContributorLeaderboard
          currentUserName={userProfile.fullName}
          currentUserRole={userProfile.profession || "Dokter Spesialis Penyakit Dalam"}
          currentUserKelurahan={userProfile.kelurahan}
          onViewPlaque={(plaqueId) => {
            setActiveSubTab("digital_honors");
          }}
          onViewTimeline={(name) => {
            setSelectedTimelineUser(name || userProfile.fullName);
            setShowContributionTimelineModal(true);
          }}
        />
      )}

      {/* SUBTAB: MOSQUE DONATION QR GENERATOR (TRANSPARENT DIGITAL INFAQ) */}
      {activeSubTab === "mosque_qr_donation" && (
        <MosqueDonationQrGenerator />
      )}

      {/* SUBTAB 00: COMMUNITY SKILL MAP (D3 NETWORK VISUALIZATION) */}
      {activeSubTab === "skill_map" && (
        <CommunitySkillMap
          currentUserName={userProfile.fullName}
          currentUserRole={userProfile.profession || "Dokter Spesialis Penyakit Dalam"}
          currentUserKelurahan={userProfile.kelurahan}
        />
      )}

      {/* SUBTAB 00A: INTERACTIVE COMMUNITY POLLS & JAJAK PENDAPAT */}
      {activeSubTab === "community_polls" && (
        <InteractiveCommunityPolls
          currentUserName={userProfile.fullName}
          currentUserRole={userProfile.profession || "Relawan Medis Dhuafa"}
          currentUserKelurahan={userProfile.kelurahan}
        />
      )}

      {/* SUBTAB 00B: VOLUNTEER HIGHLIGHT SPOTLIGHT (ROTATING SHOWCASE) */}
      {activeSubTab === "volunteer_spotlight" && (
        <VolunteerHighlightSpotlight
          onNavigateToTalentBank={() => setActiveSubTab("talent_bank")}
        />
      )}

      {/* SUBTAB 01: SERVICE JOURNEY TIMELINE (MILESTONES, TASKS & SKILL GROWTH) */}
      {activeSubTab === "service_journey" && (
        <ServiceJourneyTimeline />
      )}

      {/* SUBTAB 01B: SADAQAH IMPACT TRACKER (PROGRESS RING & RECURRING SIMULATOR) */}
      {activeSubTab === "sadaqah_tracker" && (
        <SadaqahImpactTracker
          onSuccessDonation={(proj, amt) => {
            setOnboardingToast(`Alhamdulillah! Sedekah Rp ${amt.toLocaleString("id-ID")} untuk "${proj.title}" berhasil ditunaikan.`);
            setTimeout(() => {
              setOnboardingToast(null);
            }, 5000);
          }}
        />
      )}

      {/* SUBTAB 0A: COMMUNITY IMPACT DASHBOARD (RADIAL PROGRESS INDICATOR) */}
      {activeSubTab === "impact_dashboard" && (
        <CommunityImpactDashboard />
      )}

      {/* SUBTAB 0B: COMMUNITY INTELLIGENCE & SOCIAL MAPPING */}
      {activeSubTab === "social_mapping" && (
        <CommunityIntelligenceSocialMapping />
      )}

      {/* Overview Stat Counters (for GIS, Events, Talent, Library, & Attendance views) */}
      {activeSubTab !== "social_mapping" && activeSubTab !== "impact_dashboard" && activeSubTab !== "service_journey" && activeSubTab !== "sadaqah_tracker" && activeSubTab !== "onboarding_wizard" && activeSubTab !== "volunteer_spotlight" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-medium">Populasi Muslim</div>
            <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{totalMuslims.toLocaleString("id-ID")}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">4 Kelurahan</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-medium">Masjid & Musholla</div>
            <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">{totalMasjids + totalMushollas} Titik</div>
            <div className="text-[10px] text-slate-500">{totalMasjids} Masjid, {totalMushollas} Musholla</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-medium">Keluarga Mustahiq</div>
            <div className="text-lg font-black text-amber-700 font-mono mt-0.5">{totalMustahiq} KK</div>
            <div className="text-[10px] text-amber-600 font-semibold">Binaan ZISWAF</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-medium">Muzakki Terdaftar</div>
            <div className="text-lg font-black text-blue-700 font-mono mt-0.5">{totalMuzakki} Jiwa</div>
            <div className="text-[10px] text-blue-600 font-semibold">Donatur Aktif</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-medium">Relawan Berdaya</div>
            <div className="text-lg font-black text-purple-700 font-mono mt-0.5">{totalRelawan} Orang</div>
            <div className="text-[10px] text-purple-600 font-semibold">Siaga Ukhuwah</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] text-slate-500 font-medium">Rasio Penopang</div>
            <div className="text-lg font-black text-teal-700 font-mono mt-0.5">2.67x</div>
            <div className="text-[10px] text-teal-600 font-semibold">Muzakki/Mustahiq</div>
          </div>
        </div>
      )}

      {/* SUBTAB 1: GIS RESOURCE MAP */}
      {activeSubTab === "gis_map" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive GIS Spatial Visualizer */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Peta Spasial Klaster Jamaah Kec. Sematang Borang
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Klik wilayah kelurahan untuk memuat analitik mendalam
              </span>
            </div>

            {/* Interactive Grid Map Blueprint */}
            <div className="bg-gradient-to-br from-emerald-950 to-slate-900 rounded-xl p-6 relative overflow-hidden border border-emerald-800/40 min-h-[380px] flex flex-col justify-between">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>

              <div className="relative z-10 flex items-center justify-between text-xs text-emerald-300 font-mono">
                <span>COORD: -2.9388° S, 104.8080° E</span>
                <span className="bg-emerald-800/60 px-2 py-0.5 rounded border border-emerald-600/40">
                  GIS Layer: Masjid & Kesejahteraan
                </span>
              </div>

              {/* 4 Interactive Kelurahan Zones */}
              <div className="relative z-10 grid grid-cols-2 gap-4 my-auto py-4">
                {KELURAHAN_GIS_DATA.map((kel) => {
                  const isSelected = selectedKelurahan.name === kel.name;
                  return (
                    <button
                      key={kel.name}
                      onClick={() => setSelectedKelurahan(kel)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                        isSelected
                          ? "bg-amber-500/25 border-amber-400 shadow-lg ring-2 ring-amber-400/50 scale-[1.02]"
                          : "bg-emerald-900/40 border-emerald-700/50 hover:bg-emerald-800/50 hover:border-emerald-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-sm ${isSelected ? "text-amber-300" : "text-white"}`}>
                          Kel. {kel.name}
                        </span>
                        <Building className="w-4 h-4 text-emerald-400" />
                      </div>

                      <div className="text-xs text-emerald-200/80 space-y-0.5">
                        <div>👥 {kel.totalMuslims.toLocaleString("id-ID")} Jiwa</div>
                        <div>🕌 {kel.activeMasjids} Masjid ({kel.mushollas} Musholla)</div>
                        <div className="text-[11px] font-mono text-amber-300/90 pt-1">
                          Mustahiq: {kel.mustahiqFamilies} KK | Muzakki: {kel.muzakkiCount}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-300/70 border-t border-emerald-800/60 pt-2">
                <span>📍 Titik Strategis: Jl. Sematang Borang Raya • Griya Sukamulya • Perumahan Srimulya</span>
                <span>Update Data: Real-Time Sync</span>
              </div>
            </div>
          </div>

          {/* Selected Kelurahan Detail Panel */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                Detail Kelurahan Terpilih
              </span>
              <h3 className="font-bold text-slate-900 text-xl mt-1">
                Kelurahan {selectedKelurahan.name}
              </h3>
              <p className="text-xs text-slate-500">
                Kecamatan Sematang Borang, Palembang
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Kebutuhan Sosial Prioritas:</span>
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-amber-900 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                  "{selectedKelurahan.priorityNeed}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-emerald-800">Masjid Aktif</div>
                  <div className="text-base font-black text-emerald-900 font-mono">{selectedKelurahan.activeMasjids}</div>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-emerald-800">Musholla / Langgar</div>
                  <div className="text-base font-black text-emerald-900 font-mono">{selectedKelurahan.mushollas}</div>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-[10px] text-amber-800">Keluarga Dhuafa</div>
                  <div className="text-base font-black text-amber-900 font-mono">{selectedKelurahan.mustahiqFamilies} KK</div>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-[10px] text-blue-800">Muzakki / Agnia</div>
                  <div className="text-base font-black text-blue-900 font-mono">{selectedKelurahan.muzakkiCount}</div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 flex items-center justify-between">
                <div>
                  <div className="font-bold">UMKM Halal Binaan:</div>
                  <div className="text-[11px] text-purple-800">{selectedKelurahan.umkmHalalCount} Usaha Berkah</div>
                </div>
                <div className="text-right font-mono font-bold text-sm">
                  {selectedKelurahan.activeRelawan} Relawan
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveSubTab("events");
              }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm"
            >
              Lihat Agenda Kegiatan di {selectedKelurahan.name}
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2: EVENT & TASK ORCHESTRATION */}
      {activeSubTab === "events" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event List & Kanban Tasks */}
            <div className="lg:col-span-2 space-y-5">
              {eventsList.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                        {evt.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {evt.location} ({evt.kelurahan}) • {evt.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-700">
                          {evt.registeredCount} / {evt.targetParticipants} Jamaah
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Dana: Rp {evt.budgetAllocated.toLocaleString("id-ID")}
                        </div>
                      </div>
                      <button
                        onClick={() => setRsvpEvent(evt)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Daftar Hadir
                      </button>
                    </div>
                  </div>

                  {/* Task Kanban List for this event */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Daftar Tugas Panitia & Relawan (Klik untuk ubah status):</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {evt.tasks.filter((t) => t.status === "COMPLETED").length}/{evt.tasks.length} Selesai
                      </span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {evt.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTaskStatus(evt.id, task.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between gap-2 select-none ${
                            task.status === "COMPLETED"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                              : task.status === "IN_PROGRESS"
                              ? "bg-amber-50 border-amber-200 text-amber-900"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-semibold">{task.title}</div>
                            <div className="text-[11px] opacity-75">PJ: {task.assignedTo}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                              task.status === "COMPLETED"
                                ? "bg-emerald-200 text-emerald-900"
                                : task.status === "IN_PROGRESS"
                                ? "bg-amber-200 text-amber-900"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {task.status === "COMPLETED" ? "Selesai" : task.status === "IN_PROGRESS" ? "Proses" : "Belum"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Tambah Tugas Panitia */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
              <div className="flex items-center gap-2 border-b pb-3">
                <Plus className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Tambah Tugas Relawan
                </h4>
              </div>

              <form onSubmit={handleAddTask} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pilih Kegiatan
                  </label>
                  <select
                    value={selectedEventForTask}
                    onChange={(e) => setSelectedEventForTask(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {eventsList.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.kelurahan})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Tugas / Kebutuhan
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Contoh: Pengadaan 500 Dus Air Mineral"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Penanggung Jawab / Relawan
                  </label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="Contoh: Divisi Konsumsi Remaja Masjid"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Tambahkan Tugas
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: TALENT & SKILL REGISTRY (SEARCHABLE SKILL-CLUSTER CHART & VOLUNTEER CORPS) */}
      {activeSubTab === "talent_bank" && (
        <TalentSkillRegistry />
      )}

      {/* SUBTAB 4: RESOURCE LIBRARY & ASSET SHARING ('ARIYAH) */}
      {activeSubTab === "resource_library" && (
        <CommunityResourceLibrary />
      )}

      {/* SUBTAB 5: DIGITAL ATTENDANCE & VOLUNTEER SERVICE HOURS VERIFICATION */}
      {activeSubTab === "digital_attendance" && (
        <VolunteerDigitalAttendance />
      )}

      {/* Modal RSVP Event */}
      {rsvpEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-base">
                Pendaftaran Kehadiran Jamaah
              </h4>
              <button
                onClick={() => setRsvpEvent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {rsvpSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-slate-900 text-base">
                  Alhamdulillah! Pendaftaran Berhasil
                </h5>
                <p className="text-xs text-slate-500">
                  Data kehadiran Anda pada kegiatan <strong>{rsvpEvent.title}</strong> telah tercatat di buku tamu digital.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <div className="font-bold">{rsvpEvent.title}</div>
                  <div className="text-[11px] opacity-80">{rsvpEvent.location} • {rsvpEvent.date}</div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Jamaah</label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Nama Lengkap / Keluarga"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp (Opsional untuk pengingat)</label>
                  <input
                    type="tel"
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRsvpEvent(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                  >
                    Konfirmasi Kehadiran
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* KTA DIGITAL MODAL POPUP */}
      {showKtaModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fadeIn text-white p-6 space-y-5 relative">
            <button
              onClick={() => setShowKtaModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Kartu Tanda Anggota (KTA) Digital</h3>
            </div>

            {/* Digital Volunteer ID Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-2xl border-2 border-emerald-500/60 p-5 shadow-xl relative overflow-hidden text-white">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                    SB
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-emerald-400 tracking-wider">
                      FORUM KOMUNIKASI DKM
                    </div>
                    <div className="text-[11px] font-black text-white">
                      RELAWAN BERJAMAAH 4B
                    </div>
                  </div>
                </div>
                <span className="text-[8px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600/40">
                  VERIFIED DKM
                </span>
              </div>

              <div className="flex items-center gap-3.5 py-3.5">
                <div className="relative shrink-0">
                  {userProfile.profilePictureUrl ? (
                    <img
                      src={userProfile.profilePictureUrl}
                      alt={userProfile.fullName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md ring-2 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-700 flex items-center justify-center text-white text-lg font-black border-2 border-emerald-400 shadow-md">
                      {userProfile.fullName.replace(/dr\.|H\.|Ust\./g, "").trim().slice(0, 2).toUpperCase() || "MH"}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full border border-slate-950">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{userProfile.fullName}</h4>
                  <p className="text-[10px] font-bold text-amber-300 truncate">{userProfile.profession}</p>
                  <p className="text-[10px] text-slate-300 truncate">
                    🕌 {userProfile.homeMasjid} ({userProfile.kelurahan})
                  </p>
                  <p className="text-[9px] font-mono text-emerald-400 mt-0.5">
                    ID: {userProfile.memberIdCardNumber}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Pilar: <strong>{userProfile.primarySkillCategory}</strong></span>
                  <span className="text-emerald-400">Target: {userProfile.weeklyHoursTarget}j / pekan</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {userProfile.selectedSubSkills.slice(0, 3).map((s) => (
                    <span key={s} className="bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded text-[9px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800 text-[9px] text-slate-400">
                <span>Status: <strong>Siaga Khidmah</strong></span>
                <button
                  id="btn-kta-qr-scan"
                  onClick={() => {
                    setShowKtaModal(false);
                    setShowMosqueQrModal(true);
                  }}
                  className="flex items-center gap-1 bg-slate-950 hover:bg-emerald-950 px-2 py-0.5 rounded border border-slate-800 hover:border-emerald-600 transition cursor-pointer"
                  title="Klik untuk buka QR Scanner & Presensi Sesi"
                >
                  <QrCode className="w-3 h-3 text-emerald-400" />
                  <span className="font-mono text-emerald-300">QR-ACTIVE (Scan)</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setShowKtaModal(false);
                  setActiveSubTab("onboarding_wizard");
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah di Onboarding Wizard</span>
              </button>
              <button
                onClick={() => setShowKtaModal(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Skill Sync Overlay Modal */}
      {showSkillSyncOverlay && (
        <SkillSyncOverlay
          userProfile={userProfile}
          onClose={() => setShowSkillSyncOverlay(false)}
          onSelectProject={(proj) => {
            setOnboardingToast(`Alhamdulillah! Anda telah mendaftar misi "${proj.title}" di ${proj.organizerMasjid}.`);
            setTimeout(() => {
              setOnboardingToast(null);
            }, 5000);
          }}
        />
      )}

      {/* Contribution Timeline Modal */}
      <ContributionTimelineModal
        isOpen={showContributionTimelineModal}
        onClose={() => setShowContributionTimelineModal(false)}
        targetUserName={selectedTimelineUser || userProfile.fullName}
        targetUserRole={userProfile.profession || "Dokter Spesialis Penyakit Dalam & Relawan Medis"}
        targetUserMasjid={userProfile.homeMasjid || "Masjid Jami' Al-Ikhlas"}
        targetUserKelurahan={userProfile.kelurahan || "Sukamulya"}
        onOpenQrScanner={() => setShowMosqueQrModal(true)}
      />

      {/* Mosque QR Attendance & Scanner Modal */}
      <MosqueQrAttendanceModal
        isOpen={showMosqueQrModal}
        onClose={() => setShowMosqueQrModal(false)}
        currentUser={userProfile}
        onAttendanceSuccess={(record) => {
          setOnboardingToast(`Alhamdulillah! Presensi digital berhasil dicatat: "${record.title}" (+${record.impactMetrics.pointsEarned} Poin Berkah).`);
          setTimeout(() => {
            setOnboardingToast(null);
          }, 5000);
        }}
      />
    </div>
  );
}
