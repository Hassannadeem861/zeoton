# ZEOTON — Gaming Accessories Store (Pakistan)

**Live:** https://www.zeoton.online

Next.js 16 (App Router, JavaScript) · MongoDB Atlas + Mongoose · Redux Toolkit + RTK Query · Tailwind CSS 4 · Ant Design 6 (admin only) · GSAP · Three.js · Lenis · Cloudinary.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in values (never commit .env.local)
npm run seed                 # categories + first admin (safe to re-run)
npm run dev                  # http://localhost:3000
```

Admin panel: `/admin` — sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env.local`, then change the password under **My profile**.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint (Next.js core-web-vitals rules) |
| `npm run seed` | Idempotent seed: upserts categories by slug, creates the admin only if missing. Never deletes data or resets passwords. |
| `npm run seed:demo` | Adds the **demo catalog** for design review (9 demo categories, 36 demo products, 72 generated images on Cloudinary). Idempotent; never touches real data. |
| `npm run demo:remove` | Deletes all demo products (and their Cloudinary images) and demo categories. Real products, customers and orders are kept. |
| `npm run test:smoke` | End-to-end smoke test against a running server (see Testing) |
| `node scripts/brand-assets.mjs` | Regenerates logo variants, icons and the OG image from `public/brand/zeoton-logo-original.png` |

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | Atlas connection string. Use a different database name per environment (`zeoton`, `zeoton_staging`). |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL without trailing slash (canonical URLs, sitemap, Open Graph). |
| `SESSION_SECRET` | yes | 32+ random characters (`openssl rand -hex 32`). Changing it signs everyone out. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | for seeding | Password min. 12 characters. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | yes | Product image storage. |
| `CLOUDINARY_FOLDER` | no | Default `zeoton/products`. |

## Architecture (short)

```
src/
  app/(store)/      customer pages (Server Components by default, ISR for catalog)
  app/admin/        admin panel (Ant Design; server-side guard in (panel)/layout.js)
  app/api/          Route Handlers — all wrapped by server/http/route.js
  server/           server-only: db, models, services, auth, media, payments
  store/            Redux store, slices (cart, lists, ui), RTK Query APIs
  lib/validation/   Zod schemas shared by forms and the server
  components/ animations/ three/ providers/ config/
```

- **Data flow:** storefront pages read from `server/services` directly (no API round-trip, SEO-friendly HTML). Interactive client features and the admin use RTK Query → `/api/*`.
- **Redux:** slices hold only shopper-owned IDs/quantities (cart, wishlist, compare, recently viewed), persisted to localStorage. Prices and stock always come from the server.
- **Auth:** database sessions. Random token in an `HttpOnly; SameSite=Lax; Secure` cookie, HMAC stored in MongoDB (TTL-expired). `proxy.js` only does optimistic redirects; every protected page and API checks the session on the server.
- **Security:** Zod validation on every API input, same-origin check on mutating requests, MongoDB-backed rate limits (failed logins, registration, checkout, contact, tracking, uploads), bcrypt password hashing, security headers, generic login errors.
- **Orders:** created in a MongoDB transaction: server-side pricing, atomic stock reservation, coupon usage and order numbering. Cancelling restores stock; best sellers count only delivered units.
- **Payments:** COD only. `src/server/payments/index.js` is the provider registry for future gateways. An order must never be marked paid without server-side verification.
- **Shipping/returns:** not decided yet, so they are admin settings (**Settings & content**). While shipping is "not decided", checkout shows "to be confirmed" and the admin sets the fee per order.

## Demo catalog (client review)

- Data lives in `scripts/demo/catalog.mjs`; images are original vector illustrations (`scripts/demo/illustrations.mjs`) watermarked "DEMO IMAGE", passed through the normal WebP optimizer and uploaded to `zeoton/demo` on Cloudinary. Brands (Vantix, Kyrex, Nordbyte, Strato) are fictional.
- Every demo document has `isDemo: true`. The UI shows a **DEMO PRODUCT** badge on cards, search suggestions, cart, checkout and compare, plus a notice, "Demo price" and "(demo stock)" on product pages.
- SEO: demo product pages are `noindex` with no Product JSON-LD; demo products and demo categories are excluded from the sitemap; the home page, listings and categories are `noindex` while they show demo products (this lifts automatically once demo data is removed).
- Orders that contain demo products are flagged `isDemo`, tagged in admin and excluded from dashboard figures.
- Going live: run `npm run demo:remove`, then add real products in the admin panel.

