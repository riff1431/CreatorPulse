const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../src/app/admin');

// Suffix replacement mapping
const replacements = [
  // UI Component Imports
  { search: /from '@\/components\/ui\/Card'/g, replace: "from '@/components/admin/ui/Card'" },
  { search: /from '@\/components\/ui\/Badge'/g, replace: "from '@/components/admin/ui/Badge'" },
  { search: /from '@\/components\/ui\/Button'/g, replace: "from '@/components/admin/ui/Button'" },
  { search: /from '@\/components\/ui\/Modal'/g, replace: "from '@/components/admin/ui/Modal'" },
  { search: /from '@\/components\/ui\/Avatar'/g, replace: "from '@/components/admin/ui/Avatar'" },
  { search: /from '@\/components\/ui\/Sparkline'/g, replace: "from '@/components/admin/ui/Sparkline'" },

  // Sparkline props specifically
  { search: /color="#BE185D"/g, replace: 'color="#4F46E5"' },
  { search: /fillColor="rgba\(190, 24, 93, 0\.1\)"/g, replace: 'fillColor="rgba(79, 70, 229, 0.05)"' },

  // Pink custom text colors
  { search: /text-\[\#EC4899\]/g, replace: 'text-indigo-600' },
  { search: /text-\[\#BE185D\]/g, replace: 'text-indigo-700' },
  { search: /text-\[\#BE123C\]/g, replace: 'text-red-700' },
  { search: /text-\[\#F43F5E\]/g, replace: 'text-red-600' },
  { search: /hover:text-\[\#EC4899\]/g, replace: 'hover:text-indigo-600' },
  { search: /hover:text-\[\#F43F5E\]/g, replace: 'hover:text-red-600' },
  { search: /group-hover:text-\[\#EC4899\]/g, replace: 'group-hover:text-indigo-600' },
  { search: /group-hover:text-\[\#F43F5E\]/g, replace: 'group-hover:text-red-600' },

  // Pink backgrounds
  { search: /bg-\[\#FFF9FC\]/g, replace: 'bg-slate-50' },
  { search: /bg-\[\#FFF1F7\]/g, replace: 'bg-slate-100' },
  { search: /bg-\[\#FCE7F3\]/g, replace: 'bg-indigo-50' },
  { search: /bg-\[\#FFE4E6\]/g, replace: 'bg-red-50' },
  { search: /bg-\[\#FDF2F8\]/g, replace: 'bg-indigo-50/30' },
  { search: /hover:bg-\[\#FFF1F7\]/g, replace: 'hover:bg-slate-100' },
  { search: /hover:bg-\[\#FFF1F7\]\/50/g, replace: 'hover:bg-slate-50' },
  { search: /hover:bg-\[\#FCE7F3\]\/50/g, replace: 'hover:bg-indigo-50/50' },

  // Pink borders and dividers
  { search: /border-\[\#F3DCE8\]/g, replace: 'border-slate-200' },
  { search: /border-\[\#FBCFE8\]/g, replace: 'border-slate-300' },
  { search: /border-\[\#F3DCE8\]\/50/g, replace: 'border-slate-200/50' },
  { search: /divide-\[\#F3DCE8\]/g, replace: 'divide-slate-200' },
  { search: /divide-\[\#F3DCE8\]\/60/g, replace: 'divide-slate-100' },
  { search: /hover:border-\[\#F472B6\]/g, replace: 'hover:border-slate-300' },
  { search: /focus:border-\[\#EC4899\]/g, replace: 'focus:border-indigo-500' },
  { search: /focus:ring-\[\#EC4899\]\/30/g, replace: 'focus:ring-indigo-500/20' }
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
        console.log(`Updated styles/imports in: ${path.relative(path.join(__dirname, '..'), filePath)}`);
      }
    }
  }
}

console.log('Starting automated refactor of Admin route views...');
processDirectory(adminDir);
console.log('Automated refactor complete!');
