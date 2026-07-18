# KlubOS Hosting Plan

This document compares **Vercel** and **Render** for hosting KlubOS, and describes the Astro scaffold added to this repo.

## Current project state

| Layer | Status |
|-------|--------|
| Frontend | Static HTML prototype (12 pages) + new Astro scaffold |
| Styling | Shared design system in `css/style.css` |
| Auth | Mock login (`admin` / `admin`) in `js/app.js` |
| Backend | Supabase planned (commented out in `js/app.js`) |
| Build | Astro 5 static output → `dist/` |

KlubOS is a **German-language SaaS** for sports clubs (Mitglieder, Finanzen, Sponsoren, Platzplanung). The near-term hosting need is a **static marketing site + authenticated app shell**. Longer term you'll add Supabase auth, possibly API routes, and cron jobs.

---

## Recommended architecture

```
┌─────────────────────────────────────────────────────────┐
│  CDN / Edge (Vercel or Render static)                   │
│  ├── /              Astro landing (marketing)           │
│  ├── /login         Auth pages                          │
│  ├── /app/*         Dashboard shell (client-side app)   │
│  └── /legacy/*      Original HTML prototype (transitional)│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase (external, EU region)                         │
│  Auth · Postgres · Storage · Edge Functions             │
└─────────────────────────────────────────────────────────┘
```

**Key decision:** Keep Supabase external on both platforms. Neither Vercel nor Render replaces a proper database for multi-tenant club data.

---

## Vercel vs Render — tradeoffs

### Summary table

| Criteria | Vercel | Render |
|----------|--------|--------|
| **Best fit for KlubOS today** | ✅ Strong | ✅ Good |
| **Static / Astro hosting** | Excellent (native Astro support) | Good (static site service) |
| **Global CDN / latency (DE users)** | Edge network, fast cold delivery | CDN included; fewer edge POPs than Vercel |
| **Preview deployments** | Per-PR previews, instant | PR previews on paid plans |
| **Free tier** | Generous for hobby (100 GB bandwidth) | Static sites free; bandwidth limits apply |
| **SSR / API routes later** | `@astrojs/vercel` adapter (serverless/edge) | Node web service or `@astrojs/node` |
| **Long-running processes** | ❌ Not supported (10s–60s function limits) | ✅ Web services, background workers |
| **Cron / scheduled jobs** | Vercel Cron (Pro) | Native cron jobs on services |
| **Managed Postgres** | ❌ Use Supabase/Neon | ✅ Render Postgres (alternative to Supabase) |
| **Docker / custom runtime** | Limited | ✅ Full Docker support |
| **EU / DSGVO posture** | US company; EU regions on Pro | US company; can pick EU region for services |
| **DX (developer experience)** | Best-in-class CLI, analytics, speed insights | Simpler dashboard, fewer frontend niceties |
| **Vendor lock-in** | Medium (edge-specific features) | Low (closer to standard Docker/Node) |
| **Cost at scale** | Can get expensive with serverless invocations | Predictable per-service pricing |

---

### Vercel — when it wins

**Choose Vercel if:**

- You want the **fastest path** from Astro repo to production
- Marketing pages and app shell stay **mostly static** with Supabase handling auth/data client-side
- You value **preview URLs on every PR**, instant rollbacks, and tight Git integration
- You may later use **Astro server islands** or edge middleware for auth gating
- Team is frontend-heavy and wants minimal ops

**Vercel limitations for KlubOS:**

- No always-on background workers (e.g. nightly Beitrags-Reminder emails) without external service
- Function timeouts cap long operations (PDF generation, bulk imports)
- Deeper backend logic eventually needs Supabase Edge Functions or a separate API host

**Deploy steps:**

```bash
npm install
npm run build
# Connect repo at vercel.com → framework: Astro
# Or: npx vercel
```

Config: `vercel.json` (included).

---

### Render — when it wins

**Choose Render if:**

- You expect to add a **Node API**, webhooks, or **background workers** on the same platform
- You want **predictable monthly pricing** for always-on services
- You might host **Render Postgres** instead of (or alongside) Supabase
- You prefer **Docker** for reproducible deploys
- You need **cron jobs** without a separate scheduler

**Render limitations for KlubOS:**

- Static site CDN is good but **less edge-optimized** than Vercel for global traffic
- PR previews require a paid plan
- Astro DX is fine but not as polished as Vercel's first-party integration
- Free static sites **spin down** (not an issue for static, but matters if you add a web service)

**Deploy steps:**

```bash
npm install
npm run build
# Connect repo at render.com → New Static Site
# Or use Blueprint: render.yaml (included)
```

Config: `render.yaml` (included).

---

## Recommendation for KlubOS

### Phase 1 (now): **Vercel** for the Astro static site

Reasons:

1. KlubOS is currently **100% static** — Vercel's sweet spot
2. Astro has an official Vercel adapter for a future upgrade path
3. Preview deploys speed up design review of the landing page
4. Supabase stays external either way

### Phase 2 (auth + data): Stay on Vercel, add Supabase EU

- Enable Supabase Auth in `js/app.js`
- Use `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`)
- Protect `/app/*` with client-side session checks (later: Astro middleware + SSR)

### Phase 3 (background jobs): **Render** for workers OR Supabase Edge Functions

If you need:

- Nightly Mitgliedsbeitrag reminders
- Sponsor report PDF generation
- Webhook receivers (Stripe, bank imports)

…add a **Render background worker** or **web service** while keeping the frontend on Vercel, *or* migrate the full stack to Render if you prefer one vendor.

---

## Astro scaffold (added)

```
KlubOS/
├── src/
│   ├── components/     LandingHeader, LandingFooter
│   ├── layouts/        BaseLayout, AppLayout
│   └── pages/
│       ├── index.astro          → /
│       ├── login.astro          → /login
│       ├── signup.astro         → /signup
│       └── app/dashboard.astro  → /app/dashboard
├── public/             Synced at build from css/, js/, *.html
├── astro.config.mjs
├── package.json
├── vercel.json
└── render.yaml
```

### Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npm run preview    # serve production build locally
```

`npm run sync:assets` copies `css/`, `js/`, logo, and legacy HTML into `public/` before dev/build.

### Migration path from HTML prototype

1. **Done:** Astro shell with shared CSS/JS and layouts
2. **Next:** Port `index.html` sections into Astro components
3. **Then:** Move app pages (`dashboard`, `mitglieder`, …) into `src/pages/app/`
4. **Finally:** Remove `public/legacy/` once parity is reached

---

## Security checklist before production

- [ ] Replace mock `admin/admin` auth with Supabase
- [ ] Set `PUBLIC_SITE_URL` for auth redirect URLs
- [ ] Enable Supabase Row Level Security per Verein (tenant)
- [ ] Add CSP headers once third-party scripts are finalized
- [ ] Use custom domain with HTTPS (both platforms provide free TLS)
- [ ] Review DSGVO: Supabase EU region, Datenschutz page, cookie consent if tracking added

---

## Quick decision guide

```
Need only static marketing + app shell now?
  └─ Yes → Vercel (faster, better previews)

Need background jobs or own API within 6 months?
  └─ Yes → Render (or Vercel frontend + Render worker)

Want one vendor for frontend + Postgres + cron?
  └─ Yes → Render

Want best Astro DX and edge performance?
  └─ Yes → Vercel
```
