# Step-by-step: Host the desktop installers (.exe and .dmg)

Use one of these methods to host your installers so the **Download** page can link to them.

---

## Option A: GitHub Releases (recommended, free)

### 1. Build the installers on your machine

**Windows (.exe)** — run on a Windows PC or VM:

```bash
cd desktop
npm install
npm run dist:win
```

- Output: `desktop/dist/IronFreight Setup 1.0.0.exe` (exact name may vary).
- **If the build fails with “Cannot create symbolic link”:** Run your terminal **as Administrator** (right‑click → Run as administrator), or enable **Developer Mode** in Windows (Settings → Privacy & security → For developers), then run `npm run dist:win` again.

**macOS (.dmg)** — run on a Mac:

```bash
cd desktop
npm install
npm run dist:mac
```

- Output: `desktop/dist/IronFreight-1.0.0.dmg`.

### 2. Create a GitHub release and upload the files

1. Open your repo on GitHub (e.g. `https://github.com/your-username/iron-freight`).
2. Click **Releases** → **Create a new release**.
3. **Choose a tag:** e.g. `v1.0.0` (create the tag if it doesn’t exist).
4. **Release title:** e.g. `IronFreight 1.0.0`.
5. **Description:** optional (e.g. “Desktop installers for Windows and macOS”).
6. **Attach binaries:** drag and drop:
   - `IronFreight Setup 1.0.0.exe` (Windows)
   - `IronFreight-1.0.0.dmg` (macOS)
7. Click **Publish release**.

### 3. Get the download URLs

After publishing, each file has a direct download URL:

- **Windows:**  
  `https://github.com/YOUR_USERNAME/iron-freight/releases/download/v1.0.0/IronFreight%20Setup%201.0.0.exe`  
  (Replace `YOUR_USERNAME`, `iron-freight`, `v1.0.0`, and the filename if yours is different. Use the exact filename GitHub shows; spaces become `%20`.)

- **macOS:**  
  `https://github.com/YOUR_USERNAME/iron-freight/releases/download/v1.0.0/IronFreight-1.0.0.dmg`

To copy: on the release page, right‑click each file → **Copy link address**.

### 4. Put the URLs in your app

**If using Netlify (or similar):**

1. Netlify Dashboard → your site → **Site configuration** → **Environment variables**.
2. Add:
   - **Key:** `NEXT_PUBLIC_DOWNLOAD_WIN_URL`  
     **Value:** `https://github.com/YOUR_USERNAME/iron-freight/releases/download/v1.0.0/IronFreight%20Setup%201.0.0.exe`
   - **Key:** `NEXT_PUBLIC_DOWNLOAD_MAC_URL`  
     **Value:** `https://github.com/YOUR_USERNAME/iron-freight/releases/download/v1.0.0/IronFreight-1.0.0.dmg`
3. **Save** and **Trigger deploy** (or push a commit) so the new env vars are used.

**If using a local `.env.production` or server env:**

Create or edit `.env.production` in the **project root** (same folder as `package.json`):

```env
NEXT_PUBLIC_DOWNLOAD_WIN_URL=https://github.com/YOUR_USERNAME/iron-freight/releases/download/v1.0.0/IronFreight%20Setup%201.0.0.exe
NEXT_PUBLIC_DOWNLOAD_MAC_URL=https://github.com/YOUR_USERNAME/iron-freight/releases/download/v1.0.0/IronFreight-1.0.0.dmg
```

Replace `YOUR_USERNAME`, `iron-freight`, `v1.0.0`, and the filenames to match your release.

### 5. Verify

- Open your site’s **Download** page (e.g. `https://yoursite.com/download`).
- Click **Download for Windows** and **Download for macOS**; the correct installer files should download.

---

## Option B: Netlify (or your own server) — host files in the project

If you don’t want to use GitHub Releases, you can put the installers in the repo and let Netlify serve them.

### 1. Build the installers

Same as Option A step 1 — produce the `.exe` and `.dmg`.

### 2. Put them in a folder that gets deployed

Example: put the built installers in `public/downloads/` so they are served at `/downloads/...`:

- From project root:
  - `public/downloads/IronFreight-Setup-1.0.0.exe`
  - `public/downloads/IronFreight-1.0.0.dmg`

(You can copy from `desktop/dist/` into `public/downloads/` after each build. Do **not** commit huge binaries to git if your repo is small; use GitHub Releases or a CDN instead.)

### 3. Set the env vars to your own domain

**Netlify env:**

- `NEXT_PUBLIC_DOWNLOAD_WIN_URL` = `https://your-site.netlify.app/downloads/IronFreight-Setup-1.0.0.exe`
- `NEXT_PUBLIC_DOWNLOAD_MAC_URL` = `https://your-site.netlify.app/downloads/IronFreight-1.0.0.dmg`

**Or in `.env.production`:**

```env
NEXT_PUBLIC_DOWNLOAD_WIN_URL=https://your-site.netlify.app/downloads/IronFreight-Setup-1.0.0.exe
NEXT_PUBLIC_DOWNLOAD_MAC_URL=https://your-site.netlify.app/downloads/IronFreight-1.0.0.dmg
```

Note: Netlify has size limits for the deploy; large installers (e.g. 100MB+) are better on GitHub Releases or a CDN.

---

## Summary checklist

| Step | What you do |
|------|-------------|
| 1 | Build `.exe` (on Windows) and `.dmg` (on Mac) with `npm run dist:win` and `npm run dist:mac` in `desktop/`. |
| 2 | Upload both files to **GitHub Releases** (or to `public/downloads/` if you prefer). |
| 3 | Copy the **direct download URL** for each file. |
| 4 | Add `NEXT_PUBLIC_DOWNLOAD_WIN_URL` and `NEXT_PUBLIC_DOWNLOAD_MAC_URL` in **Netlify env** (or `.env.production`), with those URLs as values. |
| 5 | Redeploy the site and test the **Download** page. |

After this, the Download page will offer working **Download for Windows** and **Download for macOS** buttons.
