# DiskWala GitHub Pages Website

A clean, mobile-first DiskWala-style static website.

## Important

This version is designed for GitHub Pages.

- No Flask
- No PHP
- No database required for the UI
- No cookies
- No localStorage
- No third-party JavaScript libraries
- No external CDN
- No tracking code
- No cookie banner
- Works as a static GitHub Pages site

## File preview

The Gallery button uses the browser's local file picker.

Images, videos and audio can be previewed locally.

Files are NOT uploaded to GitHub Pages.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload:
   - `index.html`
   - `assets/style.css`
   - `assets/script.js`
3. Open:
   Repository → Settings → Pages
4. Under "Build and deployment":
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
5. Save.

GitHub will provide the Pages URL.

## Real cloud storage

GitHub Pages is static hosting, so it cannot securely store user files.

For real cloud storage, login, permanent uploads, share links and video streaming, connect this frontend to a separate backend/storage service.

Do not put secret API keys in `script.js`.
