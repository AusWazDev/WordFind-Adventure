// Child-directed ads (CR-60, brief SF-7). The AdMob plugin is mocked; the
// MaxAdContentRating enum comes from the plugin's real definitions, so the
// value tested is the value the native code switches on ("General").
import { describe, it, expect, vi, beforeEach } from 'vitest';

const calls = [];
const platform = { value: 'ios' };

vi.mock('@capacitor-community/admob', async () => {
  const { MaxAdContentRating } = await vi.importActual('@capacitor-community/admob/dist/esm/definitions.js');
  const record = name => vi.fn(async options => {
    calls.push({ name, options });
    if (name === 'requestConsentInfo') return { status: 'NOT_REQUIRED', canRequestAds: true };
    if (name === 'showRewardVideoAd') return { type: 'hint', amount: 1 };
    return undefined;
  });
  const names = [
    'initialize', 'requestConsentInfo', 'showConsentForm', 'showPrivacyOptionsForm',
    'requestTrackingAuthorization', 'trackingAuthorizationStatus', 'resetConsentInfo',
    'prepareInterstitial', 'showInterstitial', 'prepareRewardVideoAd', 'showRewardVideoAd',
  ];
  return { MaxAdContentRating, AdMob: Object.fromEntries(names.map(n => [n, record(n)])) };
});
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('./platform', () => ({ getPlatform: () => platform.value, isNative: () => platform.value !== 'web' }));

const { AdMob } = await import('@capacitor-community/admob');
const admob = await import('./admob');

const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const named = name => calls.filter(c => c.name === name);
const FORBIDDEN = ['showConsentForm', 'showPrivacyOptionsForm', 'requestTrackingAuthorization'];

beforeEach(() => {
  calls.length = 0;
  platform.value = 'ios';
});

describe.each(['ios', 'android'])('initAdMob on %s', plat => {
  beforeEach(() => { platform.value = plat; });

  it('passes all three child-directed flags to initialize, all true, rating General', async () => {
    await admob.initAdMob();
    const [init] = named('initialize');
    expect(init.options.tagForChildDirectedTreatment).toBe(true);
    expect(init.options.tagForUnderAgeOfConsent).toBe(true);
    expect(init.options.maxAdContentRating).toBe('General');
  });

  it('never passes false for a child-directed flag', async () => {
    await admob.initAdMob();
    const [init] = named('initialize');
    for (const key of ['tagForChildDirectedTreatment', 'tagForUnderAgeOfConsent']) {
      expect(init.options[key]).not.toBe(false);
    }
  });

  it('requests consent info with TFUA true, once, before initialize', async () => {
    await admob.initAdMob();
    const consent = named('requestConsentInfo');
    expect(consent).toHaveLength(1);
    expect(consent[0].options.tagForUnderAgeOfConsent).toBe(true);
    const order = calls.map(c => c.name);
    expect(order.indexOf('requestConsentInfo')).toBeLessThan(order.indexOf('initialize'));
  });

  it('never shows a consent or privacy-options form and never requests ATT', async () => {
    await admob.initAdMob();
    await admob.showInterstitial();
    await admob.showRewarded();
    await flush();
    for (const name of FORBIDDEN) expect(named(name)).toHaveLength(0);
  });

  it('asks for non-personalised ads on every interstitial and rewarded request', async () => {
    await admob.initAdMob();
    await admob.showInterstitial();
    await admob.showRewarded();
    await flush();
    const requests = [...named('prepareInterstitial'), ...named('prepareRewardVideoAd')];
    expect(named('prepareInterstitial').length).toBeGreaterThanOrEqual(2);
    expect(named('prepareRewardVideoAd')).toHaveLength(1);
    for (const r of requests) expect(r.options.npa).toBe(true);
  });
});

describe('failure and platform handling', () => {
  it('a consent-info failure never blocks initialize', async () => {
    AdMob.requestConsentInfo.mockImplementationOnce(async () => { throw new Error('UMP offline'); });
    await admob.initAdMob();
    expect(named('initialize')).toHaveLength(1);
    expect(named('initialize')[0].options.tagForChildDirectedTreatment).toBe(true);
  });

  it('on web and Electron nothing is called', async () => {
    platform.value = 'web';
    await admob.initAdMob();
    await admob.showRewarded();
    expect(calls).toHaveLength(0);
  });

  it('keeps the ad unit ids unchanged', async () => {
    await admob.initAdMob();
    await admob.showRewarded();
    await flush();
    expect(named('prepareInterstitial')[0].options.adId).toBe('ca-app-pub-1060374954785370/8928590640');
    expect(named('prepareRewardVideoAd')[0].options.adId).toBe('ca-app-pub-1060374954785370/2712182023');
  });
});
