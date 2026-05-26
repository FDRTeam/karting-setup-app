# Quick Start — Local Development

**Get the app running on your machine in 5 minutes.**

---

## Prerequisites

- **Node.js 22+** — https://nodejs.org
- **pnpm 9.12.0** — `npm install -g pnpm@9.12.0`
- **Git** — https://git-scm.com
- **Expo CLI** — `npm install -g eas-cli` (for building)

---

## 1. Clone/Download Project

### Option A: From Git Repository

```bash
git clone s3://vida-prod-gitrepo/webdev-git/310519663441702146/Fftu9JQd2wjiu6sz88Saj8 karting-setup-app
cd karting-setup-app
```

### Option B: Download ZIP

```bash
# Download: https://files.manuscdn.com/user_upload_by_module/session_file/310519663441702146/OPRaiLOwFPcioHFk.gz

# Extract
tar -xzf OPRaiLOwFPcioHFk.gz
cd karting-setup-app
```

---

## 2. Install Dependencies

```bash
pnpm install

# This installs all npm packages (takes 2-3 minutes)
```

---

## 3. Configure Environment

Create `.env` file in project root:

```bash
DATABASE_URL=mysql://rMtoxcFkpbtowTn.root:92Ea6fUFmBKXWO043goc@gateway04.us-east-1.prod.aws.tidbcloud.com:4000/Fftu9JQd2wjiu6sz88Saj8?ssl={"rejectUnauthorized":true}
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
JWT_SECRET=hbJzhDZAi6LSs36acnEPys
OAUTH_SERVER_URL=https://api.manus.im
```

---

## 4. Start Development Server

```bash
pnpm dev

# This starts:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:8081
# - Metro bundler for Expo Go
```

---

## 5. Access the App

### Web Browser
```
http://localhost:8081
```

### Expo Go (iOS/Android)
1. Install Expo Go app (App Store or Google Play)
2. Scan QR code from terminal output
3. App loads in Expo Go

---

## 🧪 Verify Everything Works

```bash
# Run tests
pnpm test

# Check TypeScript types
pnpm check

# Lint code
pnpm lint
```

---

## 📱 Build for iOS (TestFlight)

### 1. Log in to Expo

```bash
eas login
# Enter your Expo credentials
```

### 2. Verify Project Link

```bash
eas project:info
# Should show: Project ID: 35eacbd2-1293-4dea-a9c0-41c07b33bb31
```

### 3. Add App Store Connect API Key

```bash
# Generate in Apple Developer account first:
# https://appstoreconnect.apple.com/access/api
# - Create key with "App Manager" access
# - Download .p8 file
# - Note Key ID and Issuer ID

# Then add to EAS:
eas credentials --platform ios
# Follow prompts to upload .p8 file
```

### 4. Build and Submit to TestFlight

```bash
eas build --platform ios --auto-submit

# This will:
# 1. Build in EAS cloud (10-20 minutes)
# 2. Automatically submit to TestFlight
# 3. Show download link when complete
```

### 5. Distribute via TestFlight

```
1. Go to: https://appstoreconnect.apple.com
2. Select app: FDR Kart Setup Data
3. Go to: TestFlight → iOS Builds
4. Select the build you just submitted
5. Click: Add Testers
6. Enter tester email addresses
7. Send invitations
```

---

## 🤖 Build for Android

```bash
# Build APK
eas build --platform android

# Download APK from link provided
# Install on Android device:
adb install app-release.apk
```

---

## 📚 Documentation

- **Full Setup:** See `HANDOFF_GUIDE.md`
- **Deployment:** See `DEPLOYMENT_GUIDE.md`
- **TestFlight:** See `TESTFLIGHT_SETUP.md`
- **PWA Installation:** See `INSTALL_ON_IPHONE.md`

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8081
lsof -i :8081
kill -9 <PID>

# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Dependencies Won't Install
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall
rm -rf node_modules
pnpm install
```

### Tests Fail
```bash
# Clear test cache
pnpm test -- --clearCache

# Run specific test
pnpm test -- lib/__tests__/setup-history-weather.test.ts
```

### Build Fails
```bash
# Check credentials
eas credentials --platform ios

# View build logs
eas build:list
eas build:view <BUILD_ID>
```

---

## 📋 Key Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (backend + frontend) |
| `pnpm dev:server` | Start backend only |
| `pnpm dev:metro` | Start frontend only |
| `pnpm test` | Run unit tests |
| `pnpm check` | TypeScript type checking |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier formatting |
| `eas build --platform ios` | Build for iOS |
| `eas build --platform android` | Build for Android |
| `eas build --platform ios --auto-submit` | Build iOS + submit to TestFlight |

---

## 🎯 Next Steps

1. ✅ Install dependencies (`pnpm install`)
2. ✅ Configure `.env` file
3. ✅ Start dev server (`pnpm dev`)
4. ✅ Verify tests pass (`pnpm test`)
5. ⏭️ Generate App Store Connect API Key
6. ⏭️ Build for TestFlight (`eas build --platform ios --auto-submit`)
7. ⏭️ Distribute to testers

---

**Need help?** See `HANDOFF_GUIDE.md` for detailed instructions.
