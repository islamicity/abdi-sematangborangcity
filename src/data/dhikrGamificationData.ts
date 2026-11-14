import { DhikrAchievementBadge, DhikrUserStats } from "../types";

export interface DhikrSpiritualLevel {
  level: number;
  title: string;
  subTitle: string;
  minPoints: number;
  maxPoints: number;
  iconName: string;
  quote: string;
  perks: string[];
}

export const DHIKR_SPIRITUAL_LEVELS: DhikrSpiritualLevel[] = [
  {
    level: 1,
    title: "Penuntut Kebaikan",
    subTitle: "Memulai langkah membersihkan hati dengan wirid harian",
    minPoints: 0,
    maxPoints: 99,
    iconName: "Sparkles",
    quote: "'Wahai orang-orang yang beriman! Ingatlah Allah dengan dzikir sebanyak-banyaknya.' (QS. Al-Ahzab: 41)",
    perks: ["Akses Tasbih Digital", "Panduan Dzikir Pagi & Petang", "Audio Lafal Dasar"],
  },
  {
    level: 2,
    title: "Ahli Dzikir Pemula",
    subTitle: "Lisan mulai terbiasa basah dengan kalimat thayyibah",
    minPoints: 100,
    maxPoints: 249,
    iconName: "Heart",
    quote: "'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.' (QS. Ar-Ra'd: 28)",
    perks: ["Badge Early Bird Unlocked", "Fitur Custom Target Harian", "Irama Audio Tartil"],
  },
  {
    level: 3,
    title: "Penjaga Fajar & Senja",
    subTitle: "Membentengi diri pada dua waktu utama pergantian siang dan malam",
    minPoints: 250,
    maxPoints: 499,
    iconName: "Sun",
    quote: "'Dan bertasbihlah memuji Tuhanmu sebelum terbit matahari dan sebelum terbenamnya.' (QS. Qaf: 39)",
    perks: ["Sertifikat Digital Lencana", "Prioritas Peringkat Jamaah", "Analisis Riwayat Dzikir"],
  },
  {
    level: 4,
    title: "Pembaca Istiqomah Tangguh",
    subTitle: "Ketetapan hati yang teguh menjaga wirid tanpa terlewat",
    minPoints: 500,
    maxPoints: 899,
    iconName: "Flame",
    quote: "'Amalan yang paling dicintai Allah adalah yang kontinu walaupun sedikit.' (HR. Bukhari & Muslim)",
    perks: ["Aura Emas Tasbih", "Lencana Singa Istiqomah", "Mode Fokus Hening Kaffah"],
  },
  {
    level: 5,
    title: "Golongan Al-Mufarridun",
    subTitle: "Derajat tertinggi orang-orang yang senantiasa berdzikir kepada Allah",
    minPoints: 900,
    maxPoints: 9999,
    iconName: "Trophy",
    quote: "'Telah mendahului orang-orang mufarridun... yaitu laki-laki dan perempuan yang banyak berdzikir mengingat Allah.' (HR. Muslim)",
    perks: ["Gelar Kehormatan DKM", "Lencana Berlian Abadi", "Inspirasi Utama Komunitas"],
  },
];

