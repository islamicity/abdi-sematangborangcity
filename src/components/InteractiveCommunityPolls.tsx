import { useState, useMemo, FormEvent } from "react";
import confetti from "canvas-confetti";
import {
  Vote,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Filter,
  Search,
  MessageSquare,
  Send,
  Building,
  Share2,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  Radio,
  FileCheck,
  Zap,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { CommunityPoll, PollOption, PollComment } from "../types";
import { INITIAL_COMMUNITY_POLLS } from "../data/communityPollsData";

interface InteractiveCommunityPollsProps {
  currentUserName?: string;
  currentUserRole?: string;
  currentUserKelurahan?: string;
}

export default function InteractiveCommunityPolls({
  currentUserName = "dr. Muhammad Hidayatullah, Sp.A",
  currentUserRole = "Relawan Medis Dhuafa",
  currentUserKelurahan = "Sukamulya",
}: InteractiveCommunityPollsProps) {
  const [polls, setPolls] = useState<CommunityPoll[]>(() => {
    try {
      const saved = localStorage.getItem("berjamaah_community_polls_state");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.log("Could not load stored polls", e);
    }
    return INITIAL_COMMUNITY_POLLS;
  });

  // Track user's selected vote per poll ID: { [pollId]: optionId }
  const [userVotes, setUserVotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("berjamaah_user_voted_options");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.log("Could not load user votes", e);
    }
    return {
      "poll-04": "opt-04-1", // default participated in closed poll
    };
  });

  // Expanded discussion tabs for each poll
  const [expandedDiscussionPollIds, setExpandedDiscussionPollIds] = useState<Record<string, boolean>>({
    "poll-01": true,
  });

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [selectedKelurahanFilter, setSelectedKelurahanFilter] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Comment input per poll
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Leader Create Poll Modal State
  const [showCreatePollModal, setShowCreatePollModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<CommunityPoll["category"]>("Prioritas Layanan Sosial");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newTargetAudience, setNewTargetAudience] = useState<string>("Seluruh Jamaah & Relawan");
  const [newHomeMasjid, setNewHomeMasjid] = useState<string>("Masjid Jami' Al-Ikhlas");
  const [newKelurahan, setNewKelurahan] = useState<CommunityPoll["kelurahan"]>("Semua Kelurahan");
  const [newEndDate, setNewEndDate] = useState<string>("30 Agu 2026 (17 Safar 1448 H)");
  const [newLeaderName, setNewLeaderName] = useState<string>("Ustadz Faisal Basri, S.Pd.I");
  const [newLeaderRole, setNewLeaderRole] = useState<string>("Ketua Forum DKM Sematang Borang");
  const [newActionPlan, setNewActionPlan] = useState<string>(
    "Opsi terbanyak akan dibahas dalam Rapat Pleno DKM untuk segera dieksekusi dengan dana amanah umat."
  );
  const [newOptionsList, setNewOptionsList] = useState<Array<{ text: string; description: string }>>([
    { text: "Opsi Prioritas A", description: "Keterangan rincian program prioritas pertama" },
    { text: "Opsi Prioritas B", description: "Keterangan rincian program prioritas kedua" },
    { text: "Opsi Prioritas C", description: "Keterangan rincian program prioritas ketiga" },
  ]);

  // Toast & Share Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedPollId, setCopiedPollId] = useState<string | null>(null);

  // Persistence helpers
  const savePolls = (updatedPolls: CommunityPoll[]) => {
    setPolls(updatedPolls);
    try {
      localStorage.setItem("berjamaah_community_polls_state", JSON.stringify(updatedPolls));
    } catch (e) {
      console.log("Failed to save polls", e);
    }
  };

  const saveUserVotes = (updatedVotes: Record<string, string>) => {
    setUserVotes(updatedVotes);
    try {
      localStorage.setItem("berjamaah_user_voted_options", JSON.stringify(updatedVotes));
    } catch (e) {
      console.log("Failed to save user votes", e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Vote Handler
  const handleCastVote = (pollId: string, optionId: string) => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || poll.status === "DITUTUP") return;

    const previousVotedOptionId = userVotes[pollId];
    if (previousVotedOptionId === optionId) {
      showToast("Anda telah memilih opsi ini.");
      return;
    }

    const updatedPolls = polls.map((p) => {
      if (p.id !== pollId) return p;

      let newTotal = p.totalVotes;
      const updatedOptions = p.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, voteCount: opt.voteCount + 1 };
        }
        if (previousVotedOptionId && opt.id === previousVotedOptionId) {
          return { ...opt, voteCount: Math.max(0, opt.voteCount - 1) };
        }
        return opt;
      });

      if (!previousVotedOptionId) {
        newTotal += 1;
      }

      return {
        ...p,
        totalVotes: newTotal,
        options: updatedOptions,
      };
    });

    savePolls(updatedPolls);

    const updatedVotes = { ...userVotes, [pollId]: optionId };
    saveUserVotes(updatedVotes);

    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#10b981", "#38bdf8", "#f59e0b", "#a855f7"],
    });

    const chosenOption = poll.options.find((o) => o.id === optionId);
    showToast(
      `Alhamdulillah! Suara Anda untuk "${chosenOption?.text.slice(0, 35)}..." berhasil dicatat secara real-time.`
    );
  };

  // Add Comment / Aspirasi
  const handleAddComment = (pollId: string, e: FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[pollId]?.trim();
    if (!commentText) return;

    const poll = polls.find((p) => p.id === pollId);
    if (!poll) return;

    const userVotedOptionId = userVotes[pollId];
    const votedOption = poll.options.find((o) => o.id === userVotedOptionId);

    const newComment: PollComment = {
      id: `comm-${Date.now()}`,
      authorName: currentUserName,
      authorRole: currentUserRole,
      kelurahan: currentUserKelurahan,
      timestamp: "Baru saja",
      votedOptionText: votedOption ? votedOption.text : undefined,
      text: commentText,
    };

    const updatedPolls = polls.map((p) => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        comments: [newComment, ...p.comments],
      };
    });

    savePolls(updatedPolls);
    setCommentInputs({ ...commentInputs, [pollId]: "" });
    showToast("Jazakallahu khairan! Aspirasi & masukan syura Anda berhasil ditambahkan.");
  };

  // Live Pulse Simulation: Simulate incoming vote from community member
  const handleSimulateIncomingVote = (pollId: string) => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || poll.options.length === 0) return;

    // Pick random option
    const randomIndex = Math.floor(Math.random() * poll.options.length);
    const targetOption = poll.options[randomIndex];

    const updatedPolls = polls.map((p) => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        totalVotes: p.totalVotes + 1,
        options: p.options.map((opt, idx) => (idx === randomIndex ? { ...opt, voteCount: opt.voteCount + 1 } : opt)),
      };
    });

    savePolls(updatedPolls);
    showToast(`⚡ Real-time update: 1 suara baru masuk untuk opsi "${targetOption.text.slice(0, 30)}..."`);
  };

  // Create New Poll Submit
  const handleCreateNewPoll = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Mohon isi judul jajak pendapat.");
      return;
    }

    const filteredOptions = newOptionsList.filter((o) => o.text.trim().length > 0);
    if (filteredOptions.length < 2) {
      alert("Mohon sediakan minimal 2 pilihan opsi jawaban.");
      return;
    }

    const colors = ["#10b981", "#38bdf8", "#f59e0b", "#a855f7", "#ec4899", "#6366f1"];

    const formattedOptions: PollOption[] = filteredOptions.map((opt, idx) => ({
      id: `opt-${Date.now()}-${idx}`,
      text: opt.text.trim(),
      description: opt.description.trim() || undefined,
      voteCount: 0,
      colorHex: colors[idx % colors.length],
      badgeTag: idx === 0 ? "Opsi Baru" : undefined,
    }));

    const newPoll: CommunityPoll = {
      id: `poll-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || "Jajak pendapat terbuka Forum DKM untuk kemaslahatan jamaah.",
      targetAudience: newTargetAudience.trim() || "Seluruh Jamaah & Relawan",
      homeMasjid: newHomeMasjid,
      kelurahan: newKelurahan,
      status: "AKTIF",
      createdAt: "Hari ini",
      endDate: newEndDate.trim() || "30 Hari ke depan",
      totalVotes: 0,
      allowMultipleChoices: false,
      dkmLeaderInitiator: {
        name: newLeaderName.trim() || "Takmir Masjid",
        role: newLeaderRole.trim() || "Koordinator Musyawarah DKM",
        avatarColor: "emerald",
      },
      actionableDecisionPlan: newActionPlan.trim() || undefined,
      options: formattedOptions,
      comments: [],
    };

    savePolls([newPoll, ...polls]);
    setShowCreatePollModal(false);
    showToast(`Jajak Pendapat Baru "${newPoll.title.slice(0, 35)}..." berhasil diterbitkan ke seluruh jamaah!`);

    // Reset form
    setNewTitle("");
    setNewDescription("");
  };

  // Load Preset Template for Leader
  const handleApplyPresetTemplate = (type: "sedekah" | "kajian" | "ramadhan") => {
    if (type === "sedekah") {
      setNewTitle("Musyawarah Sasaran Drop Logistik Pangan Darurat Akhir Pekan");
      setNewCategory("Prioritas Layanan Sosial");
      setNewDescription(
        "Penentuan prioritas distribusi 500 paket sembako beras & minyak sayur dari kas Sedekah Subuh pekan ini."
      );
      setNewOptionsList([
        { text: "Keluarga Prasejahtera & Lansia Sebatang Kara RW 02 Lebung Gajah", description: "Bantaran rawa lebung" },
        { text: "Buruh Harian Lepas & Pengayuh Becak Sukamulya", description: "Sekitar pasar tradisional" },
        { text: "Santri Yatim Dhuafa & Guru Ngaji Honorer Srimulya", description: "Pondok & TPQ binaan DKM" },
      ]);
    } else if (type === "kajian") {
      setNewTitle("Pilihan Topik Kajian Tematik Khusus Pemuda & Generasi Z");
      setNewCategory("Acara & Kajian Umat");
      setNewDescription("Survei materi dakwah yang paling diminati generasi muda masjid untuk kajian pekanan.");
      setNewOptionsList([
        { text: "Fiqih Finansial Islam & Menghindari Jerat Pinjol / Judol", description: "Literasi muamalah kontemporer" },
        { text: "Manajemen Waktu Islami & Kesehatan Mental Menurut Sunnah", description: "Self-healing berbasis dzikir" },
        { text: "Kewirausahaan Berkah & Merintis Usaha Halal Modal Minim", description: "Workshop UMKM muda" },
      ]);
    } else {
      setNewTitle("Prioritas Pengadaan Fasilitas Ruang Ramah Anak & Difabel di Masjid");
      setNewCategory("Fasilitas & Operasional Masjid");
      setNewDescription("Aspirasi jamaah untuk peningkatan sarana kenyamanan ibadah lansia, difabel, dan balita.");
      setNewOptionsList([
        { text: "Ramp Kursi Roda & Handrail Toilet Difabel", description: "Aksesibilitas ramah lansia" },
        { text: "Play-Corner Edukatif Islami & Ruang Menyusui Khusus Ummahat", description: "Kenyamanan keluarga" },
        { text: "Water Purifier Minum Gratis & Tempat Wudhu Duduk", description: "Efisiensi dan kenyamanan wudhu" },
      ]);
    }
  };

  // Copy Poll Summary to Clipboard
  const handleSharePoll = (poll: CommunityPoll) => {
    const sortedOpts = [...poll.options].sort((a, b) => b.voteCount - a.voteCount);
    const topOpt = sortedOpts[0];
    const topPct = poll.totalVotes > 0 ? Math.round((topOpt.voteCount / poll.totalVotes) * 100) : 0;

    const textSummary = `📊 *HASIL MUSYAWARAH DIGITAL JAMAAH*
🕌 *${poll.homeMasjid} - Sematang Borang*
📝 *Topik:* ${poll.title}
👥 *Total Suara:* ${poll.totalVotes} Jamaah
🏆 *Pilihan Utama:* ${topOpt.text} (${topPct}%, ${topOpt.voteCount} Suara)
🗓️ *Batas Akhir:* ${poll.endDate}

Mari salurkan aspirasi demi kemaslahatan umat melalui Platform Berjamaah ABDI.`;

    navigator.clipboard.writeText(textSummary);
    setCopiedPollId(poll.id);
    showToast("Ringkasan hasil jajak pendapat berhasil disalin ke papan klip!");
    setTimeout(() => setCopiedPollId(null), 3000);
  };

  // Aggregates
  const totalPollsCount = polls.length;
  const activePollsCount = polls.filter((p) => p.status === "AKTIF").length;
  const totalCommunityVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);
  const totalCommentsCount = polls.reduce((sum, p) => sum + p.comments.length, 0);

  // Filtered Polls
  const filteredPolls = useMemo(() => {
    return polls.filter((p) => {
      const matchCategory = selectedCategory === "Semua" || p.category === selectedCategory;
      const matchStatus = selectedStatus === "Semua" || p.status === selectedStatus;
      const matchKelurahan =
        selectedKelurahanFilter === "Semua" ||
        p.kelurahan === selectedKelurahanFilter ||
        p.kelurahan === "Semua Kelurahan";
      const matchQuery =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.options.some((o) => o.text.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchStatus && matchKelurahan && matchQuery;
    });
  }, [polls, selectedCategory, selectedStatus, selectedKelurahanFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/80 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/50 rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                <Vote className="w-3.5 h-3.5 text-emerald-400" />
                Musyawarah Digital Jamaah
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Real-Time Consensus
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Kec. Sematang Borang
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Interactive Community Polls & Jajak Pendapat
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Wadah syura & survei kilat DKM untuk memetakan preferensi jamaah terhadap agenda dakwah, penentuan titik
              lumbung pangan, serta prioritas alokasi dana Sedekah Subuh secara transparan dan akuntabel.
            </p>
          </div>

          {/* Leader Action Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-create-community-poll"
              onClick={() => setShowCreatePollModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl hover:shadow-emerald-500/20 transition active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Buat Jajak Pendapat Baru</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">Jajak Pendapat Aktif</div>
              <div className="text-lg font-black text-white font-mono">
                {activePollsCount} <span className="text-xs font-normal text-slate-400">/ {totalPollsCount} Total</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">Partisipasi Suara</div>
              <div className="text-lg font-black text-sky-400 font-mono">
                {totalCommunityVotes.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal text-slate-400">Suara</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">Aspirasi Jamaah</div>
              <div className="text-lg font-black text-amber-400 font-mono">
                {totalCommentsCount} <span className="text-xs font-normal text-slate-400">Masukan</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">Rasio Konsensus</div>
              <div className="text-lg font-black text-purple-300 font-mono">92.4%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari topik jajak pendapat, opsi, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500 font-semibold">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900 text-slate-200">
                Semua Kategori
              </option>
              <option value="Prioritas Layanan Sosial" className="bg-slate-900 text-slate-200">
                Prioritas Layanan Sosial
              </option>
              <option value="Acara & Kajian Umat" className="bg-slate-900 text-slate-200">
                Acara & Kajian Umat
              </option>
              <option value="Fasilitas & Operasional Masjid" className="bg-slate-900 text-slate-200">
                Fasilitas & Operasional Masjid
              </option>
              <option value="Pemberdayaan Ekonomi & UMKM" className="bg-slate-900 text-slate-200">
                Pemberdayaan Ekonomi & UMKM
              </option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900 text-slate-200">
                Semua Status
              </option>
              <option value="AKTIF" className="bg-slate-900 text-slate-200">
                Sedang Aktif (Voting Terbuka)
              </option>
              <option value="KONSENSUS_TERBENTUK" className="bg-slate-900 text-slate-200">
                Konsensus Terbentuk
              </option>
            </select>
          </div>

          {/* Kelurahan Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 font-semibold">Wilayah:</span>
            <select
              value={selectedKelurahanFilter}
              onChange={(e) => setSelectedKelurahanFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-900 text-slate-200">
                Semua Wilayah
              </option>
              <option value="Sukamulya" className="bg-slate-900 text-slate-200">
                Kel. Sukamulya
              </option>
              <option value="Lebung Gajah" className="bg-slate-900 text-slate-200">
                Kel. Lebung Gajah
              </option>
              <option value="Karya Mulya" className="bg-slate-900 text-slate-200">
                Kel. Karya Mulya
              </option>
              <option value="Srimulya" className="bg-slate-900 text-slate-200">
                Kel. Srimulya
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Polls Cards Feed */}
      <div className="space-y-6">
        {filteredPolls.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800 text-slate-400 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="text-base font-bold text-white">Tidak ada jajak pendapat yang sesuai filter</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Coba atur ulang kata kunci pencarian atau buat jajak pendapat baru menggunakan tombol di atas.
            </p>
          </div>
        ) : (
          filteredPolls.map((poll) => {
            const hasUserVoted = Boolean(userVotes[poll.id]);
            const userChosenOptionId = userVotes[poll.id];
            const isDiscussionExpanded = Boolean(expandedDiscussionPollIds[poll.id]);

            // Calculate highest voted option
            const sortedByVotes = [...poll.options].sort((a, b) => b.voteCount - a.voteCount);
            const topOptionId = sortedByVotes[0]?.id;

            return (
              <div
                key={poll.id}
                id={`poll-card-${poll.id}`}
                className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 shadow-xl transition space-y-5 relative overflow-hidden"
              >
                {/* Status Glow Indicator */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    poll.status === "AKTIF"
                      ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"
                      : "bg-gradient-to-r from-purple-500 to-indigo-500"
                  }`}
                ></div>

                {/* Header: Category, Status, Initiator, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          poll.category === "Prioritas Layanan Sosial"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : poll.category === "Acara & Kajian Umat"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                            : poll.category === "Pemberdayaan Ekonomi & UMKM"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        }`}
                      >
                        {poll.category}
                      </span>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md font-mono ${
                          poll.status === "AKTIF"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                            : "bg-purple-950 text-purple-300 border border-purple-500/40"
                        }`}
                      >
                        {poll.status === "AKTIF" ? "● SEDANG AKTIF" : "✓ KONSENSUS TERBENTUK"}
                      </span>

                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {poll.homeMasjid} ({poll.kelurahan})
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white leading-snug">{poll.title}</h3>
                    <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">{poll.description}</p>
                  </div>

                  {/* Right Header Metadata & Share */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-medium">Batas Akhir:</div>
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {poll.endDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Live Pulse Vote Simulation Button */}
                      {poll.status === "AKTIF" && (
                        <button
                          title="Simulasikan 1 suara real-time dari jamaah lain"
                          onClick={() => handleSimulateIncomingVote(poll.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1 border border-slate-700 active:scale-95"
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>+Suara Live</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSharePoll(poll)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition flex items-center gap-1 border border-slate-700"
                      >
                        {copiedPollId === poll.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3 h-3 text-slate-400" />
                            <span>Bagikan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Initiator DKM Leader Card */}
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center border border-emerald-500/30 text-xs">
                      {poll.dkmLeaderInitiator.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{poll.dkmLeaderInitiator.name}</div>
                      <div className="text-[11px] text-slate-400">{poll.dkmLeaderInitiator.role}</div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    Sasaran: <span className="font-semibold text-slate-200">{poll.targetAudience}</span>
                  </div>
                </div>

                {/* Interactive Poll Options & Live Progress Bars */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                    <span>PILIHAN OPSI SURVEI</span>
                    <span className="font-mono">
                      Total Partisipasi: <strong className="text-white font-bold">{poll.totalVotes}</strong> Suara
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {poll.options.map((option) => {
                      const isVotedByMe = userChosenOptionId === option.id;
                      const percentage =
                        poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0;
                      const isTopOption = poll.totalVotes > 0 && option.id === topOptionId;

                      return (
                        <div
                          key={option.id}
                          id={`poll-${poll.id}-opt-${option.id}`}
                          onClick={() => handleCastVote(poll.id, option.id)}
                          className={`group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                            isVotedByMe
                              ? "bg-slate-950 border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                              : "bg-slate-950/80 hover:bg-slate-950 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {/* Live Animated Background Progress Bar */}
                          <div
                            className="absolute inset-0 bg-emerald-500/10 pointer-events-none transition-all duration-500 ease-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: `${option.colorHex || "#10b981"}18`,
                            }}
                          ></div>

                          <div className="relative z-10 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Radio Indicator */}
                              <div className="mt-0.5 shrink-0">
                                {isVotedByMe ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-slate-400 flex items-center justify-center transition">
                                    <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-slate-600 transition"></div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-0.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                                    {option.text}
                                  </span>

                                  {isVotedByMe && (
                                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/40">
                                      Pilihan Anda
                                    </span>
                                  )}

                                  {isTopOption && (
                                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full border border-amber-500/30 flex items-center gap-1">
                                      <Award className="w-3 h-3 text-amber-400" />
                                      Paling Banyak Dipilih
                                    </span>
                                  )}
                                </div>

                                {option.description && (
                                  <p className="text-xs text-slate-400 leading-relaxed">{option.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Percentage & Vote Count Badge */}
                            <div className="text-right shrink-0">
                              <div className="text-base font-black text-white font-mono">{percentage}%</div>
                              <div className="text-[11px] font-mono text-slate-400">{option.voteCount} suara</div>
                            </div>
                          </div>

                          {/* Linear Bar Indicator */}
                          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-3 relative z-10">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: option.colorHex || "#10b981",
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actionable Decision Commitment Banner */}
                {poll.actionableDecisionPlan && (
                  <div className="bg-gradient-to-r from-slate-950 to-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30 flex items-start gap-3">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-emerald-300">Komitmen Rencana Eksekusi DKM:</div>
                      <p className="text-slate-300 leading-relaxed">{poll.actionableDecisionPlan}</p>
                    </div>
                  </div>
                )}

                {/* Musyawarah / Aspirasi Jamaah Discussion Accordion */}
                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setExpandedDiscussionPollIds({
                          ...expandedDiscussionPollIds,
                          [poll.id]: !isDiscussionExpanded,
                        })
                      }
                      className="text-xs font-bold text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Musyawarah & Aspirasi Jamaah ({poll.comments.length})</span>
                      {isDiscussionExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    <span className="text-[11px] text-slate-400">Syura & Ukhuwah Terbuka</span>
                  </div>

                  {isDiscussionExpanded && (
                    <div className="space-y-4 pt-2 animate-fadeIn">
                      {/* Comment Input Form */}
                      <form onSubmit={(e) => handleAddComment(poll.id, e)} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Tulis aspirasi / masukan syura Anda untuk DKM..."
                          value={commentInputs[poll.id] || ""}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [poll.id]: e.target.value,
                            })
                          }
                          className="flex-1 px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim</span>
                        </button>
                      </form>

                      {/* Comments List */}
                      {poll.comments.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
                          Belum ada catatan aspirasi. Jadilah yang pertama memberikan masukan syura!
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {poll.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{comment.authorName}</span>
                                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                                    {comment.authorRole} • {comment.kelurahan}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{comment.timestamp}</span>
                              </div>

                              {comment.votedOptionText && (
                                <div className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                                  <span>Mendukung:</span>
                                  <span className="text-slate-300 italic">
                                    &ldquo;{comment.votedOptionText.slice(0, 45)}...&rdquo;
                                  </span>
                                </div>
                              )}

                              <p className="text-xs text-slate-300 leading-relaxed">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW POLL MODAL (FOR MOSQUE LEADERS & DKM COORDINATORS) */}
      {showCreatePollModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Vote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Buat Jajak Pendapat Baru</h4>
                  <p className="text-[11px] text-slate-400">Survei Cepat DKM untuk Konsensus Jamaah</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreatePollModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fast Preset Templates Strip */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400">Gunakan Template Cepat DKM:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPresetTemplate("sedekah")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition"
                >
                  🌾 Prioritas Sedekah Pangan
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTemplate("kajian")}
                  className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs font-semibold border border-sky-500/40 transition"
                >
                  📖 Topik Kajian Pemuda
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTemplate("ramadhan")}
                  className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 text-xs font-semibold border border-amber-500/40 transition"
                >
                  🕌 Fasilitas Ramah Lansia/Difabel
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateNewPoll} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Judul / Pertanyaan Jajak Pendapat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Musyawarah Penentuan Titik Posko Kesehatan Gratis..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kategori Program *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CommunityPoll["category"])}
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Prioritas Layanan Sosial">Prioritas Layanan Sosial</option>
                    <option value="Acara & Kajian Umat">Acara & Kajian Umat</option>
                    <option value="Fasilitas & Operasional Masjid">Fasilitas & Operasional Masjid</option>
                    <option value="Pemberdayaan Ekonomi & UMKM">Pemberdayaan Ekonomi & UMKM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Wilayah Sasaran</label>
                  <select
                    value={newKelurahan}
                    onChange={(e) => setNewKelurahan(e.target.value as CommunityPoll["kelurahan"])}
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Semua Kelurahan">Semua Kelurahan (Kec. Sematang Borang)</option>
                    <option value="Sukamulya">Kelurahan Sukamulya</option>
                    <option value="Lebung Gajah">Kelurahan Lebung Gajah</option>
                    <option value="Karya Mulya">Kelurahan Karya Mulya</option>
                    <option value="Srimulya">Kelurahan Srimulya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Deskripsi & Latar Belakang</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan maksud dan tujuan diadakannya jajak pendapat ini..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              {/* Dynamic Options Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-400 font-bold">Pilihan Opsi Jawaban (Minimal 2) *</label>
                  {newOptionsList.length < 6 && (
                    <button
                      type="button"
                      onClick={() =>
                        setNewOptionsList([
                          ...newOptionsList,
                          {
                            text: `Opsi Prioritas ${String.fromCharCode(65 + newOptionsList.length)}`,
                            description: "",
                          },
                        ])
                      }
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Opsi
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {newOptionsList.map((opt, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold font-mono flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder={`Nama Opsi ${idx + 1}...`}
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...newOptionsList];
                            updated[idx].text = e.target.value;
                            setNewOptionsList(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                        />
                        {newOptionsList.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newOptionsList.filter((_, i) => i !== idx);
                              setNewOptionsList(updated);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Deskripsi singkat opsi (opsional)..."
                        value={opt.description}
                        onChange={(e) => {
                          const updated = [...newOptionsList];
                          updated[idx].description = e.target.value;
                          setNewOptionsList(updated);
                        }}
                        className="w-full px-3 py-1 bg-slate-900/60 rounded-lg border border-slate-800/80 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Batas Akhir Musyawarah</label>
                  <input
                    type="text"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    placeholder="Contoh: 30 Agu 2026 (17 Safar 1448 H)"
                    className="w-full px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Masjid Tuan Rumah</label>
                  <input
                    type="text"
                    value={newHomeMasjid}
                    onChange={(e) => setNewHomeMasjid(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Komitmen Rencana Eksekusi DKM</label>
                <input
                  type="text"
                  value={newActionPlan}
                  onChange={(e) => setNewActionPlan(e.target.value)}
                  placeholder="Langkah nyata yang akan diambil DKM setelah hasil voting final..."
                  className="w-full px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePollModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
                >
                  Terbitkan Jajak Pendapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
