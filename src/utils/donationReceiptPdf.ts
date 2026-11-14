import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

export interface DonationReceiptData {
  receiptNumber: string;
  bankReference?: string;
  donorName: string;
  isAnonymous?: boolean;
  donorPhone?: string;
  donorEmail?: string;
  recipientName: string;
  recipientAddress?: string;
  dkmRegistrationId?: string;
  bankAccountInfo?: string;
  categoryLabel: string;
  purpose: string;
  paymentChannel: string;
  amount: number;
  baseAmount?: number;
  uniqueCode?: number;
  timestamp: string;
  notes?: string;
  doaArabic?: string;
  doaTranslation?: string;
}

const ONES = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];

function convertBelowThousand(n: number): string {
  if (n < 12) return ONES[n];
  if (n < 20) return `${ONES[n - 10]} Belas`;
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const rem = n % 10;
    return `${ONES[tens]} Puluh${rem > 0 ? ` ${ONES[rem]}` : ""}`;
  }
  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  const prefix = hundreds === 1 ? "Seratus" : `${ONES[hundreds]} Ratus`;
  return `${prefix}${rem > 0 ? ` ${convertBelowThousand(rem)}` : ""}`;
}

export function amountToIndonesianWords(value: number): string {
  const n = Math.floor(Math.max(0, value));
  if (n === 0) return "Nol Rupiah";

  const scales = [
    { divisor: 1_000_000_000_000, label: "Triliun" },
    { divisor: 1_000_000_000, label: "Miliar" },
    { divisor: 1_000_000, label: "Juta" },
    { divisor: 1_000, label: "Ribu" },
  ];

  let remainder = n;
  const parts: string[] = [];

  for (const scale of scales) {
    if (remainder >= scale.divisor) {
      const chunk = Math.floor(remainder / scale.divisor);
      remainder = remainder % scale.divisor;
      if (scale.divisor === 1_000 && chunk === 1) {
        parts.push("Seribu");
      } else {
        parts.push(`${convertBelowThousand(chunk)} ${scale.label}`);
      }
    }
  }

  if (remainder > 0) {
    parts.push(convertBelowThousand(remainder));
  }

  return `${parts.join(" ")} Rupiah`.replace(/\s+/g, " ").trim();
}

export function formatReceiptTimestamp(timestamp: string): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export async function generateReceiptQrDataUrl(data: DonationReceiptData): Promise<string> {
  const verificationPayload = JSON.stringify({
    issuer: "ABDI Islamicity Sematang Borang",
    ref: data.receiptNumber,
    bankRef: data.bankReference || data.receiptNumber,
    mosque: data.recipientName,
    amountIdr: data.amount,
    donor: data.isAnonymous ? "Hamba Allah" : data.donorName,
    verifiedAt: data.timestamp,
    verifyUrl: `https://abdi.sematangborangcity.cloud/verify/${encodeURIComponent(data.receiptNumber)}`,
  });

  return QRCode.toDataURL(verificationPayload, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: "#064e3b",
      light: "#ffffff",
    },
  });
}

