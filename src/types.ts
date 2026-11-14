export type PillarType = "berdakwah" | "bersyariah" | "berjamaah" | "bermuamalah" | "control_plane" | "cloud_control";

export interface KnowledgeItem {
  id: string;
  title: string;
  category: "Akidah" | "Fiqh Ibadah" | "Muamalah" | "Akhlak & Tazkiyah" | "Sirah Nabawiyah" | "Keluarga Sakinah";
  sourceType: "Al-Qur'an" | "Hadits Shahih" | "Fatwa DSN-MUI" | "Kitab Klasik";
  dalilArabic?: string;
  dalilLatin?: string;
  dalilTranslation?: string;
  sanadValidation: "Mutawatir" | "Shahih" | "Hasan" | "Fatwa Resmi";
  summary: string;
  tags: string[];
  authorOrNarrator: string;
  verifiedBy: string;
  readingTimeMinutes: number;
}

export interface KajianSchedule {
  id: string;
  title: string;
  speaker: string;
  speakerTitle: string;
  masjidName: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Pusat Sematang Borang";
  address: string;
  datetime: string;
  topic: string;
  isLiveStreamed: boolean;
  attendeesExpected: number;
  category: "Tematik" | "Tafsir" | "Hadits Arba'in" | "Keluarga" | "Subuh Berjamaah";
  posterUrl?: string;
}

export interface ShariaAuditRecord {
  id: string;
  contractTitle: string;
  contractType: "Mudharabah" | "Musyarakah" | "Murabahah" | "Ijarah" | "Wakalah" | "Qardhul Hasan" | "Salam";
  applicantName: string;
  businessSector: string;
  contractValue: number;
  complianceScore: number; // 0 - 100
  status: "COMPLIANT" | "COMPLIANT_WITH_NOTES" | "NON_COMPLIANT";
  auditedDate: string;
  prohibitedElements: {
    riba: boolean;
    gharar: boolean;
    maysir: boolean;
    tadlis: boolean;
    ikrah: boolean;
    risywah: boolean;
  };
  notes: string[];
  fatwaReference: string;
}

export interface FiqhChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  category?: string;
  references?: { source: string; note: string }[];
  confidenceScore?: number;
}

export interface KelurahanData {
  name: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  totalMuslims: number;
  activeMasjids: number;
  mushollas: number;
  mustahiqFamilies: number;
  muzakkiCount: number;
  umkmHalalCount: number;
  activeRelawan: number;
  coordinates: { lat: number; lng: number };
  priorityNeed: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: "Kajian Akbar" | "Subuh Gabungan" | "Bakti Sosial" | "Dapur Berkah Umat" | "Pelatihan UMKM";
  date: string;
  location: string;
  kelurahan: string;
  targetParticipants: number;
  registeredCount: number;
  budgetAllocated: number;
  tasks: {
    id: string;
    title: string;
    assignedTo: string;
    status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  }[];
  organizer: string;
}

export type SkillCategoryType =
  | "Kesehatan / Medis"
  | "Akuntansi & Finansial"
  | "Teknologi & IT"
  | "Hukum & Syariah"
  | "Pendidikan & Tahfidz"
  | "Teknik, Bangunan & Logistik"
  | "Penyelenggaraan Jenazah & Sosial";

export interface TalentVolunteer {
  id: string;
  name: string;
  profession: string;
  skillCategory: SkillCategoryType;
  subSkills?: string[];
  kelurahan: string;
  masjidBase: string;
  availableDays: string[];
  contactStatus: "Tersedia" | "Sedang Bertugas" | "Siaga 24 Jam";
  contributionType?: "Konsultasi Gratis" | "Aksi Lapangan & Darurat" | "Pelatihan & Workshop" | "Audit & Review";
  experienceYears?: number;
  missionsCompleted?: number;
  hoursContributed?: number;
  verifiedByDkm?: boolean;
  contactPhone?: string;
  email?: string;
  bio?: string;
  avatarColor?: string;
}

export interface SkillClusterData {
  id: string;
  category: SkillCategoryType;
  label: string;
  iconName: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentClass: string;
  description: string;
  coreSkills: string[];
  totalVolunteers: number;
  availableVolunteers: number;
  activeProgramsCount: number;
}

