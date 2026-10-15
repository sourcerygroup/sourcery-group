# Sourcery Group website

Static one-page site for Sourcery Group, a technology consultancy and app studio. Plain HTML, CSS and JavaScript, no build step, ready for GitHub Pages.

## Files

- `index.html` — the page
- `assets/style.css` — styles
- `assets/main.js` — draws the animated sigil and sends the inquiry form
- `favicon.svg` — browser tab icon
- `.nojekyll` — tells GitHub Pages to serve the files as-is

The sigil is generated in code. Its outer ring spells "SOURCERY GROUP" in binary (long tick = 1, dot = 0).

## Turn on the contact form

GitHub Pages can't run server code, so the form posts to [Web3Forms](https://web3forms.com), a free form-to-email service (250 submissions a month on the free plan).

1. Go to https://web3forms.com, enter the email address that should receive inquiries, and get your access key.
2. In `index.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` with that key.
3. Commit and push. Submissions arrive in that inbox.

The access key is meant to sit in public HTML; it only lets people send mail to the address you registered. A hidden honeypot field filters basic bots, and Web3Forms runs its own spam check.

## Publish on GitHub Pages

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then in the repo on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**. The site appears at `https://<you>.github.io/<repo>/` within a minute or two.

### Custom domain (optional)

In **Settings → Pages → Custom domain**, enter e.g. `sourcerygroup.com`, then at your DNS provider add a `CNAME` record for `www` pointing to `<you>.github.io` (and the four GitHub `A` records for the apex domain, listed in GitHub's Pages docs). Tick **Enforce HTTPS** once it's available.
