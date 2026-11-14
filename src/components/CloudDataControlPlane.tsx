import { useState } from "react";
import {
  ShieldCheck,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Printer,
  Activity,
  Layers,
  Server,
  Key,
  Lock,
} from "lucide-react";
import { INITIAL_DATA_INTEGRITY_LOGS } from "../data/mockData";

export default function CloudDataControlPlane() {
  const [logs, setLogs] = useState(INITIAL_DATA_INTEGRITY_LOGS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [governanceRole, setGovernanceRole] = useState<"Dewan_Pakar" | "Admin_Masjid" | "Auditor_Syariah">("Dewan_Pakar");

  const handleRunHealthCheck = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLogs((prev) => [
        {
          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toLocaleString("id-ID"),
          pipeline: "Knowledge Catalog",
          recordsProcessed: 152,
          validRate: 100,
          status: "OPTIMAL",
          hashSignature: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)} (Verified)`,
        },
        ...prev,
      ]);
    }, 1200);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="cloud-control-plane" className="space-y-6">
      {/* Control Plane Header Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-indigo-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-500/40 text-indigo-300 text-xs font-semibold mb-2">
              <Server className="w-3.5 h-3.5" />
              <span>CLOUD INFRASTRUCTURE & DATA GOVERNANCE CONTROL PLANE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Fondasi Cloud & Tata Kelola Data Presisi 4B
            </h2>
            <p className="text-sm text-indigo-200/90 max-w-2xl mt-1">
              Knowledge Catalog Governance, Data Validation & Integrity Engine, serta Dynamic Visual Business Intelligence (BI) Reporting untuk seluruh ekosistem abdi.sematangborangcity.cloud.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunHealthCheck}
              disabled={isSyncing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Menjalankan Health Check..." : "Jalankan Integrity Check"}</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Architecture 3-Tier Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              STAGE 1 : ENTRY LEVEL
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-sm">
            1. Data Validation & Integrity Engine
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Memastikan data jamaah, transaksi ZISWAF, dan akad termuat tanpa distorsi. Validasi ketat dalil hadits bersanad dan verifikasi integritas hash kriptografis.
          </p>
          <div className="text-[11px] font-mono text-emerald-700 font-semibold pt-1">
            Status: 99.8% Validitas Otomatis
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">
              STAGE 2 : GOVERNANCE
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-sm">
            2. Knowledge Catalog Governance
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pengelompokan taksonomi Islamicity 4B, hak akses berbasis peran (RBAC), metadata tagging, dan pengamanan aset literasi dakwah dari penyusupan konten syubhat.
          </p>
          <div className="text-[11px] font-mono text-blue-700 font-semibold pt-1">
            Aset Terkatalog: 5,420 Dokumen & Dalil
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full">
              STAGE 3 : INTELLIGENCE
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-sm">
            3. Dynamic Visual BI Reporting
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Visual reporting interaktif real-time yang memadukan metrik dakwah, audit kepatuhan syariah, pemetaan sosial GIS, dan perputaran ekonomi ZISWAF.
          </p>
          <div className="text-[11px] font-mono text-indigo-700 font-semibold pt-1">
            Engine: Gemini 3.7 + Realtime Analytics
          </div>
        </div>
      </div>

      {/* Realtime Data Pipeline Integrity Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Log Validasi & Integritas Pipeline Data (Live Telemetry)
            </h4>
            <p className="text-xs text-slate-500">
              Setiap perubahan data melewati mekanisme sanity check dan verifikasi aturan syariah otomatis.
            </p>
          </div>
          <span className="text-xs text-indigo-800 bg-indigo-50 font-bold px-2.5 py-1 rounded-full border border-indigo-200">
            Auto-Sync Interval: 15s
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b">
                <th className="p-3 font-bold">Log ID</th>
                <th className="p-3 font-bold">Pipeline Sumber</th>
                <th className="p-3 font-bold">Record Diproses</th>
                <th className="p-3 font-bold">Tingkat Validitas</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Tanda Tangan Hash Sanad / Ledger</th>
                <th className="p-3 font-bold">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-800">{log.id}</td>
                  <td className="p-3 font-semibold text-slate-900">{log.pipeline}</td>
                  <td className="p-3 font-mono">{log.recordsProcessed.toLocaleString("id-ID")} items</td>
                  <td className="p-3">
                    <span className="text-emerald-700 font-bold font-mono">{log.validRate}%</span>
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">{log.hashSignature}</td>
                  <td className="p-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Based Governance Access Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Role-Based Access Control (RBAC) & Tata Kelola Aset 4B
            </h4>
            <p className="text-xs text-slate-500">
              Pengaturan otorisasi data dakwah, validasi fatwa, dan kas umat di tingkat kelurahan & pengurus masjid.
            </p>
          </div>

          <div className="flex gap-2">
            {[
              { id: "Dewan_Pakar", label: "Dewan Pakar / MUI" },
              { id: "Admin_Masjid", label: "Pengurus Masjid" },
              { id: "Auditor_Syariah", label: "Auditor Syariah" },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setGovernanceRole(role.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                  governanceRole === role.id
                    ? "bg-indigo-700 text-white border-indigo-700"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Berdakwah (Catalog)</div>
            <div className="text-slate-600">
              {governanceRole === "Dewan_Pakar"
                ? "✓ Hak Penuh Tashih Hadits & Penambahan Dalil"
                : "Lihat & Distribusi Materi Kajian"}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Bersyariah (Audit)</div>
            <div className="text-slate-600">
              {governanceRole === "Auditor_Syariah" || governanceRole === "Dewan_Pakar"
                ? "✓ Penerbitan Sertifikasi Kepatuhan Syariah DSN-MUI"
                : "Pengajuan Draf Akad & Konsultasi Fiqh"}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Berjamaah (GIS)</div>
            <div className="text-slate-600">
              {governanceRole === "Admin_Masjid"
                ? "✓ Pembaruan Data Mustahiq & Jadwal Kegiatan"
                : "Akses Analitik Sebaran & Kebutuhan Umat"}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Bermuamalah (ZISWAF)</div>
            <div className="text-slate-600">
              {governanceRole === "Admin_Masjid"
                ? "✓ Penyaluran Dana & Pengesahan Bukti Kas"
                : "Audit Real-Time Public Ledger"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
