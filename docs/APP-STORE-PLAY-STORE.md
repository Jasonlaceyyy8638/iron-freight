# Publishing IronFreight to App Store & Google Play

This guide covers how to get **IronFreight** onto the **Apple App Store** and **Google Play**. The app serves **drivers** (loads, IronGate QR) and **shippers** (Gate – scan driver QR at the dock), plus brokers and carriers. Both stores require a **native wrapper** around your existing web app (Next.js).

---

## One app for drivers and shippers (role-based)

You do **not** need separate “Driver app” and “Shipper app” listings. Use **one app** that shows the right experience after sign-in:

| Role    | What they see in the app |
|--------|---------------------------|
| **Driver**  | `/driver` – assigned loads, IronGate QR to show at the dock |
| **Shipper** | Dashboard with **Gate** tab – enter load number, scan driver’s QR with camera |
| **Broker**  | Dashboard – Load Board, My Loads, Fleet (no Gate tab) |
| **Carrier** | Dashboard – My Loads, Fleet, driver assignment |

**Flow:** User opens the app → lands on your site (e.g. home or login). They sign in. Your app already redirects by role: drivers go to `/driver`, everyone else to `/dashboard`. Shippers and brokers see the **Gate** tab; shippers use it to scan the driver’s QR. One codebase, one app listing, one update process.

If you ever want separate store listings (e.g. “IronFreight Driver” and “IronFreight Gate”), you can build two Capacitor apps pointing at different start URLs (`/driver` vs `/dashboard/gate`); for most cases, one app is simpler.

---

## Preparation checklist

Use this to get ready before submitting:

- [ ] **Store accounts** – Apple Developer ($99/year), Google Play Developer ($25 one-time).
- [ ] **Native wrapper** – Use **Capacitor** for both iOS and Android (recommended).
- [ ] **App entry** – Decide: open at **root/login** (role-based after sign-in) or a specific path (e.g. `/driver` only).
- [ ] **Icons & splash** – Use `public/icons/icon-192.png` and `icon-512.png`; generate all required sizes per platform; add splash screen.
- [ ] **Privacy policy** – Host at e.g. `https://yoursite.com/privacy` and use that URL in both stores.
- [ ] **Screenshots** – Phone (and tablet if needed) for both stores; show driver and/or Gate flow so reviewers see the value.
- [ ] **Description** – Mention drivers (loads, QR at dock) and shippers (scan QR at gate); clarifies it’s one app for the freight verification workflow.

---

## Overview

| Store        | Best approach | Notes |
|-------------|----------------|--------|
| **Google Play** | Capacitor or TWA | TWA = minimal Chrome shell; Capacitor = same as iOS, one workflow. |
| **Apple App Store** | Capacitor | Apple does not accept “website-only” apps; you need a native shell. |

**Recommended:** Use **Capacitor** for **both** stores so you have one workflow, one codebase, and consistent behavior on iOS and Android.

---

## Prerequisites

