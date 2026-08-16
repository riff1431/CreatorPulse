import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let locale = 'en';
    let content = '';
    let format = 'json';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      locale = (formData.get('locale') as string) || 'en';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No translation file provided' }, { status: 400 });
      }

      content = await file.text();
      format = file.name.endsWith('.csv') ? 'csv' : 'json';
    } else {
      const body = await req.json();
      locale = body.locale || 'en';
      content = body.content || '';
      format = body.format || 'json';
    }

    const importedDict: Record<string, Record<string, string>> = {};
    let addedCount = 0;
    let updatedCount = 0;
    const details: string[] = [];

    if (format === 'csv') {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (idx === 0 || !line.trim()) return; // skip header / empty lines
        const parts = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
        if (parts.length >= 3) {
          const ns = parts[0].replace(/^"|"$/g, '').trim();
          const key = parts[1].replace(/^"|"$/g, '').trim();
          const val = parts[2].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
          if (ns && key) {
            importedDict[ns] = importedDict[ns] || {};
            importedDict[ns][key] = val;
            addedCount++;
          }
        }
      });
    } else {
      // JSON format parsing
      const parsed = JSON.parse(content);
      Object.entries(parsed).forEach(([nsOrKey, nsValue]: [string, any]) => {
        if (typeof nsValue === 'object' && nsValue !== null) {
          importedDict[nsOrKey] = importedDict[nsOrKey] || {};
          Object.entries(nsValue).forEach(([k, v]) => {
            importedDict[nsOrKey][k] = String(v);
            addedCount++;
          });
        } else {
          // Flat key fallback e.g. "common.welcome": "Bienvenido"
          const parts = nsOrKey.split('.');
          const ns = parts.length > 1 ? parts[0] : 'common';
          const key = parts.length > 1 ? parts.slice(1).join('.') : nsOrKey;
          importedDict[ns] = importedDict[ns] || {};
          importedDict[ns][key] = String(nsValue);
          addedCount++;
        }
      });
    }

    details.push(`Processed ${addedCount} total translation key entries for locale '${locale}'.`);

    return NextResponse.json({
      success: true,
      locale,
      translations: importedDict,
      summary: {
        added: addedCount,
        updated: updatedCount,
        skipped: 0,
        details,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to parse translation file: ' + err.message }, { status: 400 });
  }
}
