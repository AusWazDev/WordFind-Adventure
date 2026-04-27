/**
 * Post-processes the electron-builder APPX to replace auto-generated tile
 * assets (white-background defaults) with branded SoundFind tiles.
 *
 * Run AFTER npm run electron:dist:
 *   node scripts/patch-appx-assets.mjs
 *
 * Uses adm-zip to patch only the asset entries in-place — no full extraction needed.
 * Partner Center signs the package on their end; no local signing required.
 */

import AdmZip from 'adm-zip';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dirname, '..');
const APPX    = join(ROOT, 'electron-dist', 'SoundFind 1.0.0.appx');
const ASSETS  = join(ROOT, 'electron', 'appx-assets');

if (!existsSync(APPX)) {
  console.error('ERROR: APPX not found. Run npm run electron:dist first.');
  process.exit(1);
}

const TILE_NAMES = [
  'StoreLogo.png',
  'Square44x44Logo.png',
  'Square150x150Logo.png',
  'Wide310x150Logo.png',
];

for (const name of TILE_NAMES) {
  if (!existsSync(join(ASSETS, name))) {
    console.error(`ERROR: Missing branded asset: electron/appx-assets/${name}`);
    console.error('Run scripts/generate-appx-assets.mjs first.');
    process.exit(1);
  }
}

console.log('Opening APPX...');
const zip = new AdmZip(APPX);

console.log('Replacing tile assets...');
for (const name of TILE_NAMES) {
  const entryPath  = `assets/${name}`;
  const branded    = readFileSync(join(ASSETS, name));
  const entry      = zip.getEntry(entryPath);

  if (entry) {
    zip.deleteFile(entryPath);
    console.log(`  ✓ replaced ${entryPath}`);
  } else {
    console.log(`  + added   ${entryPath} (was missing)`);
  }
  zip.addFile(entryPath, branded);
}

console.log('Writing patched APPX...');
zip.writeZip(APPX);

console.log(`\nDone — electron-dist/SoundFind 1.0.0.appx patched with branded tiles.`);
