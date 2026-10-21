# iPhone test list: SoundFind 1.2.0 (9)

Written 21 Oct 2026 (brief SF-78, CR-135) from SF-78 A2: what reaches an iPhone between the live 1.1.1 build 8 (`e4ff6d3`) and 1.2.0. Windows-only work (CR-132, CR-133) and Android-only work (CR-110, CR-111) are not tested here.

**Build type.** Each check is marked:
- **[TF]**: needs the TestFlight (Release) build. A Debug run from Xcode uses Google's test ad units (`window.Capacitor.DEBUG`, CR-101), so it cannot show the real ad behaviour, and purchases should be judged on the build that ships.
- **[any]**: a Debug run or TestFlight is fine.

**Before you start.** Install over the live 1.1.1 on one iPhone that already has games played (the "upgrade" phone). If a second iPhone is available, use it for a fresh install; otherwise delete the app before section 1 and do the upgrade checks (1.5) first. Sign in to a Sandbox Apple Account (Settings, App Store, Sandbox Account) for section 5. Do the ad checks (section 6) BEFORE buying Remove Ads in section 5, or on another phone, because Remove Ads stops the between-game ads.

Record for each check: pass / fail, and for a fail, what you saw (a screenshot helps).

---

## 1. First launch: welcome and guided first game (CR-107, CR-108, CR-109, CR-114) [any]

On a FRESH install (app deleted first, or a new phone):

- [ ] 1.1 The app opens on the welcome screen, not Home: the SoundFind wordmark, a demo word you can hear, and two buttons, **Show me how** and **Skip, just play**. No bottom bar while the welcome shows.
- [ ] 1.2 Tap to hear the demo word: it plays in the selected voice (recorded voice, not the robotic Backup Voice).
- [ ] 1.3 **Show me how** starts the guided first game. Follow every step: each coach bubble points at its target and never covers it; step 4 shows THUMB in the word list and asks you to use the lightbulb next to it. Finish it. You land in the game flow with no repeat of the tutorial on the next launch.
- [ ] 1.4 Delete and reinstall, then tap **Skip, just play** instead: you go straight to a game. Quit before finishing it, reopen the app: you are NOT sent back into the tutorial.
- [ ] 1.5 On the UPGRADE phone (1.1.1 with games played, updated to 1.2.0): the app opens on Home as before. The welcome does NOT appear, not even for a moment, and the tutorial is not forced.
- [ ] 1.6 Settings, Reset game data: afterwards the welcome shows again on the next visit to Home (a reset player counts as new). Your hint balance is unchanged after Reset.

## 2. Daily Challenge (CR-84, CR-85, CR-61, CR-113) [any]

- [ ] 2.1 Home shows the Daily card. Finish today's Daily: the finish screen says **"+N hints added to your account!"** (N is 1, 2 or 3 depending on the day's challenge) and the hint balance rises by N.
- [ ] 2.2 Play today's Daily again (Try Again or the card): it plays, the top shows **"You already completed today's challenge. Playing for fun!"**, and finishing it says **"Today's hints were already claimed. Come back tomorrow!"**. The balance does not rise again.
- [ ] 2.3 During that replay, spend a hint, then finish: the balance stays one lower (the spent hint is not refunded). If you earn a hint by watching an ad during the replay, it is kept after finishing.
- [ ] 2.4 Streak flame: the Daily card shows an orange flame with your streak count once the streak is 1 or more. Complete the Daily on two days in a row (or check an existing streak): the number goes up by one per day. Stats shows **Longest Streak**. (iPhone has no streak bonus hints; that is Windows only.)
- [ ] 2.5 Timed Dailies: the timer looks generous for the word count (about 12 seconds a word in standard mode, never less than before).

## 3. Hints (CR-92, CR-117, CR-93) [any]

