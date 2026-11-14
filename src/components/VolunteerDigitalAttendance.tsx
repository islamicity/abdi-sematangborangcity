import { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import {
  QrCode,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  RefreshCw,
  Printer,
  Download,
  Share2,
  X,
  Phone,
  AlertCircle,
  FileCheck,
  Award,
  Maximize2,
  Check,
  Calendar,
  Layers,
  ChevronRight,
  Lock,
  Volume2,
  ExternalLink,
  Flame,
  BadgeCheck,
} from "lucide-react";
import {
  VolunteerAttendanceSession,
  VolunteerAttendanceRecord,
  AttendanceSessionStatus,
} from "../types";
import {
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
} from "../data/mockData";

// Play pleasant confirmation chime via Web Audio API
const playAttendanceChime = (type: "checkin" | "checkout" | "verify") => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "checkin") {
      // Ascending pleasant major chord (F4, A4, C5, F5)
      const freqs = [349.23, 440.0, 523.25, 698.46];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
    } else if (type === "checkout") {
      // Rich celebratory chord (C5, G5, E6, C6)
      const freqs = [523.25, 783.99, 659.25, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.5);
      });
    } else {
      // Single crisp verification ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
};

export default function VolunteerDigitalAttendance() {
  // Primary State
  const [sessions, setSessions] = useState<VolunteerAttendanceSession[]>(INITIAL_ATTENDANCE_SESSIONS);
  const [attendanceRecords, setAttendanceRecords] = useState<VolunteerAttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);

  // Sub-Navigation: "sessions_kiosk" | "camera_scanner" | "records_roster"
  const [activeTab, setActiveTab] = useState<"sessions_kiosk" | "camera_scanner" | "records_roster">("sessions_kiosk");

  // Selected Session for Kiosk / QR Display
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || "");
  const selectedSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  }, [sessions, selectedSessionId]);

  // QR Code Image Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [kioskFullscreen, setKioskFullscreen] = useState<boolean>(false);
  const [qrMode, setQrMode] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");
  const [qrTokenSecondsLeft, setQrTokenSecondsLeft] = useState<number>(60);

  // Camera Scanner State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedSession, setScannedSession] = useState<VolunteerAttendanceSession | null>(null);
  const [scanActionType, setScanActionType] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");

  // Check-In / Out Form State (when QR is scanned)
  const [volunteerName, setVolunteerName] = useState<string>("");
  const [volunteerPhone, setVolunteerPhone] = useState<string>("");
  const [volunteerMasjid, setVolunteerMasjid] = useState<string>("Masjid Al-Ikhlas");
  const [volunteerKelurahan, setVolunteerKelurahan] = useState<"Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya">("Sukamulya");
  const [assignedRole, setAssignedRole] = useState<string>("Relawan Khidmah Umat");
  const [gpsVerified, setGpsVerified] = useState<boolean>(true);
  const [checkInNotes, setCheckInNotes] = useState<string>("");

  // Modals State
  const [showCreateSessionModal, setShowCreateSessionModal] = useState<boolean>(false);
  const [certificateRecord, setCertificateRecord] = useState<VolunteerAttendanceRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Session Form State
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("Layanan Kesehatan & Sosial");
  const [newMasjid, setNewMasjid] = useState<string>("Masjid Al-Ikhlas, Sukamulya");
  const [newKelurahan, setNewKelurahan] = useState<"Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya">("Sukamulya");
  const [newDate, setNewDate] = useState<string>("18 Agustus 2026");
  const [newStartTime, setNewStartTime] = useState<string>("08:00");
  const [newEndTime, setNewEndTime] = useState<string>("12:00");
  const [newTargetHours, setNewTargetHours] = useState<number>(4);
  const [newProjectManager, setNewProjectManager] = useState<string>("");
  const [newContactPhone, setNewContactPhone] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");

  // Filter for Roster
  const [rosterSearch, setRosterSearch] = useState<string>("");
  const [rosterSessionFilter, setRosterSessionFilter] = useState<string>("ALL");
  const [rosterStatusFilter, setRosterStatusFilter] = useState<string>("ALL");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Generate QR Code whenever selected session, mode, or token changes
  useEffect(() => {
    if (!selectedSession) return;

    const payload = JSON.stringify({
      app: "ISLAMICITY_4B_KAFFAH",
      type: "VOLUNTEER_ATTENDANCE",
      mode: qrMode,
      sessionId: selectedSession.id,
      sessionCode: selectedSession.sessionCode,
      projectName: selectedSession.projectName,
      masjid: selectedSession.masjidLocation,
      kelurahan: selectedSession.kelurahan,
      targetHours: selectedSession.targetHours,
      token: selectedSession.qrSecurityToken,
      timestamp: new Date().toISOString(),
    });

    QRCode.toDataURL(payload, {
      width: 420,
      margin: 2,
      color: {
        dark: qrMode === "CHECK_IN" ? "#064e3b" : "#78350f", // emerald vs amber dark
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });
  }, [selectedSession, qrMode]);

  // QR Rotating Security Token Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setQrTokenSecondsLeft((prev) => {
        if (prev <= 1) {
          // Generate refreshed security token
          const newToken = `SEC-TOK-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
          setSessions((sPrev) =>
            sPrev.map((s) => (s.id === selectedSessionId ? { ...s, qrSecurityToken: newToken } : s))
          );
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSessionId]);

  // Camera Handler: Start / Stop
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    setIsScanning(true);

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
        setCameraError("Perangkat tidak mendukung akses video kamera langsung. Gunakan mode simulasi cepat di bawah.");
      }
    } catch (err: unknown) {
      console.warn("Camera access denied or unavailable:", err);
      setCameraError("Izin kamera belum aktif atau tidak tersedia. Anda tetap dapat melakukan presensi dengan Mode Simulasi Scan Cepat.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsScanning(false);
  };

  useEffect(() => {
    if (activeTab === "camera_scanner") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Trigger simulated scan of a session
  const handleSimulateScan = (session: VolunteerAttendanceSession, mode: "CHECK_IN" | "CHECK_OUT") => {
    setScannedSession(session);
    setScanActionType(mode);
    playAttendanceChime("verify");

    // Auto-fill phone or name if checking out
    if (mode === "CHECK_OUT") {
      const existing = attendanceRecords.find(
        (r) => r.sessionId === session.id && r.verificationStatus === "SEDANG_KHIDMAH"
      );
      if (existing) {
        setVolunteerName(existing.volunteerName);
        setVolunteerPhone(existing.volunteerPhone);
        setVolunteerMasjid(existing.volunteerMasjid);
        setAssignedRole(existing.roleAssigned);
      } else {
        setVolunteerName("Ahmad Rizky Pratama");
        setVolunteerPhone("0852-1122-3344");
      }
    } else {
      if (!volunteerName) {
        setVolunteerName("Muhammad Farhan Al-Banjari");
        setVolunteerPhone("0812-4455-6677");
        setAssignedRole("Relawan Tim Medis & Logistik");
      }
    }
  };

  // Submit Check-In / Check-Out
  const handleAttendanceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!scannedSession) return;
    if (!volunteerName.trim() || !volunteerPhone.trim()) {
      alert("Mohon masukkan nama relawan dan nomor HP/WhatsApp!");
      return;
    }

    if (scanActionType === "CHECK_IN") {
      // Check if already checked in
      const alreadyCheckedIn = attendanceRecords.some(
        (r) =>
          r.sessionId === scannedSession.id &&
          r.volunteerPhone === volunteerPhone &&
          r.verificationStatus === "SEDANG_KHIDMAH"
      );
      if (alreadyCheckedIn) {
        alert("Relawan dengan nomor WhatsApp ini telah berstatus Check-In pada sesi ini!");
        return;
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

      const newRecord: VolunteerAttendanceRecord = {
        id: `att-${Date.now()}`,
        sessionId: scannedSession.id,
        sessionCode: scannedSession.sessionCode,
        projectName: scannedSession.projectName,
        volunteerName,
        volunteerPhone,
        volunteerMasjid,
        volunteerKelurahan,
        roleAssigned: assignedRole,
        checkInTime: timeStr,
        durationHours: scannedSession.targetHours,
        verificationStatus: "SEDANG_KHIDMAH",
        method: "SCAN_KAMERA_HP",
        gpsConfirmed: gpsVerified,
        pointsEarned: scannedSession.targetHours * 10,
        notes: checkInNotes || "Check-In via Scan Kamera Mobile QR Code di lokasi proyek.",
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);

      // Update session attended count
      setSessions((sPrev) =>
        sPrev.map((s) =>
          s.id === scannedSession.id ? { ...s, attendedCount: s.attendedCount + 1 } : s
        )
      );

      // Play chime & confetti
      playAttendanceChime("checkin");
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#065f46"],
      });

      showToast(`Alhamdulillah! Check-In berhasil dicatat untuk ${volunteerName} (${scannedSession.projectName})`);
      setScannedSession(null);
      setCheckInNotes("");
    } else {
      // CHECK_OUT workflow
      const existingIdx = attendanceRecords.findIndex(
        (r) =>
          r.sessionId === scannedSession.id &&
          (r.volunteerPhone === volunteerPhone || r.volunteerName === volunteerName) &&
          r.verificationStatus === "SEDANG_KHIDMAH"
      );

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

      if (existingIdx !== -1) {
        // Complete checkout for existing record
        setAttendanceRecords((prev) =>
          prev.map((rec, idx) => {
            if (idx !== existingIdx) return rec;
            return {
              ...rec,
              checkOutTime: timeStr,
              verificationStatus: "TERVERIFIKASI_DKM",
              verifiedBy: scannedSession.projectManager,
              notes: `${rec.notes || ""} • Check-Out tervalidasi pukul ${timeStr}. Khidmah selesai berkah.`,
            };
          })
        );
      } else {
        // Create completed record directly
        const newRecord: VolunteerAttendanceRecord = {
          id: `att-${Date.now()}`,
          sessionId: scannedSession.id,
          sessionCode: scannedSession.sessionCode,
          projectName: scannedSession.projectName,
          volunteerName,
          volunteerPhone,
          volunteerMasjid,
          volunteerKelurahan,
          roleAssigned: assignedRole,
          checkInTime: scannedSession.startTime + " WIB",
          checkOutTime: timeStr,
          durationHours: scannedSession.targetHours,
          verificationStatus: "TERVERIFIKASI_DKM",
          verifiedBy: scannedSession.projectManager,
          method: "SCAN_KAMERA_HP",
          gpsConfirmed: gpsVerified,
          pointsEarned: scannedSession.targetHours * 10,
          notes: "Check-Out & Verifikasi Khidmah tuntas melalui scan QR.",
        };
        setAttendanceRecords((prev) => [newRecord, ...prev]);
      }

      playAttendanceChime("checkout");
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
      });

      showToast(`Jazakallahu Khairan! Check-Out & ${scannedSession.targetHours} Jam Khidmah resmi terverifikasi untuk ${volunteerName}!`);
      setScannedSession(null);
      setCheckInNotes("");
    }
  };

  // Supervisor Manual Verification Handler
  const handleVerifyRecord = (recordId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          verificationStatus: "TERVERIFIKASI_DKM",
          verifiedBy: "Pengurus DKM Sematang Borang",
        };
      })
    );
    playAttendanceChime("verify");
    showToast("Catatan jam khidmah relawan berhasil diverifikasi resmi DKM.");
  };

  // Create New Session Submit
  const handleCreateSessionSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectManager.trim()) {
      alert("Mohon lengkapi nama proyek dan nama manajer proyek/DKM!");
      return;
    }

    const code = `PRESENSI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSession: VolunteerAttendanceSession = {
      id: `sess-${Date.now()}`,
      sessionCode: code,
      projectName: newProjectName,
      category: newCategory,
      masjidLocation: newMasjid,
      kelurahan: newKelurahan,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      targetHours: Number(newTargetHours),
      projectManager: newProjectManager,
      contactPhone: newContactPhone || "0812-0000-0000",
      status: "AKTIF_CHECKIN",
      allowSelfScan: true,
      geoRadiusMeters: 150,
      qrPayload: `ISLAMICITY-ATTEND:sess-${Date.now()}:${code}:${newKelurahan}:${newMasjid}`,
      qrSecurityToken: `SEC-TOK-${Math.floor(1000 + Math.random() * 9000)}Z`,
      description: newDesc || "Sesi kegiatan khidmah relawan kemaslahatan masjid & dhuafa.",
      registeredVolunteersCount: 0,
      attendedCount: 0,
    };

    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    setShowCreateSessionModal(false);

    // Reset
    setNewProjectName("");
    setNewProjectManager("");
    setNewContactPhone("");
    setNewDesc("");

    showToast(`Sesi Presensi QR '${newSession.projectName}' berhasil dibuat!`);
  };

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      const matchSearch =
        rec.volunteerName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        rec.projectName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        rec.volunteerPhone.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        rec.roleAssigned.toLowerCase().includes(rosterSearch.toLowerCase());

      const matchSession =
        rosterSessionFilter === "ALL" || rec.sessionId === rosterSessionFilter;

      const matchStatus =
        rosterStatusFilter === "ALL" || rec.verificationStatus === rosterStatusFilter;

      return matchSearch && matchSession && matchStatus;
    });
  }, [attendanceRecords, rosterSearch, rosterSessionFilter, rosterStatusFilter]);

  // Aggregate Metrics
  const totalVerifiedHours = useMemo(() => {
    return attendanceRecords
      .filter((r) => r.verificationStatus === "TERVERIFIKASI_DKM")
      .reduce((sum, r) => sum + r.durationHours, 0);
  }, [attendanceRecords]);

  const activeVolunteersCount = useMemo(() => {
    return attendanceRecords.filter((r) => r.verificationStatus === "SEDANG_KHIDMAH").length;
  }, [attendanceRecords]);

  const getStatusBadge = (status: AttendanceSessionStatus) => {
    switch (status) {
      case "AKTIF_CHECKIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Check-In Aktif
          </span>
        );
      case "AKTIF_CHECKOUT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            Check-Out Dibuka
          </span>
        );
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Selesai Tuntas
          </span>
        );
      case "DITUTUP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Lock className="w-3 h-3 text-slate-500" />
            Ditutup
          </span>
        );
    }
  };

  const getRecordStatusBadge = (status: VolunteerAttendanceRecord["verificationStatus"]) => {
    switch (status) {
      case "SEDANG_KHIDMAH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-emerald-600" />
            Sedang Khidmah Aktif
          </span>
        );
      case "TERVERIFIKASI_DKM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
            Terverifikasi DKM Resmi
          </span>
        );
      case "MENUNGGU_VERIFIKASI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu Verifikasi
          </span>
        );
      case "DITOLAK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <X className="w-3.5 h-3.5 text-rose-500" />
            Ditolak
          </span>
        );
    }
  };

  return (
    <div id="volunteer-digital-attendance" className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-emerald-500/50 flex items-start gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-emerald-300">Presensi Berjamaah Sukses</div>
            <div className="text-xs text-slate-200 mt-0.5">{toastMessage}</div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Banner Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white border border-emerald-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5" />
              <span>PRESENSI DIGITAL & VERIFIKASI JAM KHIDMAH (SMART QR ATTENDANCE)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Presensi Real-Time & Rekapitulasi Jam Relawan
            </h3>
            <p className="text-sm text-emerald-200/90 leading-relaxed">
              Setiap sesi proyek khidmah masjid memiliki kode QR dinamis berotasi aman dengan geo-fencing lokasi masjid. Relawan dapat langsung melakukan <strong>Check-In & Check-Out</strong> via kamera HP untuk pencatatan jam kerja sosial yang akurat dan terverifikasi DKM.
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              id="btn-create-attendance-session"
              onClick={() => setShowCreateSessionModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Buka Sesi Presensi Baru</span>
            </button>

            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-emerald-700/60">
              <button
                id="tab-kiosk-qr"
                onClick={() => setActiveTab("sessions_kiosk")}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "sessions_kiosk"
                    ? "bg-emerald-400 text-slate-950 shadow-sm"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Kiosk QR Sesi ({sessions.length})</span>
              </button>

              <button
                id="tab-camera-scanner"
                onClick={() => setActiveTab("camera_scanner")}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "camera_scanner"
                    ? "bg-emerald-400 text-slate-950 shadow-sm"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Kamera HP</span>
              </button>

              <button
                id="tab-records-roster"
                onClick={() => setActiveTab("records_roster")}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "records_roster"
                    ? "bg-emerald-400 text-slate-950 shadow-sm"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Rekap Khidmah ({attendanceRecords.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hadits & Geo-Fencing Strip */}
        <div className="mt-5 pt-4 border-t border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Prinsip Khidmah & Itqan:</strong> &quot;Sesungguhnya Allah menyukai jika salah seorang di antara kalian melakukan suatu pekerjaan secara itqan (profesional & tepat).&quot; (HR. Al-Baihaqi)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-300 shrink-0">
            <span>📍 GPS Geo-Fence Radius 150m</span>
            <span>🔐 Dynamic Token (Refresh 60s)</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Jam Khidmah Sah</div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
              {totalVerifiedHours.toFixed(1)} Jam
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Terverifikasi DKM</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Relawan Sedang Khidmah</div>
            <div className="text-2xl font-black text-amber-700 font-mono mt-0.5">
              {activeVolunteersCount} Orang
            </div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Aktif di Posko Lapangan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Kehadiran Presensi</div>
            <div className="text-2xl font-black text-blue-700 font-mono mt-0.5">
              {attendanceRecords.length} Log
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Semua Sesi Proyek</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Poin Amal & Jariyah</div>
            <div className="text-2xl font-black text-purple-700 font-mono mt-0.5">
              {attendanceRecords.reduce((sum, r) => sum + (r.pointsEarned || 0), 0)} Poin
            </div>
            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Terkonversi ke Badge</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: KIOSK QR GENERATOR & SESSION SELECTION */}
      {activeTab === "sessions_kiosk" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Sessions List (4 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Pilih Sesi Proyek Khidmah
              </h4>
              <span className="text-xs text-slate-500">{sessions.length} Sesi Terdaftar</span>
            </div>

            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const isSelected = sess.id === selectedSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => setSelectedSessionId(sess.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-emerald-50/90 border-emerald-400 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                        {sess.sessionCode}
                      </span>
                      {getStatusBadge(sess.status)}
                    </div>

                    <h5 className="font-bold text-slate-900 text-sm mt-2 leading-snug">
                      {sess.projectName}
                    </h5>

                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{sess.masjidLocation}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-emerald-800">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {sess.startTime} - {sess.endTime} ({sess.targetHours} Jam)
                        </span>
                        <span className="font-bold text-slate-700">
                          {sess.attendedCount} Relawan Hadir
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Interactive Live QR Display & Kiosk Controls (7 cols) */}
          <div className="lg:col-span-7">
            {selectedSession && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                {/* Header & Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {selectedSession.sessionCode}
                      </span>
                      <span className="text-xs text-slate-500">{selectedSession.date}</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base mt-1">
                      {selectedSession.projectName}
                    </h4>
                  </div>

                  {/* Check-In / Check-Out Mode Selector */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                    <button
                      onClick={() => setQrMode("CHECK_IN")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        qrMode === "CHECK_IN"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mode Check-In
                    </button>
                    <button
                      onClick={() => setQrMode("CHECK_OUT")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        qrMode === "CHECK_OUT"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Mode Check-Out
                    </button>
                  </div>
                </div>

                {/* QR Code Presentation Box */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/40 border border-slate-200 relative">
                  {/* Top Security & Refresh Header */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-3 px-2">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Token: <strong className="text-emerald-900">{selectedSession.qrSecurityToken}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-amber-700 font-semibold">
                      <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>Rotasi: {qrTokenSecondsLeft}s</span>
                    </div>
                  </div>

                  {/* QR Image with Frame */}
                  <div className="p-4 bg-white rounded-2xl shadow-xl border-2 border-emerald-300 relative group">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code Presensi"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs">
                        Membuat QR Code...
                      </div>
                    )}

                    {/* Mode Overlay Badge */}
                    <div
                      className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5 ${
                        qrMode === "CHECK_IN"
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{qrMode === "CHECK_IN" ? "SCAN UNTUK CHECK-IN" : "SCAN UNTUK CHECK-OUT"}</span>
                    </div>
                  </div>

                  {/* Guidance text */}
                  <p className="text-xs text-slate-600 text-center max-w-sm mt-6 leading-relaxed">
                    Arahkan kamera HP relawan ke QR Code di atas atau buka tab <strong>Scan Kamera HP</strong> untuk otomatis mencatat jam khidmah.
                  </p>

                  {/* Quick Action Simulation Buttons */}
                  <div className="mt-4 pt-4 border-t border-slate-200/80 w-full flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => handleSimulateScan(selectedSession, qrMode)}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Simulasikan Scan HP ({qrMode === "CHECK_IN" ? "Check-In" : "Check-Out"})</span>
                    </button>

                    <button
                      onClick={() => setKioskFullscreen(true)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow flex items-center gap-2 transition"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Tampilan Penuh Layar Kiosk / TV</span>
                    </button>
                  </div>
                </div>

                {/* Session Details Footnote */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block">Manajer Proyek:</span>
                    <strong className="text-slate-900">{selectedSession.projectManager}</strong>
                    <div className="text-[11px] text-emerald-700 font-mono font-semibold">{selectedSession.contactPhone}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lokasi & Radius:</span>
                    <strong className="text-slate-900">{selectedSession.masjidLocation}</strong>
                    <div className="text-[11px] text-slate-500">Radius GPS: {selectedSession.geoRadiusMeters}m</div>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Jam Khidmah:</span>
                    <strong className="text-amber-800 font-bold">{selectedSession.targetHours} Jam per Relawan</strong>
                    <div className="text-[11px] text-emerald-600 font-semibold">{selectedSession.targetHours * 10} Poin Amal / Sesi</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MOBILE CAMERA SCANNER VIEW */}
      {activeTab === "camera_scanner" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Viewfinder (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">Pemindai Kamera Mobile Relawan</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Kamera Aktif
                </span>
              </div>
            </div>

            {/* Video Viewport with Targeting Laser Overlay */}
            <div className="relative aspect-video sm:aspect-square max-h-[380px] w-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Viewfinder Reticle Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-2xl flex items-center justify-center">
                  {/* Corner Accent marks */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                  {/* Animated Horizontal Laser Scan Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce"></div>

                  <div className="absolute bottom-2 text-[10px] font-mono text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded">
                    Arahkan ke QR Presensi
                  </div>
                </div>
              </div>

              {/* Fallback Notice if Camera Stream is Empty */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <div className="text-xs text-slate-300 max-w-xs">{cameraError}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Silakan gunakan tombol simulasi cepat di sebelah kanan untuk mencoba presensi.
                  </div>
                </div>
              )}
            </div>

            {/* Quick Test Scenarios Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400 font-medium">
                Pilih Sesi untuk Uji Coba Scan Cepat:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sessions.slice(0, 2).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSimulateScan(s, "CHECK_IN")}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-xs text-slate-200 flex items-center justify-between gap-2 transition"
                  >
                    <div className="truncate">
                      <div className="font-bold text-emerald-300 truncate">{s.projectName}</div>
                      <div className="text-[10px] text-slate-400">{s.masjidLocation}</div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold shrink-0">
                      Scan In
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form & Verification Panel (5 cols) */}
          <div className="lg:col-span-5">
            {scannedSession ? (
              <div className="bg-white rounded-2xl border border-emerald-300 p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        scanActionType === "CHECK_IN"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      Konfirmasi {scanActionType === "CHECK_IN" ? "Check-In" : "Check-Out"}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {scannedSession.projectName}
                    </h4>
                  </div>
                  <button
                    onClick={() => setScannedSession(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scanned Project Info */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kode Sesi:</span>
                    <span className="font-mono font-bold text-slate-800">{scannedSession.sessionCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lokasi:</span>
                    <span className="font-semibold text-slate-800">{scannedSession.masjidLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Khidmah:</span>
                    <span className="font-bold text-emerald-800">{scannedSession.targetHours} Jam</span>
                  </div>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleAttendanceSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Nama Lengkap Relawan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Farhan Al-Banjari"
                      value={volunteerName}
                      onChange={(e) => setVolunteerName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        No. WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="0812-xxxx-xxxx"
                        value={volunteerPhone}
                        onChange={(e) => setVolunteerPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kelurahan</label>
                      <select
                        value={volunteerKelurahan}
                        onChange={(e) => setVolunteerKelurahan(e.target.value as "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya")}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Sukamulya">Sukamulya</option>
                        <option value="Lebung Gajah">Lebung Gajah</option>
                        <option value="Karya Mulya">Karya Mulya</option>
                        <option value="Srimulya">Srimulya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Peran / Tugas Khidmah</label>
                    <input
                      type="text"
                      placeholder="Contoh: Tim Skrining Medis / Logistik / Mandor"
                      value={assignedRole}
                      onChange={(e) => setAssignedRole(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* GPS confirmation checkbox */}
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="gps-confirm"
                      checked={gpsVerified}
                      onChange={(e) => setGpsVerified(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="gps-confirm" className="text-[11px] text-emerald-950 font-medium cursor-pointer">
                      <strong>GPS Lokasi Terverifikasi:</strong> Berada di dalam radius {scannedSession.geoRadiusMeters}m dari {scannedSession.masjidLocation}.
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition ${
                        scanActionType === "CHECK_IN"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Simpan Presensi {scanActionType === "CHECK_IN" ? "Check-In" : "Check-Out"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <QrCode className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Menunggu Hasil Pemindaian QR</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Arahkan kamera HP ke QR Code sesi di masjid, atau klik tombol simulasi di bawah viewfinder untuk langsung membuka formulir presensi.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE RECORDS & VERIFIED SERVICE HOURS ROSTER */}
      {activeTab === "records_roster" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Rekapitulasi Jam Khidmah & Buku Presensi Relawan
                </h4>
                <p className="text-xs text-slate-500">
                  Daftar seluruh relawan yang telah melakukan Check-In/Out dengan status verifikasi resmi DKM
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={rosterSessionFilter}
                  onChange={(e) => setRosterSessionFilter(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Sesi Proyek</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sessionCode} - {s.projectName.substring(0, 24)}...
                    </option>
                  ))}
                </select>

                <select
                  value={rosterStatusFilter}
                  onChange={(e) => setRosterStatusFilter(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="TERVERIFIKASI_DKM">Terverifikasi DKM</option>
                  <option value="SEDANG_KHIDMAH">Sedang Khidmah</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama relawan, nomor WhatsApp, peran tugas, atau nama proyek..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Records Table */}
          {filteredRoster.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">Belum ada catatan presensi yang sesuai</h4>
              <p className="text-xs text-slate-500">Silakan lakukan check-in melalui tab Scan Kamera HP atau Kiosk QR.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRoster.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-emerald-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Volunteer & Project Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">
                        {record.volunteerName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{record.volunteerName}</span>
                          <span className="text-xs font-normal text-slate-500">
                            ({record.volunteerMasjid} • {record.volunteerKelurahan})
                          </span>
                        </div>
                        <div className="text-xs text-emerald-700 font-medium">
                          {record.roleAssigned} • WA: {record.volunteerPhone}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2 pt-1">
                      <span className="font-semibold text-slate-800">{record.projectName}</span>
                      <span className="text-slate-400">|</span>
                      <span className="font-mono text-[11px] text-slate-500">{record.sessionCode}</span>
                    </div>
                  </div>

                  {/* Time, Hours & Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-xs text-right">
                      <div className="text-slate-500 text-[10px]">Waktu Presensi:</div>
                      <div className="font-bold text-slate-800 font-mono">
                        IN: {record.checkInTime} {record.checkOutTime ? `• OUT: ${record.checkOutTime}` : ""}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
                        {record.durationHours} Jam Khidmah ({record.pointsEarned} Poin)
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {getRecordStatusBadge(record.verificationStatus)}

                      <div className="flex items-center gap-1.5">
                        {record.verificationStatus === "SEDANG_KHIDMAH" && (
                          <button
                            onClick={() => handleVerifyRecord(record.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Verifikasi DKM
                          </button>
                        )}

                        <button
                          onClick={() => setCertificateRecord(record)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg flex items-center gap-1"
                          title="Cetak Sertifikat Khidmah"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Kartu Jam</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN KIOSK MODAL */}
      {kioskFullscreen && selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 sm:p-10 text-white animate-fadeIn">
          {/* Kiosk Top Bar */}
          <div className="w-full flex items-center justify-between max-w-5xl border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  KIOSK PRESENSI DIGITAL RELAWAN MASJID
                </h2>
                <p className="text-xs text-emerald-400 font-mono">
                  {selectedSession.sessionCode} • {selectedSession.masjidLocation}
                </p>
              </div>
            </div>

            <button
              onClick={() => setKioskFullscreen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700"
            >
              <X className="w-4 h-4" />
              <span>Tutup Mode Kiosk</span>
            </button>
          </div>

          {/* Kiosk Centerpiece QR */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                qrMode === "CHECK_IN"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-amber-500 text-slate-950"
              }`}
            >
              MODE PRESENSI: {qrMode === "CHECK_IN" ? "CHECK-IN MASUK" : "CHECK-OUT SELESAI"}
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white max-w-2xl">
              {selectedSession.projectName}
            </h3>

            <div className="p-6 bg-white rounded-3xl shadow-2xl border-4 border-emerald-400">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Code Presensi Kiosk"
                  className="w-72 h-72 sm:w-80 sm:h-80 object-contain rounded-xl"
                />
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-emerald-300">
              <span>Token: {selectedSession.qrSecurityToken}</span>
              <span>•</span>
              <span>Refresh Otomatis: {qrTokenSecondsLeft}s</span>
              <span>•</span>
              <span>Target: {selectedSession.targetHours} Jam Khidmah</span>
            </div>
          </div>

          {/* Kiosk Bottom Bar with Mode Switcher */}
          <div className="w-full flex items-center justify-center gap-3 border-t border-slate-800 pt-4">
            <button
              onClick={() => setQrMode("CHECK_IN")}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition ${
                qrMode === "CHECK_IN"
                  ? "bg-emerald-500 text-slate-950 shadow-lg font-black"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Ganti ke Mode Check-In
            </button>
            <button
              onClick={() => setQrMode("CHECK_OUT")}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition ${
                qrMode === "CHECK_OUT"
                  ? "bg-amber-500 text-slate-950 shadow-lg font-black"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Ganti ke Mode Check-Out
            </button>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL TIMECARD & SERVICE CERTIFICATE */}
      {certificateRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-400 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h4 className="font-black text-slate-900 text-sm">
                  KARTU BUKTI JAM KHIDMAH RELAWAN BERJAMAAH
                </h4>
              </div>
              <button
                onClick={() => setCertificateRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Card Body */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-50/80 via-white to-amber-50/50 border border-emerald-200 text-center space-y-4 relative overflow-hidden">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
                LEMBAR VERIFIKASI KHIDMAH DKM SEMATANG BORANG
              </div>

              <div>
                <div className="text-xs text-slate-500">Diberikan Sebagai Bukti Khidmah:</div>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{certificateRecord.volunteerName}</h3>
                <div className="text-xs text-emerald-700 font-semibold">{certificateRecord.roleAssigned}</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Proyek:</span>
                  <span className="font-bold text-slate-900 text-right">{certificateRecord.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Durasi Terverifikasi:</span>
                  <span className="font-black text-emerald-800 font-mono">{certificateRecord.durationHours} Jam Layanan Sosial</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Presensi:</span>
                  <span className="font-semibold text-slate-800">Scan QR Kamera HP (GPS Confirmed)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Poin Amal Diperoleh:</span>
                  <span className="font-bold text-purple-700">+{certificateRecord.pointsEarned} Poin Jariyah</span>
                </div>
              </div>

              {/* Digital Seal & Signature */}
              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-600 border-t border-slate-200">
                <div className="text-left">
                  <div>Status: <strong className="text-emerald-700">Sah & Terverifikasi</strong></div>
                  <div className="text-[10px] text-slate-400">Verifikator: {certificateRecord.verifiedBy || "DKM Pusat"}</div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center text-[8px] font-black uppercase shadow-inner">
                  <span>STEMPEL</span>
                  <span>DKM</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Presensi</span>
              </button>
              <button
                onClick={() => setCertificateRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW ATTENDANCE SESSION */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-300 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Manajemen Sesi Proyek
                </span>
                <h4 className="text-base font-black text-slate-900">
                  Buka Sesi Presensi Digital QR Baru
                </h4>
              </div>
              <button
                onClick={() => setShowCreateSessionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Kegiatan / Proyek Khidmah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bakti Sosial Khitanan Massal & Skrining Dhuafa"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Layanan</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Layanan Kesehatan & Sosial">Layanan Kesehatan & Sosial</option>
                    <option value="Infrastruktur & Bedah Rumah">Infrastruktur & Bedah Rumah</option>
                    <option value="Penyaluran Makanan & Logistik">Penyaluran Makanan & Logistik</option>
                    <option value="Pendidikan & Literasi Dakwah">Pendidikan & Literasi Dakwah</option>
                    <option value="Kebersihan & Lingkungan Masjid">Kebersihan & Lingkungan Masjid</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelurahan</label>
                  <select
                    value={newKelurahan}
                    onChange={(e) => setNewKelurahan(e.target.value as "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya")}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Sukamulya">Sukamulya</option>
                    <option value="Lebung Gajah">Lebung Gajah</option>
                    <option value="Karya Mulya">Karya Mulya</option>
                    <option value="Srimulya">Srimulya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Masjid / Posko</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Masjid Al-Ikhlas, Sukamulya"
                  value={newMasjid}
                  onChange={(e) => setNewMasjid(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jam Mulai</label>
                  <input
                    type="text"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Jam</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    step="0.5"
                    value={newTargetHours}
                    onChange={(e) => setNewTargetHours(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Manajer Proyek / DKM <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Penanggung Jawab"
                    value={newProjectManager}
                    onChange={(e) => setNewProjectManager(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Kontak HP/WA</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Singkat Sesi</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan ringkas tugas relawan pada sesi ini..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateSessionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Buat & Tampilkan QR Sesi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
