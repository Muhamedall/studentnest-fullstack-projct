# StudentNest — Student Housing Rental Platform

> Full-stack web application for renting student accommodation. Laravel REST API backend + React SPA frontend.

**Documentation is the source of truth for this project.** Start here, then follow the links:

| Doc | Purpose |
|-----|---------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System overview, data flow, module map |
| [`docs/API.md`](docs/API.md) | Complete REST endpoint reference |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Schema, relationships, per-environment DB choices, migration notes |
| [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) | Sanctum tokens, login/logout, profiles, password change |
| [`docs/PAYMENTS.md`](docs/PAYMENTS.md) | Stripe Checkout test-mode flow and how to run it |
| [`docs/EMAILS.md`](docs/EMAILS.md) | Email/notification status (currently none implemented) |
| [`docs/FRONTEND.md`](docs/FRONTEND.md) | React structure, routes, state, build/lint |
| [`docs/BACKEND.md`](docs/BACKEND.md) | Laravel layout, controllers, models, middleware |
| [`docs/DOCKER.md`](docs/DOCKER.md) | Docker Compose, Dockerfile, production image |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Applied hardening + known/remaining risks |
| [`docs/TESTING.md`](docs/TESTING.md) | Test suite layout and how to run it |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Common setup/run problems |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Working on the code: conventions, git, process |
| [`docs/INTERVIEW_NOTES.md`](docs/INTERVIEW_NOTES.md) | Project talking points for interviewers |
| [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md) | Known gaps and product decisions |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Next steps and suggested order |
| [`CHANGELOG.md`](CHANGELOG.md) | Versioned change log |

Companion tracking files: [`MAINTENANCE_PROGRESS.md`](MAINTENANCE_PROGRESS.md) (audit/fix log with severity legend) and [`TODO_REMAINING.md`](TODO_REMAINING.md) (open decisions requiring product/external input).

---

## 1. Project Overview & Purpose

StudentNest connects university students with student housing. Students who live far from their campus can search, compare, and book accommodations offered by owners/institutions near their place of study.

Built as a full-stack project for educational/demo purposes, it includes:

- **Public browsing** — homepage with searchable, filterable listing cards and detail pages.
- **Owner flow** — create/edit/delete listings, view reservations, see payments/earnings.
- **Student flow** — wishlist, real bookings via Stripe Checkout (test mode), comments and ratings on listings, in-app messaging with the owner, account management.
- **Dashboard** — live stats for the logged-in owner.
- **Help Center** — FAQ page plus a contact form that creates a direct message.

## 2. Tech Stack

| Layer | Technology | Version (verified) |
|-------|-----------|---------------------|
| Backend | PHP / Laravel | PHP 8.3.30 (needs ^8.1), Laravel 10.49.1 |
| API auth | Laravel Sanctum | ^3.3 (3.3.3) |
| Payments | stripe/stripe-php | ^21.3 (21.3.2) |
| HTTP client | guzzlehttp/guzzle | ^7.2 (7.15) |
| DB (prod sample) | PostgreSQL 15 | via docker-compose / Render |
| DB (local dev/test) | SQLite | file `database/database.sqlite` |
| Frontend | React + Vite | React 18.2.0, Vite 8.3.0 |
| Routing | react-router | 7.18.4 |
| State | Redux Toolkit / react-redux | 2.2.3 / 9.1.0 |
| HTTP | axios | ^1.6.8 (1.20.0) |
| Styling | Tailwind CSS | 3.4.3 |
| UI extras | swiper, react-datepicker, react-icons, FontAwesome | 14.2.0, 6.7.0, 5.2.1, 6.5.2 |
| Utilities | date-fns, ESLint, eslint-plugin-react | 3.6.0, 8.57.0, 7.34.1 |
| Backend tests | PHPUnit (Laravel) | ^10.1 (10.5.64) |

## 3. Services, Folders & Ports

