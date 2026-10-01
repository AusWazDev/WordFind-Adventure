// Native builds must not ship the PWA service worker (CR-55, CR-53). Under
// capacitor:// the worker intercepts the audio fetches and audio falls back to
// speech. This runs the real vite.config.js in each mode and checks which
// plugins it returns; the web build is the control.
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import viteConfig from '../vite.config.js';

const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
const pluginNames = mode => viteConfig({ mode, command: 'build' }).plugins.flat(Infinity).filter(Boolean).map(p => p.name);
const hasPwa = mode => pluginNames(mode).some(n => n.startsWith('vite-plugin-pwa'));

describe('native builds exclude the service worker', () => {
  it('build:android builds exactly the way build:ios does, in capacitor mode', () => {
    expect(scripts['build:ios']).toBe('vite build --mode capacitor');
    expect(scripts['build:android']).toBe(scripts['build:ios']);
  });

  it('capacitor mode has no PWA plugin', () => {
    expect(pluginNames('capacitor').length).toBeGreaterThan(0); // control: the config produced plugins
    expect(hasPwa('capacitor')).toBe(false);
  });

  it('control: the plain web build does include the PWA plugin', () => {
    expect(hasPwa('production')).toBe(true);
  });
});
