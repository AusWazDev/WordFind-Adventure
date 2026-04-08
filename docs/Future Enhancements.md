# SoundFind — Future Enhancements Log

Tracks ideas and deferred improvements for future versions. Raised during development when the right fix exists but is deferred for scope or time reasons.

---

## Open Items

| # | Area | Title | Notes | Raised |
|---|------|-------|-------|--------|
| FE-03 | Game | Mid-game save and restore | Current behaviour: closing the app mid-game loses the current game — progress (stats/hints) only saves on victory. Future: serialise current game state (grid, found words, score, mode, category, level) to localStorage on every word found or hint used. On next open, detect saved state and offer "Continue game" or "Start new". | Apr 2026 |
| FE-02 | Word List | Smarter collapsed-by-default UX | Word list is currently expanded by default (CR-16 default reverted) because collapsed state wasn't discoverable on mobile — players didn't realise words were hidden. Future options: (a) peek-and-collapse animation on game start so player sees words then gets full grid, (b) persistent preference saved to localStorage, (c) better toggle bar with drag-handle affordance and animated bounce on first load. | Apr 2026 |
| FE-01 | Mystery Word | Expert & Master levels for specific categories | Current limitation: category-restricted filler pools (86–112 words) can exhaust on large grids (15×15, 20–25 main words) before K drops to a valid mystery word length. Cross-category filler is ruled out by game rules (all filler must be from the selected category). Fix options: (a) expand category word lists further, (b) smarter filler placement to maximise new-cell fill rate, (c) dynamic heuristic to determine which difficulty/category combos are viable. Interim fix (v1): Expert and Master are disabled in the LevelSelector when Mystery Word + specific category is selected; only Random category supports all 5 levels. | Apr 2026 |

---

## Completed

*(Items moved here once resolved in a future version)*
