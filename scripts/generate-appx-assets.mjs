/**
 * Generates branded Windows Store tile assets for the SoundFind APPX package.
 * Output: electron/appx-assets/ — referenced by electron-builder appx.assets config.
 *
 * Tile specs: https://learn.microsoft.com/en-us/windows/apps/design/style/app-icons-and-logos
 *
 * Usage: node scripts/generate-appx-assets.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, '..');
const SOURCE     = join(ROOT, 'public', 'icon.png');
const OUT_DIR    = join(ROOT, 'electron', 'appx-assets');

mkdirSync(OUT_DIR, { recursive: true });

const BG = { r: 15, g: 14, b: 26, alpha: 1 }; // #0f0e1a — brand dark background

/**
 * Compose icon onto a solid background, icon scaled to `iconFraction` of the canvas.
 */
async function makeTile(filename, width, height, iconFraction = 0.6) {
  const iconSize = Math.round(Math.min(width, height) * iconFraction);

  const resizedIcon = await sharp(SOURCE)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const left = Math.round((width  - iconSize) / 2);
  const top  = Math.round((height - iconSize) / 2);

  await sharp({
    create: { width, height, channels: 4, background: BG },
  })
    .composite([{ input: resizedIcon, left, top }])
    .png()
    .toFile(join(OUT_DIR, filename));

  console.log(`  ✓ ${filename} (${width}×${height})`);
}

console.log('Generating SoundFind APPX tile assets...');

await makeTile('StoreLogo.png',          50,  50,  0.70);
await makeTile('Square44x44Logo.png',    44,  44,  0.70);
await makeTile('Square150x150Logo.png', 150, 150,  0.65);
await makeTile('Wide310x150Logo.png',   310, 150,  0.55);
await makeTile('Square310x310Logo.png', 310, 310,  0.65);
await makeTile('SplashScreen.png',      620, 300,  0.40);

console.log(`\nDone — assets written to electron/appx-assets/`);
