# Basera — PG & Hostel Management Platform

A complete full-stack web application for Indian PG and hostel owners to manage
properties, tenants, billing, and payments — with a startup-grade motion system,
a warm, distinctive identity, and a **zero-rupee deploy path on Render + Vercel
+ Neon + Gmail** (no credit card required anywhere — see [`DEPLOY.md`](./DEPLOY.md)).

> **What's new**
> - Brand-new design system: warm teal accent (`#1ea97c`), cream + ink surfaces,
>   no more generic indigo / "AI-default" purple.
> - Display font: **Fraunces** · UI font: **Plus Jakarta Sans**.
> - Full motion system per spec (see _Motion & Animation_ below) — restrained,
>   `transform`/`opacity` only, with `prefers-reduced-motion` fallback.
> - **Gmail OTP auth** (Nodemailer + Gmail App Password — free 500/day).
> - **Owner location**: lat/lng + landmark, "Use my location" geolocation
>   button, paste-a-Google-Maps-link auto-extract, OpenStreetMap preview, and
>   public "Open in Google Maps" link on every listing.
> - **Deploy artifacts**: `render.yaml`, `vercel.json`, multi-stage `Dockerfile`,
>   migration runner, and a step-by-step `DEPLOY.md` that costs ₹0/month.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | Email OTP + JWT |

## Quick Start

### 1. Database
```bash
createdb basera
psql -U postgres -d basera -f server/migrations/001_schema.sql
```

### 2. Backend
```bash
cd server
cp .env.example .env   # set DB_* and JWT_SECRET (≥ 32 chars)
npm install
npm run dev            # → http://localhost:4000
```

### 3. Frontend
```bash
cd client
npm install            # or: yarn
npm run dev            # → http://localhost:3000  (proxies /api → :4000)
```

Open `http://localhost:3000`.

## Motion & Animation — quick reference

| Use case | Duration | Easing |
|---|---|---|
| Hover / press feedback (buttons, inputs, links) | 120–180 ms | `ease-out` |
| Card hover (lift + image zoom)                   | 200–250 ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Content fade/slide-in (cards, empty state)       | 250–350 ms | `ease-out` |
| Filter swap (fade out → skeleton → fade in)      | 150 / 200 ms | `ease-in-out` |
| Ambient loops (shimmer, icon float)              | 1.5 – 3 s  | linear / `ease-in-out` |

All motion is `transform` + `opacity` only — no layout thrash on cards. A global
`prefers-reduced-motion` block collapses all transitions to ~0 ms.

## Features

### Owner Dashboard
- Add/manage properties, rooms, beds
- Check-in/check-out tenants
- Auto-generate monthly bills
- Review payment proofs with fraud flags
- Reply to ratings

### Renter Dashboard
- Search properties by city, gender, vacancy, rating
- View current stay details
- Pay bills with UTR + proof submission
- Rate properties after checkout (verified stays only)

### Security
- No passwords — Phone OTP only
- Role-based access control
- Payment flags: amount mismatch, duplicate UTR, duplicate screenshot hash
- Owner always confirms payments — no auto-approval
- Cannot delete properties with active tenants

## Production Checklist
- [ ] Add file upload for payment screenshots (S3 / R2)
- [ ] Cron for auto bill generation (1st of month)
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS, connection pooling, logging, input sanitization
