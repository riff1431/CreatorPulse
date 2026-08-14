const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../src/app/admin');

const replacements = [
  // Flat hex string colors in JSX styles/props
  { search: /#EC4899/gi, replace: '#4F46E5' }, // indigo-600
  { search: /#BE185D/gi, replace: '#4338CA' }, // indigo-700
  { search: /#BE123C/gi, replace: '#B91C1C' }, // red-700
  { search: /#F43F5E/gi, replace: '#EF4444' }, // red-500
  { search: /#F472B6/gi, replace: '#6366F1' }, // indigo-500
  { search: /#FBCFE8/gi, replace: '#E2E8F0' }, // slate-200
  { search: /#FCE7F3/gi, replace: '#EEF2FF' }, // indigo-50
  { search: /#FFF9FC/gi, replace: '#F8FAFC' }, // slate-50
  { search: /#FFF1F7/gi, replace: '#F1F5F9' }, // slate-100
  { search: /#FFE4E6/gi, replace: '#FEE2E2' }, // red-50
  { search: /#F3DCE8/gi, replace: '#E2E8F0' }, // slate-200

  // Hardcoded classes
  { search: /bg-\[\#EC4899\]/g, replace: 'bg-indigo-600' },
  { search: /bg-\[\#BE185D\]/g, replace: 'bg-indigo-700' },
  { search: /text-\[\#EC4899\]/g, replace: 'text-indigo-600' },
  { search: /text-\[\#BE185D\]/g, replace: 'text-indigo-700' },
  { search: /accent-\[\#EC4899\]/g, replace: 'accent-indigo-600' },
  { search: /peer-checked:bg-\[\#EC4899\]/g, replace: 'peer-checked:bg-indigo-600' },
  { search: /hover:border-\[\#EC4899\]/g, replace: 'hover:border-indigo-600' },
  { search: /border-\[\#EC4899\]/g, replace: 'border-indigo-600' },
  { search: /ring-\[\#EC4899\]\/20/g, replace: 'ring-indigo-600/20' },
  { search: /shadow-\[\#EC4899\]\/10/g, replace: 'shadow-indigo-600/10' },
  { search: /shadow-\[\#EC4899\]\/15/g, replace: 'shadow-indigo-600/15' },
  { search: /shadow-\[\#EC4899\]\/40/g, replace: 'shadow-indigo-600/40' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;

      for (const rep of replacements) {
        content = content.replace(rep.search, rep.replace);
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated inline values in: ${path.relative(path.join(__dirname, '..'), filePath)}`);
      }
    }
  }
}

console.log('Starting automated inline value replacement for Admin pages...');
processDirectory(adminDir);
console.log('Automated inline replacement complete!');
