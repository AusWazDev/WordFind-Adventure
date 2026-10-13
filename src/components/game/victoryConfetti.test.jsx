// @vitest-environment jsdom
// SF-61: VictoryModal's confetti is cancelled (confetti.reset(), canvas-confetti
// 1.9.4) when the victory screen closes or unmounts, so a burst cannot keep falling
// over the next screen. A modal that never opened never touches the library.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const confetti = vi.hoisted(() => Object.assign(vi.fn(), { reset: vi.fn() }));
vi.mock('canvas-confetti', () => ({ default: confetti }));

const { default: VictoryModal } = await import('./VictoryModal');

const noop = () => {};
const modal = isOpen => <VictoryModal isOpen={isOpen} score={100} wordsFound={6} level={1} onNextLevel={noop} onReplay={noop} onHome={noop} />;

let container, root;
beforeEach(() => {
  confetti.mockClear(); confetti.reset.mockClear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

describe('VictoryModal confetti cleanup (SF-61)', () => {
  it('opening fires one burst; closing cancels it', async () => {
    await act(async () => root.render(modal(true)));
    expect(confetti, 'control: the burst fired').toHaveBeenCalledTimes(1);
    expect(confetti.reset).not.toHaveBeenCalled();
    await act(async () => root.render(modal(false)));
    expect(confetti.reset).toHaveBeenCalledTimes(1);
  });

  it('unmounting while open (leaving the screen) cancels it', async () => {
    await act(async () => root.render(modal(true)));
    await act(async () => root.unmount());
    expect(confetti.reset).toHaveBeenCalledTimes(1);
    root = createRoot(container); // for afterEach
  });

  it('a modal that never opened never fires or resets', async () => {
    await act(async () => root.render(modal(false)));
    await act(async () => root.unmount());
    expect(confetti).not.toHaveBeenCalled();
    expect(confetti.reset).not.toHaveBeenCalled();
    root = createRoot(container);
  });
});
