# Windows Store Submission Checklist — SoundFind

Complete every item before uploading a package to Partner Center.
Do not submit until all boxes are checked. No exceptions.

---

## 1. Package Integrity

- [ ] `AppxManifest.xml` extracted and read — identity name, publisher CN, version, display name all correct
- [ ] Package version incremented from last submission
- [ ] Architecture matches declaration (x64, Arm64)
- [ ] `electron:dist` build completed cleanly with no warnings

## 2. Visual Assets — open every file and eyeball it

- [ ] `StoreLogo.png` (50×50) — branded icon on dark background, not white/generic
- [ ] `Square44x44Logo.png` (44×44) — same
- [ ] `Square150x150Logo.png` (150×150) — same
- [ ] `Wide310x150Logo.png` (310×150) — same
- [ ] No default Electron placeholder assets present

## 3. Install and Smoke Test

- [ ] APPX installed on a real Windows machine (not dev build)
- [ ] App launches without errors
- [ ] Splash screen displays correctly
- [ ] Home screen loads — all game modes visible
- [ ] At least one game played to completion
- [ ] Audio works (Audio Challenge mode)
- [ ] Settings page opens — voice test works
- [ ] App name, icon, and publisher correct in Apps & Features
- [ ] No crash or console error on launch

## 4. Store Listing Review

- [ ] Screenshots match current app UI
- [ ] Description and short description proofread
- [ ] Age rating complete
- [ ] Privacy policy URL loads: uniquegames.com.au/soundfind/privacy/
- [ ] Terms of Service URL loads: uniquegames.com.au/soundfind/terms/
- [ ] Submission options complete (runFullTrust declared)

## 5. Partner Center Upload

- [ ] Package shows "Validated" after upload — no errors
- [ ] No unexpected warnings in validation report
- [ ] All submission sections show "Complete" before clicking Resubmit

---

## Sign-off

Before clicking Submit / Resubmit — confirm:
> "I have completed every item on this checklist. The app has been installed and tested as a real user would experience it."
