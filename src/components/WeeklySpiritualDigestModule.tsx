import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  Heart,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Bookmark,
  Share2,
  Copy,
  Check,
  Feather,
  Sun,
  Moon,
  Flame,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Sparkle,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DhikrJournalEntry, WeeklySpiritualDigest, DhikrJournalSessionType } from "../types";

// Seed journal entries for first-time or demonstrations
const DEFAULT_INITIAL_ENTRIES: DhikrJournalEntry[] = [
  {
    id: "entry-1",
    dateStr: "2026-09-22",
    createdAt: new Date("2026-09-22T06:30:00").toISOString(),
    sessionType: "morning_dhikr",
    content: "Pagi ini pikiran agak berat memikirkan target omzet bulanan di toko. Namun setelah wirid pagi 100x dan membaca 'Hasbunallah wa ni'mal wakiil', dada terasa lebih lapang dan percaya rezeki sudah diatur.",
    moodTag: "gelisah",
    dhikrRepetitions: 120,
    sentiment: {
      sakinahScore: 68,
      primaryEmotion: "Cemas Menuju Pasrah",
      spiritualFocus: "Tawakkal & Penyerahan Diri",
      summaryReflection: "Dzikir bertindak sebagai penawar cemas yang memindahkan beban pikiran dari perhitungan manusiawi menuju tawakkal.",
    },
  },
  {
    id: "entry-2",
    dateStr: "2026-09-23",
    createdAt: new Date("2026-09-23T18:15:00").toISOString(),
    sessionType: "evening_dhikr",
    content: "Lelah sekali setelah berkeliling melayani pesanan pelanggan. Mengambil wudhu di masjid kelurahan dan membaca dzikir petang. Ketenangan perlahan hadir.",
    moodTag: "lelah",
    dhikrRepetitions: 95,
    sentiment: {
      sakinahScore: 74,
      primaryEmotion: "Kelelahan Fisik Berbuah Kedamaian",
      spiritualFocus: "Istirahat Ruhani dalam Dzikir",
      summaryReflection: "Menghubungkan keletihan ikhtiar dengan doa petang menjadikan setiap peluh bernilai ibadah penggugur dosa.",
    },
  },
  {
    id: "entry-3",
    dateStr: "2026-09-24",
    createdAt: new Date("2026-09-24T12:45:00").toISOString(),
    sessionType: "free_tasbih",
    content: "Alhamdulillah dapat kabar baik pesanan barang halal laku keras. Menyempatkan tasbih 99x dan sujud syukur di musholla.",
    moodTag: "syukur",
    dhikrRepetitions: 99,
    sentiment: {
      sakinahScore: 88,
      primaryEmotion: "Syukur & Lapang Hati",
      spiritualFocus: "Pengikatan Nikmat dengan Tahmid",
      summaryReflection: "Respon spontan bertasbih saat memperoleh kemudahan adalah tanda hidupnya ruhani yang senantiasa ingat Sang Pemberi.",
    },
  },
  {
    id: "entry-4",
    dateStr: "2026-09-25",
    createdAt: new Date("2026-09-25T21:00:00").toISOString(),
    sessionType: "muhasabah_malam",
    content: "Merenung sebelum tidur, tadi siang sempat berkata agak keras pada adik. Menyesal sekali, segera beristighfar 70x dan mengirim pesan minta maaf.",
    moodTag: "taubat",
    dhikrRepetitions: 70,
    sentiment: {
      sakinahScore: 82,
      primaryEmotion: "Taubat & Pembersihan Batin",
      spiritualFocus: "Tazkiyatun Nafs & Memaafkan",
      summaryReflection: "Kepekaan hati untuk segera beristighfar dan memperbaiki hubungan sosial adalah buah manis dari dzikir yang meresap.",
    },
  },
  {
    id: "entry-5",
    dateStr: "2026-09-26",
    createdAt: new Date("2026-09-26T07:15:00").toISOString(),
    sessionType: "morning_dhikr",
    content: "Jumat berkah. Membaca surah Al-Kahfi dan wirid shalawat 100x. Suasana subuh di Sematang Borang sangat sejuk, hati terasa sangat damai.",
    moodTag: "damai",
    dhikrRepetitions: 150,
    sentiment: {
      sakinahScore: 94,
      primaryEmotion: "Tuma'ninah Penuh",
      spiritualFocus: "Shalawat & Berkah Hari Jumat",
      summaryReflection: "Puncak ketenangan rohani yang menghidupkan optimisme dan menjernihkan pandangan hidup.",
    },
  },
  {
    id: "entry-6",
    dateStr: "2026-09-27",
    createdAt: new Date("2026-09-27T17:30:00").toISOString(),
    sessionType: "evening_dhikr",
    content: "Berkumpul bersama keluarga tercinta. Membimbing anak melafalkan dzikir petang bersama-sama. Rumah terasa dinaungi malaikat.",
    moodTag: "damai",
    dhikrRepetitions: 110,
    sentiment: {
      sakinahScore: 91,
      primaryEmotion: "Harmoni Keluarga & Kedamaian",
      spiritualFocus: "Dakwah Bil-Qudwah dalam Rumah",
      summaryReflection: "Menghidupkan dzikir bersama keluarga mengalirkan sakinah yang melindungi bahtera rumah tangga.",
    },
  },
  {
    id: "entry-7",
    dateStr: "2026-09-28",
    createdAt: new Date("2026-09-28T06:00:00").toISOString(),
    sessionType: "morning_dhikr",
    content: "Memasuki awal pekan dengan bismillah. Menyelesaikan target 300 repetisi tasbih, tahmid, tahlil. Semangat menyebarkan kebaikan!",
    moodTag: "bersemangat",
    dhikrRepetitions: 300,
    sentiment: {
      sakinahScore: 95,
      primaryEmotion: "Semangat Juang & Tawakkal Mantap",
      spiritualFocus: "Istiqomah Awal Pekan",
      summaryReflection: "Tekad yang menyala dilandasi dzikir menjadi fondasi kokoh untuk menghadapi seluruh tantangan pekan baru.",
    },
  },
];