## Product images

Admin uploads go to `POST /api/admin/uploads` → `server/media/optimizeImage.js`:

1. Validates type (JPG/PNG/WebP/AVIF/TIFF/GIF), size (≤ 4 MB input) and dimensions (300–6000 px).
2. Converts to WebP at the **original pixel dimensions** (never resized or upscaled; EXIF orientation applied, metadata stripped).
3. Binary-searches the highest quality (62–92) that fits **250 KB**.
4. If 250 KB is impossible without dropping below quality 62, nothing is uploaded and the admin sees a warning with the best achievable size; they can confirm "Upload anyway" (flagged as above target).
5. Only optimized images are uploaded to Cloudinary; URL, public ID, dimensions, format and bytes are stored in MongoDB (`media` collection + embedded in products). Removed images are deleted from Cloudinary on save.

## Testing

The smoke test creates its own products, orders and customers, so **run it against a separate test database**:

```bash
# 1. point a server at a test DB (database name zeoton_test) and seed it
MONGODB_URI="<uri with /zeoton_test>" npm run seed
npm run build
MONGODB_URI="<uri with /zeoton_test>" npx next start -p 3100
# 2. in another terminal
BASE_URL=http://localhost:3100 node --env-file=.env.local scripts/smoke-test.mjs
```

It covers pages and SEO tags, authentication and roles, CSRF/origin checks, product CRUD and validation, cart pricing, coupons, checkout and stock, order tracking and privacy, the admin order workflow, Cloudinary uploads, and rate limiting. Registration is limited to 5 per IP per hour, so run it on a fresh test database (or wait an hour between runs).

## Deployment (Vercel)

1. Push the repository to GitHub (make sure `.env.local` is not committed — it is in `.gitignore`).
2. Import the project in Vercel (framework: Next.js; build `npm run build`).
3. Environment variables in Vercel → Settings → Environment Variables:
   - **Preview (staging):** `MONGODB_URI` with database `zeoton_staging`, `NEXT_PUBLIC_SITE_URL` = the preview/staging URL, its own `SESSION_SECRET`, Cloudinary vars (optionally `CLOUDINARY_FOLDER=zeoton/staging`).
   - **Production:** `MONGODB_URI` with database `zeoton`, `NEXT_PUBLIC_SITE_URL=https://<your-domain>`, a different `SESSION_SECRET`, Cloudinary vars.
4. MongoDB Atlas → Network Access: Vercel uses dynamic IPs, so allow `0.0.0.0/0` and rely on a strong, database-scoped user password.
5. Seed each environment once from your machine: `MONGODB_URI=<env uri> npm run seed`.
6. Preview deployments are automatically `Disallow: /` in robots.txt; only production is indexable.
7. After the first production deploy: add the site to Google Search Console (paste the verification code in **Admin → Settings → SEO**) and submit `/sitemap.xml`.

> Vercel's Hobby (free) plan is limited to non-commercial use. Use it for staging; check Vercel's current terms and move production to a paid plan (or another host) before taking real orders.

## SEO notes

Keyword patterns come from Google autocomplete for Pakistan (checked 2 November 2026), e.g. "gaming mouse price in pakistan", "gaming keyboard price in pakistan", "gaming headset with mic", "mechanical keyboard under 5000 in pakistan", "gaming mouse price in pakistan under 2000". These shaped category titles ("… Price in Pakistan") and the budget price filters. No search volumes are claimed.

Not added on purpose: ratings/reviews schema (no genuine reviews yet), FAQ schema, local-business schema. Empty categories and the unpublished returns policy are `noindex` and left out of the sitemap until they have real content.
