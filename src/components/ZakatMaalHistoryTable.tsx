import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  History,
  QrCode,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ZakatMaalHistoryEntry } from "../types";
import { useToast } from "../contexts/ToastContext";

interface ZakatMaalHistoryTableProps {
  history: ZakatMaalHistoryEntry[];
  onTogglePaidStatus: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onLoadIntoCalculator?: (entry: ZakatMaalHistoryEntry) => void;
  onPayViaQr?: (entry: ZakatMaalHistoryEntry) => void;
}

const formatRupiah = (value: number) =>
  `Rp ${Math.round(value).toLocaleString("id-ID")}`;

export default function ZakatMaalHistoryTable({
  history,
  onTogglePaidStatus,
  onDeleteEntry,
  onLoadIntoCalculator,
  onPayViaQr,
}: ZakatMaalHistoryTableProps) {
  const { showToast } = useToast();
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(history.map((h) => h.gregorianYear))).sort(
      (a, b) => b - a
    );
    return years;
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesYear =
        selectedYearFilter === "ALL" ||
        String(item.gregorianYear) === selectedYearFilter;
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      return matchesYear && matchesStatus;
    });
  }, [history, selectedYearFilter, statusFilter]);

  const summary = useMemo(() => {
    // Track annual obligations by latest entry per year or overall filtered obligations
    const totalCalculatedObligation = filteredHistory.reduce(
      (sum, item) => sum + (item.isObligatory ? item.zakatAmount : 0),
      0
    );
    const totalPaid = filteredHistory
      .filter((item) => item.status === "SUDAH_TUNAI")
      .reduce((sum, item) => sum + item.zakatAmount, 0);
    const totalUnpaid = filteredHistory
      .filter((item) => item.status === "BELUM_TUNAI")
      .reduce((sum, item) => sum + item.zakatAmount, 0);

    return {
      count: filteredHistory.length,
      totalCalculatedObligation,
      totalPaid,
      totalUnpaid,
    };
  }, [filteredHistory]);

  const handleExportCsv = () => {
    if (filteredHistory.length === 0) return;

    const headers = [
      "ID",
      "Tahun Masehi",
      "Tahun Hijriah",
      "Tanggal Hitung",
      "Aset Kotor (Rp)",
      "Hutang Jatuh Tempo (Rp)",
      "Harta Bersih (Rp)",
      "Nisab 85gr Emas (Rp)",
      "Kewajiban 2.5% (Rp)",
      "Status",
      "Catatan",
    ];

    const rows = filteredHistory.map((row) => [
      row.id,
      String(row.gregorianYear),
      row.hijriYear,
      new Date(row.calculatedAt).toLocaleDateString("id-ID"),
      String(row.grossAssets),
      String(row.shortTermDebts),
      String(row.netAssets),
      String(row.nisabThreshold),
      String(row.zakatAmount),
      row.status,
      `"${(row.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Riwayat-Zakat-Maal-${selectedYearFilter}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      badge: "EKSPOR CSV",
      title: "Riwayat Zakat Maal Diunduh",
      message: `${filteredHistory.length} catatan kewajiban tahunan berhasil diekspor ke CSV.`,
    });
  };

  return (
    <div
      id="zakat-maal-history-table-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Riwayat Perhitungan &amp; Pelacakan Kewajiban Tahunan Zakat Maal
              </h4>
              <p className="text-xs text-slate-500">
                Catat dan pantau kewajiban zakat tahunan (2,5%) lintas tahun Hijriah/Masehi beserta status pelunasannya.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="Filter tahun riwayat zakat"
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Tahun ({history.length})</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="Filter status zakat"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="SUDAH_TUNAI">Sudah Ditunaikan</option>
              <option value="BELUM_TUNAI">Belum Ditunaikan</option>
              <option value="DI_BAWAH_NISAB">Di Bawah Nisab</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredHistory.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 disabled:opacity-45"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Annual Obligation KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Kewajiban Terhitung
          </span>
          <div className="text-lg font-black font-mono text-slate-900">
            {formatRupiah(summary.totalCalculatedObligation)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Dari {summary.count} catatan riwayat haul
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Sudah Ditunaikan
          </span>
          <div className="text-lg font-black font-mono text-emerald-700">
            {formatRupiah(summary.totalPaid)}
          </div>
          <span className="text-[11px] text-emerald-700 block">
            Tercatat lunas &amp; tersalurkan
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Belum Ditunaikan (Sisa Kewajiban)
          </span>
          <div className="text-lg font-black font-mono text-amber-700">
            {formatRupiah(summary.totalUnpaid)}
          </div>
          <span className="text-[11px] text-amber-800 block">
            Siap diselesaikan via QRIS / Amil
          </span>
        </div>
      </div>

      {/* History Log Table */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center space-y-2">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-bold text-slate-700">
            Belum ada catatan riwayat pada filter ini
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hitung aset Anda di Kalkulator Zakat Maal lalu klik &ldquo;Simpan ke Riwayat Tahunan&rdquo; untuk melacak kewajiban tahunan Anda.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-bold whitespace-nowrap">Periode &amp; Tanggal</th>
                <th className="p-3 font-bold whitespace-nowrap">Rincian Aset &amp; Hutang</th>
                <th className="p-3 font-bold whitespace-nowrap">Harta Bersih &amp; Nisab</th>
                <th className="p-3 font-bold whitespace-nowrap">Kewajiban Zakat (2,5%)</th>
                <th className="p-3 font-bold whitespace-nowrap">Status Pelunasan</th>
                <th className="p-3 font-bold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((entry) => {
                const formattedDate = new Date(entry.calculatedAt).toLocaleDateString(
                  "id-ID",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 transition align-top"
                  >
                    {/* Periode & Tanggal */}
                    <td className="p-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">
                          {entry.gregorianYear}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                          {entry.hijriYear}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {formattedDate} • {entry.id}
                      </div>
                      {entry.notes && (
                        <div className="text-[11px] text-slate-600 italic max-w-[200px]">
                          {entry.notes}
                        </div>
                      )}
                    </td>

                    {/* Aset & Hutang */}
                    <td className="p-3 font-mono space-y-0.5 whitespace-nowrap">
                      <div className="text-slate-800 font-semibold">
                        Aset: {formatRupiah(entry.grossAssets)}
                      </div>
                      <div className="text-[11px] text-rose-600">
                        Hutang: -{formatRupiah(entry.shortTermDebts)}
                      </div>
                    </td>

                    {/* Harta Bersih & Nisab */}
                    <td className="p-3 space-y-0.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {formatRupiah(entry.netAssets)}
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-mono">
                        Nisab: {formatRupiah(entry.nisabThreshold)}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold ${
                          entry.netAssets >= entry.nisabThreshold
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {entry.netAssets >= entry.nisabThreshold
                          ? "✓ Mencapai Nisab"
                          : "Di Bawah Nisab"}
                      </span>
                    </td>

                    {/* Kewajiban Zakat */}
                    <td className="p-3 whitespace-nowrap">
                      <div
                        className={`font-mono font-black text-sm ${
                          entry.isObligatory
                            ? "text-teal-800"
                            : "text-slate-400"
                        }`}
                      >
                        {formatRupiah(entry.zakatAmount)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {entry.isObligatory
                          ? entry.haulMet
                            ? "Wajib Zakat (Haul Terpenuhi)"
                            : "Estimasi 2,5%"
                          : "Belum Wajib Zakat"}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-3 whitespace-nowrap">
                      {entry.status === "DI_BAWAH_NISAB" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10.5px] font-bold">
                          Di Bawah Nisab
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onTogglePaidStatus(entry.id)}
                          title="Klik untuk mengubah status pelunasan zakat"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition ${
                            entry.status === "SUDAH_TUNAI"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                          }`}
                        >
                          {entry.status === "SUDAH_TUNAI" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sudah Ditunaikan</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Belum Ditunaikan</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {onPayViaQr &&
                          entry.zakatAmount > 0 &&
                          entry.status === "BELUM_TUNAI" && (
                            <button
                              type="button"
                              onClick={() => onPayViaQr(entry)}
                              title="Tunaikan kewajiban zakat ini via QRIS"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition inline-flex items-center gap-1"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>Bayar QRIS</span>
                            </button>
                          )}

                        {onLoadIntoCalculator && (
                          <button
                            type="button"
                            onClick={() => onLoadIntoCalculator(entry)}
                            title="Muat kembali rincian aset ini ke kalkulator"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Muat</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          title="Hapus catatan riwayat"
                          aria-label={`Hapus riwayat ${entry.id}`}
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
    </div>
  );
}
