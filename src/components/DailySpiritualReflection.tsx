import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  Heart,
  Share2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  ChevronDown,
  ChevronUp,
  Quote,
  Feather,
  Sun,
  Flame,
  X,
  Trash2,
  Clock,
  Lightbulb,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DailySpiritualReflection as ReflectionType } from "../types";

const QUICK_MOODS = [
  { id: "peace", label: "🕊️ Ketenangan Jiwa & Anti Cemas", theme: "Sabar & Ketenangan Batin", need: "Merasa cemas atau lelah pikiran, butuh ketenangan jiwa yang hakiki" },
  { id: "gratitude", label: "🌿 Syukur & Menghargai Nikmat", theme: "Syukur & Qana'ah", need: "Memulai hari dengan rasa syukur atas nikmat yang sering terlewatkan" },
  { id: "patience", label: "🛡️ Sabar Menghadapi Ujian", theme: "Sabar & Keteguhan", need: "Sedang menghadapi cobaan atau hal yang berjalan tidak sesuai rencana" },
  { id: "rizq", label: "💼 Tawakkal & Rezeki Berkah", theme: "Tawakkal & Rezeki", need: "Khawatir mengenai masa depan, rezeki, dan ikhtiar usaha" },
  { id: "forgiveness", label: "🤝 Melapangkan Hati & Memaafkan", theme: "Akhlak & Kelembutan Hati", need: "Merasa tersakiti oleh orang lain, ingin melapangkan dada dan memaafkan" },
  { id: "worship", label: "🕋 Memperbaiki Kualitas Ibadah", theme: "Khusyu' & Istiqomah Ibadah", need: "Ingin menumbuhkan kekhusyukan dan semangat dalam shalat serta wirid" },
  { id: "repentance", label: "✨ Taubat & Lembaran Baru", theme: "Tazkiyatun Nafs & Pengampunan", need: "Menyesali kekhilafan masa lalu dan ingin membuka lembaran hidup yang bersih" },
  { id: "family", label: "🏡 Keberkahan Keluarga & Ukhuwah", theme: "Keluarga Sakinah & Silaturahmi", need: "Menginginkan kerukunan dan kehangatan dalam rumah tangga dan jamaah" },
];

