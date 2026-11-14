import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Feather,
  Plus,
  Search,
  Sparkles,
  Heart,
  Calendar,
  Sun,
  Moon,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Share2,
  Copy,
  Check,
  Pin,
  Flame,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Smile,
  Quote,
  ArrowRight,
  Filter,
  Bookmark,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DhikrJournalEntry, DhikrSessionType } from "../types";

const INITIAL_SEED_ENTRIES: DhikrJournalEntry[] = [
  {
    id: "entry-seed-1",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    dateKey: new Date().toISOString().split("T")[0],
    sessionType: "morning",
    sessionTitle: "Dzikir Pagi Al-Ma'tsurat",
    repetitionCount: 135,
    streakAtTime: 4,
    heartState: "Tenang & Khusyu'",
    content:
      "Alhamdulillah, pagi ini wirid terasa begitu menyejukkan kalbu. Saat mengulang Sayyidul Istighfar sebanyak 3 kali, ada rasa haru yang mengalir mengingat betapa seringnya Allah menutupi aib hamba-Nya. Semoga Allah menjaga niat ikhlas mencari nafkah halal hari ini di Sematang Borang dan menjauhkan dari sifat tergesa-gesa.",
    gratitudeNote: "Kesehatan keluarga dan rezeki nafas segar saat fajar tadi.",
    intentionForTomorrow: "Bangun lebih awal untuk shalat tahajjud dan dzikir fajar berjamaah di masjid.",
    favoriteVerseOrLafadz: "Sayyidul Istighfar & Ayat Kursi",
    tags: ["Dzikir Pagi", "Ketenangan", "Syukur"],
    isPinned: true,
  },
  {
    id: "entry-seed-2",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dateKey: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    sessionType: "evening",
    sessionTitle: "Dzikir Petang Pelindung Malam",
    repetitionCount: 140,
    streakAtTime: 3,
    heartState: "Lega Setelah Cemas",
    content:
      "Menutup senja setelah seharian beraktivitas yang cukup padat dan penuh tantangan. Melafalkan tasbih, tahmid, dan tahlil 100x benar-benar melepaskan kepenatan di pundak. Merasa diingatkan kembali bahwa rezeki sudah diatur oleh Ar-Razzaq, tugasku hanyalah berikhtiar dengan jujur dan berserah diri.",
    gratitudeNote: "Urusan pekerjaan selesai dengan baik tanpa melanggar prinsip syariah.",
    intentionForTomorrow: "Lebih sabar dan bertutur kata lembut kepada tetangga dan rekan kerja.",
    favoriteVerseOrLafadz: "Subhanallah wa bihamdihi",
    tags: ["Dzikir Petang", "Tawakkal", "Anti Cemas"],
    isPinned: false,
  },
  {
    id: "entry-seed-3",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    dateKey: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    sessionType: "free_tasbih",
    sessionTitle: "Tasbih Bebas Bakda Ashar",
    repetitionCount: 100,
    streakAtTime: 2,
    heartState: "Penuh Harap (Raja')",
    content:
      "Duduk tenang sejenak di serambi masjid bakda Ashar, menyempatkan 100x shalawat atas Nabi SAW. Terasa ada keteduhan yang merayap di dada. Dzikir adalah sebaik-baik penawar rasa gundah di tengah hiruk pikuk kehidupan kota.",
    gratitudeNote: "Bisa meluangkan waktu hening di masjid tanpa terdistraksi notifikasi ponsel.",
    intentionForTomorrow: "Menjaga lisan dari ghibah dan membiasakan basmalah di setiap permulaan.",
    favoriteVerseOrLafadz: "Allahumma shalli 'ala Muhammad",
    tags: ["Tasbih Bebas", "Shalawat", "Ketenangan"],
    isPinned: false,
  },
];

const HEART_STATES = [
  { label: "🕊️ Tenang & Khusyu'", value: "Tenang & Khusyu'" },
  { label: "🌿 Penuh Syukur", value: "Penuh Syukur" },
  { label: "🛡️ Sabar Menghadapi Ujian", value: "Sabar Menghadapi Ujian" },
  { label: "🤲 Menyesali Khilaf (Taubat)", value: "Menyesali Khilaf (Taubat)" },
  { label: "💼 Amanah & Tawakkal", value: "Amanah & Tawakkal" },
  { label: "✨ Lapang & Bersemangat", value: "Lapang & Bersemangat" },
];

const GUIDED_PROMPTS = [
  "Lafadz dzikir apa yang paling bergetar di hati Anda tadi, dan mengapa?",
  "Kekhawatiran atau beban apa yang terasa lebih ringan setelah berdzikir?",
  "Satu nikmat Allah yang terbersit di benak Anda saat mengucap 'Alhamdulillah'?",
  "Apa tekad kecil yang ingin Anda perbaiki dalam pergaulan atau ibadah hari ini?",
];