export interface CommunityVolunteerOpportunity {
  id: string;
  programTitle: string;
  organizerMasjid: string;
  kelurahan: string;
  targetCategory: SkillCategoryType;
  requiredSkills: string[];
  volunteersNeeded: number;
  volunteersJoined: number;
  dateSchedule: string;
  urgency: "Tinggi" | "Sedang" | "Rutin";
  description: string;
  assignedVolunteerIds: string[];
}

export interface ZiswafTransaction {
  id: string;
  type: "ZAKAT_MAL" | "ZAKAT_FITRAH" | "ZAKAT_PROFESI" | "INFAQ_SHODAQOH" | "WAKAF_PRODUKTIF" | "DANA_BENCANA" | "HIBAH_FASUM";
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  timestamp: string;
  designatedMasjidOrProgram: string;
  paymentMethod: "QRIS_SYARIAH" | "TRANSFER_BSI" | "TUNAI_AMIL";
  verifiedStatus: "VERIFIED" | "PENDING";
  impactCategory: "Pemberdayaan UMKM" | "Beasiswa Santri" | "Kesehatan Dhuafa" | "Operasional Masjid" | "Pangan Umat" | "Wakaf Air Bersih" | "Armada Ambulans";
  referenceCode?: string;
  uniqueCode?: number;
}

export interface QrDonationPayload {
  nmid: string;
  merchantName: string;
  referenceId: string;
  amount: number;
  uniqueCode: number; // 3 digit unique code (e.g. 142) for instant automated reconciliation
  totalPayable: number;
  donorName: string;
  isAnonymous: boolean;
  donorPhoneOrEmail?: string;
  donationType: "ZAKAT_MAL" | "ZAKAT_FITRAH" | "ZAKAT_PROFESI" | "INFAQ_SHODAQOH" | "WAKAF_PRODUKTIF" | "DANA_BENCANA" | "HIBAH_FASUM";
  designatedProgram: string;
  designatedMasjid: string;
  kelurahan: string;
  expiryTimestamp: number;
  rawQrString: string;
  akadNiatText: string;
  createdDate: string;
}

export type QrValidationStage =
  | "IDLE"
  | "SCANNING"
  | "DETECTED"
  | "VERIFYING_BANK"
  | "RECONCILING_LEDGER"
  | "CONFIRMED_SUCCESS"
  | "EXPIRED"
  | "FAILED";


export interface MarketplaceProduct {
  id: string;
  name: string;
  sellerName: string;
  sellerMasjid: string;
  kelurahan: string;
  price: number;
  baseCost: number; // For transparent syariah margin disclosure
  profitMarginPercentage: number;
  category: "Kuliner Halal" | "Busana Muslim" | "Herbal & Thibbun Nabawi" | "Jasa Profesional" | "Kebutuhan Rumah Tangga";
  halalCertified: boolean;
  halalRegNo?: string;
  rating: number;
  soldCount: number;
  description: string;
  akadType: "Bai' Murabahah" | "Bai' Istishna" | "Ijarah Khidmat";
  imageUrl: string;
}

export interface DataIntegrityLog {
  id: string;
  timestamp: string;
  pipeline: "Knowledge Catalog" | "ZISWAF Ledger" | "Jamaah Registry" | "Sharia Contract" | "Marketplace KYC";
  recordsProcessed: number;
  validRate: number; // percentage
  status: "OPTIMAL" | "ATTENTION" | "SYNCING";
  hashSignature: string;
}

export interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
  isNext?: boolean;
}

export interface ZiswafhForecastMonthly {
  month: string;
  projectedInflow: number;
  projectedZakat: number;
  projectedInfaq: number;
  projectedShodaqoh: number;
  projectedWakaf: number;
  projectedHibah: number;
  keyDrivers: string;
  seasonalEvent?: string;
}

export interface ZiswafhCategoryForecast {
  category: "Zakat (Maal & Profesi)" | "Infaq Operasional" | "Shodaqoh Terikat" | "Wakaf Uang & Produktif" | "Hibah & Dana Kebajikan";
  baseline: number;
  projected: number;
  growthPercent: number;
  seasonalMultiplier: number;
  growthDriver: string;
  riskFactor: string;
}

export interface ZiswafhProgramAllocation {
  id: string;
  programName: string;
  targetAsnaf: string;
  suggestedBudget: number;
  suggestedPercentage: number;
  targetBeneficiaries: number;
  expectedMultiplierSROI: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  rationale: string;
}

