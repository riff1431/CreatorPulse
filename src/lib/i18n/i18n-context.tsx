'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Language, 
  LanguageConfig, 
  TranslationDictionary, 
  MissingKeyEntry 
} from './i18n-types';
import { 
  DEFAULT_LANGUAGES, 
  DEFAULT_ENGLISH_TRANSLATIONS, 
  DEFAULT_SPANISH_TRANSLATIONS, 
  DEFAULT_ARABIC_TRANSLATIONS 
} from './i18n-defaults';
import { isRTL } from './i18n-rtl';

const STORAGE_KEY = 'creatorpulse_i18n_config';
const MISSING_KEYS_KEY = 'creatorpulse_i18n_missing_keys';

interface I18nContextType {
  locale: string;
  defaultLocale: string;
  isRtl: boolean;
  languages: Language[];
  translations: Record<string, TranslationDictionary>; // locale -> ns -> key -> val
  isLoading: boolean;
  missingKeys: MissingKeyEntry[];
  
  t: (key: string, namespace?: string, vars?: Record<string, string | number>) => string;
  setLocale: (code: string) => Promise<void>;
  updateTranslationKey: (locale: string, namespace: string, key: string, value: string) => Promise<void>;
  bulkUpdateTranslations: (locale: string, newDict: TranslationDictionary) => Promise<void>;
  addLanguage: (language: Language) => Promise<void>;
  updateLanguage: (code: string, updates: Partial<Language>) => Promise<void>;
  deleteLanguage: (code: string) => Promise<void>;
  setDefaultLanguage: (code: string) => Promise<void>;
  registerPluginTranslations: (pluginId: string, pluginTranslations?: Record<string, TranslationDictionary>) => void;
  clearMissingKeys: () => void;
  resetToDefaults: () => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const INITIAL_TRANSLATIONS: Record<string, TranslationDictionary> = {
  en: DEFAULT_ENGLISH_TRANSLATIONS,
  es: DEFAULT_SPANISH_TRANSLATIONS,
  ar: DEFAULT_ARABIC_TRANSLATIONS,
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>('en');
  const [defaultLocale, setDefaultLocale] = useState<string>('en');
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [translations, setTranslations] = useState<Record<string, TranslationDictionary>>(INITIAL_TRANSLATIONS);
  const [missingKeys, setMissingKeys] = useState<MissingKeyEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply HTML document attributes for lang and dir (RTL support)
  const applyDocumentAttributes = useCallback((langCode: string, rtl: boolean) => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = langCode;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    if (rtl) {
      document.documentElement.classList.add('is-rtl');
    } else {
      document.documentElement.classList.remove('is-rtl');
    }
  }, []);

  // 1. Initial hydration from localStorage and live API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load missing keys cache
    try {
      const savedMissing = localStorage.getItem(MISSING_KEYS_KEY);
      if (savedMissing) {
        setMissingKeys(JSON.parse(savedMissing));
      }
    } catch (e) {}

