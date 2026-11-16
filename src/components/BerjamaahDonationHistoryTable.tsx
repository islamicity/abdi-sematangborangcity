import { useMemo, useState } from "react";
import {
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Filter,
  Heart,
  History,
  Printer,
  QrCode,
  Search,
  Trash2,
} from "lucide-react";
import { BerjamaahDonationHistoryEntry } from "../types";
import { useToast } from "../contexts/ToastContext";
import DonationReceiptModal from "./DonationReceiptModal";
import {
  DonationReceiptData,
  downloadDonationReceiptPdf,
} from "../utils/donationReceiptPdf";
import { SEMATANG_BORANG_MOSQUES } from "./MosqueDonationQrGenerator";

interface BerjamaahDonationHistoryTableProps {
  history: BerjamaahDonationHistoryEntry[];
  onDeleteEntry: (id: string) => void;
  onNavigateToQrDonation?: () => void;
  onNavigateToSadaqah?: () => void;
}

const formatRupiah = (value: number) =>
  `Rp ${Math.round(value).toLocaleString("id-ID")}`;

export default function BerjamaahDonationHistoryTable({
  history,
  onDeleteEntry,
  onNavigateToQrDonation,
  onNavigateToSadaqah,
}: BerjamaahDonationHistoryTableProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [printableReceipt, setPrintableReceipt] =
    useState<DonationReceiptData | null>(null);

  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(
        history.map((h) => {
          const yr = new Date(h.date).getFullYear();
          return Number.isNaN(yr) ? new Date().getFullYear() : yr;
        })
      )
    ).sort((a, b) => b - a);
    return years;
  }, [history]);

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return history.filter((item) => {
      const itemYear = new Date(item.date).getFullYear();
      const matchesYear =
        selectedYearFilter === "ALL" ||
        String(itemYear) === selectedYearFilter;
      const matchesSource =
        sourceFilter === "ALL" || item.sourceType === sourceFilter;
      const matchesQuery =
        !q ||
        item.referenceId.toLowerCase().includes(q) ||
        item.donorName.toLowerCase().includes(q) ||
        item.recipientMasjidOrProject.toLowerCase().includes(q) ||
        item.purposeOrCategory.toLowerCase().includes(q) ||
        item.paymentChannel.toLowerCase().includes(q);
      return matchesYear && matchesSource && matchesQuery;
    });
  }, [history, searchQuery, sourceFilter, selectedYearFilter]);

  const summary = useMemo(() => {
    const totalAmount = filteredHistory.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const qrMasjidCount = filteredHistory.filter(
      (item) => item.sourceType === "QR_INFAQ_MASJID"
    ).length;
    const sadaqahCount = filteredHistory.filter(
      (item) => item.sourceType === "SEDEKAH_TRACKER"
    ).length;
    const latestEntry = filteredHistory[0] || null;
    const averageAmount =
      filteredHistory.length > 0 ? totalAmount / filteredHistory.length : 0;

    return {
      count: filteredHistory.length,
      totalAmount,
      qrMasjidCount,
      sadaqahCount,
      latestEntry,
      averageAmount,
    };
  }, [filteredHistory]);

  const buildReceiptFromEntry = (
    entry: BerjamaahDonationHistoryEntry
  ): DonationReceiptData => {
    const matchedMosque = SEMATANG_BORANG_MOSQUES.find(
      (m) =>
        m.id === entry.mosqueId ||
        m.name.toLowerCase() === entry.recipientMasjidOrProject.toLowerCase()
    );

    return {
      receiptNumber: entry.referenceId,
      bankReference: `${entry.referenceId}-${(entry.mosqueId || "SB").toUpperCase()}`,
      donorName: entry.donorName,
      isAnonymous: entry.isAnonymous,
      recipientName: entry.recipientMasjidOrProject,
      recipientAddress: matchedMosque
        ? `${matchedMosque.address}, Kel. ${matchedMosque.kelurahan}`
        : "Kecamatan Sematang Borang, Kota Palembang",
      dkmRegistrationId:
        matchedMosque?.dkmRegistrationId || "DKM-SB-TERVERIFIKASI",
      bankAccountInfo: matchedMosque
        ? `${matchedMosque.bankName} • ${matchedMosque.accountNumber}`
        : undefined,
      categoryLabel:
        entry.sourceType === "QR_INFAQ_MASJID"
          ? "Infaq Digital Masjid (QRIS)"
          : "Sedekah Berjamaah (Sadaqah Impact Tracker)",
      purpose: entry.purposeOrCategory,
      paymentChannel: entry.paymentChannel,
      amount: entry.amount,
      timestamp: entry.date,
      notes:
        entry.notes ||
        "Semoga Allah menerima amal jariyah serta memberkahi harta yang tersisa.",
    };
  };

  const handleCopyRef = (referenceId: string) => {
    navigator.clipboard.writeText(referenceId);
    setCopiedRefId(referenceId);
    showToast({
      type: "info",
      badge: "REFERENSI DISALIN",
      title: "Reference ID Disalin",
      message: `${referenceId} berhasil disalin ke clipboard.`,
    });
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const handleDownloadPdf = async (entry: BerjamaahDonationHistoryEntry) => {
    setDownloadingId(entry.id);
    try {
      const receiptData = buildReceiptFromEntry(entry);
      await downloadDonationReceiptPdf(receiptData);
      showToast({
        type: "success",
        badge: "KWITANSI PDF",
        title: "Kwitansi Donasi Diunduh",
        message: `e-Kwitansi PDF untuk Ref ${entry.referenceId} berhasil diunduh.`,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportCsv = () => {
    if (filteredHistory.length === 0) return;

    const headers = [
      "ID Internal",
      "Reference ID",
      "Tanggal & Waktu",
      "Nama Donatur",
      "Kanal Sumber",
      "Masjid / Program Tujuan",
      "Alokasi / Kategori",
      "Metode Pembayaran",
      "Nominal (Rp)",
      "Status",
    ];

    const rows = filteredHistory.map((row) => [
      row.id,
      row.referenceId,
      new Date(row.date).toLocaleString("id-ID"),
      `"${(row.isAnonymous ? "Hamba Allah" : row.donorName).replace(/"/g, '""')}"`,
      row.sourceType === "QR_INFAQ_MASJID"
        ? "QR Infaq Masjid"
        : "Sedekah Tracker",
      `"${row.recipientMasjidOrProject.replace(/"/g, '""')}"`,
      `"${row.purposeOrCategory.replace(/"/g, '""')}"`,
      `"${row.paymentChannel.replace(/"/g, '""')}"`,
      String(row.amount),
      row.status,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Riwayat-Transaksi-Donasi-Berjamaah-${selectedYearFilter}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      badge: "EKSPOR CSV",
      title: "Riwayat Transaksi Donasi Diunduh",
      message: `${filteredHistory.length} transaksi donasi berhasil diekspor ke CSV.`,
    });
  };

  return (
    <div
      id="berjamaah-donation-history-table-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Riwayat Transaksi Donasi Berjamaah (Transaction History Log)
              </h4>
              <p className="text-xs text-slate-500">
                Rekam jejak transparan seluruh donasi sukses dari QR Infaq Masjid &amp; Sedekah Berjamaah lengkap dengan tanggal, nominal, dan Reference ID.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Cari transaksi donasi"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Ref ID / donatur / masjid..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 w-52"
            />
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="Filter kanal donasi"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Kanal ({history.length})</option>
              <option value="QR_INFAQ_MASJID">QR Infaq Masjid</option>
              <option value="SEDEKAH_TRACKER">Sedekah Berjamaah</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="Filter tahun transaksi donasi"
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredHistory.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 disabled:opacity-45"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Transaksi Sukses
          </span>
          <div className="text-lg font-black font-mono text-slate-900">
            {summary.count} Transaksi
          </div>
          <span className="text-[11px] text-slate-500 block">
            {summary.qrMasjidCount} QR Infaq Masjid • {summary.sadaqahCount} Sedekah Rutin
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Total Donasi Terverifikasi
          </span>
          <div className="text-lg font-black font-mono text-emerald-700">
            {formatRupiah(summary.totalAmount)}
          </div>
          <span className="text-[11px] text-emerald-700 block">
            Rata-rata {formatRupiah(summary.averageAmount)} per transaksi
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Transaksi Terbaru Tercatat
          </span>
          {summary.latestEntry ? (
            <>
              <div className="text-lg font-black font-mono text-amber-800">
                {formatRupiah(summary.latestEntry.amount)}
              </div>
              <span className="text-[11px] text-amber-800 font-mono block truncate">
                Ref: {summary.latestEntry.referenceId}
              </span>
            </>
          ) : (
            <>
              <div className="text-lg font-black font-mono text-amber-700">
                -
              </div>
              <span className="text-[11px] text-amber-800 block">
                Belum ada transaksi cocok
              </span>
            </>
          )}
        </div>
      </div>

      {/* Transaction History Table */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center space-y-3">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-bold text-slate-700">
            Belum ada catatan transaksi donasi pada filter ini
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Setiap infaq masjid via QRIS atau sedekah pada Sadaqah Impact Tracker akan tercatat otomatis di sini beserta tanggal, nominal, dan Reference ID.
          </p>
          {(onNavigateToQrDonation || onNavigateToSadaqah) && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {onNavigateToQrDonation && (
                <button
                  type="button"
                  onClick={onNavigateToQrDonation}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Buat Donasi QR Masjid</span>
                </button>
              )}
              {onNavigateToSadaqah && (
                <button
                  type="button"
                  onClick={onNavigateToSadaqah}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold inline-flex items-center gap-1.5 transition"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tunaikan Sedekah Rutin</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-bold whitespace-nowrap">
                  Tanggal &amp; Waktu
                </th>
                <th className="p-3 font-bold whitespace-nowrap">
                  Reference ID
                </th>
                <th className="p-3 font-bold whitespace-nowrap">
                  Donatur / Munfiq
                </th>
                <th className="p-3 font-bold whitespace-nowrap">
                  Masjid / Program Tujuan
                </th>
                <th className="p-3 font-bold whitespace-nowrap">
                  Kanal &amp; Status
                </th>
                <th className="p-3 font-bold text-right whitespace-nowrap">
                  Nominal (Rp)
                </th>
                <th className="p-3 font-bold text-right whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((entry) => {
                const parsedDate = new Date(entry.date);
                const formattedDate = Number.isNaN(parsedDate.getTime())
                  ? entry.date
                  : parsedDate.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                const formattedTime = Number.isNaN(parsedDate.getTime())
                  ? ""
                  : parsedDate.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 transition align-top"
                  >
                    {/* Date & Time */}
                    <td className="p-3 whitespace-nowrap space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {formattedDate}
                      </div>
                      {formattedTime && (
                        <div className="text-[11px] font-mono text-slate-500">
                          {formattedTime} WIB
                        </div>
                      )}
                    </td>

                    {/* Reference ID */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-800">
                        <span>{entry.referenceId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyRef(entry.referenceId)}
                          title="Salin Reference ID"
                          aria-label={`Salin Reference ID ${entry.referenceId}`}
                          className="text-slate-400 hover:text-emerald-700 transition"
                        >
                          {copiedRefId === entry.referenceId ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Donor Name */}
                    <td className="p-3 space-y-1">
                      <div className="font-semibold text-slate-900">
                        {entry.isAnonymous ? "Hamba Allah" : entry.donorName}
                      </div>
                      {entry.isAnonymous && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                          Anonim
                        </span>
                      )}
                      {entry.notes && (
                        <div className="text-[11px] text-slate-500 italic max-w-[190px] truncate" title={entry.notes}>
                          &ldquo;{entry.notes}&rdquo;
                        </div>
                      )}
                    </td>

                    {/* Recipient Mosque / Project */}
                    <td className="p-3 space-y-0.5 max-w-[240px]">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate" title={entry.recipientMasjidOrProject}>
                          {entry.recipientMasjidOrProject}
                        </span>
                      </div>
                      <div
                        className="text-[11px] text-slate-600 truncate"
                        title={entry.purposeOrCategory}
                      >
                        {entry.purposeOrCategory}
                      </div>
                    </td>

                    {/* Source & Status */}
                    <td className="p-3 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-1.5">
                        {entry.sourceType === "QR_INFAQ_MASJID" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                            <QrCode className="w-3 h-3" />
                            <span>QR Infaq Masjid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                            <Heart className="w-3 h-3" />
                            <span>Sedekah Tracker</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Terverifikasi</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {entry.paymentChannel}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="font-mono font-black text-sm text-emerald-700">
                        {formatRupiah(entry.amount)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(entry)}
                          disabled={downloadingId === entry.id}
                          title="Unduh e-Kwitansi PDF resmi"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition inline-flex items-center gap-1 disabled:opacity-60"
                        >
                          <FileText className="w-3 h-3" />
                          <span>
                            {downloadingId === entry.id ? "..." : "PDF"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setPrintableReceipt(buildReceiptFromEntry(entry))
                          }
                          title="Pratinjau & cetak e-Kwitansi"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Cetak</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          title="Hapus catatan transaksi"
                          aria-label={`Hapus transaksi ${entry.referenceId}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Printable & PDF e-Kwitansi Preview Modal */}
      <DonationReceiptModal
        receipt={printableReceipt}
        onClose={() => setPrintableReceipt(null)}
      />
    </div>
  );
}