```
studentnest-fullstack-projct/
├── backend-laravel/     Laravel REST API   -> http://localhost:8000
│   ├── app/             controllers, models, middleware, providers
│   ├── config/          configuration (cors, sanctum, services, ...)
│   ├── database/        migrations, seeders, factories, database.sqlite
│   ├── routes/api.php   ALL API routes
│   ├── tests/           PHPUnit feature tests
│   ├── Dockerfile       prod image (nginx + php-fpm)
│   ├── docker-compose.yml
│   ├── render.yaml      Render deployment
│   └── .env.example     env template (PostgreSQL profile)
└── frontend-react/      React SPA          -> http://localhost:3000
    ├── src/
    │   ├── api/api.js           axios client + token interceptor
    │   ├── components/          pages & Redux slices
    │   ├── components/Redux/    users / navbar / wishlist slices
    │   └── utils/formatPrice.js price formatting
    ├── index.html
    ├── vite.config.js
    └── package.json
```

- Backend: `php artisan serve` → **port 8000**.
- Frontend: `npm run dev` → **port 3000** (Vite auto-switches to 3001 if 3000 is busy).

## 4. How the Two Services Communicate

- Frontend calls the backend exclusively over **REST JSON** via axios (`src/api/api.js`).
- Base URL: `import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"`.
- Auth: `Authorization: Bearer <token>` (Sanctum). The interceptor attaches the token from localStorage.
- Image URLs: `STORAGE_URL = backend base + "/storage/"` — built from `VITE_BACKEND_URL`.
- CORS: config/cors.php restricts `Access-Control-Allow-Origin` to `FRONTEND_URL` and only opens `api/*` + `sanctum/csrf-cookie`.
- The frontend is an SPA with its **own** login/signup pages; it does not use Laravel's session-based Breeze UI.

## 5. Demo Users & Seeded Data

`php artisan db:seed` (via `DatabaseSeeder`) creates **11 users**. The canonical demo accounts:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Owner / demo | `mohamedallaoui@gmail.com` | `123456789` | id 11; owns all seeded listings |
| Test student | `student2@test.com` | `123456789` | id 13; used to test bookings so it can reserve others' listings |

> Owner and student are **different seed users** — that is what lets a logged-in owner book/rate/comment on the demo listings.

## 6. Run Locally — Backend

Prerequisites: PHP ^8.1 (tested 8.3), Composer 2.x.

```bash
cd backend-laravel
composer install
cp .env.example .env            # Windows: copy .env.example .env
php artisan key:generate
```

**Database — two supported choices** (see section 20/21 and `docs/DATABASE.md`):

- Quick local dev (no server): SQLite.

  ```bash
  # .env:
  DB_CONNECTION=sqlite
  DB_DATABASE=database/database.sqlite
  touch database/database.sqlite   # ensure the file exists
  ```

- Full parity: PostgreSQL (docker-compose or your own server, `.env.example` defaults).

Then:

```bash
php artisan migrate --seed
php artisan storage:link          # images in storage/app/public -> public/storage
php artisan serve
# API now at http://localhost:8000  (health: GET http://localhost:8000/api/healthz)
```

## 7. Run Locally — Frontend

```bash
cd frontend-react
npm install
npm run dev
# http://localhost:3000
```

Optional: copy `.env.example`-style `VITE_BACKEND_URL` if your backend is not on `localhost:8000`.

## 8. Structure & Key Entry Points

Backend entry points:

- `routes/api.php` — every route (auth-protected group + public group + Stripe webhook + healthz).
- `app/Http/Controllers/` — `UserController`, `ListingController`, `CommentController`, `RatingController`, `WishlistController`, `ReservationController`, `PaymentController`, `MessageController`, `DashboardController`.
- `config/services.php` — Stripe key/secret/webhook + success/cancel URLs.

Frontend entry points:

- `src/main.jsx` → `src/App.jsx` (routes, `<BrowserRouter>`, `<Navbar>`, `ProtectedRoute`).
- `src/api/api.js` → axios client, token interceptor, `STORAGE_URL`.
- `src/components/Redux/store/store.js` → Redux store (`usersSlice`, `navbarSlice`, `wishlestSlice`).

