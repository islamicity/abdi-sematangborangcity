import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  Trophy,
  Flame,
  ChevronRight,
  Maximize2,
  Minimize2,
  Undo2,
  History,
  Target,
  Layers,
  Share2,
  Award,
  Clock,
  Trash2,
  Bookmark,
  Play,
  Pause,
  Sliders,
  Check,
  Headphones,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface DhikrCounterSession {
  id: string;
  dhikrName: string;
  arabic: string;
  count: number;
  target: number;
  timestamp: string; // ISO
  durationSeconds: number;
}

export interface PresetDhikrItem {
  id: string;
  name: string;
  arabic: string;
  latin: string;
  meaning: string;
  fadhilah: string;
  defaultTarget: number;
  category: "Tasbih Shalat" | "Istighfar" | "Shalawat" | "Hajat & Tawakkal" | "Bebas";
}

export const PRESET_DHIKR_ITEMS: PresetDhikrItem[] = [
  {
    id: "subhanallah",
    name: "Subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    latin: "Subhaanallaah",
    meaning: "Maha Suci Allah dari segala kekurangan dan kesyirikan.",
    fadhilah: "Ditanamkan satu pohon kurma di surga untuk setiap lafal.",
    defaultTarget: 33,
    category: "Tasbih Shalat",
  },
  {
    id: "alhamdulillah",
    name: "Alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    latin: "Alhamdulillaah",
    meaning: "Segala puji kepunyaan Allah atas segala nikmat-Nya.",
    fadhilah: "Memenuhi timbangan mizan amal kebaikan di hari kiamat.",
    defaultTarget: 33,
    category: "Tasbih Shalat",
  },
  {
    id: "allahuakbar",
    name: "Allahu Akbar",
    arabic: "اللَّهُ أَكْبَرُ",
    latin: "Allahu Akbar",
    meaning: "Allah Maha Besar melampaui segala sesuatu di semesta.",
    fadhilah: "Menghapuskan dosa bagai dedaunan yang gugur di musim gugur.",
    defaultTarget: 33,
    category: "Tasbih Shalat",
  },
  {
    id: "astaghfirullah",
    name: "Istighfar Taubat",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    latin: "Astaghfirullaaha wa atuubu ilaih",
    meaning: "Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.",
    fadhilah: "Membuka pintu rezeki, mendatangkan kelapangan dari segala kesempitan.",
    defaultTarget: 100,
    category: "Istighfar",
  },
  {
    id: "shalawat_ibrahim",
    name: "Shalawat Nabi",
    arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ",
    latin: "Allahumma shalli 'alaa Sayyidinaa Muhammad",
    meaning: "Ya Allah, limpahkanlah rahmat dan shalawat kepada junjungan kami Nabi Muhammad.",
    fadhilah: "Satu kali bershalawat, Allah membalas dengan 10 shalawat dan ampunan 10 dosa.",
    defaultTarget: 100,
    category: "Shalawat",
  },
  {
    id: "tahlil",
    name: "Tahlil Ikhlas",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    latin: "Laa ilaaha illallaahu wahdahu laa syariika lah",
    meaning: "Tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya.",
    fadhilah: "Sebaik-baik dzikir penawar kesedihan dan kunci surga.",
    defaultTarget: 100,
    category: "Hajat & Tawakkal",
  },
  {
    id: "hasbunallah",
    name: "Hasbunallah Tawakkal",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    latin: "Hasbunallaahu wa ni'mal wakiil",
    meaning: "Cukuplah Allah menjadi Penolong kami dan Allah adalah sebaik-baik Pelindung.",
    fadhilah: "Perisai dari rasa cemas, ketakutan menghadapi urusan besar dunia dan musuh.",
    defaultTarget: 100,
    category: "Hajat & Tawakkal",
  },
  {
    id: "subhanallah_wabihamdihi",
    name: "Tasbih Mizan Ringan",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
    latin: "Subhaanallaahi wa bihamdihii, subhaanallaahil 'azhiim",
    meaning: "Maha Suci Allah dengan memuji-Nya, Maha Suci Allah Yang Maha Agung.",
    fadhilah: "Dua kalimat yang ringan di lisan, berat di timbangan, dan dicintai Ar-Rahman.",
    defaultTarget: 100,
    category: "Bebas",
  },
  {
    id: "lahawla",
    name: "Hauqalah Perbendaharaan Surga",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    latin: "Laa hawla wa laa quwwata illaa billaahil 'aliyyil 'azhiim",
    meaning: "Tiada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.",
    fadhilah: "Simpanan perbendaharaan surga dan obat dari 99 penyakit batin.",
    defaultTarget: 100,
    category: "Hajat & Tawakkal",
  },
];

