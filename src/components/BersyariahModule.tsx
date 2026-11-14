import { useState } from "react";
import {
  Scale,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Send,
  Loader2,
  HelpCircle,
  RefreshCw,
  Copy,
  ChevronRight,
  BookOpen,
  ArrowRight,
  FileText,
} from "lucide-react";
import { ShariaAuditRecord, FiqhChatMessage } from "../types";
import { INITIAL_SHARIA_AUDITS } from "../data/mockData";

export default function BersyariahModule() {
  const [activeTab, setActiveTab] = useState<"fiqh_ai" | "audit_engine" | "smart_akad">("fiqh_ai");

  // Fiqh AI Chat State
  const [fiqhCategory, setFiqhCategory] = useState<string>("Umum");
  const [fiqhInput, setFiqhInput] = useState<string>("");
  const [isFiqhLoading, setIsFiqhLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<FiqhChatMessage[]>([
    {
      id: "msg-1",
      sender: "assistant",
      text: "Assalamu'alaikum Warahmatullahi Wabarakatuh. Saya Asisten Fiqh & Kepatuhan Syariah ABDI Islamicity 4B Kaffah. Ada yang dapat kami bantu terkait hukum ibadah, pembagian waris (faraidh), zakat, atau akad muamalah kontemporer?",
      timestamp: "09:00 WIB",
      category: "Umum",
      references: [
        { source: "Al-Qur'an & Sunnah Shahihah", note: "Rujukan hukum pokok" },
        { source: "Fatwa DSN-MUI", note: "Pedoman Fiqh Muamalah Kontemporer" },
      ],
      confidenceScore: 99,
    },
  ]);

  // Audit Engine Form State
  const [auditList, setAuditList] = useState<ShariaAuditRecord[]>(INITIAL_SHARIA_AUDITS);
  const [contractTitle, setContractTitle] = useState<string>("Akad Pembiayaan Usaha Kuliner Martabak Sukamulya");
  const [contractType, setContractType] = useState<"Mudharabah" | "Musyarakah" | "Murabahah" | "Ijarah" | "Wakalah" | "Qardhul Hasan">("Murabahah");
  const [applicantName, setApplicantName] = useState<string>("Ahmad Zaki (Kios Martabak Barokah)");
  const [contractValue, setContractValue] = useState<number>(15000000);
  const [flowDescription, setFlowDescription] = useState<string>(
    "Pihak BMT membeli bahan baku dan gerobak seharga Rp 12.000.000, lalu menjual kepada nasabah dengan harga Rp 15.000.000 diangsur 10 bulan (margin keuntungan Rp 3.000.000 disepakati diawal tanpa bunga berbunga)."
  );
  const [penaltyClause, setPenaltyClause] = useState<string>(
    "Denda keterlambatan jika ada dialokasikan 100% sebagai dana sosial/infaq mustahiq (Ta'zir non-riba)."
  );
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Smart Akad Form State
  const [akadPartyA, setAkadPartyA] = useState<string>("BMT Al-Amanah Sematang Borang (Shahibul Maal)");
  const [akadPartyB, setAkadPartyB] = useState<string>("Bapak Ridho Wahyudi (Mudharib / Pengelola)");
  const [akadProfitRatio, setAkadProfitRatio] = useState<string>("60% Pengelola : 40% Pemilik Modal");
  const [akadGeneratedDoc, setAkadGeneratedDoc] = useState<string>("");

  const quickQuestions = [
    "Hukum Paylater & Belanja Cicilan Online menurut DSN-MUI",
    "Cara hitung waris: 1 Istri, 1 Anak Laki-laki, 2 Anak Perempuan",
    "Apakah wajib zakat emas simpanan yang belum mencapai 1 tahun?",
    "Syarat sah akad dropship & reseller tanpa melanggar larangan menjual yang belum dimiliki",
    "Kapan denda keterlambatan pembayaran dianggap riba?",
  ];

  const handleSendFiqhQuestion = async (queryText?: string) => {
    const textToSend = queryText || fiqhInput;
    if (!textToSend.trim()) return;

    const userMsg: FiqhChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      category: fiqhCategory,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!queryText) setFiqhInput("");
    setIsFiqhLoading(true);

    try {
      const res = await fetch("/api/gemini/fiqh-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          category: fiqhCategory,
          conversationHistory: chatMessages.slice(-4),
        }),
      });
      const data = await res.json();

      const assistantMsg: FiqhChatMessage = {
        id: `ast-${Date.now()}`,
        sender: "assistant",
        text: data.answer || "Mohon maaf, terjadi kendala pemrosesan fatwa.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        category: data.category || fiqhCategory,
        references: data.references,
        confidenceScore: data.confidenceScore || 95,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFiqhLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/gemini/compliance-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractTitle,
          contractType,
          parties: { applicant: applicantName },
          terms: `Nilai: Rp ${contractValue}. Klausul Denda: ${penaltyClause}`,
          flowDescription,
          financialDetails: { amount: contractValue, type: contractType },
        }),
      });
      const data = await res.json();
      setAuditResult(data);

      // Add to local audit list if successful
      const newRecord: ShariaAuditRecord = {
        id: `SA-${Date.now().toString().slice(-4)}`,
        contractTitle,
        contractType,
        applicantName,
        businessSector: "Pemberdayaan UMKM",
        contractValue,
        complianceScore: data.complianceScore || 90,
        status: data.status || "COMPLIANT",
        auditedDate: "Hari Ini (Real-Time)",
        prohibitedElements: {
          riba: data.prohibitedElementsCheck?.riba?.detected || false,
          gharar: data.prohibitedElementsCheck?.gharar?.detected || false,
          maysir: data.prohibitedElementsCheck?.maysir?.detected || false,
          tadlis: data.prohibitedElementsCheck?.tadlis?.detected || false,
          ikrah: data.prohibitedElementsCheck?.ikrah?.detected || false,
          risywah: data.prohibitedElementsCheck?.risywah?.detected || false,
        },
        notes: data.recommendations || ["Akad memenuhi kaidah fiqh syariah."],
        fatwaReference: data.dsnMuiFatwaReferences?.[0] || "Fatwa DSN-MUI Terkait",
      };

      setAuditList((prev) => [newRecord, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateAkad = () => {
    const doc = `=====================================================
DRAF AKAD SYARIAH ELEKTRONIK (ISLAMICITY 4B KAFFAH)
Nomor Registrasi: AKAD-SB/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}
=====================================================

BISMILLAHIRRAHMANIRRAHIM

Pada hari ini, disepakati Akad ${contractType.toUpperCase()} antara:

1. PIHAK PERTAMA (Shahibul Maal / Lembaga):
   Nama: ${akadPartyA}
   Alamat: Kompleks Masjid Jami' Sematang Borang, Palembang

2. PIHAK KEDUA (Mudharib / Nasabah):
   Nama: ${akadPartyB}
   Alamat: Kelurahan Sukamulya / Sematang Borang

KETENTUAN POKOK AKAD:
- Jenis Akad: ${contractType}
- Nilai Pokok Pembiayaan: Rp ${contractValue.toLocaleString("id-ID")}
- Nisbah Bagi Hasil / Margin: ${akadProfitRatio}
- Sifat Akad: Bebas Riba, Bebas Gharar, Bebas Maysir, dan Berasaskan Tabarru' & Tijarah yang Halal.
- Klausul Denda Keterlambatan: 100% Disalurkan ke Kas ZISWAF Dhuafa Masjid Sematang Borang (Ta'widh/Ta'zir Syar'i).
- Rujukan Fatwa: Dewan Syariah Nasional Majelis Ulama Indonesia (DSN-MUI).

Divalidasi secara digital oleh Engine Kepatuhan Syariah abdi.sematangborangcity.cloud.`;

    setAkadGeneratedDoc(doc);
  };

  return (
    <div id="bersyariah-module" className="space-y-6">
      {/* Pillar Header Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-blue-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-500/40 text-blue-300 text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>PILAR 2 : BERSYARIAH (Smart Compliance & Legal Governance)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              AI Fiqh Assistant & Audit Kepatuhan Syariah
            </h2>
            <p className="text-sm text-blue-200/90 max-w-2xl mt-1">
              Validasi kepatuhan akad muamalah otomatis (Data Validation Engine) dan konsultasi hukum Islam berbasis dalil shahih Al-Qur'an, Hadits, serta Fatwa DSN-MUI.
            </p>
          </div>

          {/* Sub-Navigation Buttons */}
          <div className="flex flex-wrap gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-blue-800/60">
            <button
              id="subtab-fiqh-ai"
              onClick={() => setActiveTab("fiqh_ai")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "fiqh_ai"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-300 hover:text-white hover:bg-blue-900/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Virtual Fiqh Assistant
            </button>
            <button
              id="subtab-audit-engine"
              onClick={() => setActiveTab("audit_engine")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "audit_engine"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-300 hover:text-white hover:bg-blue-900/60"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Automated Sharia Audit
            </button>
            <button
              id="subtab-smart-akad"
              onClick={() => setActiveTab("smart_akad")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "smart_akad"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-300 hover:text-white hover:bg-blue-900/60"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Smart Akad Digital
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: VIRTUAL FIQH ASSISTANT */}
      {activeTab === "fiqh_ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Prompt Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Pilih Topik Konsultasi
              </h4>
              <div className="space-y-1">
                {["Umum", "Faraidh & Waris", "Muamalah & Bisnis", "Zakat & Pajak", "Thaharah & Shalat", "Keluarga & Nikah"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiqhCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                      fiqhCategory === cat
                        ? "bg-blue-50 text-blue-800 font-bold border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Pertanyaan Populer
              </h4>
              <div className="space-y-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendFiqhQuestion(q)}
                    className="w-full text-left p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] text-slate-700 leading-snug transition flex items-start justify-between gap-1 group"
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[640px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    Asisten Fiqh Syariah ABDI
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      Gemini 3.7 AI Model
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kategori Aktif: <span className="font-semibold text-blue-700">{fiqhCategory}</span> • Rujukan: DSN-MUI & Jumhur 4 Mazhab
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatMessages([chatMessages[0]])}
                className="text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200 transition flex items-center gap-1"
                title="Reset Percakapan"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* Chat Stream Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs shadow-sm ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 border-b pb-1">
                      <span className="font-bold">
                        {msg.sender === "user" ? "Jamaah Sematang Borang" : "Virtual Fiqh Assistant"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>

                    {/* Citations & Sanad References for Assistant */}
                    {msg.sender === "assistant" && msg.references && msg.references.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2 space-y-1 text-[11px]">
                        <div className="font-bold text-slate-700 flex items-center justify-between">
                          <span>Rujukan Dalil & Fatwa:</span>
                          {msg.confidenceScore && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                              Keyakinan: {msg.confidenceScore}%
                            </span>
                          )}
                        </div>
                        {msg.references.map((ref, rIdx) => (
                          <div key={rIdx} className="text-slate-600 flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span><strong>{ref.source}</strong> ({ref.note})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isFiqhLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2 text-xs text-blue-700">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Mengkaji rujukan Fiqh & Fatwa DSN-MUI...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendFiqhQuestion();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Tanyakan masalah fiqh, hukum transaksi online, faraidh waris, atau zakat..."
                  value={fiqhInput}
                  onChange={(e) => setFiqhInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isFiqhLoading || !fiqhInput.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED SHARIA COMPLIANCE AUDIT */}
      {activeTab === "audit_engine" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Audit Input Form */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Formulir Audit Akad Syariah
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Akad / Transaksi
                </label>
                <input
                  type="text"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Akad Fiqh
                  </label>
                  <select
                    value={contractType}
                    onChange={(e: any) => setContractType(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option>Murabahah</option>
                    <option>Mudharabah</option>
                    <option>Musyarakah</option>
                    <option>Ijarah</option>
                    <option>Wakalah</option>
                    <option>Qardhul Hasan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nilai Akad (Rp)
                  </label>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pemohon / Pelaku Usaha
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Alur Transaksi & Keuntungan
                </label>
                <textarea
                  rows={3}
                  value={flowDescription}
                  onChange={(e) => setFlowDescription(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Klausul Denda / Wanprestasi
                </label>
                <input
                  type="text"
                  value={penaltyClause}
                  onChange={(e) => setPenaltyClause(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                id="btn-run-sharia-audit"
                disabled={isAuditing}
                onClick={handleRunAudit}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menjalankan Engine Validasi Syariah...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Jalankan Audit Kepatuhan Syariah AI
                  </>
                )}
              </button>
            </div>

            {/* Audit Output & 6-Prohibited Elements Scanner */}
            <div className="lg:col-span-2 space-y-5">
              {auditResult ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                    <div>
                      <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded">
                        Hasil Telaah Kepatuhan Syariah
                      </span>
                      <h3 className="font-bold text-slate-900 text-lg mt-1">
                        {contractTitle}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-600 font-mono">
                        {auditResult.complianceScore || 92}/100
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {auditResult.status || "COMPLIANT"}
                      </span>
                    </div>
                  </div>

                  {/* 6 Prohibited Elements Grid */}
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                      Pemeriksaan 6 Unsur Terlarang (Mani' Syar'i)
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { key: "riba", label: "1. Riba (Bunga)", item: auditResult.prohibitedElementsCheck?.riba },
                        { key: "gharar", label: "2. Gharar (Ketidakjelasan)", item: auditResult.prohibitedElementsCheck?.gharar },
                        { key: "maysir", label: "3. Maysir (Judi/Spekulasi)", item: auditResult.prohibitedElementsCheck?.maysir },
                        { key: "tadlis", label: "4. Tadlis (Penipuan)", item: auditResult.prohibitedElementsCheck?.tadlis },
                        { key: "ikrah", label: "5. Ikrah (Paksaan)", item: auditResult.prohibitedElementsCheck?.ikrah },
                        { key: "risywah", label: "6. Risywah (Suap)", item: auditResult.prohibitedElementsCheck?.risywah },
                      ].map((elem) => {
                        const isDetected = elem.item?.detected;
                        return (
                          <div
                            key={elem.key}
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              isDetected
                                ? "bg-red-50 border-red-200 text-red-900"
                                : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{elem.label}</span>
                              {isDetected ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                            <p className="text-[11px] opacity-85 leading-snug">
                              {elem.item?.note || (isDetected ? "Terdeteksi indikasi pelanggaran" : "Bebas dari unsur ini")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {auditResult.recommendations && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Rekomendasi Dewan Pengawas Syariah / Engine AI
                      </h5>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        {auditResult.recommendations.map((rec: string, rIdx: number) => (
                          <li key={rIdx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fatwa DSN-MUI Reference */}
                  {auditResult.dsnMuiFatwaReferences && (
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                      <strong className="block font-bold">Rujukan Fatwa DSN-MUI:</strong>
                      {auditResult.dsnMuiFatwaReferences.map((fatwa: string, fIdx: number) => (
                        <div key={fIdx}>• {fatwa}</div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-2 py-12">
                  <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">
                    Engine Validasi Syariah Siap Memeriksa
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Masukkan rincian draf perjanjian pembiayaan atau transaksi bisnis di panel kiri untuk mendeteksi potensi riba, gharar, maysir secara real-time.
                  </p>
                </div>
              )}

              {/* Historical Audit Logs */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Riwayat Audit Akad Syariah di Sematang Borang
                </h4>
                <div className="space-y-2">
                  {auditList.map((audit) => (
                    <div
                      key={audit.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{audit.contractTitle}</span>
                          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.2 rounded text-[10px]">
                            {audit.contractType}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {audit.applicantName} • Rp {audit.contractValue.toLocaleString("id-ID")} • {audit.auditedDate}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-emerald-700 font-mono text-sm">
                            {audit.complianceScore}%
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {audit.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMART AKAD DIGITAL CREATOR */}
      {activeTab === "smart_akad" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Smart Akad Generator & Contract Validator
              </h3>
              <p className="text-xs text-slate-600">
                Buat draf akad digital terstandarisasi syariah (Mudharabah, Murabahah, Ijarah, Wakalah) dengan klausul tervalidasi DSN-MUI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pihak Pertama (Shahibul Maal / Lembaga Keuangan / Masjid)
                </label>
                <input
                  type="text"
                  value={akadPartyA}
                  onChange={(e) => setAkadPartyA(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pihak Kedua (Mudharib / Pengusaha / Nasabah)
                </label>
                <input
                  type="text"
                  value={akadPartyB}
                  onChange={(e) => setAkadPartyB(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Akad
                  </label>
                  <select
                    value={contractType}
                    onChange={(e: any) => setContractType(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option>Mudharabah</option>
                    <option>Murabahah</option>
                    <option>Musyarakah</option>
                    <option>Ijarah</option>
                    <option>Wakalah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nisbah / Margin
                  </label>
                  <input
                    type="text"
                    value={akadProfitRatio}
                    onChange={(e) => setAkadProfitRatio(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateAkad}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md"
              >
                <FileText className="w-4 h-4" />
                Generate Draf Akad Syariah Digital
              </button>
            </div>

            {/* Generated Document Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Pratinjau Draf Kontrak
                </h4>
                {akadGeneratedDoc && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(akadGeneratedDoc);
                      alert("Draf akad berhasil disalin!");
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Salin Teks Akad
                  </button>
                )}
              </div>

              <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl h-[340px] overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                {akadGeneratedDoc || "Klik tombol 'Generate Draf Akad Syariah Digital' untuk memuat pratinjau klausul kontrak."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
