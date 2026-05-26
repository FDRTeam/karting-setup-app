# Test with Expo Go (Development)

**For developers and testers who want to test the native mobile app in development mode.**

## What is Expo Go?

Expo Go is a free app that lets you run React Native apps directly on your phone without building or installing anything. Perfect for testing during development.

---

## Install Expo Go

1. **On your iPhone:**
   - Open App Store
   - Search for "Expo Go"
   - Install the free app by Expo

2. **On Android:**
   - Open Google Play Store
   - Search for "Expo Go"
   - Install the free app by Expo

---

## Launch the App

### Method 1: Scan QR Code (Easiest)

1. Open Expo Go app on your phone
2. Tap the **Scan QR Code** button
3. Point your camera at the QR code below:

```
[QR Code will be displayed here when dev server is running]
```

Or go to: `https://8081-iwedlhrro3d9e90eh95od-25a31932.us1.manus.computer`

### Method 2: Manual URL

1. Open Expo Go
2. Tap the **Explore** tab
3. Paste this URL: `exps://8081-iwedlhrro3d9e90eh95od-25a31932.us1.manus.computer`

---

## What You Can Test

✅ Full app functionality (setup entry, weather, history, performance tracking)  
✅ Real-time weather integration  
✅ Track selection and auto-weather population  
✅ Tire setup configurations  
✅ Performance analytics  
✅ All UI/UX flows  

---

## Limitations in Expo Go

- Some native features may not work (certain device APIs)
- App may be slower than native build
- Can't test push notifications in Expo Go
- No offline support (requires native build)

---

## Hot Reload

Changes to the code automatically reload in Expo Go:
- Save a file → app updates in ~1-2 seconds
- Perfect for rapid testing and iteration

---

## Troubleshooting

### QR code won't scan?
- Make sure your phone camera has permission to access
- Try typing the URL manually instead
- Ensure you're on the same WiFi network as the dev server

### App crashes on load?
- Check the dev server logs for errors
- Try restarting Expo Go
- Refresh the connection (pull down to refresh in Expo Go)

### Slow performance?
- This is normal in Expo Go (development mode)
- Native builds are much faster
- Check your internet connection

---

## Next: Native App Build

Once ready for production:
1. **iPhone:** TestFlight (via EAS Build + App Store Connect)
2. **Android:** Google Play Store
3. **Web:** PWA (already available at `https://kartsetup-fftu9jqd.manus.space`)

---

## Support

For development issues, check the Expo documentation or contact the team.
