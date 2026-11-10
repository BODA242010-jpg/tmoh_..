# Deployment to GitHub Pages

Target repository: https://github.com/BODA242010-jpg/tmoh9
Target public URL: https://boda242010-jpg.github.io/tmoh9/

1. Back up current repository and student data first.
2. Unzip `TMOH_V16_ALL_SITE_FILES.zip` locally.
3. On GitHub, open the `tmoh9` repository and upload **the files inside** the extracted archive to the `main` branch root. Approve overwriting duplicate file names.
4. Wait for GitHub Pages deployment. The existing `index.html` points to `tmoh-v16.css` and `tmoh-v16.js`; uploading only `index.html` will NOT work.
5. Refresh the site and open `#/home`. Existing data under `tmoh2` should remain on the same browser origin, but export a backup first.
6. Test ChatBook and the PWA on the live website. For persistent PWA updates, close/reopen the installed app after its service worker has updated. Never clear all site storage to force updates.

The external Cloudflare chatbot Worker and any optional cloud service are not deployed by this package. Repo write access through ChatGPT was denied (403) so the public page **has not yet been updated**.
