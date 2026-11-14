import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sun,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  Search,
  Filter,
  Flame,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Award,
  Play,
  Pause,
  HelpCircle,
  Clock,
  Layers,
  Heart,
  Settings2,
  ArrowRight,
  Info,
  X,
  ExternalLink,
  BookOpen,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  CheckCheck,
  Repeat,
  Smartphone,
  Headphones,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DhikrItem, DhikrTimeOfDay, DhikrCategory, DhikrUserStats } from "../types";
import { RECOMMENDED_DHIKR_LIST, FREE_TASBIH_OPTIONS } from "../data/dhikrData";
import DhikrGamificationSection from "./DhikrGamificationSection";
import { evaluateDhikrBadges } from "../data/dhikrGamificationData";
import WeeklyConsistencyGraph from "./WeeklyConsistencyGraph";

// --- Audio Synthesizer (Zero External Assets Required) ---
class DhikrAudioEngine {
  private audioCtx: AudioContext | null = null;

  private initCtx() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  // Soft wooden tasbih bead click
  playTap() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(620, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Gentle milestone chime when reaching target
  playCompletion() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Praise Chord)
      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.08);
        osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.65);
      });
    } catch {
      // Audio fallback
    }
  }
}

const audioEngine = new DhikrAudioEngine();

interface DailyDhikrProps {
  onOpenKnowledgeCatalog?: (searchTag?: string) => void;
  onOpenSpiritualDigest?: () => void;
  onOpenDigitalCounter?: () => void;
  onOpenAudioPlayer?: () => void;
  onOpenSpiritualMilestones?: () => void;
}