interface DhikrJournalProps {
  onBackToDhikr?: () => void;
  initialSessionContext?: {
    sessionType: DhikrSessionType;
    repetitionCount: number;
    streakDays: number;
  };
}

export default function DhikrJournal({ onBackToDhikr, initialSessionContext }: DhikrJournalProps) {
  // Load journal entries from localStorage
  const [entries, setEntries] = useState<DhikrJournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem("islamicity_dhikr_journal_entries");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SEED_ENTRIES;
    } catch {
      return INITIAL_SEED_ENTRIES;
    }
  });

  // Editor states
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(Boolean(initialSessionContext));
  const [sessionType, setSessionType] = useState<DhikrSessionType>(
    initialSessionContext?.sessionType || "morning"
  );
  const [repetitionCount, setRepetitionCount] = useState<number>(
    initialSessionContext?.repetitionCount || 100
  );
  const [heartState, setHeartState] = useState<string>("Tenang & Khusyu'");
  const [content, setContent] = useState<string>("");
  const [gratitudeNote, setGratitudeNote] = useState<string>("");
  const [intentionForTomorrow, setIntentionForTomorrow] = useState<string>("");
  const [favoriteVerseOrLafadz, setFavoriteVerseOrLafadz] = useState<string>("");
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>(["Dzikir"]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | DhikrSessionType | "pinned">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("islamicity_dhikr_journal_entries", JSON.stringify(entries));
    } catch (e) {
      console.warn("Could not save journal entries to localStorage", e);
    }
  }, [entries]);

  // Handle saving new entry
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const sessionTitles: Record<DhikrSessionType, string> = {
      morning: "Dzikir Pagi Al-Ma'tsurat",
      evening: "Dzikir Petang Pelindung Senja",
      free_tasbih: "Tasbih Bebas & Wirid Mandiri",
      general: "Refleksi Hati & Tadabbur",
    };

    const finalTags = Array.from(new Set([...tags, sessionTitles[sessionType].split(" ")[0]]));

    const newEntry: DhikrJournalEntry = {
      id: `journal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      dateKey: new Date().toISOString().split("T")[0],
      sessionType,
      sessionTitle: sessionTitles[sessionType],
      repetitionCount: Number(repetitionCount) || 0,
      streakAtTime: initialSessionContext?.streakDays || 4,
      heartState,
      content: content.trim(),
      gratitudeNote: gratitudeNote.trim() || undefined,
      intentionForTomorrow: intentionForTomorrow.trim() || undefined,
      favoriteVerseOrLafadz: favoriteVerseOrLafadz.trim() || undefined,
      tags: finalTags,
      isPinned: false,
    };

    setEntries([newEntry, ...entries]);

    // Reset form
    setContent("");
    setGratitudeNote("");
    setIntentionForTomorrow("");
    setFavoriteVerseOrLafadz("");
    setIsEditorOpen(false);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#0d9488"],
      });
    } catch {}
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    setEntries(
      entries.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  // Delete Entry
  const handleDeleteEntry = (id: string) => {
    if (confirm("Hapus catatan refleksi dzikir ini dari jurnal Anda?")) {
      setEntries(entries.filter((item) => item.id !== id));
    }
  };

  // Copy shareable text
  const handleCopyEntry = (entry: DhikrJournalEntry) => {
    const formattedDate = new Date(entry.createdAt).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const shareText = `📖 Catatan Jurnal Dzikir (${entry.sessionTitle})
📅 ${formattedDate} • ${entry.heartState}
📿 Repetisi: ${entry.repetitionCount}x wirid

"${entry.content}"
${entry.gratitudeNote ? `\n🌿 Hal yang Disyukuri: ${entry.gratitudeNote}` : ""}
${entry.favoriteVerseOrLafadz ? `\n✨ Lafadz Paling Berkesan: ${entry.favoriteVerseOrLafadz}` : ""}
${entry.intentionForTomorrow ? `\n🎯 Niat Hari Esok: ${entry.intentionForTomorrow}` : ""}

Via ABDI Islamicity 4B Kaffah (abdi.sematangborangcity.cloud)`;

    navigator.clipboard.writeText(shareText);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.heartState.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesFilter = true;
      if (selectedFilter === "pinned") {
        matchesFilter = Boolean(item.isPinned);
      } else if (selectedFilter !== "all") {
        matchesFilter = item.sessionType === selectedFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [entries, searchQuery, selectedFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const morningCount = entries.filter((e) => e.sessionType === "morning").length;
    const eveningCount = entries.filter((e) => e.sessionType === "evening").length;
    const freeCount = entries.filter((e) => e.sessionType === "free_tasbih").length;

    // Most common heart state
    const stateMap: Record<string, number> = {};
    entries.forEach((e) => {
      stateMap[e.heartState] = (stateMap[e.heartState] || 0) + 1;
    });
    let topState = "Tenang & Khusyu'";
    let topCount = 0;
    Object.entries(stateMap).forEach(([k, v]) => {
      if (v > topCount) {
        topCount = v;
        topState = k;
      }
    });

    const hasTodayEntry = entries.some(
      (e) => e.dateKey === new Date().toISOString().split("T")[0]
    );

    return {
      totalEntries,
      morningCount,
      eveningCount,
      freeCount,
      topState,
      hasTodayEntry,
    };
  }, [entries]);

  return (
    <div id="dhikr-journal-module" className="space-y-6 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-7 text-white border border-emerald-600/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Feather className="w-3.5 h-3.5 text-amber-300" />
              <span>JURNAL TAZKIYATUN NAFS • CATATAN KALBU WIRID</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Dhikr Journal</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold uppercase tracking-wider">
                Refleksi Pribadi
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Dzikir yang membekas adalah dzikir yang direnungi. Catat getaran hati, rasa syukur, dan hikmah yang
              mengalir seusai Anda menyelesaikan wirid harian untuk memperdalam ketenangan spiritual.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            {onBackToDhikr && (
              <button
                onClick={onBackToDhikr}
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <span>&larr; Ke Tasbih Dzikir</span>
              </button>
            )}

            <button
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isEditorOpen ? "Tutup Form Catatan" : "Tulis Refleksi Sesi Baru"}</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Pills */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/60">
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/70 space-y-0.5">
            <div className="text-[11px] text-emerald-300 font-medium">Total Catatan Jurnal</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{stats.totalEntries}</div>
            <div className="text-[10px] text-emerald-400">Tersimpan di perangkat</div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/70 space-y-0.5">
            <div className="text-[11px] text-emerald-300 font-medium">Refleksi Hari Ini</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono flex items-center gap-1">
              {stats.hasTodayEntry ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Tercatat</span>
                </>
              ) : (
                <span className="text-base text-slate-300">Belum Dicatat</span>
              )}
            </div>
            <div className="text-[10px] text-emerald-400">
              {stats.hasTodayEntry ? "Alhamdulillah ✨" : "Tulis setelah wirid"}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/70 space-y-0.5">
            <div className="text-[11px] text-emerald-300 font-medium">Suasana Hati Terbanyak</div>
            <div className="text-xs sm:text-sm font-bold text-white truncate pt-1">{stats.topState}</div>
            <div className="text-[10px] text-emerald-400">Kondisi batin dominan</div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/70 space-y-0.5">
            <div className="text-[11px] text-emerald-300 font-medium">Sebaran Sesi</div>
            <div className="text-xs font-bold text-amber-300 font-mono pt-1">
              🌅 {stats.morningCount} • 🌆 {stats.eveningCount} • 📿 {stats.freeCount}
            </div>
            <div className="text-[10px] text-emerald-400">Pagi / Petang / Bebas</div>
          </div>
        </div>
      </div>

      {/* JOURNAL EDITOR FORM (EXPANDABLE) */}
      {isEditorOpen && (
        <form
          onSubmit={handleSaveEntry}
          className="bg-white rounded-3xl border border-emerald-200/90 p-6 sm:p-7 shadow-sm space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Feather className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tulis Catatan Refleksi Dzikir Baru</h3>
                <p className="text-xs text-slate-500">
                  Curahkan renungan batin Anda seusai melafalkan dzikir hari ini.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Session Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Sesi Dzikir yang Diselesaikan:</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as DhikrSessionType)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
              >
                <option value="morning">🌅 Dzikir Pagi Al-Ma&apos;tsurat</option>
                <option value="evening">🌆 Dzikir Petang Pelindung Senja</option>
                <option value="free_tasbih">📿 Tasbih Bebas / Wirid Mandiri</option>
                <option value="general">📖 Refleksi Spiritual Umum</option>
              </select>
            </div>

            {/* Repetition Count */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Perkiraan Jumlah Repetisi:</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={repetitionCount}
                  onChange={(e) => setRepetitionCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-900 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">rep</span>
              </div>
            </div>

            {/* Heart State */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Suasana Hati yang Dirasakan:</label>
              <select
                value={heartState}
                onChange={(e) => setHeartState(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
              >
                {HEART_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guided Prompt Suggestions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Inspirasi Pemantik Renungan (Klik untuk Menyisipkan ke Catatan):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {GUIDED_PROMPTS.map((prompt, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setContent((prev) => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-medium transition border border-emerald-200/80 text-left"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Catatan Refleksi & Tadabbur Jiwa: *</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                {content.length} karakter
              </span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ceritakan apa yang terbersit di kalbu Anda setelah melafalkan tasbih dan wirid tadi... Apa yang Anda rasakan? Hikmah apa yang Anda petik?"
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 font-sans leading-relaxed"
            />
          </div>

          {/* Optional Micro-Fields: Gratitude & Intention */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                🌿 Hal yang Paling Disyukuri (Opsional):
              </label>
              <input
                type="text"
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                placeholder="Contoh: Diberi kelapangan rezeki dan kesehatan..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                ✨ Lafadz / Wirid Paling Mengena (Opsional):
              </label>
              <input
                type="text"
                value={favoriteVerseOrLafadz}
                onChange={(e) => setFavoriteVerseOrLafadz(e.target.value)}
                placeholder="Contoh: Sayyidul Istighfar, Ayat Kursi..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                🎯 Tekad / Niat untuk Hari Esok (Opsional):
              </label>
              <input
                type="text"
                value={intentionForTomorrow}
                onChange={(e) => setIntentionForTomorrow(e.target.value)}
                placeholder="Contoh: Dzikir fajar tepat waktu bakda Subuh..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Form Submit & Cancel */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={!content.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Catatan ke Jurnal</span>
            </button>
          </div>
        </form>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari catatan jurnal berdasarkan kata kunci, lafadz, atau suasana hati..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* New Entry Quick Trigger */}
          {!isEditorOpen && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Catatan</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: "all", label: `Semua (${entries.length})` },
            { id: "morning", label: `Dzikir Pagi (${stats.morningCount})` },
            { id: "evening", label: `Dzikir Petang (${stats.eveningCount})` },
            { id: "free_tasbih", label: `Tasbih Bebas (${stats.freeCount})` },
            { id: "pinned", label: `Favorit / Berbintang 📌` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                selectedFilter === tab.id
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* JOURNAL ENTRIES FEED */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Feather className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Belum Ada Catatan yang Sesuai</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "Tidak ditemukan catatan dengan kata kunci tersebut. Coba ganti pencarian."
                : "Mulai abadikan renungan batin Anda setiap kali menuntaskan dzikir pagi atau petang."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
                setIsEditorOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Catatan Pertama</span>
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const formattedDate = new Date(entry.createdAt).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const formattedTime = new Date(entry.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-2xs space-y-4 transition ${
                  entry.isPinned
                    ? "border-amber-300 ring-1 ring-amber-200 bg-amber-50/20"
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                {/* Entry Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Session Icon Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        entry.sessionType === "morning"
                          ? "bg-amber-100 text-amber-950 border border-amber-300"
                          : entry.sessionType === "evening"
                          ? "bg-teal-100 text-teal-950 border border-teal-300"
                          : "bg-emerald-100 text-emerald-950 border border-emerald-300"
                      }`}
                    >
                      {entry.sessionType === "morning" && <Sun className="w-3.5 h-3.5 text-amber-600" />}
                      {entry.sessionType === "evening" && <Moon className="w-3.5 h-3.5 text-teal-600" />}
                      {entry.sessionType === "free_tasbih" && <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{entry.sessionTitle}</span>
                    </span>

                    {/* Heart State Pill */}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {entry.heartState}
                    </span>

                    {/* Repetition Count */}
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {entry.repetitionCount}x wirid
                    </span>
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400">
                    <span className="font-mono text-[11px] text-slate-500">
                      {formattedDate} • {formattedTime} WIB
                    </span>

                    <button
                      onClick={() => handleTogglePin(entry.id)}
                      title={entry.isPinned ? "Lepas Sematan" : "Sematkan Catatan Ini"}
                      className={`p-1.5 rounded-lg border transition ${
                        entry.isPinned
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-600"
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyEntry(entry)}
                      title="Salin Catatan Refleksi"
                      className="p-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      title="Hapus Catatan"
                      className="p-1.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Entry Body Content */}
                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                  {entry.content}
                </div>

                {/* Optional Sub-Panels: Gratitude & Intention */}
                {(entry.gratitudeNote || entry.favoriteVerseOrLafadz || entry.intentionForTomorrow) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    {entry.gratitudeNote && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-0.5">
                        <div className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-emerald-600" />
                          <span>Hal yang Disyukuri</span>
                        </div>
                        <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                          {entry.gratitudeNote}
                        </p>
                      </div>
                    )}

                    {entry.favoriteVerseOrLafadz && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-0.5">
                        <div className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                          <Quote className="w-3 h-3 text-amber-600" />
                          <span>Lafadz Mengena</span>
                        </div>
                        <p className="text-xs text-amber-950 font-medium leading-relaxed">
                          {entry.favoriteVerseOrLafadz}
                        </p>
                      </div>
                    )}

                    {entry.intentionForTomorrow && (
                      <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-0.5">
                        <div className="text-[10px] font-bold text-teal-900 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-teal-600" />
                          <span>Niat Hari Esok</span>
                        </div>
                        <p className="text-xs text-teal-950 font-medium leading-relaxed">
                          {entry.intentionForTomorrow}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
