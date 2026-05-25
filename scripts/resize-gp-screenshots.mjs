import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = resolve(__dirname, '../assets/screenshots/google_play_phone');

const TARGET_W = 1080;
const TARGET_H = 1920;
const BG = { r: 15, g: 14, b: 26, alpha: 1 }; // #0f0e1a brand dark

const files = [
  { src: 'screen1.png', dest: 'sf-gp-phone-1.jpg' },
  { src: 'screen2.png', dest: 'sf-gp-phone-2.jpg' },
  { src: 'screen3.png', dest: 'sf-gp-phone-3.jpg' },
  { src: 'screen4.png', dest: 'sf-gp-phone-4.jpg' },
];

for (const { src, dest } of files) {
  const srcPath  = resolve(dir, src);
  const destPath = resolve(dir, dest);
  const meta = await sharp(srcPath).metadata();
  console.log(`${src}: ${meta.width}x${meta.height}`);

  await sharp(srcPath)
    .flatten({ background: BG })
    .resize(TARGET_W, TARGET_H, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 95 })
    .toFile(destPath);

  console.log(`  → ${dest}`);
}

// Remove source screen*.png files
import { unlink } from 'fs/promises';
for (const { src } of files) {
  await unlink(resolve(dir, src));
}

console.log('\nDone. Source files removed.');
