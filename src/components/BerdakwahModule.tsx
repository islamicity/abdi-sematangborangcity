import { useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle,
  Share2,
  Bookmark,
  Volume2,
  Clock,
  Radio,
  UserCheck,
  FileText,
  Copy,
  Check,
  Send,
  Loader2,
  ExternalLink,
  Sun,
  Moon,
  TrendingUp,
  Smartphone,
  Headphones,
  Award,
  ArrowRight,
} from "lucide-react";
import { KnowledgeItem, KajianSchedule } from "../types";
import { INITIAL_KNOWLEDGE_CATALOG, INITIAL_KAJIAN_SCHEDULES } from "../data/mockData";
import DailyHadith from "./DailyHadith";
import DailyDhikr from "./DailyDhikr";
import DailySpiritualReflection from "./DailySpiritualReflection";
import WeeklySpiritualDigestModule from "./WeeklySpiritualDigestModule";
import DigitalHapticDhikrCounter from "./DigitalHapticDhikrCounter";
import CalmingDhikrAudioPlayer from "./CalmingDhikrAudioPlayer";
import SpiritualMilestonesModule from "./SpiritualMilestonesModule";
import RamadanCountdownWidget from "./RamadanCountdownWidget";
import DailySpiritualReflectionCard from "./DailySpiritualReflectionCard";
import GlobalDhikrCounterOverlay from "./GlobalDhikrCounterOverlay";

interface BerdakwahModuleProps {
  searchQuery?: string;
  initialTab?: "daily_dhikr" | "digital_counter" | "audio_dhikr" | "spiritual_milestones" | "ramadan_countdown" | "spiritual_digest" | "spiritual_reflection" | "daily_hadith" | "catalog" | "kajian" | "dai_studio";
}

