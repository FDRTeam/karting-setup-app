# Deployment Guide — FDR Kart Setup Data

**Complete guide for deploying the app to Apple users via PWA and TestFlight.**

---

## 📍 Current Status

| Component | Status | Access |
|-----------|--------|--------|
| **Web PWA** | ✅ Live | `https://kartsetup-fftu9jqd.manus.space` |
| **Expo Go** | ✅ Live | QR code / `exps://8081-iwedlhrro3d9e90eh95od-25a31932.us1.manus.computer` |
| **iOS Certificates** | ✅ Ready | Uploaded to EAS |
| **App Store Connect API Key** | ⏳ Pending | Needed for TestFlight |

---

## 🎯 Immediate: iPhone PWA Deployment

### What Users See
- App icon on home screen
- Full-screen app experience (no Safari UI)
- Offline support with cached data
- Auto-updates

### User Instructions
**See:** `INSTALL_ON_IPHONE.md`

1. Open Safari on iPhone
2. Go to: `https://kartsetup-fftu9jqd.manus.space`
3. Tap Share → Add to Home Screen
4. Tap Add
5. Launch from home screen

### Testing PWA
```bash
# Web URL is live and ready
https://kartsetup-fftu9jqd.manus.space

# Test on iPhone Safari:
1. Open Safari
2. Navigate to URL above
3. Test all features (weather, setup entry, history)
4. Test offline by enabling Airplane Mode
5. Test Add to Home Screen flow
```

---

## 🚀 Next: iOS TestFlight Deployment

### Prerequisites
1. **App Store Connect API Key** (generate in Apple Developer account)
2. **Key ID** (format: `ABC123DEF4`)
3. **Issuer ID** (format: UUID)
4. **`.p8` key file** (download and save securely)

### Step 1: Generate App Store Connect API Key

**In Apple Developer Account:**

1. Go to: `https://appstoreconnect.apple.com/access/api`
2. Sign in with `danielsjpusmc@gmail.com`
3. Click **Keys** tab
4. Click **+** button
5. **Key Name:** `EAS Build`
6. **Access Level:** `App Manager`
7. Click **Generate**
8. **Download** the `.p8` file immediately (can only download once)
9. **Note** the Key ID and Issuer ID

### Step 2: Add Credentials to EAS

```bash
cd /home/ubuntu/karting-setup-app

# Open EAS credentials manager
eas credentials --platform ios

# Select your project
# Choose: "Upload new ASC API key"
# Upload the .p8 file
# Enter Key ID
# Enter Issuer ID
# Save
```

### Step 3: Build and Submit to TestFlight

```bash
# Build for iOS and auto-submit to TestFlight
eas build --platform ios --auto-submit

# This will:
# 1. Build the app in EAS cloud (10-20 minutes)
# 2. Automatically submit to TestFlight
# 3. Make it available for tester distribution
```

### Step 4: Distribute via TestFlight

**In App Store Connect:**

1. Go to: `https://appstoreconnect.apple.com`
2. Select your app
3. Go to **TestFlight** tab
4. Click **iOS Builds**
5. Select the build you just submitted
6. Click **Add Testers**
7. Enter tester email addresses
8. Send invitations

**Testers will:**
1. Receive email invitation
2. Click link or open TestFlight app
3. Install the app
4. Provide feedback

### Step 5: Iterate and Improve

```bash
# Make code changes
# Commit to git
# Build again
eas build --platform ios --auto-submit

# New build appears in TestFlight
# Testers can update to latest version
```

---

## 📦 Source Code Export

### For Continuation Outside Manus

If you need to continue development outside the Manus platform:

#### Option 1: Git Repository
```bash
# The project is already a git repository
cd /home/ubuntu/karting-setup-app

# View remote
git remote -v

# Clone to your local machine
git clone <repository-url>

# Install dependencies
pnpm install

# Start development
pnpm dev
```

#### Option 2: Download as ZIP
```bash
# Download all project files
# Available in Manus Management UI → Code panel → Download all files

# Extract and install
unzip karting-setup-app.zip
cd karting-setup-app
pnpm install
pnpm dev
```

