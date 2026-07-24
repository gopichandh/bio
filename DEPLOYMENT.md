# Deploy & Domain Guide — Vilas Mankala Portfolio

This portfolio is a **Vite + React + TypeScript** app. Below are the exact steps to publish
it **for free**, connect a **custom domain**, and pick the best **domain name**.

---

## ✅ Before you deploy

1. Replace the placeholder résumé with your real PDF:
   overwrite [`public/Vilas_Mankala_Resume.pdf`](public/Vilas_Mankala_Resume.pdf).
2. (Optional) Update your real GitHub username in
   [`src/components/Contact.tsx`](src/components/Contact.tsx) and
   [`src/components/SocialIcons.tsx`](src/components/SocialIcons.tsx)
   (currently `github.com/vilasmankala`).
3. Verify the build passes:
   ```bash
   npm install
   npm run build
   ```

---

## 🚀 Option 1 — Vercel (recommended, free, auto CI/CD)

### A. Push to GitHub
```bash
cd /Users/vilasmankala/Notes/github/3d-portfolio
git init
git add .
git commit -m "Vilas Mankala portfolio"

# Create the repo (needs the GitHub CLI: brew install gh && gh auth login)
gh repo create vilas-portfolio --public --source=. --remote=origin --push

# ...or manually create an empty repo on github.com then:
# git remote add origin https://github.com/<you>/vilas-portfolio.git
# git branch -M main
# git push -u origin main
```

### B. Deploy
Easiest (dashboard): go to https://vercel.com → **Add New… → Project** →
import `vilas-portfolio`. Vercel auto-detects Vite. Build command `npm run build`,
output dir `dist`. Click **Deploy**.

Or via CLI:
```bash
npm i -g vercel
vercel          # first run: link/create project (accept defaults)
vercel --prod   # production deploy
```
You'll get a free URL like `https://vilas-portfolio.vercel.app` with automatic HTTPS.
Every future `git push` to `main` auto-redeploys.

---

## 🚀 Option 2 — Netlify (free)
```bash
npm i -g netlify-cli
netlify deploy --build            # preview URL
netlify deploy --build --prod     # production → *.netlify.app
```
Or drag the `dist/` folder onto https://app.netlify.com/drop.

## 🚀 Option 3 — Cloudflare Pages / GitHub Pages (free)
- **Cloudflare Pages**: connect the GitHub repo, framework preset "Vite",
  build `npm run build`, output `dist`.
- **GitHub Pages**: `npm i -D gh-pages`, add `"deploy": "gh-pages -d dist"` to
  scripts, set `base: '/vilas-portfolio/'` in [`vite.config.ts`](vite.config.ts),
  then `npm run build && npm run deploy`.

---

## 🌐 Buy a custom domain (cheapest → easiest)

| Registrar | Notes |
|-----------|-------|
| **Cloudflare Registrar** | At-cost pricing (cheapest), free WHOIS privacy. Best value. |
| **Porkbun** | Cheap `.dev`/`.io`, free WHOIS privacy. |
| **Namecheap** | Frequent promos, easy UI. |
| GoDaddy | Widely known, usually pricier. |

**Truly-free alternatives:**
- Keep the free `*.vercel.app` / `*.netlify.app` subdomain (no cost, HTTPS included).
- **GitHub Student Developer Pack** → free `.me` (Namecheap) and free `.tech` domain for 1 year.

### Connect the domain to Vercel
1. Vercel → your project → **Settings → Domains → Add** → enter `vilasmankala.dev`.
2. At your registrar's DNS, add the records Vercel shows, typically:
   - Apex `vilasmankala.dev` → **A** record `76.76.21.21`
   - `www` → **CNAME** `cname.vercel-dns.com`
   - (Or just switch nameservers to Vercel/Cloudflare for auto-config.)
3. Wait for DNS to propagate; Vercel provisions **free SSL** automatically.
4. Update the URLs in [`index.html`](index.html), [`public/robots.txt`](public/robots.txt),
   and [`public/sitemap.xml`](public/sitemap.xml) to your final domain.

---

## 💡 Domain name suggestions

**Technical / professional (top picks ⭐):**
- `vilasmankala.dev` ⭐ — clean personal brand, `.dev` forces HTTPS, developer-signaling
- `vilasmankala.cloud` ⭐ — perfectly on-brand for a Cloud/SRE architect
- `mankala.io`
- `vilasops.dev` / `vilasops.io`
- `sre.vilasmankala.com` (subdomain option if you buy the .com)

**Viral / catchy / brandable:**
- `99point9.dev` ⭐ — nod to the "nines" of reliability / SLAs
- `zerodowntime.dev`
- `keepitreliable.dev`
- `vmbuzz.dev` — extends your existing `vmbuzz.com` brand
- `alwaysonvilas.dev`

**Top 3 overall:** `vilasmankala.dev` · `vilasmankala.cloud` · `99point9.dev`
