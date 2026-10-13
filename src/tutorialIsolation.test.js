// SF-64 (S43), isolation (a): the Tutorial page's whole import graph, followed through
// every local import (relative and '@/' paths; packages are leaves), never reaches the
// storage, ad, purchase or hint-ledger modules, and no module in it writes wf_progress,
// wf_daily or the hint ledger. The only storage write in the graph is lib/tutorial.js's
// wf_tutorial_done.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = join(process.cwd(), 'src');
const FORBIDDEN = [
  'components/game/offlineStorage.jsx',
  'lib/adCadence.js',
  'lib/hintLedger.js',
  'lib/purchases.js',
  'lib/admob.js',
];
const IMPORT = /(?:^|[\s;])(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|^\s*import\s+['"]([^'"]+)['"]/gm;

function resolveLocal(spec, fromFile) {
  let base;
  if (spec.startsWith('@/')) base = join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = join(dirname(fromFile), spec);
  else return null; // a package
  for (const p of [base, `${base}.js`, `${base}.jsx`, join(base, 'index.js'), join(base, 'index.jsx')]) {
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  throw new Error(`unresolved import ${spec} from ${relative(SRC, fromFile)}`);
}

export function importGraph(entry) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const m of readFileSync(file, 'utf8').matchAll(IMPORT)) {
      const next = resolveLocal(m[1] || m[2] || m[3], file);
      if (next) stack.push(next);
    }
  }
  return [...seen].map(f => relative(SRC, f).replace(/\\/g, '/')).sort();
}

describe('the Tutorial page is isolated (SF-64)', () => {
  const graph = importGraph(join(SRC, 'pages/Tutorial.jsx'));

  it('control: the scan follows the graph (it reaches GameBoard, voiceUtils and lib/tutorial)', () => {
    expect(graph).toEqual(expect.arrayContaining([
      'pages/Tutorial.jsx', 'components/game/GameBoard.jsx', 'components/game/voiceUtils.jsx', 'lib/tutorial.js', 'lib/motion.js',
    ]));
  });

  it('control: the same scan of Home finds the forbidden modules', () => {
    const home = importGraph(join(SRC, 'pages/Home.jsx'));
    expect(FORBIDDEN.filter(f => home.includes(f)).length).toBeGreaterThanOrEqual(3);
  });

  it('reaches none of offlineStorage, adCadence, hintLedger, purchases or admob', () => {
    expect(graph.filter(f => FORBIDDEN.includes(f))).toEqual([]);
  });

  it('no module in it writes storage except lib/tutorial.js, and none names wf_progress, wf_daily or the ledger', () => {
    const writers = graph.filter(f => /localStorage\.setItem|sessionStorage\.setItem/.test(readFileSync(join(SRC, f), 'utf8')));
    expect(writers).toEqual(['lib/tutorial.js']);
    const named = graph.filter(f => /wf_progress|wf_daily|credited_txn_ids|reconcile_since/.test(readFileSync(join(SRC, f), 'utf8')));
    expect(named).toEqual([]);
  });
});
