import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Heart,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  Target,
  ArrowRight,
  Sun,
  Moon,
  Clock,
} from "lucide-react";
import { DailySpiritualReflection as ReflectionType } from "../types";

interface DailySpiritualReflectionCardProps {
  onOpenFullReflection?: () => void;
  onOpenDailyDhikr?: () => void;
  className?: string;
}

export default function DailySpiritualReflectionCard({
  onOpenFullReflection,
  onOpenDailyDhikr,
  className = "",
}: DailySpiritualReflectionCardProps) {
  const [reflection, setReflection] = useState<ReflectionType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // User's progress for today metrics
  const [userProgress, setUserProgress] = useState<{
    completedCount: number;
    targetCount: number;
    streakDays: number;
    percentage: number;
    morningDone: boolean;
    eveningDone: boolean;
  }>({
    completedCount: 0,
    targetCount: 100,
    streakDays: 3,
    percentage: 0,
    morningDone: false,
    eveningDone: false,
  });

  // Calculate user progress from localStorage
  const refreshUserProgress = () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const dailyCount = parseInt(
        localStorage.getItem(`islamicity_counter_daily_${todayStr}`) ||
          localStorage.getItem("islamicity_lifetime_dhikr_count") ||
          "0",
        10
      );
      const targetCount = parseInt(
        localStorage.getItem("islamicity_dhikr_daily_target") || "100",
        10
      );
      const streak = parseInt(localStorage.getItem("islamicity_streak_days") || "3", 10);
      const morningDone = localStorage.getItem(`islamicity_morning_done_${todayStr}`) === "true";
      const eveningDone = localStorage.getItem(`islamicity_evening_done_${todayStr}`) === "true";

      const percentage = Math.min(100, Math.round((dailyCount / targetCount) * 100));

      const progress = {
        completedCount: dailyCount,
        targetCount,
        streakDays: streak,
        percentage,
        morningDone,
        eveningDone,
      };
      setUserProgress(progress);
      return progress;
    } catch {
      return userProgress;
    }
  };

  // Fetch AI-generated reflection based on user progress
  const fetchProgressReflection = async (forcedRefresh = false) => {
    if (forcedRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    const currentProg = refreshUserProgress();
    const todayStr = new Date().toISOString().split("T")[0];
    const cacheKey = `islamicity_daily_reflection_card_${todayStr}`;

    // If not forced refresh, check cache first
    if (!forcedRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setReflection(parsed);
          setIsLoading(false);
          return;
        }
      } catch {}
    }

    // Determine appropriate spiritual theme based on daily progress
    let targetTheme = "Sabar & Ketenangan Batin";
    let moodDescription = "Mencari ketenangan dan kejernihan hati di awal hari.";

    if (currentProg.percentage >= 80) {
      targetTheme = "Syukur & Kemuliaan Dzikir";
      moodDescription = `Pengguna telah menuntaskan ${currentProg.completedCount} repetisi dzikir (${currentProg.percentage}% target tercapai). Berikan apresiasi spiritual thawab dan dorongan menjaga hati dari ujub.`;
    } else if (currentProg.percentage >= 40) {
      targetTheme = "Istiqomah & Keteguhan Hati";
      moodDescription = `Pengguna sedang dalam perjalanan ibadah hari ini, telah mencapai ${currentProg.completedCount}/${currentProg.targetCount} repetisi (${currentProg.percentage}%). Berikan penguatan untuk terus istiqomah.`;
    } else {
      targetTheme = "Memulai Hari dengan Bismillah & Niat Ikhlas";
      moodDescription = `Pengguna baru memulai aktivitas dzikir hari ini (${currentProg.completedCount} repetisi). Berikan motivasi pembuka fajar yang menyejukkan hati.`;
    }

    try {
      const res = await fetch("/api/gemini/spiritual-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: targetTheme,
          userMoodOrNeed: moodDescription,
          tone: "menyejukkan",
          sourcePreference: "all",
          userDailyProgress: currentProg,
        }),
      });

      const data = await res.json();
      setReflection(data);

      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {}
    } catch (err) {
      console.error("Failed to generate reflection:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgressReflection();
  }, []);

  // Text to Speech playback
  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser Anda tidak mendukung Web Speech Synthesis.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!reflection) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const speechText = `${reflection.title}. Dalil dari ${reflection.source}: ${reflection.translation}. Renungan hari ini: ${reflection.thought}. ${reflection.personalAffirmation}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.pitch = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Copy quote to clipboard
  const handleCopy = () => {
    if (!reflection) return;
    const shareText = `✨ *Daily Spiritual Reflection - Hikmah Hari Ini*
📖 ${reflection.source} (${reflection.sourceType})

"${reflection.arabic}"
_${reflection.translation}_

🕊️ *Tadabbur Relevan:*
${reflection.thought}