export interface ZiswafhForecastResult {
  forecastPeriod: string;
  forecastSummary: string;
  projectedTotalFunds: number;
  currentBaselineFunds: number;
  predictedGrowthRate: number;
  confidenceLevel: number;
  historicalTrendInsight: string;
  monthlyProjections: ZiswafhForecastMonthly[];
  categoryForecasts: ZiswafhCategoryForecast[];
  scenarios: {
    conservative: { projectedTotal: number; growthRate: number; keyAssumption: string };
    moderate: { projectedTotal: number; growthRate: number; keyAssumption: string };
    optimistic: { projectedTotal: number; growthRate: number; keyAssumption: string };
  };
  recommendedProgramAllocations: ZiswafhProgramAllocation[];
  strategicRecommendations: string[];
  calendarSeasonalFactors: Array<{
    event: string;
    expectedSpike: string;
    recommendedAmilAction: string;
  }>;
}

export interface DailyHadithData {
  id: string;
  theme: string;
  category: "Ukhuwah" | "Muamalah" | "Akhlak" | "Ibadah" | "ZISWAF" | "Ilmu" | "Keluarga" | "Tawakkal" | "Sosial";
  hadithArabic: string;
  hadithLatin?: string;
  translation: string;
  narrator: string;
  rawi: string;
  bookSource: string;
  hadithNumber?: string;
  authenticity: "Shahih" | "Hasan" | "Muttafaq 'Alaih";
  takhrijNotes: string;
  reflectionTadabbur: string;
  actionableTakeaways: string[];
  contextualPillarLink: {
    pillar: "Berdakwah" | "Bersyariah" | "Berjamaah" | "Bermuamalah";
    application: string;
  };
  socialShareQuote: string;
  shareHashtags: string[];
  generatedDate?: string;
}

export type ZiswafhFilterCategory = "ALL" | "ZAKAT" | "INFAQ" | "SHODAQOH" | "WAKAF" | "HIBAH";

export interface ZiswafhBenefitDisbursement {
  id: string;
  category: "ZAKAT" | "INFAQ" | "SHODAQOH" | "WAKAF" | "HIBAH";
  programName: string;
  targetAsnaf: string;
  amount: number;
  beneficiaryCount: number;
  unitDescription: string;
  date: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED";
  verifiedAuditCode: string;
}

export interface ZiswafhNeighborhoodZone {
  id: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  neighborhoodName: string;
  masjidHub: string;
  geoCenter: { x: number; y: number; lat: number; lng: number };
  svgPolygonPath: string;
  totalMustahiqKK: number;
  totalMuzakki: number;
  totalBenefitValueDisbursed: number;
  benefitBreakdown: {
    zakat: number;
    infaq: number;
    shodaqoh: number;
    wakaf: number;
    hibah: number;
  };
  beneficiariesCount: number;
  disbursementCoveragePct: number;
  distributionPriority: "OPTIMAL" | "STABIL" | "PERHATIAN" | "PRIORITAS_TINGGI";
  featuredPrograms: string[];
  recentDisbursements: ZiswafhBenefitDisbursement[];
  waterSanitationPoints?: number;
  umkmSupportedCount?: number;
  ambulanceServiceHours?: number;
}

export type MuamalahAwardCategory =
  | "COMMUNITY_GOAL"
  | "ZISWAF_MILESTONE"
  | "EMPOWERMENT"
  | "INFRASTRUCTURE"
  | "ASNAF_CARE";

export type MuamalahBadgeTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface MuamalahAwardBadge {
  id: string;
  slug: string;
  name: string;
  titleArabic: string;
  category: MuamalahAwardCategory;
  tier: MuamalahBadgeTier;
  targetGoal: number;
  currentProgress: number;
  targetMetricType: "DONATION_AMOUNT" | "BENEFICIARY_COUNT" | "UMKM_COUNT" | "WATER_WELLS" | "MOSQUE_UNITS";
  unitLabel: string;
  unlocked: boolean;
  unlockedDate?: string;
  description: string;
  impactNarrative: string;
  hadithInspiration: {
    arabic: string;
    latin: string;
    meaning: string;
    source: string;
  };
  iconName: string;
  rewardPerks: string[];
  certificateVerificationCode: string;
  endorsedBy: string;
  badgeAccentColor: string;
}

