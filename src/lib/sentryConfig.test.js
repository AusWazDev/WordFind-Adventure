import { describe, it, expect } from 'vitest';
import { buildSentryOptions, scrubUrl, REMOVED_INTEGRATIONS } from './sentryConfig';

const GAME_HASH = '#/Game?mode=audio&category=animals&level=3';

function syntheticEvent(base) {
  return {
    event_id: 'a'.repeat(32),
    exception: { values: [{ type: 'Error', value: 'boom' }] },
    request: {
      url: `${base}${GAME_HASH}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
        Referer: `${base}#/Home`,
      },
    },
  };
}

const options = buildSentryOptions({
  dsn: 'https://public@o0.ingest.us.sentry.io/0',
  environment: 'test',
  release: 'soundfind@test',
});

describe('beforeSend scrubs the request (CR-59)', () => {
  const bases = [
    'https://word-find-adventure.vercel.app/',
    'capacitor://localhost/',
    'app://localhost/index.html',
  ];

  for (const base of bases) {
    it(`removes the hash query, User-Agent and Referer for ${base}`, () => {
      const out = options.beforeSend(syntheticEvent(base), {});
      const serialised = JSON.stringify(out);

      expect(out.request.url).toBe(base);
      expect(serialised).not.toContain('mode=audio');
      expect(serialised).not.toContain('category=animals');
      expect(serialised).not.toContain('level=3');
      expect(serialised).not.toMatch(/user-agent/i);
      expect(serialised).not.toMatch(/referer/i);
      // Error capture itself is untouched.
      expect(out.exception.values[0].value).toBe('boom');
    });
  }

  it('keeps an event without a request intact', () => {
    const event = { message: 'no request' };
    expect(options.beforeSend(event, {})).toEqual({ message: 'no request' });
  });
});

describe('scrubUrl', () => {
  it('keeps scheme, host and path only', () => {
    expect(scrubUrl('https://h.example/a/b?x=1#/Game?mode=audio')).toBe('https://h.example/a/b');
  });
  it('cuts a relative URL at the first ? or #', () => {
    expect(scrubUrl('/index.html#/Game?mode=audio')).toBe('/index.html');
  });
});

describe('beforeBreadcrumb', () => {
  it('drops navigation breadcrumbs', () => {
    const crumb = { category: 'navigation', data: { from: '/#/Home', to: `/${GAME_HASH}` } };
    expect(options.beforeBreadcrumb(crumb, {})).toBeNull();
  });
  it('keeps the CR-58 AdMob and purchases breadcrumbs', () => {
    const admob = { category: 'admob', message: 'showInterstitial failed', level: 'warning' };
    const purchases = { category: 'purchases', message: 'fetchAndCachePrices failed', level: 'warning' };
    expect(options.beforeBreadcrumb(admob, {})).toBe(admob);
    expect(options.beforeBreadcrumb(purchases, {})).toBe(purchases);
  });
});

describe('options', () => {
  it('turns tracing off by omitting tracesSampleRate (0 would count as enabled)', () => {
    expect('tracesSampleRate' in options).toBe(false);
    expect('tracesSampler' in options).toBe(false);
  });
  it('keeps sendDefaultPii false', () => {
    expect(options.sendDefaultPii).toBe(false);
  });
  it('removes BrowserSession and adds no tracing integration', () => {
    const defaults = [{ name: 'Breadcrumbs' }, { name: 'BrowserSession' }, { name: 'HttpContext' }];
    const names = options.integrations(defaults).map(i => i.name);
    expect(names).toEqual(['Breadcrumbs', 'HttpContext']);
    expect(REMOVED_INTEGRATIONS).toContain('BrowserSession');
  });
  it('is disabled when there is no DSN', () => {
    expect(buildSentryOptions({ dsn: undefined }).enabled).toBe(false);
  });
});
