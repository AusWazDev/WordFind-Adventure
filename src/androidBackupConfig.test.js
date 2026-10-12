// SF-48, decision S40-B: Android backup stays on Auto Backup's defaults, pinned here.
// Measured 12 Oct 2026 on one Android tablet (SF-47): with only android:allowBackup="true"
// and no rules, an uninstall and reinstall restored BOTH the WebView's localStorage
// (wf_progress, the hint balance) and RevenueCat's SharedPreferences (the same anonymous
// app user ID); with backup disabled, neither came back. Normal backups run about daily.
// A rules file or a backup agent changes what is saved; it must keep both together.
//
// SF48_ANDROID_MAIN points the checks at a scratch copy of android/app/src/main (used
// for the controls); by default they read the repo's own files.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const MAIN = process.env.SF48_ANDROID_MAIN || join(__dirname, '..', 'android', 'app', 'src', 'main');
const WHY = 'SF-47 measured (12 Oct 2026) that Android\'s default Auto Backup restores wf_progress (the hint balance) '
  + 'and RevenueCat\'s ID together. Any rules file or backup agent must include both, or restored hints and '
  + 'purchase reconciliation break (S40-B).';

const manifest = readFileSync(join(MAIN, 'AndroidManifest.xml'), 'utf8');
const application = (manifest.match(/<application\b[^>]*>/) || [''])[0];

describe('Android backup configuration stays on the measured defaults (SF-48, S40-B)', () => {
  it('control: the <application> element was found', () => {
    expect(application, 'no <application> element found in AndroidManifest.xml').not.toBe('');
  });

  it('allowBackup is "true"', () => {
    expect(/android:allowBackup="true"/.test(application), `android:allowBackup must be "true". ${WHY}`).toBe(true);
  });

  for (const attr of ['fullBackupContent', 'dataExtractionRules', 'backupAgent']) {
    it(`no android:${attr}`, () => {
      expect(new RegExp(`android:${attr}=`).test(application), `android:${attr} is set on <application>. ${WHY}`).toBe(false);
    });
  }

  it('no backup or data-extraction rules file in res/xml*', () => {
    const res = join(MAIN, 'res');
    const xmlDirs = existsSync(res) ? readdirSync(res).filter(d => /^xml(-|$)/.test(d) && statSync(join(res, d)).isDirectory()) : [];
    const files = xmlDirs.flatMap(d => readdirSync(join(res, d)).filter(f => f.endsWith('.xml')).map(f => join(d, f)));
    expect(files.length, 'control: res/xml should hold the Capacitor files (config.xml, file_paths.xml)').toBeGreaterThan(0);
    const rules = files.filter(f => /<(full-backup-content|data-extraction-rules)\b/.test(readFileSync(join(res, f), 'utf8')));
    expect(rules, `backup rules file(s) found: ${rules.join(', ')}. ${WHY}`).toEqual([]);
  });
});
