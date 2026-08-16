export type TranslationNamespace = 'common' | 'auth' | 'feed' | 'creator' | 'admin' | 'member' | 'plugins' | string;

export interface Language {
  code: string; // e.g. 'en', 'es', 'ar', 'fr', 'de'
  name: string; // e.g. 'English', 'Spanish', 'Arabic'
  nativeName: string; // e.g. 'English', 'Español', 'العربية'
  flag: string; // Emoji flag or icon code
  isRtl: boolean;
  isEnabled: boolean;
  isDefault: boolean;
  completionPercentage?: number;
}

export type TranslationDictionary = Record<string, Record<string, string>>; // namespace -> key -> string

export interface LanguageConfig {
  defaultLocale: string;
  activeLocales: string[];
  languages: Language[];
  translations: Record<string, TranslationDictionary>; // locale -> namespace -> key -> string
}

export interface MissingKeyEntry {
  key: string;
  namespace: string;
  requestedAt: string;
  count: number;
}

export interface ImportDiffSummary {
  added: number;
  updated: number;
  skipped: number;
  details: string[];
}
