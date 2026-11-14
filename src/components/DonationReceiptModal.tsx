import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  DonationReceiptData,
  amountToIndonesianWords,
  downloadDonationReceiptPdf,
  formatReceiptTimestamp,
  generateReceiptQrDataUrl,
} from "../utils/donationReceiptPdf";

interface DonationReceiptModalProps {
  receipt: DonationReceiptData | null;
  onClose: () => void;
}

export default function DonationReceiptModal({
  receipt,
  onClose,
}: DonationReceiptModalProps) {
  const [verifyQrUrl, setVerifyQrUrl] = useState<string>("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (!receipt) {
      setVerifyQrUrl("");
      return;
    }

    generateReceiptQrDataUrl(receipt)
      .then((url) => {
        if (active) setVerifyQrUrl(url);
      })
      .catch(() => {
        if (active) setVerifyQrUrl("");
      });

    return () => {
      active = false;
    };
  }, [receipt]);

  if (!receipt) return null;

  const formattedDate = formatReceiptTimestamp(receipt.timestamp);
  const donorDisplay = receipt.isAnonymous
    ? "Hamba Allah (Anonim)"
    : receipt.donorName || "Hamba Allah";
  const terbilang = amountToIndonesianWords(receipt.amount);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadDonationReceiptPdf(receipt);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2500);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="printable-report-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Action Toolbar (Hidden during Print) */}
        <div className="bg-slate-800/95 border-b border-slate-700 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pratinjau &amp; Cetak e-Kwitansi Resmi
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Ref: {receipt.receiptNumber}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-60"
            >
              {pdfSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>
                {isDownloadingPdf
                  ? "Menyiapkan PDF..."
                  : pdfSuccess
                  ? "PDF Terunduh"
                  : "Unduh PDF"}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kwitansi</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau kwitansi"
              className="p-2 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Paper Receipt Sheet */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-200/80 print:p-0 print:bg-white">
          <div
            id="printable-report-sheet"
            className="bg-white text-slate-900 rounded-2xl border-2 border-emerald-800 p-5 sm:p-7 shadow-lg space-y-5 print:rounded-none print:border print:shadow-none"
          >
            {/* Institutional Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-emerald-800 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  e-Kwitansi Resmi • Audit Kas Terbuka
                </span>
                <h2 className="text-lg sm:text-xl font-black text-emerald-950 leading-tight">
                  BUKTI PENERIMAAN INFAQ &amp; ZISWAF DIGITAL
                </h2>
                <p className="text-xs text-slate-600 font-semibold">
                  {receipt.recipientName}
                </p>
                {(receipt.dkmRegistrationId || receipt.recipientAddress) && (
                  <p className="text-[11px] text-slate-500">
                    {[
                      receipt.dkmRegistrationId
                        ? `Reg: ${receipt.dkmRegistrationId}`
                        : "",
                      receipt.recipientAddress || "",
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                )}
              </div>

              <div className="border-2 border-emerald-600 bg-emerald-50 rounded-xl px-4 py-2 text-center shrink-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                  Status Pembayaran
                </div>
                <div className="text-sm font-black text-emerald-900 tracking-wide">
                  SAH &amp; TERVERIFIKASI
                </div>
                <div className="text-[10px] font-mono text-slate-600">
                  {receipt.paymentChannel}
                </div>
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Nomor Kwitansi / Referensi
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {receipt.receiptNumber}
                </span>
                {receipt.bankReference &&
                  receipt.bankReference !== receipt.receiptNumber && (
                    <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                      Host Ref: {receipt.bankReference}
                    </span>
                  )}
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Tanggal &amp; Waktu Verifikasi
                </span>
                <span className="font-semibold text-slate-900">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Structured Details Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-600 w-2/5">
                      Nama Munfiq / Donatur
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">
                      {donorDisplay}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-600">
                      Jenis Akad &amp; Kategori
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-emerald-900">
                      {receipt.categoryLabel}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-600">
                      Alokasi Program Khusus
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-800">
                      {receipt.purpose}
                    </td>
                  </tr>
                  {receipt.bankAccountInfo && (
                    <tr>
                      <td className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-600">
                        Rekening Resmi Masjid
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-700">
                        {receipt.bankAccountInfo}
                      </td>
                    </tr>
                  )}
                  {(receipt.donorPhone || receipt.donorEmail) && (
                    <tr>
                      <td className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-600">
                        Kontak Munfiq
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-700">
                        {[receipt.donorPhone, receipt.donorEmail]
                          .filter(Boolean)
                          .join(" • ")}
                      </td>
                    </tr>
                  )}
                  {typeof receipt.baseAmount === "number" &&
                    typeof receipt.uniqueCode === "number" &&
                    receipt.uniqueCode > 0 && (
                      <tr>
                        <td className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-600">
                          Rincian Nominal
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-slate-700">
                          Pokok Rp {receipt.baseAmount.toLocaleString("id-ID")} + Kode Unik +{receipt.uniqueCode}
                        </td>
                      </tr>
                    )}
                  {receipt.notes && (
                    <tr>
                      <td className="bg-slate-50 px-3.5 py-2.5 font-bold text-slate-600">
                        Doa / Catatan
                      </td>
                      <td className="px-3.5 py-2.5 italic text-slate-700">
                        &ldquo;{receipt.notes}&rdquo;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Box + Terbilang */}
            <div className="bg-emerald-50 border-2 border-emerald-600 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Total Dana Infaq / ZISWAF Diterima
                </span>
                <span className="text-xs italic text-slate-700 block">
                  Terbilang: <strong>{terbilang}</strong>
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-950 shrink-0">
                Rp {receipt.amount.toLocaleString("id-ID")}
              </div>
            </div>

            {/* Verification QR + Digital Stamp */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center border border-slate-200 rounded-xl p-4">
              <div className="sm:col-span-7 flex items-center gap-3.5">
                {verifyQrUrl && (
                  <img
                    src={verifyQrUrl}
                    alt="QR Verifikasi Kwitansi"
                    className="w-20 h-20 object-contain border border-emerald-200 rounded-lg p-1 bg-white shrink-0"
                  />
                )}
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-900">
                    Verifikasi Transparansi Digital
                  </div>
                  <p className="leading-relaxed">
                    Pindai QR Code untuk memvalidasi keaslian e-Kwitansi di buku kas publik ABDI Sematang Borang.
                  </p>
                  <div className="font-mono text-[10px] text-emerald-700 font-bold">
                    Audit ID: {receipt.receiptNumber}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-5 border border-dashed border-emerald-500 rounded-xl p-3 text-center space-y-1 bg-emerald-50/40">
                <div className="text-[10px] text-slate-500">
                  Sematang Borang, Palembang
                </div>
                <div className="text-xs font-black text-emerald-800 tracking-wide py-1">
                  STEMPEL DIGITAL SAH
                </div>
                <div className="text-[10px] font-bold text-slate-800 border-t border-emerald-200 pt-1">
                  Bendahara DKM / Amil ZISWAF
                </div>
              </div>
            </div>

            {/* Prophetic Doa Footer */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center space-y-1">
              {receipt.doaArabic && (
                <p className="font-serif text-base text-emerald-900 font-semibold">
                  {receipt.doaArabic}
                </p>
              )}
              <p className="text-[11px] italic text-slate-700 leading-relaxed">
                {receipt.doaTranslation ||
                  '"Ajarakallahu fima a\'thaita, wa baraka laka fima abqaita, wa ja\'alahu laka thahuran." — Semoga Allah memberi pahala atas apa yang engkau tunaikan, memberkahi harta yang engkau sisakan, dan menjadikannya pembersih hartamu.'}
              </p>
              <p className="text-[9.5px] text-slate-400 pt-1">
                Diterbitkan otomatis oleh ABDI Islamicity 4B Cloud (abdi.sematangborangcity.cloud) • Sah tanpa tanda tangan basah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