🌟 *Afirmasi:* "${reflection.personalAffirmation}"
ABDI Islamicity Kaffah (abdi.sematangborangcity.cloud)`;

    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      id="daily-spiritual-reflection-card"
      className={`bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 rounded-3xl p-5 sm:p-6 text-white border border-teal-500/40 shadow-xl relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute right-0 top-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/4 bottom-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* HEADER BAR: TITLE & PROGRESS STATUS */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Daily Spiritual Reflection
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-900/80 border border-teal-400/50 text-teal-200 font-semibold">
                AI Wisdom
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {reflection?.title || "Hikmah Spiritual Penguat Hati"}
            </h3>
          </div>
        </div>

        {/* Progress Context Pill & Collapse Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {/* User Progress Pill */}
          <div
            onClick={onOpenDailyDhikr}
            className="cursor-pointer bg-slate-900/80 px-3 py-1.5 rounded-xl border border-teal-700/60 flex items-center gap-2 text-xs hover:border-amber-400/60 transition"
            title="Klik untuk membuka Dzikir Harian"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 text-[11px]">Progres Hari Ini:</span>
            <span className="font-mono font-bold text-emerald-300 text-[11px]">
              {userProgress.completedCount} / {userProgress.targetCount}x ({userProgress.percentage}%)
            </span>
            {userProgress.streakDays > 0 && (
              <span className="flex items-center gap-0.5 text-amber-300 font-bold text-[10px] ml-1 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-600/40">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                {userProgress.streakDays}d
              </span>
            )}
          </div>

          {/* Refresh AI Wisdom Button */}
          <button
            onClick={() => fetchProgressReflection(true)}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-600/50 transition disabled:opacity-50"
            title="Segarkan Hikmah Baru Berdasarkan Progres Anda"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-300" : ""}`} />
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-teal-800/80 transition"
            title={isCollapsed ? "Buka Renungan" : "Sembunyikan Rincian"}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* CARD BODY CONTENT */}
      {!isCollapsed && (
        <div className="relative z-10 pt-4 space-y-4 animate-fade-in">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-teal-200">
                Menghubungkan dalil Al-Qur'an &amp; Hadits dengan capaian ibadah Anda hari ini...
              </p>
            </div>
          ) : reflection ? (
            <>
              {/* Dalil Callout Box */}
              <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-teal-700/60 space-y-3 shadow-inner">
                {/* Source Badge */}
                <div className="flex items-center justify-between gap-2 border-b border-teal-800/60 pb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-900/90 text-teal-200 border border-teal-500/50 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span>{reflection.sourceType}</span>
                  </span>

                  <span className="text-xs font-mono font-bold text-amber-300">
                    {reflection.source}
                  </span>
                </div>

                {/* Arabic Calligraphy */}
                <div className="text-right font-arabic text-xl sm:text-2xl leading-loose font-bold text-amber-200 pt-1">
                  {reflection.arabic}
                </div>

                {/* Latin Transliteration */}
                {reflection.latin && (
                  <p className="text-xs text-emerald-200/90 italic font-sans leading-relaxed">
                    {reflection.latin}
                  </p>
                )}

                {/* Translation */}
                <div className="text-xs sm:text-sm text-slate-100 leading-relaxed font-serif pt-1 border-t border-teal-800/40">
                  &ldquo;{reflection.translation}&rdquo;
                </div>
              </div>

              {/* Reflection Tadabbur & Practical Wisdom */}
              <div className="space-y-2 text-xs leading-relaxed text-teal-100/90 bg-emerald-950/40 p-4 rounded-2xl border border-emerald-600/30">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Tadabbur Relevan Hari Ini:
                </span>
                <p className="leading-relaxed">{reflection.thought}</p>
              </div>

              {/* Personal Affirmation & Daily Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                {reflection.personalAffirmation && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-teal-800/80 flex items-start gap-2.5">
                    <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Afirmasi Kalbu:
                      </span>
                      <p className="text-slate-200 italic font-medium mt-0.5">
                        &ldquo;{reflection.personalAffirmation}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {reflection.dailyAction && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-teal-800/80 flex items-start gap-2.5">
                    <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Latihan Jiwa Hari Ini:
                      </span>
                      <p className="text-slate-200 mt-0.5">
                        {reflection.dailyAction}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION TOOLBAR: AUDIO, COPY, FULL REFLECTION */}
              <div className="pt-2 border-t border-teal-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {/* Audio Listen Button */}
                  <button
                    onClick={toggleSpeech}
                    className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 font-bold ${
                      isSpeaking
                        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-2xs"
                        : "bg-slate-900/80 hover:bg-slate-800 text-teal-200 border-teal-700"
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Hentikan Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dengarkan Renungan</span>
                      </>
                    )}
                  </button>

                  {/* Copy Quote Button */}
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-teal-200 border border-teal-700 transition flex items-center gap-1.5 font-semibold"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Salin Hikmah</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Open Full Reflection Tab Button */}
                {onOpenFullReflection && (
                  <button
                    onClick={onOpenFullReflection}
                    className="text-amber-300 hover:text-white font-bold flex items-center gap-1 transition text-xs"
                  >
                    <span>Buka Refleksi Spiritual Penuh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
