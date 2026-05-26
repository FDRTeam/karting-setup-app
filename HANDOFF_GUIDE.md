# FDR Kart Setup Data — Complete Handoff Guide

**Build and deployment configuration for continuing development outside Manus.**

---

## 📦 Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | FDR Kart Setup Data |
| **Framework** | React Native + Expo SDK 54 |
| **Package Manager** | pnpm 9.12.0 |
| **Node Version** | 22.13.0+ |
| **iOS Bundle ID** | `space.manus.karting.setup.app.t20260316084908` |
| **Android Package** | `space.manus.karting.setup.app.t20260316084908` |
| **EAS Project ID** | `35eacbd2-1293-4dea-a9c0-41c07b33bb31` |
| **Team ID (Apple)** | `7CFX8TJVD6` |

---

## 🔑 Critical Configuration Files

### `app.config.ts`
**Expo configuration** — defines bundle ID, app name, icons, plugins, and build settings.

```typescript
// Key values:
const bundleId = "space.manus.karting.setup.app.t20260316084908";
const env = {
  appName: "FDR Kart Setup Data",
  appSlug: "karting-setup-app",
  logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663441702146/Fftu9JQd2wjiu6sz88Saj8/icon-7gJpNfXxgfafkTFn7tJmNk.webp",
  iosBundleId: bundleId,
  androidPackage: bundleId,
};
```

### `eas.json`
**EAS Build configuration** — defines build profiles for development, preview, and production.

```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "distribution": "store" }
  },
  "submit": {
    "production": {
      "ios": { "teamId": "7CFX8TJVD6" }
    }
  }
}
```

### `package.json`
**Dependencies and scripts** — all npm packages and build commands.

Key scripts:
```json
{
  "dev": "concurrently -k \"pnpm dev:server\" \"pnpm dev:metro\"",
  "build": "esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "android": "expo start --android",
  "ios": "expo start --ios"
}
```

---

## 🌍 Environment Variables

### Required for Local Development

```bash
# Database (TiDB Cloud)
DATABASE_URL=mysql://rMtoxcFkpbtowTn.root:92Ea6fUFmBKXWO043goc@gateway04.us-east-1.prod.aws.tidbcloud.com:4000/Fftu9JQd2wjiu6sz88Saj8?ssl={"rejectUnauthorized":true}

# API Base URL (for web/mobile to communicate with backend)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000  # Local dev
# OR for production:
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com

# JWT Secret (for backend authentication)
JWT_SECRET=hbJzhDZAi6LSs36acnEPys

# OAuth (for user authentication)
OAUTH_SERVER_URL=https://api.manus.im
```

### Optional (Manus-specific, not needed outside Manus)
```bash
BUILT_IN_FORGE_API_KEY=...
BUILT_IN_FORGE_API_URL=...
VITE_APP_ID=...
VITE_ANALYTICS_ENDPOINT=...
```

---

## 🚀 Local Development Setup

### 1. Install Dependencies

```bash
# Clone or download the project
cd karting-setup-app

# Install dependencies (uses pnpm)
pnpm install

# If pnpm not installed:
npm install -g pnpm@9.12.0
```

### 2. Set Up Environment

Create `.env` file in project root:

```bash
DATABASE_URL=mysql://rMtoxcFkpbtowTn.root:92Ea6fUFmBKXWO043goc@gateway04.us-east-1.prod.aws.tidbcloud.com:4000/Fftu9JQd2wjiu6sz88Saj8?ssl={"rejectUnauthorized":true}
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
JWT_SECRET=hbJzhDZAi6LSs36acnEPys
OAUTH_SERVER_URL=https://api.manus.im
```

### 3. Start Development Server

```bash
# Start both backend (Node.js) and frontend (Expo Metro)
pnpm dev

# This runs:
# - Backend: tsx watch server/_core/index.ts (port 3000)
# - Frontend: expo start --web (port 8081)

# In separate terminals:
pnpm dev:server  # Backend only
pnpm dev:metro   # Frontend only
```

