import { NextResponse } from 'next/server';
import { DEFAULT_ENGLISH_TRANSLATIONS, DEFAULT_SPANISH_TRANSLATIONS, DEFAULT_ARABIC_TRANSLATIONS } from '@/lib/i18n/i18n-defaults';

const MOCK_STORE: Record<string, any> = {
  en: DEFAULT_ENGLISH_TRANSLATIONS,
  es: DEFAULT_SPANISH_TRANSLATIONS,
  ar: DEFAULT_ARABIC_TRANSLATIONS,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'en';
  const format = searchParams.get('format') || 'json';

  const dict = MOCK_STORE[locale] || MOCK_STORE['en'] || {};

  if (format === 'csv') {
    let csvContent = 'Namespace,Key,Translation\n';
    Object.entries(dict).forEach(([ns, keys]: [string, any]) => {
      Object.entries(keys).forEach(([key, val]) => {
        const cleanVal = String(val).replace(/"/g, '""');
        csvContent += `"${ns}","${key}","${cleanVal}"\n`;
      });
    });

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="translations_${locale}.csv"`,
      },
    });
  }

  // Default JSON format
  return new Response(JSON.stringify(dict, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="translations_${locale}.json"`,
    },
  });
}
