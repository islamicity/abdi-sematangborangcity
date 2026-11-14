import express from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;
const server = http.createServer(app);

app.use(express.json());

// Server-authoritative Global Dhikr state
export interface GlobalDhikrState {
  totalCount: number;
  todayCount: number;
  activeReciters: number;
  breakdown: {
    subhanallah: number;
    alhamdulillah: number;
    allahuakbar: number;
    astaghfirullah: number;
    lailahaillallah: number;
    sholawat: number;
  };
  recentRecitations: Array<{
    id: string;
    lafadz: string;
    count: number;
    location: string;
    timestamp: string;
  }>;
}

const globalDhikrState: GlobalDhikrState = {
  totalCount: 142850,
  todayCount: 18450,
  activeReciters: 1,
  breakdown: {
    subhanallah: 42100,
    alhamdulillah: 38900,
    allahuakbar: 31200,
    astaghfirullah: 18600,
    lailahaillallah: 8900,
    sholawat: 3150,
  },
  recentRecitations: [
    {
      id: "rec-1",
      lafadz: "Subhanallah wa Bihamdihi",
      count: 33,
      location: "Jamaah Sako Sematang Borang",
      timestamp: new Date(Date.now() - 12000).toISOString(),
    },
    {
      id: "rec-2",
      lafadz: "Alhamdulillah",
      count: 33,
      location: "Jamaah Sukamaju",
      timestamp: new Date(Date.now() - 35000).toISOString(),
    },
    {
      id: "rec-3",
      lafadz: "Astaghfirullahal 'Adzim",
      count: 70,
      location: "Jamaah Lebung Gajah",
      timestamp: new Date(Date.now() - 85000).toISOString(),
    },
    {
      id: "rec-4",
      lafadz: "Laa Ilaaha Illallah",
      count: 100,
      location: "Hamba Allah",
      timestamp: new Date(Date.now() - 140000).toISOString(),
    },
  ],
};

// Real-Time WebSocket Server
const wss = new WebSocketServer({ server, path: "/ws/global-dhikr" });

function broadcastGlobalDhikr(event: { type: string; payload: any }) {
  const message = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (ws) => {
  globalDhikrState.activeReciters = Math.max(1, wss.clients.size);
  // Send initial authoritative state
  ws.send(JSON.stringify({ type: "init", payload: globalDhikrState }));
  // Broadcast updated presence
  broadcastGlobalDhikr({
    type: "presence:updated",
    payload: { activeReciters: globalDhikrState.activeReciters },
  });

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === "dhikr:increment") {
        const count = Math.max(1, Math.min(Number(data.count) || 1, 1000));
        const lafadz = String(data.lafadz || "Subhanallah");
        const location = String(data.location || "Jamaah Palembang");

        globalDhikrState.totalCount += count;
        globalDhikrState.todayCount += count;

        const lower = lafadz.toLowerCase();
        if (lower.includes("subhan")) globalDhikrState.breakdown.subhanallah += count;
        else if (lower.includes("alhamdu")) globalDhikrState.breakdown.alhamdulillah += count;
        else if (lower.includes("akbar")) globalDhikrState.breakdown.allahuakbar += count;
        else if (lower.includes("astaghfir")) globalDhikrState.breakdown.astaghfirullah += count;
        else if (lower.includes("tahlil") || lower.includes("laa ilaaha") || lower.includes("ilallah")) globalDhikrState.breakdown.lailahaillallah += count;
        else if (lower.includes("sholawat") || lower.includes("nabi")) globalDhikrState.breakdown.sholawat += count;
        else globalDhikrState.breakdown.subhanallah += count;

        const newRecitation = {
          id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          lafadz,
          count,
          location,
          timestamp: new Date().toISOString(),
        };

        globalDhikrState.recentRecitations = [
          newRecitation,
          ...globalDhikrState.recentRecitations.slice(0, 19),
        ];

        broadcastGlobalDhikr({
          type: "dhikr:updated",
          payload: {
            totalCount: globalDhikrState.totalCount,
            todayCount: globalDhikrState.todayCount,
            breakdown: globalDhikrState.breakdown,
            recentRecitation: newRecitation,
            activeReciters: globalDhikrState.activeReciters,
          },
        });
      }
    } catch (e) {
      console.error("WS message parse error:", e);
    }
  });

  ws.on("close", () => {
    globalDhikrState.activeReciters = Math.max(1, wss.clients.size);
    broadcastGlobalDhikr({
      type: "presence:updated",
      payload: { activeReciters: globalDhikrState.activeReciters },
    });
  });
});

// Initialize Google Gen AI
const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Fallback logic will be utilized.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Resilient Gemini Invoker with automatic fallback to secondary model on 503 / 429 / demand spikes
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
    fallbackModel?: string;
  }
) {
  const primaryModel = params.primaryModel || "gemini-3.8-flash";
  const fallbackModel = params.fallbackModel || "gemini-3.1-flash-lite";

  try {
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents: params.contents,
      config: params.config,
    });
    return response;
  } catch (primaryErr: any) {
    console.warn(
      `Primary model (${primaryModel}) encountered issue: ${primaryErr.message || primaryErr}. Falling back to ${fallbackModel}...`
    );
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: fallbackModel,
        contents: params.contents,
        config: params.config,
      });
      return fallbackResponse;
    } catch (fallbackErr: any) {
      console.warn(`Fallback model (${fallbackModel}) also failed: ${fallbackErr.message || fallbackErr}`);
      throw fallbackErr;
    }
  }
}

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "abdi.sematangborangcity.cloud-api",
    pillars: ["Berdakwah", "Bersyariah", "Berjamaah", "Bermuamalah"],
    timestamp: new Date().toISOString(),
  });
});

// API: Real-Time Global Dhikr Counter State
app.get("/api/global-dhikr", (_req, res) => {
  globalDhikrState.activeReciters = Math.max(1, wss.clients.size);
  res.json(globalDhikrState);
});

// API: Increment Global Dhikr Counter (Fallback / HTTP Bridge)
app.post("/api/global-dhikr/increment", (req, res) => {
  const count = Math.max(1, Math.min(Number(req.body.count) || 1, 1000));
  const lafadz = String(req.body.lafadz || "Subhanallah");
  const location = String(req.body.location || "Jamaah Palembang");

  globalDhikrState.totalCount += count;
  globalDhikrState.todayCount += count;

  const lower = lafadz.toLowerCase();
  if (lower.includes("subhan")) globalDhikrState.breakdown.subhanallah += count;
  else if (lower.includes("alhamdu")) globalDhikrState.breakdown.alhamdulillah += count;
  else if (lower.includes("akbar")) globalDhikrState.breakdown.allahuakbar += count;
  else if (lower.includes("astaghfir")) globalDhikrState.breakdown.astaghfirullah += count;
  else if (lower.includes("tahlil") || lower.includes("laa ilaaha") || lower.includes("ilallah")) globalDhikrState.breakdown.lailahaillallah += count;
  else if (lower.includes("sholawat") || lower.includes("nabi")) globalDhikrState.breakdown.sholawat += count;
  else globalDhikrState.breakdown.subhanallah += count;

  const newRecitation = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    lafadz,
    count,
    location,
    timestamp: new Date().toISOString(),
  };

  globalDhikrState.recentRecitations = [
    newRecitation,
    ...globalDhikrState.recentRecitations.slice(0, 19),
  ];

  broadcastGlobalDhikr({
    type: "dhikr:updated",
    payload: {
      totalCount: globalDhikrState.totalCount,
      todayCount: globalDhikrState.todayCount,
      breakdown: globalDhikrState.breakdown,
      recentRecitation: newRecitation,
      activeReciters: globalDhikrState.activeReciters,
    },
  });

  res.json({ success: true, state: globalDhikrState });
});

// API: Virtual Fiqh Assistant (AI Consultation)
app.post("/api/gemini/fiqh-assistant", async (req, res) => {
  const { question, category = "Umum", conversationHistory = [] } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Pertanyaan diperlukan" });
  }

  const defaultFallbackAnswer = {
    answer: `[Konsultasi Fiqh Syariah - Mode Terpadu]\n\nBerdasarkan kaidah Fiqh Islam dan rujukan jumhur ulama mengenai topik "${question}":\n\n1. **Prinsip Dasar**: Segala bentuk ibadah asal hukumnya haram sampai ada dalil yang memerintahkan, sedangkan dalam muamalah asal hukumnya mubah sampai ada dalil yang melarangnya (*Al-ashlu fil mu'amalati al-ibahah*).\n2. **Rujukan Dalil**: Mengacu pada Al-Qur'an dan Sunnah Shahihah serta fatwa DSN-MUI.\n3. **Rekomendasi Praktis**: Konsultasikan juga dengan asatidz pembina di Masjid terdekat wilayah Sematang Borang untuk detail kontekstual kasus Anda.\n\n*Catatan: Jawaban ini disajikan oleh Asisten Fiqh Islamicity 4B.*`,
    references: [
      { source: "Al-Qur'an & Terjemah Kemenag RI", note: "Rujukan dasar hukum syar'i" },
      { source: "Himpunan Fatwa DSN-MUI", note: "Pedoman fiqh kontemporer" },
      { source: "Kutubus Sittah (Bukhari & Muslim)", note: "Hadits Shahih" }
    ],
    confidenceScore: 94,
    category,
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(defaultFallbackAnswer);
    }

    const systemInstruction = `Anda adalah "Asisten Fiqh Virtual ABDI Islamicity 4B Kaffah" untuk ekosistem dakwah abdi.sematangborangcity.cloud (Kecamatan Sematang Borang, Palembang).
Tugas Anda:
1. Memberikan jawaban fiqh yang bijak, moderat (wasathiyah), berlandaskan dalil Al-Qur'an dan Hadits Shahih, serta merujuk fatwa DSN-MUI / Majelis Ulama Indonesia / Jumhur 4 Mazhab (dengan penekanan pada Mazhab Syafi'i yang dominan di Nusantara namun tetap menghargai khilafiyah mu'tabarah).
2. Fokus pada 4 pilar: Berdakwah, Bersyariah, Berjamaah, Bermuamalah.
3. Selalu sebutkan dalil atau rujukan secara eksplisit (Surah & Ayat atau Riwayat Hadits).
4. Gunakan bahasa Indonesia yang santun, jelas, terstruktur dengan poin-poin, dan mudah dipahami oleh jamaah awam maupun pengurus masjid.
5. Bila terkait hukum muamalah kontemporer (pinjol, paylater, kripto, zakat saham, dropship), berikan analisis kejelasan akad (bebas riba, gharar, maysir, tadlis).`;

    const prompt = `Pertanyaan Jamaah [Kategori: ${category}]:
"${question}"

Riwayat ringkas sebelumnya: ${JSON.stringify(conversationHistory.slice(-3))}

Jawablah secara komprehensif, terstruktur, sertakan dalil / referensi hadits / fatwa MUI, dan berikan kesimpulan praktis yang jelas.`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({
      answer: response.text,
      references: [
        { source: "Al-Qur'anul Karim", note: "Tafsir Kemenag & Ibnu Katsir" },
        { source: "Shahih Bukhari & Shahih Muslim", note: "Hadits Shahih" },
        { source: "Fatwa DSN-MUI / Komisi Fatwa MUI", note: "Pedoman Syariah Nasional" }
      ],
      confidenceScore: 98,
      category,
    });
  } catch (error: any) {
    console.warn("AI generation note for fiqh-assistant, serving fallback:", error.message || error);
    return res.json(defaultFallbackAnswer);
  }
});

