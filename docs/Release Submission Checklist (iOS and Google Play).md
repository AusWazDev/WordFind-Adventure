# Release Submission Checklist (iOS and Google Play) — SoundFind

Created 14 Oct 2026 (LP-SF2). iOS and Google Play had no followed submission procedure before this; see CR-130's Change Register row.

---

- [ ] **1. Version check before building (SF-67, 14 Oct 2026).** Google Play: the new versionCode must be higher than every code on any track; the developer or chat half reads All app bundles first. iOS: the build number must be higher than the last one uploaded to App Store Connect.
- [ ] **2. Privacy page live and matching (SF-67 ruling 5, 14 Oct 2026).** The privacy page must be live and must match the build's data behaviour before any upload that reaches real users, including closed testers.
- [ ] **3. No release build on the debug tablet (standing).** Never install a release build on the debug tablet; debug devices must not show live ads.
- [ ] **4. Store listing copy (LP-SF, CR-130, 14 Oct 2026).** Before submitting to any store, ask the developer for the current SoundFind store listing pack (claude.ai project doc claude/SoundFind-store-listing-pack.md). Apply every field marked APPROVED for that store, and only those. A field marked CHECK FIRST is applied only if its named check has been reported. Never write or reword listing copy here. The one exception is What's New / release notes, which the build session writes from the CLI-reported contents of the build being submitted, per the pack. Everything else comes from the pack as written. Report which fields changed, so the comms session can read the live listing and log it.
- [ ] **5. Data safety and App Privacy match the SDKs (SF-71, 14 Oct 2026).** Play Data safety and Apple App Privacy must match the SDKs in the build. Re-run the SF-71 reads after any AdMob, RevenueCat or Sentry SDK upgrade.
- [ ] **6. The developer submits; the chat half reads back (standing).** The developer clicks every Submit / Start rollout / Publish. After release, the chat half reads the console back to confirm the release state.
