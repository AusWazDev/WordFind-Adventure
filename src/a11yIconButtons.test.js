// SF-61 (U6): every icon-only button in src/ has an aria-label.
//
// A button counts as icon-only when its content has no static text and no {expression}
// that yields text (an expression containing JSX, such as {on ? <Volume2/> : <VolumeX/>},
// yields no text). The scan reads the source, so it also covers buttons that are hard to
// render in a test (the Mystery Word bonus backspace). The opening tag ends at the first
// '>' outside {...} and quotes, so an arrow function's "=>" in onClick is not mistaken for
// it (that mistake once dropped 23 of 34 buttons from this scan).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = join(process.cwd(), 'src');
const jsxFiles = dir => readdirSync(dir).flatMap(n => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? jsxFiles(p) : (n.endsWith('.jsx') && !n.includes('.test.') ? [p] : []);
});

const TAG = /<(Button|button|motion\.button)\b/g;

function openTagEnd(src, from) {
  for (let k = from, braces = 0, q = null; k < src.length; k++) {
    const ch = src[k];
    if (q) { if (ch === q) q = null; continue; }
    if (braces === 0 && (ch === '"' || ch === "'")) { q = ch; continue; }
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '>' && braces === 0) return k;
  }
  return -1;
}

function closeIndex(src, tag, from) {
  const t = tag.replace('.', '\\.');
  const marks = [
    ...[...src.matchAll(new RegExp(`<${t}\\b`, 'g'))].filter(m => m.index >= from).map(m => [m.index, 1]),
    ...[...src.matchAll(new RegExp(`</${t}>`, 'g'))].filter(m => m.index >= from).map(m => [m.index, -1]),
  ].sort((a, b) => a[0] - b[0]);
  let depth = 0;
  for (const [pos, d] of marks) { depth += d; if (depth === 0) return pos; }
  return -1;
}

// Every {...} expression at any depth that contains no JSX ('<') is treated as text.
function hasTextExpression(body) {
  const exprs = [];
  for (let i = 0, depth = 0, start = -1; i < body.length; i++) {
    if (body[i] === '{') { if (depth === 0) start = i; depth++; }
    else if (body[i] === '}') { depth--; if (depth === 0) exprs.push(body.slice(start + 1, i)); }
  }
  return exprs.some(e => !e.trim().startsWith('/*') && !e.includes('<') && e.trim() !== '');
}

export function scanButtons(src) {
  const out = [];
  for (const m of src.matchAll(TAG)) {
    const end = openTagEnd(src, m.index);
    const openTag = src.slice(m.index, end + 1);
    const selfClosing = openTag.endsWith('/>');
    const close = selfClosing ? end : closeIndex(src, m[1], m.index);
    const body = selfClosing ? '' : src.slice(end + 1, close);
    const staticText = body.replace(/\{[^{}]*\}/g, ' ').replace(/<[^>]*>/g, ' ').replace(/[^A-Za-z0-9]/g, '');
    const iconOnly = staticText === '' && !hasTextExpression(body);
    out.push({ line: src.slice(0, m.index).split('\n').length, iconOnly, labelled: /\saria-label=/.test(openTag) });
  }
  return out;
}

describe('icon-only buttons have an aria-label (SF-61, U6)', () => {
  const files = jsxFiles(SRC);
  const all = files.flatMap(f => scanButtons(readFileSync(f, 'utf8')).map(b => ({ ...b, file: relative(SRC, f).replace(/\\/g, '/') })));

  it('control: the scan finds every button tag in src (denominator)', () => {
    const tags = files.reduce((n, f) => n + [...readFileSync(f, 'utf8').matchAll(TAG)].length, 0);
    expect(all.length).toBe(tags);
    expect(all.length).toBeGreaterThan(50);
  });

  it('control: the scanner flags an unlabelled icon button and passes labelled or text ones', () => {
    const fixture = [
      '<Button onClick={() => go()} className="h-8"><ArrowLeft className="w-4" /></Button>',
      '<button onClick={() => go()} aria-label="Back"><ArrowLeft /></button>',
      '<button onClick={() => go()}>{isLast ? "Done" : "Next"}</button>',
      '<button onClick={() => go()}>{on ? <Volume2 /> : <VolumeX />}</button>',
      '<button key={i} onClick={() => go(i)} className="dot" />',
    ].join('\n');
    expect(scanButtons(fixture).map(b => [b.iconOnly, b.labelled])).toEqual([
      [true, false], [true, true], [false, false], [true, false], [true, false],
    ]);
  });

  it('every icon-only button in src has an aria-label', () => {
    const iconOnly = all.filter(b => b.iconOnly);
    expect(iconOnly.length, 'control: icon-only buttons exist').toBeGreaterThan(15);
    const missing = iconOnly.filter(b => !b.labelled).map(b => `${b.file}:${b.line}`);
    expect(missing).toEqual([]);
  });
});
