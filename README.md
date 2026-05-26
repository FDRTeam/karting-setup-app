# FDR Kart Setup Data

**Real-time karting setup tracker with live weather integration and performance analytics.**

Track your kart's configuration, monitor live weather conditions, and analyze performance data across different tracks and setups.

---

## 🚀 Quick Start for Users

### For iPhone Users (Immediate):
1. Open Safari on your iPhone
2. Go to: `https://kartsetup-fftu9jqd.manus.space`
3. Tap Share → Add to Home Screen
4. Launch from your home screen

**See:** `INSTALL_ON_IPHONE.md` for detailed instructions

### For Developers (Testing):
1. Install Expo Go on your phone (App Store or Google Play)
2. Scan the QR code or visit: `exps://8081-iwedlhrro3d9e90eh95od-25a31932.us1.manus.computer`
3. App loads in Expo Go for development testing

**See:** `EXPO_GO_TESTING.md` for detailed instructions

---

## 📱 Available Platforms

| Platform | Status | Access | Notes |
|----------|--------|--------|-------|
| **iPhone PWA** | ✅ Live | Safari → Add to Home Screen | Immediate, no wait |
| **iPad PWA** | ✅ Live | Safari → Add to Home Screen | Responsive design |
| **Android PWA** | ✅ Live | Chrome → Install app | Responsive design |
| **Expo Go** | ✅ Live | Scan QR or URL | Development testing |
| **iOS Native (TestFlight)** | ⏳ Pending | App Store Connect API Key | Professional distribution |
| **App Store** | ⏳ Future | After TestFlight | Public release |

---

## ✨ Features

### Core Functionality
- **Setup Tracking** — Save kart configurations (tire PSI, chassis geometry, weight distribution)
- **Real-Time Weather** — Auto-fetches current conditions for selected track
- **Track Database** — Pre-configured tracks with auto-weather population
- **Performance History** — View past setups with associated weather and lap times
- **Performance Analytics** — Correlate setup changes with weather conditions

### Technical
- **Cross-Platform** — Works on iPhone, iPad, Android, and web
- **Offline Support** — App shell cached locally; syncs when online
- **Auto-Updates** — Latest version available automatically
- **Responsive Design** — Optimized for mobile and tablet

---

## 🛠️ Development

### Tech Stack
- **Framework:** React Native + Expo SDK 54
- **Router:** Expo Router 6
- **Styling:** NativeWind (Tailwind CSS)
- **Backend:** Node.js + tRPC + PostgreSQL
- **Database:** Drizzle ORM

### Project Structure
```
karting-setup-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation
│   ├── _layout.tsx        # Root layout
│   └── oauth/             # Auth callbacks
├── components/            # Reusable components
├── lib/                   # Utilities and hooks
├── server/                # Backend (tRPC, database)
├── public/                # PWA assets (manifest, icons, service worker)
├── app.config.ts          # Expo configuration
├── eas.json              # EAS Build configuration
├── package.json          # Dependencies
└── README.md             # This file
```

### Setup Development Environment
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm check

# Linting
pnpm lint
```

### Build for Deployment

**Web (PWA):**
```bash
pnpm build
# Output in dist/
```

**iOS (EAS Build):**
```bash
eas build --platform ios --auto-submit
# Builds in cloud, submits to TestFlight
```

**Android (EAS Build):**
```bash
eas build --platform android
# Builds APK in cloud
```

---

## 📋 Deployment Paths

### Path 1: iPhone PWA (Immediate)
**Status:** ✅ Ready now

Users can install instantly without waiting for app store approval:
- Open Safari on iPhone
- Go to web URL
- Add to Home Screen
- Full app functionality

**Limitations:**
- Not in App Store
- Limited push notifications
- Requires Safari (not app store)

**See:** `INSTALL_ON_IPHONE.md`

---

### Path 2: iOS TestFlight (Professional)
**Status:** ⏳ Pending App Store Connect API Key

For professional distribution and testing:
1. Generate App Store Connect API Key
2. Add to EAS credentials
3. Run `eas build --platform ios --auto-submit`
4. Share TestFlight link with testers
5. Collect feedback before App Store submission

**Timeline:**
- Build: 10-20 minutes
- TestFlight: Immediate
- App Store review: 24-48 hours

**See:** `RELEASE_CHECKLIST.md`

---

### Path 3: App Store (Future)
After TestFlight validation, submit to App Store for public release.

---

## 🔐 Environment Variables

### Development
```bash
DATABASE_URL=postgresql://...
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Production
```bash
DATABASE_URL=postgresql://...
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

---

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### Manual Testing
- **PWA:** Open `https://kartsetup-fftu9jqd.manus.space` in Safari
- **Expo Go:** Scan QR code or use `exps://...` URL
- **Native:** Build with EAS and test on device

---

## 📚 Documentation

- `INSTALL_ON_IPHONE.md` — User guide for PWA installation
- `EXPO_GO_TESTING.md` — Developer guide for Expo Go testing
- `RELEASE_CHECKLIST.md` — Deployment checklist and workflow
- `design.md` — UI/UX design specifications
- `todo.md` — Feature tracking and roadmap

---

## 🚀 Release Workflow

### Immediate (PWA):
1. ✅ Verify web URL loads
2. ✅ Test Add to Home Screen on iPhone
3. ✅ Share `INSTALL_ON_IPHONE.md`

### TestFlight (When Ready):
1. Generate App Store Connect API Key
2. Add credentials to EAS
3. Run `eas build --platform ios --auto-submit`
4. Share TestFlight link

### App Store (Post-TestFlight):
1. Prepare app metadata
2. Submit for review
3. Release to App Store

**See:** `RELEASE_CHECKLIST.md` for detailed steps

---

## 🐛 Troubleshooting

### PWA Not Loading
- Check internet connection
- Clear Safari cache: Settings → Safari → Clear History and Website Data
- Try in incognito mode

### Expo Go Not Connecting
- Ensure you're on the same WiFi network
- Restart Expo Go
- Check dev server is running (`pnpm dev`)

### Build Failures
- Check EAS build logs
- Verify credentials are set up
- Ensure all dependencies are installed

---

## 📞 Support

For issues or questions:
- Check the relevant documentation file
- Review the troubleshooting section
- Contact the development team

---

## 📄 License

Proprietary — FDR Racing

---

## 🔄 Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0.0 | 2026-05-19 | PWA Ready | Initial release with PWA support |
| 1.0.1 | TBD | TestFlight | Native iOS via EAS Build |
| 1.1.0 | TBD | App Store | Public release |

---

**Last Updated:** 2026-05-19
