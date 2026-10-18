import { Capacitor } from '@capacitor/core';
import { isElectronPage } from '@/lib/staleServiceWorkers';

export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

// The Windows app (S25, S41, SF-74): the Electron build, which ships only to the
// Microsoft Store as an appx. Decided at RUNTIME from what is actually running, not
// from the build mode: Electron always loads app://localhost (electron/main.cjs),
// which no web or Capacitor page ever is, and its user agent carries "Electron/".
// So it is false in the web build (https) and on iOS and Android (capacitor:// or
// https://localhost, no Electron user agent), whichever way a bundle was built.
export const isWindowsApp = () => isElectronPage();
