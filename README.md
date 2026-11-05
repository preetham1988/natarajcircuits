# Nataraj Circuits — Website

Static, dependency-free marketing site for Nataraj Circuits, a PCB manufacturer in Bengaluru that ships across India.

## Files
- `index.html` — single-page site (hero, services, instant quote, capabilities, process, shipping, FAQ, contact)
- `styles.css` — all styling (responsive, minimalist)
- `script.js` — mobile menu, instant-quote estimator, mailto-based quote/contact forms
- `assets/favicon.svg`, `robots.txt`, `sitemap.xml`

## Before going live
1. **Contact details** — set in the `CONTACT` object at the top of `script.js` (email, phone, WhatsApp) and in `index.html` (contact section, footer, WhatsApp button, JSON-LD).
2. **Pricing** — the quote estimator uses an indicative model in `PRICING` (`script.js`). Tune it to real rates.
3. **Capabilities** — check the specs table, lead times and shipping times in `index.html` against what the factory actually offers.
4. **Domain** — canonical URL, Open Graph URL, `robots.txt` and `sitemap.xml` assume `https://www.natarajcircuits.com/`.
5. Forms open the visitor's email app (`mailto:`). To receive submissions directly, point them at a form backend (Formspree, Netlify Forms, Google Apps Script, etc.).

## Run locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy
Any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages.
