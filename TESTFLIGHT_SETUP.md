# TestFlight Setup Guide

**Step-by-step instructions to set up iOS TestFlight deployment via EAS Build.**

---

## 📋 Overview

This guide walks you through:
1. Generating an App Store Connect API Key
2. Adding it to EAS credentials
3. Building and submitting to TestFlight
4. Distributing to testers

**Time Required:** 15-20 minutes

---

## ✅ Prerequisites

- Apple Developer account with active membership
- Team ID: `7CFX8TJVD6` (already configured)
- iOS certificates and provisioning profiles (already uploaded to EAS)
- Expo token: `T1XSKQa4Vfq5AO7xRk3VzpHWMaORuEmJ9Y6GxaUP`

---

## 🔑 Step 1: Generate App Store Connect API Key

### In Apple Developer Account

1. **Go to:** `https://appstoreconnect.apple.com/access/api`
2. **Sign in** with `danielsjpusmc@gmail.com` / `Dodgeram2500`
3. **Click** the **Keys** tab (if not already selected)
4. **Click** the **+** button to create a new key
5. **Key Name:** Enter `EAS Build`
6. **Access Level:** Select `App Manager` (allows building and submitting apps)
7. **Click** Generate
8. **IMPORTANT:** Download the `.p8` file immediately — you can only download it once!
9. **Save** the Key ID and Issuer ID (you'll need these)

### Information to Collect

After generating, you'll see:
- **Key ID** (looks like: `ABC123DEF4`)
- **Issuer ID** (looks like: `12a34b5c-6d7e-8f9g-0h1i-2j3k4l5m6n7o`)
- **`.p8` file** (download and save securely)

**Write these down:**
```
Key ID: ___________________
Issuer ID: ___________________
.p8 file: ___________________
```

---

## 🔐 Step 2: Add Credentials to EAS

### Option A: Via CLI (Recommended)

```bash
cd /home/ubuntu/karting-setup-app

# Open EAS credentials manager
eas credentials --platform ios

# Follow prompts:
# 1. Select project: karting-setup-app
# 2. Choose: "Upload new ASC API key"
# 3. Upload the .p8 file you downloaded
# 4. Enter the Key ID
# 5. Enter the Issuer ID
# 6. Confirm and save
```

### Option B: Via Expo Dashboard (Web)

1. Go to: `https://expo.dev`
2. Sign in with your Expo account
3. Select project: `karting-setup-app`
4. Go to **Credentials** → **iOS**
5. Click **Add App Store Connect API Key**
6. Upload `.p8` file
7. Enter Key ID and Issuer ID
8. Save

---

## 🏗️ Step 3: Build for TestFlight

### Build Command

```bash
cd /home/ubuntu/karting-setup-app

# Build iOS app and auto-submit to TestFlight
eas build --platform ios --auto-submit

# This will:
# 1. Build the app in EAS cloud (10-20 minutes)
# 2. Automatically submit to TestFlight
# 3. Make it available for distribution
```

### What Happens

1. **EAS starts build** — You'll see a build ID and progress link
2. **Build compiles** — React Native code compiled to iOS binary
3. **Code signing** — App signed with your distribution certificate
4. **Upload to Apple** — Build uploaded to App Store Connect
5. **TestFlight processing** — Apple processes the build (5-10 minutes)
6. **Ready for testing** — Build appears in TestFlight

### Monitor Progress

```bash
# View build status
eas build:list

# View specific build logs
eas build:view <BUILD_ID>
```

---

## 📱 Step 4: Distribute via TestFlight

### In App Store Connect

1. **Go to:** `https://appstoreconnect.apple.com`
2. **Sign in** with `danielsjpusmc@gmail.com`
3. **Select app:** FDR Kart Setup Data
4. **Go to:** TestFlight → iOS Builds
5. **Select** the build you just submitted
6. **Click** Add Testers (or Invite Testers)
7. **Enter tester email addresses** (one per line)
8. **Click** Send Invite

### What Testers Receive

Testers will receive an email with:
- Link to install TestFlight app (if needed)
- Link to install your app
- Instructions to provide feedback

### Testers Install

1. **Click** the link in email
2. **Open TestFlight** app (or install it)
3. **Tap** Install
4. **Launch** the app
5. **Provide** feedback

---

## 🔄 Step 5: Iterate and Improve

### Make Changes and Rebuild

```bash
# Make code changes
# Commit to git
git add .
git commit -m "Fix weather display"

# Build again
eas build --platform ios --auto-submit

# New build appears in TestFlight
# Testers see update notification
```

### Testers Update

- TestFlight shows "Update Available"
- Testers tap to update
- New version installs
- Feedback cycle continues

---

## 📊 Monitoring and Feedback

### In App Store Connect

1. **TestFlight** → **Feedback** — See tester feedback
2. **TestFlight** → **Crashes** — View crash reports
3. **TestFlight** → **Sessions** — See usage analytics

### Collect Feedback

- Ask testers to report issues
- Monitor crash reports
- Track feature requests
- Gather performance data

---

## ✅ Checklist

- [ ] Generated App Store Connect API Key
- [ ] Downloaded `.p8` file and saved securely
- [ ] Noted Key ID and Issuer ID
- [ ] Added credentials to EAS
- [ ] Ran `eas build --platform ios --auto-submit`
- [ ] Build completed successfully
- [ ] Build appears in TestFlight
- [ ] Added tester email addresses
- [ ] Sent TestFlight invitations
- [ ] Testers received emails
- [ ] Testers installed app
- [ ] Collected feedback

---

## 🐛 Troubleshooting

### Build Fails: "Credentials not found"
- Verify API key is added to EAS
- Check Key ID and Issuer ID are correct
- Ensure `.p8` file is valid

### Build Fails: "Invalid credentials"
- Verify Key ID and Issuer ID match
- Check `.p8` file hasn't expired
- Generate new key if needed

### Build Succeeds but Not in TestFlight
- Wait 5-10 minutes for Apple processing
- Refresh App Store Connect
- Check build status in TestFlight tab

### Testers Can't Install
- Verify they have TestFlight app installed
- Check email invitation was sent
- Resend invitation if needed

### App Crashes on Launch
- Check device logs in TestFlight
- Review EAS build logs for errors
- Fix code and rebuild

---

## 📞 Support

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **TestFlight Docs:** https://help.apple.com/app-store-connect/#/dev1ddcff652a
- **App Store Connect:** https://help.apple.com/app-store-connect/

---

## 🔐 Security

### Protect Your Credentials

- **API Key (.p8 file):** Store securely, never commit to git
- **Key ID:** Can be public (shown in App Store Connect)
- **Issuer ID:** Can be public (shown in App Store Connect)
- **Apple ID Password:** Only used for initial setup, not stored

### Best Practices

- Store `.p8` file in secure location
- Rotate API keys periodically
- Use strong Apple ID password
- Enable 2FA on Apple Developer account

---

## ⏭️ Next Steps

1. ✅ Generate App Store Connect API Key (this guide)
2. ✅ Build and submit to TestFlight (this guide)
3. ⏭️ Collect TestFlight feedback
4. ⏭️ Iterate and improve
5. ⏭️ Submit to App Store for public release

---

**Last Updated:** 2026-05-19
