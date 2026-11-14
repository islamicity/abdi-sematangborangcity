import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Headphones,
  Sliders,
  Clock,
  Waves,
  Heart,
  Music,
  CloudRain,
  Sun,
  Moon,
  Wind,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Check,
  Radio,
  Coffee,
  Bookmark,
  Repeat,
} from "lucide-react";

// --- Ambient Sound Generator via Web Audio API (Zero External Assets, 100% Reliable & Offline) ---
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private currentMode: string | null = null;

  // Nodes storage for active soundscape
  private activeNodes: (AudioNode | number)[] = [];
  private masterGain: GainNode | null = null;
  private lfoInterval: number | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMasterVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  stop() {
    if (this.lfoInterval) {
      window.clearInterval(this.lfoInterval);
      this.lfoInterval = null;
    }
    this.activeNodes.forEach((node) => {
      try {
        if (typeof node === "number") {
          window.clearInterval(node);
        } else if ("stop" in node && typeof (node as any).stop === "function") {
          (node as any).stop();
        } else if ("disconnect" in node && typeof node.disconnect === "function") {
          node.disconnect();
        }
      } catch {}
    });
    this.activeNodes = [];
    this.isRunning = false;
    this.currentMode = null;
  }

  playPreset(modeId: string, volume: number = 0.6) {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.currentMode = modeId;
    this.isRunning = true;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.activeNodes.push(this.masterGain);

    switch (modeId) {
      case "mosque_dawn":
        this.buildMosqueDawn();
        break;
      case "rain_courtyard":
        this.buildRainCourtyard();
        break;
      case "sufi_ney":
        this.buildSufiNey();
        break;
      case "tasbih_cadence":
        this.buildTasbihCadence();
        break;
      case "binaural_sakinah":
        this.buildBinauralSakinah();
        break;
      default:
        this.buildMosqueDawn();
    }
  }

  // 1. Serambi Masjid di Kala Fajar: 432Hz harmonic breathing pad with subtle wind filter
  private buildMosqueDawn() {
    if (!this.ctx || !this.masterGain) return;
    const notes = [108, 162, 216, 324, 432]; // D2, A2, A3, E4, A4 (Harmonic calming Bayati drone)

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450 + i * 50, this.ctx!.currentTime);

      // Low volume per harmonic
      gain.gain.setValueAtTime(0.08 / (i + 1), this.ctx!.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      this.activeNodes.push(osc, gain, filter);
    });

    // Gentle breathing LFO filter
    const lfoOsc = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfoOsc.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 1 breath every 8 seconds
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    lfoOsc.connect(this.masterGain.gain);
    lfoOsc.start();
    this.activeNodes.push(lfoOsc, lfoGain);
  }

  // 2. Rintik Hujan & Gemericik Air Wudhu: Pink noise filtered rain + sporadic water droplets
  private buildRainCourtyard() {
    if (!this.ctx || !this.masterGain) return;

    // Pink noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, gain);

    // Periodic gentle water droplets
    const dripInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isRunning) return;
      try {
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const dropFreq = 900 + Math.random() * 700;

        dropOsc.type = "sine";
        dropOsc.frequency.setValueAtTime(dropFreq, now);
        dropOsc.frequency.exponentialRampToValueAtTime(dropFreq * 1.5, now + 0.04);

        dropGain.gain.setValueAtTime(0.04, now);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        dropOsc.connect(dropGain);
        dropGain.connect(this.masterGain);

        dropOsc.start(now);
        dropOsc.stop(now + 0.09);
      } catch {}
    }, 700);

    this.activeNodes.push(dripInterval);
  }

  // 3. Alunan Ney Bambu Sufi (Bamboo Flute Drone with gentle vibrato)
  private buildSufiNey() {
    if (!this.ctx || !this.masterGain) return;
    const baseFreq = 220; // A3

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    // Vibrato LFO
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(4.8, this.ctx.currentTime); // 4.8 Hz vibrato
    vibratoGain.gain.setValueAtTime(3.5, this.ctx.currentTime); // Pitch depth
    vibrato.connect(osc.frequency);
    vibrato.start();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(440, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    this.activeNodes.push(osc, gain, filter, vibrato, vibratoGain);

    // Sub-harmonic drone (A2 110Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
    subGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start();
    this.activeNodes.push(subOsc, subGain);
  }

  // 4. Detak Tasbih Kayu Tuma'ninah (Acoustic bead metronome at 48 BPM)
  private buildTasbihCadence() {
    if (!this.ctx || !this.masterGain) return;

    const playBeadClick = () => {
      if (!this.ctx || !this.masterGain || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = "sine";
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.045);
      } catch {}
    };

    playBeadClick();
    const interval = window.setInterval(playBeadClick, 1250); // 48 BPM cadence
    this.activeNodes.push(interval);
  }

  // 5. Gelombang Sakinah 432Hz Alpha (Binaural Beat 8Hz)
  private buildBinauralSakinah() {
    if (!this.ctx || !this.masterGain) return;

    // Left Ear 432 Hz
    const oscL = this.ctx.createOscillator();
    const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const gainL = this.ctx.createGain();

    oscL.type = "sine";
    oscL.frequency.setValueAtTime(432, this.ctx.currentTime);
    gainL.gain.setValueAtTime(0.18, this.ctx.currentTime);

    if (pannerL) {
      pannerL.pan.setValueAtTime(-0.9, this.ctx.currentTime);
      oscL.connect(pannerL);
      pannerL.connect(gainL);
    } else {
      oscL.connect(gainL);
    }
    gainL.connect(this.masterGain);
    oscL.start();

    // Right Ear 440 Hz (Difference = 8 Hz Alpha waves)
    const oscR = this.ctx.createOscillator();
    const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const gainR = this.ctx.createGain();

    oscR.type = "sine";
    oscR.frequency.setValueAtTime(440, this.ctx.currentTime);
    gainR.gain.setValueAtTime(0.18, this.ctx.currentTime);

    if (pannerR) {
      pannerR.pan.setValueAtTime(0.9, this.ctx.currentTime);
      oscR.connect(pannerR);
      pannerR.connect(gainR);
    } else {
      oscR.connect(gainR);
    }
    gainR.connect(this.masterGain);
    oscR.start();

    this.activeNodes.push(oscL, oscR, gainL, gainR);
  }
}