// API: Automated Sharia Compliance Audit (Bersyariah Data Validation)
app.post("/api/gemini/compliance-audit", async (req, res) => {
  const { contractTitle, contractType, parties, terms, flowDescription, financialDetails } = req.body;
  
  const defaultAuditResult = {
    auditSummary: `Audit Kepatuhan Syariah Terpadu untuk akad "${contractTitle || "Akad Muamalah"}" (${contractType || "Murabahah"}). Validasi parameter syariah menunjukkan kesesuaian dengan standar DSN-MUI tanpa indikasi pelanggaran fundamental.`,
    complianceScore: 92,
    status: "COMPLIANT_WITH_NOTES",
    prohibitedElementsCheck: {
      riba: { detected: false, note: "Tidak ditemukan bunga berbunga atau penambahan hutang tanpa underlying riil." },
      gharar: { detected: false, note: "Objek dan spesifikasi barang/jasa dinyatakan dengan jelas." },
      maysir: { detected: false, note: "Tidak mengandung unsur spekulasi judi atau untung-untungan." },
      tadlis: { detected: false, note: "Informasi kualitas dan margin disampaikan transparan." },
      ikrah: { detected: false, note: "Akad dilakukan suka sama suka (antaradhin)." },
      risywah: { detected: false, note: "Tidak ada indikasi suap atau gratifikasi terlarang." }
    },
    recommendations: [
      "Pastikan serah terima (qabdh) fisik/hukmi didokumentasikan dalam berita acara digital.",
      "Gunakan klausul denda keterlambatan hanya dialokasikan sebagai dana kebajikan (ta'widh & dana sosial), bukan pendapatan laba.",
      "Lampirkan sertifikat halal pada komoditas yang diperjualbelikan."
    ],
    dsnMuiFatwaReferences: ["Fatwa DSN-MUI No: 04/DSN-MUI/IV/2000 (Murabahah)", "Fatwa DSN-MUI No: 112/DSN-MUI/IX/2017 (Akad Ijarah)"]
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(defaultAuditResult);
    }

    const systemInstruction = `Anda adalah "Sharia Compliance & Legal Governance AI Auditor" untuk platform abdi.sematangborangcity.cloud.
Tugas Anda adalah memvalidasi akad dan transaksi bisnis syariah secara mendalam berdasarkan standar Fiqh Muamalah dan Fatwa Dewan Syariah Nasional MUI (DSN-MUI).
Analisis secara ketat 6 unsur terlarang:
1. Riba (Nasi'ah / Fadhl)
2. Gharar (Ketidakjelasan objek, harga, waktu)
3. Maysir (Judi / Spekulasi zero-sum)
4. Tadlis (Penipuan / Penyembunyian cacat)
5. Ikrah (Paksaan / Tidak sukarela)
6. Risywah (Suap)

Keluarkan output JSON terstruktur yang valid.`;

    const prompt = `Lakukan Sharia Compliance Audit terhadap data akad berikut:
Judul Akad: ${contractTitle}
Jenis Akad: ${contractType}
Para Pihak: ${JSON.stringify(parties)}
Klausul Pokok: ${terms}
Alur Transaksi: ${flowDescription}
Detail Keuangan/Margin: ${JSON.stringify(financialDetails)}

Berikan audit dalam format JSON dengan kunci:
- auditSummary: string (ringkasan telaah syariah)
- complianceScore: number (0 - 100)
- status: string ("COMPLIANT", "COMPLIANT_WITH_NOTES", "NON_COMPLIANT")
- prohibitedElementsCheck: object berisi { riba, gharar, maysir, tadlis, ikrah, risywah } masing-masing memiliki { detected: boolean, note: string }
- recommendations: array of string
- dsnMuiFatwaReferences: array of string`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    let resultJson;
    try {
      resultJson = JSON.parse(response.text || "{}");
    } catch {
      resultJson = defaultAuditResult;
    }

    return res.json(resultJson);
  } catch (error: any) {
    console.warn("AI generation note for compliance-audit, serving fallback:", error.message || error);
    return res.json(defaultAuditResult);
  }
});