export const INITIAL_DHIKR_BADGES: Omit<DhikrAchievementBadge, "currentValue" | "isUnlocked" | "unlockedAt">[] = [
  {
    id: "badge-consistent-reader",
    code: "CON_READER_BRONZE",
    name: "Consistent Reader",
    indonesianTitle: "Pembaca Istiqomah",
    description: "Menjaga kebiasaan dzikir harian minimal 3 hari berturut-turut tanpa terputus.",
    category: "streak",
    tier: "bronze",
    iconName: "Flame",
    requirementDescription: "Capai minimal 3 hari berturut-turut streak dzikir harian.",
    targetValue: 3,
    unit: "Hari Streak",
    dalilReference: {
      arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
      translation: "Amalan yang paling dicintai Allah adalah amalan yang kontinu (istiqomah) walaupun sedikit.",
      source: "HR. Bukhari no. 6464 & Muslim no. 783",
    },
    rewardPoints: 50,
  },
  {
    id: "badge-early-bird",
    code: "EARLY_BIRD",
    name: "Early Bird",
    indonesianTitle: "Sahabat Fajar (Early Bird)",
    description: "Menuntaskan rangkaian Dzikir Pagi secara lengkap sebelum waktu Dzuhur tiba.",
    category: "discipline",
    tier: "bronze",
    iconName: "Sun",
    requirementDescription: "Selesaikan seluruh wirid Dzikir Pagi (fajar s/d dhuha).",
    targetValue: 1,
    unit: "Sesi Pagi Tuntas",
    dalilReference: {
      arabic: "اللَّهُمَّ بَارِكْ لأُمَّتِي فِي بُكُورِهَا",
      translation: "Ya Allah, berkahilah umatku di waktu pagi mereka.",
      source: "HR. Abu Dawud no. 2606 & At-Tirmidzi no. 1212",
    },
    rewardPoints: 40,
  },
  {
    id: "badge-twilight-guardian",
    code: "TWILIGHT_GUARDIAN",
    name: "Twilight Guardian",
    indonesianTitle: "Penjaga Senja As-Sunnah",
    description: "Menuntaskan seluruh rangkaian Dzikir Petang antara ba'da Ashar hingga menjelang Isya.",
    category: "discipline",
    tier: "bronze",
    iconName: "Moon",
    requirementDescription: "Selesaikan seluruh wirid Dzikir Petang (ashar s/d maghrib/isya).",
    targetValue: 1,
    unit: "Sesi Petang Tuntas",
    dalilReference: {
      arabic: "وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ الْغُرُوبِ",
      translation: "Dan bertasbihlah memuji Tuhanmu sebelum terbit matahari dan sebelum terbenamnya.",
      source: "QS. Qaf: 39",
    },
    rewardPoints: 40,
  },
  {
    id: "badge-consistent-reader-silver",
    code: "CON_READER_SILVER",
    name: "Devoted Consistent Reader",
    indonesianTitle: "Istiqomah Sepekan Barakah",
    description: "Mempertahankan istiqomah dzikir selama 7 hari berturut-turut tanpa putus.",
    category: "streak",
    tier: "silver",
    iconName: "Award",
    requirementDescription: "Capai minimal 7 hari streak berturut-turut.",
    targetValue: 7,
    unit: "Hari Streak",
    dalilReference: {
      arabic: "اسْتَقِيمُوا وَلَنْ تُحْصُوا",
      translation: "Beristiqamahlah kalian dan kalian tidak akan pernah mampu menghitung seluruh pahalanya.",
      source: "HR. Ibnu Majah no. 277 & Ahmad",
    },
    rewardPoints: 100,
  },
  {
    id: "badge-century-tasbih",
    code: "CENTURY_RECITER",
    name: "Century Tasbih",
    indonesianTitle: "Pengetuk Ratusan Tasbih",
    description: "Melafalkan minimal 100 repetisi tasbih atau dzikir dalam satu hari.",
    category: "volume",
    tier: "bronze",
    iconName: "Target",
    requirementDescription: "Capai minimal 100 repetisi tasbih dalam satu hari.",
    targetValue: 100,
    unit: "Repetisi Hari Ini",
    dalilReference: {
      arabic: "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ",
      translation: "Barangsiapa mengucapkan 'Subhanallah wa bihamdihi' seratus kali dalam sehari, maka dosa-dosanya akan dihapuskan walau sebanyak buih lautan.",
      source: "HR. Bukhari no. 6405 & Muslim no. 2691",
    },
    rewardPoints: 50,
  },
  {
    id: "badge-kaffah-champion",
    code: "KAFFAH_TARGET",
    name: "Kaffah Target Achiever",
    indonesianTitle: "Pemberat Timbangan Mizan",
    description: "Menuntaskan seluruh target harian repetisi dzikir kaffah (300+ repetisi) dalam satu hari.",
    category: "volume",
    tier: "silver",
    iconName: "Trophy",
    requirementDescription: "Selesaikan 100% target repetisi harian (300+ repetisi).",
    targetValue: 300,
    unit: "Repetisi Hari Ini",
    dalilReference: {
      arabic: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
      translation: "Dua kalimat yang ringan di lisan, berat di timbangan, dan dicintai Ar-Rahman: Subhanallahi wa bihamdih, Subhanallahil 'Azhim.",
      source: "HR. Bukhari no. 6406 & Muslim no. 2694",
    },
    rewardPoints: 90,
  },
  {
    id: "badge-dual-wings",
    code: "DUAL_WINGS",
    name: "Wings of Day & Night",
    indonesianTitle: "Dua Sayap Fajar & Petang",
    description: "Menuntaskan kedua sesi wirid (Dzikir Pagi DAN Dzikir Petang) dalam satu hari yang sama.",
    category: "discipline",
    tier: "silver",
    iconName: "Zap",
    requirementDescription: "Selesaikan baik Dzikir Pagi maupun Dzikir Petang hari ini.",
    targetValue: 2,
    unit: "Sesi Hari Ini",
    dalilReference: {
      arabic: "فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ",
      translation: "Maka bertasbihlah kepada Allah di waktu kamu berada di petang hari dan waktu kamu berada di waktu subuh.",
      source: "QS. Ar-Rum: 17",
    },
    rewardPoints: 80,
  },
  {
    id: "badge-ayat-kursi-shield",
    code: "AYAT_KURSI_SHIELD",
    name: "Ayat Kursi Guardian",
    indonesianTitle: "Perisai Ayat Teragung",
    description: "Melafalkan Ayat Kursi dengan tartil dan tajweed terjaga pada sesi dzikir.",
    category: "recitation",
    tier: "bronze",
    iconName: "ShieldCheck",
    requirementDescription: "Lafalkan Ayat Kursi minimal 2 kali pada sesi dzikir hari ini.",
    targetValue: 2,
    unit: "Kali Dibaca",
    dalilReference: {
      translation: "Barangsiapa membacanya ketika petang maka ia dilindungi dari gangguan jin hingga pagi, dan barangsiapa membacanya ketika pagi maka ia dilindungi hingga petang.",
      source: "HR. Al-Hakim no. 1/562 (Shahih)",
    },
    rewardPoints: 45,
  },
  {
    id: "badge-sayyidul-istighfar",
    code: "SAYYIDUL_ISTIGHFAR",
    name: "Master of Repentance",
    indonesianTitle: "Penghulu Istighfar Surga",
    description: "Melafalkan doa Sayyidul Istighfar dengan penuh penghayatan tauhid dan pengakuan dosa.",
    category: "recitation",
    tier: "silver",
    iconName: "HeartHandshake",
    requirementDescription: "Lafalkan Sayyidul Istighfar minimal 2 kali hari ini.",
    targetValue: 2,
    unit: "Kali Dibaca",
    dalilReference: {
      translation: "Barangsiapa mengucapkannya di waktu petang dengan penuh keyakinan lalu meninggal di malam itu, niscaya ia termasuk penghuni surga.",
      source: "HR. Bukhari no. 6306",
    },
    rewardPoints: 75,
  },
  {
    id: "badge-audio-rhythm-master",
    code: "AUDIO_RHYTHM_MASTER",
    name: "Rhythm & Pronunciation Master",
    indonesianTitle: "Pelafal Tartil As-Sunnah",
    description: "Menggunakan audio pelafalan & irama loop untuk melatih ketepatan makhraj dan ritme dzikir.",
    category: "recitation",
    tier: "silver",
    iconName: "Volume2",
    requirementDescription: "Gunakan fitur audio pelafalan loop minimal 3 kali latihan.",
    targetValue: 3,
    unit: "Sesi Latihan Audio",
    dalilReference: {
      arabic: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
      translation: "Dan bacalah Al-Qur'an (dan kalimat dzikir) itu dengan perlahan-lahan (tartil).",
      source: "QS. Al-Muzzammil: 4",
    },
    rewardPoints: 60,
  },
  {
    id: "badge-free-tasbih-explorer",
    code: "FREE_TASBIH_EXPLORER",
    name: "Free Tasbih Explorer",
    indonesianTitle: "Penjelajah Wirid Bebas",
    description: "Menuntaskan minimal 3 putaran (laps) penuh pada Tasbih Bebas digital.",
    category: "volume",
    tier: "bronze",
    iconName: "RotateCcw",
    requirementDescription: "Selesaikan 3 putaran (laps) tasbih digital bebas.",
    targetValue: 3,
    unit: "Putaran (Laps)",
    dalilReference: {
      translation: "Setiap tasbih adalah sedekah, setiap tahmid adalah sedekah, setiap tahlil adalah sedekah, dan setiap takbir adalah sedekah.",
      source: "HR. Muslim no. 720",
    },
    rewardPoints: 35,
  },
  {
    id: "badge-millennium-praise",
    code: "MILLENNIUM_PRAISE",
    name: "Millennium Praiser",
    indonesianTitle: "Seribu Kalimat Thayyibah",
    description: "Mencapai akumulasi total 1.000 repetisi dzikir sepanjang masa di aplikasi.",
    category: "volume",
    tier: "gold",
    iconName: "Sparkles",
    requirementDescription: "Capai akumulasi 1.000 repetisi dzikir seumur hidup.",
    targetValue: 1000,
    unit: "Lifetime Repetisi",
    dalilReference: {
      arabic: "سَبَقَ الْمُفَرِّدُونَ... الذَّاكِرُونَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتُ",
      translation: "Telah mendahului orang-orang al-mufarridun... yaitu kaum laki-laki dan perempuan yang banyak berdzikir mengingat Allah.",
      source: "HR. Muslim no. 2676",
    },
    rewardPoints: 150,
  },
  {
    id: "badge-consistent-reader-gold",
    code: "CON_READER_GOLD",
    name: "Steadfast Believer",
    indonesianTitle: "Ketetapan Hati Dua Pekan",
    description: "Mencapai rekor istiqomah dzikir 14 hari berturut-turut tanpa jeda.",
    category: "streak",
    tier: "gold",
    iconName: "Trophy",
    requirementDescription: "Capai 14 hari streak dzikir berturut-turut.",
    targetValue: 14,
    unit: "Hari Streak",
    dalilReference: {
      arabic: "قُلْ آمَنْتُ بِاللَّهِ ثُمَّ اسْتَقِمْ",
      translation: "Katakanlah: 'Aku beriman kepada Allah', kemudian beristiqamahlah teguh.",
      source: "HR. Muslim no. 38",
    },
    rewardPoints: 200,
  },
  {
    id: "badge-titan-30-days",
    code: "TITAN_30_DAYS",
    name: "Unbreakable Steadfastness",
    indonesianTitle: "Teladan Sebulan Istiqomah",
    description: "Mempertahankan 30 hari istiqomah dzikir berturut-turut tanpa terputus satu hari pun.",
    category: "streak",
    tier: "diamond",
    iconName: "Flame",
    requirementDescription: "Capai 30 hari streak dzikir tanpa putus.",
    targetValue: 30,
    unit: "Hari Streak",
    dalilReference: {
      arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ",
      translation: "Wahai orang-orang yang beriman! Bersabarlah kamu dan kuatkanlah kesabaranmu dan tetaplah bersiap-siaga dan bertakwalah kepada Allah.",
      source: "QS. Ali 'Imran: 200",
    },
    rewardPoints: 350,
  },
];

