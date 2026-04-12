# SoundFind — Beta Feedback Triage
## Session 1 (29 March 2026)

**Source:** External beta tester, feedback received via iMessage (outside Google Form)
**Triaged by:** Waz + Mac Claude (29 Mar 2026)

---

## Raw Feedback

> "Howdy. Love the concept but it's a struggle to see on the screen on my phone. Sound is best but
> the voice is American and to be robot like. Screen appears to be sensitive when words are on angle
> and multiple attempts required or the page changes and your game you were playing disappears. My
> frustration mostly came from the watch this advert which then repeats a few times you can play one
> word then it's gone again. Maybe the score table could be smaller to allow the game to take up
> more of the screen. Look and feel was clear and pleasing to play. Nice work Waz."

---

## Triage Summary

### 🔴 DEF-19 — Touch scroll conflicts with word selection on mobile (web browser)

**Feedback:** "Screen appears to be sensitive when words are on angle and multiple attempts required
or the page changes and your game you were playing disappears."

**Root cause (confirmed in triage):** On a browser-based web app, touch drag events trigger both
word selection AND the browser's native scroll/pull-to-refresh behaviour simultaneously. Dragging at
an angle moves the page instead of selecting the word. Dragging downward (top-to-bottom words)
triggers the browser's pull-to-refresh, which reloads the page and loses the game in progress.

**Fix required:** Intercept `touchmove` events on the game board and call `preventDefault()` to
suppress browser scroll/refresh during word selection. Also apply `overscroll-behavior: none` and
`touch-action: none` CSS to the game board container.

**Note:** This issue will not exist in the Capacitor native app — the WebView handles touch events
differently and there is no browser chrome. Priority fix for the web/PWA version.

**Files to change:** `src/components/game/GameBoard.jsx`
**Severity:** High — causes game loss and requires multiple attempts on mobile
**Raise as:** DEF-19

---

### 🟡 CR-15 — Reduce ad frequency (less aggressive interstitial scheduling)

**Feedback:** "My frustration mostly came from the watch this advert which then repeats a few times
you can play one word then it's gone again."

**Root cause:** `AD_FREQUENCY = 3` in `Home.jsx` — an interstitial ad shows every 3 game starts.
On a short play session this means the tester sees an ad, plays briefly, then sees another almost
immediately.

**Decision (agreed in triage):** Increase frequency gap. Options discussed:
- Every 6–8 game starts instead of 3
- Trigger after a **completed game** rather than at the **start** of a new one (less disruptive UX)

**Recommendation:** Change to trigger after every 6th **completed** game. This rewards engagement
rather than punishing new attempts. Waz to confirm preferred approach before implementation.

**Files to change:** `src/pages/Home.jsx` (`AD_FREQUENCY` constant + trigger logic)
**Severity:** Medium — frustrating enough to disengage testers
**Raise as:** CR-15

---

### 🟡 CR-16 — Compact word list panel during active gameplay

**Feedback:** "Maybe the score table could be smaller to allow the game to take up more of the
screen."

**Root cause:** The word list panel takes up significant vertical space during play, leaving less
room for the game grid — especially on smaller phones.

**Decision (agreed in triage):** Make the word list panel collapsible or auto-compact during active
play. Options:
- **Collapse to count only** — show "5 / 10 found" instead of the full list while playing; expand
  on tap or on victory
- **Compact mode** — reduce font size and padding in the word list while playing, restore on victory

**Recommendation:** Collapsible panel — tap to toggle between compact (count only) and expanded
(full list). Collapsed by default during play, auto-expanded on victory.

**Files to change:** `src/components/game/WordList.jsx`, `src/pages/Game.jsx`
**Severity:** Medium — layout/UX improvement for mobile
**Raise as:** CR-16

---

### 🟡 CR-17 — Grid too small on higher difficulty levels (Expert/Master)

**Feedback (Waz observation):** Game grid is quite small on Expert (15×15) and Master (15×15) levels
due to limited screen real estate, especially with the word list panel also taking space.

**Root cause:** Fixed cell sizing does not adapt to screen width at higher grid sizes. On a 375px
wide phone, a 15×15 grid with the word list panel visible results in cells too small for reliable
touch selection.

**Options discussed:**
1. **Collapse word list (CR-16)** — biggest immediate win, gives grid more vertical space
2. **Responsive cell sizing** — cells calculated to always fill available screen width
3. **Landscape mode prompt** — suggest rotating to landscape for Expert/Master levels
4. **Scrollable/pannable grid** — grid stays full size, player pans with one finger (complex)

**Recommendation:** CR-16 (collapse word list) addresses a large part of this. Combine with
responsive cell sizing to ensure the grid always fills the available width after the word list is
collapsed. Landscape prompt is a low-effort addition for Expert/Master.

**Files to change:** `src/components/game/GameBoard.jsx`, `src/pages/Game.jsx`
**Severity:** Medium — affects playability at higher levels on small screens
**Raise as:** CR-17 (implement after CR-16 is done, as CR-16 frees up significant space)

---

### ℹ️ Voice quality — American / robotic (noted, low priority for now)

**Feedback:** "The voice is American and to be robot like."

**Triage finding:** The voice selection algorithm (DEF-11, DEF-12) is working correctly. The tester
is likely on an Android device or a phone without Karen (Enhanced) installed. On iOS, Karen
(Enhanced) is typically pre-installed and sounds natural and Australian. On Android, Google TTS
voices (fixed in DEF-11) are used on Chrome. The "American" voice is Samantha or a Google US voice
— both are the best available on their device.

**No immediate code fix required.** Once Capacitor is set up (Phase 5), we can specify a preferred
voice locale more precisely. For now, the voice experience depends on the tester's device.

**Positive signals from this tester:**
- ✅ Loves the concept
- ✅ Audio mode highlighted as the best feature
- ✅ Look and feel clear and pleasing
- ✅ "Nice work Waz"

---

## Items to Raise in Change Register

| # | Type | Title | Priority | Status |
|---|------|-------|----------|--------|
| DEF-19 | Defect | Touch scroll conflicts with word selection on mobile web | High | ✅ Fixed — `caa3330` Mar 2026 |
| CR-15 | Change Request | Reduce interstitial ad frequency | Medium | ✅ Completed — `caa3330` Mar 2026 |
| CR-16 | Change Request | Collapsible word list panel during active play | Medium | ✅ Completed — `6a45e9e` Apr 2026 |
| CR-17 | Change Request | Responsive grid sizing for Expert/Master on small screens | Medium | ✅ Completed — `6a45e9e` Apr 2026 |

---

## ✅ Beta Session 1 — Closed 12 April 2026

All items raised in this session have been addressed. Voice quality concern resolved by CR-22 (ElevenLabs pre-generated Australian voices — Hannah female / Neil male).

*Triaged: 29 March 2026 — Mac session*
*Closed: 12 April 2026 — Windows session*
