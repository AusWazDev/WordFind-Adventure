// Builds the Microsoft Store addon (native/windows-store) and copies it to
// electron/native/windows_store.node, where electron/main.cjs loads it and
// electron-builder packages it (S25, SF-75). Windows only.
//
// Built against Node-API (ABI-stable), so one build serves Electron's Node-API too.
// Run: npm run electron:addon   (electron:dist runs it first)
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'win32') {
  console.log('[windows-store] not Windows: skipped');
  process.exit(0);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const addonDir = join(root, 'native', 'windows-store');
const require = createRequire(import.meta.url);

// node-gyp: the repo's copy if present, else the one npm ships with.
let gyp;
try {
  gyp = require.resolve('node-gyp/bin/node-gyp.js');
} catch {
  gyp = join(dirname(process.execPath), 'node_modules', 'npm', 'node_modules', 'node-gyp', 'bin', 'node-gyp.js');
}
if (!existsSync(gyp)) throw new Error(`[windows-store] node-gyp not found (looked for ${gyp})`);

execFileSync(process.execPath, [gyp, 'rebuild', '--directory', addonDir], { stdio: 'inherit' });

const built = join(addonDir, 'build', 'Release', 'windows_store.node');
const outDir = join(root, 'electron', 'native');
mkdirSync(outDir, { recursive: true });
copyFileSync(built, join(outDir, 'windows_store.node'));
console.log(`[windows-store] built and copied to ${join(outDir, 'windows_store.node')}`);
