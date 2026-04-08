# SoundFind — ClickUp Handover (Claude Code → Claude Desktop)

**Date:** 8 April 2026
**From:** Claude Code (coding sessions)
**To:** Claude Desktop (Cowork — has ClickUp integration)
**Purpose:** Review and update ClickUp tasks to reflect current project state. Add missing items identified in today's audit.

---

## What's Been Completed Since Last ClickUp Sync

The following work is done and committed to `main` on GitHub. Mark these as complete in ClickUp if not already:

| CR/DEF | What | Commit |
|--------|------|--------|
| CR-22 | Pre-generated ElevenLabs audio — Hannah (AU female) / Neil (AU male), 4,062 MP3 files | `922ac7e` |
| CR-23 | PWA service worker — offline app shell + audio caching via Workbox | `78858ab` |
| CR-24 | Word Association clues expanded — all new words from DEF-20/DEF-24 now have clues | committed |
| CR-25 | Full codebase audit + cleanup — dead imports, duplicate constants, 45 unused UI files deleted | committed |
| CR-26 | Mode reorder + Mystery Word difficulty cap (Expert/Master hidden for specific categories) | committed |
| CR-27 | Word list expanded by default (reverted CR-16 collapsed default) | `d9540f5` |
| CR-28 | WelcomeScreen redesigned — minimal layout, one-liner pill, cleaner buttons | `aefc0d1` |
| CR-29 | HowToPlay modal redesigned — responsive sizing, consistent styling, decluttered content | `79f75d8` |
| CR-30 | Audit fixes — unused imports, dead file deleted, alert() stubs → toasts, iOS meta tags | `6d674a7` |
| DEF-28 | Hint flash persistent until hinted word found; buttons visually disabled while hint active | `aefc0d1` |
| DEF-29 | All 38 duplicate keys in wordClues fixed | `38416fe` |
| DEF-27 | Mystery Word orphaned cells fixed (filler undo mechanism) | committed |

---

## Current Project Phase

| Phase | Status |
|-------|--------|
| Phase 1 — Finish & Stabilise | ✅ Complete |
| Phase 2 — Polish & Pre-Launch Prep | ✅ Complete |
| Phase 3 — PWA Setup | ✅ Complete |
| Phase 4 — Hosting & Beta Testing | ✅ Live — beta active, deadline Sat 11 Apr |
| Phase 5 — Capacitor (Native builds) | ❌ Not started |
| Phase 6 — App Store Submission | ❌ Not started |
| Phase 7 — Monetisation (RevenueCat + AdMob) | ❌ Not started |
| Phase 8 — Analytics (PostHog + Sentry) | ❌ Not started |
| Phase 9 — Post-Launch | ❌ Not started |

---

## Items to ADD to ClickUp (identified in today's audit — may not exist yet)