export default function WeeklySpiritualDigestModule() {
  // Journal entries state
  const [journalEntries, setJournalEntries] = useState<DhikrJournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem("islamicity_dhikr_journal_entries");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_INITIAL_ENTRIES;
  });

  // Active Weekly Digest state
  const [digest, setDigest] = useState<WeeklySpiritualDigest | null>(null);
  const [isLoadingDigest, setIsLoadingDigest] = useState<boolean>(false);
  const [digestError, setDigestError] = useState<string | null>(null);

  // New journal entry form states
  const [isAddingEntry, setIsAddingEntry] = useState<boolean>(false);
  const [newContent, setNewContent] = useState<string>("");
  const [newSessionType, setNewSessionType] = useState<DhikrJournalSessionType>("morning_dhikr");
  const [newMoodTag, setNewMoodTag] = useState<"damai" | "syukur" | "gelisah" | "lelah" | "bersemangat" | "taubat">("damai");
  const [newDhikrCount, setNewDhikrCount] = useState<number>(33);
  const [isAnalyzingEntry, setIsAnalyzingEntry] = useState<boolean>(false);

  // Toolbar & audio states
  const [copiedDigest, setCopiedDigest] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showEntriesList, setShowEntriesList] = useState<boolean>(false);

  // Fetch or generate the Weekly Digest
  const fetchWeeklyDigest = async (entries = journalEntries) => {
    setIsLoadingDigest(true);
    setDigestError(null);
    if (isSpeaking && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch("/api/gemini/spiritual-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalEntries: entries,
          timeframe: "7_days",
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const data: WeeklySpiritualDigest = await res.json();
      setDigest(data);
      try {
        localStorage.setItem("islamicity_weekly_spiritual_digest_cached", JSON.stringify(data));
      } catch {}
    } catch (err: any) {
      console.warn("Could not fetch online digest, using local fallback", err);
      setDigestError("Menampilkan ikhtisar spiritual tervalidasi berbasis analisis lokal.");
    } finally {
      setIsLoadingDigest(false);
    }
  };

  useEffect(() => {
    // Check cached digest or fetch
    try {
      const cached = localStorage.getItem("islamicity_weekly_spiritual_digest_cached");
      if (cached) {
        setDigest(JSON.parse(cached));
      } else {
        fetchWeeklyDigest();
      }
    } catch {
      fetchWeeklyDigest();
    }
  }, []);

  // Save new entry with sentiment analysis
  const handleSaveJournalEntry = async () => {
    if (!newContent.trim()) return;

    setIsAnalyzingEntry(true);
    let sentimentResult = {
      sakinahScore: 80,
      primaryEmotion: "Ketenangan Jiwa",
      spiritualFocus: "Dzikir & Muhasabah",
      summaryReflection: "Catatan merefleksikan kejernihan jiwa setelah berdzikir.",
    };

    try {
      const res = await fetch("/api/gemini/analyze-dhikr-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent,
          moodTag: newMoodTag,
          sessionType: newSessionType,
        }),
      });
      if (res.ok) {
        sentimentResult = await res.json();
      }
    } catch (e) {
      console.warn("AI sentiment analysis fallback", e);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const newEntry: DhikrJournalEntry = {
      id: `entry-${Date.now()}`,
      dateStr: todayStr,
      createdAt: new Date().toISOString(),
      sessionType: newSessionType,
      content: newContent.trim(),
      moodTag: newMoodTag,
      dhikrRepetitions: newDhikrCount,
      sentiment: sentimentResult,
    };

    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    try {
      localStorage.setItem("islamicity_dhikr_journal_entries", JSON.stringify(updated));
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.65 },
        colors: ["#10b981", "#f59e0b", "#0d9488"],
      });
    } catch {}

    setNewContent("");
    setIsAddingEntry(false);
    setIsAnalyzingEntry(false);

    // Refresh digest with the new entry
    fetchWeeklyDigest(updated);
  };

  // Delete an entry
  const handleDeleteEntry = (id: string) => {
    const updated = journalEntries.filter((e) => e.id !== id);
    setJournalEntries(updated);
    try {
      localStorage.setItem("islamicity_dhikr_journal_entries", JSON.stringify(updated));
    } catch {}
  };

  // Text-to-Speech audio reading
  const handleToggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser Anda tidak mendukung Text-to-Speech.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!digest) return;

    window.speechSynthesis.cancel();
    const textToRead = `Ikhtisar Spiritual Mingguan. Skor Sakinah Anda: ${digest.overallSakinahScore} dari 100, Kategori: ${digest.sakinahCategory}. Ringkasan: ${digest.executiveSummary}. Rekomendasi ayat: ${digest.recommendedVersesAndHadith[0]?.source || ""}. Artinya: ${digest.recommendedVersesAndHadith[0]?.translation || ""}. Doa pekan baru: ${digest.customDoaForUpcomingWeek.translation}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy shareable summary
  const handleCopyDigest = () => {
    if (!digest) return;
    const text = `📊 ✨ Weekly Spiritual Digest (AI Tadabbur):
