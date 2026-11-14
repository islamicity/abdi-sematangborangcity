import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Globe,
  Users,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Plus,
  Heart,
  TrendingUp,
  CheckCircle2,
  Clock,
  Radio,
  Share2,
  Check,
} from "lucide-react";

export interface RecitationItem {
  id: string;
  lafadz: string;
  count: number;
  location: string;
  timestamp: string;
}

export interface GlobalDhikrState {
  totalCount: number;
  todayCount: number;
  activeReciters: number;
  breakdown: {
    subhanallah: number;
    alhamdulillah: number;
    allahuakbar: number;
    astaghfirullah: number;
    lailahaillallah: number;
    sholawat: number;
  };
  recentRecitations: RecitationItem[];
}

// Gentle audio chime for community recitation
const playCollectiveChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
};

interface GlobalDhikrCounterOverlayProps {
  onReciteDhikr?: (count: number, lafadz: string) => void;
}

export default function GlobalDhikrCounterOverlay({
  onReciteDhikr,
}: GlobalDhikrCounterOverlayProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [newRecitationAlert, setNewRecitationAlert] = useState<RecitationItem | null>(null);

  const [state, setState] = useState<GlobalDhikrState>({
    totalCount: 142850,
    todayCount: 18450,
    activeReciters: 1,
    breakdown: {
      subhanallah: 42100,
      alhamdulillah: 38900,
      allahuakbar: 31200,
      astaghfirullah: 18600,
      lailahaillallah: 8900,
      sholawat: 3150,
    },
    recentRecitations: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Fetch initial state via HTTP fallback
  const fetchInitialState = async () => {
    try {
      const res = await fetch("/api/global-dhikr");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (e) {
      console.warn("Could not fetch global dhikr via HTTP:", e);
    }
  };

  // WebSocket Connection Management
  useEffect(() => {
    fetchInitialState();

    const connectWs = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws/global-dhikr`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "init") {
              setState(data.payload);
            } else if (data.type === "dhikr:updated") {
              const { totalCount, todayCount, breakdown, recentRecitation, activeReciters } = data.payload;
              setState((prev) => ({
                ...prev,
                totalCount: totalCount ?? prev.totalCount,
                todayCount: todayCount ?? prev.todayCount,
                breakdown: breakdown ?? prev.breakdown,
                activeReciters: activeReciters ?? prev.activeReciters,
                recentRecitations: recentRecitation
                  ? [recentRecitation, ...prev.recentRecitations.slice(0, 19)]
                  : prev.recentRecitations,
              }));

              if (recentRecitation) {
                setNewRecitationAlert(recentRecitation);
                setTimeout(() => setNewRecitationAlert(null), 3500);

                if (soundEnabled) {
                  playCollectiveChime();
                }
              }
            } else if (data.type === "presence:updated") {
              setState((prev) => ({
                ...prev,
                activeReciters: data.payload.activeReciters,
              }));
            }
          } catch (err) {
            console.error("Error processing global dhikr WS packet:", err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Reconnect with backoff
          reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.warn("WebSocket initialization error, fallback to polling:", err);
      }
    };

    connectWs();

    // Periodic sync poll every 15s to keep counters fresh
    const pollInterval = setInterval(fetchInitialState, 15000);

    return () => {
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [soundEnabled]);

  // Participate and contribute recitations to the global count
  const handleContributeDhikr = async (count: number, lafadz: string) => {
    // Optimistic local update
    setState((prev) => {
      const lower = lafadz.toLowerCase();
      const newBreakdown = { ...prev.breakdown };
      if (lower.includes("subhan")) newBreakdown.subhanallah += count;
      else if (lower.includes("alhamdu")) newBreakdown.alhamdulillah += count;
      else if (lower.includes("akbar")) newBreakdown.allahuakbar += count;
      else if (lower.includes("astaghfir")) newBreakdown.astaghfirullah += count;
      else if (lower.includes("tahlil") || lower.includes("laa ilaaha")) newBreakdown.lailahaillallah += count;
      else newBreakdown.subhanallah += count;

      return {
        ...prev,
        totalCount: prev.totalCount + count,
        todayCount: prev.todayCount + count,
        breakdown: newBreakdown,
      };
    });

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#10b981", "#f59e0b", "#38bdf8"],
      });
      playCollectiveChime();
    } catch {}

    if (onReciteDhikr) {
      onReciteDhikr(count, lafadz);
    }

    // Send via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "dhikr:increment",
          count,
          lafadz,
          location: "Jamaah Sematang Borang",
        })
      );
    } else {
      // HTTP fallback
      try {
        await fetch("/api/global-dhikr/increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            count,
            lafadz,
            location: "Jamaah Sematang Borang",
          }),
        });
      } catch (e) {
        console.warn("Could not post global dhikr via HTTP:", e);
      }
    }
  };

  const handleShare = () => {
    const text = `🌍 ✨ *Global Dhikr Jamaah Islamicity Kaffah*
Total Repetisi Jamaah: ${state.totalCount.toLocaleString("id-ID")}x
Hari Ini: ${state.todayCount.toLocaleString("id-ID")}x wirid bersama
Aktif Saat Ini: ${state.activeReciters} Jamaah Bersholawat & Berdzikir

"Tidaklah suatu kaum berkumpul mengingat Allah, melainkan malaikat menaungi mereka dengan rahmat." (HR. Muslim)
Bergabunglah bersama kami di abdi.sematangborangcity.cloud`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Compute breakdown percentages
  const totalBreakdown =
    state.breakdown.subhanallah +
    state.breakdown.alhamdulillah +
    state.breakdown.allahuakbar +
    state.breakdown.astaghfirullah +
    state.breakdown.lailahaillallah +
    state.breakdown.sholawat;

  return (
    <>
      {/* FLOATING HUD OVERLAY PILL (STICKY BOTTOM-RIGHT) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 animate-fade-in pointer-events-auto">
        {/* Live Notification Toast when someone recites */}
        {newRecitationAlert && (
          <div className="bg-slate-950/95 text-white px-3.5 py-2 rounded-2xl border border-amber-400/70 shadow-2xl flex items-center gap-2.5 text-xs animate-bounce backdrop-blur-md max-w-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <div className="min-w-0">
              <span className="font-bold text-amber-300 block truncate">
                +{newRecitationAlert.count}x {newRecitationAlert.lafadz}
              </span>
              <span className="text-[10px] text-emerald-300 block truncate">
                {newRecitationAlert.location}
              </span>
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-emerald-950 via-slate-950 to-teal-950 text-white rounded-full pl-3 pr-4 py-2.5 border border-emerald-500/50 shadow-2xl hover:border-amber-400 transition cursor-pointer flex items-center gap-3 backdrop-blur-md group select-none ring-2 ring-emerald-500/20"
        >
          {/* Pulsing Live Presence Dot */}
          <div className="relative flex items-center justify-center">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-emerald-400" : "bg-amber-400"
              }`}
            ></span>
            <span
              className={`absolute w-5 h-5 rounded-full animate-ping opacity-75 ${
                isConnected ? "bg-emerald-400" : "bg-amber-400"
              }`}
            ></span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Global Dhikr Jamaah
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-amber-300 text-sm tracking-tight">
                {state.totalCount.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] text-emerald-300 font-medium hidden sm:inline">
                ({state.activeReciters} Online)
              </span>
            </div>
          </div>

          <div className="p-1 rounded-full bg-slate-800 text-slate-300 group-hover:text-white transition">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* FULL EXPANDED COLLECTIVE DHIKR MODAL / DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-emerald-500/60 shadow-2xl text-white space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Background Blurs */}
            <div className="absolute right-0 top-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-10 bottom-0 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* TOP HEADER */}
            <div className="relative z-10 flex items-start justify-between gap-4 border-b border-emerald-800/60 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>REAL-TIME MULTI-USER DHIKR COUNTER</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>Samudera Dzikir Jamaah</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono">
                    {isConnected ? "🟢 Live Sync" : "🟡 Polling"}
                  </span>
                </h3>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Setiap hembusan wirid jamaah di Sematang Borang terhimpun serentak di sini.
                  Satukan niat dan lisan memperberat timbangan amal kebaikan bersama.
                </p>
              </div>

              {/* Action Buttons: Sound, Share, Close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border transition text-xs ${
                    soundEnabled
                      ? "bg-amber-400 text-slate-950 border-amber-400 font-bold"
                      : "bg-slate-900/80 text-slate-400 border-slate-700"
                  }`}
                  title={soundEnabled ? "Audio Lonceng Aktif" : "Audio Hening"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-700 transition text-xs"
                  title="Bagikan Statistik Global"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* BIG COLLECTIVE DIGITAL COUNTER DISPLAY */}
            <div className="relative z-10 bg-slate-900/90 rounded-3xl p-6 border border-emerald-700/60 shadow-inner flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Akumulasi Total Repetisi Seluruh Jamaah</span>
              </span>

              <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200">
                {state.totalCount.toLocaleString("id-ID")}
              </div>

              {/* Sub-counters: Today & Active */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs">
                <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/60 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300">Hari Ini:</span>
                  <span className="font-mono font-bold text-amber-300">
                    +{state.todayCount.toLocaleString("id-ID")} wirid
                  </span>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-600/60 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-slate-300">Sedang Berdzikir:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {state.activeReciters} Jamaah Aktif
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK CONTRIBUTE ACTION BUTTONS */}
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>Ikut Berdzikir Bersama Jamaah (Klik untuk menyumbang repetisi):</span>
                </span>
                <span className="text-[10px] text-emerald-300">Tersinkron Real-Time</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "Subhanallah", reps: 33, bg: "from-emerald-700 to-teal-800" },
                  { label: "Alhamdulillah", reps: 33, bg: "from-teal-700 to-emerald-800" },
                  { label: "Allahu Akbar", reps: 33, bg: "from-amber-700 to-amber-900" },
                  { label: "Astaghfirullah", reps: 70, bg: "from-slate-700 to-slate-900" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => handleContributeDhikr(btn.reps, btn.label)}
                    className={`p-3 rounded-2xl bg-gradient-to-br ${btn.bg} border border-emerald-500/40 hover:border-amber-400 transition flex flex-col items-center justify-center text-center shadow-md active:scale-95`}
                  >
                    <span className="text-xs font-bold text-white">{btn.label}</span>
                    <span className="text-[11px] font-mono font-black text-amber-300 mt-0.5">
                      +{btn.reps}x
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* BREAKDOWN BY LAFADZ PROGRESS */}
            <div className="relative z-10 bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-emerald-800/80 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Komposisi Kalimat Thayyibah Terhimpun
              </span>

              <div className="space-y-2 text-xs">
                {[
                  { name: "Subhanallah", count: state.breakdown.subhanallah, color: "bg-emerald-500" },
                  { name: "Alhamdulillah", count: state.breakdown.alhamdulillah, color: "bg-teal-400" },
                  { name: "Allahu Akbar", count: state.breakdown.allahuakbar, color: "bg-amber-400" },
                  { name: "Astaghfirullah", count: state.breakdown.astaghfirullah, color: "bg-cyan-400" },
                  { name: "Laa Ilaaha Illallah", count: state.breakdown.lailahaillallah, color: "bg-indigo-400" },
                  { name: "Sholawat Nabi", count: state.breakdown.sholawat, color: "bg-rose-400" },
                ].map((item) => {
                  const pct = totalBreakdown > 0 ? Math.round((item.count / totalBreakdown) * 100) : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="font-mono text-emerald-200">
                          {item.count.toLocaleString("id-ID")} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE STREAM TICKER / RECENT RECITATIONS */}
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Aktivitas Wirid Jamaah Terkini (Real-Time Stream)
              </span>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {state.recentRecitations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">
                    Menunggu aliran wirid berikutnya...
                  </p>
                ) : (
                  state.recentRecitations.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-800/50 flex items-center justify-between text-xs animate-fade-in"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-900/80 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                          +{item.count}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{item.lafadz}</span>
                          <span className="text-[10px] text-emerald-300">{item.location}</span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* HADITH WISDOM FOOTER */}
            <div className="relative z-10 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/40 text-xs text-emerald-200/90 italic font-serif leading-relaxed">
              &ldquo;Tidaklah suatu kaum duduk berkumpul mengingat Allah, melainkan para malaikat mengelilingi mereka, rahmat melingkupi mereka, ketenteraman turun kepada mereka, dan Allah menyebut-nyebut mereka di hadapan para malaikat di sisi-Nya.&rdquo;
              <span className="block font-sans not-italic font-bold text-amber-300 text-[10px] mt-1">
                (HR. Muslim no. 2700)
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
