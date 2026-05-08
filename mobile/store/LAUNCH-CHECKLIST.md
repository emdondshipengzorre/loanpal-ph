# LoanPal PH — Google Play Launch Checklist

## Pre-Build

- [ ] Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in EAS secrets
- [ ] Run `npm run typecheck` — must pass with 0 errors
- [ ] Test on physical Android device via Expo Go or dev client
- [ ] Test all auth flows (phone OTP, Google OAuth)
- [ ] Test full CRUD: add loan → record payment → verify balance update
- [ ] Test OCR: camera capture → text extraction → review → import
- [ ] Test offline mode: airplane mode → add loan → reconnect → verify sync
- [ ] Test push notifications in background
- [ ] Test biometric lock (enable in settings → background → foreground)
- [ ] Test account deletion flow
- [ ] Test PDF export and sharing

## Build

- [ ] `npx eas build --profile preview --platform android` → install APK on device
- [ ] Smoke-test the preview APK (all features above)
- [ ] `npx eas build --profile production --platform android` → produces AAB

## Google Play Console Setup

### Account
- [ ] Create Google Play Developer account ($25 one-time fee)
- [ ] Create new app: "LoanPal PH" → Category: Finance

### Store Listing
- [ ] App name: "LoanPal PH"
- [ ] Short description: use `store/listing.md`
- [ ] Full description: use `store/listing.md`
- [ ] App icon: 512x512 PNG (generate from `assets/images/icon.png`)
- [ ] Feature graphic: 1024x500 PNG (create in Figma/Canva)
- [ ] Phone screenshots: minimum 2, recommended 8 (use Android emulator)
  - Overview/home screen
  - Loans list with progress bars
  - Quick-pay due-soon cards
  - Health score ring
  - Debt payoff strategy calculator
  - OCR scan camera view
  - Pay-day planner
  - Settings screen
- [ ] Contact email: zuoshipeng@gmail.com

### Content Rating
- [ ] Complete IARC questionnaire
- [ ] Expected rating: Everyone (finance calculator, no UGC, no violence)

### Privacy & Data Safety
- [ ] Privacy policy URL: host `store/privacy-policy.html` on Vercel/loanpal.ph
- [ ] Complete Data Safety form using `store/data-safety.md` as reference
- [ ] Confirm: app allows account deletion (Settings → Delete Account)

### Target Audience
- [ ] Target age group: 18+ (financial app)
- [ ] Not designed for children (no COPPA requirements)

### App Access
- [ ] If reviewers need to test: provide a test phone number + OTP or test Google account
- [ ] Add instructions for review team if app requires login

## Submit

### Internal Testing
- [ ] Create internal testing track
- [ ] Upload AAB via `npx eas submit --platform android`
  - Or upload manually: Play Console → Internal testing → Create release
- [ ] Add testers (email list)
- [ ] Install from internal test link → verify all features

### Closed Testing (optional but recommended)
- [ ] Promote to closed testing track
- [ ] Add 20+ testers for broader feedback
- [ ] Collect and address feedback

### Production Release
- [ ] Promote to production (or create production release)
- [ ] Set rollout percentage (start at 20%, then increase)
- [ ] Monitor Android Vitals (crashes, ANRs) in Play Console
- [ ] Monitor user reviews and respond within 24 hours

## Post-Launch

- [ ] Monitor crash reports in Play Console
- [ ] Set up EAS Update for OTA JS fixes (no new build needed)
- [ ] Plan version 1.1 based on user feedback
- [ ] Increment `versionCode` in app.json for each new build

## Service Account Key (for automated submission)

To use `eas submit` instead of manual upload:
1. Go to Google Cloud Console → IAM → Service Accounts
2. Create service account with "Service Account User" role
3. Go to Play Console → Settings → API access → link project
4. Grant the service account "Release manager" permission
5. Download JSON key → save as `mobile/play-store-key.json`
6. Add `play-store-key.json` to `.gitignore`
