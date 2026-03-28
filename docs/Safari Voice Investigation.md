# Safari Voice Investigation — DEF-12

## Background

DEF-11 fixed a Chrome/Windows bug where `getVoices()` short-circuited on the first synchronous
call, caching only 8 local Microsoft voices before Chrome's `voiceschanged` event fired with the
full 27-voice list including Google US English. That fix has been deployed.

**Separate issue:** The voice quality on Safari/Mac is also poor. This needs investigation on Mac.

---

## What to Do (Mac Claude)

### Step 1 — Run the diagnostic in Safari

Open https://word-find-adventure.vercel.app in Safari on the Mac, open the Web Inspector console
(Develop → Show Web Inspector, or Option+Cmd+I), and run:

```js
speechSynthesis.onvoiceschanged = () => {
  speechSynthesis.getVoices().forEach((v, i) =>
    console.log(i, v.name, '|', v.lang, '| local:', v.localService)
  );
};
speechSynthesis.getVoices();
```

This will print every available voice. Note:
- How many voices are returned
- Whether enhanced voices appear (names like "Samantha (Enhanced)", "Karen (Enhanced)", "Daniel (Enhanced)")
- Whether the list includes any non-local voices
- Whether the event fires at all or returns empty

### Step 2 — Identify the scoring issue

The voice scoring algorithm is in `src/components/game/voiceUtils.jsx`.

Key scoring rules (check these against the Safari voice list):
- English voice (`v.lang` starts with `en`): **+30**
- Local/on-device and NOT "desktop": **+15**
- Penalise old Windows Desktop SAPI voices: **−50** (not relevant on Mac)
- Quality keyword match in name (`enhanced`, `premium`, `neural`, `wavenet`, `natural`, `online`, `google`): **+40 down to +28**
- Named female voice match (`Samantha`, `Karen`, `Moira`, `Tessa`, `Victoria`, etc.): **+30 down**

On Mac, the best voices should be things like `"Samantha (Enhanced)"` or `"Karen (Enhanced)"`.
- `"Samantha (Enhanced)"` should score: +30 (en) + 15 (local) + 40 (enhanced) + 30 (Samantha) = **115**
- Basic `"Samantha"` should score: +30 (en) + 15 (local) + 30 (Samantha) = **75**

If enhanced voices ARE in the list but a bad voice is still selected, the scoring function needs
adjusting. If enhanced voices are NOT in the list at all (they loaded too slowly), the `getVoices()`
polling timing needs adjusting.

### Step 3 — Check what voice is actually being used

Add this to the console AFTER starting an Audio Challenge game:

```js
// See the last utterance's voice — run this right after tapping the speaker button
speechSynthesis.getVoices().filter(v => v.name.toLowerCase().includes('samantha'))
```

Or add a temporary `console.log(voice.name)` inside `speakText()` in `voiceUtils.jsx` before
the utterance is spoken.

### Step 4 — Likely fixes

**Scenario A: Enhanced voices not in the list when cached**
Safari loads enhanced voices after basic ones. The polling in `getVoices()` might cache the
basic voice list at the 200ms mark before enhanced voices appear. Fix: increase the patience
window or specifically wait for enhanced voices before resolving.

**Scenario B: Enhanced voices ARE scored but a basic voice wins**
The named voice list in `FEMALE_VOICES` may need Mac-specific enhanced voice names added at the
top (e.g. `'Samantha (Enhanced)'`, `'Karen (Enhanced)'`) so they score higher than basic Samantha.

**Scenario C: voiceschanged never fires on Safari**
Safari occasionally doesn't fire `voiceschanged` at all. The poll should catch it within 200ms,
but if Safari returns voices synchronously (same issue as DEF-11 on Chrome), we may need the same
fix — don't short-circuit on the synchronous result.

### Step 5 — Raise and commit as DEF-12

Once the root cause is identified and fixed:
1. Log DEF-12 in `docs/Change Register.md` with commit hash
2. Update `STATUS.md` session log
3. Commit: `fix(DEF-12): improve voice selection on Safari/Mac`

---

## Files to Edit

| File | What |
|------|------|
| `src/components/game/voiceUtils.jsx` | Voice loading and scoring logic |
| `docs/Change Register.md` | Log DEF-12 once fixed |
| `STATUS.md` | Add session log entry |

---

*Raised: 28 March 2026 — to be investigated on Mac*