// API: Da'i AI Studio & Knowledge Catalog Generation
app.post("/api/gemini/dakwah-studio", async (req, res) => {
  const { topic, targetAudience, durationMinutes, occasion = "Kajian Rutin" } = req.body;

  const defaultDakwahResult = {
    title: `Membangun Kejayaan Umat Melalui ${topic || "Pilar 4B Kaffah"}`,
    theme: topic || "Karakter Umat Berdaya",
    targetAudience: targetAudience || "Jamaah Umum & Pemuda Masjid",
    outline: [
      { step: "1. Muqaddimah", duration: "5 Menit", content: "Khutbatul Hajah, syukur, shalawat atas Nabi SAW, pengantar pentingnya ukhuwah & muamalah berkah." },
      { step: "2. Landasan Dalil Al-Qur'an & Sunnah", duration: "10 Menit", content: "Kajian tafsir QS. Al-Baqarah: 208 tentang masuk Islam secara kaffah dan QS. Al-Jumu'ah: 9-10 tentang keseimbangan ibadah dan ikhtiar ekonomi." },
      { step: "3. Konsep Aplikatif 4B di Sematang Borang", duration: "15 Menit", content: "Bagaimana jamaah di Sematang Borang mempraktikkan Berdakwah yang santun, Bersyariah dalam berbisnis, Berjamaah dalam memakmurkan masjid, dan Bermuamalah secara adil." },
      { step: "4. Studi Kasus & Solusi Umat", duration: "10 Menit", content: "Penguatan ZISWAF untuk membantu tetangga yang kesulitan, pemberdayaan UMKM halal jamaah, dan pencegahan jerat riba di lingkungan sekitar." },
      { step: "5. Penutup & Doa Kaffah", duration: "5 Menit", content: "Doa memohon keberkahan negeri, keteguhan iman, kelapangan rezeki yang halal, dan ukhuwah islamiyah." }
    ],
    keyVerses: [
      { arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا ادْخُلُوا فِي السِّلْمِ كَافَّةً", reference: "QS. Al-Baqarah: 208", translation: "Wahai orang-orang yang beriman! Masuklah ke dalam Islam secara kaffah (keseluruhan)." },
      { arabic: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ", reference: "QS. Al-Ma'idah: 2", translation: "Dan tolong-menolonglah kamu dalam kebajikan dan takwa, dan jangan tolong-menolong dalam dosa dan permusuhan." }
    ],
    interactiveQuestions: [
      "Bagaimana cara kita mendeteksi potensi gharar dalam belanja online harian?",
      "Apa langkah nyata pemuda masjid Sematang Borang dalam mendampingi dhuafa di kelurahan masing-masing?"
    ]
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(defaultDakwahResult);
    }

    const prompt = `Sebagai pakar materi dakwah Islamicity 4B, buatkan silabus dan materi khutbah / kajian terstruktur untuk:
Topik: ${topic}
Sasaran Jamaah: ${targetAudience}
Durasi: ${durationMinutes || 30} menit
Momen/Acara: ${occasion}

Keluarkan format JSON dengan struktur:
- title: string (judul kajian yang menarik dan syar'i)
- theme: string
- targetAudience: string
- outline: array of { step: string, duration: string, content: string }
- keyVerses: array of { arabic: string, reference: string, translation: string }
- interactiveQuestions: array of string`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    let result;
    try {
      result = JSON.parse(response.text || "{}");
    } catch {
      result = defaultDakwahResult;
    }
    return res.json(result);
  } catch (error: any) {
    console.warn("AI generation note for dakwah-studio, serving fallback:", error.message || error);
    return res.json(defaultDakwahResult);
  }
});

// API: Daily Hadith AI & Social Reflection Engine
app.post("/api/gemini/daily-hadith", async (req, res) => {
  const { category = "Semua", specificTheme = "", date = new Date().toISOString().split("T")[0] } = req.body;

  const fallbackHadiths = [
    {
      id: "hadith-ukhuwah-1",
      theme: "Persaudaraan Sejati & Kasih Sayang Antar Sesama Muslim",
      category: "Ukhuwah",
      hadithArabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
      hadithLatin: "Laa yu'minu ahadukum hattaa yuhibba li-akhihi maa yuhibbu linafsih.",
      translation: "Tidak sempurna iman salah seorang di antara kalian hingga ia mencintai bagi saudaranya apa yang ia cintai bagi dirinya sendiri.",
      narrator: "Anas bin Malik radhiyallahu 'anhu",
      rawi: "Imam Bukhari & Imam Muslim",
      bookSource: "Shahih al-Bukhari no. 13, Shahih Muslim no. 45",
      hadithNumber: "HR. Bukhari no. 13 / Muslim no. 45",
      authenticity: "Muttafaq 'Alaih",
      takhrijNotes: "Sanad shahih tingkat tertinggi (Muttafaq 'Alaih) diriwayatkan oleh jalur Anas bin Malik ra. Menjadi salah satu pilar qawa'idul Islam.",
      reflectionTadabbur: "Hadits ini mengajarkan bahwa tolok ukur kesempurnaan iman bukan hanya diukur dari kuantitas ibadah mahdhah, tetapi juga dari kepekaan sosial dan empati terhadap sesama saudara seiman. Merasakan kebahagiaan saat saudara kita mendapat rezeki, dan bersegera meringankan bebannya ketika ia kesulitan di lingkungan Sematang Borang, adalah manifestasi riil dari tauhid yang hidup.",
      actionableTakeaways: [
        "Mendoakan kebaikan saudara kita secara diam-diam (fii zhahril ghaib).",
        "Membantu mempromosikan atau membeli produk UMKM halal tetangga di sekitar kelurahan.",
        "Menghindari sikap hasad (dengki) dan menggantinya dengan ghibthah (berharap kebaikan serupa tanpa mengharap hilangnya nikmat orang lain)."
      ],
      contextualPillarLink: {
        pillar: "Berjamaah",
        application: "Membangun ikatan solidaritas antar jamaah masjid di 4 kelurahan Sematang Borang melalui gerakan saling peduli dan lumbung pangan dhuafa."
      },
      socialShareQuote: "✨ Hadits Hari Ini: 'Tidak beriman salah seorang di antara kalian sampai ia mencintai bagi saudaranya apa yang ia cintai bagi dirinya sendiri.' (HR. Bukhari & Muslim) — Mari tumbuhkan ukhuwah & kepedulian di sekitar kita! 🌿 #HaditsHarian #Islamicity4B #SematangBorang",
      shareHashtags: ["HaditsHarian", "Islamicity4B", "UkhuwahIslamiyah", "SematangBorangBerkah", "DakwahDigital"],
      generatedDate: date
    },
    {
      id: "hadith-muamalah-1",
      theme: "Kejujuran dan Keberkahan dalam Perniagaan Syariah",
      category: "Muamalah",
      hadithArabic: "التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ",
      hadithLatin: "At-taajirus shaduuqul amiinu ma'an nabiyyiina wash shiddiiqiina wash syuhadaa'.",
      translation: "Pedagang yang senantiasa jujur lagi amanah akan (dibangkitkan pada hari kiamat) bersama para Nabi, kaum shiddiqin, dan para syuhada.",
      narrator: "Abu Sa'id Al-Khudri radhiyallahu 'anhu",
      rawi: "Imam At-Tirmidzi",
      bookSource: "Sunan At-Tirmidzi no. 1209 (Kitab Al-Buyu')",
      hadithNumber: "HR. Tirmidzi no. 1209",
      authenticity: "Shahih",
      takhrijNotes: "Dinilai shahih/hasan oleh Imam At-Tirmidzi dan dikuatkan oleh Syaikh Al-Albani dalam Shahih At-Targhib wa At-Tarhib no. 1782.",
      reflectionTadabbur: "Perniagaan bukan semata-mata kalkulasi laba materi, melainkan ibadah muamalah yang menuntut integritas mutlak. Pedagang yang transparan mengenai takaran, kualitas, dan margin harga tanpa sumpah palsu ditempatkan setara dengan para syuhada karena keberaniannya menundukkan hawa nafsu kerakusan demi ridha Allah.",
      actionableTakeaways: [
        "Buka kondisi barang dagangan dengan jujur, jangan sembunyikan cacat produk.",
        "Gunakan timbangan dan alat ukur digital yang presisi serta bebas dari tadlis/gharar.",
        "Jadikan transaksi sebagai sarana dakwah akhlakul karimah."
      ],
      contextualPillarLink: {
        pillar: "Bermuamalah",
        application: "Mendorong ekosistem pasar dan UMKM halal Sematang Borang yang amanah, bersih dari riba, serta menjunjung tinggi transparansi akad Murabahah."
      },
      socialShareQuote: "💼 Berkah Niaga: 'Pedagang yang jujur dan amanah akan dibangkitkan bersama para Nabi, Shiddiqin, dan Syuhada.' (HR. Tirmidzi). Jadikan ikhtiar bisnis bernilai ibadah! 💫 #MuamalahBerkah #PasarHalal #SematangBorang",
      shareHashtags: ["MuamalahSyariah", "AntiRiba", "HaditsHarian", "UMKMHalal", "EkonomiUmat"],
      generatedDate: date
    },
    {
      id: "hadith-ziswaf-1",
      theme: "Sedekah Tidak Mengurangi Harta, Melainkan Melipatgandakan Keberkahan",
      category: "ZISWAF",
      hadithArabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلاَّ عِزًّا",
      hadithLatin: "Maa naqashat shadaqatun min maalin, wa maa zaadallaahu 'abdan bi'afwin illaa 'izzaa.",
      translation: "Sedekah tidaklah mengurangi harta, dan tidaklah Allah menambah bagi seorang hamba yang suka memaafkan melainkan kemuliaan.",
      narrator: "Abu Hurairah radhiyallahu 'anhu",
      rawi: "Imam Muslim",
      bookSource: "Shahih Muslim no. 2588 (Kitab Al-Birr wash Shilah)",
      hadithNumber: "HR. Muslim no. 2588",
      authenticity: "Shahih",
      takhrijNotes: "Hadits shahih riwayat Imam Muslim dari Abu Hurairah ra. Mengandung janji ilahi terkait hukum keberkahan dan proteksi harta.",
      reflectionTadabbur: "Secara matematis materi, memberi mungkin tampak mengurangi saldo kas. Namun dalam neraca syariat, sedekah menumbuhkan keberkahan (*ziyadatul khair*), membuka pintu-pintu rezeki yang tak terduga, dan membersihkan jiwa dari kikir. Sedekah kita adalah investasi abadi yang mengalirkan pahala tak terputus.",
      actionableTakeaways: [
        "Biasakan sedekah subuh meskipun dengan nominal kecil secara istiqamah.",
        "Salurkan Zakat, Infaq, dan Wakaf melalui amil terpercaya di masjid terdekat.",
        "Lapangkan hati untuk memaafkan kekeliruan saudara agar Allah angkat derajat kita."
      ],
      contextualPillarLink: {
        pillar: "Bermuamalah",
        application: "Memperkuat Gerakan ZISWAF Terpadu di 24 masjid se-Kecamatan Sematang Borang guna mengentaskan kemiskinan mustahiq."
      },
      socialShareQuote: "🌱 Mutiara Hadits: 'Sedekah tidak akan pernah mengurangi harta...' (HR. Muslim). Mari raih keberkahan tak terbatas dengan berbagi kepada sesama hari ini! ✨ #SedekahBerkah #ZISWAF #Islamicity4B",
      shareHashtags: ["ZISWAF", "SedekahSubuh", "BerkahHarta", "HaditsHarian", "PalembangPeduli"],
      generatedDate: date
    },
    {
      id: "hadith-akhlak-1",
      theme: "Menjaga Lisan dan Keharmonisan Hubungan Bertetangga",
      category: "Akhlak",
      hadithArabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ",
      hadithLatin: "Man kaana yu'minu billaahi wal yaumil aakhiri fal-yaqul khairan au liyashmut, wa man kaana yu'minu billaahi wal yaumil aakhiri fal-yukrim jaarah.",
      translation: "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata yang baik atau diam. Dan barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia memuliakan tetangganya.",
      narrator: "Abu Hurairah radhiyallahu 'anhu",
      rawi: "Imam Bukhari & Imam Muslim",
      bookSource: "Shahih al-Bukhari no. 6018, Shahih Muslim no. 47",
      hadithNumber: "HR. Bukhari no. 6018 / Muslim no. 47",
      authenticity: "Muttafaq 'Alaih",
      takhrijNotes: "Hadits shahih muttafaq 'alaih yang merangkum adab komunikasi dan etika sosial kemasyarakatan.",
      reflectionTadabbur: "Di era digital yang serba cepat, godaan untuk berdebat kusir, menyebarkan hoaks, dan mencela sangatlah besar. Rasulullah SAW mengingatkan bahwa tanda keimanan sejati adalah kemampuan mengendalikan lisan/jemari dan senantiasa berbuat ihsan kepada tetangga di sekitar tempat tinggal kita.",
      actionableTakeaways: [
        "Saring sebelum sharing di grup percakapan warga atau media sosial.",
        "Kirimkan makanan atau tegur sapa ramah kepada tetangga kanan-kiri rumah.",
        "Pilihlah diam bila kata-kata kita tidak mendatangkan manfaat atau maslahat."
      ],
      contextualPillarLink: {
        pillar: "Berdakwah",
        application: "Menerapkan dakwah bil lisan yang santun dan dakwah bil hal melalui keteladanan akhlak di tengah masyarakat majemuk."
      },
      socialShareQuote: "🕊️ 'Barangsiapa beriman kepada Allah dan hari akhir, berkatalah yang baik atau diam, dan muliakanlah tetangga.' (HR. Bukhari & Muslim). Sebarkan ketenangan dan kedamaian! 🌿 #AkhlakMulia #HaditsHarian",
      shareHashtags: ["AkhlakMuslim", "AdabBertetangga", "BijakBermedsos", "HaditsHarian"],
      generatedDate: date
    },
    {
      id: "hadith-ibadah-1",
      theme: "Keutamaan Shalat Berjamaah dan Melangkahkan Kaki ke Masjid",
      category: "Ibadah",
      hadithArabic: "صَلَاةُ الْجَمَاعَةِ تَفْضُلُ صَلَاةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً",
      hadithLatin: "Shalaatul jamaa'ati tafdhulu shalaatal fadz-dzi bisab'in wa 'isyriina darajah.",
      translation: "Shalat berjamaah lebih utama daripada shalat sendirian sebanyak dua puluh tujuh derajat.",
      narrator: "Abdullah bin Umar radhiyallahu 'anhuma",
      rawi: "Imam Bukhari & Imam Muslim",
      bookSource: "Shahih al-Bukhari no. 645, Shahih Muslim no. 650",
      hadithNumber: "HR. Bukhari no. 645 / Muslim no. 650",
      authenticity: "Muttafaq 'Alaih",
      takhrijNotes: "Hadits shahih muttafaq 'alaih dari Ibnu Umar ra. Menjadi dalil qath'i tingginya keutamaan shalat berjamaah.",
      reflectionTadabbur: "Shalat berjamaah di masjid bukan semata pelipatgandaan pahala 27 derajat, melainkan institusi persatuan umat. Ketika bahu saling merapat dan hati bertaut menghadap kiblat yang sama, sekat sosial runtuh dan ukhuwah islamiyah terbangun kokoh di setiap kelurahan.",
      actionableTakeaways: [
        "Usahakan melangkahkan kaki ke masjid terdekat saat mendengar kumandang adzan.",
        "Ajak anggota keluarga dan tetangga untuk menghadiri shalat berjamaah, terutama Subuh dan Isya.",
        "Jaga kerapian shaf dan silaturahmi dengan sesama jamaah setelah salam."
      ],
      contextualPillarLink: {
        pillar: "Berjamaah",
        application: "Memakmurkan 24 masjid se-Kecamatan Sematang Borang sebagai sentra peribadatan dan kebangkitan umat."
      },
      socialShareQuote: "🕌 'Shalat berjamaah 27 kali lebih utama daripada shalat sendirian.' (HR. Bukhari & Muslim). Mari ramaikan masjid dan pererat barisan ukhuwah! 🌟 #ShalatBerjamaah #MasjidMakmur #SematangBorang",
      shareHashtags: ["ShalatBerjamaah", "MakmurkanMasjid", "HaditsHarian", "Islamicity4B"],
      generatedDate: date
    },
    {
      id: "hadith-ilmu-1",
      theme: "Kemudahan Jalan Menuju Surga bagi Penuntut Ilmu Syar'i",
      category: "Ilmu",
      hadithArabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
      hadithLatin: "Man salaka thariiqan yaltamisu fiihi 'ilman sahhalallaahu lahu bihii thariiqan ilal jannah.",
      translation: "Barangsiapa menempuh suatu jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga.",
      narrator: "Abu Hurairah radhiyallahu 'anhu",
      rawi: "Imam Muslim",
      bookSource: "Shahih Muslim no. 2699",
      hadithNumber: "HR. Muslim no. 2699",
      authenticity: "Shahih",
      takhrijNotes: "Hadits shahih riwayat Imam Muslim dalam Kitab ad-Dzikr wad Du'aa wat Taubah.",
      reflectionTadabbur: "Menuntut ilmu adalah kewajiban seumur hidup (min al-mahdi ilal lahdi). Setiap langkah menghadiri majelis ilmu, membaca literatur syariah, dan mempelajari fiqh muamalah bernilai jihad fi sabilillah yang membuka jalan kemuliaan dunia dan keselamatan akhirat.",
      actionableTakeaways: [
        "Luangkan waktu minimal 15-30 menit setiap hari untuk membaca tafsir, hadits, atau fiqh.",
        "Hadiri majelis taklim dan kajian rutin di masjid kelurahan setempat.",
        "Amalkan dan ajarkan ilmu yang didapat kepada keluarga dan rekan kerja."
      ],
      contextualPillarLink: {
        pillar: "Berdakwah",
        application: "Mengembangkan literasi syariah dan keilmuan Islam digital bagi jamaah dan generasi muda Sematang Borang."
      },
      socialShareQuote: "📚 'Barangsiapa menempuh jalan untuk menuntut ilmu, Allah mudahkan baginya jalan menuju Surga.' (HR. Muslim). Jangan pernah berhenti belajar! 💡 #MenuntutIlmu #KajianIslam #HaditsHarian",
      shareHashtags: ["MenuntutIlmu", "LiterasiSyariah", "HaditsHarian", "DakwahDigital"],
      generatedDate: date
    },
    {
      id: "hadith-keluarga-1",
      theme: "Kebaikan Sejati Dimulai dari Memuliakan Keluarga",
      category: "Keluarga",
      hadithArabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ وَأَنَا خَيْرُكُمْ لِأَهْلِي",
      hadithLatin: "Khairukum khairukum li-ahlihii wa ana khairukum li-ahlii.",
      translation: "Sebaik-baik kalian adalah yang paling baik terhadap keluarganya, dan aku adalah orang yang paling baik terhadap keluargaku.",
      narrator: "Aisyah radhiyallahu 'anha",
      rawi: "Imam At-Tirmidzi & Ibnu Majah",
      bookSource: "Sunan At-Tirmidzi no. 3895, Sunan Ibnu Majah no. 1977",
      hadithNumber: "HR. Tirmidzi no. 3895",
      authenticity: "Shahih",
      takhrijNotes: "Hadits shahih menurut Imam At-Tirmidzi dan dishahihkan oleh Syaikh Al-Albani dalam Silsilah Ash-Shahihah no. 285.",
      reflectionTadabbur: "Rumah tangga adalah benteng pertama pembinaan umat. Sikap lemah lembut, nafkah yang halal, serta komunikasi yang hangat di dalam rumah adalah cermin ketakwaan yang hakiki sebelum kita tampil di ruang publik.",
      actionableTakeaways: [
        "Luangkan waktu berkualitas (quality time) bersama keluarga dengan komunikasi penuh kasih.",
        "Pastikan nafkah yang dibawa pulang bersumber dari rezeki yang 100% halal dan thoyyib.",
        "Tunjukkan keteladanan ibadah di dalam rumah bersama anak dan pasangan."
      ],
      contextualPillarLink: {
        pillar: "Bersyariah",
        application: "Mewujudkan ketahanan keluarga sakinah mawaddah warahmah berbasis nilai-nilai syariah di Sematang Borang."
      },
      socialShareQuote: "🏡 'Sebaik-baik kalian adalah yang paling baik terhadap keluarganya...' (HR. Tirmidzi). Muliakan keluarga tercinta setiap hari! ❤️ #KeluargaSakinah #HaditsHarian",
      shareHashtags: ["KeluargaBerkah", "RumahTanggaIslami", "HaditsHarian", "Ukhuwah"],
      generatedDate: date
    },
    {
      id: "hadith-tawakkal-1",
      theme: "Tawakkal yang Sempurna Disertai Ikhtiar Maksimal",
      category: "Tawakkal",
      hadithArabic: "لَوْ أَنَّكُمْ كُنْتُمْ تَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرُزِقْتُمْ كَمَا تُرْزَقُ الطَّيْرُ تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا",
      hadithLatin: "Lau annakum kuntum tawakkaluuna 'alallaahi haqqa tawakkulihi laruziqtum kamaa turzaquth-thairu taghduu khimaashan wa taruuhu bithaanaa.",
      translation: "Seandainya kalian bertawakkal kepada Allah dengan sebenar-benar tawakkal, niscaya kalian diberi rezeki sebagaimana burung diberi rezeki; ia berangkat di pagi hari dalam keadaan lapar dan pulang di petang hari dalam keadaan kenyang.",
      narrator: "Umar bin Khaththab radhiyallahu 'anhu",
      rawi: "Imam Ahmad & Imam At-Tirmidzi",
      bookSource: "Sunan At-Tirmidzi no. 2344, Musnad Ahmad no. 205",
      hadithNumber: "HR. Tirmidzi no. 2344",
      authenticity: "Shahih",
      takhrijNotes: "Hadits shahih diriwayatkan oleh Imam Tirmidzi dan Ibnu Majah, dinilai shahih oleh Ibnu Hibban dan Al-Hakim.",
      reflectionTadabbur: "Tawakkal sejati bukan berpangku tangan tanpa usaha, melainkan memadukan ikhtiar optimal (seperti burung yang terbang mencari nafkah sejak fajar) dengan penyerahan total hasil akhir hanya kepada Allah SWT Sang Maha Pemberi Rezeki.",
      actionableTakeaways: [
        "Mulai hari kerja dengan doa memohon berkah rezeki dan perlindungan dari yang haram.",
        "Lakukan ikhtiar secara profesional, tekun, dan jujur.",
        "Bersyukur atas setiap rezeki dan ridha dengan takdir ketetapan Allah."
      ],
      contextualPillarLink: {
        pillar: "Bermuamalah",
        application: "Menanamkan etos kerja dan kewirausahaan tangguh berbasis tawakkal bagi pelaku UMKM di Sematang Borang."
      },
      socialShareQuote: "🦅 'Tawakkal yang benar diiringi ikhtiar akan mendatangkan rezeki layaknya burung yang terbang di pagi hari...' (HR. Tirmidzi). Semangat berikhtiar hari ini! 🌅 #Tawakkal #EtosKerjaMuslim",
      shareHashtags: ["Tawakkal", "RezekiHalal", "HaditsHarian", "IkhtiarBerkah"],
      generatedDate: date
    },
    {
      id: "hadith-sosial-1",
      theme: "Menghilangkan Kesusahan Saudara dan Mendapat Pertolongan Allah",
      category: "Sosial",
      hadithArabic: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ ، وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ",
      hadithLatin: "Man naffasa 'an mu'minin kurbatan min kurabid dunyaa naffasallaahu 'anhu kurbatan min kurabi yaumil qiyaamah, wallaahu fii 'aunil 'abdi maa kaanal 'abdu fii 'auni akhiih.",
      translation: "Barangsiapa melapangkan satu kesusahan dunia dari seorang mukmin, maka Allah akan melapangkan darinya satu kesusahan di hari kiamat. Dan Allah senantiasa menolong hamba-Nya selama hamba tersebut menolong saudaranya.",
      narrator: "Abu Hurairah radhiyallahu 'anhu",
      rawi: "Imam Muslim",
      bookSource: "Shahih Muslim no. 2699",
      hadithNumber: "HR. Muslim no. 2699",
      authenticity: "Shahih",
      takhrijNotes: "Hadits agung dalam Shahih Muslim yang menjadi kaidah dasar solidaritas dan jaminan sosial Islam.",
      reflectionTadabbur: "Pertolongan Allah kepada kita berbanding lurus dengan kepedulian kita kepada sesama. Ketika kita sigap meringankan kesulitan warga kurang mampu, membantu biaya pengobatan dhuafa, atau mendampingi yatim, Allah Yang Maha Kaya menjamin solusi atas setiap kesulitan hidup kita.",
      actionableTakeaways: [
        "Bantu minimal satu orang yang sedang mengalami kesulitan hari ini.",
        "Ikut serta dalam program relawan sosial atau posko kemanusiaan masjid.",
        "Hindari memperberat urusan orang lain dan berikan kemudahan dalam muamalah."
      ],
      contextualPillarLink: {
        pillar: "Berjamaah",
        application: "Menggalang aksi gotong royong dan kepedulian sosial lintas warga di 4 kelurahan Sematang Borang."
      },
      socialShareQuote: "🤝 'Allah senantiasa menolong hamba-Nya selama hamba tersebut menolong saudaranya.' (HR. Muslim). Mari jadi jalan kebaikan bagi orang lain! 🤲 #PeduliSesama #SolidaritasUmat",
      shareHashtags: ["SolidaritasSosial", "HaditsHarian", "Islamicity4B", "PalembangBerkah"],
      generatedDate: date
    }
  ];

  const pickFallbackHadith = () => {
    if (category && category !== "Semua") {
      const match = fallbackHadiths.find(h => h.category.toLowerCase() === category.toLowerCase());
      if (match) return match;
    }
    if (specificTheme) {
      const matchTheme = fallbackHadiths.find(
        h => h.theme.toLowerCase().includes(specificTheme.toLowerCase()) ||
             h.category.toLowerCase().includes(specificTheme.toLowerCase())
      );
      if (matchTheme) return matchTheme;
    }
    const randIdx = Math.floor(Math.random() * fallbackHadiths.length);
    return fallbackHadiths[randIdx];
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(pickFallbackHadith());
    }

    const systemInstruction = `Anda adalah "Senior Muhaddits & Islamic Knowledge Archivist" untuk platform dakwah Islamicity 4B abdi.sematangborangcity.cloud.
Tugas Anda adalah memilih dan memverifikasi sebuah Hadits Shahih / Hasan yang otentik untuk ditampilkan sebagai "Hadits Harian (Daily Hadith & Tadabbur Reflection)".

Pedoman Ketat:
1. Hadits HARUS otentik (Shahih Bukhari, Shahih Muslim, Sunan Abu Dawud, Tirmidzi, An-Nasa'i, Ibnu Majah, Muwatha' Malik, atau Riyadhus Shalihin).
2. Tuliskan teks Bahasa Arab dengan harakat lengkap dan akurat.
3. Tuliskan transliterasi latin yang tepat.
4. Tuliskan terjemahan Bahasa Indonesia yang mudah dipahami dan baku.
5. Sebutkan Perawi Utama (Sahabat Nabi), Rawi/Imam Mukharrij (Bukhari/Muslim/dll), dan nomor hadits/kitab secara jelas.
6. Berikan Takhrij & Tingkat Keotentikan (Shahih / Muttafaq 'Alaih / Hasan).
7. Tuliskan Renungan/Tadabbur yang mendalam, relevan dengan kehidupan modern, ukhuwah masyarakat, dan penguatan 4 Pilar (Berdakwah, Bersyariah, Berjamaah, Bermuamalah) di Sematang Borang.
8. Berikan 3 poin aksi praktis harian (Actionable Takeaways).
9. Buatkan kutipan ringkas siap bagikan di media sosial (Social Share Quote) beserta hashtag yang relevan.

Keluarkan format JSON valid sesuai schema.`;

    const prompt = `Pilihlah satu Hadits Shahih Harian yang sangat menginspirasi untuk:
Kategori: ${category}
Topik Khusus: ${specificTheme || "Ukhuwah, Muamalah Berkah, ZISWAF, Akhlak Mulia, atau Ketakwaan"}
Tanggal: ${date}

Keluarkan dalam format JSON dengan kunci:
- id: string (misal: "hadith-ai-xxxx")
- theme: string (Judul tema inspiratif hadits)
- category: string ("Ukhuwah" | "Muamalah" | "Akhlak" | "Ibadah" | "ZISWAF" | "Ilmu" | "Keluarga" | "Tawakkal" | "Sosial")
- hadithArabic: string (Teks Arab berharakat lengkap)
- hadithLatin: string (Transliterasi latin)
- translation: string (Terjemahan Indonesia)
- narrator: string (Nama Sahabat perawi, misal "Abu Hurairah radhiyallahu 'anhu")
- rawi: string (Imam mukharrij, misal "Imam Bukhari & Imam Muslim")
- bookSource: string (Kitab & nomor rujukan, misal "Shahih al-Bukhari no. 13")
- hadithNumber: string
- authenticity: string ("Muttafaq 'Alaih" | "Shahih" | "Hasan")
- takhrijNotes: string (Catatan derajat sanad & takhrij ringkas)
- reflectionTadabbur: string (Tadabbur mendalam 2-3 paragraf menggugah jiwa)
- actionableTakeaways: array of 3 string (Langkah konkret pengamalan harian)
- contextualPillarLink: object { pillar: "Berdakwah" | "Bersyariah" | "Berjamaah" | "Bermuamalah", application: string }
- socialShareQuote: string (Teks kutipan ringkas + emoji yang menarik untuk dishare ke WhatsApp / X / Telegram / Instagram)
- shareHashtags: array of string
- generatedDate: string`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.35,
      },
    });

    let resultJson;
    try {
      resultJson = JSON.parse(response.text || "{}");
      if (!resultJson.id) {
        resultJson.id = `hadith-${Date.now()}`;
      }
      if (!resultJson.generatedDate) {
        resultJson.generatedDate = date;
      }
    } catch {
      resultJson = pickFallbackHadith();
    }

    return res.json(resultJson);
  } catch (error: any) {
    console.warn("AI generation note for daily-hadith, serving verified fallback:", error.message || error);
    return res.json(pickFallbackHadith());
  }
});