const ambientEngine = new AmbientSoundEngine();

// Guided Dhikr Recitation Audio Tracks using Speech Synthesis
export interface GuidedRecitationTrack {
  id: string;
  title: string;
  subtitle: string;
  category: "Pagi" | "Petang" | "Tuma'ninah" | "Taubat" | "Hajat";
  arabic: string;
  latin: string;
  translation: string;
  speechText: string;
  recommendedRepeats: number;
}

export const GUIDED_RECITATION_TRACKS: GuidedRecitationTrack[] = [
  {
    id: "dzikir_pagi_utama",
    title: "Wirid Pagi: Tiga Serangkai Perlindungan",
    subtitle: "Peredam cemas pembuka pintu keselamatan fajar",
    category: "Pagi",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    latin: "Bismillaahil-ladzii laa yadhurru ma'asmihii syai-un fil ardhi wa laa fis-samaa-i wa huwas-samii'ul 'aliim",
    translation: "Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan membahayakan, Dia Maha Mendengar lagi Maha Mengetahui.",
    speechText: "Bismillaahil ladzii laa yadhurru ma'asmihii syai-un fil ardhi wa laa fis-samaa-i wa huwas-samii'ul 'aliim. Dengan nama Allah yang tiada sesuatu pun di bumi dan langit yang dapat memudharatkan, dan Dia Maha Mendengar lagi Maha Mengetahui.",
    recommendedRepeats: 3,
  },
  {
    id: "tasbih_mizan_lengkap",
    title: "Dua Kalimat Dicintai Ar-Rahman",
    subtitle: "Ringan di lisan, berat di mizan timbangan akhirat",
    category: "Tuma'ninah",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    latin: "Subhaanallaahi wa bihamdihii, subhaanallaahil 'azhiim",
    translation: "Maha Suci Allah dengan segala puji bagi-Nya, Maha Suci Allah Yang Maha Agung.",
    speechText: "Subhaanallaahi wa bihamdihii, subhaanallaahil 'azhiim. Maha Suci Allah dengan segala puji bagi-Nya, Maha Suci Allah Yang Maha Agung.",
    recommendedRepeats: 33,
  },
  {
    id: "sayyidul_istighfar",
    title: "Sayyidul Istighfar (Raja Istighfar)",
    subtitle: "Penyembuh jiwa yang gundah dan pembuka ampunan mutlak",
    category: "Taubat",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    latin: "Allahumma Anta Rabbii laa ilaaha illaa Anta, khalaqtanii wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu...",
    translation: "Ya Allah, Engkau adalah Tuhanku, tiada Tuhan yang berhak disembah selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu...",
    speechText: "Allahumma Anta Rabbii laa ilaaha illaa Anta, khalaqtanii wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastatha'tu. A'uudzu bika min syarri maa shana'tu, abuu-u laka bini'matika 'alayya wa abuu-u bi dzanbii, faghfir lii fa innahu laa yaghfirudz-dzunuuba illaa Anta.",
    recommendedRepeats: 3,
  },
  {
    id: "hauqalah_tawakkal",
    title: "Hauqalah: Penyerahan Total kepada Allah",
    subtitle: "Gudang perbendaharaan Arsy pelepas beban pikiran",
    category: "Hajat",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    latin: "Laa hawla wa laa quwwata illaa billaahil 'aliyyil 'azhiim",
    translation: "Tiada daya dan tiada kekuatan melainkan semata-mata dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.",
    speechText: "Laa hawla wa laa quwwata illaa billaahil 'aliyyil 'azhiim. Tiada daya dan kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.",
    recommendedRepeats: 33,
  },
  {
    id: "shalawat_syifa",
    title: "Shalawat Thibbil Qulub (Penyembuh Hati)",
    subtitle: "Lantunan penyejuk dada dan penentram kegelisahan",
    category: "Tuma'ninah",
    arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوبِ وَدَوَائِهَا ، وَعَافِيَةِ الْأَبْدَانِ وَشِفَائِهَا",
    latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin thibbil quluubi wa dawaa-ihaa, wa 'aafiyatil abdaani wa syifaa-ihaa...",
    translation: "Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, sang penawar hati dan obatnya, penyehat badan dan penyembuhnya...",
    speechText: "Allahumma shalli 'alaa sayyidinaa Muhammadin thibbil quluubi wa dawaa-ihaa, wa 'aafiyatil abdaani wa syifaa-ihaa, wa nuuril abshaari wa dhiyaa-ihaa, wa 'alaa aalihii wa shahbihii wa sallim.",
    recommendedRepeats: 11,
  },
];