export async function downloadDonationReceiptPdf(data: DonationReceiptData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const formattedDate = formatReceiptTimestamp(data.timestamp);
  const donorDisplay = data.isAnonymous ? "Hamba Allah (Anonim)" : data.donorName || "Hamba Allah";
  const terbilang = amountToIndonesianWords(data.amount);

  let verifyQrDataUrl = "";
  try {
    verifyQrDataUrl = await generateReceiptQrDataUrl(data);
  } catch {
    verifyQrDataUrl = "";
  }

  // Institutional Emerald/Slate Header Band
  doc.setFillColor(6, 78, 59); // emerald-900
  doc.rect(0, 0, 210, 42, "F");

  // Gold Accent Strip
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 42, 210, 2.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("e-KWITANSI RESMI INFAQ & ZISWAF DIGITAL", 15, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(209, 250, 229); // emerald-100
  doc.text("ABDI Islamicity Cloud • Forum DKM & Baitul Maal Kecamatan Sematang Borang", 15, 22);
  doc.text(data.recipientName, 15, 28);

  if (data.recipientAddress || data.dkmRegistrationId) {
    doc.setFontSize(8);
    doc.setTextColor(167, 243, 208); // emerald-200
    const subParts = [data.dkmRegistrationId ? `Reg: ${data.dkmRegistrationId}` : "", data.recipientAddress || ""].filter(Boolean);
    doc.text(subParts.join("  •  "), 15, 34);
  }

  // Verified Seal Box on Top Right
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(148, 11, 47, 19, 2.5, 2.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("STATUS TRANSAKSI", 171.5, 17, { align: "center" });
  doc.setFontSize(10);
  doc.text("TERVERIFIKASI", 171.5, 24.5, { align: "center" });

  // Receipt Meta Strip
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(15, 50, 180, 24, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("NOMOR KWITANSI", 21, 57);
  doc.text("WAKTU VERIFIKASI", 82, 57);
  doc.text("KANAL QRIS", 143, 57);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.receiptNumber, 21, 64);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(formattedDate, 82, 64, { maxWidth: 56 });
  doc.text(data.paymentChannel, 143, 64, { maxWidth: 48 });

  if (data.bankReference && data.bankReference !== data.receiptNumber) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Ref Host Bank: ${data.bankReference}`, 21, 70);
  } else {
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text("Tercatat otomatis pada Buku Kas Terbuka Umat (0% Potongan Admin)", 21, 70);
  }

  // Details Table
  const rows: Array<[string, string]> = [
    ["Nama Munfiq / Donatur", donorDisplay],
    ["Masjid / Lembaga Penerima", data.recipientName],
    ["Kategori & Akad", data.categoryLabel],
    ["Alokasi Program Khusus", data.purpose],
  ];

  if (data.bankAccountInfo) {
    rows.push(["Rekening Resmi Tujuan", data.bankAccountInfo]);
  }
  if (data.donorPhone || data.donorEmail) {
    const contact = [data.donorPhone, data.donorEmail].filter(Boolean).join(" / ");
    rows.push(["Kontak Munfiq", contact]);
  }
  if (typeof data.baseAmount === "number" && typeof data.uniqueCode === "number" && data.uniqueCode > 0) {
    rows.push([
      "Rincian Nominal",
      `Pokok Rp ${data.baseAmount.toLocaleString("id-ID")} + Kode Unik +${data.uniqueCode}`,
    ]);
  }
  if (data.notes) {
    rows.push(["Doa / Catatan Munfiq", data.notes]);
  }

  autoTable(doc, {
    startY: 80,
    head: [["RINCIAN PENERIMAAN INFAQ / ZISWAF", "KETERANGAN TERVERIFIKASI"]],
    body: rows,
    theme: "grid",
    margin: { left: 15, right: 15 },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 58, fontStyle: "bold", fillColor: [248, 250, 252] },
      1: { cellWidth: 122 },
    },
  });

  const afterTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 155;
  const amountBoxY = afterTableY + 6;

  // Highlighted Total Amount Box
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.6);
  doc.roundedRect(15, amountBoxY, 180, 24, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text("TOTAL DANA INFAQ / DONASI DITERIMA", 21, amountBoxY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(6, 78, 59);
  doc.text(`Rp ${data.amount.toLocaleString("id-ID")}`, 21, amountBoxY + 15.5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Terbilang: # ${terbilang} #`, 21, amountBoxY + 21, { maxWidth: 168 });

  // QR Verification + Digital Signature Section
  const signY = amountBoxY + 32;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, signY, 180, 42, 3, 3, "FD");

  if (verifyQrDataUrl) {
    doc.addImage(verifyQrDataUrl, "PNG", 20, signY + 4, 34, 34);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("VERIFIKASI KEASLIAN KWITANSI", 59, signY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Pindai QR Code di samping untuk mencocokkan nomor referensi pada Buku Kas Publik Masjid dan Audit Transparansi Syariah (DSN-MUI).",
    59,
    signY + 15,
    { maxWidth: 74 }
  );
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105);
  doc.text(`ID Audit: ${data.receiptNumber}`, 59, signY + 32);

  // Digital Stamp / Signature on Right
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.roundedRect(138, signY + 5, 51, 32, 2, 2, "D");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Sematang Borang, Palembang", 163.5, signY + 10, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text("STEMPEL DIGITAL SAH", 163.5, signY + 18, { align: "center" });
  doc.setFontSize(7.5);
  doc.text("Tercatat Real-Time", 163.5, signY + 23, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Bendahara DKM / Amil ZISWAF", 163.5, signY + 33, { align: "center" });

  // Prophetic Doa Footer Box
  const doaY = signY + 48;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, doaY, 180, 22, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text("DOA PENERIMAAN INFAQ & ZISWAF:", 21, doaY + 6.5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  const doaDesc =
    data.doaTranslation ||
    '"Ajarakallahu fima a\'thaita, wa baraka laka fima abqaita, wa ja\'alahu laka thahuran." (Semoga Allah memberi pahala atas apa yang engkau berikan, memberkahi harta yang tersisa, dan menjadikannya penyuci bagimu).';
  doc.text(doaDesc, 21, doaY + 12, { maxWidth: 168 });

  // Bottom Page Legal Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Dokumen ini diterbitkan secara elektronik oleh ABDI Islamicity 4B Cloud (abdi.sematangborangcity.cloud) dan sah sebagai bukti penerimaan donasi tanpa tanda tangan basah.",
    105,
    286,
    { align: "center" }
  );

  const safeFilename = data.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, "-");
  doc.save(`Kwitansi-Infaq-${safeFilename}.pdf`);
}
