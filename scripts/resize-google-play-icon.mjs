import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, '../assets/store_logo_1080x1080.png');
const dest = resolve(__dirname, '../assets/google_play_icon_512.png');

await sharp(src)
  .resize(512, 512, { fit: 'cover' })
  .png()
  .toFile(dest);

console.log('Done: assets/google_play_icon_512.png');
