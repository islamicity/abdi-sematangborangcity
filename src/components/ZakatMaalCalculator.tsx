import { useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Calculator,
  CheckCircle2,
  Coins,
  CreditCard,
  Info,
  PiggyBank,
  QrCode,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface ZakatMaalCalculatorProps {
  onProceedToQrDonation?: (amount: number) => void;
  onApplyToPortal?: (amount: number) => void;
}

const formatRupiah = (value: number) => `Rp ${Math.round(value).toLocaleString("id-ID")}`;

function parseNumericInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatInputNumber(value: number): string {
  return value === 0 ? "" : value.toLocaleString("id-ID");
}

export default function ZakatMaalCalculator({
  onProceedToQrDonation,
  onApplyToPortal,
}: ZakatMaalCalculatorProps) {
  // Asset Inputs (IDR)
  const [cashSavings, setCashSavings] = useState<number>(80000000);
  const [goldAssets, setGoldAssets] = useState<number>(35000000);
  const [investments, setInvestments] = useState<number>(45000000);
  const [businessAssets, setBusinessAssets] = useState<number>(25000000);
  const [shortTermDebts, setShortTermDebts] = useState<number>(15000000);

  // Nisab & Haul Settings
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(1350000);
  const [haulMet, setHaulMet] = useState<boolean>(true);
  const [includeBelowNisabEstimate, setIncludeBelowNisabEstimate] = useState<boolean>(false);

  const calculation = useMemo(() => {
    const grossAssets = cashSavings + goldAssets + investments + businessAssets;
    const netAssets = Math.max(0, grossAssets - shortTermDebts);
    const nisabThreshold = goldPricePerGram * 85;
    const reachesNisab = nisabThreshold > 0 && netAssets >= nisabThreshold;
    const isObligatory = reachesNisab && haulMet;

    const rawZakat25Pct = Math.round(netAssets * 0.025);
    const obligatoryZakat = isObligatory ? rawZakat25Pct : 0;
    const monthlyEquivalent = Math.round(rawZakat25Pct / 12);
    const nisabProgressPct =
      nisabThreshold > 0 ? Math.min(100, Math.round((netAssets / nisabThreshold) * 100)) : 0;
    const gapOrSurplus = netAssets - nisabThreshold;

    return {
      grossAssets,
      netAssets,
      nisabThreshold,
      reachesNisab,
      isObligatory,
      rawZakat25Pct,
      obligatoryZakat,
      monthlyEquivalent,
      nisabProgressPct,
      gapOrSurplus,
    };
  }, [
    cashSavings,
    goldAssets,
    investments,
    businessAssets,
    shortTermDebts,
    goldPricePerGram,
    haulMet,
  ]);

  const handleResetZero = () => {
    setCashSavings(0);
    setGoldAssets(0);
    setInvestments(0);
    setBusinessAssets(0);
    setShortTermDebts(0);
  };

  const handleLoadSample = () => {
    setCashSavings(80000000);
    setGoldAssets(35000000);
    setInvestments(45000000);
    setBusinessAssets(25000000);
    setShortTermDebts(15000000);
    setGoldPricePerGram(1350000);
    setHaulMet(true);
  };

  const assetFields = [
    {
      id: "cash-savings",
      label: "Tabungan, Kas & Deposito",
      hint: "Saldo rekening bank syariah/konvensional, giro, deposito, dan uang tunai.",
      value: cashSavings,
      setter: setCashSavings,
      icon: PiggyBank,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: "gold-assets",
      label: "Emas, Perak & Logam Mulia",
      hint: "Nilai pasar emas batangan atau perhiasan simpanan (selain pakai harian wajar).",
      value: goldAssets,
      setter: setGoldAssets,
      icon: Coins,
      accent: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: "investments",
      label: "Saham Syariah, Reksadana & Sukuk",
      hint: "Nilai portofolio investasi likuid atau bagi hasil usaha yang dimiliki.",
      value: investments,
      setter: setInvestments,
      icon: TrendingUp,
      accent: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      id: "business-assets",
      label: "Stok Usaha & Piutang Lancar",
      hint: "Modal barang dagangan dan piutang yang dipastikan dapat tertagih.",
      value: businessAssets,
      setter: setBusinessAssets,
      icon: Briefcase,
      accent: "text-sky-600 bg-sky-50 border-sky-200",
    },
  ];

  const effectivePayable = calculation.isObligatory
    ? calculation.obligatoryZakat
    : includeBelowNisabEstimate
    ? calculation.rawZakat25Pct
    : 0;

  return (
    <div id="zakat-maal-calculator-section" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-2xl p-6 text-white border border-emerald-700/50 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Kalkulator Zakat Maal (Harta Simpanan) • 2,5%</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Hitung Kewajiban Zakat Maal Anda Secara Mudah &amp; Syar&apos;i
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Masukkan total aset produktif dan simpanan yang telah dimiliki selama 1 tahun Hijriah (<em>Haul</em>), dikurangi hutang jatuh tempo. Sistem otomatis membandingkan dengan Nisab 85 gram emas dan menghitung zakat sebesar <strong>2,5%</strong>.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-teal-700/60 rounded-2xl px-4 py-3 shrink-0 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Standar Nisab Saat Ini (85 gr Emas)
            </div>
            <div className="text-lg font-black font-mono text-amber-300">
              {formatRupiah(calculation.nisabThreshold)}
            </div>
            <div className="text-[11px] text-emerald-300 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Kadar Wajib: 2,5% dari Harta Bersih</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Calculator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Asset & Liability Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-teal-600" />
                <span>1. Rincian Aset Harta &amp; Kewajiban</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Isi komponen harta yang dimiliki (kosongkan atau isi 0 jika tidak ada).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
              >
                Isi Contoh
              </button>
              <button
                type="button"
                onClick={handleResetZero}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (0)</span>
              </button>
            </div>
          </div>

          {/* 4 Asset Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assetFields.map((field) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 focus-within:border-teal-500 focus-within:bg-white transition"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${field.accent}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <label
                      htmlFor={field.id}
                      className="text-xs font-bold text-slate-800 leading-tight"
                    >
                      {field.label}
                    </label>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      id={field.id}
                      type="text"
                      inputMode="numeric"
                      value={formatInputNumber(field.value)}
                      onChange={(e) => field.setter(parseNumericInput(e.target.value))}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <p className="text-[10.5px] text-slate-500 leading-snug">
                    {field.hint}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Deductible Debts */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="short-term-debts"
                className="text-xs font-bold text-rose-950 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-rose-600" />
                <span>Hutang Jatuh Tempo / Kewajiban Mendesak (Pengurang)</span>
              </label>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Mengurangi Total Aset
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-rose-400">
                Rp
              </span>
              <input
                id="short-term-debts"
                type="text"
                inputMode="numeric"
                value={formatInputNumber(shortTermDebts)}
                onChange={(e) => setShortTermDebts(parseNumericInput(e.target.value))}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 bg-white border border-rose-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <p className="text-[10.5px] text-slate-600">
              Cicilan atau hutang pribadi yang jatuh tempo saat haul zakat tiba (bukan total cicilan KPR jangka panjang).
            </p>
          </div>

          {/* Nisab Gold Price & Haul Parameter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label
                htmlFor="gold-price-input"
                className="block text-xs font-bold text-slate-700"
              >
                Harga Acuan Emas / Gram (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  Rp
                </span>
                <input
                  id="gold-price-input"
                  type="text"
                  inputMode="numeric"
                  value={formatInputNumber(goldPricePerGram)}
                  onChange={(e) => setGoldPricePerGram(parseNumericInput(e.target.value))}
                  placeholder="1.350.000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <p className="text-[10.5px] text-slate-500">
                Nisab = 85 gr × harga emas ={" "}
                <strong className="font-mono text-slate-700">
                  {formatRupiah(calculation.nisabThreshold)}
                </strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-700">
                Status Kepemilikan 1 Tahun (Haul)
              </span>
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={haulMet}
                  onChange={(e) => setHaulMet(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-700 leading-snug">
                  <strong>Harta telah genap 1 tahun Hijriah (Haul)</strong> atau saya ingin menunaikannya sekarang.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live 2.5% Calculation Result & Payment Action (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-teal-600/30 shadow-md p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>2. Hasil Perhitungan Kewajiban Zakat</span>
              </h4>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  calculation.isObligatory
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}
              >
                {calculation.isObligatory ? "Wajib Zakat" : "Belum Wajib"}
              </span>
            </div>

            {/* Net Assets Breakdown */}
            <div className="space-y-2 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Aset Kotor:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatRupiah(calculation.grossAssets)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Dikurangi Hutang Jatuh Tempo:</span>
                <span className="font-mono font-semibold text-rose-600">
                  - {formatRupiah(shortTermDebts)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">Harta Bersih (Nishab Base):</span>
                <span className="font-mono font-black text-slate-950">
                  {formatRupiah(calculation.netAssets)}
                </span>
              </div>
            </div>

            {/* Nisab Threshold Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Perbandingan terhadap Nisab (85 gr Emas)
                </span>
                <span className="font-mono font-bold text-teal-800">
                  {calculation.nisabProgressPct}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    calculation.reachesNisab
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-amber-400 to-amber-500"
                  }`}
                  style={{ width: `${calculation.nisabProgressPct}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>Nisab: {formatRupiah(calculation.nisabThreshold)}</span>
                <span
                  className={`font-semibold ${
                    calculation.reachesNisab ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {calculation.gapOrSurplus >= 0
                    ? `+${formatRupiah(calculation.gapOrSurplus)} di atas nisab`
                    : `Kurang ${formatRupiah(Math.abs(calculation.gapOrSurplus))} ke nisab`}
                </span>
              </div>
            </div>

            {/* Main 2.5% Obligation Result Card */}
            <div
              className={`rounded-2xl p-5 border-2 space-y-2 ${
                calculation.isObligatory
                  ? "bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 border-emerald-500 text-white"
                  : "bg-amber-50/80 border-amber-300 text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    calculation.isObligatory ? "text-emerald-300" : "text-amber-800"
                  }`}
                >
                  Kewajiban Zakat Maal (2,5%)
                </span>
                {calculation.isObligatory && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              <div
                className={`text-3xl font-black font-mono tracking-tight ${
                  calculation.isObligatory ? "text-amber-300" : "text-slate-900"
                }`}
              >
                {formatRupiah(
                  calculation.isObligatory
                    ? calculation.obligatoryZakat
                    : includeBelowNisabEstimate
                    ? calculation.rawZakat25Pct
                    : 0
                )}
              </div>

              <p
                className={`text-[11px] leading-relaxed ${
                  calculation.isObligatory ? "text-emerald-100/90" : "text-slate-700"
                }`}
              >
                {calculation.isObligatory ? (
                  <>
                    Rumus: 2,5% × {formatRupiah(calculation.netAssets)} ={" "}
                    <strong>{formatRupiah(calculation.obligatoryZakat)}</strong>{" "}
                    (atau sekitar{" "}
                    <strong>{formatRupiah(calculation.monthlyEquivalent)}/bulan</strong>).
                  </>
                ) : !calculation.reachesNisab ? (
                  <>
                    Harta bersih Anda belum mencapai batas Nisab ({formatRupiah(calculation.nisabThreshold)}), sehingga{" "}
                    <strong>belum wajib Zakat Maal</strong>. Anda tetap dianjurkan menunaikan Infaq/Sedekah.
                  </>
                ) : (
                  <>
                    Harta sudah mencapai Nisab, namun belum genap 1 tahun (<em>Haul</em>). Zakat Maal belum wajib kecuali Anda berniat menyegerakan (<em>Ta&apos;jil Zakat</em>).
                  </>
                )}
              </p>

              {!calculation.isObligatory && calculation.netAssets > 0 && (
                <label className="flex items-center gap-2 pt-2 border-t border-amber-300/70 text-[11px] text-amber-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBelowNisabEstimate}
                    onChange={(e) => setIncludeBelowNisabEstimate(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    Simulasikan 2,5% dari harta saat ini ({formatRupiah(calculation.rawZakat25Pct)})
                  </span>
                </label>
              )}
            </div>

            {/* Direct Payment CTAs */}
            <div className="space-y-2">
              {onProceedToQrDonation && (
                <button
                  type="button"
                  disabled={effectivePayable <= 0}
                  onClick={() => onProceedToQrDonation(effectivePayable)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <QrCode className="w-4 h-4" />
                  <span>
                    {effectivePayable > 0
                      ? `Tunaikan Zakat via QRIS (${formatRupiah(effectivePayable)})`
                      : "Masukkan Aset Mencapai Nisab untuk Bayar Zakat"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {onApplyToPortal && effectivePayable > 0 && (
                <button
                  type="button"
                  onClick={() => onApplyToPortal(effectivePayable)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>Salin ke Formulir Portal ZISWAF</span>
                </button>
              )}
            </div>

            {/* Sharia Reference Note */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 flex items-start gap-2.5 text-[11px] text-teal-950">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-bold block">Landasan Syariah Zakat Maal (2,5%)</span>
                <span className="text-slate-700 block">
                  &ldquo;Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan menyucikan mereka.&rdquo; (QS. At-Taubah: 103). Disalurkan transparan ke 8 Asnaf di Sematang Borang.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
