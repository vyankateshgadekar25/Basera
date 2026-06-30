# Deploy Basera — ₹0 forever, no credit card asked anywhere

Every service below has a permanent free tier that **doesn't ask for a credit
card during signup** and doesn't expire. Pick one frontend host and one
backend host below; the rest of the stack is the same.

| Slot          | Recommended            | Alt                       | Card? | Free quota                                  |
|---|---|---|---|---|
| Frontend      | **Cloudflare Pages**   | Vercel · Netlify          | ❌    | **Unlimited bandwidth**                     |
| Backend       | **Koyeb**              | Render                    | ❌    | Koyeb: always-on 256 MB / Render: 750 hrs   |
| Postgres      | **Neon**               | Supabase                  | ❌    | 0.5 GB storage, permanent                   |
| Email (OTP)   | **Gmail SMTP**         | —                         | ❌    | 500 emails/day from your Gmail              |
| Code/CI       | **GitHub**             | —                         | ❌    | Unlimited public + private repos            |
| Keep-warm     | UptimeRobot (only if you use Render) | — | ❌ | 50 monitors, 5-min interval              |
| Image uploads (later) | Cloudflare R2 | ImageKit · Cloudinary    | ❌    | 10 GB / 25 credits — pick when needed       |

Total recurring cost: **₹0**. No card prompt at any step.

---

## 1. Push the code to GitHub (3 min)

```bash
cd basera
git init && git add . && git commit -m "Basera v1"
# create a new repo named "basera" on github.com, then:
git remote add origin https://github.com/<your-handle>/basera.git
git branch -M main && git push -u origin main
```

## 2. Database — Neon free Postgres (2 min)

1. Sign up at **https://console.neon.tech** (Google login works, no card).
2. Create project `basera`, region closest to your users (Mumbai / Singapore).
3. Copy the **pooled** connection string. Looks like:
   `postgresql://user:pwd@ep-xxx.pooler.ap-southeast-1.aws.neon.tech/basera?sslmode=require`
4. Apply the schema once from your laptop:
   ```bash
   cd server && cp .env.example .env
   # paste your Neon URL into DATABASE_URL=, then:
   npm install && npm run migrate
   ```
   You should see `✔ 001_schema.sql` and `✔ 002_landmark.sql`.

## 3. Gmail App Password for OTP (3 min)

1. Turn on 2-Step Verification: https://myaccount.google.com/security
2. Generate an App Password: https://myaccount.google.com/apppasswords
   (App: *Mail*, Device: *Other → Basera*)
3. Copy the 16-character password. Spaces are stripped automatically.

---

## 4. Backend — pick ONE

### 4A. Koyeb (recommended: always-on, never sleeps) — 5 min

1. Sign up at **https://app.koyeb.com** with GitHub (no card).
2. **Create App → GitHub** → choose your `basera` repo, branch `main`.
3. Koyeb picks up `koyeb.yaml` automatically. In the **Environment** step,
   create these as **Secrets** (left sidebar → *Secrets*) and reference them
   in the deploy form:
   - `database-url` → Neon URL from step 2
   - `gmail-user` → `you@gmail.com`
   - `gmail-app-password` → 16-char App Password
   - `jwt-secret` → run `openssl rand -base64 48` on your laptop, paste here
   - `public-app-url` → fill in step 5 (leave empty for now)
4. Click **Deploy**. First build takes ~3 min.
5. You get a URL like `https://basera-api-yourname.koyeb.app`. **Save it.**

> Koyeb's free instance is **always-on** — no cold starts, no keep-warm trick.

### 4B. Render (backup: 750 hrs/mo, sleeps after 15 min idle) — 5 min

1. Sign up at **https://dashboard.render.com** with GitHub (no card).
2. **New + → Blueprint** → pick your repo. Render reads `render.yaml`.
3. Paste the same secrets as 4A.
4. Click **Apply**. URL looks like `https://basera-api.onrender.com`.
5. **Important:** also do step 6 below to keep it warm.

---

## 5. Frontend — pick ONE

### 5A. Cloudflare Pages (recommended: unlimited bandwidth) — 5 min

1. Sign up at **https://dash.cloudflare.com** (no card).
2. **Workers & Pages → Create → Pages → Connect to Git → pick `basera`.**
3. Build settings:
   - **Framework preset**: *Vite*
   - **Build command**: `cd client && yarn install --frozen-lockfile && yarn build`
   - **Build output directory**: `client/dist`
   - **Root directory**: leave blank
4. Add **environment variable**:
   - `VITE_API_BASE_URL` = your backend URL from step 4
5. **Save and Deploy**. ~90 s later you get `https://basera.pages.dev`.

SPA routing works via the `_redirects` file already in `client/public/`.

### 5B. Vercel (backup) — 3 min

1. Sign up at **https://vercel.com** with GitHub (no card).
2. **Add New → Project → import `basera`**. Vercel reads `vercel.json`.
3. Add env var `VITE_API_BASE_URL` = backend URL.
4. **Deploy**. URL: `https://basera.vercel.app`.

### 5C. Netlify (also good) — 3 min

1. Sign up at **https://app.netlify.com** with GitHub (no card).
2. **Add new site → Import existing project → pick `basera`**.
3. Build command: `cd client && yarn install --frozen-lockfile && yarn build`
4. Publish directory: `client/dist`
5. Env var: `VITE_API_BASE_URL` = backend URL.

---

## 6. (Render only) Keep-warm for free — 2 min

Skip this if you picked Koyeb in step 4A.

1. Sign up at **https://uptimerobot.com** (no card).
2. **Add New Monitor**:
   - Type: *HTTP(s)*
   - URL: `https://basera-api.onrender.com/health`
   - Interval: *5 minutes*
3. Save. Your Render dyno will never sleep again.

The `/health` route deliberately doesn't touch Postgres, so this ping doesn't
chew Neon's compute hours.

---

## 7. Tell the API where the frontend lives (1 min)

Go to your backend host (Koyeb / Render) → **Environment** → set:

```
PUBLIC_APP_URL=https://basera.pages.dev      # or your Vercel / Netlify URL
```

Redeploy. Two things use this:
- CORS — the API now refuses requests from origins other than your frontend.
- The OTP email's "Open Basera" CTA points to the right place.

---

## Day-1 checklist before telling real users

- [ ] Visit your frontend URL — hero loads, the search button works.
- [ ] Sign in with your real Gmail — you actually receive the OTP email.
- [ ] Switch to **Property Owner**, add a property, click **Use my location**.
- [ ] Open the public property page — embedded map points to the right spot,
      **Open in Google Maps** opens the correct location.
- [ ] Sign out → sign back in → still see your property.
- [ ] (Render only) UptimeRobot dashboard shows the API as "Up".

You're live. ₹0 / month, no card on file anywhere.

---

## When you eventually outgrow free

You probably won't for months. When you do:

| What broke | Cheapest paid step |
|---|---|
| Email > 500/day | Resend free tier (100/day) + paid plan from $20/mo for 50k/mo. Or buy a domain (~₹700/yr) and use a custom-domain sender. |
| Neon storage > 0.5 GB | Neon Launch tier ~$19/mo (3 GB + always-on compute). |
| Koyeb / Render needs more juice | Koyeb Pro $9/mo, Render Starter $7/mo. |
| Cloudflare BW (you got viral) | Still free; CF Pages has no realistic BW ceiling for hobby use. |
| Custom domain | Pay only the registrar (~₹700/yr at Cloudflare/Namecheap). |

You owe nothing until your product proves it deserves the bill. Go ship.
