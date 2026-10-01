// FB-1 (CR-74): no price figure is hard-coded in the app. Every price a player
// sees must be the store's own priceString, from RevenueCat, or nothing.
//
// Two patterns, both meaning money and nothing else:
//   (a) a currency marker beside a number: $, US$, A$, AU$, NZ$, C$, €, £, ¥,
//       or a number followed by USD / AUD;
//   (b) a `price:` property whose string literal contains a digit (catches a
//       fallback brought back without its currency marker).
// EXCLUDED, deliberately: a bare decimal such as \d+\.\d{2}. On 1 Oct 2026 it
// matched 26 source files of non-price numbers (animation durations and
// delays like 0.25 and 0.35, scales like 0.95 and 1.05, audio timings like
// 0.05, and gameUtils' 6.02), so it cannot tell a price from a timing.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = join(process.cwd(), 'src');
const CURRENCY = /(?:US|AU|A|NZ|C)?\$\s?\d|[€£¥]\s?\d|\b\d+(?:\.\d{2})?\s?(?:USD|AUD)\b/;
const PRICE_PROP = /\bprice\s*:\s*['"`][^'"`]*\d/;

const files = dir => readdirSync(dir).flatMap(name => {
  const p = join(dir, name);
  if (statSync(p).isDirectory()) return files(p);
  return /\.(js|jsx)$/.test(name) && !name.includes('.test.') ? [p] : [];
});

function sweep() {
  const hits = [];
  const sources = files(SRC);
  for (const file of sources) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (CURRENCY.test(line) || PRICE_PROP.test(line)) {
        hits.push(`${relative(process.cwd(), file).replace(/\\/g, '/')}:${i + 1}: ${line.trim().slice(0, 90)}`);
      }
    });
  }
  return { hits, scanned: sources.length };
}

describe('no hard-coded prices (FB-1)', () => {
  it('the sweep reads the source tree', () => {
    expect(sweep().scanned).toBeGreaterThan(20); // control: a dead reader scans nothing
  });

  it('the patterns catch the price forms they are meant to (control)', () => {
    for (const sample of ["'US$1.99'", 'from $0.99', "'A$1.49'", '2.99 AUD', "price: '1.99'", '€1,99'.replace(',', '.')]) {
      expect(CURRENCY.test(sample) || PRICE_PROP.test(sample), sample).toBe(true);
    }
    for (const notPrice of ['delay: 0.25', 'scale: 0.95', 'duration: 0.35', 'x: 6.02']) {
      expect(CURRENCY.test(notPrice) || PRICE_PROP.test(notPrice), notPrice).toBe(false);
    }
  });

  it('no non-test source file contains a price figure', () => {
    expect(sweep().hits).toEqual([]);
  });
});
