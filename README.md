# Zariya · Donor Module — Design Preview (Vite + React)

Interactive preview of the Zariya donor module, built from the **Donor Module
Master Data Workbook** (illustrative sample data — no backend).

Sections: **Dashboard** (funding chain, clickable pop-ups) · **Donor Register**
(consolidated master data) · **Grant Agreements** (terms, funding position,
tranche gates).

Live rules demonstrated: onboarding-completeness gate, donor-draft grant
blocking, fund-class movement behaviour (ⓘ pop-ups), tranche release gates
(≥75% / ≥60% prior-tranche utilisation, Management/Audit UC).

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploy on Netlify

Connect this branch (`donor-module-preview`) as a Netlify site — `netlify.toml`
already sets `npm run build` / `dist`. Or build locally and drag `dist/` onto
https://app.netlify.com/drop.