/**
 * Evaluates user stats and returns all badges with updated progress, unlocked status, and unlock timestamps.
 */
export function evaluateDhikrBadges(
  stats: DhikrUserStats,
  extraMetrics: {
    morningCompletedCount: number;
    eveningCompletedCount: number;
    totalMorningItems: number;
    totalEveningItems: number;
    ayatKursiCount: number;
    sayyidulIstighfarCount: number;
    audioPracticeCount: number;
    freeTasbihLaps: number;
    todayRepetitions: number;
  }
): DhikrAchievementBadge[] {
  const isMorningComplete =
    extraMetrics.totalMorningItems > 0 &&
    extraMetrics.morningCompletedCount >= extraMetrics.totalMorningItems;

  const isEveningComplete =
    extraMetrics.totalEveningItems > 0 &&
    extraMetrics.eveningCompletedCount >= extraMetrics.totalEveningItems;

  const dualSessionDone = (isMorningComplete && isEveningComplete) || (stats.completedMorning && stats.completedEvening);

  return INITIAL_DHIKR_BADGES.map((badge) => {
    let currentValue = 0;

    switch (badge.code) {
      case "CON_READER_BRONZE":
      case "CON_READER_SILVER":
      case "CON_READER_GOLD":
      case "TITAN_30_DAYS":
        currentValue = stats.currentStreakDays || 0;
        break;

      case "EARLY_BIRD":
        currentValue = isMorningComplete || stats.completedMorning ? 1 : 0;
        break;

      case "TWILIGHT_GUARDIAN":
        currentValue = isEveningComplete || stats.completedEvening ? 1 : 0;
        break;

      case "DUAL_WINGS":
        currentValue = dualSessionDone ? 2 : (isMorningComplete || isEveningComplete ? 1 : 0);
        break;

      case "CENTURY_RECITER":
        currentValue = extraMetrics.todayRepetitions;
        break;

      case "KAFFAH_TARGET":
        currentValue = extraMetrics.todayRepetitions;
        break;

      case "AYAT_KURSI_SHIELD":
        currentValue = extraMetrics.ayatKursiCount;
        break;

      case "SAYYIDUL_ISTIGHFAR":
        currentValue = extraMetrics.sayyidulIstighfarCount;
        break;

      case "AUDIO_RHYTHM_MASTER":
        currentValue = extraMetrics.audioPracticeCount;
        break;

      case "FREE_TASBIH_EXPLORER":
        currentValue = extraMetrics.freeTasbihLaps;
        break;

      case "MILLENNIUM_PRAISE":
        currentValue = stats.lifetimeTotalCount + extraMetrics.todayRepetitions;
        break;

      default:
        currentValue = 0;
    }

    const isUnlocked =
      currentValue >= badge.targetValue ||
      (stats.unlockedBadgeIds ? stats.unlockedBadgeIds.includes(badge.id) : false);

    return {
      ...badge,
      currentValue,
      isUnlocked,
      unlockedAt: isUnlocked ? "Tercapai Hari Ini" : undefined,
    };
  });
}

/**
 * Calculates current spiritual level based on total earned reward points.
 */
export function calculateSpiritualLevel(totalPoints: number): {
  currentLevel: DhikrSpiritualLevel;
  nextLevel: DhikrSpiritualLevel | null;
  progressPct: number;
  pointsToNext: number;
} {
  const levels = DHIKR_SPIRITUAL_LEVELS;
  let currentLevel = levels[0];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].minPoints) {
      currentLevel = levels[i];
      break;
    }
  }

  const currentIndex = levels.findIndex((l) => l.level === currentLevel.level);
  const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

  let progressPct = 100;
  let pointsToNext = 0;

  if (nextLevel) {
    const range = nextLevel.minPoints - currentLevel.minPoints;
    const gained = totalPoints - currentLevel.minPoints;
    progressPct = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
    pointsToNext = Math.max(0, nextLevel.minPoints - totalPoints);
  }

  return {
    currentLevel,
    nextLevel,
    progressPct,
    pointsToNext,
  };
}
