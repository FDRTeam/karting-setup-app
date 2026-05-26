# FDR Kart Setup Data — Release Checklist

**Two deployment paths: Immediate PWA + Native iOS via TestFlight**

---

## 🚀 Path 1: Immediate iPhone PWA (Available Now)

### For Apple Users — No Wait Required

**Status:** ✅ **READY TO USE**

Users can install immediately:
1. Open Safari on iPhone
2. Go to: `https://kartsetup-fftu9jqd.manus.space`
3. Tap Share → Add to Home Screen
4. Launch from home screen

**See:** `INSTALL_ON_IPHONE.md` for detailed instructions

### Features:
- ✅ Real-time weather integration
- ✅ Setup tracking and history
- ✅ Performance analytics
- ✅ Offline support (app shell cached)
- ✅ Auto-updates
- ✅ Works on iPhone, iPad, Mac

### Limitations:
- ❌ Not in App Store (no app store reviews/ratings)
- ❌ Limited push notifications
- ❌ Requires Safari (not standalone app store)

---

## 🎯 Path 2: Native iOS via TestFlight (Pending Credentials)

### For Production Release — Professional Distribution

**Status:** ⏳ **BLOCKED ON APP STORE CONNECT API KEY**

### Prerequisites:
- [ ] App Store Connect API Key generated (in Apple Developer account)
- [ ] Key ID noted (format: `ABC123DEF4`)
- [ ] Issuer ID noted (format: UUID)
- [ ] `.p8` key file downloaded and saved

### Setup Steps (When Credentials Ready):

1. **Add App Store Connect API Key to EAS:**
   ```bash
   eas credentials --platform ios
   ```
   - Select your project
   - Upload the `.p8` file
   - Enter Key ID and Issuer ID

2. **Build for TestFlight:**
   ```bash
   eas build --platform ios --auto-submit
   ```
   - EAS will build the app in the cloud
   - Automatically submit to TestFlight
   - No Mac required

3. **TestFlight Distribution:**
   - App appears in App Store Connect → TestFlight
   - Share TestFlight link with testers
   - Testers install via TestFlight app
   - Collect feedback before App Store submission

4. **App Store Submission (Later):**
   - Review TestFlight feedback
   - Make improvements
   - Submit to App Store for review
   - App appears in App Store after approval

### Requirements:
- [ ] iOS certificates and provisioning profiles (already uploaded to EAS)
- [ ] App Store Connect API Key
- [ ] Tester email addresses (for TestFlight invites)
- [ ] App Store metadata (description, screenshots, etc.)

### Timeline:
- **Build:** 10-20 minutes (EAS cloud)
- **TestFlight availability:** Immediate after build
- **App Store review:** 24-48 hours

---

## 📋 Pre-Release Checklist

### Code Quality
- [ ] All unit tests passing (`npm test`)
- [ ] TypeScript type checking passes (`npm run check`)
- [ ] No console errors or warnings
- [ ] Linting passes (`npm run lint`)

### Functionality
- [ ] Weather integration working (real data, not fallback)
- [ ] Track selection auto-populates weather
- [ ] Setup entry and history tracking functional
- [ ] Performance analytics display correctly
- [ ] All navigation flows complete end-to-end

### Branding
- [ ] App name correct: "FDR Kart Setup Data"
- [ ] App icon displays correctly
- [ ] Theme colors match brand (primary: #0a7ea4)
- [ ] Splash screen configured

### Testing
- [ ] Tested on iPhone 12+ (Safari PWA)
- [ ] Tested on iPhone 14+ (if available)
- [ ] Tested on iPad (responsive layout)
- [ ] Tested with slow network (offline handling)
- [ ] Tested on Expo Go (development)

### Documentation
- [ ] `INSTALL_ON_IPHONE.md` reviewed
- [ ] `EXPO_GO_TESTING.md` reviewed
- [ ] `README.md` updated with deployment info
- [ ] Release notes prepared

---

## 🔄 Deployment Workflow

### Immediate Release (PWA):
```
1. Verify PWA loads at https://kartsetup-fftu9jqd.manus.space
2. Test "Add to Home Screen" on iPhone
3. Share INSTALL_ON_IPHONE.md with users
4. Monitor for issues
```

### TestFlight Release (When Ready):
```
1. Obtain App Store Connect API Key
2. Add credentials to EAS
3. Run: eas build --platform ios --auto-submit
4. Wait for build to complete
5. Share TestFlight link with testers
6. Collect feedback
7. Iterate and rebuild as needed
```

### App Store Release (After TestFlight):
```
1. Prepare app metadata (description, screenshots)
2. Set pricing and availability
3. Submit for review
4. Wait for Apple review (24-48 hours)
5. Release to App Store
```

---

## 📊 Status Dashboard

| Component | Status | Notes |
|-----------|--------|-------|
| Web PWA | ✅ Ready | Available now at web URL |
| Expo Go | ✅ Ready | QR code available for testing |
| iOS Certificates | ✅ Ready | Already uploaded to EAS |
| App Store Connect API Key | ⏳ Pending | Waiting for user to generate |
| EAS Build | ⏳ Pending | Blocked on API Key |
| TestFlight | ⏳ Pending | Blocked on EAS Build |
| App Store | ⏳ Pending | Post-TestFlight phase |

---

## 🎓 Next Steps

### For Immediate Apple User Access:
1. Share `INSTALL_ON_IPHONE.md` with users
2. Direct them to: `https://kartsetup-fftu9jqd.manus.space`
3. Users add to home screen in Safari

### For Professional Distribution:
1. Generate App Store Connect API Key (in Apple Developer account)
2. Provide Key ID, Issuer ID, and `.p8` file to development team
3. Team runs EAS build with credentials
4. TestFlight link available for distribution

---

## 📞 Support

- **PWA Issues:** Check browser console, clear cache, try in incognito mode
- **Expo Go Issues:** Restart Expo Go, check internet connection
- **Build Issues:** Check EAS build logs, verify credentials
- **App Store Issues:** Contact Apple App Store Support

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0.0 | 2026-05-19 | PWA Ready | Initial release with PWA support |
| 1.0.1 | TBD | TestFlight | Native iOS via EAS Build |
| 1.1.0 | TBD | App Store | Public release |

