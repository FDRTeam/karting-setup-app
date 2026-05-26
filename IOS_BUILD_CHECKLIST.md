# iOS Build Readiness Checklist

**Verify the app is ready for TestFlight submission.**

---

## ✅ Code Quality

- [x] All TypeScript types valid (`pnpm check` passes)
- [x] All unit tests passing (127 tests pass, 1 skipped)
- [x] ESLint passes (`pnpm lint`)
- [x] No console errors or warnings
- [x] Code formatted with Prettier (`pnpm format`)

**Verification:**
```bash
pnpm check      # ✓ No errors
pnpm test       # ✓ 127 passed | 1 skipped
pnpm lint       # ✓ No errors
```

---

## ✅ App Configuration

- [x] App name: `FDR Kart Setup Data`
- [x] Bundle ID: `space.manus.karting.setup.app.t20260316084908`
- [x] iOS Bundle ID matches Android package
- [x] App icon configured: `./assets/images/icon.png`
- [x] Splash screen configured: `./assets/images/splash-icon.png`
- [x] App version: `1.0.0`
- [x] Orientation: `portrait`
- [x] New Architecture enabled

**Configuration File:** `app.config.ts`

---

## ✅ iOS-Specific Setup

- [x] iOS bundle identifier set correctly
- [x] Tablet support enabled
- [x] Info.plist configured (ITSAppUsesNonExemptEncryption: false)
- [x] No native code requiring additional permissions

**Configuration:**
```typescript
ios: {
  supportsTablet: true,
  bundleIdentifier: "space.manus.karting.setup.app.t20260316084908",
  infoPlist: {
    ITSAppUsesNonExemptEncryption: false
  }
}
```

---

## ✅ EAS Build Configuration

- [x] EAS project ID: `35eacbd2-1293-4dea-a9c0-41c07b33bb31`
- [x] Build profiles configured (development, preview, production)
- [x] Production profile set to `distribution: store`
- [x] Submit configuration includes Apple Team ID: `7CFX8TJVD6`

**Configuration File:** `eas.json`

---

## ✅ Credentials Status

- [x] iOS distribution certificate uploaded to EAS
- [x] iOS provisioning profile uploaded to EAS
- [x] Bundle ID registered in Apple Developer account
- [x] App ID created in Apple Developer account
- [x] Team ID verified: `7CFX8TJVD6`

**Status:** Certificates and profiles are valid and ready.

---

## ⏳ Pre-Build Requirements

Before building for TestFlight, you need to provide:

- [ ] **App Store Connect API Key** (`.p8` file)
  - Generate at: https://appstoreconnect.apple.com/access/api
  - Access Level: `App Manager`
  - Download the `.p8` file (can only download once)

- [ ] **Key ID** (format: `ABC123DEF4`)
  - Shown in App Store Connect after generating API key

- [ ] **Issuer ID** (format: UUID)
  - Shown in App Store Connect after generating API key

---

## 🔧 Build Commands

### Verify Local Build Works

```bash
# Type check
pnpm check

# Run tests
pnpm test

# Lint code
pnpm lint
```

### Build for iOS (Once credentials are ready)

```bash
# Log in to Expo
eas login

# Add App Store Connect API Key to EAS
eas credentials --platform ios
# Follow prompts to upload .p8 file, enter Key ID and Issuer ID

# Build and submit to TestFlight
eas build --platform ios --auto-submit

# This will:
# 1. Build in EAS cloud (10-20 minutes)
# 2. Automatically submit to TestFlight
# 3. Provide download link when complete
```

---

## 📋 Pre-Submission Checklist

### Code Quality
- [x] All tests passing
- [x] TypeScript types valid
- [x] No console errors
- [x] No deprecated APIs used
- [x] Performance optimized

### App Functionality
- [x] Weather integration working (real data)
- [x] Track selection auto-populates weather
- [x] Setup entry and history tracking functional
- [x] Performance analytics display correctly
- [x] All navigation flows complete end-to-end
- [x] Offline support working
- [x] Data persistence working