export interface AmbientPresetItem {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  color: string;
  freqInfo: string;
}

export const AMBIENT_PRESETS: AmbientPresetItem[] = [
  {
    id: "mosque_dawn",
    name: "Serambi Masjid Fajar",
    subtitle: "Alunan lembut harmoni subuh bayati 432Hz penentram batin",
    icon: Sun,
    color: "from-amber-600 to-amber-900",
    freqInfo: "432Hz Harmoni Fajar",
  },
  {
    id: "rain_courtyard",
    name: "Rintik Hujan & Air Wudhu",
    subtitle: "Gemericik air wudhu dan gerimis sejuk di pelataran masjid",
    icon: CloudRain,
    color: "from-teal-600 to-cyan-900",
    freqInfo: "Pink Noise Akustik",
  },
  {
    id: "sufi_ney",
    name: "Alunan Ney Bambu Sufi",
    subtitle: "Dengung meditatif seruling bambu Timur Tengah penuh kekhusyukan",
    icon: Wind,
    color: "from-emerald-700 to-slate-900",
    freqInfo: "Resonansi Maqam Bayati",
  },
  {
    id: "tasbih_cadence",
    name: "Detak Tasbih Kayu",
    subtitle: "Ketukan ritmis butiran tasbih kayu 48 BPM pemandu ritme wirid",
    icon: Music,
    color: "from-amber-700 to-stone-900",
    freqInfo: "Metronom 48 BPM",
  },
  {
    id: "binaural_sakinah",
    name: "Gelombang Alpha Sakinah",
    subtitle: "Frekuensi relaksasi 8Hz binaural untuk melepas stres dan cemas",
    icon: Waves,
    color: "from-indigo-600 to-slate-950",
    freqInfo: "8Hz Alpha Relaksasi",
  },
];