export default function DailyDhikr({ onOpenKnowledgeCatalog, onOpenSpiritualDigest, onOpenDigitalCounter, onOpenAudioPlayer, onOpenSpiritualMilestones }: DailyDhikrProps) {
  // Current Date Key (YYYY-MM-DD)
  const getTodayKey = () => new Date().toISOString().split("T")[0];
  const [todayKey] = useState<string>(getTodayKey());

  // Determine current recommended time-of-day
  const currentHour = new Date().getHours();
  const defaultRecommendedTime: DhikrTimeOfDay =
    currentHour >= 4 && currentHour < 15 ? "morning" : "evening";

  // Tab Filtering: "morning" | "evening" | "both" | "free_tasbih" | "favorites" | "gamification"
  const [activeTab, setActiveTab] = useState<
    "morning" | "evening" | "all" | "free_tasbih" | "favorites" | "gamification"
  >(defaultRecommendedTime);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [fontSize, setFontSize] = useState<"standard" | "large" | "xlarge">("standard");
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("islamicity_dhikr_sound");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("islamicity_dhikr_vibrate");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [autoAdvance, setAutoAdvance] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("islamicity_dhikr_auto_advance");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Track counts per Dhikr item for today
  const [dhikrCounts, setDhikrCounts] = useState<{ [dhikrId: string]: number }>(() => {
    try {
      const saved = localStorage.getItem(`islamicity_dhikr_counts_${todayKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // User Stats & Bookmarks
  const [stats, setStats] = useState<DhikrUserStats>(() => {
    try {
      const saved = localStorage.getItem("islamicity_dhikr_user_stats");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      todayTotalCount: 0,
      lifetimeTotalCount: 348, // initial milestone
      completedMorning: false,
      completedEvening: false,
      currentStreakDays: 4,
      lastActiveDate: todayKey,
      favoriteDhikrIds: ["dhikr-01", "dhikr-03", "dhikr-10"],
      completedDhikrToday: {},
    };
  });

  // State for Focus Tasbih Modal
  const [focusedDhikrId, setFocusedDhikrId] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Free Tasbih State
  const [freeTasbihIndex, setFreeTasbihIndex] = useState<number>(0);
  const [freeTasbihCount, setFreeTasbihCount] = useState<number>(0);
  const [freeTasbihTarget, setFreeTasbihTarget] = useState<number>(33);
  const [freeTasbihLaps, setFreeTasbihLaps] = useState<number>(0);

  // Daily Repetitions Target Tracking (Motivational Progress Bar)
  const [dailyRepetitionTarget, setDailyRepetitionTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("islamicity_dhikr_daily_target_reps");
      return saved !== null ? parseInt(saved, 10) : 300;
    } catch {
      return 300;
    }
  });
  const [hasCelebratedDailyGoal, setHasCelebratedDailyGoal] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>("");
  const [showCustomTargetModal, setShowCustomTargetModal] = useState<boolean>(false);
  const [achievementCopied, setAchievementCopied] = useState<boolean>(false);
  const [showWeeklyGraph, setShowWeeklyGraph] = useState<boolean>(true);

  // Speech synthesis speaking state
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Audio Recitation Loop & Rhythm Assist State
  const [recitingId, setRecitingId] = useState<string | null>(null);
  const [isRecitingPlaying, setIsRecitingPlaying] = useState<boolean>(false);
  const [recitationLoopMode, setRecitationLoopMode] = useState<"target" | "continuous" | "single">("target");
  const [recitationCurrentLoop, setRecitationCurrentLoop] = useState<number>(1);
  const [recitationTempo, setRecitationTempo] = useState<number>(1.0); // 0.8: Tartil, 1.0: Normal, 1.2: Lancar
  const [autoCountWithAudio, setAutoCountWithAudio] = useState<boolean>(true);
  const [audioGuideExpandedId, setAudioGuideExpandedId] = useState<string | null>(null);

  // Audio & Timer Refs
  const recitationAudioRef = useRef<HTMLAudioElement | null>(null);
  const loopTimeoutRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync daily target to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("islamicity_dhikr_daily_target_reps", dailyRepetitionTarget.toString());
    } catch (e) {
      console.warn("Could not save dhikr daily target", e);
    }
  }, [dailyRepetitionTarget]);

  // Sync counts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`islamicity_dhikr_counts_${todayKey}`, JSON.stringify(dhikrCounts));
    } catch (e) {
      console.warn("Could not save dhikr counts", e);
    }
  }, [dhikrCounts, todayKey]);

  // Sync stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("islamicity_dhikr_user_stats", JSON.stringify(stats));
    } catch (e) {
      console.warn("Could not save dhikr stats", e);
    }
  }, [stats]);

  // Sync settings
  useEffect(() => {
    localStorage.setItem("islamicity_dhikr_sound", JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("islamicity_dhikr_vibrate", JSON.stringify(vibrateEnabled));
  }, [vibrateEnabled]);

  useEffect(() => {
    localStorage.setItem("islamicity_dhikr_auto_advance", JSON.stringify(autoAdvance));
  }, [autoAdvance]);

  // Trigger Haptic Feedback
  const triggerHaptic = (ms: number | number[] = 25) => {
    if (vibrateEnabled && typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // Filtered Dhikr List
  const filteredDhikr = useMemo(() => {
    return RECOMMENDED_DHIKR_LIST.filter((item) => {
      // Tab matching
      if (activeTab === "morning") {
        if (item.timeOfDay !== "morning" && item.timeOfDay !== "both") return false;
      } else if (activeTab === "evening") {
        if (item.timeOfDay !== "evening" && item.timeOfDay !== "both") return false;
      } else if (activeTab === "favorites") {
        if (!stats.favoriteDhikrIds.includes(item.id)) return false;
      }

      // Category matching
      if (selectedCategory !== "Semua" && item.category !== selectedCategory) {
        return false;
      }

      // Search matching
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSubtitle = item.subtitle?.toLowerCase().includes(query);
        const matchesLatin = item.latin.toLowerCase().includes(query);
        const matchesTrans = item.translation.toLowerCase().includes(query);
        const matchesFadhilah = item.fadhilah.toLowerCase().includes(query);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesSubtitle || matchesLatin || matchesTrans || matchesFadhilah || matchesTag;
      }

      return true;
    });
  }, [activeTab, selectedCategory, searchQuery, stats.favoriteDhikrIds]);

  // Completion calculation for Morning and Evening items
  const morningItems = useMemo(
    () => RECOMMENDED_DHIKR_LIST.filter((i) => i.timeOfDay === "morning" || i.timeOfDay === "both"),
    []
  );
  const eveningItems = useMemo(
    () => RECOMMENDED_DHIKR_LIST.filter((i) => i.timeOfDay === "evening" || i.timeOfDay === "both"),
    []
  );

  const completedMorningCount = morningItems.filter(
    (i) => (dhikrCounts[i.id] || 0) >= i.targetCount
  ).length;

  const completedEveningCount = eveningItems.filter(
    (i) => (dhikrCounts[i.id] || 0) >= i.targetCount
  ).length;

  // Repetition Target Analytics (Tracking Repetitions Completed against Targets)
  const morningTargetReps = useMemo(
    () => morningItems.reduce((acc, curr) => acc + curr.targetCount, 0),
    [morningItems]
  );
  const eveningTargetReps = useMemo(
    () => eveningItems.reduce((acc, curr) => acc + curr.targetCount, 0),
    [eveningItems]
  );
  const allSunnahTargetReps = useMemo(
    () => RECOMMENDED_DHIKR_LIST.reduce((acc, curr) => acc + curr.targetCount, 0),
    []
  );

  // Repetitions actually recited per session
  const morningDoneReps = useMemo(
    () => morningItems.reduce((acc, curr) => acc + (dhikrCounts[curr.id] || 0), 0),
    [morningItems, dhikrCounts]
  );
  const eveningDoneReps = useMemo(
    () => eveningItems.reduce((acc, curr) => acc + (dhikrCounts[curr.id] || 0), 0),
    [eveningItems, dhikrCounts]
  );

  // Total structured dhikr repetitions recited today
  const structuredTotalReps = useMemo(
    () => Object.values(dhikrCounts).reduce((acc: number, val: number) => acc + (val || 0), 0),
    [dhikrCounts]
  );

  // Total actual dhikr repetitions completed today (structured recitations + free tasbih count)
  const totalRepetitionsToday = useMemo(() => {
    return Math.max(stats.todayTotalCount, structuredTotalReps);
  }, [stats.todayTotalCount, structuredTotalReps]);

  // Gamification & Achievement Badges Evaluation
  const evaluatedBadges = useMemo(() => {
    return evaluateDhikrBadges(stats, {
      morningCompletedCount: completedMorningCount,
      eveningCompletedCount: completedEveningCount,
      totalMorningItems: morningItems.length,
      totalEveningItems: eveningItems.length,
      ayatKursiCount: dhikrCounts["dhikr-01"] || 0,
      sayyidulIstighfarCount: dhikrCounts["dhikr-03"] || 0,
      audioPracticeCount: stats.audioPracticeCount || 0,
      freeTasbihLaps: freeTasbihLaps,
      todayRepetitions: totalRepetitionsToday,
    });
  }, [
    stats,
    completedMorningCount,
    completedEveningCount,
    morningItems.length,
    eveningItems.length,
    dhikrCounts,
    freeTasbihLaps,
    totalRepetitionsToday,
  ]);

  const unlockedBadgeCount = useMemo(() => {
    return evaluatedBadges.filter((b) => b.isUnlocked).length;
  }, [evaluatedBadges]);

  // Demo simulation handlers for user testing of streak & achievements
  const handleSimulateStreakIncrement = () => {
    setStats((prev) => ({
      ...prev,
      currentStreakDays: prev.currentStreakDays + 1,
    }));
  };

  const handleSimulateCompleteMorning = () => {
    const newCounts = { ...dhikrCounts };
    morningItems.forEach((item) => {
      newCounts[item.id] = item.targetCount;
    });
    setDhikrCounts(newCounts);
    setStats((prev) => ({
      ...prev,
      completedMorning: true,
      todayTotalCount: Math.max(prev.todayTotalCount, morningTargetReps),
    }));
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#3b82f6"],
      });
    } catch {}
  };

  const handleSimulateResetForDemo = () => {
    setStats((prev) => ({
      ...prev,
      currentStreakDays: 3,
      completedMorning: false,
      completedEvening: false,
    }));
  };

  // Overall percentage towards daily repetition target (capped at 100% for progress bar width)
  const dailyProgressPct = useMemo(() => {
    if (dailyRepetitionTarget <= 0) return 100;
    return Math.min(100, Math.round((totalRepetitionsToday / dailyRepetitionTarget) * 100));
  }, [totalRepetitionsToday, dailyRepetitionTarget]);

  // True percentage (can exceed 100% for extra badge recognition)
  const rawProgressPct = useMemo(() => {
    if (dailyRepetitionTarget <= 0) return 100;
    return Math.round((totalRepetitionsToday / dailyRepetitionTarget) * 100);
  }, [totalRepetitionsToday, dailyRepetitionTarget]);

  const isDailyTargetAchieved = totalRepetitionsToday >= dailyRepetitionTarget && dailyRepetitionTarget > 0;
  const remainingRepsToTarget = Math.max(0, dailyRepetitionTarget - totalRepetitionsToday);
  const surplusReps = Math.max(0, totalRepetitionsToday - dailyRepetitionTarget);

  // Motivational Wisdom & Encouragement Tier
  const motivationTier = useMemo(() => {
    if (rawProgressPct >= 100) {
      return {
        level: "Tuntas Kaffah",
        title: "Target Harian Tercapai Kaffah!",
        quote: "Maa Syaa Allah! 'Dan orang-orang yang banyak mengingat Allah, Allah sediakan bagi mereka ampunan dan pahala yang besar.' (QS. Al-Ahzab: 35)",
        advice: `Target ${dailyRepetitionTarget}x repetisi telah Anda tuntaskan (${totalRepetitionsToday}x). Setiap tasbih tambahan adalah bekal pemberat timbangan mizan!`,
        theme: "emerald",
        badgeBg: "bg-emerald-600 text-white",
      };
    } else if (rawProgressPct >= 75) {
      return {
        level: "Menuju Puncak",
        title: "Hampir Sempurna Menuju Target!",
        quote: "'Dua kalimat yang ringan di lisan, berat di timbangan, dan dicintai Ar-Rahman: Subhanallahi wa bihamdih, Subhanallahil 'Azhim.' (HR. Bukhari)",
        advice: `Hanya tersisa ${remainingRepsToTarget} repetisi lagi untuk menuntaskan target hari ini. Terus basahi lisan dengan tasbih!`,
        theme: "teal",
        badgeBg: "bg-teal-600 text-white",
      };
    } else if (rawProgressPct >= 50) {
      return {
        level: "Separuh Target",
        title: "Separuh Target Harian Terlampaui!",
        quote: "'Amalan yang paling dicintai Allah adalah amalan yang kontinu (istiqomah) walaupun sedikit.' (HR. Bukhari & Muslim)",
        advice: `Alhamdulillah! Sudah ${totalRepetitionsToday} repetisi terselesaikan. Lanjutkan dengan dzikir petang atau wirid tasbih.`,
        theme: "amber",
        badgeBg: "bg-amber-500 text-slate-950 font-bold",
      };
    } else if (rawProgressPct >= 25) {
      return {
        level: "Langkah Awal",
        title: "Langkah Awal yang Barakah!",
        quote: "'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.' (QS. Ar-Ra'd: 28)",
        advice: `Bagus sekali! Selesaikan ${remainingRepsToTarget} repetisi lagi menuju target harian Anda untuk menjaga keistiqomahan.`,
        theme: "blue",
        badgeBg: "bg-sky-600 text-white",
      };
    } else {
      return {
        level: "Mulai Dzikir",
        title: "Awali Hari dengan Dzikrullah",
        quote: "'Wahai orang-orang yang beriman! Ingatlah Allah dengan dzikir sebanyak-banyaknya.' (QS. Al-Ahzab: 41)",
        advice: "Pilih wirid pagi atau petang di bawah dan mulailah menghitung tasbih untuk mengisi kemajuan hari ini.",
        theme: "slate",
        badgeBg: "bg-slate-700 text-white",
      };
    }
  }, [rawProgressPct, dailyRepetitionTarget, totalRepetitionsToday, remainingRepsToTarget]);

  // Trigger celebration once daily target is met
  useEffect(() => {
    if (
      totalRepetitionsToday >= dailyRepetitionTarget &&
      dailyRepetitionTarget > 0 &&
      !hasCelebratedDailyGoal
    ) {
      setHasCelebratedDailyGoal(true);
      if (soundEnabled) audioEngine.playCompletion();
      triggerConfetti("Maa Syaa Allah! Target Repetisi Dzikir Harian Anda Telah Tercapai!");
    }
  }, [totalRepetitionsToday, dailyRepetitionTarget, hasCelebratedDailyGoal, soundEnabled]);

  // Handle Count Increment
  const handleIncrement = (item: DhikrItem) => {
    const current = dhikrCounts[item.id] || 0;
    const nextCount = current + 1;

    if (soundEnabled) {
      audioEngine.playTap();
    }
    triggerHaptic(20);

    setDhikrCounts((prev) => ({
      ...prev,
      [item.id]: nextCount,
    }));

    // Increment overall stats
    setStats((prev) => ({
      ...prev,
      todayTotalCount: prev.todayTotalCount + 1,
      lifetimeTotalCount: prev.lifetimeTotalCount + 1,
    }));

    // Reached target
    if (nextCount === item.targetCount) {
      if (soundEnabled) {
        audioEngine.playCompletion();
      }
      triggerHaptic([40, 60, 80]);

      // Check if full session is completed
      if (item.timeOfDay === "morning" || item.timeOfDay === "both") {
        if (completedMorningCount + 1 === morningItems.length) {
          triggerConfetti("Selamat! Anda telah menuntaskan Dzikir Pagi hari ini secara sempurna!");
          setStats((prev) => ({ ...prev, completedMorning: true }));
        }
      }
      if (item.timeOfDay === "evening" || item.timeOfDay === "both") {
        if (completedEveningCount + 1 === eveningItems.length) {
          triggerConfetti("Maa Syaa Allah! Rangkaian Dzikir Petang tuntas sempurna!");
          setStats((prev) => ({ ...prev, completedEvening: true }));
        }
      }

      // Auto Advance to next in focused mode
      if (autoAdvance && focusedDhikrId) {
        setTimeout(() => {
          advanceToNextDhikr(item.id);
        }, 600);
      }
    }
  };

  // Handle Decrement
  const handleDecrement = (itemId: string) => {
    setDhikrCounts((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        [itemId]: current - 1,
      };
    });
    setStats((prev) => ({
      ...prev,
      todayTotalCount: Math.max(0, prev.todayTotalCount - 1),
    }));
  };

  // Reset single item
  const handleResetItem = (itemId: string) => {
    const current = dhikrCounts[itemId] || 0;
    setDhikrCounts((prev) => ({
      ...prev,
      [itemId]: 0,
    }));
    setStats((prev) => ({
      ...prev,
      todayTotalCount: Math.max(0, prev.todayTotalCount - current),
    }));
  };

  // Max out (Mark as complete)
  const handleCompleteItem = (item: DhikrItem) => {
    const current = dhikrCounts[item.id] || 0;
    const diff = Math.max(0, item.targetCount - current);
    setDhikrCounts((prev) => ({
      ...prev,
      [item.id]: item.targetCount,
    }));
    if (diff > 0) {
      setStats((prev) => ({
        ...prev,
        todayTotalCount: prev.todayTotalCount + diff,
        lifetimeTotalCount: prev.lifetimeTotalCount + diff,
      }));
    }
    if (soundEnabled) {
      audioEngine.playCompletion();
    }
    triggerHaptic(50);
  };

  // --- High-Quality Audio Recitation Loop & Rhythm Assistance Engine ---
  const stopRecitationLoop = () => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    if (recitationAudioRef.current) {
      recitationAudioRef.current.pause();
      recitationAudioRef.current.currentTime = 0;
      recitationAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsRecitingPlaying(false);
    setRecitingId(null);
    setRecitationCurrentLoop(1);
  };

  // Web Speech API fallback tuned for authentic Arabic pronunciation & rhythmic pacing
  const fallbackSpeechRecitation = (item: DhikrItem, onPassComplete: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      loopTimeoutRef.current = setTimeout(() => {
        onPassComplete();
      }, 3500);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean Arabic text for optimal pronunciation clarity
      const cleanArabic = item.arabic
        .replace(/\([٠-٩0-9xX\s]+\)/g, "")
        .replace(/\.{2,}/g, " ")
        .replace(/[ـ]/g, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanArabic);
      currentUtteranceRef.current = utterance;

      // Select Arabic voice if installed on system
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (v) =>
          v.lang.startsWith("ar") ||
          v.lang.toLowerCase().includes("arabic") ||
          v.name.toLowerCase().includes("arabic") ||
          v.name.toLowerCase().includes("maged") ||
          v.name.toLowerCase().includes("tarik") ||
          v.name.toLowerCase().includes("laila")
      );

      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
      utterance.lang = "ar-SA";

      // Rate tuned to selected rhythm tempo for clear tartil recitation
      utterance.rate =
        recitationTempo === 0.8
          ? 0.72 // Tartil khusyuk: gentle and slow
          : recitationTempo === 1.2
          ? 1.02 // Lancar: swifter pace
          : 0.85; // Standard: balanced natural rhythm
      utterance.pitch = 0.95;

      utterance.onend = () => {
        onPassComplete();
      };

      utterance.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") return;
        onPassComplete();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      loopTimeoutRef.current = setTimeout(() => {
        onPassComplete();
      }, 3500);
    }
  };

  // Execute a single step/loop of recitation
  const executeRecitationStep = (item: DhikrItem, loopNum: number) => {
    setRecitingId(item.id);
    setIsRecitingPlaying(true);
    setRecitationCurrentLoop(loopNum);

    const handlePassCompleted = () => {
      // 1. Auto increment dhikr count if sync is turned on
      if (autoCountWithAudio) {
        handleIncrement(item);
      } else {
        triggerHaptic(20);
      }

      // 2. Check if loop target completed
      const shouldStop =
        recitationLoopMode === "single" ||
        (recitationLoopMode === "target" && loopNum >= item.targetCount);

      if (shouldStop) {
        setIsRecitingPlaying(false);
        setRecitingId(null);
        setRecitationCurrentLoop(1);
        if (soundEnabled) {
          audioEngine.playCompletion();
        }
        triggerHaptic([40, 60, 80]);
        return;
      }

      // 3. Gentle rhythm pause between repetitions (1400ms breath space)
      if (soundEnabled) {
        audioEngine.playTap();
      }

      loopTimeoutRef.current = setTimeout(() => {
        executeRecitationStep(item, loopNum + 1);
      }, 1400);
    };

    // If item has authentic audioUrl, play authentic recitation
    if (item.audioUrl) {
      try {
        const audio = new Audio(item.audioUrl);
        recitationAudioRef.current = audio;
        audio.playbackRate = recitationTempo;
        audio.onended = () => {
          handlePassCompleted();
        };
        audio.onerror = () => {
          fallbackSpeechRecitation(item, handlePassCompleted);
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            fallbackSpeechRecitation(item, handlePassCompleted);
          });
        }
        return;
      } catch {
        fallbackSpeechRecitation(item, handlePassCompleted);
        return;
      }
    }

    fallbackSpeechRecitation(item, handlePassCompleted);
  };

  // Toggle recitation loop play / pause
  const handleToggleRecitation = (item: DhikrItem) => {
    if (recitingId === item.id && isRecitingPlaying) {
      stopRecitationLoop();
    } else {
      stopRecitationLoop();
      setStats((prev) => ({
        ...prev,
        audioPracticeCount: (prev.audioPracticeCount || 0) + 1,
      }));
      executeRecitationStep(item, 1);
    }
  };

  // Pre-fetch voices on mount and cleanup on unmount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      stopRecitationLoop();
    };
  }, []);

  // Share or copy achievement text
  const handleCopyAchievement = () => {
    const text = `🌟 Capaian Dzikir Harian ABDI Islamicity 4B Kaffah\n📅 Tanggal: ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n🎯 Target Harian: ${dailyRepetitionTarget} Repetisi\n📿 Repetisi Tuntas: ${totalRepetitionsToday}x (${rawProgressPct}%)\n🔥 Istiqomah: ${stats.currentStreakDays} Hari Berturut-turut\n\n"Perumpamaan orang yang berdzikir kepada Rabbnya dengan yang tidak, seperti orang hidup dengan orang mati." (HR. Al-Bukhari)`;
    navigator.clipboard.writeText(text);
    setAchievementCopied(true);
    setTimeout(() => setAchievementCopied(false), 2500);
  };

  // Toggle Favorite
  const toggleFavorite = (itemId: string) => {
    setStats((prev) => {
      const exists = prev.favoriteDhikrIds.includes(itemId);
      const updated = exists
        ? prev.favoriteDhikrIds.filter((id) => id !== itemId)
        : [...prev.favoriteDhikrIds, itemId];
      return {
        ...prev,
        favoriteDhikrIds: updated,
      };
    });
  };

  // Copy Dhikr Content
  const handleCopyDhikr = (item: DhikrItem) => {
    const text = `📿 ${item.title}\n\n${item.arabic}\n\nLatin:\n${item.latin}\n\nTerjemahan:\n"${item.translation}"\n\nFadhilah:\n${item.fadhilah}\n\nSumber: ${item.source} (${item.sanadGrade})\n\nDisajikan melalui ABDI Islamicity 4B Kaffah (abdi.sematangborangcity.cloud)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Confetti helper
  const triggerConfetti = (message?: string) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#059669", "#34d399", "#fbbf24", "#f59e0b"],
      });
      if (message) {
        console.log(message);
      }
    } catch {
      // fallback
    }
  };

  // Advance to next dhikr in focused mode
  const advanceToNextDhikr = (currentId: string) => {
    const currentIndex = filteredDhikr.findIndex((i) => i.id === currentId);
    if (currentIndex !== -1 && currentIndex < filteredDhikr.length - 1) {
      setFocusedDhikrId(filteredDhikr[currentIndex + 1].id);
    }
  };

  // Move to previous dhikr in focused mode
  const moveToPrevDhikr = (currentId: string) => {
    const currentIndex = filteredDhikr.findIndex((i) => i.id === currentId);
    if (currentIndex > 0) {
      setFocusedDhikrId(filteredDhikr[currentIndex - 1].id);
    }
  };

  // Free Tasbih Handlers
  const handleFreeTasbihTap = () => {
    if (soundEnabled) audioEngine.playTap();
    triggerHaptic(20);

    const next = freeTasbihCount + 1;
    setFreeTasbihCount(next);

    setStats((prev) => ({
      ...prev,
      todayTotalCount: prev.todayTotalCount + 1,
      lifetimeTotalCount: prev.lifetimeTotalCount + 1,
    }));

    if (freeTasbihTarget > 0 && next >= freeTasbihTarget) {
      if (soundEnabled) audioEngine.playCompletion();
      triggerHaptic([40, 50, 80]);
      setFreeTasbihLaps((l) => l + 1);
      setFreeTasbihCount(0);
    }
  };

  const handleResetFreeTasbih = () => {
    setFreeTasbihCount(0);
    setFreeTasbihLaps(0);
  };

  // Speech Synthesis helper
  const handleToggleSpeak = (item: DhikrItem) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Fitur suara Text-to-Speech tidak didukung oleh browser ini.");
      return;
    }

    if (speakingId === item.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${item.title}. ${item.latin}. Artinya: ${item.translation}. Fadhilah: ${item.fadhilah}`
    );
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(item.id);
    window.speechSynthesis.speak(utterance);
  };

  // Reset entire day's session
  const handleResetDaySession = () => {
    if (window.confirm("Apakah Anda yakin ingin menyetel ulang seluruh progres dzikir hari ini ke 0?")) {
      setDhikrCounts({});
      localStorage.removeItem(`islamicity_dhikr_counts_${todayKey}`);
      setStats((prev) => ({
        ...prev,
        todayTotalCount: 0,
      }));
      setHasCelebratedDailyGoal(false);
    }
  };

  // Active focused item object
  const focusedItem = useMemo(() => {
    if (!focusedDhikrId) return null;
    return RECOMMENDED_DHIKR_LIST.find((i) => i.id === focusedDhikrId) || null;
  }, [focusedDhikrId]);

  return (
    <div id="daily-dhikr-module" className="space-y-6">
      {/* Pillar Integration Top Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 rounded-2xl p-6 sm:p-7 text-white border border-emerald-700/60 shadow-xl relative overflow-hidden">
        {/* Soft Background Islamic Geometry Accent */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>PILAR 1 : BERDAKWAH • TAZKIYATUN NAFS & DZIKIR AS-SUNNAH</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Dzikir Harian & Tasbih Digital Kaffah
            </h2>

            <p className="text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              Panduan dzikir pagi dan petang shahih bersumber dari Rasulullah SAW dilengkapi tasbih digital interaktif,
              transliterasi, audio lafal, sanad terverifikasi, dan pelacak istiqomah harian warga Sematang Borang.
            </p>

            {/* Time recommendation status */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold ${
                  defaultRecommendedTime === "morning"
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-indigo-400/20 text-indigo-300 border border-indigo-400/30"
                }`}
              >
                {defaultRecommendedTime === "morning" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    Waktu Utama: Dzikir Pagi (Fajar s/d Dzuhur)
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-300" />
                    Waktu Utama: Dzikir Petang (Ashar s/d Isya)
                  </>
                )}
              </span>

              <span className="text-emerald-300/80 flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3 h-3" />
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </span>
            </div>
          </div>

          {/* Quick Metrics Header Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 bg-emerald-950/70 p-4 rounded-xl border border-emerald-700/60 backdrop-blur-sm lg:min-w-[320px]">
            <div className="space-y-0.5">
              <div className="text-[11px] text-emerald-300/80 font-medium flex items-center justify-between">
                <span>Repetisi Hari Ini</span>
                <span className="text-[10px] text-amber-300 font-mono font-bold">{rawProgressPct}%</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {totalRepetitionsToday.toLocaleString("id-ID")}
                <span className="text-xs text-emerald-200 font-normal ml-1">/ {dailyRepetitionTarget}x</span>
              </div>
              <div className="w-full bg-emerald-900 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyProgressPct}%` }}
                ></div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("gamification")}
              className="space-y-0.5 cursor-pointer group hover:bg-emerald-900/50 p-1.5 rounded-lg transition"
              title="Buka Bagian Gamifikasi & Lencana Pencapaian"
            >
              <div className="text-[11px] text-emerald-300/80 font-medium flex items-center justify-between">
                <span>Istiqomah Streak</span>
                <span className="text-[10px] text-amber-300 group-hover:underline font-bold flex items-center gap-0.5">
                  Lencana &rarr;
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono flex items-center gap-1">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                {stats.currentStreakDays} Hari
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>{unlockedBadgeCount} Lencana Diraih</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] text-emerald-300/80 font-medium flex items-center justify-between">
                <span>Sesi Pagi</span>
                <span className="text-[10px] text-amber-300 font-mono">
                  {Math.round((morningDoneReps / Math.max(1, morningTargetReps)) * 100)}%
                </span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {morningDoneReps} / {morningTargetReps} <span className="text-[10px] font-normal text-emerald-300">rep</span>
              </div>
              <div className="w-full bg-emerald-900 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (morningDoneReps / Math.max(1, morningTargetReps)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] text-emerald-300/80 font-medium flex items-center justify-between">
                <span>Sesi Petang</span>
                <span className="text-[10px] text-teal-300 font-mono">
                  {Math.round((eveningDoneReps / Math.max(1, eveningTargetReps)) * 100)}%
                </span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {eveningDoneReps} / {eveningTargetReps} <span className="text-[10px] font-normal text-emerald-300">rep</span>
              </div>
              <div className="w-full bg-emerald-900 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-teal-400 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (eveningDoneReps / Math.max(1, eveningTargetReps)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Tab Navigation & Preferences */}
        <div className="mt-6 pt-5 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-emerald-950/80 p-1.5 rounded-xl border border-emerald-700/60">
            <button
              id="subtab-dhikr-morning"
              onClick={() => setActiveTab("morning")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "morning"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Dzikir Pagi ({completedMorningCount}/{morningItems.length})
            </button>

            <button
              id="subtab-dhikr-evening"
              onClick={() => setActiveTab("evening")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "evening"
                  ? "bg-teal-400 text-slate-950 shadow-md"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dzikir Petang ({completedEveningCount}/{eveningItems.length})
            </button>

            <button
              id="subtab-dhikr-all"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "all"
                  ? "bg-emerald-400 text-slate-950 shadow-md"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Semua ({RECOMMENDED_DHIKR_LIST.length})
            </button>

            <button
              id="subtab-dhikr-free-tasbih"
              onClick={() => setActiveTab("free_tasbih")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "free_tasbih"
                  ? "bg-emerald-300 text-slate-950 shadow-md"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tasbih Bebas
            </button>

            <button
              id="subtab-dhikr-favorites"
              onClick={() => setActiveTab("favorites")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "favorites"
                  ? "bg-amber-300 text-slate-950 shadow-md"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Favorit ({stats.favoriteDhikrIds.length})
            </button>

            <button
              id="subtab-dhikr-gamification"
              onClick={() => setActiveTab("gamification")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "gamification"
                  ? "bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300/50"
                  : "text-amber-300 hover:text-white hover:bg-emerald-800/60"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Gamifikasi & Lencana ({unlockedBadgeCount}/{evaluatedBadges.length})
            </button>
          </div>

          {/* Quick Settings Toggles */}
          <div className="flex items-center gap-2">
            {onOpenAudioPlayer && (
              <button
                onClick={onOpenAudioPlayer}
                title="Buka Lantunan & Loop Audio Menenangkan"
                className="p-2 rounded-lg text-xs border border-teal-400/60 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 transition flex items-center gap-1.5 font-bold shadow-2xs"
              >
                <Headphones className="w-4 h-4 text-teal-300" />
                <span className="hidden sm:inline text-[11px]">Audio Loop</span>
              </button>
            )}

            {onOpenDigitalCounter && (
              <button
                onClick={onOpenDigitalCounter}
                title="Buka Tasbih Digital Haptic & Target Sesi Presisi"
                className="p-2 rounded-lg text-xs border border-emerald-400/60 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 transition flex items-center gap-1.5 font-bold shadow-2xs"
              >
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline text-[11px]">Tasbih Haptic</span>
              </button>
            )}

            {onOpenSpiritualMilestones && (
              <button
                onClick={onOpenSpiritualMilestones}
                title="Buka Spiritual Milestones & Lencana Digital"
                className="p-2 rounded-lg text-xs border border-amber-400/60 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition flex items-center gap-1.5 font-bold shadow-2xs"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Milestones</span>
              </button>
            )}

            {onOpenSpiritualDigest && (
              <button
                onClick={onOpenSpiritualDigest}
                title="Buka Weekly Spiritual Digest & Jurnal Dzikir"
                className="p-2 rounded-lg text-xs border border-amber-400/60 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition flex items-center gap-1.5 font-bold shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Spiritual Digest (AI)</span>
              </button>
            )}

            <button
              onClick={() => setShowWeeklyGraph(!showWeeklyGraph)}
              title={showWeeklyGraph ? "Sembunyikan Grafik Konsistensi" : "Tampilkan Grafik Konsistensi 7 Hari"}
              className={`p-2 rounded-lg text-xs border transition flex items-center gap-1.5 ${
                showWeeklyGraph
                  ? "bg-emerald-800 text-emerald-200 border-emerald-600 font-bold shadow-2xs"
                  : "bg-emerald-950/60 text-slate-300 border-emerald-800 hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline text-[11px]">{showWeeklyGraph ? "Grafik 7-Hari" : "Grafik"}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Suara Efek Aktif" : "Suara Efek Dimatikan"}
              className={`p-2 rounded-lg text-xs border transition flex items-center gap-1.5 ${
                soundEnabled
                  ? "bg-emerald-800 text-emerald-200 border-emerald-600"
                  : "bg-emerald-950/60 text-slate-400 border-emerald-800"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline text-[11px]">{soundEnabled ? "Audio On" : "Audio Off"}</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg text-xs bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition flex items-center gap-1.5"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Tampilan</span>
            </button>

            <button
              onClick={handleResetDaySession}
              title="Reset hitungan hari ini"
              className="p-2 rounded-lg text-xs bg-emerald-900/80 hover:bg-red-950/60 hover:text-red-300 text-emerald-200 border border-emerald-700/60 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset Sesi</span>
            </button>
          </div>
        </div>
      </div>

      {/* MASTER VISUAL PROGRESS BAR & MOTIVATION HUB */}
      <div
        id="dhikr-daily-target-progress-hub"
        className="bg-white rounded-2xl border border-emerald-200/90 p-5 sm:p-6 shadow-sm space-y-5 relative overflow-hidden"
      >
        {/* Subtle decorative background Islamic glow */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Header: Title, Current Status Badge & Target Presets */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shadow-xs">
                <Target className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  Pelacak Target Repetisi Dzikir Harian
                  {isDailyTargetAchieved && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      Target Tuntas Sempurna!
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau total repetisi lafal tasbih & wirid yang telah Anda selesaikan hari ini terhadap target istiqomah.
                </p>
              </div>
            </div>
          </div>

          {/* Target Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Target:
            </span>
            {[
              { label: "250x Sunnah", value: 250 },
              { label: "300x Harian", value: 300 },
              { label: "500x Istiqomah", value: 500 },
              { label: "1.000x Utama", value: 1000 },
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setDailyRepetitionTarget(preset.value);
                  triggerHaptic(15);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  dailyRepetitionTarget === preset.value
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => {
                setShowCustomTargetModal(true);
                setCustomTargetInput(dailyRepetitionTarget.toString());
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                ![250, 300, 500, 1000].includes(dailyRepetitionTarget)
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              {![250, 300, 500, 1000].includes(dailyRepetitionTarget)
                ? `${dailyRepetitionTarget}x (Kustom)`
                : "⚙️ Kustom"}
            </button>
          </div>
        </div>

        {/* Big Counter & Percentage Badge */}
        <div className="relative z-10 flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {totalRepetitionsToday.toLocaleString("id-ID")}
            </span>
            <span className="text-sm font-semibold text-slate-500 font-mono">
              / {dailyRepetitionTarget.toLocaleString("id-ID")} Repetisi Dzikir
            </span>
            {surplusReps > 0 && (
              <span className="ml-1 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                +{surplusReps} Bonus Istiqomah
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black font-mono shadow-xs flex items-center gap-1.5 ${
                rawProgressPct >= 100
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  : rawProgressPct >= 50
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {rawProgressPct}% Target Tercapai
            </span>

            {isDailyTargetAchieved && (
              <button
                onClick={() => {
                  triggerConfetti("Alhamdulillah! Target Dzikir Tercapai!");
                  if (soundEnabled) audioEngine.playCompletion();
                }}
                className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition text-sm shadow-xs"
                title="Rayakan Capaian Target dengan Konfeti!"
              >
                🎉
              </button>
            )}
          </div>
        </div>

        {/* THE VISUAL PROGRESS BAR WITH MILESTONES */}
        <div className="relative z-10 space-y-2">
          {/* Progress track */}
          <div className="h-6 sm:h-7 bg-slate-100 rounded-full p-1 border border-slate-200/90 relative overflow-hidden shadow-inner">
            {/* Background Milestone Ticks */}
            <div className="absolute inset-0 flex items-center justify-between px-[25%] pointer-events-none">
              <div className="w-px h-full bg-slate-300/80"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-[50%] pointer-events-none">
              <div className="w-px h-full bg-slate-300/80"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-[75%] pointer-events-none">
              <div className="w-px h-full bg-slate-300/80"></div>
            </div>

            {/* Animated Gradient Fill */}
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out relative shadow-xs ${
                rawProgressPct >= 100
                  ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400"
                  : "bg-gradient-to-r from-emerald-600 to-teal-500"
              }`}
              style={{ width: `${dailyProgressPct}%` }}
            >
              {/* Subtle inner shimmer */}
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
              {dailyProgressPct > 3 && (
                <div className="w-3 h-3 bg-white rounded-full shadow-md absolute right-1 top-1/2 -translate-y-1/2 border border-slate-200"></div>
              )}
            </div>
          </div>

          {/* Milestone Checkpoint Labels */}
          <div className="grid grid-cols-4 text-center pt-1 text-[11px] font-mono">
            <div className="flex flex-col items-center">
              <span
                className={`font-semibold flex items-center gap-1 ${
                  rawProgressPct >= 25 ? "text-emerald-700 font-bold" : "text-slate-400"
                }`}
              >
                {rawProgressPct >= 25 ? <Check className="w-3 h-3 text-emerald-600" /> : "•"}
                25% Fajar
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Awali Pagi</span>
            </div>

            <div className="flex flex-col items-center">
              <span
                className={`font-semibold flex items-center gap-1 ${
                  rawProgressPct >= 50 ? "text-emerald-700 font-bold" : "text-slate-400"
                }`}
              >
                {rawProgressPct >= 50 ? <Check className="w-3 h-3 text-emerald-600" /> : "•"}
                50% Dhuha
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Separuh Target</span>
            </div>

            <div className="flex flex-col items-center">
              <span
                className={`font-semibold flex items-center gap-1 ${
                  rawProgressPct >= 75 ? "text-emerald-700 font-bold" : "text-slate-400"
                }`}
              >
                {rawProgressPct >= 75 ? <Check className="w-3 h-3 text-emerald-600" /> : "•"}
                75% Ashar
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Menjelang Petang</span>
            </div>

            <div className="flex flex-col items-center">
              <span
                className={`font-semibold flex items-center gap-1 ${
                  rawProgressPct >= 100 ? "text-amber-600 font-bold" : "text-slate-400"
                }`}
              >
                {rawProgressPct >= 100 ? <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" /> : "•"}
                100% Kaffah
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Target Selesai</span>
            </div>
          </div>
        </div>

        {/* MOTIVATIONAL FEEDBACK & HADITH WISDOM BOX */}
        <div className="relative z-10 bg-slate-50 rounded-xl p-4 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${motivationTier.badgeBg}`}>
                  {motivationTier.level}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {motivationTier.title}
                </span>
              </div>
              <p className="text-xs text-slate-700 italic font-serif">
                "{motivationTier.quote}"
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {motivationTier.advice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={handleCopyAchievement}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Salin capaian repetisi dzikir untuk motivasi keluarga / grup jamaah"
            >
              {achievementCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bagikan Capaian</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4-COLUMN BREAKDOWN CARDS */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Card 1: Sesi Pagi */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-600" /> Dzikir Pagi
              </span>
              <span className="font-mono text-amber-800 text-[11px] font-bold">
                {Math.round((morningDoneReps / Math.max(1, morningTargetReps)) * 100)}%
              </span>
            </div>
            <div className="text-lg font-black text-amber-950 font-mono">
              {morningDoneReps}{" "}
              <span className="text-xs font-normal text-amber-800">/ {morningTargetReps} rep</span>
            </div>
            <div className="w-full bg-amber-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (morningDoneReps / Math.max(1, morningTargetReps)) * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Card 2: Sesi Petang */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/70 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-900 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-teal-600" /> Dzikir Petang
              </span>
              <span className="font-mono text-teal-800 text-[11px] font-bold">
                {Math.round((eveningDoneReps / Math.max(1, eveningTargetReps)) * 100)}%
              </span>
            </div>
            <div className="text-lg font-black text-teal-950 font-mono">
              {eveningDoneReps}{" "}
              <span className="text-xs font-normal text-teal-800">/ {eveningTargetReps} rep</span>
            </div>
            <div className="w-full bg-teal-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (eveningDoneReps / Math.max(1, eveningTargetReps)) * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Card 3: Tasbih Bebas / Ekstra */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> Tasbih Bebas
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                Ekstra
              </span>
            </div>
            <div className="text-lg font-black text-emerald-950 font-mono">
              {Math.max(0, totalRepetitionsToday - (morningDoneReps + eveningDoneReps))}{" "}
              <span className="text-xs font-normal text-emerald-800">repetisi</span>
            </div>
            <p className="text-[10px] text-emerald-700">Wirid bakda shalat & mandiri</p>
          </div>

          {/* Card 4: Sisa Menuju Target */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Status Target
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {stats.currentStreakDays} Hari
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-mono truncate">
              {remainingRepsToTarget > 0 ? (
                <>
                  {remainingRepsToTarget}{" "}
                  <span className="text-xs font-normal text-slate-500">lagi</span>
                </>
              ) : (
                <span className="text-emerald-700 text-sm font-bold flex items-center gap-1">
                  <CheckCheck className="w-4 h-4 text-emerald-600" /> Tercapai Kaffah
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              {remainingRepsToTarget > 0 ? "Menuju 100% hari ini" : "Terus kumpulkan pahala"}
            </p>
          </div>
        </div>

        {/* Gamification Teaser Strip */}
        <div className="relative z-10 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-xl p-3 sm:p-4 border border-amber-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Trophy className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>Modul Gamifikasi & Lencana Istiqomah</span>
                <span className="text-[10px] bg-amber-100 text-amber-950 font-black px-2 py-0.5 rounded-full border border-amber-300">
                  {unlockedBadgeCount} dari {evaluatedBadges.length} Lencana Diraih ✨
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Koleksi lencana prestasi seperti &lsquo;Consistent Reader&rsquo; (Streak 3 &amp; 7 Hari) dan &lsquo;Early Bird&rsquo; (Dzikir Fajar).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("gamification")}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs self-start sm:self-auto shrink-0"
          >
            <span>Buka Gamifikasi & Lencana</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WEEKLY CONSISTENCY GRAPH (RECHARTS 7-DAY PROGRESS VISUALIZER) */}
      {showWeeklyGraph && (
        <WeeklyConsistencyGraph
          todayRepetitions={totalRepetitionsToday}
          morningDoneReps={morningDoneReps}
          eveningDoneReps={eveningDoneReps}
          freeTasbihReps={Math.max(0, totalRepetitionsToday - (morningDoneReps + eveningDoneReps))}
          dailyRepetitionTarget={dailyRepetitionTarget}
          currentStreakDays={stats.currentStreakDays}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* CUSTOM TARGET MODAL */}
      {showCustomTargetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Atur Target Repetisi Harian
              </h4>
              <button
                onClick={() => setShowCustomTargetModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Jumlah Repetisi per Hari:
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                step="10"
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                placeholder="Contoh: 350"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
              />
              <p className="text-[11px] text-slate-500">
                Pilih target realistis yang dapat Anda jaga keistiqomahannya setiap hari.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomTargetModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const val = parseInt(customTargetInput, 10);
                  if (val > 0) {
                    setDailyRepetitionTarget(val);
                    setShowCustomTargetModal(false);
                    triggerHaptic(20);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
              >
                Simpan Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FREE TASBIH MODE VIEW */}
      {activeTab === "free_tasbih" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                TASBIH DIGITAL BEBAS
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Pilih Dzikir & Target Hitungan Tasbih
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan untuk dzikir bakda shalat fardhu, wirid malam, atau pengisi waktu luang berkah.
              </p>
            </div>

            {/* Target Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Target:</span>
              {[33, 99, 100, 300, 1000].map((tgt) => (
                <button
                  key={tgt}
                  onClick={() => {
                    setFreeTasbihTarget(tgt);
                    setFreeTasbihCount(0);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    freeTasbihTarget === tgt
                      ? "bg-emerald-700 text-white border-emerald-700"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50"
                  }`}
                >
                  {tgt}x
                </button>
              ))}
              <button
                onClick={() => {
                  setFreeTasbihTarget(0); // 0 = unlimited
                  setFreeTasbihCount(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  freeTasbihTarget === 0
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50"
                }`}
              >
                ∞ Bebas
              </button>
            </div>
          </div>

          {/* Free Tasbih Daily Progress Contribution Alert */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-emerald-900 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Setiap ketukan tasbih bebas langsung menambah progres target harian Anda:
            </span>
            <span className="font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs self-start sm:self-auto">
              {totalRepetitionsToday} / {dailyRepetitionTarget} Repetisi ({rawProgressPct}%)
            </span>
          </div>

          {/* Quick Jump to Digital Haptic Counter Banner */}
          {onOpenDigitalCounter && (
            <div className="p-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-xl border border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-800/80 text-amber-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-emerald-200">Ingin getaran haptik responsif & target sesi presisi?</span>
                  <p className="text-[11px] text-slate-300">Tersedia mode audio klik kayu, getaran getar milidetik, dan riwayat sesi harian.</p>
                </div>
              </div>
              <button
                onClick={onOpenDigitalCounter}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition flex items-center gap-1 self-start sm:self-auto shadow-2xs"
              >
                <span>Buka Tasbih Haptic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Dzikir Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FREE_TASBIH_OPTIONS.map((opt, idx) => (
              <button
                key={opt.label}
                onClick={() => {
                  setFreeTasbihIndex(idx);
                  setFreeTasbihTarget(opt.defaultTarget);
                  setFreeTasbihCount(0);
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  freeTasbihIndex === idx
                    ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                <div className="text-[11px] font-serif text-emerald-800 font-semibold mt-0.5 truncate">
                  {opt.arabic}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{opt.meaning}</div>
              </button>
            ))}
          </div>

          {/* Giant Interactive Tasbih Dial */}
          <div className="flex flex-col items-center justify-center py-6 sm:py-10 space-y-6">
            <div className="text-center space-y-2 max-w-md">
              <p className="font-serif text-3xl sm:text-4xl text-emerald-950 font-bold leading-relaxed">
                {FREE_TASBIH_OPTIONS[freeTasbihIndex].arabic}
              </p>
              <h4 className="text-lg font-bold text-slate-800">
                {FREE_TASBIH_OPTIONS[freeTasbihIndex].label}
              </h4>
              <p className="text-xs text-slate-500 italic">
                "{FREE_TASBIH_OPTIONS[freeTasbihIndex].meaning}"
              </p>
            </div>

            {/* Giant Circular Click Area */}
            <div className="relative group cursor-pointer" onClick={handleFreeTasbihTap}>
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur-xl opacity-20 group-hover:opacity-40 transition group-active:scale-95"></div>

              {/* Circular SVG Progress */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-white to-slate-50 border-4 border-emerald-600 shadow-2xl flex flex-col items-center justify-center select-none active:scale-95 transition transform">
                {freeTasbihTarget > 0 && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="46%"
                      className="stroke-slate-100 fill-none"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="46%"
                      className="stroke-emerald-500 fill-none transition-all duration-150"
                      strokeWidth="8"
                      strokeDasharray="1000"
                      strokeDashoffset={
                        1000 - (1000 * Math.min(freeTasbihCount, freeTasbihTarget)) / freeTasbihTarget
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {freeTasbihTarget > 0 ? `Target: ${freeTasbihTarget}x` : "Mode Bebas"}
                </span>

                <div className="text-6xl sm:text-7xl font-black text-slate-900 font-mono tracking-tighter my-1">
                  {freeTasbihCount}
                </div>

                <div className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3 py-0.5 rounded-full">
                  KETUK UNTUK MENAMBAH
                </div>

                {freeTasbihLaps > 0 && (
                  <div className="text-[11px] font-semibold text-amber-700 mt-2">
                    Putaran Ke-{freeTasbihLaps + 1} Selesai
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar for Free Tasbih */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleResetFreeTasbih}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Hitungan (0)
              </button>

              <button
                onClick={() => {
                  setFreeTasbihCount((c) => Math.max(0, c - 1));
                  triggerHaptic(15);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                -1 Kurang
              </button>

              <button
                onClick={() => {
                  setFreeTasbihCount(freeTasbihTarget || 33);
                  if (soundEnabled) audioEngine.playCompletion();
                  triggerHaptic(50);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Selesaikan Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDED LIST VIEW (MORNING, EVENING, ALL, FAVORITES) */}
      {activeTab !== "free_tasbih" && activeTab !== "gamification" && (
        <div className="space-y-4">
          {/* Active Session Repetition Progress Banner */}
          {(activeTab === "morning" || activeTab === "evening") && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                activeTab === "morning"
                  ? "bg-amber-50/80 border-amber-200 text-amber-950"
                  : "bg-teal-50/80 border-teal-200 text-teal-950"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    {activeTab === "morning" ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-600" />
                        Kemajuan Repetisi Dzikir Pagi
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-teal-600" />
                        Kemajuan Repetisi Dzikir Petang
                      </>
                    )}
                  </span>
                  <span className="font-mono font-bold text-xs">
                    {activeTab === "morning"
                      ? `${morningDoneReps} / ${morningTargetReps} Repetisi (${Math.round((morningDoneReps / Math.max(1, morningTargetReps)) * 100)}%)`
                      : `${eveningDoneReps} / ${eveningTargetReps} Repetisi (${Math.round((eveningDoneReps / Math.max(1, eveningTargetReps)) * 100)}%)`}
                  </span>
                </div>
                <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      activeTab === "morning" ? "bg-amber-500" : "bg-teal-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        activeTab === "morning"
                          ? (morningDoneReps / Math.max(1, morningTargetReps)) * 100
                          : (eveningDoneReps / Math.max(1, eveningTargetReps)) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-[11px] font-semibold flex items-center gap-1 shrink-0">
                {activeTab === "morning" && morningDoneReps >= morningTargetReps ? (
                  <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sesi Pagi Selesai Sempurna!
                  </span>
                ) : activeTab === "evening" && eveningDoneReps >= eveningTargetReps ? (
                  <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sesi Petang Selesai Sempurna!
                  </span>
                ) : (
                  <span className="text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                    Sisa Sesi:{" "}
                    {activeTab === "morning"
                      ? Math.max(0, morningTargetReps - morningDoneReps)
                      : Math.max(0, eveningTargetReps - eveningDoneReps)}{" "}
                    repetisi
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Filter, Search & Category Chips */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lafal dzikir, arti, fadhilah, perawi hadits..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Kategori:
              </span>
              {[
                "Semua",
                "Perlindungan & Keselamatan",
                "Tauhid & Pengakuan Dosa",
                "Kesyukuran & Pagi/Sore",
                "Tasbih & Istighfar",
                "Rezeki & Kemudahan",
                "Kesehatan & 'Afiyah",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                    selectedCategory === cat
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notice if empty */}
          {filteredDhikr.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Tidak ada dzikir yang cocok</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan ubah kata kunci pencarian atau pilih kategori lain.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Semua");
                }}
                className="px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg mt-2"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Dhikr Cards Grid */}
          <div className="space-y-4">
            {filteredDhikr.map((item, idx) => {
              const currentCount = dhikrCounts[item.id] || 0;
              const isCompleted = currentCount >= item.targetCount;
              const isFav = stats.favoriteDhikrIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  id={`dhikr-card-${item.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                    isCompleted
                      ? "border-emerald-500/70 bg-emerald-50/20"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            {item.title}
                            {isCompleted && (
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Tuntas
                              </span>
                            )}
                          </h3>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      {/* Header Badges & Actions */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            item.timeOfDay === "morning"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : item.timeOfDay === "evening"
                              ? "bg-teal-50 text-teal-800 border-teal-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {item.timeOfDay === "morning"
                            ? "🌅 Pagi"
                            : item.timeOfDay === "evening"
                            ? "🌆 Petang"
                            : "✨ Pagi & Petang"}
                        </span>

                        <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          Target: {item.targetCount}x
                        </span>

                        {/* Audio Recitation Loop Toggle Button */}
                        <button
                          onClick={() => handleToggleRecitation(item)}
                          title={
                            recitingId === item.id && isRecitingPlaying
                              ? "Hentikan Audio Pelafalan & Irama Dzikir"
                              : "Putar Audio Pelafalan & Irama Dzikir (Loop Berulang)"
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border shadow-xs ${
                            recitingId === item.id && isRecitingPlaying
                              ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 ring-offset-1 animate-pulse"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                          }`}
                        >
                          {recitingId === item.id && isRecitingPlaying ? (
                            <>
                              <div className="flex items-end gap-0.5 h-3 px-0.5">
                                <span className="w-0.5 bg-white rounded-full animate-bounce h-2"></span>
                                <span className="w-0.5 bg-white rounded-full animate-bounce h-3"></span>
                                <span className="w-0.5 bg-white rounded-full animate-bounce h-2.5"></span>
                              </div>
                              <Pause className="w-3.5 h-3.5 fill-white" />
                              <span className="hidden sm:inline">
                                Jeda Irama ({recitationCurrentLoop}/{recitationLoopMode === "target" ? item.targetCount : "∞"})
                              </span>
                              <span className="sm:hidden">Jeda ({recitationCurrentLoop})</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Audio Irama</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => toggleFavorite(item.id)}
                          title={isFav ? "Hapus dari favorit" : "Simpan ke favorit"}
                          className={`p-1.5 rounded-lg border transition ${
                            isFav
                              ? "bg-amber-100 text-amber-700 border-amber-300"
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-600"
                          }`}
                        >
                          {isFav ? (
                            <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setFocusedDhikrId(item.id)}
                          title="Buka Tasbih Fokus Layar Penuh"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Audio Recitation & Rhythm Controller Panel */}
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        recitingId === item.id && isRecitingPlaying
                          ? "bg-emerald-50/90 border-emerald-300 shadow-sm"
                          : "bg-slate-50/80 border-slate-200/80"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        {/* Left: Play/Pause Audio Recitation Loop Toggle Button + Mode Selectors */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleToggleRecitation(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                              recitingId === item.id && isRecitingPlaying
                                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                : "bg-white text-slate-800 border border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                            }`}
                          >
                            {recitingId === item.id && isRecitingPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                <span>Hentikan Irama</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
                                <span>Putar Irama & Pelafalan</span>
                              </>
                            )}
                          </button>

                          {/* Loop Mode Options */}
                          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[11px] font-semibold">
                            <button
                              onClick={() => setRecitationLoopMode("target")}
                              className={`px-2 py-0.5 rounded transition ${
                                recitationLoopMode === "target"
                                  ? "bg-emerald-100 text-emerald-800 font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                              title={`Loop audio otomatis sesuai target sunnah ${item.targetCount}x`}
                            >
                              <Repeat className="w-3 h-3 inline mr-1" />
                              Target ({item.targetCount}x)
                            </button>
                            <button
                              onClick={() => setRecitationLoopMode("continuous")}
                              className={`px-2 py-0.5 rounded transition ${
                                recitationLoopMode === "continuous"
                                  ? "bg-emerald-100 text-emerald-800 font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                              title="Loop audio berulang terus-menerus tanpa henti"
                            >
                              Kontinu (∞)
                            </button>
                            <button
                              onClick={() => setRecitationLoopMode("single")}
                              className={`px-2 py-0.5 rounded transition ${
                                recitationLoopMode === "single"
                                  ? "bg-emerald-100 text-emerald-800 font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                              title="Putar 1x untuk panduan pengucapan"
                            >
                              1x Putar
                            </button>
                          </div>
                        </div>

                        {/* Right: Tempo Selector, Auto-count Toggle & Makhraj Tips */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Rhythm Tempo */}
                          <div className="flex items-center bg-white rounded-lg border border-slate-200 px-2 py-1 text-[11px] gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-500 font-medium">Irama:</span>
                            {[
                              { label: "0.8x Tartil", value: 0.8 },
                              { label: "1.0x Normal", value: 1.0 },
                              { label: "1.2x Lancar", value: 1.2 },
                            ].map((t) => (
                              <button
                                key={t.value}
                                onClick={() => setRecitationTempo(t.value)}
                                className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] transition ${
                                  recitationTempo === t.value
                                    ? "bg-emerald-700 text-white"
                                    : "text-slate-600 hover:text-emerald-700"
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>

                          {/* Auto Count Tasbih Toggle */}
                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 select-none">
                            <input
                              type="checkbox"
                              checked={autoCountWithAudio}
                              onChange={(e) => setAutoCountWithAudio(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Auto Hitung</span>
                          </label>

                          {/* Makhraj & Tajweed Guide Toggle */}
                          {item.pronunciationGuide && (
                            <button
                              onClick={() =>
                                setAudioGuideExpandedId(
                                  audioGuideExpandedId === item.id ? null : item.id
                                )
                              }
                              title="Panduan Makharijul Huruf & Tajweed"
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition ${
                                audioGuideExpandedId === item.id
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-white text-slate-600 border-slate-200 hover:text-amber-700"
                              }`}
                            >
                              <HelpCircle className="w-3 h-3 text-amber-600" />
                              <span>Makhraj</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Active Recitation Live Progress & Rhythm Pulse Status */}
                      {recitingId === item.id && isRecitingPlaying && (
                        <div className="mt-2.5 pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span>Irama Recitation Loop Aktif — Putaran ke-</span>
                              <span className="font-mono font-bold text-emerald-800 text-sm bg-emerald-200/70 px-2 py-0.5 rounded">
                                {recitationCurrentLoop}
                              </span>
                              <span>
                                {recitationLoopMode === "target"
                                  ? `dari ${item.targetCount}x target`
                                  : "(Loop Berulang)"}
                              </span>
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            {autoCountWithAudio
                              ? "✨ Hitungan tasbih otomatis bertambah tiap putaran"
                              : "🎧 Mode bimbingan irama & pelafalan"}
                          </span>
                        </div>
                      )}

                      {/* Pronunciation & Tajweed Tips Box */}
                      {audioGuideExpandedId === item.id && item.pronunciationGuide && (
                        <div className="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200/90 text-xs text-amber-950 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-amber-900">
                            <Info className="w-3.5 h-3.5 text-amber-600" />
                            <span>Panduan Makharijul Huruf & Irama Tajweed:</span>
                          </div>
                          <p className="leading-relaxed text-slate-700">{item.pronunciationGuide}</p>
                        </div>
                      )}
                    </div>

                    {/* Arabic Text Display */}
                    <div className="bg-emerald-950/[0.03] p-4 sm:p-5 rounded-xl border border-emerald-900/10 space-y-3">
                      <p
                        className={`font-serif text-right text-emerald-950 leading-loose font-medium select-text ${
                          fontSize === "standard"
                            ? "text-xl sm:text-2xl"
                            : fontSize === "large"
                            ? "text-2xl sm:text-3xl"
                            : "text-3xl sm:text-4xl"
                        }`}
                        style={{ fontFamily: "'Traditional Arabic', 'Scheherazade New', 'Amiri', serif" }}
                        dir="rtl"
                      >
                        {item.arabic}
                      </p>

                      {/* Transliteration */}
                      {showLatin && (
                        <div className="pt-2 border-t border-emerald-800/10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono block mb-0.5">
                            Pelafalan Latin:
                          </span>
                          <p className="text-xs text-emerald-900/90 font-mono leading-relaxed select-text">
                            {item.latin}
                          </p>
                        </div>
                      )}

                      {/* Translation */}
                      {showTranslation && (
                        <div className="pt-2 border-t border-emerald-800/10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-0.5">
                            Terjemahan Bahasa Indonesia:
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed italic select-text">
                            "{item.translation}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Fadhilah & Hadith Reference Drawer */}
                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/70 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Fadhilah & Keutamaan:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.fadhilah}</p>
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-950 font-medium">
                        <span>Rujukan: {item.source}</span>
                        <span className="bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-semibold">
                          Sanad: {item.sanadGrade}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">
                          Kemajuan Wirid:{" "}
                          <span className="font-mono text-emerald-800 font-bold">
                            {currentCount} / {item.targetCount}
                          </span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {Math.round((Math.min(currentCount, item.targetCount) / item.targetCount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${
                            isCompleted
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-emerald-600 to-teal-500"
                          }`}
                          style={{
                            width: `${Math.min(100, (currentCount / item.targetCount) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Interactive Counter Controls */}
                  <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Left Quick Audio & Share tools */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSpeak(item)}
                        title={speakingId === item.id ? "Hentikan Suara" : "Dengarkan Terjemahan & Latin"}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                          speakingId === item.id
                            ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {speakingId === item.id ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Dengarkan</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyDhikr(item)}
                        title="Salin Teks Lengkap"
                        className="p-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      {onOpenKnowledgeCatalog && (
                        <button
                          onClick={() => onOpenKnowledgeCatalog(item.tags[0])}
                          className="hidden sm:flex p-2 rounded-lg text-xs font-semibold bg-white text-emerald-800 border border-slate-200 hover:bg-emerald-50 transition items-center gap-1"
                          title="Telusuri di Knowledge Catalog"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Katalog</span>
                        </button>
                      )}
                    </div>

                    {/* Right Interactive Buttons */}
                    <div className="flex items-center gap-2">
                      {currentCount > 0 && (
                        <>
                          <button
                            onClick={() => handleDecrement(item.id)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition"
                            title="Kurang 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleResetItem(item.id)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-400 text-xs transition"
                            title="Reset hitungan ini"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {!isCompleted ? (
                        <button
                          id={`btn-count-dhikr-${item.id}`}
                          onClick={() => handleIncrement(item)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
                        >
                          <span className="text-sm font-black">+1</span>
                          <span>Hitung Tasbih ({currentCount}/{item.targetCount})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleIncrement(item)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Selesai ({currentCount}x) + Tambah</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GAMIFICATION & ACHIEVEMENT BADGES SECTION */}
      {activeTab === "gamification" && (
        <DhikrGamificationSection
          badges={evaluatedBadges}
          stats={stats}
          totalRepetitionsToday={totalRepetitionsToday}
          dailyRepetitionTarget={dailyRepetitionTarget}
          morningDoneCount={completedMorningCount}
          totalMorningItems={morningItems.length}
          eveningDoneCount={completedEveningCount}
          totalEveningItems={eveningItems.length}
          onNavigateToTab={(tab) => setActiveTab(tab)}
          onSimulateStreakIncrement={handleSimulateStreakIncrement}
          onSimulateCompleteMorning={handleSimulateCompleteMorning}
          onSimulateResetForDemo={handleSimulateResetForDemo}
        />
      )}

      {/* FULLSCREEN / FOCUSED IMMERSIVE TASBIH COUNTER MODAL */}
      {focusedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col justify-between shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-300 text-[11px] font-bold">
                  {focusedItem.timeOfDay === "morning"
                    ? "🌅 Dzikir Pagi"
                    : focusedItem.timeOfDay === "evening"
                    ? "🌆 Dzikir Petang"
                    : "✨ Dzikir Pagi & Petang"}
                </span>
                <span className="text-xs text-slate-300">
                  Target: {focusedItem.targetCount}x
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio Recitation Loop Toggle in Modal Header */}
                <button
                  onClick={() => handleToggleRecitation(focusedItem)}
                  title={
                    recitingId === focusedItem.id && isRecitingPlaying
                      ? "Hentikan Audio Pelafalan & Irama Dzikir"
                      : "Putar Audio Pelafalan & Irama Dzikir (Loop Berulang)"
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    recitingId === focusedItem.id && isRecitingPlaying
                      ? "bg-emerald-400 text-slate-950 border-emerald-300 font-black shadow-md animate-pulse"
                      : "bg-emerald-900 text-emerald-200 border-emerald-800 hover:bg-emerald-800"
                  }`}
                >
                  {recitingId === focusedItem.id && isRecitingPlaying ? (
                    <>
                      <div className="flex items-end gap-0.5 h-3 px-0.5">
                        <span className="w-0.5 bg-slate-950 rounded-full animate-bounce h-2"></span>
                        <span className="w-0.5 bg-slate-950 rounded-full animate-bounce h-3"></span>
                        <span className="w-0.5 bg-slate-950 rounded-full animate-bounce h-2.5"></span>
                      </div>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>
                        Jeda ({recitationCurrentLoop}/{recitationLoopMode === "target" ? focusedItem.targetCount : "∞"})
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-emerald-300" />
                      <span>Audio Irama</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg bg-emerald-900 text-emerald-200 hover:bg-emerald-800"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setFocusedDhikrId(null)}
                  className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-emerald-800 text-white flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                  {focusedItem.title}
                </h3>
                {focusedItem.subtitle && (
                  <p className="text-xs text-slate-500">{focusedItem.subtitle}</p>
                )}
              </div>

              {/* Arabic Script */}
              <div className="bg-emerald-950/5 p-5 rounded-2xl border border-emerald-900/10 text-center space-y-3">
                <p
                  className="font-serif text-emerald-950 font-bold leading-relaxed text-2xl sm:text-3xl select-text"
                  dir="rtl"
                >
                  {focusedItem.arabic}
                </p>

                {showLatin && (
                  <p className="text-xs font-mono text-emerald-900/80 pt-2 border-t border-emerald-800/10">
                    {focusedItem.latin}
                  </p>
                )}

                {showTranslation && (
                  <p className="text-xs text-slate-600 italic">
                    "{focusedItem.translation}"
                  </p>
                )}
              </div>

              {/* Focus Modal Audio Recitation & Rhythm Controller Bar */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRecitation(focusedItem)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                        recitingId === focusedItem.id && isRecitingPlaying
                          ? "bg-emerald-700 text-white hover:bg-emerald-800"
                          : "bg-white text-slate-800 border border-slate-300 hover:bg-emerald-100"
                      }`}
                    >
                      {recitingId === focusedItem.id && isRecitingPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Hentikan Irama</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
                          <span>Putar Irama & Pelafalan Loop</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] font-semibold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                      Mode: {recitationLoopMode === "target" ? `Target (${focusedItem.targetCount}x)` : recitationLoopMode === "continuous" ? "Kontinu (∞)" : "1x"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 px-2 py-0.5 text-[11px] gap-1">
                      <span className="text-slate-500 font-medium">Tempo:</span>
                      {[
                        { label: "0.8x", value: 0.8 },
                        { label: "1.0x", value: 1.0 },
                        { label: "1.2x", value: 1.2 },
                      ].map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setRecitationTempo(t.value)}
                          className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] transition ${
                            recitationTempo === t.value
                              ? "bg-emerald-700 text-white"
                              : "text-slate-600 hover:text-emerald-700"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoCountWithAudio}
                        onChange={(e) => setAutoCountWithAudio(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Auto Tasbih</span>
                    </label>
                  </div>
                </div>

                {recitingId === focusedItem.id && isRecitingPlaying && (
                  <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                      </span>
                      <span>Irama audio berjalan — Putaran ke-<strong>{recitationCurrentLoop}</strong></span>
                    </span>
                    <span className="text-[11px] text-emerald-700">Ikuti irama dan lafalkan dengan tenang</span>
                  </div>
                )}

                {focusedItem.pronunciationGuide && (
                  <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200/70">
                    💡 <strong>Makhraj & Tajweed:</strong> {focusedItem.pronunciationGuide}
                  </p>
                )}
              </div>

              {/* Giant Clickable Counter Dial */}
              <div className="flex flex-col items-center justify-center py-2">
                <div
                  id="focused-tasbih-dial"
                  className="relative group cursor-pointer"
                  onClick={() => handleIncrement(focusedItem)}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl group-hover:bg-emerald-500/30 transition"></div>

                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-white border-4 border-emerald-600 shadow-2xl flex flex-col items-center justify-center select-none active:scale-95 transition transform">
                    {/* SVG progress indicator */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="46%"
                        className="stroke-slate-100 fill-none"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="46%"
                        className="stroke-emerald-500 fill-none transition-all duration-150"
                        strokeWidth="8"
                        strokeDasharray="900"
                        strokeDashoffset={
                          900 -
                          (900 *
                            Math.min(
                              dhikrCounts[focusedItem.id] || 0,
                              focusedItem.targetCount
                            )) /
                            focusedItem.targetCount
                        }
                        strokeLinecap="round"
                      />
                    </svg>

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      HITUNGAN SAAT INI
                    </span>
                    <div className="text-6xl sm:text-7xl font-black text-slate-900 font-mono tracking-tight my-1">
                      {dhikrCounts[focusedItem.id] || 0}
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                      Target: {focusedItem.targetCount}x
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 font-medium">
                  Ketuk lingkaran di atas untuk menambah hitungan tasbih
                </p>
              </div>

              {/* Real-Time Daily Target Progress Bar inside Modal */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    Target Repetisi Harian:
                  </span>
                  <span className="font-mono text-emerald-800 font-bold">
                    {totalRepetitionsToday} / {dailyRepetitionTarget} ({rawProgressPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      rawProgressPct >= 100
                        ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400"
                        : "bg-gradient-to-r from-emerald-600 to-teal-500"
                    }`}
                    style={{ width: `${dailyProgressPct}%` }}
                  ></div>
                </div>
                <div className="text-[11px] text-slate-500 text-center font-medium">
                  {isDailyTargetAchieved ? (
                    <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" /> Target harian tercapai kaffah! (+{surplusReps} repetisi bonus)
                    </span>
                  ) : (
                    `Tersisa ${remainingRepsToTarget} repetisi lagi untuk melengkapi target harian.`
                  )}
                </div>
              </div>

              {/* Fadhilah Notice */}
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Fadhilah:</strong> {focusedItem.fadhilah}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => moveToPrevDhikr(focusedItem.id)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResetItem(focusedItem.id)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs"
                >
                  Reset (0)
                </button>
                <button
                  onClick={() => handleCompleteItem(focusedItem)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Tandai Selesai
                </button>
              </div>

              <button
                onClick={() => advanceToNextDhikr(focusedItem.id)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPLAY PREFERENCES & SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-600" />
                Pengaturan Tampilan & Tasbih
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Ukuran Font Arab */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Ukuran Teks Arab</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "standard", label: "Standar" },
                    { id: "large", label: "Besar" },
                    { id: "xlarge", label: "Ekstra Besar" },
                  ].map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setFontSize(size.id as any)}
                      className={`p-2 rounded-lg font-semibold text-center border ${
                        fontSize === size.id
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">Tampilkan Pelafalan Latin</span>
                  <input
                    type="checkbox"
                    checked={showLatin}
                    onChange={(e) => setShowLatin(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">Tampilkan Terjemahan Indonesia</span>
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">Suara Efek Sentuhan (Audio Click)</span>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">Getaran Haptik HP (Vibration)</span>
                  <input
                    type="checkbox"
                    checked={vibrateEnabled}
                    onChange={(e) => setVibrateEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700">Otomatis Lanjut ke Dzikir Berikutnya</span>
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM FLOATING AUDIO RECITATION PLAYER */}
      {recitingId && isRecitingPlaying && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 shrink-0">
              <div className="flex items-end gap-0.5 h-3.5 px-0.5">
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3.5"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2.5"></span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Audio Irama Dzikir
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-800">
                  Putaran {recitationCurrentLoop} {recitationLoopMode === "target" ? `/ ${RECOMMENDED_DHIKR_LIST.find((i) => i.id === recitingId)?.targetCount || 1}x` : "(∞)"}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate">
                {RECOMMENDED_DHIKR_LIST.find((i) => i.id === recitingId)?.title || "Dzikir Harian"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const item = RECOMMENDED_DHIKR_LIST.find((i) => i.id === recitingId);
                if (item) handleToggleRecitation(item);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>Jeda</span>
            </button>

            <button
              onClick={stopRecitationLoop}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Hentikan Audio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