- [ ] 3.1 Lightbulb in the header: one hint lights the first letter of a random unfound word, and it stays lit until that word is found. The balance drops by one.
- [ ] 3.2 Lightbulb next to a word in the list: lights that word's first letter; finding it scores 25% less (the toast shows the penalty).
- [ ] 3.3 Find a word first, then use a hint whose first letter is a cell of that found word: the hinted cell is still clearly visible (enlarged, hint colour), not hidden under the found colour.
- [ ] 3.4 **Audio Challenge**: each word row has a speaker, an **eye** and a lightbulb. The eye spends a hint and shows the word's spelling in the list (**"Word revealed: …"**). The eye disappears once used.
- [ ] 3.5 **Word Association**: each clue has an **eye**; it spends a hint and replaces the clue with the word.
- [ ] 3.6 Mystery Word bonus hunt: a hint flashes the first letter of the hidden word for about 4 seconds (**"Hint: the hidden word starts with …"**).
- [ ] 3.7 With 0 hints, any hint button opens the hint shop (**Need a Hint?**).

## 4. Hint shop layout (CR-93, CR-95, CR-134) [any]

- [ ] 4.1 **Buy Hint Pack** shows the three packs (3, 10, 25) with prices in your store currency, and under them **"Hints are saved on this device and aren't linked to an account. Unused hints can be lost if you delete the app."**
- [ ] 4.2 The screen behind the shop is darkened but NOT blurred; changing packs is smooth.
- [ ] 4.3 The buy button reads **"Buy 10 Hints (price)"**, with the price in brackets, no dash.

## 5. In-app purchases, sandbox (CR-98, CR-100) [TF]

Use the Sandbox Apple Account. The four products (Approved in App Store Connect): `hints_3`, `hints_10`, `hints_25` (consumable), `remove_ads` (non-consumable). Do section 6 first if you only have one phone.

- [ ] 5.1 Buy **3 hints**: the Apple sheet shows the sandbox price; after confirming, **"You purchased 3 hints!"** and the balance rises by exactly 3.
- [ ] 5.2 Buy **10 hints**: balance rises by exactly 10.
- [ ] 5.3 Buy **25 hints**: balance rises by exactly 25.
- [ ] 5.4 Quit and reopen the app after those three: the balance is unchanged (no second credit on launch).
- [ ] 5.5 Cancel a purchase in the Apple sheet: no error toast, no change to the balance.
- [ ] 5.6 **Remove Ads** (Settings, Go Ad-Free; the button reads **"Remove Ads (price)"**): after buying, **Ads Removed!** shows, Go Ad-Free disappears from Settings, and no between-game ad shows afterwards (play 6 games to check).
- [ ] 5.7 **Restore Purchases** (Settings): on a phone where Remove Ads was bought, delete and reinstall, then Restore: **"Purchases restored"** and ads are removed again. On an account with nothing to restore: **"No purchases to restore"**. Restore does not add hints (consumables are not restored).
- [ ] 5.8 (Optional, only if it can be done safely) Charged but not credited: start a hint pack purchase, confirm it in the Apple sheet, and force-quit the app (swipe it away) the instant the sheet closes, before any toast. Reopen the app: **"Added N hints from an earlier purchase"** shows once and the balance rises by N. Reopen again: no second credit. If the toast already appeared before the force-quit, the timing was missed; that is not a fail, just skip this check.

## 6. Ads (CR-96, CR-101, CR-116) [TF]

Before buying Remove Ads. Ads only show online. Count completed games from a fresh launch.

- [ ] 6.1 Finish 6 games from Home: before the 7th game starts, a full-screen ad shows. The next board (and, for the Daily, its timer) only appears after you close the ad.
- [ ] 6.2 A Daily counts: finish 5 normal games and the Daily, then start a game: the ad shows before it.
- [ ] 6.3 The ad shows before **Next Level** when that is the start after the 6th finished game.
- [ ] 6.4 The ad shows before **Replay** when that is the start after the 6th finished game.
- [ ] 6.5 The ad shows before the Daily when you start it from the Daily card after the 6th finished game, and the Daily's timer does not run while the ad is up.
- [ ] 6.6 Two ads are never fewer than 6 finished games apart.
- [ ] 6.7 Rewarded hint: in the hint shop, **Watch an Ad** (**"Get 1 free hint (~15 seconds)"**). Watch to the end: **"You earned 1 hint!"** and the balance rises by 1. If no ad is available: **"No ad available right now"**.
- [ ] 6.8 Leave the app on Home for over an hour, then finish 6 games: the ad still shows (an old ad is reloaded rather than failing).

