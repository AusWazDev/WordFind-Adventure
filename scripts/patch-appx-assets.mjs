/**
 * Post-processes the electron-builder APPX to replace auto-generated tile
 * assets (white-background defaults) with branded SoundFind tiles.
 *
 * Uses makeappx.exe to unpack and repack — preserves the strict APPX zip
 * format that generic zip libraries corrupt.
 *
 * Run AFTER npm run electron:build-web && electron-builder --win appx:
 *   node scripts/patch-appx-assets.mjs
 */

import { execSync }                          from 'child_process';
import { copyFileSync, existsSync, rmSync }  from 'fs';
import { mkdirSync, readFileSync }           from 'fs';
import { join, dirname }                     from 'path';
import { fileURLToPath }                     from 'url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, '..');
const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const APPX_IN    = join(ROOT, 'electron-dist', `SoundFind ${version}.appx`);
const STAGING    = join(ROOT, 'electron-dist', '_appx-staging');
const ASSETS_SRC = join(ROOT, 'electron', 'appx-assets');
const MAKEAPPX   = 'C:/Program Files (x86)/Windows Kits/10/bin/10.0.22621.0/x64/makeappx.exe';

const TILE_NAMES = [
  'StoreLogo.png',
  'Square44x44Logo.png',
  'Square150x150Logo.png',
  'Wide310x150Logo.png',
];

// Preflight checks
if (!existsSync(APPX_IN)) {
  console.error('ERROR: APPX not found — run electron-builder first.');
  process.exit(1);
}
for (const name of TILE_NAMES) {
  if (!existsSync(join(ASSETS_SRC, name))) {
    console.error(`ERROR: Missing branded asset electron/appx-assets/${name}`);
    console.error('Run scripts/generate-appx-assets.mjs first.');
    process.exit(1);
  }
}

// Clean staging dir
if (existsSync(STAGING)) rmSync(STAGING, { recursive: true });
mkdirSync(STAGING, { recursive: true });

// Unpack using makeappx
console.log('Unpacking APPX with makeappx...');
execSync(`"${MAKEAPPX}" unpack /p "${APPX_IN}" /d "${STAGING}" /o`, { stdio: 'inherit' });

// Replace tile assets
console.log('\nReplacing tile assets...');
for (const name of TILE_NAMES) {
  const dest = join(STAGING, 'assets', name);
  copyFileSync(join(ASSETS_SRC, name), dest);
  console.log(`  ✓ assets/${name}`);
}

// Repack using makeappx (overwrites original)
console.log('\nRepacking APPX with makeappx...');
execSync(`"${MAKEAPPX}" pack /d "${STAGING}" /p "${APPX_IN}" /o`, { stdio: 'inherit' });

// Clean up staging
rmSync(STAGING, { recursive: true });

console.log(`\nDone — electron-dist/SoundFind ${version}.appx patched with branded tiles.`);