export type ResourceCategoryType =
  | "Peralatan & Perkakas (Tools)"
  | "Buku & Referensi Islami"
  | "Perlengkapan Acara & Audio (Event Equipment)"
  | "Kesehatan & P3K"
  | "Kebersihan & Sanitasi";

export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategoryType;
  description: string;
  ownerName: string;
  ownerRole: "Jamaah Masjid" | "DKM / Pengurus" | "Relawan Komunitas" | "Majelis Taklim";
  ownerMasjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  contactPhone: string;
  condition: "Sangat Baik (Seperti Baru)" | "Baik & Berfungsi Penuh" | "Cukup (Perlu Kehati-hatian)";
  availabilityStatus: "TERSEDIA" | "SEDANG_DIPINJAM" | "PERBAIKAN";
  maxBorrowDays: number;
  depositOrCondition: string;
  tags: string[];
  totalBorrowCount: number;
  locationDetails: string;
  imageUrl?: string;
}

export interface ResourceBorrowRequest {
  id: string;
  requestNumber: string;
  resourceId: string;
  resourceName: string;
  resourceCategory: ResourceCategoryType;
  borrowerName: string;
  borrowerPhone: string;
  borrowerMasjid: string;
  borrowerKelurahan: string;
  projectOrEventName: string;
  purpose: string;
  startDate: string;
  endDate: string;
  status: "MENUNGGU_PERSETUJUAN" | "DISETUJUI_SIAP_AMBIL" | "SEDANG_DIGUNAKAN" | "SELESAI_DIKEMBALIKAN" | "DITOLAK";
  requestDate: string;
  approvedBy?: string;
  handoverDate?: string;
  returnDate?: string;
  notes?: string;
  trackingTimeline: {
    stage: string;
    timestamp: string;
    actor: string;
    note: string;
    completed: boolean;
  }[];
}

export type AttendanceSessionStatus = "AKTIF_CHECKIN" | "AKTIF_CHECKOUT" | "SELESAI" | "DITUTUP";

export interface VolunteerAttendanceSession {
  id: string;
  sessionCode: string;
  projectName: string;
  category: string;
  masjidLocation: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  date: string;
  startTime: string;
  endTime: string;
  targetHours: number;
  projectManager: string;
  contactPhone: string;
  status: AttendanceSessionStatus;
  allowSelfScan: boolean;
  geoRadiusMeters: number;
  qrPayload: string;
  qrSecurityToken: string;
  description: string;
  registeredVolunteersCount: number;
  attendedCount: number;
}

export interface VolunteerAttendanceRecord {
  id: string;
  sessionId: string;
  sessionCode: string;
  projectName: string;
  volunteerName: string;
  volunteerPhone: string;
  volunteerMasjid: string;
  volunteerKelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  roleAssigned: string;
  checkInTime: string;
  checkOutTime?: string;
  durationHours: number;
  verificationStatus: "TERVERIFIKASI_DKM" | "MENUNGGU_VERIFIKASI" | "SEDANG_KHIDMAH" | "DITOLAK";
  verifiedBy?: string;
  notes?: string;
  method: "SCAN_KAMERA_HP" | "KIOSK_MASJID" | "MANUAL_SUPERVISOR";
  gpsConfirmed: boolean;
  pointsEarned: number;
}

export interface CommunityEndorsement {
  id: string;
  targetMemberId: string;
  targetSkillId: string;
  targetSkillName: string;
  authorMemberId: string;
  authorName: string;
  authorRole: string;
  authorMasjid: string;
  authorKelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Pusat Sematang Borang";
  authorAvatarColor?: string;
  isVerifiedMember: boolean;
  relationshipContext: "Rekan Tim Medis" | "Pengurus DKM" | "Penerima Manfaat / Jamaah" | "Mentor Pelatihan" | "Rekan Kerja Lapangan" | "Ketua RW / RT";
  endorsementText: string;
  trustRating: number; // 1 - 5
  trustTag: "Sangat Amanah & Profesional" | "Keahlian Teruji Lapangan" | "Cepat Tanggap & Ikhlas" | "Solutif & Berpengalaman" | "Rekomendasi Utama DKM";
  createdAt: string;
  hijriDate?: string;
  verifiedDkmSignature: string;
  helpfulCount: number;
}

