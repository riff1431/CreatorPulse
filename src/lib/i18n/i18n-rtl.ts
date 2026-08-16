const RTL_LOCALES = new Set([
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian/Farsi
  'ur', // Urdu
  'ps', // Pashto
  'sd', // Sindhi
  'ug', // Uyghur
  'yi', // Yiddish
  'ckb', // Kurdish (Sorani)
]);

export function isRTL(localeCode: string): boolean {
  if (!localeCode) return false;
  const baseLocale = localeCode.toLowerCase().split('-')[0];
  return RTL_LOCALES.has(baseLocale);
}
