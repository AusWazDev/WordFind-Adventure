// @vitest-environment jsdom
//
// SF-70: tap and typing breadcrumbs (ui.click, ui.input) never reach Sentry. Their message
// describes the element, aria-label included, so a tap on the hint button carried
// "Hint, N left" (the hint balance) into every later report. Runs the real @sentry/react
// SDK with the app's options and a capturing transport (as sentryConfig.e2e.test.js), so
// it sees exactly what would leave the device. Console, network and the app's own
// breadcrumbs must still pass.
//
// SF-70b: no wall-clock waits. The SDK's own timers (the DOM handler's 1 s debounce,
// dom.js:205, and flush's timeout, promisebuffer.js:75) look up setTimeout when they run,
// so fake timers drive them; every wait below is `wait(ms)`, which advances fake time.
// Before this, setup slept 1.1 s and flushed for up to 2 s in real time, and under a
// heavily loaded full run the hook passed its 10 s limit.

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as Sentry from '@sentry/react';
import { buildSentryOptions } from './sentryConfig';

const envelopes = [];
const events = () => envelopes.flatMap(([, items]) => items.filter(([h]) => h.type === 'event').map(([, e]) => e));
const lastEvent = () => events()[events().length - 1];
const categories = () => (lastEvent()?.breadcrumbs || []).map(b => b.category);
// Advances fake time; no real time passes.
const wait = ms => vi.advanceTimersByTimeAsync(ms);

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  globalThis.fetch = async () => new Response('ok', { status: 200 });
  Sentry.init({
    ...buildSentryOptions({ dsn: 'https://public@o0.ingest.us.sentry.io/0', environment: 'test', release: 'soundfind@test' }),
    transport: () => ({ send: async env => { envelopes.push(env); return {}; }, flush: async () => true }),
  });
  // A tap on the hint button, exactly as GameHeader labels it, and a keypress in a field.
  const hint = document.createElement('button');
  hint.setAttribute('aria-label', 'Hint, 5 left');
  document.body.appendChild(hint);
  hint.click();
  const field = document.createElement('input');
  field.setAttribute('aria-label', 'Name field');
  document.body.appendChild(field);
  field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'a' }));
  await wait(1100); // past the SDK's 1 s DOM debounce
  console.warn('[AdMob] prepareInterstitial failed: test');
  await fetch('https://localhost/audio/female/KNIGHT.mp3');
  Sentry.addBreadcrumb({ category: 'audio', message: 'playback stalled', level: 'warning' });
  Sentry.addBreadcrumb({ category: 'admob', message: 'consent info' });
  Sentry.addBreadcrumb({ category: 'purchases', message: 'fetchAndCachePrices failed' });
  Sentry.captureMessage('Backup Voice used: recorded audio failed', { level: 'warning' });
  const flushed = Sentry.flush(2000);
  await wait(2000);
  await flushed;
});

afterAll(() => { vi.useRealTimers(); });

describe('tap and typing breadcrumbs (SF-70)', () => {
  it('control: an event was captured, with breadcrumbs', () => {
    expect(events()).toHaveLength(1);
    expect(lastEvent().message).toBe('Backup Voice used: recorded audio failed');
    expect(categories().length).toBeGreaterThan(0);
  });

  it('a tap on the hint button leaves no breadcrumb: no ui.click or ui.input, and no "Hint, 5 left" anywhere', () => {
    expect(categories().filter(c => /^ui\./.test(c))).toEqual([]);
    expect(JSON.stringify(envelopes)).not.toContain('Hint, 5 left');
    expect(JSON.stringify(envelopes)).not.toContain('Name field');
  });

  it('console, network and the app\'s own breadcrumbs still pass', () => {
    const crumbs = lastEvent().breadcrumbs;
    expect(crumbs.find(b => b.category === 'console')?.message).toContain('[AdMob] prepareInterstitial failed');
    expect(crumbs.find(b => b.category === 'fetch')?.data?.url).toBe('https://localhost/audio/female/KNIGHT.mp3');
    for (const c of ['audio', 'admob', 'purchases']) expect(categories(), c).toContain(c);
  });
});
