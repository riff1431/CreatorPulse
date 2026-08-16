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

async function createPipraPayZip() {
  const pluginsDir = path.join(__dirname, '..', 'plugins');
  const sourceDir = path.join(pluginsDir, 'piprapay');
  const outputZipPath = path.join(pluginsDir, 'piprapay.zip');

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source plugin directory not found at: ${sourceDir}`);
    process.exit(1);
  }

  const zip = new JSZip();
  // Add single root directory "piprapay"
  const rootZip = zip.folder('piprapay');
  await addDirectoryToZip(rootZip, sourceDir, '');

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  fs.writeFileSync(outputZipPath, content);
  console.log(`[Plugin Packager] PipraPay ZIP archive created successfully at: ${outputZipPath}`);
  console.log(`File size: ${content.length} bytes`);
}

createPipraPayZip().catch((err) => {
  console.error('[Plugin Packager Error]', err);
  process.exit(1);
});

