import React, { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Area,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Trophy,
  Flame,
  Sun,
  Moon,
  RotateCcw,
  Sparkles,
  Info,
  ArrowUpRight,
  Target,
  BarChart3,
  LineChart,
  Layers,
} from "lucide-react";

export interface DayHistoryData {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // Sen, Sel, Rab, Kam, Jum, Sab, Ahd
  fullDate: string; // Senin, 22 Sep 2026
  morning: number;
  evening: number;
  freeTasbih: number;
  total: number;
  target: number;
  isToday: boolean;
  targetMet: boolean;
}

interface WeeklyConsistencyGraphProps {
  todayRepetitions: number;
  morningDoneReps: number;
  eveningDoneReps: number;
  freeTasbihReps: number;
  dailyRepetitionTarget: number;
  currentStreakDays: number;
  onNavigateToTab?: (tab: "morning" | "evening" | "free_tasbih" | "all") => void;
}

export default function WeeklyConsistencyGraph({
  todayRepetitions,
  morningDoneReps,
  eveningDoneReps,
  freeTasbihReps,
  dailyRepetitionTarget,
  currentStreakDays,
  onNavigateToTab,
}: WeeklyConsistencyGraphProps) {
  const [chartType, setChartType] = useState<"stacked_bar" | "trend_area">("stacked_bar");
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Generate 7-day date sequence ending today
  const last7DaysSequence = useMemo(() => {
    const days: { dateStr: string; dayLabel: string; fullDate: string; isToday: boolean }[] = [];
    const dayNames = ["Ahd", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const fullDayNames = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const date = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${date}`;
      const dayIdx = d.getDay();

      days.push({
        dateStr,
        dayLabel: i === 0 ? "Hari Ini" : dayNames[dayIdx],
        fullDate: `${fullDayNames[dayIdx]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${year}`,
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Load and merge weekly history with today's live stats
  const weeklyData: DayHistoryData[] = useMemo(() => {
    let savedMap: { [dateStr: string]: { morning: number; evening: number; freeTasbih: number } } = {};
    try {
      const stored = localStorage.getItem("islamicity_dhikr_weekly_history");
      if (stored) {
        savedMap = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Default seed data for the past 6 days if unpopulated (aligned with a 4-day streak)
    const seedDeltas = [
      { morning: 95, evening: 90, freeTasbih: 33 }, // Day -6 (218)
      { morning: 110, evening: 105, freeTasbih: 40 }, // Day -5 (255)
      { morning: 130, evening: 125, freeTasbih: 66 }, // Day -4 (Streak Day 1: 321 - Target Met)
      { morning: 125, evening: 130, freeTasbih: 50 }, // Day -3 (Streak Day 2: 305 - Target Met)
      { morning: 140, evening: 135, freeTasbih: 75 }, // Day -2 (Streak Day 3: 350 - Target Met)
      { morning: 135, evening: 140, freeTasbih: 66 }, // Day -1 (Streak Day 4: 341 - Target Met)
    ];

    return last7DaysSequence.map((dayItem, index) => {
      let morning = 0;
      let evening = 0;
      let freeTasbih = 0;

      if (dayItem.isToday) {
        morning = morningDoneReps;
        evening = eveningDoneReps;
        freeTasbih = freeTasbihReps;
      } else {
        const storedDay = savedMap[dayItem.dateStr];
        if (storedDay) {
          morning = storedDay.morning;
          evening = storedDay.evening;
          freeTasbih = storedDay.freeTasbih;
        } else {
          const fallbackSeed = seedDeltas[index] || { morning: 100, evening: 100, freeTasbih: 33 };
          morning = fallbackSeed.morning;
          evening = fallbackSeed.evening;
          freeTasbih = fallbackSeed.freeTasbih;
        }
      }

      const total = morning + evening + freeTasbih;
      const target = dailyRepetitionTarget > 0 ? dailyRepetitionTarget : 300;

      return {
        dateStr: dayItem.dateStr,
        dayLabel: dayItem.dayLabel,
        fullDate: dayItem.fullDate,
        morning,
        evening,
        freeTasbih,
        total,
        target,
        isToday: dayItem.isToday,
        targetMet: total >= target,
      };
    });
  }, [
    last7DaysSequence,
    morningDoneReps,
    eveningDoneReps,
    freeTasbihReps,
    dailyRepetitionTarget,
  ]);

  // Persist today's record into local history whenever counts change
  useEffect(() => {
    try {
      const todayItem = weeklyData.find((d) => d.isToday);
      if (!todayItem) return;

      const stored = localStorage.getItem("islamicity_dhikr_weekly_history");
      const currentMap = stored ? JSON.parse(stored) : {};

      currentMap[todayItem.dateStr] = {
        morning: todayItem.morning,
        evening: todayItem.evening,
        freeTasbih: todayItem.freeTasbih,
      };

      localStorage.setItem("islamicity_dhikr_weekly_history", JSON.stringify(currentMap));
    } catch (e) {
      console.warn("Could not sync weekly history to localStorage", e);
    }
  }, [weeklyData]);

  // Calculated Key Performance Indicators
  const metrics = useMemo(() => {
    const totalWeeklyReps = weeklyData.reduce((acc, curr) => acc + curr.total, 0);
    const avgDailyReps = Math.round(totalWeeklyReps / Math.max(1, weeklyData.length));
    const targetMetDaysCount = weeklyData.filter((d) => d.targetMet).length;
    const maxDay = weeklyData.reduce((prev, curr) => (curr.total > prev.total ? curr : prev), weeklyData[0]);

    return {
      totalWeeklyReps,
      avgDailyReps,
      targetMetDaysCount,
      highestDay: maxDay,
      consistencyRate: Math.round((targetMetDaysCount / weeklyData.length) * 100),
    };
  }, [weeklyData]);

  const activeInspectedDay = selectedDayIndex !== null ? weeklyData[selectedDayIndex] : weeklyData[weeklyData.length - 1];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DayHistoryData = payload[0].payload;
      const pct = Math.round((data.total / Math.max(1, data.target)) * 100);

      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-emerald-500/40 backdrop-blur-md min-w-[200px] text-xs space-y-2 font-sans animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-bold text-emerald-300">{data.fullDate}</span>
            {data.isToday && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                Hari Ini
              </span>
            )}
          </div>

          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-300">Total Repetisi:</span>
            <span className="font-bold text-amber-300 text-sm">{data.total}x</span>
          </div>

          <div className="space-y-1 pt-1 text-[11px] border-t border-slate-800">
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                Dzikir Pagi:
              </span>
              <span className="font-mono font-bold">{data.morning} rep</span>
            </div>

            <div className="flex items-center justify-between text-teal-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
                Dzikir Petang:
              </span>
              <span className="font-mono font-bold">{data.evening} rep</span>
            </div>

            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                Tasbih Bebas:
              </span>
              <span className="font-mono font-bold">{data.freeTasbih} rep</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target ({data.target}x):</span>
            <span className={`font-bold ${data.targetMet ? "text-emerald-400" : "text-amber-400"}`}>
              {pct}% {data.targetMet ? "• Tuntas ✨" : "• Berjalan"}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="weekly-consistency-graph-container" className="bg-white rounded-2xl border border-emerald-200/90 p-5 sm:p-6 shadow-sm space-y-6 relative overflow-hidden">
      {/* Background Decorative Islamic Accent */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Header & Chart View Controller */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                Grafik Konsistensi 7-Hari Istiqomah
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-mono">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {currentStreakDays} Hari Streak
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi repetisi wirid dan capaian target harian selama sepekan terakhir.
              </p>
            </div>
          </div>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-center">
          <button
            onClick={() => setChartType("stacked_bar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              chartType === "stacked_bar"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rincian Sesi</span>
          </button>

          <button
            onClick={() => setChartType("trend_area")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              chartType === "trend_area"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Tren Total</span>
          </button>
        </div>
      </div>

      {/* 4-KPI SUMMARY TILES */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tile 1: Rata-Rata Harian */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Rata-Rata Sepekan</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {metrics.avgDailyReps.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-slate-500">rep/hari</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">
            {metrics.avgDailyReps >= dailyRepetitionTarget ? "Di atas target harian ✨" : "Konsisten bertumbuh"}
          </div>
        </div>

        {/* Tile 2: Hari Target Tuntas */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
          <div className="text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
            <span>Target Tercapai</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
            {metrics.targetMetDaysCount}{" "}
            <span className="text-xs font-normal text-emerald-700">/ 7 Hari</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">
            {metrics.consistencyRate}% Ketercapaian
          </div>
        </div>

        {/* Tile 3: Puncak Tertinggi */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
          <div className="text-[11px] font-semibold text-amber-900 flex items-center justify-between">
            <span>Puncak Tertinggi</span>
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
            {metrics.highestDay.total.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-amber-800">rep</span>
          </div>
          <div className="text-[10px] text-amber-800 truncate">
            {metrics.highestDay.dayLabel} ({metrics.highestDay.fullDate.split(",")[0]})
          </div>
        </div>

        {/* Tile 4: Total Volume Sepekan */}
        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
          <div className="text-[11px] font-semibold text-teal-900 flex items-center justify-between">
            <span>Total Akumulasi</span>
            <Layers className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-950 font-mono">
            {metrics.totalWeeklyReps.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-teal-800">repetisi</span>
          </div>
          <div className="text-[10px] text-teal-800">Pemberat timbangan mizan</div>
        </div>
      </div>

      {/* RECHARTS CANVAS CONTAINER */}
      <div className="relative z-10 pt-2">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "stacked_bar" ? (
              <ComposedChart
                data={weeklyData}
                margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <defs>
                  <linearGradient id="barMorningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="barEveningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="barFreeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="dayLabel"
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tick={({ x, y, payload }) => {
                    const isTodayTick = payload.value === "Hari Ini";
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={12}
                          dy={4}
                          textAnchor="middle"
                          fill={isTodayTick ? "#047857" : "#64748b"}
                          fontSize={isTodayTick ? "12px" : "11px"}
                          fontWeight={isTodayTick ? "bold" : "500"}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  domain={[0, (dataMax: number) => Math.max(dailyRepetitionTarget + 50, Math.ceil(dataMax * 1.15))]}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Target Baseline Reference Line */}
                <ReferenceLine
                  y={dailyRepetitionTarget}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Target: ${dailyRepetitionTarget}x`,
                    position: "insideTopRight",
                    fill: "#ef4444",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />

                {/* Stacked Bars with gentle rounded corners */}
                <Bar
                  dataKey="morning"
                  name="Dzikir Pagi"
                  stackId="reps"
                  fill="url(#barMorningGrad)"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={42}
                />
                <Bar
                  dataKey="evening"
                  name="Dzikir Petang"
                  stackId="reps"
                  fill="url(#barEveningGrad)"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={42}
                />
                <Bar
                  dataKey="freeTasbih"
                  name="Tasbih Bebas"
                  stackId="reps"
                  fill="url(#barFreeGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              </ComposedChart>
            ) : (
              <ComposedChart
                data={weeklyData}
                margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <defs>
                  <linearGradient id="areaTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="dayLabel"
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tick={({ x, y, payload }) => {
                    const isTodayTick = payload.value === "Hari Ini";
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={12}
                          dy={4}
                          textAnchor="middle"
                          fill={isTodayTick ? "#047857" : "#64748b"}
                          fontSize={isTodayTick ? "12px" : "11px"}
                          fontWeight={isTodayTick ? "bold" : "500"}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  domain={[0, (dataMax: number) => Math.max(dailyRepetitionTarget + 50, Math.ceil(dataMax * 1.15))]}
                />

                <Tooltip content={<CustomTooltip />} />

                <ReferenceLine
                  y={dailyRepetitionTarget}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Target: ${dailyRepetitionTarget}x`,
                    position: "insideTopRight",
                    fill: "#ef4444",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Repetisi"
                  stroke="#059669"
                  strokeWidth={3}
                  fill="url(#areaTotalGrad)"
                />

                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#047857"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#047857", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
            <span>Dzikir Pagi</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-teal-600 inline-block"></span>
            <span>Dzikir Petang</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
            <span>Tasbih Bebas</span>
          </div>

          <div className="flex items-center gap-1.5 text-red-600 font-semibold">
            <span className="w-4 h-0.5 border-b-2 border-dashed border-red-500 inline-block"></span>
            <span>Garis Target ({dailyRepetitionTarget}x)</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE DAY INSPECTOR CARD */}
      {activeInspectedDay && (
        <div className="relative z-10 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">
                Detail: {activeInspectedDay.fullDate}
              </span>
              {activeInspectedDay.isToday ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Hari Ini (Live)
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Histori
                </span>
              )}
              {activeInspectedDay.targetMet ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Target Tuntas Kaffah!
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  Tersisa {Math.max(0, activeInspectedDay.target - activeInspectedDay.total)} repetisi
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5">
              <span className="text-slate-600">
                Total: <strong className="text-slate-900 font-mono">{activeInspectedDay.total}x</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-800 font-medium">
                Pagi: {activeInspectedDay.morning} rep
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-teal-800 font-medium">
                Petang: {activeInspectedDay.evening} rep
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-800 font-medium">
                Tasbih: {activeInspectedDay.freeTasbih} rep
              </span>
            </div>
          </div>

          {/* Quick jump to sessions */}
          {onNavigateToTab && activeInspectedDay.isToday && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => onNavigateToTab("morning")}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1 transition shadow-2xs"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Pagi</span>
              </button>
              <button
                onClick={() => onNavigateToTab("evening")}
                className="px-3 py-1.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-950 font-bold text-xs flex items-center gap-1 transition shadow-2xs"
              >
                <Moon className="w-3.5 h-3.5 text-teal-600" />
                <span>+ Petang</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