// Web Audio API Synthesizer for tactile feedback
class HapticSoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playTapSound(soundType: "wooden_bead" | "soft_click" | "bell" = "wooden_bead") {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      if (soundType === "wooden_bead") {
        // Warm organic acoustic click
        osc.type = "sine";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (soundType === "bell") {
        // High spiritual resonance
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else {
        // Subtle haptic digital click
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.025);
      }
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  }

  playTargetReachedFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch {}
  }
}

const soundEngine = new HapticSoundEngine();

interface DigitalHapticDhikrCounterProps {
  onSessionComplete?: (session: DhikrCounterSession) => void;
  onNavigateToCatalog?: () => void;
  onOpenAudioPlayer?: () => void;
  onOpenSpiritualMilestones?: () => void;
}

export default function DigitalHapticDhikrCounter({
  onSessionComplete,
  onNavigateToCatalog,
  onOpenAudioPlayer,
  onOpenSpiritualMilestones,
}: DigitalHapticDhikrCounterProps) {
  // Active selected preset item
  const [selectedDhikr, setSelectedDhikr] = useState<PresetDhikrItem>(PRESET_DHIKR_ITEMS[0]);
  const [customDhikrName, setCustomDhikrName] = useState<string>("");

  // Counter core states
  const [count, setCount] = useState<number>(0);
  const [sessionTarget, setSessionTarget] = useState<number>(33);
  const [completedLaps, setCompletedLaps] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [lastCountHistory, setLastCountHistory] = useState<number[]>([]);

  // Daily target tracking
  const [dailyRepetitionTarget, setDailyRepetitionTarget] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("islamicity_dhikr_daily_target");
      if (stored) return parseInt(stored, 10) || 500;
    } catch {}
    return 500;
  });

  const [dailyCompletedReps, setDailyCompletedReps] = useState<number>(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const stored = localStorage.getItem(`islamicity_counter_daily_${todayStr}`);
      if (stored) return parseInt(stored, 10) || 0;
    } catch {}
    return 145; // friendly initial seed
  });

  // Settings & Haptics
  const [hapticIntensity, setHapticIntensity] = useState<"subtle" | "balanced" | "strong" | "off">(() => {
    try {
      const stored = localStorage.getItem("islamicity_counter_haptic_mode");
      if (stored) return stored as any;
    } catch {}
    return "balanced";
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("islamicity_counter_sound_enabled");
      if (stored !== null) return JSON.parse(stored);
    } catch {}
    return true;
  });

  const [soundTone, setSoundTone] = useState<"wooden_bead" | "soft_click" | "bell">("wooden_bead");
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showCustomTargetModal, setShowCustomTargetModal] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>("33");
  const [tapAnimationPulse, setTapAnimationPulse] = useState<boolean>(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);

  // Completed sessions history
  const [sessionHistory, setSessionHistory] = useState<DhikrCounterSession[]>(() => {
    try {
      const stored = localStorage.getItem("islamicity_counter_session_history");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: "sess-1",
        dhikrName: "Subhanallah",
        arabic: "سُبْحَانَ اللَّهِ",
        count: 33,
        target: 33,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        durationSeconds: 78,
      },
      {
        id: "sess-2",
        dhikrName: "Alhamdulillah",
        arabic: "الْحَمْدُ لِلَّهِ",
        count: 33,
        target: 33,
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        durationSeconds: 82,
      },
      {
        id: "sess-3",
        dhikrName: "Allahu Akbar",
        arabic: "اللَّهُ أَكْبَرُ",
        count: 34,
        target: 34,
        timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        durationSeconds: 85,
      },
      {
        id: "sess-4",
        dhikrName: "Istighfar Taubat",
        arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        count: 100,
        target: 100,
        timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        durationSeconds: 195,
      },
    ];
  });

  // Haptic feedback trigger
  const triggerHaptic = (type: "single" | "halfway" | "complete") => {
    if (hapticIntensity === "off") return;
    if (typeof window === "undefined" || !("vibrate" in navigator)) return;

    try {
      const multipliers = {
        subtle: 0.6,
        balanced: 1.0,
        strong: 1.5,
      };
      const mult = multipliers[hapticIntensity] || 1.0;

      if (type === "complete") {
        // Long celebratory sequence
        navigator.vibrate([Math.round(40 * mult), 30, Math.round(60 * mult), 30, Math.round(120 * mult)]);
      } else if (type === "halfway") {
        // Double pulse for milestone
        navigator.vibrate([Math.round(25 * mult), 40, Math.round(25 * mult)]);
      } else {
        // Single tactile pulse
        navigator.vibrate(Math.round(18 * mult));
      }
    } catch {
      // Haptics not allowed by browser permissions
    }
  };

  // Sync today's accumulated counter to localStorage
  const persistDailyReps = (newDailyTotal: number) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(`islamicity_counter_daily_${todayStr}`, newDailyTotal.toString());
      // Also update general dhikr repetitions today if appropriate
      const existingToday = localStorage.getItem(`islamicity_dhikr_today_${todayStr}`);
      const base = existingToday ? parseInt(existingToday, 10) : 0;
      if (newDailyTotal > base) {
        localStorage.setItem(`islamicity_dhikr_today_${todayStr}`, newDailyTotal.toString());
      }
    } catch {}
  };

  // Persist session history
  const persistSessionHistory = (updatedHistory: DhikrCounterSession[]) => {
    setSessionHistory(updatedHistory);
    try {
      localStorage.setItem("islamicity_counter_session_history", JSON.stringify(updatedHistory));
    } catch {}
  };

  // Main Increment Action (Tap)
  const handleTap = () => {
    const nextCount = count + 1;
    setTapAnimationPulse(true);
    setTimeout(() => setTapAnimationPulse(false), 120);

    // Save history for undo
    setLastCountHistory((prev) => [...prev.slice(-15), count]);

    // Update count
    setCount(nextCount);

    // Update Daily cumulative reps
    const newDaily = dailyCompletedReps + 1;
    setDailyCompletedReps(newDaily);
    persistDailyReps(newDaily);

    // Sound feedback
    if (soundEnabled) {
      soundEngine.playTapSound(soundTone);
    }

    // Check if target is set
    if (sessionTarget > 0) {
      // Halfway milestone
      if (nextCount === Math.floor(sessionTarget / 2)) {
        triggerHaptic("halfway");
      }
      // Target reached
      else if (nextCount === sessionTarget) {
        triggerHaptic("complete");
        if (soundEnabled) {
          soundEngine.playTargetReachedFanfare();
        }

        // Fire celebratory confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#10b981", "#f59e0b", "#0d9488", "#38bdf8"],
        });

        // Record completed session
        const duration = Math.max(5, Math.round((Date.now() - sessionStartTime) / 1000));
        const newSession: DhikrCounterSession = {
          id: `sess-${Date.now()}`,
          dhikrName: selectedDhikr.name,
          arabic: selectedDhikr.arabic,
          count: sessionTarget,
          target: sessionTarget,
          timestamp: new Date().toISOString(),
          durationSeconds: duration,
        };

        const updated = [newSession, ...sessionHistory];
        persistSessionHistory(updated);
        if (onSessionComplete) onSessionComplete(newSession);

        setCompletedLaps((prev) => prev + 1);
        setShowCelebrationModal(true);
      } else {
        triggerHaptic("single");
      }
    } else {
      triggerHaptic("single");
    }
  };

  // Undo last tap
  const handleUndo = () => {
    if (lastCountHistory.length === 0 || count <= 0) return;
    const prevCount = lastCountHistory[lastCountHistory.length - 1];
    setLastCountHistory((prev) => prev.slice(0, -1));
    setCount(prevCount);
    if (dailyCompletedReps > 0) {
      const newDaily = dailyCompletedReps - 1;
      setDailyCompletedReps(newDaily);
      persistDailyReps(newDaily);
    }
    triggerHaptic("single");
  };

  // Reset Session
  const handleResetSession = () => {
    if (count > 0) {
      if (confirm(`Reset hitungan sesi ${selectedDhikr.name} kembali ke 0?`)) {
        setCount(0);
        setLastCountHistory([]);
        setSessionStartTime(Date.now());
        triggerHaptic("halfway");
      }
    } else {
      setCount(0);
      setSessionStartTime(Date.now());
    }
  };

  // Switch Preset Dhikr
  const handleSelectPreset = (item: PresetDhikrItem) => {
    if (count > 0) {
      if (!confirm(`Ganti wirid ke ${item.name}? Hitungan berjalan (${count}x) akan di-reset.`)) {
        return;
      }
    }
    setSelectedDhikr(item);
    setSessionTarget(item.defaultTarget);
    setCount(0);
    setLastCountHistory([]);
    setSessionStartTime(Date.now());
  };

  // Set Session Target (33, 99, 100, 300, 1000, 0 = unlimited)
  const handleSetTarget = (tgt: number) => {
    setSessionTarget(tgt);
    if (count >= tgt && tgt > 0) {
      setCount(0);
    }
  };

  // Custom Target Submission
  const handleApplyCustomTarget = () => {
    const val = parseInt(customTargetInput, 10);
    if (!isNaN(val) && val > 0) {
      setSessionTarget(val);
      setShowCustomTargetModal(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === "Space" || e.code === "Enter" || e.code === "ArrowUp") {
        e.preventDefault();
        handleTap();
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleResetSession();
      } else if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [count, sessionTarget, dailyCompletedReps, soundEnabled, soundTone, hapticIntensity, isFocusMode]);

  // Save Settings
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("islamicity_counter_sound_enabled", JSON.stringify(next));
  };

  const changeHapticMode = (mode: "subtle" | "balanced" | "strong" | "off") => {
    setHapticIntensity(mode);
    localStorage.setItem("islamicity_counter_haptic_mode", mode);
    if (mode !== "off") {
      setTimeout(() => triggerHaptic("complete"), 50);
    }
  };

  // Progress Calculations
  const sessionProgressPct = useMemo(() => {
    if (sessionTarget <= 0) return 100;
    return Math.min(100, Math.round((count / sessionTarget) * 100));
  }, [count, sessionTarget]);

  const dailyProgressPct = useMemo(() => {
    if (dailyRepetitionTarget <= 0) return 100;
    return Math.min(100, Math.round((dailyCompletedReps / dailyRepetitionTarget) * 100));
  }, [dailyCompletedReps, dailyRepetitionTarget]);

  // Circumference for 240px SVG Dial (radius = 100 => circ = 2 * PI * 100 = 628.3)
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = sessionTarget > 0
    ? circumference - (circumference * Math.min(count, sessionTarget)) / sessionTarget
    : 0;

  return (
    <div
      id="digital-haptic-dhikr-counter"
      className={`space-y-6 transition-all duration-300 ${
        isFocusMode ? "fixed inset-0 z-50 bg-slate-950 p-4 sm:p-8 overflow-y-auto flex flex-col justify-between" : ""
      }`}
    >
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-7 text-white border border-emerald-600/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>HAPTIC VIBRATION &amp; TACTILE FEEDBACK</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <span>Tasbih Digital Haptic</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold uppercase tracking-wider">
                Presisi &amp; Fokus
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Penghitung wirid digital cerdas dilengkapi getaran haptik responsif, audio klik akustik kayu,
              pelacak target harian, dan progress bar visual kaffah.
            </p>
          </div>

          {/* Quick Settings Bar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
            {/* Haptic Mode Selector */}
            <div className="bg-slate-900/80 p-1 rounded-xl border border-emerald-800/80 flex items-center gap-1">
              {(["balanced", "strong", "subtle", "off"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => changeHapticMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    hapticIntensity === mode
                      ? "bg-emerald-600 text-white shadow-2xs font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={`Getaran Haptik: ${mode.toUpperCase()}`}
                >
                  {mode === "balanced" ? "⚡ Normal" : mode === "strong" ? "💥 Kuat" : mode === "subtle" ? "✨ Halus" : "🚫 Mati"}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                soundEnabled
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-2xs"
                  : "bg-slate-900/80 text-slate-400 border-emerald-800/80 hover:text-white"
              }`}
              title={soundEnabled ? "Suara Klik Aktif" : "Suara Klik Dimatikan"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fullscreen / Focus Mode */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-800/80 transition"
              title={isFocusMode ? "Keluar Mode Layar Penuh" : "Mode Hening Layar Penuh"}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Audio Loop Player Toggle */}
            {onOpenAudioPlayer && (
              <button
                onClick={onOpenAudioPlayer}
                className="p-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-500/60 transition flex items-center gap-1 text-xs font-semibold"
                title="Buka Lantunan & Loop Audio Menenangkan"
              >
                <Headphones className="w-4 h-4 text-teal-300" />
                <span className="hidden sm:inline">Audio Loop</span>
              </button>
            )}

            {/* Spiritual Milestones Toggle */}
            {onOpenSpiritualMilestones && (
              <button
                onClick={onOpenSpiritualMilestones}
                className="p-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-500/60 transition flex items-center gap-1 text-xs font-semibold"
                title="Buka Spiritual Milestones & Lencana Digital"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Milestones</span>
              </button>
            )}

            {/* History Toggle */}
            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-800/80 transition flex items-center gap-1 text-xs font-semibold"
              title="Riwayat Sesi Tasbih"
            >
              <History className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Riwayat</span>
            </button>
          </div>
        </div>

        {/* DAILY CUMULATIVE TARGET PROGRESS BAR */}
        <div className="relative z-10 mt-6 pt-5 border-t border-emerald-800/60 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Target Repetisi Harian:</span>
              <span className="font-mono text-emerald-300 font-bold">
                {dailyCompletedReps.toLocaleString("id-ID")} / {dailyRepetitionTarget.toLocaleString("id-ID")} Repetisi
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-amber-300">
                {dailyProgressPct}% Tercapai
              </span>
              {dailyCompletedReps >= dailyRepetitionTarget && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Target Tuntas Kaffah!
                </span>
              )}
            </div>
          </div>

          {/* Visual Progress Bar Track */}
          <div className="w-full h-3 rounded-full bg-slate-900/90 border border-emerald-800/80 overflow-hidden relative p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-300 shadow-sm relative"
              style={{ width: `${dailyProgressPct}%` }}
            >
              {dailyProgressPct >= 10 && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              )}
            </div>
          </div>

          {/* Milestone markers */}
          <div className="flex justify-between text-[10px] text-emerald-300/70 font-mono px-0.5 pt-0.5">
            <span>0</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>Target: {dailyRepetitionTarget}x</span>
          </div>
        </div>
      </div>

      {/* MAIN INTERACTIVE DIGITAL TASBIH WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PRESET SELECTOR & SESSION TARGETS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Dzikir Cards */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pilih Lafadz Dzikir &amp; Wirid</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">9 Pilihan Sunnah</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
              {PRESET_DHIKR_ITEMS.map((item) => {
                const isSelected = selectedDhikr.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPreset(item)}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isSelected ? "text-emerald-950" : "text-slate-800"}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-md bg-white border border-slate-200 text-slate-500 font-mono">
                          {item.defaultTarget}x
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.latin}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-arabic font-bold text-base text-emerald-900 block leading-tight">
                        {item.arabic}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Target Selector */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-700" />
                <span>Target Sesi Berjalan</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {sessionTarget > 0 ? `${sessionTarget} Repetisi` : "Mode Bebas (∞)"}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
              {[33, 99, 100, 300, 1000].map((tgt) => (
                <button
                  key={tgt}
                  onClick={() => handleSetTarget(tgt)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold font-mono transition border ${
                    sessionTarget === tgt
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
                  }`}
                >
                  {tgt}x
                </button>
              ))}

              <button
                onClick={() => handleSetTarget(0)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition border ${
                  sessionTarget === 0
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
                }`}
              >
                ∞ Bebas
              </button>
            </div>

            {/* Custom Target Trigger Button */}
            <div className="pt-1">
              <button
                onClick={() => setShowCustomTargetModal(true)}
                className="w-full py-1.5 text-center text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50/60 hover:bg-emerald-100 rounded-xl transition border border-dashed border-emerald-300"
              >
                + Tentukan Target Angka Khusus
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GIANT INTERACTIVE HAPTIC DIAL & CONTROLS (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-md flex flex-col items-center justify-between space-y-6 relative overflow-hidden">
          {/* Active Dhikr Display Header */}
          <div className="text-center space-y-2 max-w-lg w-full border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider inline-block">
              {selectedDhikr.category}
            </span>

            <div className="font-arabic text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-950 leading-relaxed pt-1">
              {selectedDhikr.arabic}
            </div>

            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                {selectedDhikr.name}
              </h3>
              <p className="text-xs text-emerald-700 italic font-sans font-medium">
                {selectedDhikr.latin}
              </p>
              <p className="text-xs text-slate-500 font-sans max-w-md mx-auto line-clamp-2">
                &ldquo;{selectedDhikr.meaning}&rdquo;
              </p>
            </div>
          </div>

          {/* GIANT CIRCULAR HAPTIC TAP BUTTON WITH SVG PROGRESS */}
          <div className="relative group cursor-pointer select-none py-2" onClick={handleTap}>
            {/* Outer Pulsing Glow */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition duration-200 pointer-events-none ${
                sessionProgressPct >= 100
                  ? "bg-amber-400/40"
                  : "bg-emerald-500/20 group-hover:bg-emerald-500/35"
              }`}
            ></div>

            {/* Circular Base Dial */}
            <div
              className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex flex-col items-center justify-center shadow-2xl transition transform duration-100 ${
                tapAnimationPulse ? "scale-95 ring-8 ring-emerald-500/30" : "scale-100 ring-4 ring-emerald-600/20"
              } ${
                sessionProgressPct >= 100
                  ? "bg-gradient-to-b from-amber-50 to-emerald-50 border-4 border-amber-400"
                  : "bg-gradient-to-b from-white via-slate-50 to-emerald-50/40 border-4 border-emerald-600"
              }`}
            >
              {/* Circular SVG Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className="stroke-slate-100 fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className={`fill-none transition-all duration-150 ${
                    sessionProgressPct >= 100 ? "stroke-amber-500" : "stroke-emerald-600"
                  }`}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Dial Info Center */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {sessionTarget > 0 ? `Target: ${sessionTarget}x` : "Mode Bebas"}
                </span>

                {/* Big Repetition Counter */}
                <div
                  className={`text-6xl sm:text-7xl font-black font-mono tracking-tighter leading-none transition ${
                    sessionProgressPct >= 100 ? "text-amber-600" : "text-slate-900"
                  }`}
                >
                  {count}
                </div>

                {/* Percentage & Lap Pill */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                      sessionProgressPct >= 100
                        ? "bg-amber-400 text-slate-950 font-bold"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {sessionProgressPct}%
                  </span>
                  {completedLaps > 0 && (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Putaran Ke-{completedLaps + 1}
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200/80 mt-1">
                  SENTUH UNTUK BERDZIKIR
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTION CONTROL BUTTONS (UNDO, RESET, LAP) */}
          <div className="w-full flex items-center justify-between max-w-sm pt-2 border-t border-slate-100">
            {/* Undo Button */}
            <button
              onClick={handleUndo}
              disabled={count === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40"
              title="Undo 1 Ketukan Terakhir"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetSession}
              disabled={count === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40"
              title="Reset Sesi Hitungan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Keyboard shortcut hint */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">Space</span>
              <span>/ Tap</span>
            </div>
          </div>

          {/* Fadhilah Footer Note */}
          <div className="w-full bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-800">Fadhilah: </strong>
              {selectedDhikr.fadhilah}
            </p>
          </div>
        </div>
      </div>

      {/* SESSION HISTORY DRAWER / MODAL */}
      {showHistoryDrawer && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Riwayat Sesi Tasbih Harian ({sessionHistory.length})
              </h3>
            </div>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
            >
              &times; Tutup
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sessionHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada riwayat sesi yang selesai.</p>
            ) : (
              sessionHistory.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{sess.dhikrName}</span>
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {sess.count}x
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(sess.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>&bull;</span>
                      <span>Durasi: {sess.durationSeconds} detik</span>
                    </div>
                  </div>

                  <span className="font-arabic font-bold text-lg text-emerald-900">
                    {sess.arabic}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CELEBRATION MODAL ON TARGET COMPLETE */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-emerald-300 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Alhamdulillah, Target Tuntas!</h3>
              <p className="text-xs text-slate-500">
                Anda telah menyelesaikan target <strong>{sessionTarget}x repetisi {selectedDhikr.name}</strong>.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
              &ldquo;Dua kalimat yang ringan di lisan, berat di timbangan, dan dicintai Ar-Rahman.&rdquo;
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setCount(0);
                  setShowCelebrationModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-teal-700 transition shadow-sm"
              >
                Lanjutkan Putaran Baru
              </button>
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM TARGET MODAL */}
      {showCustomTargetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-700" />
                <span>Atur Target Repetisi Khusus</span>
              </h3>
              <button
                onClick={() => setShowCustomTargetModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Jumlah Target:</label>
              <input
                type="number"
                min="1"
                step="1"
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                placeholder="Contoh: 70, 500, 1000"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-base font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleApplyCustomTarget}
                className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-2xs"
              >
                Terapkan Target
              </button>
              <button
                onClick={() => setShowCustomTargetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
