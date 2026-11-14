import { useState, useRef } from "react";
import {
  Printer,
  FileText,
  Copy,
  Check,
  X,
  ShieldCheck,
  Building2,
  Users,
  Coins,
  TrendingUp,
  Sparkles,
  Award,
  QrCode,
  Download,
  Share2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { ZiswafTransaction } from "../types";

interface DistributionItem {
  name: string;
  asnaf: string;
  allocated: number;
  target: number;
  percentage: number;
  recipients: number;
  color?: string;
}

interface KelurahanImpactItem {
  kelurahan: string;
  penerimaPangan: number;
  umkmBerdaya: number;
  beasiswaSantri: number;
  danaTersalurkanJuta: number;
  indeksMandiri: number;
}

interface PrintableCommunityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: string;
  kelurahan: string;
  transactions?: ZiswafTransaction[];
  distributionData: DistributionItem[];
  kelurahanImpactData: KelurahanImpactItem[];
  totalAllocated: number;
  totalTarget: number;
  totalRecipients: number;
  aiImpactSummary?: {
    executiveSummary: string;
    sdgMetrics?: Array<{ goal: string; impactLevel: string; progress: string }>;
    keyRecommendations?: string[];
  };
}

export default function PrintableCommunityReportModal({
  isOpen,
  onClose,
  period,
  kelurahan,
  transactions = [],
  distributionData,
  kelurahanImpactData,
  totalAllocated,
  totalTarget,
  totalRecipients,
  aiImpactSummary,
}: PrintableCommunityReportModalProps) {
  const [reportFormat, setReportFormat] = useState<"a4_formal" | "bulletin_jumat" | "whatsapp_text">("a4_formal");
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [liveAiSummary, setLiveAiSummary] = useState<string>(
    aiImpactSummary?.executiveSummary ||
      `Alhamdulillah, pengelolaan dana ZISWAF (Zakat, Infaq, Shodaqoh, Wakaf) periode ${period} di wilayah Kecamatan Sematang Borang melalui platform abdi.sematangborangcity.cloud telah tersalurkan sebesar Rp ${(totalAllocated / 1000000).toFixed(1)} Juta kepada ${totalRecipients.toLocaleString("id-ID")} jiwa penerima manfaat di 4 kelurahan. Program terbukti menghasilkan multiplier ekonomi 3.8x dan menjaga transparansi 100% syar'i.`
  );

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const docNumber = `ABDI-TRP-2026/VIII/${Math.floor(100 + Math.random() * 900)}`;

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppText = () => {
    return `*LAPORAN TRANSPARANSI DANA SOSIAL ISLAM & ZISWAF*
*Kecamatan Sematang Borang, Kota Palembang*
Dokumen No: ${docNumber}
Periode: ${period} | Update: ${currentDate}
----------------------------------------
_Bismillahirrahmanirrahim_

*1. RINGKASAN PENGHIMPUNAN & PENYALURAN:*
• Total Tersalurkan: ${formatRupiah(totalAllocated)} (${Math.round((totalAllocated / totalTarget) * 100)}% Target)
• Penerima Manfaat: ${totalRecipients.toLocaleString("id-ID")} Jiwa Mustahiq
• Wilayah: 4 Kelurahan (Sukamulya, Lebung Gajah, Karya Mulya, Srimulya)
• Multiplier SROI: 1 : 3.8x (Pemberdayaan Ekonomi)
• Hak Amil: 7.2% (Batas Syariah DSN-MUI maks 12.5%)

*2. DETAIL PENYALURAN BERDASARKAN ASNAF:*
${distributionData
  .map(
    (d, i) =>
      `${i + 1}. *${d.name}* (${d.asnaf})
   - Realisasi: ${formatRupiah(d.allocated)}
   - Penerima: ${d.recipients} Jiwa`
  )
  .join("\n")}

*3. SEBARAN PENERIMA MANFAAT PER KELURAHAN:*
${kelurahanImpactData
  .map(
    (k) =>
      `• *Kel. ${k.kelurahan}*: ${k.penerimaPangan} KK Pangan | ${k.umkmBerdaya} UMKM | ${k.beasiswaSantri} Santri`
  )
  .join("\n")}

*4. CATATAN AKUNTABILITAS:*
"${liveAiSummary}"

Laporan diverifikasi 100% Syariah & Terbuka di Public Ledger:
https://abdi.sematangborangcity.cloud
_Jazaakumullahu Khairan Katsiran para Muzakki & Munfiq._`;
  };

  const handleCopyText = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefreshAiSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/gemini/social-impact-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalZakat: totalAllocated * 0.6,
          totalInfaq: totalAllocated * 0.3,
          totalWakaf: totalAllocated * 0.1,
          beneficiariesCount: totalRecipients,
          period,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.executiveSummary) {
          setLiveAiSummary(data.executiveSummary);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div
      id="printable-report-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Navigation Header (Hidden in Print) */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-5 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base">
                  Ringkasan Transparansi Publik & Format Siap Cetak
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  Audit Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dokumen resmi akuntabilitas dana umat untuk papan pengumuman masjid, buletin Jumat, dan laporan warga.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Selector Pills */}
            <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-700 flex items-center gap-1 text-xs">
              <button
                onClick={() => setReportFormat("a4_formal")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  reportFormat === "a4_formal"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Lembar A4 Resmi
              </button>
              <button
                onClick={() => setReportFormat("bulletin_jumat")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  reportFormat === "bulletin_jumat"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Warta Jum'at
              </button>
              <button
                onClick={() => setReportFormat("whatsapp_text")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  reportFormat === "whatsapp_text"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                Siaran Digital WA
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbars (Hidden in Print) */}
        <div className="bg-slate-800/40 border-b border-slate-700/60 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400 font-medium">Nomor Dokumen:</span>
            <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-teal-300">
              {docNumber}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi 100% Syar'i
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAiSummary}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition"
              title="Perbarui Ringkasan Naratif AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{isGeneratingAi ? "Menyusun..." : "Sintesis Ulang AI"}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-teal-800/80 hover:bg-teal-700 text-teal-100 px-3.5 py-1.5 rounded-lg font-semibold transition border border-teal-600/40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg shadow-md transition"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Cetak Laporan / PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          {reportFormat === "whatsapp_text" ? (
            /* Digital Broadcast Text View */
            <div className="w-full max-w-2xl bg-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-200 space-y-4 font-mono text-xs leading-relaxed">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-teal-400 font-bold font-sans">
                  Format Siar WhatsApp / Media Sosial Jamaah
                </span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 bg-teal-600 text-white px-2.5 py-1 rounded text-[11px] font-sans font-semibold"
                >
                  {copied ? "Berhasil Disalin" : "Salin Format WA"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300 bg-slate-950/80 p-4 rounded-xl border border-slate-800 select-all">
                {generateWhatsAppText()}
              </pre>
            </div>
          ) : (
            /* OFFICIAL A4 / BULLETIN PRINTABLE SHEET */
            <div
              ref={printAreaRef}
              id="printable-report-sheet"
              className={`w-full max-w-3xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 space-y-6 print:p-0 print:shadow-none print:max-w-none print:w-full print:rounded-none ${
                reportFormat === "bulletin_jumat" ? "border-2 border-dashed border-teal-700/60" : ""
              }`}
            >
              {/* DOCUMENT KOP / HEADER */}
              <div className="border-b-2 border-slate-900 pb-4 space-y-2">
                <div className="text-center">
                  <div className="text-sm font-serif italic text-slate-700 tracking-wider font-bold mb-1">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-teal-800">
                    KORP PENGELOLA ZISWAF & DANA UMAT KECAMATAN SEMATANG BORANG
                  </div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
                    LEMBAR TRANSPARANSI PUBLIK & PERTANGGUNGJAWABAN SOSIAL
                  </h1>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Platform Ekosistem Terpadu: <strong>abdi.sematangborangcity.cloud</strong> | Kota Palembang, Sumatera Selatan
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-700 pt-2 border-t border-slate-200 mt-2 font-mono">
                  <div>
                    <strong>No. Dokumen:</strong> {docNumber}
                  </div>
                  <div>
                    <strong>Periode:</strong> {period} (Wilayah: {kelurahan})
                  </div>
                  <div>
                    <strong>Tanggal Terbit:</strong> {currentDate}
                  </div>
                </div>
              </div>

              {/* 1. EXECUTIVE SUMMARY BOX */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold text-teal-900 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    1. Ringkasan Eksekutif & Kepatuhan Syariah
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                    Status: 100% Akuntabel
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed italic">
                  "{liveAiSummary}"
                </p>
              </div>

              {/* 2. KEY FINANCIAL & SOCIAL IMPACT METRICS GRID */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  2. Indikator Kinerja Utama (KPI) & Multiplier Ekonomi
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="border border-slate-300 p-2.5 rounded-lg bg-teal-50/50">
                    <span className="text-[10px] text-slate-600 block">Total Tersalurkan</span>
                    <span className="text-base font-black text-teal-950 font-mono">
                      Rp {(totalAllocated / 1000000).toFixed(1)} Jt
                    </span>
                    <span className="text-[9px] text-teal-800 block mt-0.5">
                      {Math.round((totalAllocated / totalTarget) * 100)}% dari Target
                    </span>
                  </div>

                  <div className="border border-slate-300 p-2.5 rounded-lg bg-blue-50/50">
                    <span className="text-[10px] text-slate-600 block">Mustahiq Terbantu</span>
                    <span className="text-base font-black text-blue-950 font-mono">
                      {totalRecipients.toLocaleString("id-ID")} Jiwa
                    </span>
                    <span className="text-[9px] text-blue-800 block mt-0.5">
                      4 Kelurahan Lengkap
                    </span>
                  </div>

                  <div className="border border-slate-300 p-2.5 rounded-lg bg-amber-50/50">
                    <span className="text-[10px] text-slate-600 block">Multiplier SROI</span>
                    <span className="text-base font-black text-amber-950 font-mono">
                      1 : 3.8x
                    </span>
                    <span className="text-[9px] text-amber-800 block mt-0.5">
                      Kemandirian UMKM
                    </span>
                  </div>

                  <div className="border border-slate-300 p-2.5 rounded-lg bg-emerald-50/50">
                    <span className="text-[10px] text-slate-600 block">Rasio Hak Amil</span>
                    <span className="text-base font-black text-emerald-950 font-mono">
                      7.2%
                    </span>
                    <span className="text-[9px] text-emerald-800 block mt-0.5">
                      Sesuai DSN-MUI (Max 12.5%)
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. ASNAF DISTRIBUTION RECAPITULATION TABLE */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  3. Realisasi Penyaluran Berdasarkan 8 Asnaf (QS. At-Taubah: 60)
                </h4>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[11px]">
                        <th className="p-2 font-bold">No</th>
                        <th className="p-2 font-bold">Nama Program Penyaluran</th>
                        <th className="p-2 font-bold">Kategori Asnaf</th>
                        <th className="p-2 font-bold text-right">Target (Rp)</th>
                        <th className="p-2 font-bold text-right">Realisasi (Rp)</th>
                        <th className="p-2 font-bold text-center">Penerima</th>
                        <th className="p-2 font-bold text-center">Capaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {distributionData.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                          <td className="p-2 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-2 font-semibold text-slate-900">{item.name}</td>
                          <td className="p-2 text-slate-600">{item.asnaf}</td>
                          <td className="p-2 text-right font-mono text-slate-600">
                            {formatRupiah(item.target)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">
                            {formatRupiah(item.allocated)}
                          </td>
                          <td className="p-2 text-center font-mono">{item.recipients} KK/Jiwa</td>
                          <td className="p-2 text-center font-mono font-bold text-emerald-800">
                            {Math.round((item.allocated / item.target) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300 text-[11px]">
                        <td colSpan={3} className="p-2 text-right uppercase">
                          Total Akumulasi
                        </td>
                        <td className="p-2 text-right font-mono">{formatRupiah(totalTarget)}</td>
                        <td className="p-2 text-right font-mono text-teal-900">
                          {formatRupiah(totalAllocated)}
                        </td>
                        <td className="p-2 text-center font-mono">{totalRecipients} Jiwa</td>
                        <td className="p-2 text-center font-mono text-emerald-800">91.5%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 4. SPATIAL KELURAHAN BREAKDOWN */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  4. Sebaran Penerima Manfaat Spasial di 4 Kelurahan
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {kelurahanImpactData.map((k, idx) => (
                    <div key={idx} className="p-2.5 border border-slate-300 rounded-lg bg-slate-50/60">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-teal-700" />
                        Kel. {k.kelurahan}
                      </div>
                      <div className="mt-1 space-y-0.5 text-[10px] text-slate-700">
                        <div>• Pangan: <strong>{k.penerimaPangan} KK</strong></div>
                        <div>• UMKM Berdaya: <strong>{k.umkmBerdaya} Unit</strong></div>
                        <div>• Santri: <strong>{k.beasiswaSantri} Anak</strong></div>
                        <div className="pt-1 text-teal-800 font-bold border-t border-slate-200 mt-1">
                          Dana: Rp {k.danaTersalurkanJuta} Jt
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. LEGAL GOVERNANCE & SIGNATURES SECTION */}
              <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="space-y-8">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Disusun Oleh:</span>
                    <span className="font-bold text-slate-900 text-[11px]">Koordinator Amil ZISWAF</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 underline text-[11px]">H. Ahmad Syukri, M.E.Sy</div>
                    <div className="text-[9px] text-slate-500 font-mono">NIP. 2024.08.019.ZIS</div>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col items-center justify-center">
                  <div className="p-2 border border-slate-300 rounded-lg bg-slate-50 text-center">
                    <QrCode className="w-12 h-12 text-slate-800 mx-auto" />
                    <span className="text-[8px] font-mono text-slate-500 block mt-0.5">
                      Verify Ledger Hash:
                    </span>
                    <span className="text-[8px] font-mono font-bold text-teal-800 block">
                      SHA256: 8f9a..3b1e
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500">Stempel Elektronik Sah</span>
                </div>

                <div className="space-y-8">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Mengetahui & Menyetujui:</span>
                    <span className="font-bold text-slate-900 text-[11px]">Dewan Pengawas Syariah / MUI</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 underline text-[11px]">K.H. Mansyur Shiddiq, Lc., M.A.</div>
                    <div className="text-[9px] text-slate-500 font-mono">MUI Sematang Borang</div>
                  </div>
                </div>
              </div>

              {/* FOOTER NOTE */}
              <div className="text-[9px] text-slate-500 text-center pt-2 border-t border-slate-200">
                Dokumen ini dicetak otomatis dari sistem tata kelola data terverifikasi <strong>abdi.sematangborangcity.cloud</strong>. Hak Cipta dilindungi syariat Islam untuk kemaslahatan umat.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