    // Load saved i18n config
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.defaultLocale) setDefaultLocale(parsed.defaultLocale);
        if (parsed.languages) setLanguages(parsed.languages);
        if (parsed.translations) {
          setTranslations((prev) => ({
            ...prev,
            ...parsed.translations,
          }));
        }
        const activeLang = parsed.currentLocale || parsed.defaultLocale || 'en';
        setLocaleState(activeLang);
        const langObj = (parsed.languages || DEFAULT_LANGUAGES).find((l: Language) => l.code === activeLang);
        const rtl = langObj ? langObj.isRtl : isRTL(activeLang);
        applyDocumentAttributes(activeLang, rtl);
      } catch (e) {
        console.error('Failed to parse i18n local storage:', e);
      }
    } else {
      applyDocumentAttributes('en', false);
    }

    // Sync with server API
    const fetchServerConfig = async () => {
      try {
        const res = await fetch('/api/admin/i18n');
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.config) {
            const { defaultLocale: def, languages: langs, translations: trans } = data.config;
            if (def) setDefaultLocale(def);
            if (langs) setLanguages(langs);
            if (trans) {
              setTranslations((prev) => ({
                ...prev,
                ...trans,
              }));
            }
          }
        }
      } catch (e) {
        // Fallback to local state
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerConfig();
  }, [applyDocumentAttributes]);

  // Persist helper
  const saveConfig = async (
    newDefLocale: string,
    newLangs: Language[],
    newTrans: Record<string, TranslationDictionary>,
    newCurrLocale?: string
  ) => {
    const activeLocale = newCurrLocale || locale;
    const configData = {
      defaultLocale: newDefLocale,
      currentLocale: activeLocale,
      languages: newLangs,
      translations: newTrans,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configData));
      document.cookie = `NEXT_LOCALE=${activeLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    try {
      await fetch('/api/admin/i18n', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });
    } catch (e) {
      console.error('Failed to save i18n config to server:', e);
    }
  };

  // Main Translation Function `t()`
  const t = useCallback(
    (key: string, namespace: string = 'common', vars?: Record<string, string | number>): string => {
      // 1. Try target locale dictionary
      const localeDict = translations[locale]?.[namespace];
      let value = localeDict?.[key];

      // 2. Fallback to default locale (e.g. 'en') dictionary if missing
      if (value === undefined && locale !== defaultLocale) {
        value = translations[defaultLocale]?.[namespace]?.[key];
      }

      // 3. Fallback to English built-in defaults if missing
      if (value === undefined) {
        value = DEFAULT_ENGLISH_TRANSLATIONS[namespace]?.[key];
      }

      // 4. Record missing key if still not found
      if (value === undefined) {
        value = key; // Fallback to raw key string

        if (typeof window !== 'undefined') {
          setMissingKeys((prev) => {
            const existingIndex = prev.findIndex((m) => m.key === key && m.namespace === namespace);
            let updated: MissingKeyEntry[];
            if (existingIndex >= 0) {
              updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                count: updated[existingIndex].count + 1,
                requestedAt: new Date().toISOString(),
              };
            } else {
              updated = [
                ...prev,
                {
                  key,
                  namespace,
                  requestedAt: new Date().toISOString(),
                  count: 1,
                },
              ];
            }
            localStorage.setItem(MISSING_KEYS_KEY, JSON.stringify(updated.slice(0, 100)));
            return updated;
          });
        }
      }

      // Interpolate variables {{var}}
      if (vars && typeof value === 'string') {
        Object.entries(vars).forEach(([k, v]) => {
          value = (value as string).replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
        });
      }

      return value;
    },
    [locale, defaultLocale, translations]
  );

  // Switch Active Locale Dynamically
  const setLocale = async (code: string) => {
    const langObj = languages.find((l) => l.code === code);
    const rtl = langObj ? langObj.isRtl : isRTL(code);

    setLocaleState(code);
    applyDocumentAttributes(code, rtl);
    await saveConfig(defaultLocale, languages, translations, code);
  };

  // Update Single Key
  const updateTranslationKey = async (
    targetLocale: string,
    namespace: string,
    key: string,
    value: string
  ) => {
    const updatedTrans = {
      ...translations,
      [targetLocale]: {
        ...(translations[targetLocale] || {}),
        [namespace]: {
          ...(translations[targetLocale]?.[namespace] || {}),
          [key]: value,
        },
      },
    };
    setTranslations(updatedTrans);

    // Remove from missing keys if resolved
    setMissingKeys((prev) => {
      const filtered = prev.filter((m) => !(m.key === key && m.namespace === namespace));
      if (typeof window !== 'undefined') {
        localStorage.setItem(MISSING_KEYS_KEY, JSON.stringify(filtered));
      }
      return filtered;
    });

    await saveConfig(defaultLocale, languages, updatedTrans);
  };

  // Bulk update translations (for imports)
  const bulkUpdateTranslations = async (targetLocale: string, newDict: TranslationDictionary) => {
    const currentLocDict = translations[targetLocale] || {};
    const mergedDict: TranslationDictionary = { ...currentLocDict };

    Object.entries(newDict).forEach(([ns, keys]) => {
      mergedDict[ns] = {
        ...(mergedDict[ns] || {}),
        ...keys,
      };
    });

    const updatedTrans = {
      ...translations,
      [targetLocale]: mergedDict,
    };

    setTranslations(updatedTrans);
    await saveConfig(defaultLocale, languages, updatedTrans);
  };

  // Language management
  const addLanguage = async (newLang: Language) => {
    const updatedLangs = [...languages, newLang];
    setLanguages(updatedLangs);
    const updatedTrans = {
      ...translations,
      [newLang.code]: translations[newLang.code] || {},
    };
    setTranslations(updatedTrans);
    await saveConfig(defaultLocale, updatedLangs, updatedTrans);
  };

  const updateLanguage = async (code: string, updates: Partial<Language>) => {
    const updatedLangs = languages.map((l) => (l.code === code ? { ...l, ...updates } : l));
    setLanguages(updatedLangs);
    await saveConfig(defaultLocale, updatedLangs, translations);
  };

  const deleteLanguage = async (code: string) => {
    if (code === defaultLocale) {
      throw new Error('Cannot delete the default language');
    }
    const updatedLangs = languages.filter((l) => l.code !== code);
    const { [code]: deleted, ...remainingTrans } = translations;
    setLanguages(updatedLangs);
    setTranslations(remainingTrans);

    let nextLocale = locale;
    if (locale === code) {
      nextLocale = defaultLocale;
      setLocaleState(defaultLocale);
      const defLangObj = updatedLangs.find((l) => l.code === defaultLocale);
      applyDocumentAttributes(defaultLocale, defLangObj ? defLangObj.isRtl : false);
    }

    await saveConfig(defaultLocale, updatedLangs, remainingTrans, nextLocale);
  };

  const setDefaultLanguage = async (code: string) => {
    const updatedLangs = languages.map((l) => ({
      ...l,
      isDefault: l.code === code,
      isEnabled: l.code === code ? true : l.isEnabled,
    }));
    setDefaultLocale(code);
    setLanguages(updatedLangs);
    await saveConfig(code, updatedLangs, translations);
  };

  // Register Plugin / Theme Translations
  const registerPluginTranslations = (
    pluginId: string,
    pluginTranslations?: Record<string, TranslationDictionary>
  ) => {
    if (!pluginTranslations) return;

    setTranslations((prev) => {
      const next = { ...prev };
      Object.entries(pluginTranslations).forEach(([loc, dict]) => {
        next[loc] = next[loc] || {};
        Object.entries(dict).forEach(([ns, keys]) => {
          next[loc][ns] = {
            ...(next[loc][ns] || {}),
            ...keys,
          };
        });
      });
      return next;
    });
  };

  const clearMissingKeys = () => {
    setMissingKeys([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MISSING_KEYS_KEY);
    }
  };

  const resetToDefaults = async () => {
    setLocaleState('en');
    setDefaultLocale('en');
    setLanguages(DEFAULT_LANGUAGES);
    setTranslations(INITIAL_TRANSLATIONS);
    setMissingKeys([]);
    applyDocumentAttributes('en', false);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MISSING_KEYS_KEY);
    }

    await saveConfig('en', DEFAULT_LANGUAGES, INITIAL_TRANSLATIONS, 'en');
  };

  const currentLangObj = languages.find((l) => l.code === locale);
  const isRtl = currentLangObj ? currentLangObj.isRtl : isRTL(locale);

  return (
    <I18nContext.Provider
      value={{
        locale,
        defaultLocale,
        isRtl,
        languages,
        translations,
        isLoading,
        missingKeys,
        t,
        setLocale,
        updateTranslationKey,
        bulkUpdateTranslations,
        addLanguage,
        updateLanguage,
        deleteLanguage,
        setDefaultLanguage,
        registerPluginTranslations,
        clearMissingKeys,
        resetToDefaults,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