### 4. Access the App

- **Web:** http://localhost:8081
- **Expo Go (iOS/Android):** Scan QR code from terminal output
- **Backend API:** http://localhost:3000

---

## 📱 Building for iOS (EAS Build)

### Prerequisites

1. **Expo Account** — Create at https://expo.dev
2. **Expo Token** — Generate in account settings
3. **Apple Developer Account** — $99/year membership
4. **iOS Certificates** — Already configured in EAS (from earlier setup)
5. **App Store Connect API Key** — Generate in Apple Developer account

### Step 1: Set Up EAS CLI

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to Expo
eas login
# Enter your Expo credentials

# Verify project is linked
eas project:info
# Should show: Project ID: 35eacbd2-1293-4dea-a9c0-41c07b33bb31
```

### Step 2: Generate App Store Connect API Key

**In Apple Developer Account:**

1. Go to: https://appstoreconnect.apple.com/access/api
2. Click **Keys** tab
3. Click **+** button
4. **Key Name:** `EAS Build`
5. **Access Level:** `App Manager`
6. Click **Generate**
7. **Download** the `.p8` file (save securely)
8. **Note** the Key ID and Issuer ID

### Step 3: Add Credentials to EAS

```bash
# Open EAS credentials manager
eas credentials --platform ios

# Follow prompts:
# 1. Select project: karting-setup-app
# 2. Choose: "Upload new ASC API key"
# 3. Upload the .p8 file
# 4. Enter Key ID
# 5. Enter Issuer ID
# 6. Save
```

### Step 4: Build for TestFlight

```bash
# Build iOS app and auto-submit to TestFlight
eas build --platform ios --auto-submit

# This will:
# 1. Build in EAS cloud (10-20 minutes)
# 2. Automatically submit to TestFlight
# 3. Make available for tester distribution
```

### Step 5: Distribute via TestFlight

**In App Store Connect:**

1. Go to: https://appstoreconnect.apple.com
2. Select app: FDR Kart Setup Data
3. Go to: TestFlight → iOS Builds
4. Select the build you just submitted
5. Click: Add Testers
6. Enter tester email addresses
7. Send invitations

---

## 🤖 Building for Android (EAS Build)

### Build Command

```bash
# Build Android APK
eas build --platform android

# This will:
# 1. Build in EAS cloud (15-25 minutes)
# 2. Generate APK file
# 3. Provide download link
```

### Download and Test

```bash
# After build completes, download APK
# Install on Android device:
adb install app-release.apk

# Or share the download link with testers
```

---

## 🧪 Testing & Verification

### Run Unit Tests

```bash
# Run all tests
pnpm test

# Expected output:
# ✓ tests/weather.test.ts (19 tests)
# ✓ lib/__tests__/setup-history-weather.test.ts (11 tests)
# ✓ lib/__tests__/admin-manager-sharing.test.ts (25 tests)
# ✓ lib/__tests__/analytics.test.ts (20 tests)
# ✓ lib/__tests__/notifications-reports-widgets.test.ts (23 tests)
# ✓ lib/__tests__/services.test.ts (14 tests)
# ✓ lib/__tests__/cloud-sync.test.ts (15 tests)
# Test Files: 7 passed | 1 skipped
# Tests: 127 passed | 1 skipped
```

### Type Checking

```bash
# Check TypeScript types
pnpm check

# Should complete without errors
```

### Linting

```bash
# Run ESLint
pnpm lint

# Fix issues automatically
pnpm format
```

---

## 📊 Build Profiles

### Development
```bash
eas build --platform ios --profile development

# For development client (internal testing)
# Distribution: internal
# Signing: development certificate
```

### Preview
```bash
eas build --platform ios --profile preview

# For internal testing/preview
# Distribution: internal
# Signing: distribution certificate
```

### Production (TestFlight/App Store)
```bash
eas build --platform ios --profile production