export interface UserProfileOnboarding {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  avatarPresetColor: string;
  homeMasjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  profession: string;
  primarySkillCategory: SkillCategoryType;
  selectedSubSkills: string[];
  experienceLevel: "Pemula / Belajar" | "Praktisi Menengah" | "Profesional / Senior" | "Pakar / Bersertifikasi";
  availabilityDays: string[];
  weeklyHoursTarget: number;
  contributionType: "Aksi Lapangan & Darurat" | "Konsultasi Gratis" | "Pelatihan & Workshop" | "Audit & Review";
  priorityCauses: string[];
  preferredTeamRole: string;
  pledgeMotivation: string;
  emergencyAlertOptIn: boolean;
  weekendWorkshopOptIn: boolean;
  onboardingCompletedAt?: string;
  memberIdCardNumber: string;
}

export interface SkillSyncProject {
  id: string;
  title: string;
  organizerMasjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Pusat Sematang Borang";
  category: SkillCategoryType;
  requiredSkills: string[];
  recommendedRole: string;
  schedule: string;
  urgency: "Tinggi" | "Sedang" | "Rutin";
  volunteersNeeded: number;
  volunteersJoined: number;
  description: string;
  impactScore: number; // SROI / community benefit index
  estimatedHours: number;
  tags: string[];
}

export interface SkillSyncMatchResult {
  project: SkillSyncProject;
  matchScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  locationMatch: boolean;
  scheduleMatch: boolean;
  causeMatch: boolean;
  scoreBreakdown: {
    categoryWeight: number; // up to 40
    subSkillsWeight: number; // up to 25
    locationWeight: number; // up to 15
    scheduleWeight: number; // up to 10
    experienceWeight: number; // up to 10
  };
  recommendationReason: string;
  rank: number;
}

export interface SadaqahProject {
  id: string;
  title: string;
  category: "Sedekah Subuh" | "Jumat Berkah" | "Pendidikan Santri" | "Air Bersih & Sanitasi" | "Kesehatan & Gizi Dhuafa" | "Lumbung Pangan";
  masjidLocation: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  targetAmount: number;
  currentAmount: number;
  unitCost: number; // Cost per 1 tangible unit (e.g. Rp 15.000 / porsi)
  unitName: string; // e.g. "Porsi Sarapan", "Paket Sembako", "Bulan SPP Santri", "Galon Air Sehat"
  targetUnits: number;
  currentUnits: number;
  donorCount: number;
  recurringDonorsCount: number;
  description: string;
  beneficiarySummary: string;
  iconName: string;
  accentColor: string;
  recentDonations: Array<{
    donorName: string;
    amount: number;
    timestamp: string;
    isRecurring: boolean;
    frequency?: "Harian" | "Mingguan" | "Bulanan";
    message?: string;
  }>;
}

export interface VolunteerAccomplishment {
  id: string;
  title: string;
  date: string;
  category: "Operasi Darurat" | "Layanan Medis" | "Akustik & Teknik" | "Edukasi & Tahfidz" | "Pemberdayaan Ekonomi" | "Fardhu Kifayah";
  impactMetric: string;
  hoursSpent: number;
  location: string;
  dkmVerifier: string;
  badgeIcon: string;
}

export interface MemberTestimonial {
  id: string;
  authorName: string;
  authorRole: string;
  authorMasjid: string;
  relationshipContext: string;
  avatarColor: string;
  testimonialQuote: string;
  rating: number;
  trustTag: string;
  date: string;
  verifiedStamp: string;
}

export interface FeaturedVolunteerSpotlight {
  id: string;
  name: string;
  titleHonorific: string;
  profession: string;
  roleTitle: string;
  homeMasjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  avatarColor: string;
  avatarGradient: string;
  tier: "PLATINUM_LEADER" | "GOLD_SPECIALIST" | "SILVER_PIONEER";
  tierLabel: string;
  totalServiceHours: number;
  missionsCompleted: number;
  beneficiariesImpacted: number;
  sroiGeneratedRp: number;
  quoteMotto: string;
  specialtyTags: string[];
  recentAccomplishments: VolunteerAccomplishment[];
  testimonials: MemberTestimonial[];
  endorsementCount: number;
  prayersReceivedCount: number;
  contactAvailability: string;
}