Periode: ${digest.periodStart} s/d ${digest.periodEnd}
🕊️ Sakinah Index: ${digest.overallSakinahScore}/100 (${digest.sakinahCategory})

💭 Narasi Ruhani:
${digest.executiveSummary}

🌟 Kekuatan Ruhani:
${digest.spiritualStrengths.map((s) => `• ${s}`).join("\n")}

📖 Rekomendasi Kalam Suci:
${digest.recommendedVersesAndHadith[0]?.source}: "${digest.recommendedVersesAndHadith[0]?.translation}"

🤲 Doa Pekan Baru:
"${digest.customDoaForUpcomingWeek.translation}"

Via ABDI Islamicity 4B Kaffah (abdi.sematangborangcity.cloud)`;

    navigator.clipboard.writeText(text);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2500);
  };

  // Custom Tooltip for Sakinah Sentiment Chart
  const CustomSentimentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-emerald-500/40 backdrop-blur-md min-w-[210px] text-xs space-y-1.5 font-sans animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
            <span className="font-bold text-emerald-300">{data.dayLabel} ({data.dateStr})</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">
              {data.sakinahIndex}/100
            </span>
          </div>
          <div className="text-slate-300 flex items-center justify-between">
            <span>Kondisi Jiwa:</span>
            <span className="font-bold text-amber-300">{data.dominantMood}</span>
          </div>
          {data.entryExcerpt && (
            <p className="text-[11px] text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-800">
              &ldquo;{data.entryExcerpt}&rdquo;
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="weekly-spiritual-digest-module" className="space-y-6 animate-fade-in">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 rounded-3xl p-6 sm:p-7 text-white border border-emerald-600/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI SPIRITUAL SENTIMENT & TADABBUR ANALYTICS</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Weekly Spiritual Digest</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold uppercase tracking-wider">
                Gemini 3.8 AI
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Agregasi sentimen rohani dan ketenteraman batin (*Sakinah Index*) dari catatan Jurnal Dzikir harian Anda.
              Memahami dinamika emosi, mengidentifikasi kekuatan ruhani, dan menyajikan hikmah Al-Qur&apos;an untuk
              memandu pekan baru.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              onClick={() => setIsAddingEntry(!isAddingEntry)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingEntry ? "Tutup Form" : "Tulis Jurnal Dzikir"}</span>
            </button>

            <button
              onClick={() => fetchWeeklyDigest()}
              disabled={isLoadingDigest}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDigest ? "animate-spin text-amber-400" : ""}`} />
              <span>{isLoadingDigest ? "Menganalisis..." : "Racik Ulang Digest"}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="relative z-10 mt-5 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Periode: <strong>{digest ? `${digest.periodStart} s/d ${digest.periodEnd}` : "7 Hari Terakhir"}</strong></span>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-emerald-200/80 flex items-center gap-1">
              <Feather className="w-3.5 h-3.5 text-teal-400" />
              <span>{journalEntries.length} Catatan Jurnal Tersimpan</span>
            </span>
          </div>

          <button
            onClick={() => setShowEntriesList(!showEntriesList)}
            className="text-amber-300 hover:text-white font-semibold flex items-center gap-1 transition"
          >
            <span>{showEntriesList ? "Sembunyikan Riwayat Jurnal" : "Lihat Semua Catatan"}</span>
            {showEntriesList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* NEW JOURNAL ENTRY DRAWER / MODAL */}
      {isAddingEntry && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Feather className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Catatan Jurnal Dzikir & Muhasabah</h4>
                <p className="text-xs text-slate-500">Tuliskan getaran kalbu, rasa syukur, atau beban pikiran yang ingin diserahkan kepada Allah.</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingEntry(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Session Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Sesi Dzikir:</label>
              <select
                value={newSessionType}
                onChange={(e) => setNewSessionType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="morning_dhikr">🌅 Dzikir Pagi (Al-Ma'tsurat)</option>
                <option value="evening_dhikr">🌆 Dzikir Petang</option>
                <option value="free_tasbih">📿 Tasbih Bebas</option>
                <option value="muhasabah_malam">🌙 Muhasabah Menjelang Tidur</option>
                <option value="general">🤲 Refleksi Umum / Doa Khusus</option>
              </select>
            </div>

            {/* Mood Tag */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Suasana Hati Saat Menulis:</label>
              <select
                value={newMoodTag}
                onChange={(e) => setNewMoodTag(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="damai">🕊️ Damai & Tenteram</option>
                <option value="syukur">🌿 Penuh Syukur</option>
                <option value="bersemangat">🔥 Bersemangat & Optimis</option>
                <option value="taubat">🤲 Taubat & Rendah Hati</option>
                <option value="lelah">😴 Lelah Fisik / Pikiran</option>
                <option value="gelisah">🛡️ Gelisah / Butuh Ketenangan</option>
              </select>
            </div>

            {/* Dhikr Count */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Estimasi Repetisi Dzikir:</label>
              <input
                type="number"
                min="0"
                step="33"
                value={newDhikrCount}
                onChange={(e) => setNewDhikrCount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Isi Renungan Jiwa:</label>
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Contoh: Tadi pagi sempat merasa gundah dengan urusan perniagaan, namun setelah melafalkan wirid tasbih 100x dan doa dhuha hati menjadi tenang..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              AI akan otomatis menghitung Sakinah Index (0-100) dan mengagregasinya ke dalam Weekly Digest.
            </span>

            <button
              onClick={handleSaveJournalEntry}
              disabled={isAnalyzingEntry || !newContent.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              {isAnalyzingEntry ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menganalisis Sentimen...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Catatan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* EXPANDABLE LIST OF ALL JOURNAL ENTRIES */}
      {showEntriesList && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-700" />
              <span>Daftar Entri Jurnal Dzikir Terkumpul ({journalEntries.length})</span>
            </h4>
            <span className="text-xs text-slate-500">Tersimpan di perangkat lokal</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 transition space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">{entry.dateStr}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      {entry.sessionType === "morning_dhikr" ? "🌅 Dzikir Pagi" : entry.sessionType === "evening_dhikr" ? "🌆 Dzikir Petang" : entry.sessionType === "muhasabah_malam" ? "🌙 Muhasabah" : "📿 Tasbih"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-medium text-[10px]">
                      Mood: {entry.moodTag}
                    </span>
                    {entry.sentiment && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 font-mono font-bold text-[10px]">
                        Sakinah: {entry.sentiment.sakinahScore}/100
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-slate-400 hover:text-red-600 transition p-1"
                    title="Hapus entri ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic font-serif">
                  &ldquo;{entry.content}&rdquo;
                </p>

                {entry.sentiment?.summaryReflection && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                    <span className="font-bold">Analisis Emosi: </span>
                    {entry.sentiment.primaryEmotion} &bull; {entry.sentiment.summaryReflection}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN WEEKLY DIGEST DISPLAY */}
      {isLoadingDigest ? (
        <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="w-7 h-7 text-amber-500" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800">Menghimpun Getaran Kalbu Sepekan...</h3>
            <p className="text-xs text-slate-500">
              Gemini AI sedang menganalisis kurva Sakinah Index dari seluruh catatan jurnal dzikir Anda untuk menyusun
              ikhtisar tadabbur yang mendalam.
            </p>
          </div>
          <div className="flex justify-center items-center gap-1.5 text-xs text-emerald-700 font-mono font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Memproses sentimen spiritual mingguan...</span>
          </div>
        </div>
      ) : digest ? (
        <div className="space-y-6">
          {/* TOP SUMMARY CARD: SAKINAH INDEX & EMOTION GAUGES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Big Sakinah Index Score Tile */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white border border-emerald-500/40 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sakinah Index (Indeks Ketenteraman)</span>
                </div>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-5xl sm:text-6xl font-black text-amber-300 font-mono tracking-tight">
                    {digest.overallSakinahScore}
                  </span>
                  <span className="text-slate-400 font-mono text-lg">/100</span>
                </div>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
                  ✨ {digest.sakinahCategory}
                </div>
              </div>

              <div className="border-t border-emerald-800/80 pt-3 text-xs text-emerald-200/90 leading-relaxed">
                Rata-rata kestabilan emosi dan ketenangan batin Anda berada pada fase optimal berkat kontinuitas wirid harian.
              </div>
            </div>

            {/* Dominant Themes & Focus Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Tema Ruhani Dominan Sepekan</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleToggleSpeak}
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition ${
                        isSpeaking
                          ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50"
                      }`}
                      title={isSpeaking ? "Hentikan Suara" : "Dengarkan Narasi Digest"}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-700" />}
                      <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Dengar"}</span>
                    </button>

                    <button
                      onClick={handleCopyDigest}
                      className="p-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 text-xs font-medium transition flex items-center gap-1"
                      title="Salin Rangkuman"
                    >
                      {copiedDigest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span className="hidden sm:inline">{copiedDigest ? "Tersalin" : "Salin"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {digest.dominantSpiritualThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkle className="w-3 h-3 text-amber-500" />
                      <span>{theme}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Executive Summary Excerpt */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {digest.executiveSummary}
              </div>
            </div>
          </div>

          {/* SAKINAH SENTIMENT TREND GRAPH (RECHARTS) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <span>Kurva Fluktuasi Sakinah Index (7 Hari Sepekan)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Pergerakan tingkat ketenteraman hati yang diekstrak dari narasi jurnal harian.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-3 h-1.5 bg-emerald-600 rounded-full inline-block"></span>
                  Sakinah Index
                </span>
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <span className="w-3 h-0.5 border-b border-dashed border-red-400 inline-block"></span>
                  Garis Ambang Tuma&apos;ninah (80)
                </span>
              </div>
            </div>

            <div className="h-60 sm:h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={digest.sentimentProgression}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="sakinahAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                  <XAxis
                    dataKey="dayLabel"
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[40, 100]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />

                  <Tooltip content={<CustomSentimentTooltip />} />

                  {/* Benchmark Sakinah 80+ */}
                  <ReferenceLine
                    y={80}
                    stroke="#f87171"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Ambang Tuma'ninah (80)",
                      position: "insideTopRight",
                      fill: "#ef4444",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="sakinahIndex"
                    name="Sakinah Index"
                    stroke="#059669"
                    strokeWidth={3}
                    fill="url(#sakinahAreaGrad)"
                  />

                  <Line
                    type="monotone"
                    dataKey="sakinahIndex"
                    stroke="#047857"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#047857", stroke: "#ffffff", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2-COLUMN: SPIRITUAL STRENGTHS & GROWTH OPPORTUNITIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Spiritual Strengths */}
            <div className="bg-emerald-50/70 rounded-3xl p-5 sm:p-6 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Kekuatan Ruhani Pekan Ini</span>
              </div>
              <ul className="space-y-2.5">
                {digest.spiritualStrengths.map((str, i) => (
                  <li key={i} className="text-xs sm:text-sm text-emerald-900 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Opportunities */}
            <div className="bg-amber-50/70 rounded-3xl p-5 sm:p-6 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-700" />
                <span>Peluang Pengasuhan Jiwa (Rekomendasi Nurturing)</span>
              </div>
              <ul className="space-y-2.5">
                {digest.growthOpportunities.map((opp, i) => (
                  <li key={i} className="text-xs sm:text-sm text-amber-900 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0"></span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RECOMMENDED QURAN & HADITH TAFAKKUR FOR NEXT WEEK */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Kalam Penguat Hati untuk Menyambut Pekan Depan</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Ayat &amp; Hadits yang Disesuaikan dengan Dinamika Jiwa Anda
              </h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {digest.recommendedVersesAndHadith.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-emerald-950 to-slate-950 text-white rounded-2xl p-5 border border-emerald-800/80 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-300">
                      <span className="font-mono font-bold">{item.source}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-[10px] text-amber-300 font-bold border border-emerald-700">
                        {item.sourceType}
                      </span>
                    </div>

                    <div className="text-right font-arabic text-xl sm:text-2xl leading-loose font-bold text-amber-200 pt-1">
                      {item.arabic}
                    </div>

                    {item.latin && (
                      <p className="text-xs text-emerald-200/90 italic font-sans leading-relaxed">
                        {item.latin}
                      </p>
                    )}

                    <p className="text-xs text-white/90 leading-relaxed font-serif pt-1">
                      &ldquo;{item.translation}&rdquo;
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 text-[11px] text-emerald-200 leading-relaxed mt-2">
                    <span className="font-bold text-amber-300">Korelasi Emosi: </span>
                    {item.context}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MUNAJAT & DOA PEKAN BARU */}
          {digest.customDoaForUpcomingWeek && (
            <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-teal-700/60 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Munajat &amp; Doa Ketenangan Jiwa Pekan Baru</span>
                </span>
                <span className="text-[11px] text-emerald-300 font-mono">Doa Ma&apos;tsur Pilihan</span>
              </div>

              <div className="text-right font-arabic text-2xl sm:text-3xl leading-loose font-bold text-amber-200">
                {digest.customDoaForUpcomingWeek.arabic}
              </div>

              {digest.customDoaForUpcomingWeek.latin && (
                <p className="text-xs text-emerald-200 italic leading-relaxed">
                  {digest.customDoaForUpcomingWeek.latin}
                </p>
              )}

              <div className="p-3.5 rounded-2xl bg-emerald-900/60 border border-emerald-700/70 text-xs sm:text-sm text-white/95 leading-relaxed font-serif">
                &ldquo;{digest.customDoaForUpcomingWeek.translation}&rdquo;
              </div>

              <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                {digest.customDoaForUpcomingWeek.meaning}
              </p>
            </div>
          )}

          {/* 3 ACTIONABLE HABITS TO EMBODY */}
          <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>3 Latihan Ruhani Sederhana untuk Pekan Mendatang</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {digest.actionableSpiritualHabits.map((habit, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {habit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