## 7. Audio Challenge, screen lock and sleep (CR-104; FB-10 history) [TF preferred]

- [ ] 7.1 Start an Audio Challenge. Tap a word: it plays in the recorded voice. Tricky words also play their example sentence.
- [ ] 7.2 Lock the screen mid-game for about 10 seconds, unlock: tap a word, it plays (no silence).
- [ ] 7.3 Lock for 5 minutes or more (let the phone sleep), unlock: tap a word, it plays.
- [ ] 7.4 Switch to another app and back: words still play.
- [ ] 7.5 Words never overlap: tapping a second word while one plays stops the first.
- [ ] 7.6 Settings: there are NO Backup Voice speed or pitch sliders; the voice choice and Test Voice still work.

## 8. Offline (CR-88, CR-90) [any]

Turn on Airplane Mode (Wi-Fi off too).

- [ ] 8.1 Home shows the banner **"You're offline. Every mode still works. Ads and purchases need a connection."** and the Audio Challenge tile shows NO "Limited offline" badge.
- [ ] 8.2 Every mode and every level starts and plays offline.
- [ ] 8.3 Audio Challenge offline: words play, and tricky words still play their example sentence. (Known copy issue, not a fail: the word list shows an **Offline** pill and the note "Tricky words play with full sentences. Other words play word only offline." Other words play word only online too.)
- [ ] 8.4 The Daily plays offline and its reward is added.
- [ ] 8.5 Hint shop offline: **Buy Hint Pack** reads **"Go online to purchase hints"**; **Watch an Ad** reads "Go online to earn a free hint".
- [ ] 8.6 No between-game ad shows offline.

## 9. Text has no dashes (CR-134) [any]

Spot-check these screens for any em dash (—), en dash (–) or " - " between words. None should appear; hyphenated words (3-day, ad-free) and "−25%" are fine.

- [ ] 9.1 Home: mode tiles ("Find words using hand-crafted clues. Works fully offline", "Words shown scrambled. Unscramble then find them", "Find every word in the grid. The remaining letters reveal a hidden mystery word").
- [ ] 9.2 Audio Challenge category list (e.g. "KNIGHT, YACHT, LAMB, DEBT: letters that hide in plain sight").
- [ ] 9.3 Word Association clues (e.g. "Powerful bird of prey, national symbol of the USA"; silent letter clues end ". The K is silent").
- [ ] 9.4 Hint shop and Remove Ads buttons (prices in brackets), Settings (Go Ad-Free: "One-time purchase, no subscription").
- [ ] 9.5 Daily screen messages (section 2) and the "Not quite. Keep reading the grid!" toast in Mystery Word.

## 10. General (CR-105, CR-106, CR-118, CR-75 family) [any]

- [ ] 10.1 Settings, About: **Version 1.2.0**.
- [ ] 10.2 A wrong drag on the board gives a brief miss signal; the next drag works straight away.
- [ ] 10.3 Mode names everywhere (tiles, game header, loading screen): Standard, Audio Challenge, Anagram Hunt, Word Association, Mystery Word.
- [ ] 10.4 Finish screen: closing it stops the confetti; layout fits the screen in portrait.
- [ ] 10.5 Dark mode (Settings, theme): Home, game, hint shop and finish screen are all readable.
- [ ] 10.6 No page flicker moving between Home, Stats and Settings.

---

Results go back to the chat half; a failed check is a defect to log (DEF) before release.
