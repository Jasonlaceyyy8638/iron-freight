# IronFreight Desktop

Desktop app that wraps the IronFreight web app in a native window. Users get a real installer (Windows .exe, macOS .dmg) and can choose the installation directory.

## Prerequisites

- Node.js 18+
- For Windows build: run on Windows or use a Windows VM/CI
- For macOS build: run on macOS (required for signing and notarization if you add them later)

## Setup

```bash
cd desktop
npm install
```

## Run locally

Starts the Electron window loading the production site (or set `IRONFREIGHT_APP_URL` to your dev URL):

```bash
npm start
```

To point at local Next.js:

```bash
# Terminal 1: from project root
npm run dev

# Terminal 2: from desktop/
set IRONFREIGHT_APP_URL=http://localhost:3000
npm start
```

## Build installers

- **Windows (NSIS)** – user can choose installation directory in the wizard:
  ```bash
  npm run dist:win
  ```
  Output: `dist/IronFreight Setup 1.0.0.exe` (or similar).

  **If you see “Cannot create symbolic link”:** Windows needs permission to create symlinks. Do one of the following, then run `npm run dist:win` again:
  1. **Run as Administrator:** Right‑click PowerShell or Terminal → “Run as administrator”, then `cd desktop` and `npm run dist:win`.
  2. **Or enable Developer Mode:** Settings → Privacy & security → For developers → turn **Developer Mode** on. Then run `npm run dist:win` in a normal (non‑admin) terminal.

- **macOS (DMG)**:
  ```bash
  npm run dist:mac
  ```
  Output: `dist/IronFreight-1.0.0.dmg`.

- **Linux (AppImage)** (optional):
  ```bash
  npm run dist:linux
  ```

## Hosting the installers

1. Build the installers as above.
2. Upload the `.exe` and `.dmg` to a CDN or use [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository): create a release, attach the files, and copy the download URLs.
3. In your app env (e.g. `.env.production`), set:
   - `NEXT_PUBLIC_DOWNLOAD_WIN_URL=https://...` (direct link to the Windows installer)
   - `NEXT_PUBLIC_DOWNLOAD_MAC_URL=https://...` (direct link to the macOS DMG)
4. The site’s [Download page](/download) will then show working “Download for Windows” and “Download for macOS” buttons.

## Optional: Windows icon (shield logo)

The Windows installer expects an **.ico** file; using a PNG causes “Invalid icon file” and the build fails. To use the IronFreight shield logo:

1. Convert `public/icons/icon-192.png` to ICO (e.g. [convertio.co/png-ico](https://convertio.co/png-ico/) or similar). Save as `public/icons/icon-192.ico`.
2. In `desktop/package.json`, under `build.win` add `"icon": "../public/icons/icon-192.ico"`, and under `build.nsis` add `"installerIcon": "../public/icons/icon-192.ico"` and `"uninstallerIcon": "../public/icons/icon-192.ico"`.
3. Rebuild with `npm run dist:win`.

Until then, the build uses the default Electron icon so the installer still completes.
