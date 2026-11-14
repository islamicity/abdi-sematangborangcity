import { useState, useMemo, FormEvent } from "react";
import confetti from "canvas-confetti";
import {
  MessageSquareQuote,
  ShieldCheck,
  Star,
  ThumbsUp,
  UserCheck,
  Plus,
  Filter,
  Search,
  Sparkles,
  Building,
  CheckCircle2,
  Award,
  Share2,
  Lock,
  Flame,
  X,
  Send,
  Sliders,
  TrendingUp,
} from "lucide-react";
import { CommunityEndorsement } from "../types";
import { MemberServiceProfile, SkillGrowthItem } from "./ServiceJourneyTimeline";
import { INITIAL_COMMUNITY_ENDORSEMENTS } from "../data/communityEndorsementsData";

interface CommunityEndorsementSectionProps {
  selectedMember: MemberServiceProfile;
  allMembers: MemberServiceProfile[];
  onAddEndorsementSuccess?: (newEndorsement: CommunityEndorsement) => void;
}

export default function CommunityEndorsementSection({
  selectedMember,
  allMembers,
  onAddEndorsementSuccess,
}: CommunityEndorsementSectionProps) {
  const [endorsements, setEndorsements] = useState<CommunityEndorsement[]>(
    INITIAL_COMMUNITY_ENDORSEMENTS
  );
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>("ALL");
  const [selectedContextFilter, setSelectedContextFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [helpfulGiven, setHelpfulGiven] = useState<Record<string, boolean>>({});

  // Endorsement Form State
  const [targetSkillId, setTargetSkillId] = useState<string>(
    selectedMember.skillsAcquired[0]?.id || ""
  );
  const [authorName, setAuthorName] = useState<string>("dr. Nurul Azizah");
  const [authorRole, setAuthorRole] = useState<string>(
    "Dokter Spesialis & Relawan Posko Medis"
  );
  const [authorMasjid, setAuthorMasjid] = useState<string>(
    "Masjid Jami' Al-Ikhlas"
  );
  const [authorKelurahan, setAuthorKelurahan] = useState<
    CommunityEndorsement["authorKelurahan"]
  >("Sukamulya");
  const [relationshipContext, setRelationshipContext] = useState<
    CommunityEndorsement["relationshipContext"]
  >("Rekan Tim Medis");
  const [trustRating, setTrustRating] = useState<number>(5);
  const [trustTag, setTrustTag] = useState<CommunityEndorsement["trustTag"]>(
    "Sangat Amanah & Profesional"
  );
  const [endorsementText, setEndorsementText] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter endorsements for the selected member
  const memberEndorsements = useMemo(() => {
    return endorsements.filter((e) => e.targetMemberId === selectedMember.id);
  }, [endorsements, selectedMember.id]);

  // Apply sub-filters
  const filteredEndorsements = useMemo(() => {
    return memberEndorsements.filter((e) => {
      const matchSkill =
        selectedSkillFilter === "ALL" || e.targetSkillId === selectedSkillFilter;
      const matchContext =
        selectedContextFilter === "ALL" || e.relationshipContext === selectedContextFilter;
      const matchSearch =
        searchQuery.trim() === "" ||
        e.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.targetSkillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.endorsementText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.authorMasjid.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSkill && matchContext && matchSearch;
    });
  }, [memberEndorsements, selectedSkillFilter, selectedContextFilter, searchQuery]);

  // Aggregate stats
  const trustScoreStats = useMemo(() => {
    const total = memberEndorsements.length;
    if (total === 0) return { avgRating: 5.0, count: 0, verifiedPct: 100 };
    const sum = memberEndorsements.reduce((acc, curr) => acc + curr.trustRating, 0);
    const verifiedCount = memberEndorsements.filter((e) => e.isVerifiedMember).length;
    return {
      avgRating: (sum / total).toFixed(1),
      count: total,
      verifiedPct: Math.round((verifiedCount / total) * 100),
    };
  }, [memberEndorsements]);

  // Endorsements grouped by skill
  const skillEndorsementCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    memberEndorsements.forEach((e) => {
      counts[e.targetSkillId] = (counts[e.targetSkillId] || 0) + 1;
    });
    return counts;
  }, [memberEndorsements]);

  const handleHelpfulClick = (endorsementId: string) => {
    if (helpfulGiven[endorsementId]) {
      // already given
      return;
    }

    setHelpfulGiven((prev) => ({ ...prev, [endorsementId]: true }));
    setEndorsements((prev) =>
      prev.map((item) =>
        item.id === endorsementId
          ? { ...item, helpfulCount: item.helpfulCount + 1 }
          : item
      )
    );
    showToast("Jazakallahu khair! Konfirmasi amanah Anda telah dicatat.");
  };

  const handleOpenAddModal = (skillId?: string) => {
    if (skillId) {
      setTargetSkillId(skillId);
    } else if (selectedMember.skillsAcquired.length > 0) {
      setTargetSkillId(selectedMember.skillsAcquired[0].id);
    }
    setShowAddModal(true);
  };

  const handleSubmitEndorsement = (e: FormEvent) => {
    e.preventDefault();
    if (!endorsementText.trim() || endorsementText.trim().length < 15) {
      alert("Mohon tuliskan testimoni endorsement minimal 15 karakter.");
      return;
    }

    const matchedSkill = selectedMember.skillsAcquired.find(
      (s) => s.id === targetSkillId
    );
    const skillName = matchedSkill
      ? matchedSkill.skillName
      : "Keahlian Pengabdian Jamaah";

    const newEndorsement: CommunityEndorsement = {
      id: `end-${Date.now()}`,
      targetMemberId: selectedMember.id,
      targetSkillId: targetSkillId || `sk-gen-${Date.now()}`,
      targetSkillName: skillName,
      authorMemberId: `author-${Date.now()}`,
      authorName: authorName.trim() || "Jamaah Terverifikasi",
      authorRole: authorRole.trim() || "Relawan & Jamaah Masjid",
      authorMasjid: authorMasjid.trim() || "Masjid Sematang Borang",
      authorKelurahan,
      authorAvatarColor: "bg-teal-600",
      isVerifiedMember: true,
      relationshipContext,
      endorsementText: endorsementText.trim(),
      trustRating,
      trustTag,
      createdAt: "16 Agu 2026",
      hijriDate: "03 Safar 1448 H",
      verifiedDkmSignature: `DKM-P2P-${Date.now().toString().slice(-6)}`,
      helpfulCount: 1,
    };

    setEndorsements((prev) => [newEndorsement, ...prev]);
    setShowAddModal(false);
    setEndorsementText("");

    // Trigger celebratory confetti
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#10b981", "#f59e0b", "#06b6d4", "#8b5cf6"],
    });

    showToast(
      `Alhamdulillah! Endorsement untuk keahlian "${skillName}" berhasil dipublikasikan.`
    );

    if (onAddEndorsementSuccess) {
      onAddEndorsementSuccess(newEndorsement);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-emerald-200 border border-emerald-500/80 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Endorsement Header & Trust Summary */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800 pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-400" />
              <span>PEER-TO-PEER COMMUNITY ENDORSEMENT SYSTEM</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Rekomendasi & Bukti Kepercayaan Jamaah</span>
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                P2P Trust Network
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fitur saling merekomendasikan (<strong>Community Endorsements</strong>) antar jamaah & takmir masjid terverifikasi untuk memvalidasi keandalan keahlian, integritas amanah, serta rekam jejak aksi nyata di wilayah Sematang Borang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-write-community-endorsement"
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tulis Endorsement Rekan</span>
            </button>
          </div>
        </div>

        {/* Trust Metric KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Indeks Kepercayaan Jamaah
              </span>
              <div className="text-2xl font-black font-mono text-amber-400 flex items-center gap-1.5 mt-0.5">
                <span>{trustScoreStats.avgRating}</span>
                <div className="flex items-center text-amber-400 text-sm">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star
                      key={st}
                      className={`w-3.5 h-3.5 ${
                        st <= Math.round(Number(trustScoreStats.avgRating))
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-slate-500">Berdasarkan {trustScoreStats.count} ulasan terverifikasi</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Testimoni Amanah
              </span>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                {trustScoreStats.count} Testimoni
              </div>
              <span className="text-[10px] text-emerald-500/80">Lintas Takmir, Rekan & Warga</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Integritas Terverifikasi DKM
              </span>
              <div className="text-2xl font-black font-mono text-cyan-400 mt-0.5">
                {trustScoreStats.verifiedPct}% Valid
              </div>
              <span className="text-[10px] text-cyan-500/80">Tanda Tangan Digital Kriptografis</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick Skill Endorse Badge Selector */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              Keahlian Terdaftar & Jumlah Validasi Rekan:
            </span>
            <span className="text-[11px] text-slate-400">
              Klik keahlian untuk memfilter atau menambahkan ulasan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {selectedMember.skillsAcquired.map((skill) => {
              const count = skillEndorsementCounts[skill.id] || 0;
              const isFiltered = selectedSkillFilter === skill.id;

              return (
                <div
                  key={skill.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isFiltered
                      ? "bg-emerald-950/70 border-emerald-400 ring-1 ring-emerald-400/50 shadow-md"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                  }`}
                >
                  <div
                    onClick={() =>
                      setSelectedSkillFilter(isFiltered ? "ALL" : skill.id)
                    }
                    className="flex-1 cursor-pointer truncate"
                  >
                    <div className="text-xs font-bold text-white truncate">
                      {skill.skillName}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-emerald-400 font-semibold font-mono">
                        Lvl {skill.currentLevel}/5
                      </span>
                      <span>•</span>
                      <span className="text-amber-300 font-mono font-bold">
                        {count} Endorsement
                      </span>
                    </div>
                  </div>

                  <button
                    id={`btn-endorse-skill-${skill.id}`}
                    onClick={() => handleOpenAddModal(skill.id)}
                    title="Beri endorsement untuk keahlian ini"
                    className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Validasi</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pemberi ulasan, keahlian, atau masjid..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                Semua Keahlian ({memberEndorsements.length})
              </option>
              {selectedMember.skillsAcquired.map((sk) => (
                <option
                  key={sk.id}
                  value={sk.id}
                  className="bg-slate-900 text-slate-200"
                >
                  {sk.skillName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedContextFilter}
              onChange={(e) => setSelectedContextFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                Semua Relasi
              </option>
              <option
                value="Rekan Tim Medis"
                className="bg-slate-900 text-slate-200"
              >
                Rekan Tim Medis
              </option>
              <option
                value="Pengurus DKM"
                className="bg-slate-900 text-slate-200"
              >
                Pengurus DKM
              </option>
              <option
                value="Rekan Kerja Lapangan"
                className="bg-slate-900 text-slate-200"
              >
                Rekan Kerja Lapangan
              </option>
              <option
                value="Ketua RW / RT"
                className="bg-slate-900 text-slate-200"
              >
                Ketua RW / RT
              </option>
              <option
                value="Penerima Manfaat / Jamaah"
                className="bg-slate-900 text-slate-200"
              >
                Penerima Manfaat / Jamaah
              </option>
            </select>
          </div>

          {(selectedSkillFilter !== "ALL" ||
            selectedContextFilter !== "ALL" ||
            searchQuery.trim() !== "") && (
            <button
              onClick={() => {
                setSelectedSkillFilter("ALL");
                setSelectedContextFilter("ALL");
                setSearchQuery("");
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Endorsements List */}
      <div className="space-y-4">
        {filteredEndorsements.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-10 text-center border border-slate-800 space-y-3">
            <MessageSquareQuote className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-white font-bold text-sm">
              Belum ada endorsement yang cocok dengan kriteria
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Jadilah orang pertama yang menuliskan testimoni pengabdian dan validasi keahlian untuk <strong>{selectedMember.name}</strong>.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black rounded-xl text-xs shadow-md"
            >
              Tulis Endorsement Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEndorsements.map((item) => {
              const isHelpful = helpfulGiven[item.id];

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm group"
                >
                  <div className="space-y-3">
                    {/* Author Top Strip */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl ${
                            item.authorAvatarColor || "bg-emerald-600"
                          } text-white font-black flex items-center justify-center text-sm shadow-md shrink-0`}
                        >
                          {item.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-white">
                              {item.authorName}
                            </h4>
                            {item.isVerifiedMember && (
                              <ShieldCheck
                                className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                                title="Jamaah Terverifikasi DKM"
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.authorRole}
                          </p>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>🕌 {item.authorMasjid}</span>
                            <span>•</span>
                            <span>Kel. {item.authorKelurahan}</span>
                          </div>
                        </div>
                      </div>

                      {/* Relationship Pill */}
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800 shrink-0">
                        {item.relationshipContext}
                      </span>
                    </div>

                    {/* Endorsed Skill Tag & Rating */}
                    <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px] font-bold text-amber-300 truncate">
                          {item.targetSkillName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= item.trustRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Endorsement Statement */}
                    <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40">
                      &ldquo;{item.endorsementText}&rdquo;
                    </p>

                    {/* Trust Tag */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        {item.trustTag}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Metadata & Helpful Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <div className="space-y-0.5">
                      <div>🗓️ {item.createdAt} {item.hijriDate ? `(${item.hijriDate})` : ""}</div>
                      <div className="font-mono text-slate-500">Token: {item.verifiedDkmSignature}</div>
                    </div>

                    <button
                      id={`btn-helpful-${item.id}`}
                      onClick={() => handleHelpfulClick(item.id)}
                      disabled={isHelpful}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        isHelpful
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/50 cursor-default"
                          : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800 active:scale-95"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isHelpful ? "fill-emerald-400 text-emerald-400" : ""}`} />
                      <span>Mendukung ({item.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD NEW PEER-TO-PEER ENDORSEMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Validasi Ukhuwah & Amanah</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  Tulis Endorsement Rekan Jamaah
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Memberikan testimoni publik atas keahlian & integritas <strong>{selectedMember.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEndorsement} className="space-y-4 text-xs">
              {/* Target Skill Selector */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  Pilih Keahlian yang Di-endorse <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={targetSkillId}
                  onChange={(e) => setTargetSkillId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                >
                  {selectedMember.skillsAcquired.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.skillName} ({skill.category} • Lvl {skill.currentLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Nama Anda (Pemberi Endorsement) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Contoh: dr. H. Syamsul Huda"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Peran / Profesi Anda <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="Contoh: Takmir Masjid & Dokter Relawan"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Masjid Basis Anda <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorMasjid}
                    onChange={(e) => setAuthorMasjid(e.target.value)}
                    placeholder="Contoh: Masjid Jami' Al-Ikhlas"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Hubungan / Konteks Kerja Sama <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={relationshipContext}
                    onChange={(e) =>
                      setRelationshipContext(e.target.value as any)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Rekan Tim Medis">Rekan Tim Medis</option>
                    <option value="Pengurus DKM">Pengurus DKM</option>
                    <option value="Rekan Kerja Lapangan">Rekan Kerja Lapangan</option>
                    <option value="Mentor Pelatihan">Mentor Pelatihan</option>
                    <option value="Penerima Manfaat / Jamaah">Penerima Manfaat / Jamaah</option>
                    <option value="Ketua RW / RT">Ketua RW / RT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Kategori Validasi Utama (Trust Tag)
                  </label>
                  <select
                    value={trustTag}
                    onChange={(e) => setTrustTag(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Sangat Amanah & Profesional">Sangat Amanah & Profesional</option>
                    <option value="Keahlian Teruji Lapangan">Keahlian Teruji Lapangan</option>
                    <option value="Cepat Tanggap & Ikhlas">Cepat Tanggap & Ikhlas</option>
                    <option value="Solutif & Berpengalaman">Solutif & Berpengalaman</option>
                    <option value="Rekomendasi Utama DKM">Rekomendasi Utama DKM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    Tingkat Kepercayaan & Kepuasan (Rating)
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTrustRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= trustRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-amber-400 font-mono font-bold ml-1">
                      {trustRating}/5 Bintang
                    </span>
                  </div>
                </div>
              </div>

              {/* Endorsement Statement Text */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  Ulasan Endorsement & Kesaksian Pengabdian <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={endorsementText}
                  onChange={(e) => setEndorsementText(e.target.value)}
                  placeholder="Ceritakan pengalaman nyata saat bekerja sama, ketelitian teknis, adab kerja, atau dampak manfaat yang dirasakan masyarakat..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 leading-relaxed"
                ></textarea>
                <p className="text-[10px] text-slate-500 italic">
                  * Ulasan Anda akan diverifikasi dan dipublikasikan secara transparan untuk membangun ekosistem ukhuwah profesional.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Endorsement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