export interface ProjectFinancialAllocation {
  id: string;
  projectName: string;
  category: string;
  categoryId: string; // matches cat-medis, cat-pangan, etc.
  homeMasjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya";
  allocatedAmountRp: number; // Dana dialokasikan
  disbursedAmountRp: number; // Dana terserap/tersalur
  volunteerCount: number;
  volunteerHoursLogged: number;
  beneficiariesCount: number;
  beneficiaryUnit: string;
  costPerBeneficiaryRp: number;
  sroiMultiplier: number; // e.g. 2.8x (Rp 1 of Sadaqah yields Rp 2.8 of social benefit)
  status: "AKTIF" | "SELESAI" | "PERSIAPAN";
  auditStatus: "VERIFIED_DKM" | "AUDIT_CLEAN" | "IN_REVIEW";
  lastAuditDate: string;
  sourceFund: "Sedekah Subuh" | "Infaq Khusus Program" | "Wakaf Manfaat" | "Dana Tabarru' DKM" | "Zakat Maal Produktif";
  keyOutputs: string[];
}

export interface FinancialStewardshipSummary {
  totalAllocatedRp: number;
  totalDisbursedRp: number;
  totalSroiGeneratedRp: number;
  disbursementRatePct: number;
  directImpactRatioPct: number; // e.g. 98.4%
  adminCostRatioPct: number; // 1.6%
  activeProjectsCount: number;
  totalBeneficiariesReached: number;
}

export interface PollOption {
  id: string;
  text: string;
  description?: string;
  voteCount: number;
  colorHex?: string;
  badgeTag?: string;
}

export interface PollComment {
  id: string;
  authorName: string;
  authorRole: string;
  kelurahan: string;
  timestamp: string;
  votedOptionText?: string;
  text: string;
}

export interface CommunityPoll {
  id: string;
  title: string;
  category: "Acara & Kajian Umat" | "Prioritas Layanan Sosial" | "Fasilitas & Operasional Masjid" | "Pemberdayaan Ekonomi & UMKM";
  description: string;
  targetAudience: string;
  homeMasjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Semua Kelurahan";
  status: "AKTIF" | "KONSENSUS_TERBENTUK" | "DITUTUP";
  createdAt: string;
  endDate: string;
  totalVotes: number;
  options: PollOption[];
  allowMultipleChoices: boolean;
  comments: PollComment[];
  dkmLeaderInitiator: {
    name: string;
    role: string;
    avatarColor: string;
  };
  actionableDecisionPlan?: string;
}

export type SkillNodeType = "member" | "skill_hub" | "masjid";

export interface SkillMapNode {
  id: string;
  name: string;
  type: SkillNodeType;
  category: string;
  profession?: string;
  masjid?: string;
  kelurahan?: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Kecamatan";
  avatarColor?: string;
  experienceYears?: number;
  verifiedEndorsementsCount?: number;
  volunteeredHours?: number;
  status?: "Tersedia" | "Sedang Bertugas" | "Siaga 24 Jam";
  skillsList?: string[];
  pastProjects?: string[];
  colorHex?: string;
  radius?: number;
  contactPhone?: string;
  bio?: string;
  // D3 simulation simulation attributes
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface SkillMapLink {
  source: string | SkillMapNode;
  target: string | SkillMapNode;
  type: "expertise" | "collaboration" | "mosque_affiliation";
  projectName?: string;
  collaborationCount?: number;
  strength?: number;
  description?: string;
}

export interface CommunitySkillMapData {
  nodes: SkillMapNode[];
  links: SkillMapLink[];
}

export type PlaqueTier = "gold" | "silver" | "bronze" | "emerald" | "memorial";

export interface CommunityPrayerNote {
  id: string;
  senderName: string;
  senderRole?: string;
  prayerText: string;
  timestamp: string;
  likesCount?: number;
}

export interface MosqueHonorPlaque {
  id: string;
  fullName: string;
  honorTitle: string; // e.g. "Tokoh Penggerak Lumbung Pangan Umat", "Khadimul Qur'an Sepuh"
  category: "Ibadah & Dakwah" | "Kesehatan Dhuafa" | "Wakaf & Pembangunan" | "Pendidikan Santri" | "Sosial & Dapur Berkah" | "Teknologi & Media";
  tier: PlaqueTier;
  serviceStartYear: number;
  serviceEndYear?: number | "Sekarang";
  yearsOfDedication: number;
  masjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Kecamatan Sematang Borang";
  avatarUrl?: string;
  avatarColor: string;
  quote: string;
  milestones: string[];
  dkmCertificateId: string;
  ratificationDate: string;
  prayersCount: number;
  userPrayers: CommunityPrayerNote[];
  isMemorial?: boolean; // For departed contributors (Rahimahullah)
  tags: string[];
}

export interface ContributorLeaderboardItem {
  id: string;
  fullName: string;
  roleTitle: string;
  avatarColor: string;
  avatarUrl?: string;
  masjid: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Kecamatan Sematang Borang";
  category: "Ibadah & Dakwah" | "Kesehatan Dhuafa" | "Wakaf & Pembangunan" | "Pendidikan Santri" | "Sosial & Dapur Berkah" | "Teknologi & Media";
  