Key pages: `Homme.jsx` (home), `DetailesListing.jsx`, `Wishlest.jsx`, `Account.jsx`, `Dashboard.jsx`, `ManageListings.jsx`, `AddListing.jsx`, `EditListing.jsx`, `Messages.jsx`, `HelpCenter.jsx`, `PaymentSuccess.jsx`, `PaymentCancel.jsx`, `Login.jsx`, `Singup.jsx`.

## 9. Build the Frontend

```bash
cd frontend-react
npm run build        # outputs dist/
npm run preview      # serve the production build locally
npm run lint         # ESLint (0 warnings allowed)
```

The build emits a warning about a > 500 kB chunk (React/FontAwesome bundle) — cosmetic, not an error.

## 10. Run Tests

Backend only (the frontend has **no test runner configured**):

```bash
cd backend-laravel
php artisan test
```

Current status: **53 passed, 140 assertions, ~17s** (PHPUnit 10.5.64, SQLite in-memory via `phpunit.xml`). Details: [`docs/TESTING.md`](docs/TESTING.md).

## 11. Environment Variables

Backend (`backend-laravel/.env`) — see `.env.example`:

| Variable | Purpose | Local default |
|----------|---------|---------------|
| `APP_KEY` | Laravel app key (required) | generated |
| `DB_CONNECTION` / `DB_*` | database | `sqlite` (local) / `pgsql` (example, compose, Render) |
| `FRONTEND_URL` | CORS origin + Stripe redirect base | `http://localhost:3000` |
| `STRIPE_KEY` | Stripe publishable key (test mode) | empty → checkout returns 503 |
| `STRIPE_SECRET` | Stripe secret API key (test mode) | empty → checkout returns 503 |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | empty → webhook 503 |
| `SESSION_SECURE_COOKIE` / `SESSION_DOMAIN` | session hardening | `false` / `null` |

Frontend (`frontend-react/.env`, optional):

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_BACKEND_URL` | API base URL + storage URL | `http://localhost:8000` |

> Stripe variables are intentionally empty. See [`docs/PAYMENTS.md`](docs/PAYMENTS.md) — payments run in **test mode** with the Stripe CLI.

## 12. Conventions

- **Git flow** — all maintenance work lives on `branch-dev`; `master` tracks released/summary state. Verify with `git status` before and after work.
- **Backend style** — Laravel Pint (`vendor/bin/pint`) on changed files.
- **Frontend style** — ESLint profile in `.eslintrc.cjs` (prop-types checked, no unused vars, no unused eslint-disable directives). `npm run lint` must stay at 0 warnings.
- **API shape** — JSON responses; errors as `{ "message": ... }` with proper HTTP codes; API routes only in `routes/api.php`.
- **Secrets** — never commit real credentials; `.env` is gitignored; Stripe keys stay placeholder/empty.
- **Type rigor** — Eloquent models use `$casts` (the `casts()` method is **not supported** in Laravel 10.49) and `$fillable`.
- **Testing** — every backend feature area gets a `tests/Feature/Api/*Test.php`; keep `php artisan test` green.

## 13. Issue Tracker Reference

The full audit → fix log lives in [`MAINTENANCE_PROGRESS.md`](MAINTENANCE_PROGRESS.md) (severity P0–P9, status OPEN/FIXED/VERIFIED/DEFERRED). Highlights by phase:

| Phase | Scope |
|-------|-------|
| 1 | Initial audit (47 issues logged, most opened) |
| 2 | P0/P2 critical fixes + API test suite |
| 3 | P1 security (CORS, token expiry, rate limiting, deps) |
| 4 | Frontend/backend wiring (wishlist, reservations, guards) |
| 5 | Dead-code & quality cleanup |
| 6 | Dependency upgrades (vite 8, react-router 7, phpunit; npm audit 0) |
| 7 | Deploy config reconciliation (Postgres everywhere, Render) |
| 8 | Payments (Stripe), messages, ratings, dashboard stats, account, navbar search, payment pages |

## 14. TODO / Open Decisions

See [`TODO_REMAINING.md`](TODO_REMAINING.md). Remaining open items need **product decisions or real external credentials**:

1. Email verification enforcement (needs SMTP — item 1).
2. Real email sending (SMTP) — item 3.
3. Reservations business rules / confirmation flow — item 6.
4. Object storage for images (S3/CDN) — item 9.
5. (Settled during maintenance) SQLite for local, PostgreSQL for prod; Etudiant removed; facebook links removed; navbar search wired.

## 15. Security Checklist

Applied (see [`docs/SECURITY.md`](docs/SECURITY.md)):

- CORS restricted to `FRONTEND_URL` (was `*`) — **P1 fixed**.
- All write endpoints require `auth:sanctum` — **P1 fixed**.
- Sanctum token expiry 7 days (was infinite) — **P1 fixed**.
- Login/register rate limiting (5/min per email+IP) — **P1 added**.
- Hardcoded supervisor credentials removed — **P1 fixed**.
- Fake payment form collecting real card data removed — **P1 fixed**.
- `npm audit`: **0 vulnerabilities**; `composer audit` residual items tracked as accepted risk.
- Stripe webhook verifies signatures; card data never touches our servers (Stripe Checkout).

Known/remaining risks: Laravel stays on 10.49.1 (documented CRLF-in-email-rule + signed-URL advisories require a 10→12 upgrade — DEFERRED); no CSRF concern for token-based API; session cookies unused by SPA.

## 16. Next Steps

1. Set Stripe sandbox keys + stripe CLI webhook → verify a full paid booking (see `docs/PAYMENTS.md`).
2. Review PAYEMENTS success/cancel pages & HelpCenter receiver id.
3. Choose image storage backend (`docs/ROADMAP.md`).
4. Decide reservation confirmation & email flows.
5. Full stack: Laravel 10→12 when budget allows.

Full prioritized list: [`docs/ROADMAP.md`](docs/ROADMAP.md).

## 17. System Diagram

```
┌─────────────────────────────┐
│  Browser (React SPA :3000)  │
│  Homme / DetailesListing /  │
│  Dashboard / Messages /     │
│  Account / Admin listing    │
│  └── Redux store (slices)   │
└──────────────┬──────────────┘
               │ axios  Bearer <token>
               │ http://localhost:8000/api/*
               ▼
┌──────────────────────────────┐
│  Laravel API (:8000)         │
│  routes/api.php              │
│  auth:sanctum middleware     │
│  CORS (FRONTEND_URL)         │
│  Controllers → Eloquent      │
└──────────────┬───────────────┘
               │
        ┌──────┴────────┐
        ▼               ▼
┌──────────────┐   ┌─────────────────┐
│ SQLite (local)│   │ PostgreSQL 15    │
│ (prod sample) │   │ (compose/Render) │
└──────────────┘   └─────────────────┘
        ▲
        │ Stripe Checkout (test mode)
        │ browser <-> stripe.com <-> webhook
   Webhook POST /api/stripe/webhook (signature-verified)
```

## 18. Run in Production (Render)

- `backend-laravel/render.yaml` declares a web service (`studentnest-web`) + managed PostgreSQL (`studentnest-db`).
- `dockerfilePath: Dockerfile`, build handled by Docker (`composer install --no-dev`).
- Env: `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` auto-generated, DB env wired to the managed Postgres from `render.yaml`.
- Required manual additions for payments: `FRONTEND_URL`, `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `MAIL_*` (none currently used), storage bucket for images (currently local `/public` disk).

## 19. Run with Docker Compose

```bash
cd backend-laravel
docker compose up --build
# app  -> http://localhost:8080  (port 80 inside container)
# postgres:15 -> localhost:5432 (DB laravel, user laravel, pass secret)
```

The compose `app` service volumes the repo into `/var/www/html`; `db` is `postgres:15` with a named volume. Env overrides DB_* to the compose Postgres.

## 20. Run Locally Without Docker

```bash
# 1 terminal — backend (SQLite, no external services)
cd backend-laravel
php artisan migrate --seed
php artisan storage:link
php artisan serve          # :8000

# 2 terminal — frontend
cd frontend-react
npm install
npm run dev                # :3000

# optional 3 terminal — Stripe webhook relay for payments
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

This is the default developer workflow (see sections 6/7).

## 21. Database Choices Per Environment

