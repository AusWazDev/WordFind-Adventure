/**
 * Generates branded Windows Store tile assets for the SoundFind APPX package.
 * Output: electron/appx-assets/
 *
 * Usage: node scripts/generate-appx-assets.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dirname, '..');
const SOURCE  = join(ROOT, 'public', 'icon.png');
const OUT_DIR = join(ROOT, 'electron', 'appx-assets');

mkdirSync(OUT_DIR, { recursive: true });

const BG = { r: 15, g: 14, b: 26, alpha: 1 }; // #0f0e1a brand dark

// Square tile — icon fills fraction of canvas, centred
async function makeSquareTile(filename, size, iconFraction) {
  const iconSize = Math.round(size * iconFraction);
  const icon = await sharp(SOURCE)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();

  const offset = Math.round((size - iconSize) / 2);
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: icon, left: offset, top: offset }])
    .png()
    .toFile(join(OUT_DIR, filename));

  console.log(`  ✓ ${filename} (${size}×${size}, icon ${iconFraction * 100}%)`);
}

// Wide tile — icon fills height with padding, left side; "SoundFind" text right side
async function makeWideTile(filename, width, height) {
  const padding  = Math.round(height * 0.1);
  const iconSize = height - padding * 2;

  const icon = await sharp(SOURCE)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();

  // SVG text: "SoundFind" in two lines, white/violet
  const textAreaWidth = width - iconSize - padding * 3;
  const fontSize = Math.round(iconSize * 0.32);
  const svg = Buffer.from(
    `<svg width="${textAreaWidth}" height="${iconSize}" xmlns="http://www.w3.org/2000/svg">` +
    `<text x="0" y="${Math.round(iconSize * 0.45)}" font-family="Arial" font-weight="bold" font-size="${fontSize}" fill="#ffffff">Sound</text>` +
    `<text x="0" y="${Math.round(iconSize * 0.82)}" font-family="Arial" font-weight="bold" font-size="${fontSize}" fill="#a78bfa">Find</text>` +
    `</svg>`
  );

  const textLeft = iconSize + padding * 2;
  const textTop  = padding;

  await sharp({ create: { width, height, channels: 4, background: BG } })
    .composite([
      { input: icon, left: padding, top: padding },
      { input: svg,  left: textLeft, top: textTop },
    ])
    .png()
    .toFile(join(OUT_DIR, filename));

  console.log(`  ✓ ${filename} (${width}×${height}, icon+text layout)`);
}

console.log('Generating SoundFind APPX tile assets...');

await makeSquareTile('StoreLogo.png',          50,  0.85);
await makeSquareTile('Square44x44Logo.png',    44,  0.85);
await makeSquareTile('Square150x150Logo.png', 150,  0.85);
await makeSquareTile('Square310x310Logo.png', 310,  0.85);
await makeSquareTile('SplashScreen.png',      620,  0.50);
await makeWideTile(  'Wide310x150Logo.png',   310, 150);

console.log('\nDone — assets written to electron/appx-assets/');
