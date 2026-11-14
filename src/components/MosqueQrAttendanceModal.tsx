import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import {
  X,
  QrCode,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Flame,
  Download,
  Printer,
  RefreshCw,
  Maximize2,
  Minimize2,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  AlertCircle,
  Share2,
  FileCheck,
  Search,
  Check,
  Volume2,
  Compass,
  Radio,
  Zap,
} from "lucide-react";
import { ContributionTimelineItem, UserProfileOnboarding } from "../types";

// Play audio chime via Web Audio API for rich auditory feedback
const playAttendanceAudioChime = (mode: "success" | "warning" | "ding") => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (mode === "success") {
      // Ascending pleasant chord (C5, E5, G5, C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
      });
    } else if (mode === "ding") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Audio Context might be restricted before user gesture
  }
};

export interface MosqueSessionItem {
  id: string;
  sessionCode: string;
  title: string;
  category: "SHOLAT_FARDHU" | "KAJIAN_DAKWAH" | "RELAWAN_KHIDMAH" | "SOSIAL_DAPUR";
  categoryLabel: string;
  masjidName: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  date: string;
  timeWindow: string;
  barakahPoints: number;
  volunteerHours: number;
  description: string;
  dkmImam: string;
  isDailyRoutine?: boolean;
  latitude: number;
  longitude: number;
  geoRadiusMeters: number;
}

