// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://word-find-adventure.vercel.app/","referrer":"https://referrer.example/page?from=ad","userAgent":"Mozilla/5.0 (TestDevice) SoundFindTest/1.0"}
//
// Runs the real @sentry/react SDK with the app's options and a capturing
// transport, so the test sees exactly what would leave the device (CR-59).

import { describe, it, expect, beforeAll } from 'vitest';
import * as Sentry from '@sentry/react';
import { buildSentryOptions } from './sentryConfig';

const envelopes = [];

function capturingTransport() {
  return {
    send: async envelope => {
      envelopes.push(envelope);
      return {};
    },
    flush: async () => true,
  };
}

function itemsOfType(type) {
  return envelopes.flatMap(([, items]) => items.filter(([header]) => header.type === type));
}

beforeAll(async () => {
  // A player on the game screen, reached by a HashRouter navigation.
  window.history.pushState({}, '', '/#/Home');
  Sentry.init({
    ...buildSentryOptions({
      dsn: 'https://public@o0.ingest.us.sentry.io/0',
      environment: 'test',
      release: 'soundfind@test',
    }),
    transport: capturingTransport,
  });
  window.history.pushState({}, '', '/#/Game?mode=audio&category=animals&level=3');
  Sentry.addBreadcrumb({ category: 'admob', message: 'showInterstitial failed', level: 'warning' });
  Sentry.captureException(new Error('synthetic crash'));
  await Sentry.flush(2000);
});

describe('what the SDK sends (CR-59)', () => {
  it('the apparatus works: the page really is on the game hash, with a UA and referrer', () => {
    expect(window.location.href).toContain('mode=audio');
    expect(navigator.userAgent).toContain('SoundFindTest');
    expect(document.referrer).toContain('referrer.example');
  });

  it('still sends the error', () => {
    const events = itemsOfType('event');
    expect(events).toHaveLength(1);
    expect(events[0][1].exception.values[0].value).toBe('synthetic crash');
  });

  it('sends no route query, no User-Agent and no Referer anywhere', () => {
    const all = JSON.stringify(envelopes);
    expect(all).not.toContain('mode=audio');
    expect(all).not.toContain('category=animals');
    expect(all).not.toContain('SoundFindTest');
    expect(all).not.toContain('referrer.example');
    expect(all).not.toMatch(/user-agent/i);
    expect(all).not.toMatch(/"referer"/i);
  });

  it('reduces request.url to scheme, host and path', () => {
    const [[, event]] = itemsOfType('event');
    expect(event.request.url).toBe('https://word-find-adventure.vercel.app/');
  });

  it('drops navigation breadcrumbs and keeps the CR-58 ones', () => {
    const [[, event]] = itemsOfType('event');
    const categories = (event.breadcrumbs ?? []).map(b => b.category);
    expect(categories).not.toContain('navigation');
    expect(categories).toContain('admob');
  });

  it('sends no session and no transaction', () => {
    expect(itemsOfType('session')).toHaveLength(0);
    expect(itemsOfType('sessions')).toHaveLength(0);
    expect(itemsOfType('transaction')).toHaveLength(0);
  });

  it('never asks the server to infer the IP address', () => {
    const [[, event]] = itemsOfType('event');
    expect(event.sdk?.settings?.infer_ip).toBe('never');
    expect(event.user?.ip_address).toBeUndefined();
  });
});