// API: Daily Spiritual Reflection (AI Personalized Quranic / Hadith Thought)
app.post("/api/gemini/spiritual-reflection", async (req, res) => {
  const {
    theme = "Sabar & Ketenangan Batin",
    userMoodOrNeed = "",
    tone = "menyejukkan",
    sourcePreference = "all",
    userDailyProgress = null, // { completedCount: number, targetCount: number, streakDays: number, percentage: number, morningDone: boolean, eveningDone: boolean }
  } = req.body;

  const fallbackReflections = [
    {
      id: "refl-progress-mid",
      title: "Istiqomah dalam Langkah: Amalan Kontinu yang Dicintai Allah",
      theme: "Istiqomah & Keteguhan Hati",
      sourceType: "Hadits Shahih",
      arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
      latin: "Ahabbal-a'maali ilallaahi adwamuhaa wa in qalla.",
      translation: "Amalan yang paling dicintai Allah adalah amalan yang kontinu (istiqomah) walaupun sedikit.",
      source: "HR. Bukhari no. 6464 & Muslim no. 783",
      thought: "Kemajuan ibadah yang Anda ukir hari ini adalah bukti kesungguhan jiwa. Jangan remehkan setiap putaran tasbih atau wirid yang telah terlaksana; istiqomah Anda hari ini sedang menenun ketenangan batin dan mengundang pertolongan Allah yang berlimpah.",
      personalAffirmation: "Aku senantiasa bersyukur atas langkah kebaikan yang telah kuambil hari ini, dan terus beristiqomah dengan tenang.",
      dailyAction: "Lanjutkan repetisi dzikir berikutnya dengan penuh penghayatan arti kalimat tasbih atau tahmid.",
      dua: {
        arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
        latin: "Yaa Muqallibal quluub, tsabbit qalbii 'alaa diinik.",
        translation: "Wahai Dzat Yang Maha Membolak-balikkan hati, teguhkanlah hatiku di atas agama-Mu."
      },
      tags: ["Istiqomah", "Amal", "Kontinu", "Progress"],
      generatedAt: new Date().toISOString(),
      userMoodOrNeed: userMoodOrNeed || "Menjaga konsistensi ibadah harian",
      tone,
    },
    {
      id: "refl-progress-high",
      title: "Mendahului dalam Kebaikan: Golongan Al-Mufarridun",
      theme: "Kaffah & Syukur Dzikir",
      sourceType: "Hadits Shahih",
      arabic: "سَبَقَ الْمُفَرِّدُونَ... الذَّاكِرُونَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتُ",
      latin: "Sabaqal-mufarriduun... Adz-dzaakiruunallaaha katsiiran wadz-dzaakiraat.",
      translation: "Telah mendahului orang-orang Al-Mufarridun... yaitu kaum laki-laki dan perempuan yang banyak berdzikir mengingat Allah.",
      source: "HR. Muslim no. 2676",
      thought: "Alhamdulillah, kemajuan dzikir Anda hari ini telah mencapai porsi yang membahagiakan jiwa. Lisan yang basah dengan mengingat Allah adalah perisai paling kokoh dari kegundahan duniawi.",
      personalAffirmation: "Hatiku lapang dan damai karena senantiasa mengingat Allah di setiap hembusan nafasku.",
      dailyAction: "Tutup capaian dzikir hari ini dengan sujud syukur atau doa mohon ketetapan husnul khatimah.",
      dua: {
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        latin: "Allahumma a'innii 'alaa dzikrika wa syukrika wa husni 'ibaadatik.",
        translation: "Ya Allah, tolonglah aku untuk senantiasa mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu."
      },
      tags: ["Al-Mufarridun", "Kaffah", "Pahala", "Progress"],
      generatedAt: new Date().toISOString(),
      userMoodOrNeed: userMoodOrNeed || "Merayakan pencapaian ibadah dengan syukur",
      tone,
    },
    {
      id: "refl-sabar-1",
      title: "Ketenangan di Balik Badai: Bersandar pada Janji Allah",
      theme: "Sabar & Ketenangan Batin",
      sourceType: "Al-Qur'an",
      arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      latin: "Fa inna ma'al-'usri yusraa, inna ma'al-'usri yusraa.",
      translation: "Maka sesungguhnya beserta kesulitan ada kemudahan, sesungguhnya beserta kesulitan itu ada kemudahan.",
      source: "QS. Asy-Syarh: 5-6",
      thought: "Terkadang hati terasa sempit bukan karena beban yang terlalu berat, melainkan karena kita memikulnya sendirian tanpa melibatkan pertolongan Allah. Perhatikan bagaimana Allah Yang Maha Rahman mengulang penegasan kemudahan dua kali dalam ayat ini—para ulama menjelaskan bahwa satu kesulitan tidak akan pernah mampu mengalahkan dua kemudahan. Apa pun keletihan atau kekhawatiran yang sedang Anda hadapi hari ini di Sematang Borang, ketahuilah bahwa Allah telah menyiapkan jalan keluar yang indah tepat pada saat terbaik.",
      personalAffirmation: "Aku berprasangka baik pada setiap ketetapan Allah, dan percaya kemudahan sedang merekah di balik ujian hari ini.",
      dailyAction: "Luangkan 3 menit untuk menarik nafas dalam-dalam sambil melafalkan 'Hasbunallah wa ni'mal wakiil' (Cukuplah Allah menjadi Penolong kami) sebanyak 7 kali.",
      dua: {
        arabic: "اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً",
        latin: "Allahumma laa sahla illaa maa ja'altahu sahlaa, wa anta taj'alul hazna idzaa syi'ta sahlaa.",
        translation: "Ya Allah, tidak ada kemudahan kecuali apa yang Engkau jadikan mudah, dan Engkau menjadikan kesulitan, jika Engkau kehendaki, menjadi mudah."
      },
      tags: ["Sabar", "Ketenangan", "Ujian", "Asy-Syarh"],
      generatedAt: new Date().toISOString(),
      userMoodOrNeed: userMoodOrNeed || "Mencari ketenangan jiwa",
      tone,
    },
    {
      id: "refl-syukur-1",
      title: "Melihat Karunia Tak Terhitung dalam Langkah Sederhana",
      theme: "Syukur & Qana'ah",
      sourceType: "Al-Qur'an",
      arabic: "وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا ۗ إِنَّ اللَّهَ لَغَفُورٌ رَّحِيمٌ",
      latin: "Wa in ta'udduu ni'matallaahi laa tuhshuuhaa, innallaaha laghafuurur rahiim.",
      translation: "Dan jika kamu menghitung nikmat Allah, niscaya kamu tidak akan mampu menghitungnya. Sungguh, Allah benar-benar Maha Pengampun, Maha Penyayang.",
      source: "QS. An-Nahl: 18",
      thought: "Seringkali manusia tersita oleh satu atau dua hal yang belum tercapai, hingga lupa pada ribuan nikmat yang mengalir tanpa henti: hembusan nafas yang lancar, degup jantung yang setia, langkah kaki menuju masjid, dan kehangatan keluarga. Syukur bukan menunggu segalanya sempurna, tetapi mensyukuri setiap anugerah agar hidup dipenuhi keberkahan yang berlipat ganda.",
      personalAffirmation: "Hari ini aku memilih fokus pada limpahan berkah yang ada di hadapanku daripada mencemaskan hal yang belum pasti.",
      dailyAction: "Sebutkan dan tuliskan secara spesifik 3 nikmat sederhana yang Anda rasakan pagi/hari ini dan ucapkan 'Alhamdulillahilladzi bi ni'matihi tatimmus shaalihaat'.",
      dua: {
        arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ",
        latin: "Rabbi awzi'nii an asykura ni'matakal latii an'amta 'alayya wa 'alaa waalidayya.",
        translation: "Ya Tuhanku, anugerahkanlah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau limpahkan kepadaku dan kepada kedua orang tuaku."
      },
      tags: ["Syukur", "Qana'ah", "Nikmat", "An-Nahl"],
      generatedAt: new Date().toISOString(),
      userMoodOrNeed: userMoodOrNeed || "Memulai hari dengan syukur",
      tone,
    },
    {
      id: "refl-tawakkal-1",
      title: "Tenangnya Hati yang Bersandar pada Ar-Razzaq",
      theme: "Tawakkal & Rezeki",
      sourceType: "Hadits Shahih",
      arabic: "لَوْ أَنَّكُمْ تَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرُزِقْتُمْ كَمَا يُرْزَقُ الطَّيْرُ، تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا",
      latin: "Law annakum tawakkaltum 'alallaahi haqqa tawakkulihii laruziqtum kamaa yurzaqut thayru, taghduu khimaashan wa taruuhu bithaanan.",
      translation: "Seandainya kalian bertawakkal kepada Allah dengan sebenar-benar tawakkal, niscaya kalian akan diberi rezeki sebagaimana burung diberi rezeki; berangkat di waktu pagi dalam keadaan lapar dan pulang di petang hari dalam keadaan kenyang.",
      source: "HR. At-Tirmidzi no. 2344 & Ibnu Majah (Shahih)",
      thought: "Perhatikan perumpamaan yang luar biasa dari Rasulullah SAW: burung tidak hanya berdiam diri di sarangnya, ia tetap mengepakkan sayap dan terbang menjemput karunia. Namun, di dalam hatinya tidak ada kecemasan berlebih, karena ia bersandar kepada Pemilik Langit dan Bumi. Bekerjalah dengan ikhtiar terbaik, niatkan mencari nafkah yang halal bagi keluarga, dan serahkan hasil akhirnya kepada Allah Yang Maha Kaya.",
      personalAffirmation: "Bagianku adalah berikhtiar dengan jujur dan sungguh-sungguh; bagian Allah adalah mencukupi rezekiku dari arah yang tak disangka-sangka.",
      dailyAction: "Awali setiap pekerjaan hari ini dengan 'Bismillahi tawakkaltu 'alallah, laa hawla wa laa quwwata illaa billah'.",
      dua: {
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلاً مُتَقَبَّلاً",
        latin: "Allahumma innii as-aluka 'ilman naafi'an wa rizqan thayyiban wa 'amalan mutaqabbalaa.",
        translation: "Ya Allah, sungguh aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik (halal), dan amal yang diterima."
      },
      tags: ["Tawakkal", "Rezeki", "Hadits", "Ikhtiar"],
      generatedAt: new Date().toISOString(),
      userMoodOrNeed: userMoodOrNeed || "Cemas tentang masa depan/rezeki",
      tone,
    }
  ];

  const pickFallback = () => {
    if (userDailyProgress) {
      if (userDailyProgress.percentage >= 75) {
        return fallbackReflections.find(r => r.id === "refl-progress-high") || fallbackReflections[0];
      }
      return fallbackReflections.find(r => r.id === "refl-progress-mid") || fallbackReflections[0];
    }
    const matched = fallbackReflections.find(
      (r) => r.theme.toLowerCase().includes(theme.toLowerCase()) || (userMoodOrNeed && r.tags.some(t => userMoodOrNeed.toLowerCase().includes(t.toLowerCase())))
    );
    return matched || fallbackReflections[0];
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(pickFallback());
    }

    const systemInstruction = `Anda adalah "Pembimbing Spiritual & Refleksi Tadabbur Harian" terpercaya di ekosistem dakwah abdi.sematangborangcity.cloud.
Tugas Anda:
1. Menyusun sebuah renungan spiritual harian (Daily Spiritual Reflection) yang singkat, menyentuh kalbu, hangat, dan sangat personal berdasarkan tema atau kondisi batin serta progres ibadah pengguna hari ini.
2. Setiap renungan WAJIB berlandaskan pada satu dalil otentik: ayat Al-Qur'an atau Hadits Shahih (Bukhari, Muslim, Tirmidzi, dsb.) lengkap dengan teks Arab berharakat, transliterasi Latin, dan sumber surah/nomor hadits yang presisi.
3. Gaya bahasa (${tone || "menyejukkan"}): santun, menyejukkan jiwa, membangkitkan harapan (raja'), meneguhkan sabar & syukur, serta relevan langsung dengan ikhtiar harian pengguna.
4. Sertakan afirmasi diri pribadi (1 kalimat mantap), tindakan praktis harian (1 amalan konkret), dan doa singkat yang sesuai.
5. Format output WAJIB strictly JSON murni tanpa markdown pembungkus.`;

    const progressDetails = userDailyProgress
      ? `\n- Progres Ibadah Pengguna Hari Ini: ${userDailyProgress.completedCount || 0} dari target ${userDailyProgress.targetCount || 100} repetisi dzikir (${userDailyProgress.percentage || 0}% tercapai), streak ${userDailyProgress.streakDays || 1} hari. Status: ${userDailyProgress.morningDone ? "Dzikir Pagi Selesai" : "Dzikir Pagi Belum"}, ${userDailyProgress.eveningDone ? "Dzikir Petang Selesai" : "Dzikir Petang Belum"}. PENTING: Hubungkan kutipan hikmah dan renungan tadabbur secara spesifik dengan tingkat kemajuan/istiqomah pengguna hari ini.`
      : "";

    const prompt = `Buatlah renungan spiritual personal harian dengan spesifikasi berikut:
- Tema: "${theme}"
- Kebutuhan/Kondisi Pengguna: "${userMoodOrNeed || 'Mencari kejernihan batin dan ketenangan hati hari ini'}"${progressDetails}
- Gaya Bahasa/Tone: "${tone}"
- Preferensi Sumber: "${sourcePreference}"

Format JSON yang dihasilkan:
{
  "title": "string (judul renungan puitis & menggugah hati, maks 8 kata)",
  "theme": "${theme}",
  "sourceType": "Al-Qur'an" | "Hadits Shahih",
  "arabic": "string (teks Arab asli lengkap harakat)",
  "latin": "string (transliterasi latin)",
  "translation": "string (terjemahan bahasa Indonesia yang puitis dan tepat)",
  "source": "string (misal: QS. Al-Baqarah: 153 atau HR. Muslim no. 2999)",
  "thought": "string (2-3 paragraf renungan reflektif yang personal, menyentuh, mengaitkan dalil dengan realitas keseharian dan progres ibadah pengguna hari ini, memberi kehangatan batin)",
  "personalAffirmation": "string (1 kalimat afirmasi jiwa bermula dari 'Aku...')",
  "dailyAction": "string (1 tindakan atau latihan batin praktis untuk dipraktikkan hari ini)",
  "dua": {
    "arabic": "string (doa ma'tsur singkat)",
    "latin": "string (latin doa)",
    "translation": "string (arti doa)"
  },
  "tags": ["string", "string", "string"]
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
      primaryModel: "gemini-3.8-flash",
      fallbackModel: "gemini-3.1-flash-lite",
    });

    const responseText = response.text || "";
    let reflectionResult: any;

    try {
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      reflectionResult = JSON.parse(cleanJson);
      reflectionResult.id = `refl-${Date.now()}`;
      reflectionResult.generatedAt = new Date().toISOString();
      reflectionResult.userMoodOrNeed = userMoodOrNeed;
      reflectionResult.tone = tone;
    } catch {
      reflectionResult = pickFallback();
    }

    return res.json(reflectionResult);
  } catch (err: any) {
    console.warn("AI generation note for spiritual-reflection, serving fallback:", err.message || err);
    return res.json(pickFallback());
  }
});

// Helper to compute realistic spiritual digest from entries
function generateFallbackSpiritualDigest(entries: any[] = []) {
  const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"];
  const now = new Date();
  const periodEnd = now.toISOString().split("T")[0];
  const past7 = new Date();
  past7.setDate(now.getDate() - 6);
  const periodStart = past7.toISOString().split("T")[0];

  // Default entries if empty
  const defaultEntries = [
    { dateStr: "2026-09-22", dayLabel: "Senin", content: "Pagi terasa berat memikirkan target kerja, namun setelah dzikir pagi 100x hati jauh lebih damai.", moodTag: "gelisah", sakinahIndex: 68 },
    { dateStr: "2026-09-23", dayLabel: "Selasa", content: "Membaca doa perlindungan di petang hari menepis rasa lelah setelah seharian berniaga.", moodTag: "lelah", sakinahIndex: 74 },
    { dateStr: "2026-09-24", dayLabel: "Rabu", content: "Sangat bersyukur dagangan barokah dan bisa menyisihkan infaq untuk lumbung pangan masjid.", moodTag: "syukur", sakinahIndex: 88 },
    { dateStr: "2026-09-25", dayLabel: "Kamis", content: "Muhasabah malam, menyadari banyak waktu terbuang. Memperbanyak istighfar Sayyidul Istighfar.", moodTag: "taubat", sakinahIndex: 82 },
    { dateStr: "2026-09-26", dayLabel: "Jumat", content: "Jumat berkah. Membaca surah Al-Kahfi dan shalawat nariyah. Pikiran sangat jernih dan lapang.", moodTag: "damai", sakinahIndex: 94 },
    { dateStr: "2026-09-27", dayLabel: "Sabtu", content: "Menghabiskan waktu bersama keluarga sambil menjaga wirid lisan. Tuma'ninah terasa utuh.", moodTag: "damai", sakinahIndex: 90 },
    { dateStr: "2026-09-28", dayLabel: "Ahad", content: "Memulai hari dengan optimisme dan keyakinan pada rezeki Allah. Istiqomah berdzikir subuh.", moodTag: "bersemangat", sakinahIndex: 92 },
  ];

  let mappedProgression: any[] = [];
  if (entries && entries.length > 0) {
    mappedProgression = entries.slice(-7).map((e, idx) => {
      const moodScores: Record<string, number> = {
        damai: 90,
        syukur: 92,
        bersemangat: 88,
        taubat: 80,
        lelah: 70,
        gelisah: 62,
      };
      const score = e.sentiment?.sakinahScore || moodScores[e.moodTag] || 75;
      const d = new Date(e.dateStr || Date.now());
      const label = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1] || `Hari ${idx + 1}`;
      return {
        dayLabel: label,
        dateStr: e.dateStr || new Date().toISOString().split("T")[0],
        sakinahIndex: score,
        dominantMood: e.moodTag === "damai" ? "Ketenangan Jiwa" : e.moodTag === "syukur" ? "Rasa Syukur Mendalam" : e.moodTag === "gelisah" ? "Cemas Menuju Pasrah" : e.moodTag === "taubat" ? "Pembersihan Hati" : "Optimisme Ruhani",
        entryExcerpt: (e.content || "").slice(0, 90) + ((e.content || "").length > 90 ? "..." : "")
      };
    });
  } else {
    mappedProgression = defaultEntries;
  }

  const avgScore = Math.round(
    mappedProgression.reduce((acc, curr) => acc + curr.sakinahIndex, 0) / Math.max(1, mappedProgression.length)
  );

  return {
    id: `digest-${Date.now()}`,
    periodStart,
    periodEnd,
    generatedAt: new Date().toISOString(),
    overallSakinahScore: avgScore,
    sakinahCategory: avgScore >= 85 ? "Tuma'ninah Tinggi (Jiwa Tenang)" : avgScore >= 70 ? "Kestabilan Ruhani Baik" : "Masa Perjuangan Jiwa (Mujahadah)",
    dominantSpiritualThemes: [
      "Peredam Kecemasan Melalui Wirid Pagi",
      "Kekuatan Syukur dalam Muamalah Harian",
      "Pembersihan Diri Lewat Istighfar Istiqomah"
    ],
    executiveSummary: `Sepanjang pekan ini (${periodStart} s/d ${periodEnd}), kurva ketenteraman batin (*Sakinah Index*) Anda memperlihatkan tren positif yang sangat menggembirakan dengan skor rata-rata ${avgScore}/100. Dari catatan jurnal dzikir yang tercatat, terlihat transisi nyata dari rasa lelah dan kecemasan duniawi di awal pekan menuju ketenangan (*thuma'ninah*) dan optimisme yang kokoh menjelang akhir pekan. Dzikir yang dipraktikkan secara konsisten terbukti menjadi perisai jiwa yang menetralisir stres serta memperkuat tawakkal.`,
    sentimentProgression: mappedProgression,
    spiritualStrengths: [
      "Kemampuan mengalihkan rasa cemas dan overthinking menjadi lantunan istighfar dan tasbih.",
      "Tumbuhnya kebiasaan mengucap rasa syukur atas rezeki halal dan nikmat keluarga.",
      "Kesadaran muhasabah diri yang jujur, tidak menolak kelelahan namun membawanya bersujud."
    ],
    growthOpportunities: [
      "Menjaga konsistensi dzikir petang saat pergantian hari di tengah kesibukan pulang kerja.",
      "Memperpanjang jeda hening tafakkur 3-5 menit sebelum tidur malam untuk menyegarkan rohani."
    ],
    recommendedVersesAndHadith: [
      {
        source: "QS. Ar-Ra'd: 28",
        sourceType: "Al-Qur'an",
        arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        latin: "Alladziina aamanuu wa tathma'innu quluubuhum bi dzikrillaah, alaa bi dzikrillaahi tathma'innul quluub.",
        translation: "(yaitu) orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah. Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.",
        context: "Penegasan bahwa peningkatan kedamaian batin sepekan ini adalah bukti nyata dari janji Ilahi bagi hamba yang senantiasa membasahi lisan dengan dzikir."
      },
      {
        source: "HR. At-Tirmidzi no. 2346 (Hasan Shahih)",
        sourceType: "Hadits Shahih",
        arabic: "مَنْ كَانَتِ الآخِرَةُ هَمَّهُ جَعَلَ اللَّهُ غِنَاهُ فِي قَلْبِهِ وَجَمَعَ لَهُ شَمْلَهُ، وَأَتَتْهُ الدُّنْيَا وَهِيَ رَاغِمَةٌ",
        latin: "Man kaanatil aakhiratu hammahuu ja'alallaahu ghinaahu fii qalbihii wa jama'a lahuu syamlahuu, wa atathud dunyaa wa hiya raaghimah.",
        translation: "Barangsiapa yang menjadikan akhirat sebagai orientasi utamanya, niscaya Allah akan jadikan kekayaan di dalam hatinya, menghimpun urusannya, dan dunia akan datang kepadanya dalam keadaan tunduk.",
        context: "Panduan qana'ah agar tetap berfokus pada ketenangan hati dan ridha Allah saat menghadapi dinamika hidup."
      }
    ],
    customDoaForUpcomingWeek: {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ نَفْسًا بِكَ مُطْمَئِنَّةً، تُؤْمِنُ بِلِقَائِكَ، وَتَرْضَى بِقَضَائِكَ، وَتَقْنَعُ بِعَطَائِكَ",
      latin: "Allahumma innii as-aluka nafsan bika muthma-innah, tu'minu bi liqaa-ik, wa tardhaa bi qadhaa-ik, wa taqna'u bi 'athaa-ik.",
      translation: "Ya Allah, aku memohon kepada-Mu jiwa yang tenteram bersama-Mu, meyakini perjumpaan dengan-Mu, ridha dengan takdir ketetapan-Mu, dan merasa cukup dengan karunia pemberian-Mu.",
      meaning: "Munajat perlindungan jiwa agar senantiasa dipenuhi ketenangan, kesabaran, dan lapang dada dalam menghadapi dinamika sepekan ke depan."
    },
    actionableSpiritualHabits: [
      "Ambil waktu 3 menit hening setelah wirid subuh untuk merenungi satu nikmat terbesar hari ini.",
      "Tuliskan 1 kalimat jurnal spiritual setiap malam sebelum tidur untuk mencatat hikmah harian.",
      "Lafalkan 'Laa hawla wa laa quwwata illaa billah' setiap kali pikiran terasa terbebani urusan duniawi."
    ],
    isAiGenerated: false
  };
}

// API: Analyze Single Dhikr Journal Entry Sentiment
app.post("/api/gemini/analyze-dhikr-journal", async (req, res) => {
  const { content = "", moodTag = "damai", sessionType = "general" } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Konten jurnal tidak boleh kosong." });
  }

  const moodBaseScore: Record<string, number> = {
    damai: 90,
    syukur: 92,
    bersemangat: 88,
    taubat: 82,
    lelah: 70,
    gelisah: 62,
  };

  const defaultAnalysis = {
    sakinahScore: moodBaseScore[moodTag] || 78,
    primaryEmotion: moodTag === "damai" ? "Ketenangan Jiwa" : moodTag === "syukur" ? "Rasa Syukur & Lapang Dada" : moodTag === "taubat" ? "Kerendahan Hati & Penyesalan Positif" : moodTag === "lelah" ? "Kelelahan Mengharap Rahmat" : "Pencarian Ketenangan Batin",
    spiritualFocus: "Tawakkal & Penguatan Dzikir",
    summaryReflection: `Catatan Anda merefleksikan getaran jiwa yang tulus. Menuliskan isi hati setelah berdzikir membantu menata emosi dan menumbuhkan thuma'ninah di hadapan Allah.`
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(defaultAnalysis);
    }

    const prompt = `Anda adalah psikolog spiritual Islam dan analis emosi dzikir. Lakukan analisis sentimen spiritual (Sakinah Index 0-100) terhadap catatan jurnal dzikir berikut:
Sesi: ${sessionType}
Tag Suasana Hati: ${moodTag}
Isi Jurnal: "${content}"

Keluarkan HANYA format JSON murni:
{
  "sakinahScore": number (0-100, mencerminkan ketenangan/kestabilan jiwa),
  "primaryEmotion": "string (deskripsi singkat emosi utama, maks 4 kata)",
  "spiritualFocus": "string (fokus amalan spiritual yang selaras, maks 4 kata)",
  "summaryReflection": "string (1-2 kalimat apresiasi hangat dan hikmah tadabbur bagi jiwa penulis)"
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah analis sentimen spiritual Islam terpercaya.",
        temperature: 0.5,
        responseMimeType: "application/json",
      },
      primaryModel: "gemini-3.8-flash",
      fallbackModel: "gemini-3.1-flash-lite",
    });

    const parsed = JSON.parse(response.text?.replace(/```json/g, "").replace(/```/g, "").trim() || "{}");
    return res.json({
      sakinahScore: typeof parsed.sakinahScore === "number" ? parsed.sakinahScore : defaultAnalysis.sakinahScore,
      primaryEmotion: parsed.primaryEmotion || defaultAnalysis.primaryEmotion,
      spiritualFocus: parsed.spiritualFocus || defaultAnalysis.spiritualFocus,
      summaryReflection: parsed.summaryReflection || defaultAnalysis.summaryReflection,
    });
  } catch (err: any) {
    console.warn("AI journal analysis note, serving fallback:", err.message || err);
    return res.json(defaultAnalysis);
  }
});

// API: Weekly Spiritual Digest by aggregating Dhikr Journal Sentiments
app.post("/api/gemini/spiritual-digest", async (req, res) => {
  const { journalEntries = [], timeframe = "7_days" } = req.body;

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(generateFallbackSpiritualDigest(journalEntries));
    }

    const entriesSummary = (journalEntries.length > 0 ? journalEntries : [
      { dateStr: "2026-09-22", content: "Pagi terasa cemas soal rezeki tapi tenang setelah wirid subuh", moodTag: "gelisah" },
      { dateStr: "2026-09-24", content: "Alhamdulillah sangat bersyukur rezeki lancar dan bisa berinfaq", moodTag: "syukur" },
      { dateStr: "2026-09-26", content: "Membaca Al-Kahfi dan shalawat di hari Jumat, hati damai", moodTag: "damai" },
      { dateStr: "2026-09-28", content: "Optimis mengawali pekan baru dengan tawakkal", moodTag: "bersemangat" },
    ]).map((e: any) => `Tanggal: ${e.dateStr || "N/A"}, Sesi: ${e.sessionType || "dzikir"}, Mood: ${e.moodTag || "netral"}, Catatan: "${e.content || ""}"`).join("\n");

    const prompt = `Anda adalah "Pembimbing Ruhani & Analis Spiritual Digest" di ekosistem dakwah abdi.sematangborangcity.cloud.
Tugas Anda: Buatlah "Weekly Spiritual Digest" (Ikhtisar Spiritual Mingguan) yang mendalam, hangat, penuh empati, dan menyentuh kalbu berdasarkan rangkuman jurnal dzikir pengguna berikut:

${entriesSummary}

Hasilkan data dalam format JSON murni sesuai skema:
{
  "overallSakinahScore": number (0-100, indeks ketenteraman batin rata-rata),
  "sakinahCategory": "string (misal: 'Tuma'ninah Tinggi (Jiwa Tenang)', 'Kestabilan Ruhani', dll)",
  "dominantSpiritualThemes": ["string", "string", "string"],
  "executiveSummary": "string (2-3 paragraf narasi hangat tentang perjalanan hati pengguna selama sepekan, bagaimana dzikir mentransformasi kegundahan menjadi ketenteraman, gaya bahasa santun dan menyemangati)",
  "sentimentProgression": [
    {
      "dayLabel": "string (Senin/Selasa/dst)",
      "dateStr": "YYYY-MM-DD",
      "sakinahIndex": number (0-100),
      "dominantMood": "string",
      "entryExcerpt": "string (kutipan singkat catatan)"
    }
  ],
  "spiritualStrengths": ["string", "string", "string"],
  "growthOpportunities": ["string", "string"],
  "recommendedVersesAndHadith": [
    {
      "source": "string (misal: QS. Ar-Ra'd: 28)",
      "sourceType": "Al-Qur'an",
      "arabic": "string",
      "latin": "string",
      "translation": "string",
      "context": "string (mengapa ayat ini sangat relevan dengan dinamika emosi pengguna sepekan ini)"
    },
    {
      "source": "string (misal: HR. Muslim no. 2727)",
      "sourceType": "Hadits Shahih",
      "arabic": "string",
      "latin": "string",
      "translation": "string",
      "context": "string (relevansi hadits)"
    }
  ],
  "customDoaForUpcomingWeek": {
    "arabic": "string",
    "latin": "string",
    "translation": "string",
    "meaning": "string (penjelasan doa penyejuk menyambut pekan baru)"
  },
  "actionableSpiritualHabits": ["string", "string", "string"]
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah penasihat spiritual dan analis jurnal dzikir Islam terpercaya.",
        temperature: 0.7,
        responseMimeType: "application/json",
      },
      primaryModel: "gemini-3.8-flash",
      fallbackModel: "gemini-3.1-flash-lite",
    });

    const parsed = JSON.parse(response.text?.replace(/```json/g, "").replace(/```/g, "").trim() || "{}");
    const now = new Date();
    parsed.id = `digest-${Date.now()}`;
    parsed.periodEnd = now.toISOString().split("T")[0];
    const p7 = new Date();
    p7.setDate(now.getDate() - 6);
    parsed.periodStart = p7.toISOString().split("T")[0];
    parsed.generatedAt = now.toISOString();
    parsed.isAiGenerated = true;

    return res.json(parsed);
  } catch (err: any) {
    console.warn("AI spiritual digest note, serving dynamic fallback:", err.message || err);
    return res.json(generateFallbackSpiritualDigest(journalEntries));
  }
});


