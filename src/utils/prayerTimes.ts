import { PrayerTime } from "../types";

export const SEMATANG_BORANG_COORDS = {
  latitude: -2.9367,
  longitude: 104.7985,
  timezoneOffsetHours: 7, // Asia/Jakarta (WIB, UTC+7)
};

export interface JakartaDateParts {
  year: number;
  month: number; // 1-12
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  dateKey: string; // YYYY-MM-DD
  formattedTime: string; // HH:MM:SS WIB
  formattedDate: string; // e.g., Senin, 16 Nov 2026
  hijriDate: string; // e.g., 6 Jumadilakhir 1448 H
}

export function getJakartaDateParts(date: Date = new Date()): JakartaDateParts {
  const numFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = numFormatter.formatToParts(date);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || "00";

  const year = parseInt(getPart("year"), 10);
  const month = parseInt(getPart("month"), 10);
  const day = parseInt(getPart("day"), 10);
  const rawHour = parseInt(getPart("hour"), 10);
  const hours = rawHour === 24 ? 0 : rawHour;
  const minutes = parseInt(getPart("minute"), 10);
  const seconds = parseInt(getPart("second"), 10);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  let hijriDate = "";
  try {
    const rawHijri = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    hijriDate = rawHijri.replace(/\s*AH$/i, " H").includes("H")
      ? rawHijri.replace(/\s*AH$/i, " H")
      : `${rawHijri} H`;
  } catch {
    hijriDate = `${year - 578} H`;
  }

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    dateKey,
    formattedTime: `${hh}:${mm}:${ss} WIB`,
    formattedDate,
    hijriDate,
  };
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function sinDeg(d: number) {
  return Math.sin(d * DEG_TO_RAD);
}
function cosDeg(d: number) {
  return Math.cos(d * DEG_TO_RAD);
}
function tanDeg(d: number) {
  return Math.tan(d * DEG_TO_RAD);
}
function asinDeg(x: number) {
  return Math.asin(Math.max(-1, Math.min(1, x))) * RAD_TO_DEG;
}
function acosDeg(x: number) {
  return Math.acos(Math.max(-1, Math.min(1, x))) * RAD_TO_DEG;
}
function atan2Deg(y: number, x: number) {
  return Math.atan2(y, x) * RAD_TO_DEG;
}
function arccotDeg(x: number) {
  return Math.atan(1 / x) * RAD_TO_DEG;
}

function fixAngle(a: number) {
  return a - 360 * Math.floor(a / 360);
}
function fixHour(h: number) {
  return h - 24 * Math.floor(h / 24);
}

function julianDate(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5
  );
}

function sunPosition(jd: number) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sinDeg(g) + 0.02 * sinDeg(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = atan2Deg(cosDeg(e) * sinDeg(L), cosDeg(L)) / 15;
  const equationOfTime = q / 15 - fixHour(RA);
  const declination = asinDeg(sinDeg(e) * sinDeg(L));
  return { declination, equationOfTime };
}