export default function BerdakwahModule({ searchQuery = "", initialTab = "daily_dhikr" }: BerdakwahModuleProps) {
  const [activeTab, setActiveTab] = useState<"daily_dhikr" | "digital_counter" | "audio_dhikr" | "spiritual_milestones" | "ramadan_countdown" | "spiritual_digest" | "spiritual_reflection" | "daily_hadith" | "catalog" | "kajian" | "dai_studio">(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Da'i Studio State
  const [studioTopic, setStudioTopic] = useState<string>("Membangun Ukhuwah dan Kejayaan Ekonomi Syariah di Sematang Borang");
  const [studioAudience, setStudioAudience] = useState<string>("Jamaah Masjid & Pelaku Usaha Muslim");
  const [studioOccasion, setStudioOccasion] = useState<string>("Kajian Tematik 4B Kaffah");
  const [studioDuration, setStudioDuration] = useState<number>(30);
  const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState<boolean>(false);
  const [generatedSyllabus, setGeneratedSyllabus] = useState<any>(null);

  // Filter items based on global search and category
  const filteredCatalog = INITIAL_KNOWLEDGE_CATALOG.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredKajian = INITIAL_KAJIAN_SCHEDULES.filter((kajian) => {
    return (
      searchQuery === "" ||
      kajian.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kajian.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kajian.masjidName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kajian.kelurahan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCopyDalil = (item: KnowledgeItem) => {
    const text = `${item.title}\n\n${item.dalilArabic || ""}\n"${item.dalilTranslation || ""}"\n\nSumber: ${item.authorOrNarrator} (${item.sourceType})\nVerifikasi: ${item.sanadValidation} oleh ${item.verifiedBy}\n\nVia abdi.sematangborangcity.cloud`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGenerateSyllabus = async () => {
    setIsGeneratingSyllabus(true);
    try {
      const res = await fetch("/api/gemini/dakwah-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: studioTopic,
          targetAudience: studioAudience,
          occasion: studioOccasion,
          durationMinutes: studioDuration,
        }),
      });
      const data = await res.json();
      setGeneratedSyllabus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSyllabus(false);
    }
  };

  return (
    <div id="berdakwah-module" className="space-y-6">
      {/* Pillar Header Card */}
      <div className="bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-teal-900/90 rounded-2xl p-6 text-white border border-emerald-700/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>PILAR 1 : BERDAKWAH (Smart Knowledge & Content Engine)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pusat Literasi & Katalog Pengetahuan Islam
            </h2>
            <p className="text-sm text-emerald-200/90 max-w-2xl mt-1">
              Sistem pengatalogan materi dakwah berbasis AI dan Knowledge Graph tervalidasi. 
              Menyajikan dalil shahih Al-Qur'an, Hadits, fatwa DSN-MUI, jadwal kajian masjid Sematang Borang, dan Da'i AI Studio.
            </p>
          </div>

          {/* Sub-Navigation Buttons */}
          <div className="flex flex-wrap gap-2 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-700/60">
            <button
              id="subtab-daily-dhikr"
              onClick={() => setActiveTab("daily_dhikr")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "daily_dhikr"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Dzikir Harian
            </button>
            <button
              id="subtab-digital-counter"
              onClick={() => setActiveTab("digital_counter")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "digital_counter"
                  ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              Tasbih Haptic Digital
            </button>
            <button
              id="subtab-audio-dhikr"
              onClick={() => setActiveTab("audio_dhikr")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "audio_dhikr"
                  ? "bg-teal-400 text-slate-950 shadow-sm font-bold"
                  : "text-teal-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-teal-300" />
              Lantunan &amp; Loop Audio
            </button>
            <button
              id="subtab-spiritual-milestones"
              onClick={() => setActiveTab("spiritual_milestones")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "spiritual_milestones"
                  ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
                  : "text-amber-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Spiritual Milestones
            </button>
            <button
              id="subtab-ramadan-countdown"
              onClick={() => setActiveTab("ramadan_countdown")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "ramadan_countdown"
                  ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
                  : "text-amber-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              Menuju Ramadan
            </button>
            <button
              id="subtab-spiritual-digest"
              onClick={() => setActiveTab("spiritual_digest")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "spiritual_digest"
                  ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
                  : "text-amber-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Spiritual Digest (AI)
            </button>
            <button
              id="subtab-spiritual-reflection"
              onClick={() => setActiveTab("spiritual_reflection")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "spiritual_reflection"
                  ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
                  : "text-amber-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Spiritual Reflection (AI)
            </button>
            <button
              id="subtab-daily-hadith"
              onClick={() => setActiveTab("daily_hadith")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "daily_hadith"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Hadits Harian & Tadabbur
            </button>
            <button
              id="subtab-catalog"
              onClick={() => setActiveTab("catalog")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "catalog"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              Knowledge Catalog ({filteredCatalog.length})
            </button>
            <button
              id="subtab-kajian"
              onClick={() => setActiveTab("kajian")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "kajian"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              Jadwal Kajian Masjid ({filteredKajian.length})
            </button>
            <button
              id="subtab-dai-studio"
              onClick={() => setActiveTab("dai_studio")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "dai_studio"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-emerald-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Da'i AI Studio
            </button>
          </div>
        </div>
      </div>

      {/* QUICK RAMADAN 1448 H COUNTDOWN BANNER (SHOWN WHEN ON OTHER TABS) */}
      {activeTab !== "ramadan_countdown" && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-2xl p-4 border border-emerald-700/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0 font-bold shadow-sm">
              <Moon className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300">Menuju 1 Ramadan 1448 H</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-600/60 font-mono">
                  Estimasi 8 Feb 2027
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 mt-0.5">
                Siapkan hati &amp; fisik Anda. Cek qadha puasa, target tilawah 1 juz/hari, fikih shiyam, dan tabungan infaq subuh.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("ramadan_countdown")}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
          >
            <Moon className="w-3.5 h-3.5 fill-slate-950" />
            <span>Buka Countdown &amp; Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* DAILY SPIRITUAL REFLECTION CARD (AI-GENERATED WISDOM RELEVANT TO TODAY'S PROGRESS) */}
      {activeTab !== "spiritual_reflection" && (
        <DailySpiritualReflectionCard
          onOpenFullReflection={() => setActiveTab("spiritual_reflection")}
          onOpenDailyDhikr={() => setActiveTab("daily_dhikr")}
        />
      )}

      {/* TAB: RAMADAN 1448 H COUNTDOWN & PREPARATION CHECKLIST */}
      {activeTab === "ramadan_countdown" && (
        <RamadanCountdownWidget
          onOpenKnowledgeCatalog={() => {
            setSelectedCategory("Fiqh Ibadah");
            setActiveTab("catalog");
          }}
          onOpenDailyDhikr={() => setActiveTab("daily_dhikr")}
        />
      )}

      {/* TAB: DAILY DHIKR & TASBIH DIGITAL */}
      {activeTab === "daily_dhikr" && (
        <DailyDhikr
          onOpenKnowledgeCatalog={() => {
            setSelectedCategory("Semua");
            setActiveTab("catalog");
          }}
          onOpenSpiritualDigest={() => {
            setActiveTab("spiritual_digest");
          }}
          onOpenDigitalCounter={() => {
            setActiveTab("digital_counter");
          }}
          onOpenAudioPlayer={() => {
            setActiveTab("audio_dhikr");
          }}
          onOpenSpiritualMilestones={() => {
            setActiveTab("spiritual_milestones");
          }}
        />
      )}

      {/* TAB: DIGITAL HAPTIC DHIKR COUNTER */}
      {activeTab === "digital_counter" && (
        <DigitalHapticDhikrCounter
          onNavigateToCatalog={() => {
            setSelectedCategory("Semua");
            setActiveTab("catalog");
          }}
          onOpenAudioPlayer={() => {
            setActiveTab("audio_dhikr");
          }}
          onOpenSpiritualMilestones={() => {
            setActiveTab("spiritual_milestones");
          }}
        />
      )}

      {/* TAB: CALMING AUDIO RECITATIONS & BACKGROUND DHIKR LOOPS */}
      {activeTab === "audio_dhikr" && (
        <CalmingDhikrAudioPlayer
          onOpenDhikrTab={() => setActiveTab("daily_dhikr")}
        />
      )}

      {/* TAB: SPIRITUAL MILESTONES (DIGITAL BADGES ON DHIKR COUNTS) */}
      {activeTab === "spiritual_milestones" && (
        <SpiritualMilestonesModule
          onOpenDigitalCounter={() => setActiveTab("digital_counter")}
          onOpenDailyDhikr={() => setActiveTab("daily_dhikr")}
        />
      )}

      {/* TAB: WEEKLY SPIRITUAL DIGEST (AI DHIKR JOURNAL SENTIMENT AGGREGATOR) */}
      {activeTab === "spiritual_digest" && (
        <WeeklySpiritualDigestModule />
      )}

      {/* TAB: DAILY SPIRITUAL REFLECTION (AI PERSONALIZED QURANIC/HADITH THOUGHT) */}
      {activeTab === "spiritual_reflection" && (
        <DailySpiritualReflection />
      )}

      {/* TAB 0: DAILY HADITH & REFLECTION */}
      {activeTab === "daily_hadith" && (
        <DailyHadith />
      )}

      {/* TAB 1: KNOWLEDGE CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["Semua", "Akidah", "Fiqh Ibadah", "Muamalah", "Akhlak & Tazkiyah", "Sirah Nabawiyah"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white border-emerald-500 shadow-sm"
                    : "bg-white text-slate-600 hover:bg-emerald-50 border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                id={`catalog-card-${item.id}`}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Sanad: {item.sanadValidation}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition leading-snug">
                    {item.title}
                  </h3>

                  {item.dalilArabic && (
                    <div className="bg-emerald-950/5 p-3 rounded-lg border border-emerald-800/10">
                      <p className="font-serif text-right text-base text-emerald-950 leading-relaxed dir-rtl font-medium">
                        {item.dalilArabic}
                      </p>
                      <p className="text-xs italic text-slate-600 mt-1 line-clamp-2">
                        "{item.dalilTranslation}"
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[160px]">{item.authorOrNarrator}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyDalil(item)}
                      title="Salin Dalil & Rujukan"
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition flex items-center gap-1"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Baca Telaah
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: KAJIAN FINDER */}
      {activeTab === "kajian" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">
                Jadwal Kajian Terverifikasi di 4 Kelurahan Sematang Borang
              </span>
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
              Sukamulya • Lebung Gajah • Karya Mulya • Srimulya
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredKajian.map((kajian) => (
              <div
                key={kajian.id}
                id={`kajian-card-${kajian.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                      {kajian.category}
                    </span>
                    {kajian.isLiveStreamed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        <Radio className="w-3 h-3 animate-pulse" />
                        LIVE STREAMING
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {kajian.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2 font-medium text-emerald-800">
                      <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{kajian.speaker} ({kajian.speakerTitle})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{kajian.masjidName} — Kel. {kajian.kelurahan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-800">{kajian.datetime}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <strong className="text-slate-900">Pokok Pembahasan:</strong> {kajian.topic}
                  </div>
                </div>

                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estimasi Jamaah: ~{kajian.attendeesExpected} Orang</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(kajian.masjidName + " " + kajian.address + " Palembang")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium flex items-center gap-1 transition"
                    >
                      <MapPin className="w-3 h-3" />
                      Rute Peta
                    </a>
                    <button
                      onClick={() => alert(`Pengingat kajian "${kajian.title}" berhasil ditambahkan ke jadwal Anda.`)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1 transition"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      RSVP Hadir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DA'I AI STUDIO */}
      {activeTab === "dai_studio" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Da'i Content Studio & AI Syllabus Generator
              </h3>
              <p className="text-xs text-slate-600">
                Bantu Da'i dan Asatidz merancang silabus khutbah Jumat, materi kultum, dan kajian tematik 4B Kaffah secara terstruktur dengan dalil terverifikasi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-1 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topik / Tema Kajian
                </label>
                <input
                  type="text"
                  value={studioTopic}
                  onChange={(e) => setStudioTopic(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Contoh: Fiqh Muamalah Kontemporer & Anti-Riba"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sasaran Jamaah
                </label>
                <select
                  value={studioAudience}
                  onChange={(e) => setStudioAudience(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option>Jamaah Umum & Warga Sematang Borang</option>
                  <option>Pemuda & Remaja Masjid</option>
                  <option>Ibu-Ibu Majelis Taklim</option>
                  <option>Pelaku UMKM & Pedagang Pasar</option>
                  <option>Santri & Mahasiswa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Momen / Acara
                </label>
                <input
                  type="text"
                  value={studioOccasion}
                  onChange={(e) => setStudioOccasion(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Khutbah Jumat / Kultum Shubuh / Kajian Bulanan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Durasi Penyampaian ({studioDuration} Menit)
                </label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={studioDuration}
                  onChange={(e) => setStudioDuration(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>15m (Kultum)</span>
                  <span>30m (Khutbah)</span>
                  <span>60m (Bedah Kitab)</span>
                </div>
              </div>

              <button
                id="btn-generate-syllabus"
                disabled={isGeneratingSyllabus}
                onClick={handleGenerateSyllabus}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md"
              >
                {isGeneratingSyllabus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyusun Silabus Berdalil...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Silabus Cerdas AI
                  </>
                )}
              </button>
            </div>

            {/* Generated Output Preview */}
            <div className="lg:col-span-2 space-y-4">
              {generatedSyllabus ? (
                <div className="bg-emerald-950/5 border border-emerald-800/20 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-800/10 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                        {generatedSyllabus.theme}
                      </span>
                      <h4 className="font-bold text-slate-900 text-lg mt-1">
                        {generatedSyllabus.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(generatedSyllabus, null, 2));
                        alert("Materi kajian berhasil disalin ke clipboard!");
                      }}
                      className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Salin Lengkap
                    </button>
                  </div>

                  {/* Outline Steps */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Alur Pembahasan & Alokasi Waktu
                    </h5>
                    {generatedSyllabus.outline?.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-900">
                          <span>{item.step}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{item.duration}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Key Verses */}
                  {generatedSyllabus.keyVerses && (
                    <div className="space-y-2 pt-2">
                      <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Landasan Dalil Al-Qur'an & Sunnah
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {generatedSyllabus.keyVerses.map((verse: any, vIdx: number) => (
                          <div key={vIdx} className="bg-emerald-900/10 p-3 rounded-lg border border-emerald-800/15 space-y-1">
                            <p className="font-serif text-right text-sm text-emerald-950 font-bold dir-rtl">
                              {verse.arabic}
                            </p>
                            <div className="text-[11px] font-bold text-emerald-800">{verse.reference}</div>
                            <p className="text-[11px] text-slate-600 italic">"{verse.translation}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Questions */}
                  {generatedSyllabus.interactiveQuestions && (
                    <div className="space-y-2 pt-2">
                      <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Pemantik Diskusi Jamaah (Interactive Q&A)
                      </h5>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                        {generatedSyllabus.interactiveQuestions.map((q: string, qIdx: number) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 space-y-2">
                  <BookOpen className="w-12 h-12 text-slate-300" />
                  <p className="font-medium text-sm text-slate-600">
                    Belum ada silabus yang dibuat.
                  </p>
                  <p className="text-xs max-w-sm">
                    Tentukan topik, durasi, dan sasaran jamaah di panel sebelah kiri lalu klik tombol <strong>Generate Silabus Cerdas AI</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Knowledge Item */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {selectedItem.category}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  Sanad: {selectedItem.sanadValidation}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <h3 className="font-bold text-slate-900 text-xl leading-tight">
              {selectedItem.title}
            </h3>

            {selectedItem.dalilArabic && (
              <div className="bg-emerald-950/5 p-4 rounded-xl border border-emerald-800/10 space-y-2">
                <p className="font-serif text-right text-lg text-emerald-950 leading-loose dir-rtl font-semibold">
                  {selectedItem.dalilArabic}
                </p>
                {selectedItem.dalilLatin && (
                  <p className="text-xs font-mono text-emerald-800">{selectedItem.dalilLatin}</p>
                )}
                <p className="text-xs text-slate-700 italic border-t pt-2">
                  Artinya: "{selectedItem.dalilTranslation}"
                </p>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <h5 className="font-bold text-slate-900 text-sm">Telaah & Penjelasan Fiqh:</h5>
              <p>{selectedItem.summary}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong>Sumber/Perawi:</strong> {selectedItem.authorOrNarrator}</div>
              <div><strong>Tashih/Verifikasi:</strong> {selectedItem.verifiedBy}</div>
              <div><strong>Tipe Sumber:</strong> {selectedItem.sourceType}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleCopyDalil(selectedItem)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin Rujukan
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME GLOBAL DHIKR COUNTER OVERLAY (ALL JAMA'AH RECITATIONS) */}
      <GlobalDhikrCounterOverlay />
    </div>
  );
}
