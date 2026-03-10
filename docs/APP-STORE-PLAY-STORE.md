# Publishing the IronFreight Driver App to Apple App Store & Google Play

This guide covers how to get the driver experience (and optionally the full app) onto the **Apple App Store** and **Google Play Store**. Your driver app is currently a web app (Next.js routes under `/driver`); both stores require a **native wrapper** around that web content.

---

## Overview

| Store | Best approach | Notes |
|-------|----------------|--------|
| **Google Play** | Capacitor or TWA (Trusted Web Activity) | TWA = minimal Chrome shell; Capacitor = same as iOS, one workflow. |
| **Apple App Store** | Capacitor (or similar native wrapper) | Apple does not accept “website-only” apps; you need a native shell. |

**Recommended:** Use **Capacitor** for **both** stores so you have one workflow, one codebase, and consistent behavior on iOS and Android.

---

## Prerequisites

1. **Apple Developer Program** – [developer.apple.com](https://developer.apple.com) – **$99/year** (required for App Store).
2. **Google Play Developer** – [play.google.com/console](https://play.google.com/console) – **$25 one-time** (required for Play Store).
3. **App assets** – Icons (you have these), splash screen, screenshots for each device size, privacy policy URL, short description, full description.

---

## Option 1: Capacitor (recommended for both stores)

Capacitor wraps your existing web app in a native iOS/Android shell. You keep using your Next.js app; Capacitor adds native projects and builds the store packages.

### 1. Install and configure Capacitor

From the **project root** (where `package.json` is):

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "IronFreight" "com.getironfreight.app"
```

- **App name:** IronFreight (or “IronFreight Driver” if you want a driver-only store listing).
- **App ID:** Use the same as your desktop app, e.g. `com.getironfreight.app`, or a distinct one for the mobile app (e.g. `com.getironfreight.driver`).

### 2. Point Capacitor at your built web app

Capacitor needs the **built** output (HTML/JS/CSS), not the Next.js source.

- **If the app is hosted (e.g. Netlify):** You can point the native app to your live URL so it loads the site in a WebView (simplest; no need to bundle the Next.js build into the app).
- **If you want the app to work offline:** Build Next.js and copy the export into the Capacitor web folder so Capacitor bundles it.

**Using a live URL (simplest):**

- In `capacitor.config.ts` (or `capacitor.config.json`), set `server.url` to your production URL, e.g. `https://getironfreight.com`, and optionally set `server.cleartext` for dev if needed.
- For a **driver-only** experience, you can set the app to open a specific path, e.g. `https://getironfreight.com/driver`, by configuring the start URL in the WebView or in the app’s initial route.

**Using a bundled build:**

```bash
npm run build
npx cap add android
npx cap add ios
```

Then set your build output directory in `capacitor.config.*` so that `webDir` points to your Next.js export (e.g. `out` if you use `output: 'export'`, or the built assets folder you copy to `www`).

### 3. Icons and splash

- Use your existing app icons (e.g. `public/icons/icon-192.png`, `icon-512.png`).
- Generate all required sizes (e.g. with [app-icon.co](https://app-icon.co) or Capacitor’s asset generator). Place them in the native projects (e.g. `android/app/src/main/res/`, iOS `App/App/Assets.xcassets/`).
- Add a splash screen for both platforms (required by stores).

### 4. Build and submit

**Android (Google Play):**

```bash
npx cap sync android
cd android && ./gradlew assembleRelease
```

- Sign the release APK/AAB (Google Play expects AAB). Use a keystore and set `signingConfigs` in `android/app/build.gradle`.
- Upload the AAB in [Google Play Console](https://play.google.com/console) → your app → Production (or internal testing).

**iOS (App Store):**

```bash
npx cap sync ios
```

- Open `ios/App/App.xcworkspace` in **Xcode** (on a Mac).
- Select your Apple Developer team, set bundle ID and version.
- Archive: **Product → Archive**, then **Distribute App** → App Store Connect.
- In [App Store Connect](https://appstoreconnect.apple.com), complete the listing (screenshots, description, privacy policy, etc.) and submit for review.

### 5. Driver-specific start URL

If you want the store app to open directly to the driver flow:

- **URL approach:** Set `server.url` (or the initial load URL in code) to `https://getironfreight.com/driver` so the app opens on the driver section.
- **Bundled approach:** If you bundle the web app, build it so the default route or redirect goes to `/driver`.

---

## Option 2: TWA for Google Play only (Android)

If you want a **minimal** Android app that is basically your PWA in a Chrome-based shell:

1. Use **PWABuilder** – [pwabuilder.com](https://www.pwabuilder.com) – enter your site URL (e.g. `https://getironfreight.com`).
2. Generate the Android project (TWA). Download the package.
3. Configure **Digital Asset Links** on your domain so the TWA can run in full-screen without the URL bar:
   - Host `/.well-known/assetlinks.json` on `https://getironfreight.com` with the fingerprint of the signing key used for the TWA. Google’s docs describe the exact format.
4. Build the signed AAB/APK and upload to Google Play Console.

**Limitation:** This only gives you an Android app. For the **Apple App Store** you still need a native wrapper (e.g. Capacitor) or a separate iOS project.

---

## Store listing checklist

Use this for both stores:

- [ ] **App name** – e.g. “IronFreight” or “IronFreight Driver”.
- [ ] **Short description** (Play) / **Subtitle** (App Store).
- [ ] **Full description** – what the app does, who it’s for (e.g. drivers, carriers, brokers).
- [ ] **Icons** – 192px and 512px (you have these); generate all required sizes for each platform.
- [ ] **Screenshots** – phone and tablet for both stores (required sizes in Play Console and App Store Connect).
- [ ] **Privacy policy URL** – e.g. `https://getironfreight.com/privacy`.
- [ ] **Category** – e.g. Business or Productivity.
- [ ] **Contact / support** – email (e.g. support@getironfreight.com).

---

## Apple App Store notes

- **Guideline 4.2** – Apple may reject apps that look like “repackaged websites” with no native value. Your app adds value (driver verification, load assignment, QR, etc.), so describe that clearly in the listing and in **App Review notes**: e.g. “Driver app for freight verification and load assignment; uses native WebView for secure, authenticated experience.”
- **Signing & provisioning** – Use Xcode with your Apple Developer account; create an App ID and provisioning profile for the app.
- **TestFlight** – Use TestFlight for beta testing before submitting to the store.

---

## Google Play notes

- **App signing** – Play Console can manage signing for you (recommended). You upload an upload key; Google signs the final AAB for distribution.
- **Content rating** – Complete the questionnaire in Play Console.
- **Data safety** – Declare what data you collect (e.g. email, location if used) and how it’s used.

---

## Summary

| Goal | Action |
|------|--------|
| **Both stores with one workflow** | Use **Capacitor** for iOS and Android. |
| **Driver-only app** | Point the app at `https://getironfreight.com/driver` or bundle with that as the start route. |
| **Android-only, minimal** | Use **PWABuilder** TWA for Android; use Capacitor (or similar) for iOS when you’re ready. |

If you tell me whether you prefer “live URL” (always load from getironfreight.com) or “bundled” (offline-capable), I can outline exact `capacitor.config.*` and build steps for your repo.