#### Option 3: Manual Export
```bash
# Copy entire project directory
cp -r /home/ubuntu/karting-setup-app /path/to/your/location

# Install dependencies
cd /path/to/your/location/karting-setup-app
pnpm install
```

### Key Files to Preserve
- `app.config.ts` — Expo configuration (bundle ID, icons, etc.)
- `eas.json` — EAS Build configuration
- `package.json` — Dependencies
- `public/` — PWA assets (manifest, service worker, icons)
- `.env` — Environment variables (keep secure!)
- `server/` — Backend code and database schema

### Credentials to Preserve
- **iOS Certificates** — Already in EAS (account-based)
- **App Store Connect API Key** — Store securely in `.env` or secrets manager
- **Database credentials** — In `.env` (keep secure!)

---

## 🔄 Deployment Workflow Summary

### Immediate (PWA) — Do Now
```
1. ✅ PWA already live at https://kartsetup-fftu9jqd.manus.space
2. ✅ Share INSTALL_ON_IPHONE.md with users
3. ✅ Users add to home screen in Safari
```

### TestFlight (Native iOS) — When Ready
```
1. Generate App Store Connect API Key
2. Add to EAS credentials
3. Run: eas build --platform ios --auto-submit
4. Share TestFlight link with testers
5. Collect feedback
6. Iterate and rebuild
```

### App Store (Public) — After TestFlight
```
1. Prepare app metadata
2. Add screenshots and description
3. Submit for review
4. Wait for Apple approval (24-48 hours)
5. Release to App Store
```

---

## 🛠️ Troubleshooting

### PWA Issues
- **App not loading:** Check internet, clear cache, try incognito
- **Add to Home Screen not showing:** Use Safari, not Chrome
- **Offline not working:** Check service worker in DevTools

### EAS Build Issues
- **Build fails:** Check EAS build logs for details
- **Credentials not found:** Verify API key is added to EAS
- **TestFlight submission fails:** Check app metadata is complete

### TestFlight Issues
- **Testers can't install:** Check they have TestFlight app installed
- **Build not appearing:** Wait 5-10 minutes for processing
- **App crashes on launch:** Check device logs, review error messages

---

## 📊 Deployment Checklist

### Pre-PWA
- [ ] Web URL loads correctly
- [ ] All features functional
- [ ] Weather integration working
- [ ] Offline support tested
- [ ] Responsive on iPhone/iPad

### Pre-TestFlight
- [ ] App Store Connect API Key generated
- [ ] Key ID and Issuer ID noted
- [ ] `.p8` file downloaded and stored securely
- [ ] EAS credentials configured
- [ ] All code changes committed to git

### Pre-App Store
- [ ] TestFlight feedback reviewed
- [ ] Bugs fixed and tested
- [ ] App metadata prepared (description, screenshots, keywords)
- [ ] Privacy policy updated
- [ ] Support contact information provided

---

## 📞 Support Resources

- **Expo Docs:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **TestFlight:** https://help.apple.com/app-store-connect/#/dev1ddcff652a
- **App Store Connect:** https://help.apple.com/app-store-connect/

---

## 🔐 Security Notes

### Credentials to Protect
- **App Store Connect API Key** — Store in `.env` or secrets manager, never commit to git
- **Database credentials** — Keep in `.env`, never expose publicly
- **Apple ID password** — Only used for initial setup, not stored

### Best Practices
- Use `.env` file for secrets (not committed to git)
- Rotate API keys periodically
- Use strong passwords for Apple Developer account
- Enable 2FA on Apple Developer account

---

## 📈 Next Steps

1. **Immediate:** Share PWA with users (INSTALL_ON_IPHONE.md)
2. **This Week:** Generate App Store Connect API Key
3. **Next Week:** Build and submit to TestFlight
4. **Following Week:** Collect feedback and iterate
5. **Final:** Submit to App Store for public release

---

**Last Updated:** 2026-05-19