export const PRESET_MOSQUE_SESSIONS: MosqueSessionItem[] = [
  {
    id: "sess-subuh-01",
    sessionCode: "PRESENSI-SUBUH-IKHLAS",
    title: "Sholat Subuh Berjamaah & Ratib Ba'da Subuh",
    category: "SHOLAT_FARDHU",
    categoryLabel: "Sholat Berjamaah 5 Waktu",
    masjidName: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya",
    date: "Hari Ini (Rutin Setiap Hari)",
    timeWindow: "04:30 - 05:45 WIB",
    barakahPoints: 30,
    volunteerHours: 1,
    description: "Sholat Subuh berjamaah saf awal, dzikir ba'da sholat, dan pembacaan Ratib Al-Haddad bersama DKM.",
    dkmImam: "Ustadz H. Ahmad Dahlan, Lc.",
    isDailyRoutine: true,
    latitude: -2.9341,
    longitude: 104.7912,
    geoRadiusMeters: 150,
  },
  {
    id: "sess-maghrib-02",
    sessionCode: "PRESENSI-MAGHRIB-IKHLAS",
    title: "Sholat Maghrib & Kajian Fiqh Muamalah Ba'da Maghrib",
    category: "KAJIAN_DAKWAH",
    categoryLabel: "Kajian & Majelis Ta'lim",
    masjidName: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya",
    date: "Hari Ini",
    timeWindow: "18:00 - 19:30 WIB",
    barakahPoints: 35,
    volunteerHours: 1.5,
    description: "Kajian rutin bedah Fiqh Zakat, Wakaf Produktif, dan Muamalah Syariah untuk pemberdayaan ekonomi umat.",
    dkmImam: "Ustadz Faisal Basri, M.Ag",
    isDailyRoutine: true,
    latitude: -2.9341,
    longitude: 104.7912,
    geoRadiusMeters: 150,
  },
  {
    id: "sess-jumat-03",
    sessionCode: "PRESENSI-JUMAT-BAITURRAHMAN",
    title: "Sholat Jumat Berjamaah & Khutbah Kemakmuran Masjid",
    category: "SHOLAT_FARDHU",
    categoryLabel: "Sholat Jumat Akbar",
    masjidName: "Masjid Baiturrahman",
    kelurahan: "Lebung Gajah",
    date: "Setiap Hari Jumat",
    timeWindow: "11:45 - 13:15 WIB",
    barakahPoints: 40,
    volunteerHours: 1.5,
    description: "Sholat Jumat berjamaah akbar, khutbah bertema infaq shodaqoh kaffah, dan doa ukhuwah sekecamatan.",
    dkmImam: "K.H. Syarifuddin Mahmud",
    isDailyRoutine: false,
    latitude: -2.9362,
    longitude: 104.7895,
    geoRadiusMeters: 200,
  },
  {
    id: "sess-medis-04",
    sessionCode: "PRESENSI-MEDIS-DHUAFA-04",
    title: "Posko Skrining Medis & Homecare Lansia Dhuafa",
    category: "RELAWAN_KHIDMAH",
    categoryLabel: "Relawan Layanan Kesehatan",
    masjidName: "Masjid Al-Muhajirin",
    kelurahan: "Karya Mulya",
    date: "18 Agustus 2026",
    timeWindow: "08:00 - 12:00 WIB",
    barakahPoints: 50,
    volunteerHours: 4,
    description: "Pemeriksaan tensi darah, gula darah sewaktu, konsultasi dokter spesialis gratis, dan pemberian obat bagi mustahiq.",
    dkmImam: "dr. H. Rahmat Pratama, Sp.PD",
    isDailyRoutine: false,
    latitude: -2.9315,
    longitude: 104.7941,
    geoRadiusMeters: 150,
  },
  {
    id: "sess-dapur-05",
    sessionCode: "PRESENSI-DAPUR-BERKAH-05",
    title: "Dapur Berkah: Distribusi 250 Nasi Kotak Mustahiq",
    category: "SOSIAL_DAPUR",
    categoryLabel: "Dapur Berkah Berbagi",
    masjidName: "Masjid Babussalam",
    kelurahan: "Srimulya",
    date: "19 Agustus 2026",
    timeWindow: "06:30 - 11:30 WIB",
    barakahPoints: 45,
    volunteerHours: 3.5,
    description: "Memasak, memorsi, dan mendistribusikan sarapan bergizi seimbang untuk kaum dhuafa, yatim, dan musafir.",
    dkmImam: "Ibu Hajjah Maryam / Risma Babussalam",
    isDailyRoutine: false,
    latitude: -2.9388,
    longitude: 104.798,
    geoRadiusMeters: 150,
  },
  {
    id: "sess-resik-06",
    sessionCode: "PRESENSI-GOTONG-ROYONG-06",
    title: "Gotong Royong & Pembersihan Karpet Saf Utama",
    category: "RELAWAN_KHIDMAH",
    categoryLabel: "Gotong Royong & Fasum",
    masjidName: "Masjid Jami' Al-Ikhlas",
    kelurahan: "Sukamulya",
    date: "20 Agustus 2026",
    timeWindow: "07:00 - 10:00 WIB",
    barakahPoints: 40,
    volunteerHours: 3,
    description: "Pembersihan tempat wudhu, vacuum karpet utama, penataan rak mushaf Al-Qur'an, dan sterilisasi ruangan.",
    dkmImam: "Bambang Kurniawan (DKM Sarpras)",
    isDailyRoutine: false,
    latitude: -2.9341,
    longitude: 104.7912,
    geoRadiusMeters: 150,
  },
];

interface MosqueQrAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfileOnboarding;
  onAttendanceSuccess?: (record: ContributionTimelineItem) => void;
}

