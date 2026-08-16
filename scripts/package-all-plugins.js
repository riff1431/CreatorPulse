const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function addDirectoryToZip(zip, dirPath, rootPath = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = rootPath ? `${rootPath}/${entry.name}` : entry.name;

    if (entry.name === '.DS_Store' || entry.name.startsWith('__MACOSX')) continue;

    if (entry.isDirectory()) {
      zip.folder(relativePath);
      await addDirectoryToZip(zip, fullPath, relativePath);
    } else {
      const content = fs.readFileSync(fullPath);
      zip.file(relativePath, content);
    }
  }
}

async function packagePlugin(pluginName) {
  const pluginsDir = path.join(__dirname, '..', 'plugins');
  const sourceDir = path.join(pluginsDir, pluginName);
  const outputZipPath = path.join(pluginsDir, `${pluginName}.zip`);

  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    return;
  }

  const zip = new JSZip();
  // Standard single root directory inside ZIP matching plugin folder name
  const rootZip = zip.folder(pluginName);
  await addDirectoryToZip(rootZip, sourceDir, '');

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  fs.writeFileSync(outputZipPath, content);
  console.log(`[Plugin Packager] Generated: plugins/${pluginName}.zip (${content.length} bytes)`);
}

async function packageAllPlugins() {
  const pluginsDir = path.join(__dirname, '..', 'plugins');
  const entries = fs.readdirSync(pluginsDir);
  const pluginFolders = entries.filter((e) => fs.statSync(path.join(pluginsDir, e)).isDirectory());

  console.log(`Starting packaging for ${pluginFolders.length} Plugin SDK packages...`);

  for (const folder of pluginFolders) {
    await packagePlugin(folder);
  }

  console.log(`\n🎉 Successfully generated ZIP packages for all ${pluginFolders.length} plugins!`);
}

packageAllPlugins().catch((err) => {
  console.error('[Plugin Packager Error]', err);
  process.exit(1);
});