function formatFloatHoursToHHMM(hoursFloat: number): string {
  const normalized = fixHour(hoursFloat + 0.5 / 60); // round to nearest minute
  const hrs = Math.floor(normalized);
  const mins = Math.floor((normalized - hrs) * 60);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Calculates Kemenag RI prayer times for Sematang Borang, Palembang
 * (Subuh: 20 deg, Isya: 18 deg, Shafi'i Ashar, +2 min ihtiyat buffer).
 */
export function calculateSematangBorangPrayerTimes(
  date: Date = new Date()
): PrayerTime[] {
  const { year, month, day } = getJakartaDateParts(date);
  const { latitude, longitude, timezoneOffsetHours } = SEMATANG_BORANG_COORDS;

  // Compute at local midday
  const jd = julianDate(year, month, day) + 0.5 - timezoneOffsetHours / 24;
  const { declination, equationOfTime } = sunPosition(jd);

  const midDay = 12 + timezoneOffsetHours - longitude / 15 - equationOfTime;

  const sunAngleTimeOffset = (angleDeg: number) => {
    const numerator = -sinDeg(angleDeg) - sinDeg(latitude) * sinDeg(declination);
    const denominator = cosDeg(latitude) * cosDeg(declination);
    return acosDeg(numerator / denominator) / 15;
  };

  // Kemenag RI standard angles + 2 minute ihtiyat safety margin (except Terbit -2m)
  const ihtiyat = 2 / 60;
  const subuh = midDay - sunAngleTimeOffset(20) + ihtiyat;
  const terbit = midDay - sunAngleTimeOffset(0.833) - ihtiyat;
  const dzuhur = midDay + ihtiyat;

  const asharElevation = arccotDeg(1 + tanDeg(Math.abs(latitude - declination)));
  const asharCos =
    (sinDeg(asharElevation) - sinDeg(latitude) * sinDeg(declination)) /
    (cosDeg(latitude) * cosDeg(declination));
  const ashar = midDay + acosDeg(asharCos) / 15 + ihtiyat;

  const maghrib = midDay + sunAngleTimeOffset(0.833) + ihtiyat;
  const isya = midDay + sunAngleTimeOffset(18) + ihtiyat;

  return [
    { name: "Subuh", time: formatFloatHoursToHHMM(subuh), arabic: "الفجر", isNext: false },
    { name: "Terbit", time: formatFloatHoursToHHMM(terbit), arabic: "الشروق", isNext: false },
    { name: "Dzuhur", time: formatFloatHoursToHHMM(dzuhur), arabic: "الظهر", isNext: false },
    { name: "Ashar", time: formatFloatHoursToHHMM(ashar), arabic: "العصر", isNext: false },
    { name: "Maghrib", time: formatFloatHoursToHHMM(maghrib), arabic: "المغرب", isNext: false },
    { name: "Isya", time: formatFloatHoursToHHMM(isya), arabic: "العشاء", isNext: false },
  ];
}

export async function fetchKemenagPrayerTimes(
  date: Date = new Date()
): Promise<{ times: PrayerTime[]; source: "kemenag-api" | "astronomical-local" }> {
  const localTimes = calculateSematangBorangPrayerTimes(date);
  const { day, month, year } = getJakartaDateParts(date);
  const ddMmYyyy = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${ddMmYyyy}?latitude=${SEMATANG_BORANG_COORDS.latitude}&longitude=${SEMATANG_BORANG_COORDS.longitude}&method=20`,
      { signal: controller.signal }
    );
    window.clearTimeout(timeoutId);

    if (!res.ok) {
      return { times: localTimes, source: "astronomical-local" };
    }

    const payload = await res.json();
    const timings = payload?.data?.timings;
    if (!timings?.Fajr || !timings?.Dhuhr || !timings?.Asr || !timings?.Maghrib || !timings?.Isha) {
      return { times: localTimes, source: "astronomical-local" };
    }

    const clean = (raw: string) => raw.slice(0, 5);
    return {
      source: "kemenag-api",
      times: [
        { name: "Subuh", time: clean(timings.Fajr), arabic: "الفجر", isNext: false },
        { name: "Terbit", time: clean(timings.Sunrise || localTimes[1].time), arabic: "الشروق", isNext: false },
        { name: "Dzuhur", time: clean(timings.Dhuhr), arabic: "الظهر", isNext: false },
        { name: "Ashar", time: clean(timings.Asr), arabic: "العصر", isNext: false },
        { name: "Maghrib", time: clean(timings.Maghrib), arabic: "المغرب", isNext: false },
        { name: "Isya", time: clean(timings.Isha), arabic: "العشاء", isNext: false },
      ],
    };
  } catch {
    return { times: localTimes, source: "astronomical-local" };
  }
}

export interface UpcomingPrayerStatus {
  prayers: PrayerTime[];
  nextPrayer: PrayerTime;
  countdownText: string; // HH:MM:SS
  isTomorrow: boolean;
}

const OBLIGATORY_PRAYERS = new Set(["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"]);

function parseHHMMToSeconds(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10) || 0);
  return h * 3600 + m * 60;
}

/**
 * Determines which obligatory prayer time (Subuh, Dzuhur, Ashar, Maghrib, Isya)
 * is strictly upcoming relative to current WIB (Asia/Jakarta) time and computes the live countdown.
 */
export function resolveUpcomingPrayer(
  basePrayers: PrayerTime[],
  now: Date = new Date()
): UpcomingPrayerStatus {
  const { hours, minutes, seconds } = getJakartaDateParts(now);
  const nowSeconds = hours * 3600 + minutes * 60 + seconds;

  const obligatoryList = basePrayers.filter((p) => OBLIGATORY_PRAYERS.has(p.name));
  let upcoming = obligatoryList.find(
    (p) => parseHHMMToSeconds(p.time) > nowSeconds
  );
  let isTomorrow = false;

  if (!upcoming) {
    upcoming = obligatoryList[0] || basePrayers[0];
    isTomorrow = true;
  }

  const targetSeconds =
    parseHHMMToSeconds(upcoming.time) + (isTomorrow ? 24 * 3600 : 0);
  const diff = Math.max(0, targetSeconds - nowSeconds);

  const remH = Math.floor(diff / 3600);
  const remM = Math.floor((diff % 3600) / 60);
  const remS = diff % 60;

  const countdownText = `${String(remH).padStart(2, "0")}:${String(remM).padStart(
    2,
    "0"
  )}:${String(remS).padStart(2, "0")}`;

  const prayers = basePrayers.map((p) => ({
    ...p,
    isNext: p.name === upcoming?.name,
  }));

  return {
    prayers,
    nextPrayer: { ...upcoming, isNext: true },
    countdownText,
    isTomorrow,
  };
}
