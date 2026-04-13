import api from './axiosConfig';

// ─── Shared types (mirror backend model) ─────────────────────────────────────

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface NavItem {
  key: string;
  label: LocalizedText;
  href: string;
  isAnchor: boolean;
  order: number;
  isVisible: boolean;
}

export interface StatItem {
  key: string;
  labelAr: string;
  labelEn: string;
  value: number;
  suffix: string;
  decimals: number;
  iconName: string;
}

export interface TestimonialItem {
  textAr: string;
  textEn: string;
  author: string;
  roleAr: string;
  roleEn: string;
}

export interface FaqItem {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export type SectionType =
  | 'stats'
  | 'stages'
  | 'features'
  | 'testimonials'
  | 'teacher-application'
  | 'faq'
  | 'custom';

export interface LandingSection {
  key: string;
  type: SectionType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  order: number;
  isVisible: boolean;
  stats?: StatItem[];
  testimonials?: TestimonialItem[];
  faqItems?: FaqItem[];
}

export interface HeroConfig {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  heroImageUrl: string;
  primaryButtonLabelAr: string;
  primaryButtonLabelEn: string;
  primaryButtonHref: string;
  showSecondaryButton: boolean;
  secondaryButtonLabelAr: string;
  secondaryButtonLabelEn: string;
  secondaryButtonHref: string;
}

export interface PlatformSettings {
  enableTeacherApplications: boolean;
  enableStudentRegistration: boolean;
  enablePayments: boolean;
  maintenanceMode: boolean;
  contactEmail: string;
  socialLinks: Array<{ platform: string; url: string; icon: string }>;
}

export interface PlatformConfig {
  _id: string;
  platformName: LocalizedText;
  logoUrl: string;
  defaultLanguage: 'ar' | 'en';
  navbar: { items: NavItem[] };
  landing: { hero: HeroConfig; sections: LandingSection[] };
  settings: PlatformSettings;
  version: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Fetch the platform config. Public — no auth required. */
export async function fetchPlatformConfig(): Promise<PlatformConfig> {
  const { data } = await api.get<PlatformConfig>('/platform-config');
  return data;
}

/** Replace the entire platform config. Admin only. */
export async function savePlatformConfig(config: Partial<PlatformConfig>): Promise<PlatformConfig> {
  const { data } = await api.put<PlatformConfig>('/platform-config', config);
  return data;
}

/** Reset config to factory defaults. Admin only. */
export async function resetPlatformConfig(): Promise<PlatformConfig> {
  const { data } = await api.post<PlatformConfig>('/platform-config/reset');
  return data;
}