1. **Apple Developer Program** – [developer.apple.com](https://developer.apple.com) – **$99/year** (required for App Store).
2. **Google Play Developer** – [play.google.com/console](https://play.google.com/console) – **$25 one-time** (required for Play Store).
3. **App assets** – Icons (e.g. `public/icons/icon-192.png`, `icon-512.png`), splash screen, screenshots for each device size, privacy policy URL, short and full description.

---

## Option 1: Capacitor (recommended for both stores)

Capacitor wraps your existing web app in a native iOS/Android shell. You keep using your Next.js app; Capacitor adds native projects and builds the store packages.

### 1. Install and configure Capacitor

From the **project root** (where `package.json` is):

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "IronFreight" "com.getironfreight.app"
```

- **App name:** IronFreight.
- **App ID:** e.g. `com.getironfreight.app` (or `com.getironfreight.driver` if you later do a driver-only variant).

### 2. Point Capacitor at your web app

Capacitor needs either a **live URL** or the **built** output of your site.

**Using a live URL (simplest):**

- In `capacitor.config.ts` (or `capacitor.config.json`), set `server.url` to your production URL, e.g. `https://getironfreight.com`.
- The app will load your site in a WebView. Users open the app → see your site (e.g. login or home) → sign in → get redirected by role (driver → `/driver`, shipper/broker/carrier → `/dashboard`). No need to bundle the Next.js build.

**Using a bundled build (offline-capable):**

```bash
npm run build
npx cap add android
npx cap add ios
```

Set `webDir` in `capacitor.config.*` to your Next.js export (e.g. `out` if you use `output: 'export'`, or a folder you copy built assets into). Then the app can work offline.

### 3. Icons and splash

- Use your existing app icons (`public/icons/icon-192.png`, `icon-512.png`).
- Generate all required sizes (e.g. [app-icon.co](https://app-icon.co) or Capacitor’s asset generator). Place them in the native projects (e.g. `android/app/src/main/res/`, iOS `App/App/Assets.xcassets/`).
- Add a splash screen for both platforms (required by stores).

### 4. Build and submit

**Android (Google Play):**

```bash
npx cap sync android
cd android && ./gradlew assembleRelease
```

- Sign the release AAB (Google Play expects AAB). Use a keystore and set `signingConfigs` in `android/app/build.gradle`.
- Upload the AAB in [Google Play Console](https://play.google.com/console) → your app → Production (or internal testing).

**iOS (App Store):**

```bash
npx cap sync ios
```

- Open `ios/App/App.xcworkspace` in **Xcode** (on a Mac).
- Select your Apple Developer team, set bundle ID and version.
- **Product → Archive**, then **Distribute App** → App Store Connect.
- In [App Store Connect](https://appstoreconnect.apple.com), complete the listing (screenshots, description, privacy policy, etc.) and submit for review.

### 5. Optional: open directly at a specific path

If you want the app to open at a specific path (e.g. `/driver` or `/login`):

- **Live URL:** Set the initial load URL to e.g. `https://getironfreight.com/driver` or `https://getironfreight.com/login` in your Capacitor config or in the native app’s start URL.
- **Bundled:** Configure your app’s default route or redirect so it lands on that path.

For a **single role-based app**, opening at **root** or **/login** is usually best so drivers and shippers both sign in and then see the correct screen.

---

## Option 2: TWA for Google Play only (Android)

If you want a **minimal** Android app that is basically your PWA in a Chrome-based shell:

1. Use **PWABuilder** – [pwabuilder.com](https://www.pwabuilder.com) – enter your site URL (e.g. `https://getironfreight.com`).
2. Generate the Android project (TWA). Download the package.
3. Configure **Digital Asset Links** on your domain: host `/.well-known/assetlinks.json` with the fingerprint of the signing key. Google’s docs describe the format.
4. Build the signed AAB/APK and upload to Google Play Console.

**Limitation:** This only gives you an Android app. For the **Apple App Store** you still need a native wrapper (e.g. Capacitor).

---

## Store listing checklist

Use this for both stores:

- [ ] **App name** – e.g. “IronFreight”.
- [ ] **Short description** (Play) / **Subtitle** (App Store).
- [ ] **Full description** – what the app does: drivers view loads and show IronGate QR at the dock; shippers scan the driver’s QR at the gate; brokers and carriers manage loads and fleet. One app for the whole verification workflow.
- [ ] **Icons** – 192px and 512px (you have these); generate all required sizes for each platform.
- [ ] **Screenshots** – phone and tablet as required (Play Console and App Store Connect).
- [ ] **Privacy policy URL** – e.g. `https://getironfreight.com/privacy`.
- [ ] **Category** – e.g. Business or Productivity.
- [ ] **Contact / support** – email (e.g. support@getironfreight.com).

---

## Apple App Store notes

- **Guideline 4.2** – Apple may reject apps that look like “repackaged websites” with no native value. Your app adds value (driver verification, load assignment, QR at dock, shipper gate scanning), so describe that clearly in the listing and in **App Review notes**: e.g. “Freight verification app for drivers and shippers: drivers view assigned loads and show a secure QR at the dock; shippers scan the driver’s QR at the gate to verify identity. Uses a native WebView for the authenticated experience.”
- **Signing & provisioning** – Use Xcode with your Apple Developer account; create an App ID and provisioning profile.
- **TestFlight** – Use TestFlight for beta testing before submitting.

---

## Google Play notes

- **App signing** – Play Console can manage signing for you (recommended). You upload an upload key; Google signs the final AAB.
- **Content rating** – Complete the questionnaire in Play Console.
- **Data safety** – Declare what data you collect (e.g. email, location if used) and how it’s used.

---

## Summary

| Goal | Action |
|------|--------|
| **One app for drivers and shippers** | Use one Capacitor app; open at root/login; role after sign-in decides driver vs dashboard (Gate for shippers). |
| **Both stores, one workflow** | Use **Capacitor** for iOS and Android. |
| **Driver-only or Gate-only listing** | Optional: build a second app pointing at `/driver` or `/dashboard/gate` if you want separate store listings. |
| **Android-only, minimal** | Use **PWABuilder** TWA for Android; use Capacitor for iOS when ready. |

If you prefer “live URL” (always load from your domain) or “bundled” (offline-capable), I can outline exact `capacitor.config.*` and build steps for your repo.
