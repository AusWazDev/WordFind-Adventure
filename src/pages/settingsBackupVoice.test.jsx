// @vitest-environment jsdom
// SF-60 (a): Settings has no Backup Voice speed or pitch slider any more, Voice Type
// still saves, and the stored audio_rate and audio_pitch keys are left untouched.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/platform', () => ({ isWindowsApp: () => false, isNative: () => false, getPlatform: () => 'web' }));
vi.mock('@/lib/purchases', () => ({
  purchaseProduct: vi.fn(), restorePurchases: vi.fn(), usePrice: () => null,
  REMOVE_ADS_PRODUCT_ID: 'au.com.uniquegames.soundfind.remove_ads',
}));
vi.mock('@sentry/react', () => ({ captureException: vi.fn(), captureMessage: vi.fn(), addBreadcrumb: vi.fn() }));
vi.mock('@/components/game/voiceUtils', () => ({
  speakPhraseAndWord: vi.fn(), unlockAudio: vi.fn(async () => {}), stopAllAudio: vi.fn(),
}));

const { default: Settings } = await import('./Settings');

let container, root;
async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter><Routes><Route path="*" element={<Settings />} /></Routes></MemoryRouter>); });
  await act(async () => { await new Promise(r => setTimeout(r, 20)); });
}
const stored = () => JSON.parse(localStorage.getItem('wf_settings'));

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  // A player who moved both sliders before SF-60.
  localStorage.setItem('wf_settings', JSON.stringify({ id: 'local', audio_voice: 'female', audio_rate: 2, audio_pitch: 1.8, theme: 'default' }));
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); });

describe('Settings, Backup Voice (SF-60)', () => {
  it('(a) renders no speed or pitch slider; Voice Type still saves; the old keys stay stored', async () => {
    await mount();
    const text = container.textContent;
    expect(text, 'control: the Audio Settings card rendered').toContain('Voice Type');
    expect(text).toContain('Test Voice');
    expect(container.querySelectorAll('input[type="range"]').length).toBe(0);
    for (const gone of ['Backup Voice Speed', 'Backup Voice Pitch', "Used only when a recorded voice isn't available."]) {
      expect(text).not.toContain(gone);
    }

    const male = [...container.querySelectorAll('button')].find(b => b.textContent.trim().toLowerCase() === 'male');
    await act(async () => { male.click(); });
    expect(stored().audio_voice).toBe('male');
    // The keys stay stored as they were: not renamed, deleted or migrated.
    expect(stored().audio_rate).toBe(2);
    expect(stored().audio_pitch).toBe(1.8);
  });
});
