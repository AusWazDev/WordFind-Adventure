// @vitest-environment node
// SF-76 (CR-134): no dashes in any player-facing string, on any platform (the
// developer's ruling, 13 and 14 Oct 2026). Banned: em dash (U+2014), en dash
// (U+2013), a double hyphen used as a dash, and a spaced hyphen (" - ") between words.
// NOT dashes, and allowed: hyphenated words (3-day, built-in), set names (-OUGH,
// -ISE/-IZE), number ranges (1-5), minus signs (U+2212), keyboard keys. None of
// those can match a banned pattern; the only allowances needed are CSS custom
// properties, var(--name), and a spaced hyphen between two digits (arithmetic).
//
// Scanned: every string VALUE in src/**/*.{js,jsx} (tests excluded) and in the
// Electron main and preload, parsed with @babel/parser so comments never count;
// strings passed to console.* and Sentry.* are diagnostics and are skipped.
// Line-scanned with comments removed: index.html, vite.config.js's PWA manifest
// (parsed like the source), Android resources and manifest, iOS Info.plist and
// storyboards, capacitor.config.json. Store listing copy is the comms session's.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const rel = f => path.relative(ROOT, f).replace(/\\/g, '/');

const BANNED = [
  ['em dash', /—/],
  ['en dash', /–/],
  ['double hyphen', /--/],
  ['spaced hyphen', /(?<!\d) - |(?<=\d) - (?!\d)/],
];
// Remove the allowed forms before testing for banned ones.
const allowed = text => text.replace(/var\(--[\w-]+/g, 'var(');

export function bannedIn(text) {
  const t = allowed(text);
  return BANNED.filter(([, re]) => re.test(t)).map(([name]) => name);
}

function walkDir(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walkDir(p, out);
    else out.push(p);
  }
  return out;
}

const calleeName = n => (!n ? '' : n.type === 'Identifier' ? n.name
  : n.type === 'MemberExpression' ? `${calleeName(n.object)}.${n.property?.name ?? ''}` : '');
const isDiagnostic = call => /^(console|Sentry)\./.test(calleeName(call.callee));

// Every string value in a JS/JSX source, with its line, skipping diagnostics.
export function jsStrings(file, src = readFileSync(file, 'utf8')) {
  const ast = parse(src, { sourceType: 'unambiguous', plugins: ['jsx'] });
  const found = [];
  const SKIP = new Set(['loc', 'start', 'end', 'leadingComments', 'trailingComments', 'innerComments', 'extra']);
  (function walk(node, inDiagnostic) {
    if (!node || typeof node.type !== 'string') return;
    const diag = inDiagnostic || (node.type === 'CallExpression' && isDiagnostic(node));
    if (!diag) {
      if (node.type === 'StringLiteral') found.push({ line: node.loc.start.line, text: node.value });
      else if (node.type === 'TemplateElement') found.push({ line: node.loc.start.line, text: node.value.cooked ?? node.value.raw });
      else if (node.type === 'JSXText') found.push({ line: node.loc.start.line, text: node.value });
    }
    for (const k of Object.keys(node)) {
      if (SKIP.has(k)) continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach(c => walk(c, diag));
      else if (v && typeof v.type === 'string') walk(v, diag);
    }
  })(ast.program, false);
  return found;
}

// Lines of a markup or config file with <!-- --> comments blanked (line numbers kept).
export function markupLines(src) {
  return src.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' ')).split(/\r?\n/)
    .map((text, i) => ({ line: i + 1, text }));
}

const isTest = f => /\.test\.[cm]?jsx?$/.test(f);
const SOURCES = [
  ...walkDir(path.join(ROOT, 'src')).filter(f => /\.(js|jsx)$/.test(f) && !isTest(f)),
  path.join(ROOT, 'electron/main.cjs'),
  path.join(ROOT, 'electron/preload.cjs'),
  path.join(ROOT, 'vite.config.js'),
];
const MARKUP = [
  'index.html',
  'capacitor.config.json',
  'android/app/src/main/AndroidManifest.xml',
  ...(existsSync(path.join(ROOT, 'android/app/src/main/res'))
    ? walkDir(path.join(ROOT, 'android/app/src/main/res')).filter(f => /[\\/](values[^\\/]*|layout|xml)[\\/][^\\/]+\.xml$/.test(f)).map(rel)
    : []),
  'ios/App/App/Info.plist',
  'ios/App/App/Base.lproj/LaunchScreen.storyboard',
  'ios/App/App/Base.lproj/Main.storyboard',
].map(f => path.join(ROOT, f));

function offences() {
  const out = [];
  for (const f of SOURCES) for (const s of jsStrings(f)) {
    const names = bannedIn(s.text);
    if (names.length) out.push(`${rel(f)}:${s.line} [${names.join(', ')}] ${s.text.trim()}`);
  }
  for (const f of MARKUP) {
    if (!existsSync(f)) continue;
    for (const s of markupLines(readFileSync(f, 'utf8'))) {
      const names = bannedIn(s.text);
      if (names.length) out.push(`${rel(f)}:${s.line} [${names.join(', ')}] ${s.text.trim()}`);
    }
  }
  return out;
}

describe('no dashes in player-facing strings (SF-76)', () => {
  it('scans every source it names (the denominator)', () => {
    expect(SOURCES.length).toBeGreaterThan(60);
    for (const f of MARKUP.filter(f => !f.includes('values'))) expect(existsSync(f), rel(f)).toBe(true);
    const strings = SOURCES.reduce((n, f) => n + jsStrings(f).length, 0);
    expect(strings).toBeGreaterThan(5000);
  });

  it('finds no em dash, en dash, double hyphen or spaced hyphen', () => {
    expect(offences()).toEqual([]);
  });

  // The checker itself: each banned form is caught, each allowed form is not,
  // and comments and diagnostics never count.
  it('catches every banned form and allows the NOT-dashes', () => {
    for (const bad of ['a — b', 'a—b', '1750–1820', 'a -- b', 'a - b', 'word - 5']) expect(bannedIn(bad), bad).not.toEqual([]);
    for (const ok of ['3-day Daily streak!', 'built-in', '-OUGH', '-ISE/-IZE', '1-5', '−25%', 'var(--background)', '10 - 3', 'Ctrl+Shift+K']) expect(bannedIn(ok), ok).toEqual([]);
    const src = "// a — comment\nconsole.warn('x — y');\nSentry.addBreadcrumb({ message: 'p — q' });\nconst t = 'shown — here';\nconst J = () => <p title=\"t — a\">j — x</p>;";
    expect(jsStrings('x.jsx', src).filter(s => bannedIn(s.text).length).map(s => s.line)).toEqual([4, 5, 5]);
    expect(markupLines('<!-- a -- b -->\n<string>ok — no</string>').filter(s => bannedIn(s.text).length).map(s => s.line)).toEqual([2]);
  });
});
