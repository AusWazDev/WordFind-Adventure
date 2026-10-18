// SF-66b B2: a failed interstitial load is retried exactly once, 60 s later, never in a
// loop; at show time an ad loaded more than 50 minutes ago is not shown and is reloaded;
// a younger one is shown. Nothing else about ads changes.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => true, getPlatform: () => 'android' }));
vi.mock('@capacitor-community/admob', async () => (await import('@/lib/admobPluginMock.testutil')).admobModule);
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));

const { plugin } = await import('@/lib/admobPluginMock.testutil');
const admob = await import('./admob');
const { prepareInterstitial, showInterstitialUntilClosed, INTERSTITIAL_RETRY_MS, INTERSTITIAL_MAX_AGE_MS, __resetInterstitialState } = admob;
const prepare = plugin.AdMob.prepareInterstitial;
const show = plugin.AdMob.showInterstitial;
const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  vi.setSystemTime(new Date('2026-10-14T10:00:00.000Z'));
  plugin.reset();
  __resetInterstitialState();
  prepare.mockImplementation(async () => ({ adUnitId: 'x' }));
});
afterEach(() => { plugin.dismiss(); __resetInterstitialState(); vi.useRealTimers(); prepare.mockReset(); });

describe('a failed load is retried once, 60 s later', () => {
  it('exactly one retry, not before 60 s; if it fails too, nothing more is requested', async () => {
    prepare.mockImplementation(async () => { throw new Error('No fill'); });
    await prepareInterstitial();
    expect(prepare, 'control: the first load was requested').toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(INTERSTITIAL_RETRY_MS - 1000);
    expect(prepare, 'no retry before 60 s').toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000); await flush();
    expect(prepare, 'one retry at 60 s').toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000); await flush();
    expect(prepare, 'never a loop: nothing after the failed retry').toHaveBeenCalledTimes(2);
  });

  it('a retry that succeeds leaves an ad ready to show', async () => {
    prepare.mockImplementationOnce(async () => { throw new Error('No fill'); });
    await prepareInterstitial();
    await vi.advanceTimersByTimeAsync(INTERSTITIAL_RETRY_MS); await flush();
    expect(prepare).toHaveBeenCalledTimes(2);
    const p = showInterstitialUntilClosed();
    await flush();
    expect(show, 'the retried ad is shown').toHaveBeenCalledTimes(1);
    plugin.dismiss(); await p;
  });

  it('a successful load schedules no retry', async () => {
    await prepareInterstitial();
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000); await flush();
    expect(prepare).toHaveBeenCalledTimes(1);
  });
});

describe('an ad older than 50 minutes is not shown, and is reloaded', () => {
  it('over 50 minutes: not shown, resolves false at once, a new load is requested', async () => {
    await prepareInterstitial();
    vi.setSystemTime(Date.now() + INTERSTITIAL_MAX_AGE_MS + 1000);
    const shown = await showInterstitialUntilClosed();
    expect(shown).toBe(false);
    expect(show, 'the old ad is not shown').not.toHaveBeenCalled();
    await flush();
    expect(prepare, 'control: the first load, then the reload').toHaveBeenCalledTimes(2);
  });

  it('under 50 minutes: it is shown', async () => {
    await prepareInterstitial();
    vi.setSystemTime(Date.now() + INTERSTITIAL_MAX_AGE_MS - 60 * 1000);
    const p = showInterstitialUntilClosed();
    await flush();
    expect(show).toHaveBeenCalledTimes(1);
    plugin.dismiss();
    expect(await p).toBe(true);
  });

  it('the reloaded ad is fresh: shown at the next attempt', async () => {
    await prepareInterstitial();
    vi.setSystemTime(Date.now() + INTERSTITIAL_MAX_AGE_MS + 1000);
    await showInterstitialUntilClosed(); await flush();
    const p = showInterstitialUntilClosed(); await flush();
    expect(show).toHaveBeenCalledTimes(1);
    plugin.dismiss(); await p;
  });
});
