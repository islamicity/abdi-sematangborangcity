import { useState, useMemo, FormEvent } from "react";
import {
  Wrench,
  BookOpen,
  Volume2,
  HeartPulse,
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Phone,
  HelpCircle,
  X,
  FileText,
  Truck,
  RotateCcw,
  PackageCheck,
  AlertCircle,
  Share2,
  Calendar,
  Layers,
  MapPin,
  Tag,
  Check,
  User,
  ExternalLink,
  Printer,
} from "lucide-react";
import {
  ResourceItem,
  ResourceBorrowRequest,
  ResourceCategoryType,
} from "../types";
import {
  INITIAL_RESOURCE_ITEMS,
  INITIAL_BORROW_REQUESTS,
} from "../data/mockData";

export default function CommunityResourceLibrary() {
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCE_ITEMS);
  const [requests, setRequests] = useState<ResourceBorrowRequest[]>(INITIAL_BORROW_REQUESTS);

  // Active view: 'catalog' | 'tracker'
  const [activeView, setActiveView] = useState<"catalog" | "tracker">("catalog");

  // Filters for Catalog
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>("ALL");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("ALL");

  // Filters for Tracker
  const [trackerSearch, setTrackerSearch] = useState("");
  const [trackerStatusFilter, setTrackerStatusFilter] = useState<string>("ALL");

  // Modals state
  const [borrowModalItem, setBorrowModalItem] = useState<ResourceItem | null>(null);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<ResourceBorrowRequest | null>(null);
  const [printReceiptRequest, setPrintReceiptRequest] = useState<ResourceBorrowRequest | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Borrow Form State
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [borrowerMasjid, setBorrowerMasjid] = useState("");
  const [borrowerKelurahan, setBorrowerKelurahan] = useState<"Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya">("Sukamulya");
  const [projectName, setProjectName] = useState("");
  const [projectPurpose, setProjectPurpose] = useState("");
  const [startDate, setStartDate] = useState("2026-08-18");
  const [endDate, setEndDate] = useState("2026-08-20");
  const [agreedToAriyah, setAgreedToAriyah] = useState(false);

  // Add Resource Form State
  const [newResName, setNewResName] = useState("");
  const [newResCategory, setNewResCategory] = useState<ResourceCategoryType>("Peralatan & Perkakas (Tools)");
  const [newResDesc, setNewResDesc] = useState("");
  const [newResOwnerName, setNewResOwnerName] = useState("");
  const [newResOwnerRole, setNewResOwnerRole] = useState<"Jamaah Masjid" | "DKM / Pengurus" | "Relawan Komunitas" | "Majelis Taklim">("Jamaah Masjid");
  const [newResOwnerMasjid, setNewResOwnerMasjid] = useState("Masjid Al-Ikhlas");
  const [newResKelurahan, setNewResKelurahan] = useState<"Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya">("Sukamulya");
  const [newResContactPhone, setNewResContactPhone] = useState("");
  const [newResCondition, setNewResCondition] = useState<"Sangat Baik (Seperti Baru)" | "Baik & Berfungsi Penuh" | "Cukup (Perlu Kehati-hatian)">("Baik & Berfungsi Penuh");
  const [newResMaxDays, setNewResMaxDays] = useState(3);
  const [newResDepositNote, setNewResDepositNote] = useState("Gratis untuk kegiatan kemaslahatan masjid/warga.");
  const [newResTags, setNewResTags] = useState("");
  const [newResLocation, setNewResLocation] = useState("");

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Filtered Catalog Items
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.ownerMasjid.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;

      const matchKelurahan =
        selectedKelurahan === "ALL" || item.kelurahan === selectedKelurahan;

      const matchAvailability =
        selectedAvailability === "ALL" ||
        item.availabilityStatus === selectedAvailability;

      return matchSearch && matchCategory && matchKelurahan && matchAvailability;
    });
  }, [resources, searchQuery, selectedCategory, selectedKelurahan, selectedAvailability]);

  // Filtered Tracker Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchSearch =
        req.requestNumber.toLowerCase().includes(trackerSearch.toLowerCase()) ||
        req.borrowerName.toLowerCase().includes(trackerSearch.toLowerCase()) ||
        req.resourceName.toLowerCase().includes(trackerSearch.toLowerCase()) ||
        req.projectOrEventName.toLowerCase().includes(trackerSearch.toLowerCase()) ||
        req.borrowerMasjid.toLowerCase().includes(trackerSearch.toLowerCase());

      const matchStatus =
        trackerStatusFilter === "ALL" || req.status === trackerStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [requests, trackerSearch, trackerStatusFilter]);

  // Stats calculation
  const totalAvailable = resources.filter((r) => r.availabilityStatus === "TERSEDIA").length;
  const totalInUse = resources.filter((r) => r.availabilityStatus === "SEDANG_DIPINJAM").length;
  const totalPendingRequests = requests.filter((r) => r.status === "MENUNGGU_PERSETUJUAN").length;
  const totalCompletedLendings = requests.filter((r) => r.status === "SELESAI_DIKEMBALIKAN").length;

  const handleBorrowSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!borrowModalItem) return;
    if (!borrowerName.trim() || !borrowerPhone.trim() || !projectName.trim()) {
      alert("Mohon lengkapi semua kolom yang wajib diisi!");
      return;
    }
    if (!agreedToAriyah) {
      alert("Mohon centang persetujuan Akad Amanah 'Ariyah.");
      return;
    }

    const newRequestNumber = `PINJAM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: ResourceBorrowRequest = {
      id: `req-${Date.now()}`,
      requestNumber: newRequestNumber,
      resourceId: borrowModalItem.id,
      resourceName: borrowModalItem.name,
      resourceCategory: borrowModalItem.category,
      borrowerName,
      borrowerPhone,
      borrowerMasjid: borrowerMasjid || "Masjid Binaan Sematang Borang",
      borrowerKelurahan,
      projectOrEventName: projectName,
      purpose: projectPurpose || "Kebutuhan operasional kegiatan sosial kemaslahatan umat.",
      startDate,
      endDate,
      status: "MENUNGGU_PERSETUJUAN",
      requestDate: "15 Agustus 2026",
      notes: "Pengajuan otomatis diverifikasi melalui sistem smart registry.",
      trackingTimeline: [
        {
          stage: "Permohonan Diajukan",
          timestamp: "15 Agu 2026, Baru saja",
          actor: borrowerName,
          note: `Mengajukan peminjaman aset untuk ${projectName}.`,
          completed: true,
        },
        {
          stage: "Verifikasi & Persetujuan DKM",
          timestamp: "Dalam Antrean Verifikasi",
          actor: borrowModalItem.ownerName,
          note: "Menunggu peninjauan jadwal dan kesiapan unit.",
          completed: false,
        },
        {
          stage: "Serah Terima Barang",
          timestamp: "Belum",
          actor: "Petugas Gudang / Pemilik",
          note: "Menunggu persetujuan.",
          completed: false,
        },
        {
          stage: "Penggunaan di Lapangan Proyek",
          timestamp: "Belum",
          actor: "Tim Relawan",
          note: "Menunggu barang.",
          completed: false,
        },
        {
          stage: "Pengembalian & Pengecekan Aset",
          timestamp: "Belum",
          actor: "DKM / Pemilik Aset",
          note: "Menunggu penyelesaian agenda.",
          completed: false,
        },
      ],
    };

    setRequests((prev) => [newReq, ...prev]);

    // Close modal & reset form
    setBorrowModalItem(null);
    setBorrowerName("");
    setBorrowerPhone("");
    setBorrowerMasjid("");
    setProjectName("");
    setProjectPurpose("");
    setAgreedToAriyah(false);

    // Switch to tracker tab and notify
    setActiveView("tracker");
    triggerToast(`Alhamdulillah! Permohonan peminjaman aset berhasil diajukan dengan Nomor: ${newRequestNumber}`);
  };

  const handleAddResourceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newResName.trim() || !newResOwnerName.trim() || !newResLocation.trim()) {
      alert("Mohon lengkapi nama alat, pemilik, dan lokasi penyimpanan!");
      return;
    }

    const tagsArray = newResTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newItem: ResourceItem = {
      id: `res-${Date.now()}`,
      name: newResName,
      category: newResCategory,
      description: newResDesc || "Perlengkapan siap dipinjamkan untuk mendukung dakwah dan kegiatan sosial masyarakat.",
      ownerName: newResOwnerName,
      ownerRole: newResOwnerRole,
      ownerMasjid: newResOwnerMasjid,
      kelurahan: newResKelurahan,
      contactPhone: newResContactPhone || "0812-0000-0000",
      condition: newResCondition,
      availabilityStatus: "TERSEDIA",
      maxBorrowDays: newResMaxDays,
      depositOrCondition: newResDepositNote || "Gratis untuk kemaslahatan bersama.",
      tags: tagsArray.length > 0 ? tagsArray : ["Komunitas", "Sosial"],
      totalBorrowCount: 0,
      locationDetails: newResLocation,
    };

    setResources((prev) => [newItem, ...prev]);
    setShowAddResourceModal(false);

    // Reset
    setNewResName("");
    setNewResDesc("");
    setNewResOwnerName("");
    setNewResContactPhone("");
    setNewResTags("");
    setNewResLocation("");

    triggerToast(`Barang '${newItem.name}' berhasil didaftarkan ke Resource Library umat!`);
  };

  // Workflow handlers for tracking status
  const handleApproveRequest = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        return {
          ...r,
          status: "DISETUJUI_SIAP_AMBIL",
          approvedBy: "Pengurus DKM / Admin Sistem",
          trackingTimeline: r.trackingTimeline.map((step, idx) => {
            if (idx === 1) {
              return {
                ...step,
                timestamp: "15 Agu 2026, 08:30",
                note: "Disetujui. Barang telah disiapkan dan siap diambil.",
                completed: true,
              };
            }
            return step;
          }),
        };
      })
    );
    triggerToast("Permohonan berhasil disetujui! Status kini: Siap Diambil.");
  };

  const handleHandoverRequest = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        // Also update the resource availability
        setResources((rPrev) =>
          rPrev.map((res) =>
            res.id === r.resourceId
              ? { ...res, availabilityStatus: "SEDANG_DIPINJAM", totalBorrowCount: res.totalBorrowCount + 1 }
              : res
          )
        );
        return {
          ...r,
          status: "SEDANG_DIGUNAKAN",
          handoverDate: "15 Agu 2026",
          trackingTimeline: r.trackingTimeline.map((step, idx) => {
            if (idx <= 2) {
              return {
                ...step,
                timestamp: idx === 2 ? "15 Agu 2026, 09:15" : step.timestamp,
                note: idx === 2 ? "Barang telah diserahterimakan kepada peminjam." : step.note,
                completed: true,
              };
            }
            if (idx === 3) {
              return {
                ...step,
                completed: true,
                timestamp: "15 Agu 2026, Aktif",
                note: "Sedang digunakan untuk pelaksanaan proyek.",
              };
            }
            return step;
          }),
        };
      })
    );
    triggerToast("Barang telah diserahterimakan! Status: Sedang Digunakan.");
  };

  const handleReturnRequest = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        // Make resource available again
        setResources((rPrev) =>
          rPrev.map((res) =>
            res.id === r.resourceId ? { ...res, availabilityStatus: "TERSEDIA" } : res
          )
        );
        return {
          ...r,
          status: "SELESAI_DIKEMBALIKAN",
          returnDate: "15 Agu 2026",
          trackingTimeline: r.trackingTimeline.map((step) => ({
            ...step,
            completed: true,
            note:
              step.stage.includes("Pengembalian")
                ? "Telah dikembalikan lengkap, dicek berfungsi baik, dan ditutup dengan doa kebaikan."
                : step.note,
          })),
        };
      })
    );
    triggerToast("Alhamdulillah! Barang telah dikembalikan dan diverifikasi kondisinya.");
  };

  // Helper for category icons & styling
  const getCategoryMeta = (category: ResourceCategoryType) => {
    switch (category) {
      case "Peralatan & Perkakas (Tools)":
        return {
          icon: <Wrench className="w-4 h-4" />,
          badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
          cardBorder: "border-amber-200",
        };
      case "Buku & Referensi Islami":
        return {
          icon: <BookOpen className="w-4 h-4" />,
          badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
          cardBorder: "border-emerald-200",
        };
      case "Perlengkapan Acara & Audio (Event Equipment)":
        return {
          icon: <Volume2 className="w-4 h-4" />,
          badgeBg: "bg-blue-100 text-blue-900 border-blue-300",
          cardBorder: "border-blue-200",
        };
      case "Kesehatan & P3K":
        return {
          icon: <HeartPulse className="w-4 h-4" />,
          badgeBg: "bg-rose-100 text-rose-900 border-rose-300",
          cardBorder: "border-rose-200",
        };
      case "Kebersihan & Sanitasi":
        return {
          icon: <Sparkles className="w-4 h-4" />,
          badgeBg: "bg-teal-100 text-teal-900 border-teal-300",
          cardBorder: "border-teal-200",
        };
      default:
        return {
          icon: <Layers className="w-4 h-4" />,
          badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
          cardBorder: "border-slate-200",
        };
    }
  };

  const getStatusBadge = (status: ResourceItem["availabilityStatus"]) => {
    switch (status) {
      case "TERSEDIA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Tersedia untuk Dipinjam
          </span>
        );
      case "SEDANG_DIPINJAM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Sedang Dipinjam Proyek
          </span>
        );
      case "PERBAIKAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Dalam Pemeliharaan / Servis
          </span>
        );
    }
  };

  const getRequestStatusBadge = (status: ResourceBorrowRequest["status"]) => {
    switch (status) {
      case "MENUNGGU_PERSETUJUAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Menunggu Persetujuan DKM
          </span>
        );
      case "DISETUJUI_SIAP_AMBIL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
            Disetujui • Siap Diambil
          </span>
        );
      case "SEDANG_DIGUNAKAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            Sedang Digunakan di Lapangan
          </span>
        );
      case "SELESAI_DIKEMBALIKAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai Dikembalikan
          </span>
        );
      case "DITOLAK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <X className="w-3.5 h-3.5 text-rose-500" />
            Ditolak / Dibatalkan
          </span>
        );
    }
  };

  return (
    <div id="community-resource-library" className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-amber-500/50 flex items-start gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-amber-300">Konfirmasi Sistem Berjamaah</div>
            <div className="text-xs text-slate-200 mt-0.5">{successToast}</div>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner with Islamic Ariyah Principle */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-6 text-white border border-amber-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800/70 border border-amber-500/40 text-amber-300 text-xs font-semibold">
              <Share2 className="w-3.5 h-3.5" />
              <span>PERPUSTAKAAN & PERLENGKAPAN BERSAMA (COMMUNITY RESOURCE LIBRARY)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Saling Pinjam Aset & Perlengkapan Umat
            </h3>
            <p className="text-sm text-amber-200/90 leading-relaxed">
              Fasilitasi pinjam-meminjam alat pertukangan, sound system kajian, tenda kegiatan, referensi fiqh, kit medis P3K, dan mesin kebersihan antar-masjid & jamaah berbasis <strong>Akad &apos;Ariyah</strong> tanpa pungutan biaya, terstruktur dengan pelacak status digital.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              id="btn-open-add-resource"
              onClick={() => setShowAddResourceModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Wakafkan / Pinjamkan Alat</span>
            </button>
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-amber-700/60">
              <button
                id="view-tab-catalog"
                onClick={() => setActiveView("catalog")}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeView === "catalog"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-amber-300 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Katalog Aset ({resources.length})
              </button>
              <button
                id="view-tab-tracker"
                onClick={() => setActiveView("tracker")}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 relative ${
                  activeView === "tracker"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-amber-300 hover:text-white"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Pelacak Status ({requests.length})
                {totalPendingRequests > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 absolute top-1 right-1"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hadits Quote & Insight Strip */}
        <div className="mt-5 pt-4 border-t border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Kaidah Syariah Akad &apos;Ariyah:</strong> &quot;Pinjaman itu wajib dikembalikan dan orang yang menjamin wajib menanggung.&quot; (HR. Abu Dawud &amp; At-Tirmidzi)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-amber-300 shrink-0">
            <span>🛡️ 100% Bebas Riba &amp; Biaya Sewa</span>
            <span>🤝 Terverifikasi DKM</span>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Aset Siap Dipinjam</div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">{totalAvailable} Unit</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Tersedia di 4 Kelurahan</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Sedang Dipinjam Proyek</div>
            <div className="text-2xl font-black text-amber-700 font-mono mt-0.5">{totalInUse} Unit</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Aktif di Lapangan Umat</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Permohonan Aktif</div>
            <div className="text-2xl font-black text-blue-700 font-mono mt-0.5">{requests.length} Berkas</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{totalPendingRequests} Menunggu Review</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Penghematan Biaya Umat</div>
            <div className="text-xl font-black text-purple-700 font-mono mt-0.5">Rp 18.5 Jt+</div>
            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">{totalCompletedLendings} Misi Selesai Tuntas</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* VIEW 1: CATALOG OF RESOURCES */}
      {activeView === "catalog" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari alat (mesin rumput, sound system, buku fiqh, tensimeter, proyektor)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Kelurahan Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedKelurahan}
                  onChange={(e) => setSelectedKelurahan(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="ALL">Semua Kelurahan</option>
                  <option value="Sukamulya">Kelurahan Sukamulya</option>
                  <option value="Lebung Gajah">Kelurahan Lebung Gajah</option>
                  <option value="Karya Mulya">Kelurahan Karya Mulya</option>
                  <option value="Srimulya">Kelurahan Srimulya</option>
                </select>

                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="TERSEDIA">Tersedia Saja</option>
                  <option value="SEDANG_DIPINJAM">Sedang Dipinjam</option>
                </select>
              </div>
            </div>

            {/* Category Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedCategory === "ALL"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua Kategori ({resources.length})
              </button>
              <button
                onClick={() => setSelectedCategory("Peralatan & Perkakas (Tools)")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  selectedCategory === "Peralatan & Perkakas (Tools)"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Peralatan & Perkakas
              </button>
              <button
                onClick={() => setSelectedCategory("Perlengkapan Acara & Audio (Event Equipment)")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  selectedCategory === "Perlengkapan Acara & Audio (Event Equipment)"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                Audio & Acara
              </button>
              <button
                onClick={() => setSelectedCategory("Buku & Referensi Islami")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  selectedCategory === "Buku & Referensi Islami"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Buku & Kitab Fiqh
              </button>
              <button
                onClick={() => setSelectedCategory("Kesehatan & P3K")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  selectedCategory === "Kesehatan & P3K"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                Kesehatan & P3K
              </button>
              <button
                onClick={() => setSelectedCategory("Kebersihan & Sanitasi")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  selectedCategory === "Kebersihan & Sanitasi"
                    ? "bg-teal-600 text-white"
                    : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Kebersihan & Sanitasi
              </button>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">Tidak ada barang yang cocok</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian atau filter kategori untuk menemukan perlengkapan yang dibutuhkan.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setSelectedKelurahan("ALL");
                  setSelectedAvailability("ALL");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((item) => {
                const meta = getCategoryMeta(item.category);
                const isAvailable = item.availabilityStatus === "TERSEDIA";

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border ${meta.cardBorder} p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeBg}`}
                        >
                          {meta.icon}
                          <span className="truncate max-w-[140px]">{item.category}</span>
                        </span>
                        {getStatusBadge(item.availabilityStatus)}
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-amber-600 transition">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Specs & Conditions */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1.5 text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Kondisi Alat:</span>
                          <span className="font-semibold text-slate-900">{item.condition}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Maks. Peminjaman:</span>
                          <span className="font-bold text-amber-700">{item.maxBorrowDays} Hari</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Total Pernah Dipinjam:</span>
                          <span className="font-bold text-slate-900">{item.totalBorrowCount} Kali</span>
                        </div>
                        <div className="pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.locationDetails}</span>
                        </div>
                      </div>
                    </div>

                    {/* Owner & Action Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px]">
                        <div className="font-bold text-slate-900 truncate max-w-[130px]">{item.ownerName}</div>
                        <div className="text-slate-500 text-[10px]">{item.ownerMasjid} • {item.kelurahan}</div>
                      </div>

                      <button
                        id={`btn-borrow-${item.id}`}
                        onClick={() => setBorrowModalItem(item)}
                        disabled={!isAvailable}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                          isAvailable
                            ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <span>Pinjam Barang</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REQUEST STATUS TRACKER */}
      {activeView === "tracker" && (
        <div className="space-y-4">
          {/* Tracker Header & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Pelacak Real-Time Permintaan Peminjaman Aset
                </h4>
                <p className="text-xs text-slate-500">
                  Pantau setiap tahap siklus pinjam-meminjam: Verifikasi DKM → Serah Terima → Lapangan → Pengembalian
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={trackerStatusFilter}
                  onChange={(e) => setTrackerStatusFilter(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">Semua Status Permintaan</option>
                  <option value="MENUNGGU_PERSETUJUAN">Menunggu Persetujuan</option>
                  <option value="DISETUJUI_SIAP_AMBIL">Disetujui / Siap Diambil</option>
                  <option value="SEDANG_DIGUNAKAN">Sedang Digunakan</option>
                  <option value="SELESAI_DIKEMBALIKAN">Selesai Dikembalikan</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nomor permohonan (PINJAM-2026-xxxx), nama peminjam, atau nama proyek kegiatan..."
                value={trackerSearch}
                onChange={(e) => setTrackerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">Tidak ada berkas permohonan yang sesuai</h4>
              <p className="text-xs text-slate-500">Silakan ajukan peminjaman melalui Katalog Aset Komunitas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-amber-400 transition"
                >
                  {/* Top Bar with Number & Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-slate-900 text-amber-300 font-mono font-bold text-xs rounded-lg shadow-sm">
                        {req.requestNumber}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{req.resourceName}</div>
                        <div className="text-[11px] text-slate-500">Diajukan tanggal: {req.requestDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getRequestStatusBadge(req.status)}
                      <button
                        onClick={() => setPrintReceiptRequest(req)}
                        title="Cetak Berita Acara Digital"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1 font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Berita Acara</span>
                      </button>
                    </div>
                  </div>

                  {/* Project & Borrower Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-slate-500 font-medium">Proyek & Kegiatan:</div>
                      <div className="font-bold text-slate-900 mt-0.5">{req.projectOrEventName}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{req.purpose}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 font-medium">Peminjam & Asal Lembaga:</div>
                      <div className="font-bold text-slate-900 mt-0.5">{req.borrowerName}</div>
                      <div className="text-slate-600 text-[11px]">{req.borrowerMasjid} • {req.borrowerKelurahan}</div>
                      <div className="text-emerald-700 font-mono text-[11px] font-semibold mt-0.5">WA: {req.borrowerPhone}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 font-medium">Rentang Waktu Peminjaman:</div>
                      <div className="font-bold text-amber-800 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {req.startDate} s.d {req.endDate}
                      </div>
                      {req.approvedBy && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          Disetujui oleh: <span className="font-semibold text-slate-800">{req.approvedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Step Visual Progress Stepper */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Status Alur Peminjaman (Workflow Timeline):
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {req.trackingTimeline.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className={`p-2.5 rounded-xl border text-[11px] space-y-1 transition ${
                            step.completed
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                              : "bg-slate-50/80 border-slate-200 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {step.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] flex items-center justify-center font-bold text-slate-400">
                                {sIdx + 1}
                              </div>
                            )}
                            <span className="font-bold truncate text-[11px]">{step.stage}</span>
                          </div>
                          <div className="text-[10px] opacity-75 font-mono">{step.timestamp}</div>
                          <p className="text-[10px] line-clamp-2 leading-tight opacity-90">{step.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workflow Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500 italic">
                      {req.notes || "Pastikan barang dijaga dengan penuh amanah demi kemaslahatan bersama."}
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === "MENUNGGU_PERSETUJUAN" && (
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setujui Permohonan (DKM)
                        </button>
                      )}

                      {req.status === "DISETUJUI_SIAP_AMBIL" && (
                        <button
                          onClick={() => handleHandoverRequest(req.id)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Konfirmasi Serah Terima Barang
                        </button>
                      )}

                      {req.status === "SEDANG_DIGUNAKAN" && (
                        <button
                          onClick={() => handleReturnRequest(req.id)}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Tandai Dikembalikan & Verifikasi
                        </button>
                      )}

                      {req.status === "SELESAI_DIKEMBALIKAN" && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Transaksi &apos;Ariyah Selesai Berkah
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: BORROW ITEM REQUEST FORM */}
      {borrowModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-amber-300 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Formulir Akad &apos;Ariyah (Pinjam-Meminjam Aset Umat)
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Pengajuan Peminjaman Barang
                </h3>
              </div>
              <button
                onClick={() => setBorrowModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Resource Snapshot */}
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1 text-amber-950">
              <div className="font-bold text-sm text-slate-900">{borrowModalItem.name}</div>
              <div className="text-slate-600">{borrowModalItem.description}</div>
              <div className="pt-2 flex flex-wrap gap-3 text-[11px] text-amber-900 font-medium">
                <span>📍 Lokasi: {borrowModalItem.locationDetails}</span>
                <span>⏱️ Batas Maksimal: {borrowModalItem.maxBorrowDays} Hari</span>
                <span>👤 Pemilik/DKM: {borrowModalItem.ownerName}</span>
              </div>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Peminjam / Penanggung Jawab *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ustadz Faisal Basri"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={borrowerPhone}
                    onChange={(e) => setBorrowerPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Asal Masjid / Lembaga / Majelis
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Masjid Baiturrahman"
                    value={borrowerMasjid}
                    onChange={(e) => setBorrowerMasjid(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelurahan Domisili
                  </label>
                  <select
                    value={borrowerKelurahan}
                    onChange={(e) =>
                      setBorrowerKelurahan(
                        e.target.value as "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya"
                      )
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Sukamulya">Sukamulya</option>
                    <option value="Lebung Gajah">Lebung Gajah</option>
                    <option value="Karya Mulya">Karya Mulya</option>
                    <option value="Srimulya">Srimulya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Proyek / Kegiatan Kemaslahatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Posko Kesehatan Lansia / Kerja Bakti Lingkungan"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rencana Keperluan & Lokasi Penggunaan
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan secara singkat bagaimana barang akan digunakan..."
                  value={projectPurpose}
                  onChange={(e) => setProjectPurpose(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Mulai Pinjam
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Estimasi Tanggal Pengembalian
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Akad Ariyah Agreement Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreedToAriyah}
                    onChange={(e) => setAgreedToAriyah(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-700 leading-snug">
                    Saya menyatakan menerima akad <strong>&apos;Ariyah</strong> (pinjam-meminjam syariah tanpa biaya/bunga), berkomitmen menjaga keutuhan &amp; kebersihan barang, serta mengembalikannya tepat waktu demi kemaslahatan jamaah lainnya.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBorrowModalItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-lg shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Kirim Permohonan Pinjam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW RESOURCE (WAKAFKAN / PINJAMKAN ASET) */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-amber-300 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Kontribusi Aset Komunitas
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Daftarkan Perlengkapan / Buku untuk Dipinjamkan
                </h3>
              </div>
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResourceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Barang / Peralatan / Kitab *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Genset Listrik 2500 Watt / Set Kitab Tafsir Ibnu Katsir"
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Aset *
                  </label>
                  <select
                    value={newResCategory}
                    onChange={(e) => setNewResCategory(e.target.value as ResourceCategoryType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Peralatan & Perkakas (Tools)">Peralatan & Perkakas (Tools)</option>
                    <option value="Perlengkapan Acara & Audio (Event Equipment)">Perlengkapan Acara & Audio</option>
                    <option value="Buku & Referensi Islami">Buku & Referensi Islami</option>
                    <option value="Kesehatan & P3K">Kesehatan & P3K</option>
                    <option value="Kebersihan & Sanitasi">Kebersihan & Sanitasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kondisi Barang *
                  </label>
                  <select
                    value={newResCondition}
                    onChange={(e) =>
                      setNewResCondition(
                        e.target.value as
                          | "Sangat Baik (Seperti Baru)"
                          | "Baik & Berfungsi Penuh"
                          | "Cukup (Perlu Kehati-hatian)"
                      )
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Sangat Baik (Seperti Baru)">Sangat Baik (Seperti Baru)</option>
                    <option value="Baik & Berfungsi Penuh">Baik & Berfungsi Penuh</option>
                    <option value="Cukup (Perlu Kehati-hatian)">Cukup (Perlu Kehati-hatian)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi & Spesifikasi Lengkap
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan spesifikasi, kelengkapan aksesoris, dan peruntukan..."
                  value={newResDesc}
                  onChange={(e) => setNewResDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Pemilik / DKM *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: H. Mahfudz / DKM Baiturrahim"
                    value={newResOwnerName}
                    onChange={(e) => setNewResOwnerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Peran Pemilik
                  </label>
                  <select
                    value={newResOwnerRole}
                    onChange={(e) =>
                      setNewResOwnerRole(
                        e.target.value as
                          | "Jamaah Masjid"
                          | "DKM / Pengurus"
                          | "Relawan Komunitas"
                          | "Majelis Taklim"
                      )
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Jamaah Masjid">Jamaah Masjid</option>
                    <option value="DKM / Pengurus">DKM / Pengurus</option>
                    <option value="Relawan Komunitas">Relawan Komunitas</option>
                    <option value="Majelis Taklim">Majelis Taklim</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Masjid Asal
                  </label>
                  <input
                    type="text"
                    placeholder="Masjid Al-Ikhlas"
                    value={newResOwnerMasjid}
                    onChange={(e) => setNewResOwnerMasjid(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelurahan
                  </label>
                  <select
                    value={newResKelurahan}
                    onChange={(e) =>
                      setNewResKelurahan(
                        e.target.value as "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya"
                      )
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Sukamulya">Sukamulya</option>
                    <option value="Lebung Gajah">Lebung Gajah</option>
                    <option value="Karya Mulya">Karya Mulya</option>
                    <option value="Srimulya">Srimulya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Maks. Pinjam (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newResMaxDays}
                    onChange={(e) => setNewResMaxDays(parseInt(e.target.value) || 3)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lokasi Pengambilan & Penyimpanan Barang *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gudang DKM Masjid Al-Ikhlas Lt. 1, hubungi Pak Rusdi"
                  value={newResLocation}
                  onChange={(e) => setNewResLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tag Kata Kunci (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Genset, Listrik, Darurat, Kajian"
                  value={newResTags}
                  onChange={(e) => setNewResTags(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Daftarkan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINT / DIGITAL RECEIPT VIEW */}
      {printReceiptRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Berita Acara Serah Terima Digital (&apos;Ariyah)
                </h3>
              </div>
              <button
                onClick={() => setPrintReceiptRequest(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3 font-mono">
              <div className="text-center border-b pb-2">
                <div className="font-bold text-slate-900 text-sm">EKOSISTEM ISLAMICITY 4B KAFFAH</div>
                <div className="text-[10px] text-slate-500">Kecamatan Sematang Borang, Palembang</div>
                <div className="text-[11px] font-bold text-amber-700 mt-1">
                  NO. SURAT JALAN: {printReceiptRequest.requestNumber}
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Barang:</span>
                  <span className="font-bold text-slate-900 text-right">{printReceiptRequest.resourceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peminjam:</span>
                  <span className="font-bold text-slate-900">{printReceiptRequest.borrowerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Proyek / Acara:</span>
                  <span className="font-semibold text-slate-800">{printReceiptRequest.projectOrEventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Durasi Pinjam:</span>
                  <span className="font-bold text-amber-700">{printReceiptRequest.startDate} - {printReceiptRequest.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Saat Ini:</span>
                  <span className="font-bold text-slate-900">{printReceiptRequest.status}</span>
                </div>
              </div>

              <div className="border-t border-dashed pt-2 text-[10px] text-slate-500 space-y-1 text-center italic">
                &quot;Barang telah diserahterimakan dengan akad &apos;Ariyah (tanpa biaya). Wajib dirawat dan dikembalikan tepat waktu.&quot;
              </div>

              <div className="pt-3 flex justify-between text-center text-[10px] text-slate-700 font-sans">
                <div>
                  <div className="text-slate-400">Pihak Peminjam</div>
                  <div className="mt-8 font-bold border-t pt-1">{printReceiptRequest.borrowerName}</div>
                </div>
                <div>
                  <div className="text-slate-400">Pihak Pengelola DKM</div>
                  <div className="mt-8 font-bold border-t pt-1">{printReceiptRequest.approvedBy || "DKM Sematang Borang"}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert("Berita Acara Digital siap diunduh/dicetak.");
                  setPrintReceiptRequest(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Bukti Serah Terima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