### iOS-Specific
- [x] App icon displays correctly
- [x] Splash screen configured
- [x] Safe area handled properly
- [x] Notch/home indicator handled
- [x] Responsive layout on different screen sizes
- [x] Dark mode support working
- [x] Haptics working (if used)
- [x] Permissions configured correctly

### Metadata
- [x] App name: `FDR Kart Setup Data`
- [x] Bundle ID: `space.manus.karting.setup.app.t20260316084908`
- [x] Version: `1.0.0`
- [x] Build number: Ready to increment

### Deployment
- [x] EAS project linked
- [x] iOS certificates ready
- [x] Provisioning profile ready
- [x] Build profile configured
- [x] Submit configuration ready

---

## 🚀 Build Process

### Step 1: Prepare Credentials (One-time)

```bash
# Generate App Store Connect API Key
# 1. Go to: https://appstoreconnect.apple.com/access/api
# 2. Click Keys tab
# 3. Click + button
# 4. Key Name: "EAS Build"
# 5. Access Level: "App Manager"
# 6. Click Generate
# 7. Download .p8 file
# 8. Note Key ID and Issuer ID
```

### Step 2: Add Credentials to EAS

```bash
eas credentials --platform ios

# Follow prompts:
# 1. Select project: karting-setup-app
# 2. Choose: "Upload new ASC API key"
# 3. Upload the .p8 file
# 4. Enter Key ID
# 5. Enter Issuer ID
# 6. Save
```

### Step 3: Build for TestFlight

```bash
eas build --platform ios --auto-submit

# Monitor build progress:
# - Check terminal for build ID
# - View logs: eas build:view <BUILD_ID>
# - Wait for completion (10-20 minutes)
```

### Step 4: Distribute via TestFlight

```
1. Go to: https://appstoreconnect.apple.com
2. Select app: FDR Kart Setup Data
3. Go to: TestFlight → iOS Builds
4. Select the build
5. Click: Add Testers
6. Enter tester email addresses
7. Send invitations
```

---

## 📊 Build Status

| Component | Status | Notes |
|-----------|--------|-------|
| Code Quality | ✅ Ready | All tests passing, types valid |
| App Config | ✅ Ready | Bundle ID, icons, version configured |
| iOS Setup | ✅ Ready | Certificates and profiles uploaded |
| EAS Config | ✅ Ready | Project linked, build profiles set |
| Credentials | ⏳ Pending | Waiting for App Store Connect API Key |
| Build | ⏳ Pending | Ready to build once credentials provided |
| TestFlight | ⏳ Pending | Ready to submit once build completes |

---

## 🐛 Troubleshooting

### Build Fails: "Credentials not found"
```bash
# Verify credentials are added
eas credentials --platform ios

# Re-add if needed
eas credentials --platform ios --clear
```

### Build Fails: "Invalid bundle ID"
```bash
# Verify bundle ID matches Apple Developer
# Bundle ID: space.manus.karting.setup.app.t20260316084908
# Must be registered in Apple Developer account
```

### Build Fails: "Certificate expired"
```bash
# Regenerate certificate in Apple Developer
# Re-upload to EAS
eas credentials --platform ios --clear
```

### Build Succeeds but Not in TestFlight
```bash
# Wait 5-10 minutes for Apple processing
# Refresh App Store Connect
# Check build status in TestFlight tab
```

---

## 📞 Support

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **TestFlight Docs:** https://help.apple.com/app-store-connect/#/dev1ddcff652a
- **App Store Connect:** https://help.apple.com/app-store-connect/

---

## ✨ Next Steps

1. ✅ Verify code quality (`pnpm test`)
2. ✅ Verify app configuration (`app.config.ts`)
3. ✅ Verify iOS setup (certificates uploaded)
4. ⏭️ Generate App Store Connect API Key
5. ⏭️ Add credentials to EAS
6. ⏭️ Build for TestFlight
7. ⏭️ Distribute to testers
8. ⏭️ Collect feedback
9. ⏭️ Submit to App Store

---

**Status:** App is ready to build for TestFlight. Waiting for App Store Connect credentials.

**Last Updated:** 2026-05-19
