import { useState, useEffect, type FormEvent } from "react";
import {
  Sparkles,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  BookOpen,
  CheckCircle2,
  Heart,
  Calendar,
  MessageCircle,
  Twitter,
  Send,
  Facebook,
  Quote,
  Lightbulb,
  Layers,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  PenLine,
  Save,
  Trash2,
} from "lucide-react";
import { DailyHadithData } from "../types";

export default function DailyHadith() {
  const [hadith, setHadith] = useState<DailyHadithData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [customTheme, setCustomTheme] = useState<string>("");
  const [copiedType, setCopiedType] = useState<"quote" | "full" | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [savedHadiths, setSavedHadiths] = useState<DailyHadithData[]>(() => {
    try {
      const saved = localStorage.getItem("islamicity_saved_hadiths");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [completedTakeaways, setCompletedTakeaways] = useState<{ [key: number]: boolean }>({});
  const [personalReflection, setPersonalReflection] = useState<string>(() => {
    try {
      return localStorage.getItem("islamicity_user_hadith_note") || "";
    } catch {
      return "";
    }
  });
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showSavedDrawer, setShowSavedDrawer] = useState<boolean>(false);

  const categories = [
    "Semua",
    "Ukhuwah",
    "Muamalah",
    "Akhlak",
    "ZISWAF",
    "Ibadah",
    "Ilmu",
    "Keluarga",
    "Tawakkal",
    "Sosial",
  ];

  // Fetch Daily Hadith from Gemini API
  const fetchHadith = async (categoryChoice?: string, specificQuery?: string) => {
    setIsLoading(true);
    setError(null);
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }

    try {
      const cat = categoryChoice !== undefined ? categoryChoice : selectedCategory;
      const theme = specificQuery !== undefined ? specificQuery : customTheme;

      const res = await fetch("/api/gemini/daily-hadith", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: cat,
          specificTheme: theme,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data: DailyHadithData = await res.json();
      setHadith(data);
      setCompletedTakeaways({});
    } catch (err: any) {
      console.error("Error fetching daily hadith:", err);
      setError("Gagal memuat Hadits Harian. Silakan coba klik tombol Muat Ulang.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHadith("Semua", "");
  }, []);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    fetchHadith(cat, customTheme);
  };

  const handleCustomSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchHadith(selectedCategory, customTheme);
  };

  const isBookmarked = hadith ? savedHadiths.some((h) => h.id === hadith.id) : false;

  const toggleBookmark = () => {
    if (!hadith) return;
    let updated: DailyHadithData[];
    if (isBookmarked) {
      updated = savedHadiths.filter((h) => h.id !== hadith.id);
    } else {
      updated = [hadith, ...savedHadiths];
    }
    setSavedHadiths(updated);
    try {
      localStorage.setItem("islamicity_saved_hadiths", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const savePersonalNote = () => {
    try {
      localStorage.setItem("islamicity_user_hadith_note", personalReflection);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSpeech = () => {
    if (!hadith) return;
    if (!("speechSynthesis" in window)) {
      alert("Fitur Text-to-Speech tidak didukung pada peramban ini.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${hadith.theme}. Sabda Rasulullah shallallahu 'alaihi wa sallam: "${hadith.translation}". Diriwayatkan oleh ${hadith.narrator}, ${hadith.bookSource}. Refleksi: ${hadith.reflectionTadabbur}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Social Share Generators
  const getShareTextForSocial = () => {
    if (!hadith) return "";
    return `✨ *Mutiara Hadits Harian & Tadabbur* ✨\n\n📌 *${hadith.theme}*\n\n"${hadith.hadithArabic}"\n\n_"${hadith.translation}"_\n\n📖 *Sumber:* ${hadith.bookSource} (${hadith.authenticity})\n👤 *Perawi:* ${hadith.narrator}\n\n💡 *Tadabbur Ringkas:*\n${hadith.reflectionTadabbur.slice(0, 240)}...\n\n🌿 *Langkah Nyata Hari Ini:*\n${hadith.actionableTakeaways.map((t) => `• ${t}`).join("\n")}\n\n🏛️ _Platform Digital ABDI Islamicity 4B Sematang Borang_\n🌐 https://abdi.sematangborangcity.cloud`;
  };

  const handleCopyQuoteOnly = () => {
    if (!hadith) return;
    const text = `"${hadith.translation}"\n\n— ${hadith.bookSource} (${hadith.narrator})\n\nVia abdi.sematangborangcity.cloud`;
    navigator.clipboard.writeText(text);
    setCopiedType("quote");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyFullText = () => {
    const text = getShareTextForSocial();
    navigator.clipboard.writeText(text);
    setCopiedType("full");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareTextForSocial());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareToTwitter = () => {
    if (!hadith) return;
    const tweet = encodeURIComponent(
      `"${hadith.translation.slice(0, 160)}..." (${hadith.bookSource})\n\nRefleksi Hadits Harian via @Islamicity4B Sematang Borang:\n`
    );
    const url = encodeURIComponent("https://abdi.sematangborangcity.cloud");
    const hashtags = hadith.shareHashtags?.join(",") || "HaditsHarian,Islamicity4B";
    window.open(`https://twitter.com/intent/tweet?text=${tweet}&url=${url}&hashtags=${hashtags}`, "_blank");
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(getShareTextForSocial());
    const url = encodeURIComponent("https://abdi.sematangborangcity.cloud");
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent("https://abdi.sematangborangcity.cloud");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  return (
    <div id="daily-hadith-component" className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border border-emerald-800/40 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                AI Verified Hadith Engine
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Hadits Harian & Tadabbur Tematik
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Mutiara Sunnah Nabawiyah tervalidasi dengan takhrij sanad shahih, diselaraskan dengan refleksi kontekstual 4 Pilar Kaffah untuk menguatkan ukhuwah warga Sematang Borang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-saved-hadiths"
              onClick={() => setShowSavedDrawer(!showSavedDrawer)}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              Tersimpan ({savedHadiths.length})
            </button>

            <button
              id="btn-refresh-hadith"
              disabled={isLoading}
              onClick={() => fetchHadith(selectedCategory, customTheme)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Memverifikasi Sanad..." : "Hadits Baru (AI)"}
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Theme Search */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar for custom theme */}
          <form onSubmit={handleCustomSearch} className="flex items-center gap-1.5">
            <input
              type="text"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="Cari tema khusus (misal: adab, sedekah)..."
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-56"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* Saved Hadith Drawer */}
      {showSavedDrawer && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 text-white space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200">Koleksi Hadits Favorit Anda</h3>
            </div>
            <button
              onClick={() => setShowSavedDrawer(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Tutup
            </button>
          </div>

          {savedHadiths.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              Belum ada hadits yang disimpan. Klik tombol Simpan Hadits pada kartu untuk menandainya.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedHadiths.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                      <span>{item.category}</span>
                      <span className="text-emerald-400 font-mono text-[10px]">{item.authenticity}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{item.theme}</h4>
                    <p className="text-[11px] text-slate-300 italic line-clamp-2 mt-1">
                      "{item.translation}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                    <span className="text-slate-500 text-[10px]">{item.bookSource}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHadith(item)}
                        className="text-emerald-400 hover:underline font-semibold"
                      >
                        Buka
                      </button>
                      <button
                        onClick={() => {
                          const updated = savedHadiths.filter((h) => h.id !== item.id);
                          setSavedHadiths(updated);
                          localStorage.setItem("islamicity_saved_hadiths", JSON.stringify(updated));
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Hapus dari koleksi"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-slate-200 rounded-full" />
            <div className="h-6 w-44 bg-slate-200 rounded-full" />
          </div>
          <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
          <div className="bg-emerald-50/50 p-6 rounded-2xl space-y-4">
            <div className="h-10 w-full bg-slate-200 rounded" />
            <div className="h-6 w-2/3 ml-auto bg-slate-200 rounded" />
            <div className="h-16 w-full bg-slate-200 rounded mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-100 rounded-xl" />
            <div className="h-32 bg-slate-100 rounded-xl" />
          </div>
        </div>
      )}

      {/* Error View */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={() => fetchHadith()}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Main Hadith Display Card */}
      {hadith && !isLoading && (
        <div className="space-y-6">
          <div
            id="main-hadith-card"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden transition-all hover:border-emerald-500/50"
          >
            {/* Card Header Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200">
                  {hadith.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Sanad: {hadith.authenticity}
                </span>
              </div>

              {/* Action Buttons: Audio, Bookmark, Share */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-voice-tadabbur"
                  onClick={toggleSpeech}
                  title={isSpeaking ? "Hentikan Suara" : "Dengarkan Narasi Tadabbur"}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                    isSpeaking
                      ? "bg-red-100 text-red-700 border-red-300 animate-pulse"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Hentikan</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Audio Tadabbur</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-bookmark-toggle"
                  onClick={toggleBookmark}
                  title={isBookmarked ? "Hapus dari Favorit" : "Simpan Hadits"}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                    isBookmarked
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tersimpan</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>Simpan</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-open-share-modal"
                  onClick={() => setShowShareModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan ke Medsos</span>
                </button>
              </div>
            </div>

            {/* Hadith Core Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Title & Theme */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5" />
                  Mutiara Sabda Rasulullah ﷺ
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {hadith.theme}
                </h3>
              </div>

              {/* Arabic Text Display */}
              <div className="bg-gradient-to-br from-emerald-950/[0.04] via-emerald-900/[0.02] to-teal-950/[0.04] p-6 sm:p-8 rounded-2xl border border-emerald-800/15 space-y-4">
                <p className="font-serif text-right text-xl sm:text-2xl lg:text-3xl text-emerald-950 leading-[2.2] dir-rtl font-semibold tracking-wide">
                  {hadith.hadithArabic}
                </p>

                {hadith.hadithLatin && (
                  <p className="text-xs font-mono text-emerald-800 bg-white/70 p-2.5 rounded-lg border border-emerald-200/60 leading-relaxed">
                    {hadith.hadithLatin}
                  </p>
                )}

                {/* Translation */}
                <div className="pt-2 border-t border-emerald-800/15 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Terjemahan:
                  </div>
                  <blockquote className="text-base sm:text-lg text-slate-900 font-serif italic leading-relaxed text-slate-800 border-l-4 border-emerald-600 pl-4 py-1">
                    "{hadith.translation}"
                  </blockquote>
                </div>
              </div>

              {/* Sanad & Takhrij Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Perawi Utama (Sahabat):</span>
                  <span className="font-bold text-slate-900">{hadith.narrator}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Kitab Rujukan & Nomor:</span>
                  <span className="font-bold text-emerald-800 font-mono">{hadith.bookSource}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Catatan Takhrij & Sanad:</span>
                  <span className="font-medium text-slate-700">{hadith.takhrijNotes}</span>
                </div>
              </div>

              {/* Deep Tadabbur / Reflection */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Tadabbur & Refleksi Kehidupan</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                  {hadith.reflectionTadabbur}
                </p>
              </div>

              {/* Actionable Takeaways & Pillar Integration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 3 Practical Takeaways with Checklist */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Langkah Nyata Hari Ini (Action Steps)</span>
                    </h4>
                    <span className="text-[10px] text-slate-500">Centang yang sudah Anda amalkan</span>
                  </div>

                  <div className="space-y-2">
                    {hadith.actionableTakeaways.map((takeaway, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition ${
                          completedTakeaways[idx]
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-medium"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!completedTakeaways[idx]}
                          onChange={() =>
                            setCompletedTakeaways((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                          className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <span className={completedTakeaways[idx] ? "line-through text-slate-500" : ""}>
                          {takeaway}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 4B Pillar Context */}
                <div className="bg-teal-900/5 p-5 rounded-xl border border-teal-800/15 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-teal-700" />
                      <span>Penyelarasan Pilar {hadith.contextualPillarLink?.pillar || "4B"}</span>
                    </h4>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {hadith.contextualPillarLink?.application}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-teal-200/70 text-xs flex items-center justify-between">
                    <span className="text-slate-600">Wilayah Sasaran:</span>
                    <span className="font-bold text-teal-900">Kecamatan Sematang Borang</span>
                  </div>
                </div>
              </div>

              {/* Personal Reflection Note Input */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <PenLine className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Catatan Refleksi & Doa Pribadi Anda Hari Ini</span>
                  </label>
                  {noteSavedFeedback && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Tersimpan di Perangkat
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={personalReflection}
                    onChange={(e) => setPersonalReflection(e.target.value)}
                    placeholder="Tuliskan komitmen atau doa Anda setelah membaca hadits ini..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-400"
                  />
                  <button
                    onClick={savePersonalNote}
                    className="px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan</span>
                  </button>
                </div>
              </div>

              {/* Quick Social Share Strip */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold">Sebarkan Kebaikan:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={shareToWhatsApp}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={shareToTwitter}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>X (Twitter)</span>
                  </button>

                  <button
                    onClick={shareToTelegram}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={handleCopyQuoteOnly}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300"
                  >
                    {copiedType === "quote" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kutipan Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kutipan</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyFullText}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-300"
                  >
                    {copiedType === "full" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Teks Lengkap Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Lengkap + Tadabbur</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Share Modal */}
      {showShareModal && hadith && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Bagikan Refleksi Hadits ke Media Sosial
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Visual Card Preview */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5 rounded-2xl space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-emerald-300">
                <span>HADITS HARIAN ISLAMICITY 4B</span>
                <span className="font-mono">{hadith.bookSource}</span>
              </div>
              <p className="font-serif text-right text-lg text-emerald-100 font-semibold dir-rtl">
                {hadith.hadithArabic}
              </p>
              <p className="text-xs italic text-slate-200">
                "{hadith.translation}"
              </p>
              <div className="pt-2 border-t border-emerald-800 text-[10px] text-emerald-300 flex justify-between">
                <span>HR. {hadith.narrator}</span>
                <span>abdi.sematangborangcity.cloud</span>
              </div>
            </div>

            {/* Formatted Text Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Teks Siap Bagikan (Formatted):</label>
              <textarea
                readOnly
                rows={6}
                value={getShareTextForSocial()}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed focus:outline-none select-all"
              />
            </div>

            {/* Direct Social Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={shareToWhatsApp}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>

              <button
                onClick={shareToTwitter}
                className="py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Twitter className="w-4 h-4" />
                X / Twitter
              </button>

              <button
                onClick={shareToTelegram}
                className="py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-4 h-4" />
                Telegram
              </button>

              <button
                onClick={shareToFacebook}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={handleCopyFullText}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 flex items-center gap-1.5 transition"
              >
                {copiedType === "full" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === "full" ? "Tersalin!" : "Salin ke Clipboard"}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
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