  // Mosque Participation Metrics (Weight: 50%)
  subuhStreakDays: number;
  mosqueAttendanceCount: number; // monthly or cumulative sholat / event attendances
  volunteerHours: number;
  eventsParticipated: number;
  mosqueParticipationScore: number; // 0 - 100% normalized

  // Digital Plaque & Honor Metrics (Weight: 50%)
  plaqueTier: PlaqueTier;
  plaqueTitle: string;
  yearsOfDedication: number;
  prayersReceivedCount: number;
  prayersGivenCount: number;
  dkmEndorsementsCount: number;
  digitalPlaqueScore: number; // 0 - 100% normalized

  // Total Aggregated Score
  compositeScore: number; // Total points (e.g. 0 - 1000+)
  progressToNextRankPercentage: number; // 0 - 100%
  nextRankTitle: string;
  currentRankLevel: "Khadimul Ummah Utama" | "Teladan Emas" | "Bintang Istiqomah" | "Pengabdi Harapan" | "Pejuang Khidmah";

  // Badges & Highlights
  badges: string[];
  isCurrentUser?: boolean;
  isMemorial?: boolean;
  recentActivity: string;
  lastActiveTimestamp: string;
}

export type ContributionCategory =
  | "MOSQUE_ATTENDANCE"
  | "VOLUNTEER_MEDICAL"
  | "CHARITY_DISTRIBUTION"
  | "EDUCATIONAL_DAKWAH"
  | "INFRASTRUCTURE_WAKAF"
  | "ZISWAF_DONATION";

export interface ContributionTimelineItem {
  id: string;
  userId?: string;
  userName: string;
  userRole?: string;
  date: string; // e.g. "18 Agustus 2026"
  time: string; // e.g. "04:52 WIB"
  hijriDate: string; // e.g. "5 Shafar 1448 H"
  title: string;
  category: ContributionCategory;
  categoryLabel: string;
  masjidName: string;
  kelurahan: "Sukamulya" | "Lebung Gajah" | "Karya Mulya" | "Srimulya" | "Kecamatan Sematang Borang";
  description: string;
  impactMetrics: {
    hoursLogged?: number;
    beneficiariesCount?: number;
    pointsEarned: number;
    amountRp?: number;
    streakDayNumber?: number;
  };
  verificationStatus: "TERVERIFIKASI_DKM" | "GPS_GEO_CONFIRMED" | "SYSTEM_AUDITED" | "PENDING_VERIFIKASI";
  verifiedBy?: string;
  evidenceType?: "PRESENSI_QR" | "KWITANSI_DIGITAL" | "BERITA_ACARA" | "LOG_SHOLAT";
  evidenceCode?: string;
  locationDetails?: string;
  notes?: string;
  tags: string[];
}

export type DhikrTimeOfDay = "morning" | "evening" | "both" | "general";

export type DhikrCategory =
  | "Perlindungan & Keselamatan"
  | "Tauhid & Pengakuan Dosa"
  | "Kesyukuran & Pagi/Sore"
  | "Tasbih & Istighfar"
  | "Rezeki & Kemudahan"
  | "Kesehatan & 'Afiyah";

export interface DhikrItem {
  id: string;
  title: string;
  subtitle?: string;
  arabic: string;
  latin: string;
  translation: string;
  targetCount: number;
  timeOfDay: DhikrTimeOfDay;
  category: DhikrCategory;
  fadhilah: string;
  source: string;
  sanadGrade: string;
  orderNumber: number;
  benefits?: string[];
  tags: string[];
  audioUrl?: string;
  pronunciationGuide?: string;
  rhythmBpm?: number;
}

export interface DhikrUserStats {
  todayTotalCount: number;
  lifetimeTotalCount: number;
  completedMorning: boolean;
  completedEvening: boolean;
  currentStreakDays: number;
  lastActiveDate: string;
  favoriteDhikrIds: string[];
  completedDhikrToday: { [dhikrId: string]: number };
  dailyRepetitionTarget?: number;
  unlockedBadgeIds?: string[];
  audioPracticeCount?: number;
  freeTasbihCompletedLaps?: number;
  totalSpiritualPoints?: number;
}

export type DhikrBadgeTier = "bronze" | "silver" | "gold" | "diamond";
export type DhikrBadgeCategory = "streak" | "discipline" | "volume" | "recitation";

export interface DhikrAchievementBadge {
  id: string;
  code: string;
  name: string; // e.g. "Consistent Reader", "Early Bird"
  indonesianTitle: string; // e.g. "Pembaca Istiqomah", "Sahabat Fajar"
  description: string;
  category: DhikrBadgeCategory;
  tier: DhikrBadgeTier;
  iconName: string;
  requirementDescription: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  dalilReference?: {
    arabic?: string;
    translation: string;
    source: string;
  };
  rewardPoints: number;
}

export interface DailySpiritualReflection {
  id: string;
  title: string;
  theme: string;
  sourceType: "Al-Qur'an" | "Hadits Shahih" | "Atsar Shahabat";
  arabic: string;
  latin?: string;
  translation: string;
  source: string;
  thought: string;
  personalAffirmation: string;
  dailyAction: string;
  dua?: {
    arabic: string;
    latin: string;
    translation: string;
  };
  tags: string[];
  generatedAt: string;
  userMoodOrNeed?: string;
  tone?: "menyejukkan" | "menggugah" | "muhasabah";
  isBookmarked?: boolean;
  userNotes?: string;
}

export type DhikrSessionType = "morning" | "evening" | "free_tasbih" | "general";

export type DhikrJournalSessionType =
  | "morning_dhikr"
  | "evening_dhikr"
  | "free_tasbih"
  | "muhasabah_malam"
  | "morning"
  | "evening"
  | "general";

export interface DhikrJournalEntry {
  id: string;
  dateStr?: string; // YYYY-MM-DD
  dateKey?: string;
  createdAt: string; // ISO
  sessionType: DhikrJournalSessionType | DhikrSessionType;
  sessionTitle?: string;
  content: string;
  moodTag?: "damai" | "syukur" | "gelisah" | "lelah" | "bersemangat" | "taubat" | string;
  heartState?: string;
  repetitionCount?: number;
  dhikrRepetitions?: number;
  streakAtTime?: number;
  gratitudeNote?: string;
  favoriteVerseOrLafadz?: string;
  intentionForTomorrow?: string;
  tags?: string[];
  isPinned?: boolean;
  sentiment?: {
    sakinahScore: number; // 0 - 100
    primaryEmotion: string;
    spiritualFocus: string;
    summaryReflection: string;
  };
}

export interface WeeklySpiritualDigest {
  id: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  overallSakinahScore: number; // 0 - 100
  sakinahCategory: string; // e.g. "Tuma'ninah Tinggi", "Kestabilan Ruhani", dll.
  dominantSpiritualThemes: string[];
  executiveSummary: string;
  sentimentProgression: {
    dayLabel: string;
    dateStr: string;
    sakinahIndex: number;
    dominantMood: string;
    entryExcerpt?: string;
  }[];
  spiritualStrengths: string[];
  growthOpportunities: string[];
  recommendedVersesAndHadith: {
    source: string;
    sourceType: "Al-Qur'an" | "Hadits Shahih";
    arabic: string;
    latin?: string;
    translation: string;
    context: string;
  }[];
  customDoaForUpcomingWeek: {
    arabic: string;
    latin: string;
    translation: string;
    meaning: string;
  };
  actionableSpiritualHabits: string[];
  isAiGenerated: boolean;
}