export default function MosqueQrAttendanceModal({
  isOpen,
  onClose,
  currentUser,
  onAttendanceSuccess,
}: MosqueQrAttendanceModalProps) {
  // Navigation: "SCAN_QR" | "GENERATE_QR" | "LIVE_LOGS"
  const [activeTab, setActiveTab] = useState<"SCAN_QR" | "GENERATE_QR" | "LIVE_LOGS">("SCAN_QR");

  // User Profile
  const activeUserName = currentUser?.fullName || "dr. H. Rahmat Pratama, Sp.PD";
  const activeUserMasjid = currentUser?.homeMasjid || "Masjid Jami' Al-Ikhlas";
  const activeUserKelurahan = currentUser?.kelurahan || "Sukamulya";

  // State: Sessions List
  const [sessions, setSessions] = useState<MosqueSessionItem[]>(PRESET_MOSQUE_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(PRESET_MOSQUE_SESSIONS[0].id);
  const selectedSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  }, [sessions, selectedSessionId]);

  // QR Generation State
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrSecurityToken, setQrSecurityToken] = useState<string>("SEC-MASJID-8821");
  const [tokenSecondsLeft, setTokenSecondsLeft] = useState<number>(60);
  const [isFullscreenKiosk, setIsFullscreenKiosk] = useState<boolean>(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  // Live clock for Kiosk
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate dynamic QR Code data URL
  useEffect(() => {
    if (!selectedSession) return;

    const payload = JSON.stringify({
      app: "ISLAMICITY_4B_KAFFAH",
      module: "BERJAMAAH_PRESENSI",
      sessionId: selectedSession.id,
      sessionCode: selectedSession.sessionCode,
      title: selectedSession.title,
      masjid: selectedSession.masjidName,
      kelurahan: selectedSession.kelurahan,
      points: selectedSession.barakahPoints,
      hours: selectedSession.volunteerHours,
      token: qrSecurityToken,
      lat: selectedSession.latitude,
      lng: selectedSession.longitude,
      generatedAt: new Date().toISOString(),
    });

    QRCode.toDataURL(payload, {
      width: 480,
      margin: 2,
      color: {
        dark: "#064e3b", // Deep emerald
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR:", err));
  }, [selectedSession, qrSecurityToken]);

  // Rotating Token Timer for Anti-Fraud
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenSecondsLeft((prev) => {
        if (prev <= 1) {
          const newToken = `SEC-MASJID-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
          setQrSecurityToken(newToken);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Camera Scanner State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(false);
  const [gpsSimulatedStatus, setGpsSimulatedStatus] = useState<"VERIFIED" | "CHECKING" | "OUT_OF_RANGE">("VERIFIED");
  const [gpsDistanceMeters, setGpsDistanceMeters] = useState<number>(38);

  // Check-In Success State
  const [recentCheckedInItem, setRecentCheckedInItem] = useState<ContributionTimelineItem | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form check-in custom notes
  const [checkInNotes, setCheckInNotes] = useState<string>("");
  const [safPosition, setSafPosition] = useState<string>("Saf Pertama (Depan Kanan)");

  // Attendance Logs in local state & localStorage
  const [attendanceLogs, setAttendanceLogs] = useState<ContributionTimelineItem[]>(() => {
    try {
      const saved = localStorage.getItem("islamicity_user_contribution_timeline_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Start / Stop Real Camera
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    setIsScanningActive(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError("Perangkat tidak mendukung akses video kamera langsung. Gunakan mode simulasi instan.");
      }
    } catch (err: unknown) {
      console.warn("Camera access denied or unavailable:", err);
      setCameraError("Izin kamera belum aktif. Anda tetap dapat menggunakan tombol 'Simulasi Scan & Check-in Otomatis'.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsScanningActive(false);
  };

  // Process Check-In
  const handleExecuteCheckIn = (sessionToLog: MosqueSessionItem) => {
    playAttendanceAudioChime("success");
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#f59e0b", "#3b82f6", "#ffffff"],
    });

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeFormatted =
      now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

    const newItem: ContributionTimelineItem = {
      id: `att-qr-${Date.now()}`,
      userName: activeUserName,
      userRole: currentUser?.profession || "Dokter Spesialis Penyakit Dalam & Relawan Medis DKM",
      date: dateFormatted,
      time: timeFormatted,
      hijriDate: "7 Shafar 1448 H",
      title: sessionToLog.title,
      category:
        sessionToLog.category === "SHOLAT_FARDHU"
          ? "MOSQUE_ATTENDANCE"
          : sessionToLog.category === "KAJIAN_DAKWAH"
          ? "EDUCATIONAL_DAKWAH"
          : sessionToLog.category === "SOSIAL_DAPUR"
          ? "CHARITY_DISTRIBUTION"
          : "VOLUNTEER_MEDICAL",
      categoryLabel: sessionToLog.categoryLabel,
      masjidName: sessionToLog.masjidName,
      kelurahan: sessionToLog.kelurahan,
      description: `Presensi digital otomatis via QR Scanner di ${sessionToLog.masjidName}. ${sessionToLog.description} (${safPosition}). ${checkInNotes ? "Catatan: " + checkInNotes : ""}`,
      impactMetrics: {
        hoursLogged: sessionToLog.volunteerHours,
        pointsEarned: sessionToLog.barakahPoints,
        streakDayNumber: sessionToLog.category === "SHOLAT_FARDHU" ? 421 : undefined,
      },
      verificationStatus: "TERVERIFIKASI_DKM",
      verifiedBy: `DKM ${sessionToLog.masjidName} (Imam: ${sessionToLog.dkmImam})`,
      evidenceType: "PRESENSI_QR",
      evidenceCode: `QR-GEO-${Math.floor(100000 + Math.random() * 900000)}`,
      locationDetails: `GPS Radius Valid: ${gpsDistanceMeters} meter dari titik koordinat mihrab`,
      notes: checkInNotes || `Presensi tervalidasi di ${safPosition}`,
      tags: ["QR Presensi", "Sholat Berjamaah", "Kemakmuran Masjid", "Auto-Log"],
    };

    // Save to localStorage
    try {
      const existing = localStorage.getItem("islamicity_user_contribution_timeline_v1");
      const list: ContributionTimelineItem[] = existing ? JSON.parse(existing) : [];
      const updated = [newItem, ...list];
      localStorage.setItem("islamicity_user_contribution_timeline_v1", JSON.stringify(updated));
      setAttendanceLogs(updated);
    } catch {
      // ignore
    }

    setRecentCheckedInItem(newItem);
    setShowSuccessCard(true);
    showToast(`Alhamdulillah! Berhasil check-in ke "${sessionToLog.title}" (+${sessionToLog.barakahPoints} Poin).`);

    if (onAttendanceSuccess) {
      onAttendanceSuccess(newItem);
    }

    // Stop camera after successful scan
    stopCamera();
  };

  // Print Official Standee / Poster
  const handlePrintPoster = () => {
    playAttendanceAudioChime("ding");
    window.print();
  };

  // Download QR Code PNG
  const handleDownloadQr = () => {
    playAttendanceAudioChime("ding");
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-Presensi-${selectedSession.sessionCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("QR Code presensi berhasil diunduh.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl w-full text-white shadow-2xl overflow-hidden flex flex-col transition-all ${
          isFullscreenKiosk ? "fixed inset-0 max-w-none rounded-none z-50 h-screen" : "max-w-4xl max-h-[92vh]"
        }`}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 p-4 sm:p-6 border-b border-emerald-800/40 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg ring-2 ring-emerald-400/40">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-wider">
                    SISTEM PRESENSI & CHECK-IN MASJID 4B
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    GPS VALIDATED
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <span>Digital QR Attendance & Scanner</span>
                </h3>
                <p className="text-xs text-emerald-200/80">
                  Presensi digital sholat berjamaah & khidmah masjid dengan auto-logging ke Linimasa Pengabdian.
                </p>
              </div>
            </div>

            {/* Top action controls */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                id="btn-fullscreen-toggle"
                onClick={() => setIsFullscreenKiosk(!isFullscreenKiosk)}
                title="Toggle Mode Kiosk Layar Penuh"
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
              >
                {isFullscreenKiosk ? (
                  <>
                    <Minimize2 className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Keluar Kiosk</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Mode Kiosk Masjid</span>
                  </>
                )}
              </button>

              <button
                id="btn-close-qr-modal"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <button
              id="tab-scan-qr"
              onClick={() => {
                setActiveTab("SCAN_QR");
                setShowSuccessCard(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === "SCAN_QR"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md font-black ring-2 ring-emerald-400/40"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Kamera & Scanner Check-In</span>
            </button>

            <button
              id="tab-generate-qr"
              onClick={() => {
                setActiveTab("GENERATE_QR");
                stopCamera();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === "GENERATE_QR"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/40"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Generator QR Sesi (DKM Kiosk)</span>
            </button>

            <button
              id="tab-live-logs"
              onClick={() => {
                setActiveTab("LIVE_LOGS");
                stopCamera();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === "LIVE_LOGS"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md font-black ring-2 ring-blue-400/40"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Daftar Riwayat Presensi ({attendanceLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-900/90 border-b border-emerald-500 text-emerald-100 px-4 py-2 text-xs flex items-center gap-2 animate-fadeIn font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================
              TAB 1: CAMERA & SCANNER CHECK-IN
             ======================================================== */}
          {activeTab === "SCAN_QR" && (
            <div className="space-y-6">
              {/* If check-in just succeeded, show celebratory card */}
              {showSuccessCard && recentCheckedInItem ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/70 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-5"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      PRESENSI DIGITAL TERVERIFIKASI DKM
                    </div>
                    <h4 className="text-2xl font-black text-white">
                      Alhamdulillah, Presensi Tercatat!
                    </h4>
                    <p className="text-sm text-emerald-200 mt-1 max-w-md mx-auto">
                      Kehadiran Anda pada agenda <strong>{recentCheckedInItem.title}</strong> telah tersimpan otomatis di Linimasa Pengabdian.
                    </p>
                  </div>

                  {/* Summary Card Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-emerald-900/60 text-left max-w-2xl mx-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Jamaah:</span>
                      <span className="text-xs font-bold text-white truncate block">
                        {recentCheckedInItem.userName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Masjid & Lokasi:</span>
                      <span className="text-xs font-bold text-amber-300 truncate block">
                        {recentCheckedInItem.masjidName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Waktu Presensi:</span>
                      <span className="text-xs font-bold text-emerald-300 truncate block">
                        {recentCheckedInItem.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Poin Berkah:</span>
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        +{recentCheckedInItem.impactMetrics.pointsEarned} Poin
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      id="btn-scan-again"
                      onClick={() => setShowSuccessCard(false)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan Sesi Lainnya</span>
                    </button>
                    <button
                      id="btn-view-logs-after-scan"
                      onClick={() => setActiveTab("LIVE_LOGS")}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>Lihat Riwayat Lengkap</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Video Scanner & Viewfinder (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <h4 className="text-sm font-bold text-white">Live Camera Viewfinder</h4>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                          {cameraActive ? "KAMERA AKTIF" : "SIAP SCAN"}
                        </span>
                      </div>

                      {/* Camera View Area */}
                      <div className="relative aspect-video sm:aspect-square max-h-72 w-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-inner">
                        {cameraActive ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-6 space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center mx-auto border border-slate-700">
                              <Camera className="w-7 h-7" />
                            </div>
                            <p className="text-xs text-slate-300 max-w-xs mx-auto">
                              Arahkan kamera smartphone ke QR Code yang terpajang di Kiosk Masjid atau banner acara.
                            </p>
                            <button
                              id="btn-activate-camera"
                              onClick={startCamera}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 mx-auto cursor-pointer"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Nyalakan Kamera Langsung</span>
                            </button>
                          </div>
                        )}

                        {/* Scanner Viewfinder Overlay */}
                        {cameraActive && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                            <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-lg">
                              {/* Corner Accents */}
                              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-md"></div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-md"></div>
                              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-md"></div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-md"></div>

                              {/* Animated Laser Scanning Line */}
                              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce absolute top-1/2"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {cameraError && (
                        <div className="mt-3 p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{cameraError}</span>
                        </div>
                      )}

                      {/* GPS Geo-Radius Indicator */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span>
                            Radius GPS: <strong>{gpsDistanceMeters}m</strong> (Maks 150m)
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Geofence Valid
                        </span>
                      </div>
                    </div>

                    {/* Quick Fast-Check-In Action */}
                    <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 p-4 rounded-2xl border border-emerald-800/50">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>Simulasi Scan Cepat Sesi Terpilih</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Check-in instan ke: <strong>{selectedSession.title}</strong>
                          </p>
                        </div>
                        <button
                          id="btn-fast-checkin"
                          onClick={() => handleExecuteCheckIn(selectedSession)}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Check-In Sekarang</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Active Session Selector & Jamaah Profile (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* User Check-In Identity */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Profil Jamaah Yang Melakukan Presensi
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-emerald-400">
                          {activeUserName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">{activeUserName}</h5>
                          <p className="text-[11px] text-amber-300 truncate">
                            🕌 {activeUserMasjid} ({activeUserKelurahan})
                          </p>
                        </div>
                      </div>

                      {/* Saf Choice Selector */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Posisi Saf / Tempat Hadir:
                        </label>
                        <select
                          value={safPosition}
                          onChange={(e) => setSafPosition(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="Saf Pertama (Depan Kanan)">Saf Pertama (Depan Kanan)</option>
                          <option value="Saf Pertama (Depan Kiri)">Saf Pertama (Depan Kiri)</option>
                          <option value="Saf Kedua (Tengah)">Saf Kedua (Tengah)</option>
                          <option value="Saf Sayap Kanan (Dekat Jendela)">Saf Sayap Kanan (Dekat Jendela)</option>
                          <option value="Area Jamaah Putri / Muslimah">Area Jamaah Putri / Muslimah</option>
                          <option value="Meja Registrasi / Posko Pelayanan">Meja Registrasi / Posko Pelayanan</option>
                        </select>
                      </div>

                      {/* Custom Notes */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Catatan Tambahan (Opsional):
                        </label>
                        <input
                          type="text"
                          value={checkInNotes}
                          onChange={(e) => setCheckInNotes(e.target.value)}
                          placeholder="Misal: Hadir bersama keluarga, membawa al-qur'an wakaf"
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Mosque Sessions Selectable List */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Pilih Sesi Agenda Masjid
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {sessions.length} Sesi Terbuka
                        </span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {sessions.map((sess) => {
                          const isSelected = sess.id === selectedSessionId;
                          return (
                            <div
                              key={sess.id}
                              onClick={() => setSelectedSessionId(sess.id)}
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                                isSelected
                                  ? "bg-emerald-950/70 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500"
                                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-bold truncate text-white">{sess.title}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span>🕌 {sess.masjidName}</span>
                                  <span>•</span>
                                  <span className="text-amber-300">{sess.timeWindow}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-black text-amber-400 shrink-0 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                +{sess.barakahPoints} Pts
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: GENERATE QR SESI (DKM KIOSK & POSTER)
             ======================================================== */}
          {activeTab === "GENERATE_QR" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: QR Code Display Card & Kiosk Frame (6 cols) */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="bg-white text-slate-950 rounded-3xl p-6 shadow-2xl border-4 border-amber-400 w-full max-w-sm flex flex-col items-center text-center space-y-3 relative">
                  {/* Mosque Header Brand */}
                  <div className="border-b border-slate-200 pb-2 w-full">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                      FORUM KOMUNIKASI DKM 4B KAFFAH
                    </div>
                    <h4 className="text-base font-black text-slate-900 truncate">
                      {selectedSession.masjidName}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Kelurahan {selectedSession.kelurahan}, Sematang Borang
                    </p>
                  </div>

                  {/* High-Resolution QR Code */}
                  <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code Presensi Sesi"
                        className="w-56 h-56 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                        Membuat QR Code...
                      </div>
                    )}
                  </div>

                  {/* Session Title & Instructions */}
                  <div className="w-full space-y-1">
                    <div className="text-xs font-black text-slate-900 leading-tight">
                      {selectedSession.title}
                    </div>
                    <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                      ⏰ {selectedSession.timeWindow} • +{selectedSession.barakahPoints} Poin Berkah
                    </div>
                  </div>

                  {/* Dynamic Token & Live Countdown */}
                  <div className="w-full pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono font-bold text-emerald-700">
                      TOKEN: {qrSecurityToken}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Refresh in {tokenSecondsLeft}s
                    </span>
                  </div>

                  <p className="text-[9px] text-slate-400 italic">
                    Scan via aplikasi ABDI 4B Kaffah atau kamera smartphone
                  </p>
                </div>

                {/* Print & Download Action Buttons */}
                <div className="flex flex-wrap gap-2.5 justify-center mt-4">
                  <button
                    id="btn-download-qr-image"
                    onClick={handleDownloadQr}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Unduh Gambar PNG</span>
                  </button>
                  <button
                    id="btn-print-qr-poster"
                    onClick={handlePrintPoster}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Standee DKM (A4)</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Sesi Configuration & DKM Settings (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Konfigurasi Sesi Presensi Masjid</span>
                    </h5>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      DKM ACTIVE
                    </span>
                  </div>

                  {/* Select Preset Session */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Pilih Agenda / Sesi Sholat:
                    </label>
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.masjidName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Session Detail Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kategori:</span>
                      <span className="font-bold text-emerald-300">{selectedSession.categoryLabel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Waktu Sesi:</span>
                      <span className="font-bold text-amber-300">{selectedSession.timeWindow}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Imam / Penanggung Jawab:</span>
                      <span className="font-bold text-white truncate block">{selectedSession.dkmImam}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Reward Poin & Jam Khidmah:</span>
                      <span className="font-bold text-amber-400">
                        +{selectedSession.barakahPoints} Pts ({selectedSession.volunteerHours} Jam)
                      </span>
                    </div>
                  </div>

                  {/* Kiosk Display Info */}
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mode Kiosk Masjid Digital</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Jadikan tablet atau monitor di teras masjid sebagai kiosk presensi. QR Code akan merefresh token keamanannya setiap 60 detik untuk mencegah kecurangan.
                    </p>
                  </div>

                  {/* Quick trigger fast check-in from DKM view */}
                  <button
                    onClick={() => handleExecuteCheckIn(selectedSession)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Uji Coba Presensi Jamaah pada Sesi Ini</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: LIVE ATTENDANCE LOG & JAMAAH ROSTER
             ======================================================== */}
          {activeTab === "LIVE_LOGS" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Buku Tamu Digital & Riwayat Presensi Terverifikasi</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data kehadiran yang terekam otomatis via QR code dan terhubung ke Linimasa Pengabdian.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-700">
                    Total: {attendanceLogs.length} Kehadiran
                  </span>
                </div>
              </div>

              {attendanceLogs.length === 0 ? (
                <div className="text-center py-12 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                  <h5 className="font-bold text-slate-300 text-sm">Belum Ada Riwayat Presensi</h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Gunakan tab <strong>Kamera & Scanner</strong> untuk melakukan presensi digital pertama Anda di masjid.
                  </p>
                  <button
                    onClick={() => setActiveTab("SCAN_QR")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Buka Scanner Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {attendanceLogs.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-xs text-white">{item.title}</h5>
                            <span className="text-[9px] font-mono bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              {item.categoryLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            🕌 {item.masjidName} ({item.kelurahan}) • ⏰ {item.time} ({item.date})
                          </p>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800 w-full sm:w-auto">
                        <div className="text-right">
                          <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 fill-amber-400" />
                            +{item.impactMetrics.pointsEarned} Poin
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400 block">
                            {item.evidenceCode || "QR-GEO-VERIFIED"}
                          </span>
                        </div>

                        <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-700/50 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          VERIFIED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              Terhubung ke Jaringan Komunikasi DKM Sematang Borang (4B Kaffah)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-amber-300">{currentTimeStr}</span>
            <span>•</span>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition"
            >
              Tutup Modal
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
