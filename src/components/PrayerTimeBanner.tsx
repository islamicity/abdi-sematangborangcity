import { useState, useEffect, useMemo, useRef } from "react";
import { Compass, Bell, BellOff, MapPin, Volume2, Clock } from "lucide-react";
import { PrayerTime } from "../types";
import {
  calculateSematangBorangPrayerTimes,
  fetchKemenagPrayerTimes,
  getJakartaDateParts,
  resolveUpcomingPrayer,
} from "../utils/prayerTimes";

const playAdzanReminderChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.25);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.25);
      gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + idx * 0.25 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.25 + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.25);
      osc.stop(ctx.currentTime + idx * 0.25 + 0.9);
    });
  } catch {
    // Ignore audio context restrictions if blocked
  }
};

export default function PrayerTimeBanner() {
  const [adzanNotification, setAdzanNotification] = useState<boolean>(true);
  const [activeAdzanSound, setActiveAdzanSound] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [dailyPrayers, setDailyPrayers] = useState<PrayerTime[]>(() =>
    calculateSematangBorangPrayerTimes(new Date())
  );

  const jakartaParts = useMemo(
    () => getJakartaDateParts(currentTime),
    [currentTime]
  );

  const lastFetchedDateKeyRef = useRef<string>("");

  // Real-time 1-second clock tick
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Refresh Kemenag RI schedule when mounted or when Palembang calendar day rolls over
  useEffect(() => {
    if (lastFetchedDateKeyRef.current === jakartaParts.dateKey) return;
    lastFetchedDateKeyRef.current = jakartaParts.dateKey;

    let cancelled = false;
    setDailyPrayers(calculateSematangBorangPrayerTimes(currentTime));

    fetchKemenagPrayerTimes(currentTime).then(({ times }) => {
      if (!cancelled) {
        setDailyPrayers(times);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [jakartaParts.dateKey, currentTime]);

  // Dynamically highlight the upcoming obligatory prayer based on actual real-time WIB clock
  const upcomingStatus = useMemo(
    () => resolveUpcomingPrayer(dailyPrayers, currentTime),
    [dailyPrayers, currentTime]
  );

  const playAdzanSample = () => {
    setActiveAdzanSound(true);
    playAdzanReminderChime();
    window.setTimeout(() => {
      setActiveAdzanSound(false);
    }, 3500);
  };

  return (
    <div
      id="prayer-time-banner"
      className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white border-b border-emerald-800/80 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Location, Live WIB Clock & Qibla indicator */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-800/80 border border-emerald-700/60 shrink-0">
                <Compass className="w-5 h-5 text-emerald-300 animate-spin-slow" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-emerald-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Jadwal Sholat Sematang Borang</span>
                  <span className="text-emerald-500">•</span>
                  <span className="inline-flex items-center gap-1 font-mono text-amber-300 font-bold">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {jakartaParts.formattedTime}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-300/85 flex flex-wrap items-center gap-2 mt-0.5">
                  <span>
                    Arah Kiblat: <strong>295.2° Barat Laut</strong> (NW)
                  </span>
                  <span className="text-emerald-500">•</span>
                  <span>
                    Menuju{" "}
                    <strong className="text-amber-300">
                      {upcomingStatus.nextPrayer.name}
                      {upcomingStatus.isTomorrow ? " (Besok)" : ""}
                    </strong>{" "}
                    <span className="font-mono text-amber-200">
                      (-{upcomingStatus.countdownText})
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="toggle-adzan-notification"
                type="button"
                onClick={() => setAdzanNotification(!adzanNotification)}
                title={
                  adzanNotification
                    ? "Pengingat Adzan Aktif"
                    : "Pengingat Adzan Nonaktif"
                }
                className={`p-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition ${
                  adzanNotification
                    ? "bg-emerald-700/70 border-emerald-500/60 text-emerald-200"
                    : "bg-emerald-950/60 border-emerald-800/40 text-emerald-400"
                }`}
              >
                {adzanNotification ? (
                  <Bell className="w-3.5 h-3.5" />
                ) : (
                  <BellOff className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {adzanNotification ? "Adzan ON" : "Mute"}
                </span>
              </button>

              <button
                id="test-adzan-audio-btn"
                type="button"
                onClick={playAdzanSample}
                className="p-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-700/40 text-emerald-300 text-xs flex items-center gap-1 transition"
                title="Dengarkan nada pengingat adzan"
              >
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    activeAdzanSound ? "animate-bounce text-amber-300" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {activeAdzanSound ? "Allahu Akbar..." : "Tes Suara"}
                </span>
              </button>
            </div>
          </div>

          {/* Prayer Time Pills Grid — Yellow Box Highlights Actual Upcoming Prayer */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full lg:w-auto">
            {upcomingStatus.prayers.map((prayer) => {
              const isNext = Boolean(prayer.isNext);
              return (
                <div
                  key={prayer.name}
                  title={
                    isNext
                      ? `Waktu sholat berikutnya: ${prayer.name} (${prayer.time} WIB)`
                      : `${prayer.name} (${prayer.time} WIB)`
                  }
                  className={`px-3 py-1.5 rounded-lg border text-center transition-all ${
                    isNext
                      ? "bg-gradient-to-b from-amber-500/30 to-amber-600/20 border-amber-400/80 shadow-md ring-1 ring-amber-400/40"
                      : "bg-emerald-950/60 border-emerald-800/50 hover:bg-emerald-900/60"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-emerald-200">
                    <span className={isNext ? "text-amber-200 font-bold" : ""}>
                      {prayer.name}
                    </span>
                    {isNext && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <div
                    className={`text-sm font-bold tracking-tight font-mono ${
                      isNext ? "text-amber-300" : "text-white"
                    }`}
                  >
                    {prayer.time}
                  </div>
                  <div className="text-[10px] text-emerald-300/60 font-serif">
                    {prayer.arabic}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