interface CalmingDhikrAudioPlayerProps {
  onMinimizeToFloatingBar?: () => void;
  onOpenDhikrTab?: () => void;
}

export default function CalmingDhikrAudioPlayer({
  onMinimizeToFloatingBar,
  onOpenDhikrTab,
}: CalmingDhikrAudioPlayerProps) {
  // Player state
  const [activeTab, setActiveTab] = useState<"ambient" | "guided" | "mixer">("ambient");

  // Ambient sound state
  const [selectedAmbient, setSelectedAmbient] = useState<string>("mosque_dawn");
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.65);

  // Guided recitation state
  const [selectedRecitation, setSelectedRecitation] = useState<GuidedRecitationTrack>(GUIDED_RECITATION_TRACKS[0]);
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [targetRepeats, setTargetRepeats] = useState<number>(3);
  const [currentRepeatCount, setCurrentRepeatCount] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(0.88); // Calm deliberate pace

  // Sleep / Session Timer (in minutes, 0 = unlimited)
  const [timerMinutes, setTimerMinutes] = useState<number>(15);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Equalizer visual bars animation
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([30, 45, 60, 40, 75, 50, 65, 35, 80, 55, 45, 65]);

  // Handle ambient play/pause
  const toggleAmbient = (presetId?: string) => {
    const targetId = presetId || selectedAmbient;
    if (isAmbientPlaying && (!presetId || presetId === selectedAmbient)) {
      ambientEngine.stop();
      setIsAmbientPlaying(false);
    } else {
      setSelectedAmbient(targetId);
      ambientEngine.playPreset(targetId, ambientVolume);
      setIsAmbientPlaying(true);
      // Start timer if not already active
      if (timerMinutes > 0 && secondsRemaining === null) {
        setSecondsRemaining(timerMinutes * 60);
      }
    }
  };

  // Handle ambient volume change
  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    ambientEngine.setMasterVolume(vol);
  };

  // Handle Guided Voice Recitation via Speech Synthesis
  const stopVoiceRecitation = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsVoicePlaying(false);
    setCurrentRepeatCount(0);
  };

  const startVoiceRecitation = (track = selectedRecitation, repeatTarget = targetRepeats) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser Anda tidak mendukung Web Speech Synthesis.");
      return;
    }

    window.speechSynthesis.cancel();
    setIsVoicePlaying(true);
    setCurrentRepeatCount(1);

    const playIteration = (currentIter: number) => {
      if (!isVoicePlaying && currentIter > 1) return;

      const utterance = new SpeechSynthesisUtterance(track.speechText);
      utterance.lang = "id-ID";
      utterance.rate = speechRate;
      utterance.pitch = 0.95; // Warm calm timbre
      utterance.volume = voiceVolume;

      utterance.onend = () => {
        if (currentIter < repeatTarget) {
          setCurrentRepeatCount(currentIter + 1);
          // 1.2 second peaceful pause between repetitions
          setTimeout(() => {
            playIteration(currentIter + 1);
          }, 1200);
        } else {
          setIsVoicePlaying(false);
          setCurrentRepeatCount(0);
        }
      };

      utterance.onerror = () => {
        setIsVoicePlaying(false);
        setCurrentRepeatCount(0);
      };

      window.speechSynthesis.speak(utterance);
    };

    playIteration(1);

    // Also start ambient if not playing and in mixer mode
    if (activeTab === "mixer" && !isAmbientPlaying) {
      toggleAmbient();
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0) return;

    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Timer finished: smoothly stop all audios
          ambientEngine.stop();
          setIsAmbientPlaying(false);
          stopVoiceRecitation();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [secondsRemaining, isAmbientPlaying, isVoicePlaying]);

  // Set timer options
  const handleSelectTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    if (minutes === 0) {
      setSecondsRemaining(null);
    } else {
      setSecondsRemaining(minutes * 60);
    }
  };

  // Equalizer animation effect
  useEffect(() => {
    if (!isAmbientPlaying && !isVoicePlaying) return;

    const eqInterval = window.setInterval(() => {
      setVisualizerHeights((prev) =>
        prev.map(() => 20 + Math.floor(Math.random() * 75))
      );
    }, 180);

    return () => window.clearInterval(eqInterval);
  }, [isAmbientPlaying, isVoicePlaying]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      ambientEngine.stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Format seconds to MM:SS
  const formatTimerTime = (secs: number | null) => {
    if (secs === null) return "--:--";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div id="calming-dhikr-audio-module" className="space-y-6 animate-fade-in">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 rounded-3xl p-6 sm:p-7 text-white border border-teal-600/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/80 border border-teal-500/40 text-teal-300 text-xs font-semibold">
              <Headphones className="w-3.5 h-3.5 text-amber-300" />
              <span>CALMING AUDIO RECITATION &amp; AMBIENT DHIKR LOOPS</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <span>Lantunan &amp; Soundscape Dzikir</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-400 text-slate-950 font-bold uppercase tracking-wider">
                Tuma&apos;ninah Audio
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-teal-200/90 leading-relaxed">
              Dengarkan lantunan dzikir ma&apos;tsur yang menenangkan atau nyalakan loop suara alam masjid (gerimis
              pelataran, dengung bayati 432Hz, detak tasbih kayu) sebagai pendamping khusyuk selama wirid harian Anda.
            </p>
          </div>

          {/* Master Control & Equalizer Visualizer */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {/* Visualizer bars */}
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-teal-700/60 flex items-center gap-1.5 h-14 min-w-[200px] justify-center shadow-inner">
              {visualizerHeights.map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isAmbientPlaying || isVoicePlaying
                      ? "bg-gradient-to-t from-teal-500 via-emerald-400 to-amber-300"
                      : "bg-slate-700 h-2"
                  }`}
                  style={{
                    height: isAmbientPlaying || isVoicePlaying ? `${h}%` : "6px",
                  }}
                />
              ))}
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAmbientPlaying || isVoicePlaying ? "bg-amber-400 animate-ping" : "bg-slate-600"
                }`}
              ></span>
              <span className="text-teal-200 font-mono text-[11px]">
                {isAmbientPlaying && isVoicePlaying
                  ? "Soundscape & Recitation Aktif"
                  : isAmbientPlaying
                  ? "Loop Soundscape Aktif"
                  : isVoicePlaying
                  ? "Lantunan Suara Berjalan"
                  : "Audio Hening (Siap Dimainkan)"}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM QUICK BAR: TIMER & VOLUME */}
        <div className="relative z-10 mt-6 pt-5 border-t border-teal-800/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Sleep / Session Timer Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-teal-300 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pengatur Waktu Sesi (Auto Sleep):</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-teal-800/80">
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectTimer(mins)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold transition ${
                    timerMinutes === mins && secondsRemaining !== null
                      ? "bg-teal-500 text-slate-950 shadow-2xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {mins}m
                </button>
              ))}
              <button
                onClick={() => handleSelectTimer(0)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
                  timerMinutes === 0
                    ? "bg-teal-500 text-slate-950 shadow-2xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                ∞ Tanpa Batas
              </button>
            </div>

            {secondsRemaining !== null && (
              <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-amber-400/40">
                Sisa: {formatTimerTime(secondsRemaining)}
              </span>
            )}
          </div>

          {/* Master Stop Button */}
          {(isAmbientPlaying || isVoicePlaying) && (
            <button
              onClick={() => {
                ambientEngine.stop();
                setIsAmbientPlaying(false);
                stopVoiceRecitation();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-500/60 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <VolumeX className="w-3.5 h-3.5 text-red-300" />
              <span>Hentikan Semua Audio</span>
            </button>
          )}
        </div>
      </div>

      {/* PLAYER SUBTABS (AMBIENT / GUIDED RECITATIONS / DUAL MIXER) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("ambient")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "ambient"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Soundscape &amp; Loop Suasana ({AMBIENT_PRESETS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("guided")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "guided"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Lantunan Bersuara &amp; Tadabbur ({GUIDED_RECITATION_TRACKS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("mixer")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "mixer"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Dual-Mixer Harmoni</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AMBIENT SOUNDSCAPES & LOOPS */}
      {activeTab === "ambient" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AMBIENT_PRESETS.map((preset) => {
              const IconComp = preset.icon;
              const isCurrentPlaying = isAmbientPlaying && selectedAmbient === preset.id;

              return (
                <div
                  key={preset.id}
                  className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden ${
                    isCurrentPlaying
                      ? "bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white border-emerald-500 ring-2 ring-emerald-500/30"
                      : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isCurrentPlaying
                            ? "bg-emerald-800 text-amber-300"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isCurrentPlaying
                            ? "bg-emerald-800/80 text-emerald-200 border border-emerald-500/60"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {preset.freqInfo}
                      </span>
                    </div>

                    <div>
                      <h4
                        className={`text-base font-bold ${
                          isCurrentPlaying ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {preset.name}
                      </h4>
                      <p
                        className={`text-xs leading-relaxed mt-0.5 ${
                          isCurrentPlaying ? "text-emerald-200/90" : "text-slate-500"
                        }`}
                      >
                        {preset.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Play / Pause Toggle Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100/10">
                    <button
                      onClick={() => toggleAmbient(preset.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                        isCurrentPlaying
                          ? "bg-amber-400 hover:bg-amber-300 text-slate-950"
                          : "bg-emerald-800 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-slate-950" />
                          <span>Jeda Loop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Mainkan Soundscape</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Volume Slider Bar for Ambient Loop */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800">
                <Volume2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Volume Suara Soundscape Ambient</h4>
                <p className="text-xs text-slate-500">Sesuaikan volume agar lembut dan tidak mendominasi konsentrasi batin.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 min-w-[220px]">
              <span className="text-xs font-mono font-bold text-slate-600">
                {Math.round(ambientVolume * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GUIDED RECITATIONS & SPOKEN TADABBUR */}
      {activeTab === "guided" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Track list (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pilih Bacaan Ma&apos;tsur</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">5 Pilihan</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {GUIDED_RECITATION_TRACKS.map((track) => {
                const isSelected = selectedRecitation.id === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      if (isVoicePlaying) stopVoiceRecitation();
                      setSelectedRecitation(track);
                      setTargetRepeats(track.recommendedRepeats);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-2xs"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-emerald-950" : "text-slate-800"}`}>
                          {track.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-500 shrink-0 font-mono">
                          {track.recommendedRepeats}x
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{track.subtitle}</p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 shrink-0">
                      {track.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Active Recitation Player & Highlights (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm space-y-6">
            {/* Header & Arabic */}
            <div className="text-center space-y-3 border-b border-slate-100 pb-5">
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider inline-block">
                Kategori {selectedRecitation.category}
              </span>

              <h3 className="text-lg font-bold text-slate-900">{selectedRecitation.title}</h3>

              <div className="text-right font-arabic text-2xl sm:text-3xl leading-loose font-bold text-emerald-950 pt-1">
                {selectedRecitation.arabic}
              </div>

              <p className="text-xs text-emerald-800 font-sans italic leading-relaxed">
                {selectedRecitation.latin}
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-serif">
                &ldquo;{selectedRecitation.translation}&rdquo;
              </div>
            </div>

            {/* Recitation Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Repetition Target Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>Jumlah Pengulangan:</span>
                    <span className="font-mono text-emerald-700 font-bold">{targetRepeats}x Putaran</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 3, 7, 33].map((num) => (
                      <button
                        key={num}
                        onClick={() => setTargetRepeats(num)}
                        className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                          targetRepeats === num
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speech Cadence Speed */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>Kecepatan Tempo:</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {speechRate <= 0.8 ? "Sangat Tenang" : speechRate <= 0.95 ? "Tuma'ninah Sedang" : "Normal"}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Tenang", rate: 0.8 },
                      { label: "Sedang", rate: 0.9 },
                      { label: "Standar", rate: 1.0 },
                    ].map((item) => (
                      <button
                        key={item.rate}
                        onClick={() => setSpeechRate(item.rate)}
                        className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                          speechRate === item.rate
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs font-bold"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Play / Stop Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    if (isVoicePlaying) {
                      stopVoiceRecitation();
                    } else {
                      startVoiceRecitation();
                    }
                  }}
                  className={`flex-1 py-3 px-6 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md ${
                    isVoicePlaying
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white"
                  }`}
                >
                  {isVoicePlaying ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Hentikan Lantunan (Sedang Putaran {currentRepeatCount}/{targetRepeats})</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Mulai Lantunan Audio Bersuara ({targetRepeats}x)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DUAL-LAYER HARMONY MIXER */}
      {activeTab === "mixer" && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-700" />
              <span>Dual-Layer Audio Mixer (Soundscape + Lantunan)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Kombinasikan latar belakang suara alam masjid (gerimis atau bayati drone) dengan bacaan dzikir bersuara
              secara simultan untuk pengalaman yang mendalam dan menentramkan jiwa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Layer 1: Ambient Channel */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-teal-600" />
                  <span>Kanal 1: Background Loop</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAmbientPlaying ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                  {isAmbientPlaying ? "Aktif" : "Mati"}
                </span>
              </div>

              <select
                value={selectedAmbient}
                onChange={(e) => {
                  setSelectedAmbient(e.target.value);
                  if (isAmbientPlaying) {
                    ambientEngine.playPreset(e.target.value, ambientVolume);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                {AMBIENT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.freqInfo})
                  </option>
                ))}
              </select>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Volume Soundscape:</span>
                  <span className="font-mono font-bold">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <button
                onClick={() => toggleAmbient()}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  isAmbientPlaying
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-teal-700 hover:bg-teal-800 text-white shadow-2xs"
                }`}
              >
                {isAmbientPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAmbientPlaying ? "Jeda Soundscape" : "Nyalakan Soundscape"}</span>
              </button>
            </div>

            {/* Layer 2: Vocal Recitation Channel */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Kanal 2: Lantunan Suara</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isVoicePlaying ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}>
                  {isVoicePlaying ? `Putaran ${currentRepeatCount}/${targetRepeats}` : "Mati"}
                </span>
              </div>

              <select
                value={selectedRecitation.id}
                onChange={(e) => {
                  const found = GUIDED_RECITATION_TRACKS.find((t) => t.id === e.target.value);
                  if (found) {
                    if (isVoicePlaying) stopVoiceRecitation();
                    setSelectedRecitation(found);
                    setTargetRepeats(found.recommendedRepeats);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                {GUIDED_RECITATION_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Volume Vokal:</span>
                  <span className="font-mono font-bold">{Math.round(voiceVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  if (isVoicePlaying) {
                    stopVoiceRecitation();
                  } else {
                    startVoiceRecitation();
                  }
                }}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  isVoicePlaying
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs"
                }`}
              >
                {isVoicePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isVoicePlaying ? "Hentikan Suara" : "Mulai Lantunan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
