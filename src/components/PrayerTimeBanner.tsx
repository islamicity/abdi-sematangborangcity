import { useState, useEffect } from "react";
import { Compass, Bell, BellOff, MapPin, Volume2, Sparkles } from "lucide-react";
import { PRAYER_TIMES_SEMATANG_BORANG } from "../data/mockData";

export default function PrayerTimeBanner() {
  const [adzanNotification, setAdzanNotification] = useState<boolean>(true);
  const [activeAdzanSound, setActiveAdzanSound] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playAdzanSample = () => {
    setActiveAdzanSound(true);
    setTimeout(() => {
      setActiveAdzanSound(false);
    }, 4000);
  };

  return (
    <div id="prayer-time-banner" className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white border-b border-emerald-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Location & Qibla indicator */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-800/80 border border-emerald-700/60">
                <Compass className="w-5 h-5 text-emerald-300 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Jadwal Sholat Sematang Borang</span>
                </div>
                <div className="text-[11px] text-emerald-300/80 flex items-center gap-2">
                  <span>Arah Kiblat: <strong>295.2° Barat Laut</strong> (NW)</span>
                  <span className="text-emerald-500">•</span>
                  <span>Palembang, Sumsel</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="toggle-adzan-notification"
                onClick={() => setAdzanNotification(!adzanNotification)}
                title={adzanNotification ? "Pengingat Adzan Aktif" : "Pengingat Adzan Nonaktif"}
                className={`p-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition ${
                  adzanNotification
                    ? "bg-emerald-700/70 border-emerald-500/60 text-emerald-200"
                    : "bg-emerald-950/60 border-emerald-800/40 text-emerald-400"
                }`}
              >
                {adzanNotification ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{adzanNotification ? "Adzan ON" : "Mute"}</span>
              </button>

              <button
                id="test-adzan-audio-btn"
                onClick={playAdzanSample}
                className="p-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-700/40 text-emerald-300 text-xs flex items-center gap-1 transition"
                title="Dengarkan kumandang adzan"
              >
                <Volume2 className={`w-3.5 h-3.5 ${activeAdzanSound ? "animate-bounce text-amber-300" : ""}`} />
                <span className="hidden sm:inline">{activeAdzanSound ? "Allahu Akbar..." : "Tes Suara"}</span>
              </button>
            </div>
          </div>

          {/* Prayer Time Pills Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full lg:w-auto">
            {PRAYER_TIMES_SEMATANG_BORANG.map((prayer) => {
              const isNext = prayer.name === "Ashar";
              return (
                <div
                  key={prayer.name}
                  className={`px-3 py-1.5 rounded-lg border text-center transition-all ${
                    isNext
                      ? "bg-gradient-to-b from-amber-500/30 to-amber-600/20 border-amber-400/80 shadow-md ring-1 ring-amber-400/40"
                      : "bg-emerald-950/60 border-emerald-800/50 hover:bg-emerald-900/60"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-emerald-200">
                    <span>{prayer.name}</span>
                    {isNext && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <div className={`text-sm font-bold tracking-tight ${isNext ? "text-amber-300" : "text-white"}`}>
                    {prayer.time}
                  </div>
                  <div className="text-[10px] text-emerald-300/60 font-serif">{prayer.arabic}</div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
