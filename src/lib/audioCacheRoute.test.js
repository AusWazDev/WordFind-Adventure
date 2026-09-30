// @vitest-environment jsdom
// The offline audio cache route (CR-68, brief SF-13). The pattern is run through
// Workbox's own Route classes, as the generated service worker does: a RegExp
// becomes a RegExpRoute (tested against url.href), a function becomes a Route.
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { Route } from 'workbox-routing/Route.js';
import { RegExpRoute } from 'workbox-routing/RegExpRoute.js';
import { audioCacheMatch } from './audioCacheRoute';

const OLD_PATTERN = /^\/audio\/.+\.mp3$/;
const handler = () => {};
const toRoute = pattern => (pattern instanceof RegExp ? new RegExpRoute(pattern, handler) : new Route(pattern, handler));
const matches = (pattern, href) => {
  const url = new URL(href);
  return Boolean(toRoute(pattern).match({ url, sameOrigin: url.origin === location.origin, request: new Request(href) }));
};
const here = path => new URL(path, location.origin).href;

describe('offline audio cache route', () => {
  it('matches a full same-origin audio URL, as Workbox passes it', () => {
    expect(matches(audioCacheMatch, here('/audio/female/CAT.mp3'))).toBe(true);
    expect(matches(audioCacheMatch, here('/audio/sentences/male_RAIN.mp3'))).toBe(true);
  });

  it('does not match other files, other paths, or other origins', () => {
    expect(matches(audioCacheMatch, here('/audio/female/CAT.wav'))).toBe(false);
    expect(matches(audioCacheMatch, here('/assets/index-abc.js'))).toBe(false);
    expect(matches(audioCacheMatch, here('/icon.png'))).toBe(false);
    expect(matches(audioCacheMatch, 'https://example.com/audio/female/CAT.mp3')).toBe(false);
  });

  it('control: the old anchored RegExp never matches a full URL (the SF-10 defect)', () => {
    expect(matches(OLD_PATTERN, here('/audio/female/CAT.mp3'))).toBe(false);
    expect(OLD_PATTERN.test('/audio/female/CAT.mp3')).toBe(true); // it only ever matched a bare path
  });

  it('vite.config.js uses this matcher and keeps the cache name and expiry', () => {
    const config = readFileSync('vite.config.js', 'utf8');
    expect(config).toContain('urlPattern: audioCacheMatch,');
    expect(config).toContain("cacheName: 'soundfind-audio-v1',");
    expect(config).toContain('maxEntries: 5000,');
    expect(config).toContain('maxAgeSeconds: 60 * 60 * 24 * 365,');
  });
});