# For TestFlight and App Store
# Distribution: store
# Signing: distribution certificate
```

---

## 🔐 Credentials & Security

### What's Already Set Up

- ✅ iOS distribution certificate (uploaded to EAS)
- ✅ iOS provisioning profile (uploaded to EAS)
- ✅ Bundle ID registered with Apple
- ✅ App ID created in Apple Developer

### What You Need to Provide

- ⏳ App Store Connect API Key (`.p8` file)
- ⏳ Key ID and Issuer ID from Apple

### Storage Best Practices

```bash
# Store credentials securely:
# 1. Never commit .p8 files to git
# 2. Use .env file (add to .gitignore)
# 3. Use environment variables in CI/CD
# 4. Rotate API keys periodically
```

---

## 📥 Source Code Export

### Option 1: Git Repository

```bash
# Clone from S3 git remote
git clone s3://vida-prod-gitrepo/webdev-git/310519663441702146/Fftu9JQd2wjiu6sz88Saj8

# Or add as remote to existing repo
git remote add origin s3://vida-prod-gitrepo/webdev-git/310519663441702146/Fftu9JQd2wjiu6sz88Saj8
git fetch origin
git pull origin main
```

### Option 2: Download as ZIP

```bash
# Download all project files from Manus UI
# Or manually copy the directory:
cp -r /home/ubuntu/karting-setup-app /path/to/your/location
```

### Project Structure

```
karting-setup-app/
├── app/                          # Expo Router screens
│   ├── (tabs)/                  # Tab-based navigation
│   ├── _layout.tsx              # Root layout
│   └── oauth/                   # Auth callbacks
├── components/                  # Reusable React components
├── lib/                         # Utilities, hooks, services
│   ├── types.ts                # TypeScript types
│   ├── data/tracks.ts          # Track database
│   └── __tests__/              # Unit tests
├── server/                      # Backend (Node.js)
│   ├── _core/index.ts          # tRPC server
│   └── db/                      # Database schema
├── public/                      # PWA assets
│   ├── manifest.json           # Web app manifest
│   └── service-worker.js       # Service worker
├── assets/                      # App icons and images
├── app.config.ts               # Expo configuration
├── eas.json                    # EAS Build configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
└── README.md                   # Project documentation
```

---

## 🔧 Troubleshooting

### Build Fails: "Credentials not found"
```bash
# Verify credentials are added
eas credentials --platform ios

# Re-add if needed
eas credentials --platform ios --clear
```

### Build Fails: "Invalid bundle ID"
```bash
# Check bundle ID in app.config.ts matches Apple Developer
# Bundle ID must be registered in Apple Developer account
```

### Local Dev Server Won't Start
```bash
# Check ports are available
lsof -i :8081
lsof -i :3000

# Kill existing processes if needed
kill -9 <PID>

# Clear cache and restart
rm -rf node_modules/.cache
pnpm dev
```

### Tests Fail
```bash
# Clear test cache
pnpm test -- --clearCache

# Run specific test file
pnpm test -- lib/__tests__/setup-history-weather.test.ts
```

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript types valid (`pnpm check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] API endpoints responding
- [ ] Web preview loads at http://localhost:8081
- [ ] Expo Go QR code works
- [ ] iOS certificates in EAS
- [ ] App Store Connect API Key generated
- [ ] Bundle ID matches Apple Developer

---

## 📞 Support Resources

- **Expo Docs:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **React Native:** https://reactnative.dev
- **TypeScript:** https://www.typescriptlang.org
- **Tailwind CSS:** https://tailwindcss.com

---

## 🎯 Next Steps

1. **Local Development** — Clone repo, install dependencies, run `pnpm dev`
2. **Verify Tests** — Run `pnpm test` to ensure everything works
3. **Generate API Key** — Create App Store Connect API Key in Apple Developer
4. **Configure EAS** — Add credentials with `eas credentials --platform ios`
5. **Build for TestFlight** — Run `eas build --platform ios --auto-submit`
6. **Distribute** — Share TestFlight link with testers

---

**Last Updated:** 2026-05-19