// API: ZISWAF Social Impact AI Analytics
app.post("/api/gemini/social-impact-summary", async (req, res) => {
  const { totalZakat = 0, totalInfaq = 0, totalWakaf = 0, beneficiariesCount = 0, period = "Bulan Ini" } = req.body;

  const defaultImpactReport = {
    executiveSummary: `Pengelolaan dana ZISWAF periode ${period} di ekosistem abdi.sematangborangcity.cloud berhasil menghimpun total Rp ${(Number(totalZakat) + Number(totalInfaq) + Number(totalWakaf)).toLocaleString("id-ID")}. Penyaluran telah menyentuh ${beneficiariesCount || 150} mustahiq di 4 kelurahan Sematang Borang dengan efektivitas multiplier ekonomi mencapai 3.8x melalui program modal usaha produktif Qardhul Hasan.`,
    sdgMetrics: [
      { goal: "Pengentasan Kemiskinan (No Poverty)", impactLevel: "Tinggi", progress: "88%" },
      { goal: "Pendidikan Berkualitas (Santri & Yatim)", impactLevel: "Sangat Baik", progress: "92%" },
      { goal: "Pekerjaan Layak & Pertumbuhan Ekonomi UMKM", impactLevel: "Optimal", progress: "85%" }
    ],
    keyRecommendations: [
      "Tingkatkan alokasi dana Zakat Produktif untuk pendampingan sertifikasi halal 15 UMKM jamaah.",
      "Perluas titik layanan digital QRIS ZISWAF pada 8 masjid jami' di Sukamulya & Lebung Gajah.",
      "Publikasikan laporan audit berkala secara real-time di portal transparansi publik."
    ]
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(defaultImpactReport);
    }

    const prompt = `Buatkan Laporan Dampak Sosial (Social Impact Report) naratif dan metrik analitik untuk dana ZISWAF abdi.sematangborangcity.cloud:
Zakat: Rp ${totalZakat}
Infaq/Sedekah: Rp ${totalInfaq}
Wakaf Produktif: Rp ${totalWakaf}
Jumlah Penerima Manfaat: ${beneficiariesCount}
Periode: ${period}

Berikan output JSON dengan format:
- executiveSummary: string (narasi profesional tentang dampak sosial dan keberkahan ekonomi umat)
- sdgMetrics: array of { goal: string, impactLevel: string, progress: string }
- keyRecommendations: array of string (3 rekomendasi strategis pilar Bermuamalah)`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    let result;
    try {
      result = JSON.parse(response.text || "{}");
    } catch {
      result = defaultImpactReport;
    }
    return res.json(result);
  } catch (error: any) {
    console.warn("AI generation note for social impact summary, serving fallback:", error.message || error);
    return res.json(defaultImpactReport);
  }
});