| Environment | Driver | Config source |
|-------------|--------|---------------|
| Local dev & tests | SQLite (`database/database.sqlite`, in-memory for tests) | `.env` + `phpunit.xml` |
| Docker Compose | PostgreSQL 15 | `docker-compose.yml` env |
| `.env.example` template | PostgreSQL (`studentnest`, user `postgres`) | `.env.example` |
| Render production | Render-managed PostgreSQL | `render.yaml` |

SQLite was chosen for local dev because no MySQL/Postgres server was available during the maintenance pass; it is a **reversible override** documented in `.env.example`. (Legacy README claimed MySQL — that is no longer accurate.)

## 22. Maintenance History

The maintenance pass (Phases 1–8, 2026-09-17) is logged in detail in [`MAINTENANCE_PROGRESS.md`](MAINTENANCE_PROGRESS.md). A condensed versioned summary is in [`CHANGELOG.md`](CHANGELOG.md).

- Phase 2 fixed every P0/P2 crash (listings, comments, registration, factories, wishlist, reservations) and added the 5-file API test suite.
- Phase 3 hardened security (CORS, tokens, rate limit, credentials, deps).
- Phase 4 wired the frontend to the real backend (wishlist/reservations are server-backed, route guards added).
- Phase 5 removed dead code (`Etudiant`, empty files, duplicates).
- Phase 6 upgraded risky dependencies; `npm audit` = 0.
- Phase 7 standardized DB on PostgreSQL everywhere except local SQLite, removed the unused Render worker.
- Phase 8 added Stripe payments, messaging, ratings, dashboard stats, account management, Help Center, and navbar search; final `git` commit `RF1:project` (7ada6bb).

## 23. Graph (Module Dependencies)

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full diagram; summary:

- `Payment → Reservation → Listing → User` (payments keyed by reservation/listing).
- `Message → User, Listing` (messages reference sender/receiver/listing).
- `Rating | Comment | Wishlist → Listing, User` (polymorphic-ish star relations with composite uniqueness).
- `Dashboard` aggregates over all of the above for the owner.

## 24. Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payments test-mode only (keys empty) | Checkout return 503 until keys set | Clear 503 message; Stripe CLI documented; no prod keys stored |
| USD vs MAD display mismatch | Checkout charges USD, UI shows MAD | Documented; roadmap item to unify currency |
| Laravel 10.49.1 advisories (CRLF email rule, signed URL) | Low for demo scope (no email enforcement/signed routes used) | Tracked DEFERRED (needs 10→12 upgrade) |
| No email/notifications | Users never get booking/payment confirmations | Documented; roadmap item |
| Local disk image storage | Lost on re-deploy | Roadmap: S3/CDN |
| Frontend has no automated tests | Regressions possible | Lint clean + manual smoke; roadmap item |

## 25. Vulnerabilities & Hardening Plan

Current: `npm audit` → 0. `composer audit` → residual advisories (Symfony/*, league/commonmark, psy/psysh, Laravel 10 framework) all classified as accepted risk for a demo (details in `MAINTENANCE_PROGRESS.md` Phase 3/6). The single largest hardening step remaining is **Laravel 10 → 12** (clears GHSA-crmm-hgp2-wgrp + CVE-2026-48019 and unlocks current framework). See `docs/SECURITY.md` S1–S7.

## 26. Completed vs. Remaining vs. Notes

**Completed (Phase 8/2026):** Stripe checkout + webhook + payments/earnings endpoints; ratings (unique per user/listing); threaded comments (parent_id); dashboard stats; account profile/password/payments pages; messages conversations; Help Center; payment success/cancel SPA pages; navbar search (title+location via `?search=`).

**Remaining:** live Stripe keys; help-center receiver configurability; currency unification; reservation confirmation/refund flows; email notifications; image object storage; Laravel 10→12; frontend tests.

**Notes:**
- Demo student `student2@test.com` exists specifically to let you test the "book someone else's listing" path.
- Always keep `master` ≠ working branch; do the work on `branch-dev`.
- Bonus files: `docs/INTERVIEW_NOTES.md` (talking points) and `docs/TROUBLESHOOTING.md` (FAQ).