export default function DailySpiritualReflection() {
  const [reflection, setReflection] = useState<ReflectionType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Customization inputs
  const [selectedMoodId, setSelectedMoodId] = useState<string>("peace");
  const [customNeedText, setCustomNeedText] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<"menyejukkan" | "menggugah" | "muhasabah">("menyejukkan");
  const [selectedSourcePref, setSelectedSourcePref] = useState<"all" | "quran" | "hadith">("all");
  const [showPersonalizePanel, setShowPersonalizePanel] = useState<boolean>(false);

  // Interactive user notes & bookmarks
  const [userJournalNote, setUserJournalNote] = useState<string>("");
  const [noteSavedNotice, setNoteSavedNotice] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);

  // Local storage for saved reflections
  const [savedReflections, setSavedReflections] = useState<ReflectionType[]>(() => {
    try {
      const stored = localStorage.getItem("islamicity_saved_spiritual_reflections");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load active reflection or generate initial one
  const generateReflection = async (
    moodId = selectedMoodId,
    customQuery = customNeedText,
    tone = selectedTone,
    sourcePref = selectedSourcePref
  ) => {
    setIsLoading(true);
    setError(null);
    if (isSpeaking && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const moodObj = QUICK_MOODS.find((m) => m.id === moodId);
    const themeToSend = moodObj ? moodObj.theme : "Sabar & Ketenangan Batin";
    const needToSend = customQuery.trim() !== "" ? customQuery.trim() : (moodObj ? moodObj.need : "");

    try {
      const res = await fetch("/api/gemini/spiritual-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: themeToSend,
          userMoodOrNeed: needToSend,
          tone,
          sourcePreference: sourcePref,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gagal memuat renungan: status ${res.status}`);
      }

      const data: ReflectionType = await res.json();
      setReflection(data);

      // Check if user already had a saved note for this ID
      const savedNote = localStorage.getItem(`islamicity_refl_note_${data.id}`) || "";
      setUserJournalNote(savedNote);
    } catch (err: any) {
      console.error("Spiritual reflection fetch error:", err);
      setError("Tidak dapat menghasilkan renungan online saat ini. Menampilkan hikmah tadabbur pilihan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateReflection();
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Save/unsave to local bookmarks
  const toggleBookmark = () => {
    if (!reflection) return;
    const isCurrentlySaved = savedReflections.some((r) => r.id === reflection.id);
    let updated: ReflectionType[];

    if (isCurrentlySaved) {
      updated = savedReflections.filter((r) => r.id !== reflection.id);
    } else {
      updated = [{ ...reflection, isBookmarked: true, userNotes: userJournalNote }, ...savedReflections];
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#10b981", "#f59e0b", "#3b82f6"],
        });
      } catch {}
    }

    setSavedReflections(updated);
    try {
      localStorage.setItem("islamicity_saved_spiritual_reflections", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const isCurrentBookmarked = reflection
    ? savedReflections.some((r) => r.id === reflection.id)
    : false;

  // Save personal journal note
  const handleSaveJournalNote = () => {
    if (!reflection) return;
    try {
      localStorage.setItem(`islamicity_refl_note_${reflection.id}`, userJournalNote);
      setNoteSavedNotice(true);
      setTimeout(() => setNoteSavedNotice(false), 2500);

      // Also update in savedReflections list if present
      if (isCurrentBookmarked) {
        const updated = savedReflections.map((item) =>
          item.id === reflection.id ? { ...item, userNotes: userJournalNote } : item
        );
        setSavedReflections(updated);
        localStorage.setItem("islamicity_saved_spiritual_reflections", JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("Could not save journal note", e);
    }
  };

  // Copy shareable text
  const handleCopyShare = () => {
    if (!reflection) return;
    const shareText = `🕊️ Refleksi Spiritual Harian (AI Tadabbur):
✨ "${reflection.title}"
📖 Sumber: ${reflection.source} (${reflection.sourceType})

${reflection.arabic}
"${reflection.translation}"

💭 Renungan Hari Ini:
${reflection.thought}

🌿 Afirmasi Jiwa:
"${reflection.personalAffirmation}"

🎯 Amalan Hari Ini:
${reflection.dailyAction}

🤲 Doa Penyejuk:
"${reflection.dua?.translation || "Rabbana aatina fid dunya hasanah wa fil akhirati hasanah wa qina 'adzaban naar."}"

Via ABDI Islamicity 4B Kaffah (abdi.sematangborangcity.cloud)`;

    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Audio Speech Synthesis
  const handleToggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Fitur suara Text-to-Speech tidak didukung oleh browser Anda.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!reflection) return;

    window.speechSynthesis.cancel();
    const fullTextToRead = `${reflection.title}. Sumber: ${reflection.source}. Artinya: ${reflection.translation}. Renungan: ${reflection.thought}. Afirmasi: ${reflection.personalAffirmation}. Amalan hari ini: ${reflection.dailyAction}.`;

    const utterance = new SpeechSynthesisUtterance(fullTextToRead);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div id="daily-spiritual-reflection-module" className="space-y-6 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-7 text-white border border-emerald-600/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI SPIRITUAL TADABBUR • RENUNGAN KALBU HARIAN</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Daily Spiritual Reflection</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold uppercase tracking-wider">
                Personal AI
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Dapatkan renungan batin singkat yang dipersonalisasi sesuai kebutuhan hati Anda hari ini. Bersumber
              langsung dari ayat-ayat Al-Qur&apos;an dan Hadits Shahih untuk menghadirkan ketenangan, motivasi ibadah, dan
              kejernihan pikiran.
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              onClick={() => setShowSavedList(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Jurnal Tersimpan ({savedReflections.length})</span>
            </button>

            <button
              onClick={() => setShowPersonalizePanel(!showPersonalizePanel)}
              className="px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-600/50 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
              <span>{showPersonalizePanel ? "Sembunyikan Opsi" : "Personalisasi Suasana Hati"}</span>
              {showPersonalizePanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Mood Selector Chips */}
        <div className="relative z-10 mt-5 pt-4 border-t border-emerald-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Pilih Suasana Hati / Kebutuhan Jiwa Hari Ini:
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Klik chip untuk langsung meracik renungan baru
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {QUICK_MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => {
                  setSelectedMoodId(mood.id);
                  setCustomNeedText("");
                  generateReflection(mood.id, "", selectedTone, selectedSourcePref);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedMoodId === mood.id
                    ? "bg-amber-400 text-slate-950 font-bold shadow-md scale-102"
                    : "bg-emerald-950/70 text-emerald-200 border border-emerald-700/60 hover:bg-emerald-800/60 hover:text-white"
                }`}
              >
                <span>{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Personalization Panel */}
        {showPersonalizePanel && (
          <div className="relative z-10 mt-4 p-4 rounded-2xl bg-slate-950/90 border border-amber-400/40 space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                Parameter Personalisasi AI Spiritual
              </span>
              <span className="text-[11px] text-slate-400">Model: Gemini 3.8 Flash</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Custom need text */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Curahan Hati / Pertanyaan Spesifik (Opsional):
                </label>
                <input
                  type="text"
                  value={customNeedText}
                  onChange={(e) => setCustomNeedText(e.target.value)}
                  placeholder="Contoh: Sedang bimbang mengambil keputusan, butuh keteguhan hati..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              {/* Tone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Gaya Bahasa (Tone):</label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden"
                >
                  <option value="menyejukkan">Menyejukkan (Soothing & Peaceful)</option>
                  <option value="menggugah">Menggugah Semangat (Inspiring & Motivating)</option>
                  <option value="muhasabah">Muhasabah Kalbu (Introspective & Deep)</option>
                </select>
              </div>

              {/* Source Preference */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Preferensi Rujukan:</label>
                <select
                  value={selectedSourcePref}
                  onChange={(e) => setSelectedSourcePref(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden"
                >
                  <option value="all">Kombinasi Otentik (Al-Qur&apos;an / Hadits)</option>
                  <option value="quran">Khusus Ayat Al-Qur&apos;an</option>
                  <option value="hadith">Khusus Hadits Shahih</option>
                </select>
              </div>

              {/* Action Button */}
              <div className="flex items-end">
                <button
                  onClick={() => generateReflection(selectedMoodId, customNeedText, selectedTone, selectedSourcePref)}
                  disabled={isLoading}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Meracik Renungan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Hasilkan Renungan Baru</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Loading or Reflection Card */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="w-7 h-7 text-amber-500" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800">Menghubungkan Hati dengan Dalil Suci...</h3>
            <p className="text-xs text-slate-500">
              AI sedang memilih ayat atau hadits yang paling selaras dengan suasana hati Anda untuk menyajikan renungan
              yang mendalam.
            </p>
          </div>
          <div className="flex justify-center items-center gap-1.5 text-xs text-emerald-700 font-mono font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Memproses refleksi tadabbur...</span>
          </div>
        </div>
      ) : reflection ? (
        <div className="space-y-6">
          {/* Hero Reflection Display Card */}
          <div className="bg-white rounded-3xl border border-emerald-200/90 shadow-sm overflow-hidden relative">
            {/* Soft Ornamental Glow Top Right */}
            <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-bl from-amber-100/60 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            {/* Card Header Toolbar */}
            <div className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 px-6 py-4 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{reflection.sourceType}</span>
                </span>

                <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                  {reflection.theme}
                </span>

                <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-medium">
                  {reflection.source}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToggleSpeak}
                  title={isSpeaking ? "Hentikan Audio" : "Dengarkan Renungan dengan Suara"}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    isSpeaking
                      ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
                  <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Dengarkan"}</span>
                </button>

                <button
                  onClick={toggleBookmark}
                  title={isCurrentBookmarked ? "Tersimpan di Jurnal" : "Simpan ke Jurnal Spiritual"}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    isCurrentBookmarked
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {isCurrentBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="hidden sm:inline">{isCurrentBookmarked ? "Tersimpan" : "Simpan"}</span>
                </button>

                <button
                  onClick={handleCopyShare}
                  title="Salin Teks Lengkap"
                  className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span className="hidden sm:inline">{isCopied ? "Tersalin" : "Salin"}</span>
                </button>

                <button
                  onClick={() => generateReflection()}
                  title="Acak / Buat Renungan Baru"
                  className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition flex items-center gap-1 shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Ganti</span>
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 space-y-7 relative z-10">
              {/* Title & Metadata */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5" />
                  <span>Kalam Penyejuk Hati Hari Ini</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {reflection.title}
                </h3>
              </div>

              {/* Sacred Arabic Callout Box */}
              <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-emerald-800/80 space-y-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between text-xs text-emerald-300/80 border-b border-emerald-800/80 pb-2">
                  <span className="font-mono font-medium">{reflection.source}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-[10px] text-amber-300 font-bold border border-emerald-700">
                    Dalil Otentik Tervalidasi
                  </span>
                </div>

                {/* Arabic Script */}
                <div className="text-right font-arabic text-2xl sm:text-3xl leading-loose font-bold text-amber-200 tracking-wide pt-2">
                  {reflection.arabic}
                </div>

                {/* Latin Transliteration */}
                {reflection.latin && (
                  <p className="text-xs text-emerald-200/90 italic font-sans leading-relaxed pt-1">
                    {reflection.latin}
                  </p>
                )}

                {/* Indonesian Translation */}
                <div className="p-3.5 rounded-xl bg-emerald-900/50 border border-emerald-700/60 text-xs sm:text-sm text-white/95 leading-relaxed font-serif">
                  &ldquo;{reflection.translation}&rdquo;
                </div>
              </div>

              {/* Heartfelt Reflection / Thought for the Day */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Quote className="w-4 h-4 text-emerald-700" />
                  <span>Renungan Jiwa Hari Ini</span>
                </div>
                <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-3 font-normal">
                  {reflection.thought.split("\n\n").map((para, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Personal Affirmation Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 flex items-start gap-3.5 shadow-2xs">
                <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shrink-0 shadow-xs">
                  <Sun className="w-4 h-4 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Afirmasi Pribadi Hari Ini
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-amber-900 italic font-serif leading-relaxed">
                    &ldquo;{reflection.personalAffirmation}&rdquo;
                  </p>
                </div>
              </div>

              {/* 2-Column: Daily Practical Action & Munajat / Doa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Daily Action */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Latihan Batin / Tindakan Hari Ini</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                    {reflection.dailyAction}
                  </p>
                </div>

                {/* Daily Dua */}
                {reflection.dua && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-950">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-teal-700" />
                        <span>Doa Penyejuk Hari Ini</span>
                      </span>
                    </div>
                    {reflection.dua.arabic && (
                      <div className="text-right font-arabic text-base text-teal-950 font-bold">
                        {reflection.dua.arabic}
                      </div>
                    )}
                    <p className="text-xs text-teal-900/90 italic">
                      &ldquo;{reflection.dua.translation}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* User Private Reflection Journal Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5 text-emerald-700" />
                    Jurnal Refleksi Pribadi (Hanya Tersimpan di Perangkat Anda):
                  </span>
                  {noteSavedNotice && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
                      <Check className="w-3.5 h-3.5" /> Tersimpan!
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={userJournalNote}
                  onChange={(e) => setUserJournalNote(e.target.value)}
                  placeholder="Tuliskan hikmah atau rasa syukur pribadi yang terbersit di hati Anda setelah membaca renungan ini..."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 font-sans"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Catatan ini akan tersimpan bersama renungan ini jika Anda klik Simpan.
                  </span>
                  <button
                    onClick={handleSaveJournalNote}
                    className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Simpan Catatan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* SAVED REFLECTIONS DRAWER / MODAL */}
      {showSavedList && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col justify-between shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Jurnal Renungan Spiritual Tersimpan</h4>
                  <p className="text-[11px] text-emerald-300">
                    {savedReflections.length} Renungan yang telah Anda tandai
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSavedList(false)}
                className="p-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
              {savedReflections.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-slate-400">
                  <Bookmark className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Belum ada renungan yang disimpan</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Klik tombol &ldquo;Simpan&rdquo; pada renungan harian untuk mengumpulkannya di jurnal pribadi Anda.
                  </p>
                </div>
              ) : (
                savedReflections.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mr-2">
                          {item.sourceType} • {item.source}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h5>
                      </div>

                      <button
                        onClick={() => {
                          const updated = savedReflections.filter((r) => r.id !== item.id);
                          setSavedReflections(updated);
                          localStorage.setItem("islamicity_saved_spiritual_reflections", JSON.stringify(updated));
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 transition"
                        title="Hapus dari tersimpan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                      &ldquo;{item.translation}&rdquo;
                    </p>

                    {item.userNotes && (
                      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 font-sans">
                        <span className="font-bold">Catatan Anda: </span>
                        {item.userNotes}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-100">
                      <span className="text-slate-400 font-mono">
                        {new Date(item.generatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      <button
                        onClick={() => {
                          setReflection(item);
                          setShowSavedList(false);
                        }}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Buka Renungan Ini &rarr;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSavedList(false)}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