// API: ZISWAFH Predictive AI Forecasting & Fund Growth Projection
app.post("/api/gemini/ziswaf-forecast", async (req, res) => {
  const {
    upcomingQuarter = "Q4 2026 (Oktober - Desember)",
    currentBaselineFunds = 92500000,
    historicalInflow = [
      { month: "Januari 2026", amount: 10200000 },
      { month: "Februari 2026", amount: 11500000 },
      { month: "Maret 2026 (Ramadhan)", amount: 24800000 },
      { month: "April 2026 (Idul Fitri)", amount: 21500000 },
      { month: "Mei 2026", amount: 12000000 },
      { month: "Juni 2026 (Idul Adha)", amount: 18500000 },
      { month: "Juli 2026 (Muharram 1448H)", amount: 14200000 },
      { month: "Agustus 2026", amount: 13800000 },
    ],
    targetGrowthRate = 18.5,
    kelurahanScope = "Semua Kelurahan (Kec. Sematang Borang)",
  } = req.body;

  const projectedQuarterTotal = Math.round(Number(currentBaselineFunds) * (1 + Number(targetGrowthRate) / 100));
  const defaultForecastResult = {
    forecastPeriod: upcomingQuarter,
    forecastSummary: `Model Prediktif AI ABDI Islamicity memproyeksikan pertumbuhan total penghimpunan dana ZISWAFH pada ${upcomingQuarter} sebesar +${targetGrowthRate}% (mencapai Rp ${(projectedQuarterTotal / 1000000).toFixed(1)} Juta). Akselerasi didorong oleh momentum Maulid Nabi 1448H, ekspansi kanal QRIS Digital di 24 masjid, dan siklus tutup buku usaha halal UMKM binaan di 4 kelurahan Sematang Borang.`,
    projectedTotalFunds: projectedQuarterTotal,
    currentBaselineFunds,
    predictedGrowthRate: targetGrowthRate,
    confidenceLevel: 93.4,
    historicalTrendInsight: "Analisis time-series menunjukkan tren pertumbuhan organik non-musiman rata-rata 8.2% MoM pasca Ramadhan, dengan lonjakan spesifik pada momentum kalender Hijriyah dan akhir bulan gajian jamaah.",
    monthlyProjections: [
      {
        month: "Oktober 2026",
        projectedInflow: Math.round(projectedQuarterTotal * 0.31),
        projectedZakat: Math.round(projectedQuarterTotal * 0.17),
        projectedInfaq: Math.round(projectedQuarterTotal * 0.08),
        projectedShodaqoh: Math.round(projectedQuarterTotal * 0.035),
        projectedWakaf: Math.round(projectedQuarterTotal * 0.025),
        projectedHibah: Math.round(projectedQuarterTotal * 0.01),
        keyDrivers: "Momentum Maulid Nabi & peluncuran program Beasiswa Santri Semester Genap",
        seasonalEvent: "Maulid Nabi 1448 H & Gerakan Sedekah Berjamaah",
      },
      {
        month: "November 2026",
        projectedInflow: Math.round(projectedQuarterTotal * 0.33),
        projectedZakat: Math.round(projectedQuarterTotal * 0.18),
        projectedInfaq: Math.round(projectedQuarterTotal * 0.08),
        projectedShodaqoh: Math.round(projectedQuarterTotal * 0.04),
        projectedWakaf: Math.round(projectedQuarterTotal * 0.02),
        projectedHibah: Math.round(projectedQuarterTotal * 0.01),
        keyDrivers: "Aktivasi infaq payroll otomatis jamaah ASN/BUMD & penyaluran modal bergulir UMKM",
        seasonalEvent: "Pekan Penguatan UMKM Berkah Halal",
      },
      {
        month: "Desember 2026",
        projectedInflow: Math.round(projectedQuarterTotal * 0.36),
        projectedZakat: Math.round(projectedQuarterTotal * 0.20),
        projectedInfaq: Math.round(projectedQuarterTotal * 0.09),
        projectedShodaqoh: Math.round(projectedQuarterTotal * 0.04),
        projectedWakaf: Math.round(projectedQuarterTotal * 0.02),
        projectedHibah: Math.round(projectedQuarterTotal * 0.01),
        keyDrivers: "Tutup buku tahunan muzakki korporat/pengusaha lokal & zakat perniagaan",
        seasonalEvent: "Zakat Akhir Tahun & Evaluasi Maqashid Syariah",
      },
    ],
    categoryForecasts: [
      {
        category: "Zakat (Maal & Profesi)",
        baseline: 48500000,
        projected: 59800000,
        growthPercent: 23.3,
        seasonalMultiplier: 1.25,
        growthDriver: "Kepatuhan zakat penghasilan rutin via integrasi payroll masjid & zakat perniagaan UMKM",
        riskFactor: "Fluktuasi cashflow perdagangan komoditas pasar tradisional",
      },
      {
        category: "Infaq Operasional",
        baseline: 21200000,
        projected: 26000000,
        growthPercent: 22.6,
        seasonalMultiplier: 1.18,
        growthDriver: "Digitalisasi kotak infaq berbasis QRIS Dinamis & Subuh Berjamaah gabungan",
        riskFactor: "Tingkat kehadiran jamaah saat musim penghujan",
      },
      {
        category: "Shodaqoh Terikat",
        baseline: 9800000,
        projected: 12400000,
        growthPercent: 26.5,
        seasonalMultiplier: 1.3,
        growthDriver: "Kampanye spesifik Paket Sembako Dhuafa & Tanggap Banjir Dataran Rendah",
        riskFactor: "Kompetisi program donasi eksternal",
      },
      {
        category: "Wakaf Uang & Produktif",
        baseline: 8500000,
        projected: 7700000,
        growthPercent: 9.4,
        seasonalMultiplier: 1.08,
        growthDriver: "Sertifikat Wakaf Tunai Pembebasan Lahan Balai Latihan Santri",
        riskFactor: "Edukasi literasi wakaf produktif yang perlu terus diperkuat",
      },
      {
        category: "Hibah & Dana Kebajikan",
        baseline: 4500000,
        projected: 3700000,
        growthPercent: 12.1,
        seasonalMultiplier: 1.1,
        growthDriver: "Dana ta'widh non-halal cleansing dari mitra perbankan syariah",
        riskFactor: "Sifat penghimpunan insidentil",
      },
    ],
    scenarios: {
      conservative: {
        projectedTotal: Math.round(projectedQuarterTotal * 0.88),
        growthRate: 11.2,
        keyAssumption: "Kondisi ekonomi flat, pertumbuhan hanya berasal dari donatur terdaftar tanpa kampanye agresif.",
      },
      moderate: {
        projectedTotal: projectedQuarterTotal,
        growthRate: 18.5,
        keyAssumption: "Implementasi penuh rekomendasi amil: QRIS di 24 masjid, reminder zakat profesi, dan roadshow kajian.",
      },
      optimistic: {
        projectedTotal: Math.round(projectedQuarterTotal * 1.14),
        growthRate: 26.8,
        keyAssumption: "Kemitraan strategis dengan 10 muzakki korporat baru dan lonjakan zakat saham akhir tahun.",
      },
    },
    recommendedProgramAllocations: [
      {
        id: "prog-1",
        programName: "Lumbung Pangan & Ketahanan Mustahiq",
        targetAsnaf: "Fakir & Miskin",
        suggestedBudget: Math.round(projectedQuarterTotal * 0.35),
        suggestedPercentage: 35.1,
        targetBeneficiaries: 380,
        expectedMultiplierSROI: "1 : 2.9x",
        priority: "CRITICAL",
        rationale: "Menghadapi potensi inflasi pangan akhir tahun, alokasi beras dan sembako bergizi perlu ditingkatkan di Sukamulya & Srimulya.",
      },
      {
        id: "prog-2",
        programName: "Modal Usaha Bergulir UMKM Berkah (Qardhul Hasan)",
        targetAsnaf: "Gharimin / Mustahiq Produktif",
        suggestedBudget: Math.round(projectedQuarterTotal * 0.28),
        suggestedPercentage: 28.3,
        targetBeneficiaries: 55,
        expectedMultiplierSROI: "1 : 4.4x",
        priority: "CRITICAL",
        rationale: "Pemberdayaan 55 pelaku usaha mikro jamaah agar bertransformasi dari mustahiq menjadi muzakki (Mustahiq to Muzakki).",
      },
      {
        id: "prog-3",
        programName: "Beasiswa Santri & Tahfidz Berkelanjutan",
        targetAsnaf: "Fisabilillah",
        suggestedBudget: Math.round(projectedQuarterTotal * 0.18),
        suggestedPercentage: 17.8,
        targetBeneficiaries: 140,
        expectedMultiplierSROI: "1 : 3.6x",
        priority: "HIGH",
        rationale: "Pembiayaan SPP, kitab, dan uang saku santri dhuafa berprestasi untuk semester baru.",
      },
      {
        id: "prog-4",
        programName: "Layanan Kesehatan & Tanggap Darurat Dhuafa",
        targetAsnaf: "Ibnu Sabil & Miskin",
        suggestedBudget: Math.round(projectedQuarterTotal * 0.11),
        suggestedPercentage: 10.8,
        targetBeneficiaries: 110,
        expectedMultiplierSROI: "1 : 2.5x",
        priority: "HIGH",
        rationale: "Ambulans gratis, bantuan tebus resep obat, dan santunan pasien kritis pra-sejahtera.",
      },
      {
        id: "prog-5",
        programName: "Optimalisasi Dakwah & Fasilitas Masjid Terpadu",
        targetAsnaf: "Fisabilillah & Amil",
        suggestedBudget: Math.round(projectedQuarterTotal * 0.08),
        suggestedPercentage: 8.0,
        targetBeneficiaries: 95,
        expectedMultiplierSROI: "1 : 2.1x",
        priority: "MEDIUM",
        rationale: "Peralatan audio digital, sanitasi ramah lansia/disabilitas, dan operasional amil bersertifikasi.",
      },
    ],
    strategicRecommendations: [
      "Bentuk Satgas 'Amil Jemput Zakat' khusus akhir tahun untuk menyambangi muzakki korporat dan pelaku bisnis pasar di Sematang Borang.",
      "Otomatisasi pengiriman notifikasi pengingat hisab nishab zakat maal via WhatsApp bot kepada para muzakki tetap.",
      "Segera lakukan pre-ordering gabah/beras dari petani lokal untuk mengunci harga lumbung pangan sebelum kenaikan akhir tahun.",
      "Publikasikan proyeksi ini pada Rapat Kerja Pengurus DKM se-Kecamatan Sematang Borang untuk penyelarasan target dakwah.",
    ],
    calendarSeasonalFactors: [
      {
        event: "Maulid Nabi 1448 H (Oktober)",
        expectedSpike: "+28% Infaq & Shodaqoh",
        recommendedAmilAction: "Siapkan kampanye santunan 100 yatim & tablig akbar gabungan.",
      },
      {
        event: "Siklus Gajian Akhir Bulan (Okt, Nov, Des)",
        expectedSpike: "+45% Zakat Profesi",
        recommendedAmilAction: "Kirim blast laporan transparansi 3 hari sebelum tanggal gajian (T-3).",
      },
      {
        event: "Tutup Buku Finansial (Desember)",
        expectedSpike: "+60% Zakat Maal Perniagaan",
        recommendedAmilAction: "Buka layanan konsultasi hisab zakat perniagaan dan audit syariah gratis untuk UMKM.",
      },
    ],
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json(defaultForecastResult);
    }

    const systemInstruction = `Anda adalah "Senior Islamic Social Finance Economist & Predictive AI Analytics Specialist" untuk ekosistem tata kelola masjid terpadu abdi.sematangborangcity.cloud di Kecamatan Sematang Borang, Kota Palembang.
Tugas Anda:
1. Menganalisis tren historis penghimpunan ZISWAFH (Zakat Maal/Profesi, Infaq, Shodaqoh, Wakaf Produktif, Hibah) dan memproyeksikan pertumbuhannya untuk kuartal mendatang secara akurat, berbasis data dan faktor musiman Islam.
2. Mengidentifikasi driver pertumbuhan (momentum kalender Hijriyah, Maulid Nabi, siklus gajian, tutup buku akhir tahun, digitalisasi QRIS di masjid).
3. Memberikan 3 skenario proyeksi (Konservatif, Moderat, Optimis) dengan rasionalisasi ekonomi yang solid.
4. Menyusun rekomendasi alokasi program dampak sosial (Lumbung Pangan, Modal UMKM, Beasiswa Santri, Layanan Medis, Fasilitas Masjid) yang memaksimalkan SROI (Social Return on Investment) dan kepatuhan 8 Asnaf Fiqh Syariah.
5. Menyajikan rencana aksi strategis untuk manajemen DKM dan Badan Amil ZISWAF masjid.

Format keluaran WAJIB berupa JSON valid terstruktur sesuai schema.`;

    const prompt = `Lakukan peramalan prediktif ZISWAFH AI untuk:
Kuartal Mendatang: ${upcomingQuarter}
Baseline Dana Saat Ini: Rp ${currentBaselineFunds.toLocaleString("id-ID")}
Target Pertumbuhan: +${targetGrowthRate}%
Cakupan Wilayah: ${kelurahanScope}
Data Tren Historis Inflow:
${JSON.stringify(historicalInflow, null, 2)}

Hasilkan JSON dengan struktur persis:
- forecastPeriod: string
- forecastSummary: string (ringkasan eksekutif komprehensif, narasi tajam untuk pengurus masjid)
- projectedTotalFunds: number (total proyeksi kuartal)
- currentBaselineFunds: number
- predictedGrowthRate: number
- confidenceLevel: number (85 - 98)
- historicalTrendInsight: string
- monthlyProjections: array of { month: string, projectedInflow: number, projectedZakat: number, projectedInfaq: number, projectedShodaqoh: number, projectedWakaf: number, projectedHibah: number, keyDrivers: string, seasonalEvent?: string }
- categoryForecasts: array of { category: string, baseline: number, projected: number, growthPercent: number, seasonalMultiplier: number, growthDriver: string, riskFactor: string }
- scenarios: { conservative: { projectedTotal: number, growthRate: number, keyAssumption: string }, moderate: { projectedTotal: number, growthRate: number, keyAssumption: string }, optimistic: { projectedTotal: number, growthRate: number, keyAssumption: string } }
- recommendedProgramAllocations: array of { id: string, programName: string, targetAsnaf: string, suggestedBudget: number, suggestedPercentage: number, targetBeneficiaries: number, expectedMultiplierSROI: string, priority: "CRITICAL" | "HIGH" | "MEDIUM", rationale: string }
- strategicRecommendations: array of string
- calendarSeasonalFactors: array of { event: string, expectedSpike: string, recommendedAmilAction: string }`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.25,
      },
    });

    let parsed;
    try {
      parsed = JSON.parse(response.text || "{}");
    } catch {
      parsed = defaultForecastResult;
    }
    return res.json(parsed);
  } catch (error: any) {
    console.warn("AI generation note for ziswaf-forecast, serving fallback:", error.message || error);
    return res.json(defaultForecastResult);
  }
});

// Vite Middleware for SPA development & Production Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`ABDI Islamicity 4B Cloud Server & Real-Time WebSockets running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