| # | Task | Phase | Priority | Notes |
|---|------|-------|----------|-------|
| 1 | Bump version number from `0.0.0` before store submission | Pre-launch | Medium | `package.json` version field |
| 2 | Register Apple Developer account ($99 USD/year) | Phase 5 | High | Required before TestFlight or App Store submission |
| 3 | Register Google Play Developer account ($25 USD one-time) | Phase 5 | High | Required before Play Store internal testing |
| 4 | Complete ABN registration | Pre-launch | High | Gates domain activation, Privacy Policy URL, store publisher name |
| 5 | Activate `uniquegames.com.au` domain (Hostgator, post-ABN) | Pre-launch | High | Required for Privacy Policy URL and `play.uniquegames.com.au` |
| 6 | Set up DNS — point `play.uniquegames.com.au` → Vercel via CNAME | Phase 4/5 | Medium | ~10 min once domain is active |
| 7 | Build Privacy Policy page at `uniquegames.com.au/SoundFind/privacypolicy/` | Pre-submission | Critical | Required by both App Store and Google Play. Build once alongside store submission prep. Content drafted — no personal data collected, localStorage only, no analytics (update when AdMob/PostHog added). |
| 8 | Build Terms of Service page (recommended alongside Privacy Policy) | Pre-submission | Medium | Same URL host as Privacy Policy |
| 9 | Complete IARC content rating questionnaire | Phase 6 | High | Required by both stores — separate online form (iarc.globalratings.com) |
| 10 | Complete Google Play Data Safety form | Phase 6 | High | Declare data collected — currently nothing sent externally |
| 11 | Complete Apple Privacy Labels declaration (App Store Connect) | Phase 6 | High | Same concept as Data Safety — currently: no data collected |
| 12 | Create App Store screenshots — iPhone 6.9", 6.5", iPad Pro 12.9" | Phase 6 | High | Need Capacitor running on real devices first |
| 13 | Create Google Play screenshots + Feature Graphic (1024×500 PNG) | Phase 6 | High | Same — need real device builds |
| 14 | Write App Store listing copy — name, subtitle, description, keywords | Phase 6 | Medium | Name: SoundFind · Subtitle: "Word Search & Audio Challenge" (max 30 chars) · Keywords: word search, spelling, vocabulary, puzzle, audio |
| 15 | Set up TestFlight (iOS internal testing, up to 25 testers, no review) | Phase 5 | High | Replaces current PWA beta for iOS native testing |
| 16 | Set up Google Play Internal Testing track (up to 100 testers, no review) | Phase 5 | High | Android equivalent of TestFlight |
| 17 | Add accessibility aria-labels to icon-only buttons | Polish | Low | Audit flagged hint buttons, lightbulb buttons missing labels — WCAG improvement |
| 18 | Add Sentry crash reporting | Phase 8 | Medium | Before public launch; free tier sufficient |
| 19 | Add PostHog analytics | Phase 8 | Medium | Track mode/category/difficulty usage, hint funnel, IAP conversion |
| 20 | FE-04: Global Leaderboard | Future | Low | Requires backend (Supabase/Firebase); deferred post-launch |
| 21 | FE-03: Mid-game save and restore | Future | Low | Serialise game state to localStorage on word found |
| 22 | FE-02: Smarter word list collapsed UX | Future | Low | Peek-and-collapse animation or persistent preference |
| 23 | FE-01: Mystery Word Expert/Master for specific categories | Future | Low | Expand category word lists further to support large grids |

---

## Items to CLOSE or UPDATE in ClickUp

| Task (approximate name) | Action | Reason |
|-------------------------|--------|--------|
| PWA manifest + service worker setup | ✅ Close | Done in CR-23 (commit `78858ab`) |
| App icon design | ✅ Close | Done in CR-18 |
| Splash screen | ✅ Close | Done in CR-19/CR-20 |
| Brand alignment / dark theme | ✅ Close | Done in CR-21/CR-28 |
| ElevenLabs audio generation | ✅ Close | Done in CR-22 — 4,062 MP3 files, Hannah + Neil voices |
| HowToPlay modal update | ✅ Close | Done in CR-29 — fully redesigned |
| Welcome screen redesign | ✅ Close | Done in CR-28 |
| Hint flash bug (Narelle's defect) | ✅ Close | Fixed DEF-28 |
| wordClues duplicates | ✅ Close | Fixed DEF-29 — 38 duplicate keys resolved |
| Beta testing | 🔄 Update to In Progress | Live at word-find-adventure.vercel.app — 2 responses, deadline Sat 11 Apr |
| RevenueCat IAP wiring | 🔄 Update to Blocked | Blocked on Capacitor setup (Phase 5) |
| AdMob real ads | 🔄 Update to Blocked | Blocked on Capacitor setup (Phase 5) |

---

## Beta Testing — Current Status

- **Live URL:** https://word-find-adventure.vercel.app
- **Deadline:** Saturday 11 April 2026
- **Responses:** 2 so far (daughter: pass; Narelle: hint bug — now fixed)
- **Google Form:** https://forms.gle/5n1bdni6jrVNVz487
- **Test Script:** https://tinyurl.com/2bw3jdod
- **Action:** Consider chasing testers or extending deadline if low response volume

---

## Key Reference Docs (all in the repo)

- `docs/Change Register.md` — every code change with commit hashes
- `docs/Launch Plan.md` — full phase-by-phase plan with App Store asset requirements
- `docs/Future Enhancements.md` — FE-01 through FE-04 deferred items
- `STATUS.md` — full session log

---

*Generated by Claude Code — 8 April 2026*
