# Changelog

All notable changes to the StudentNest project. Dates use the maintenance-session timeline (started 2026-09-17). Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased / Working branch `branch-dev`]

## [RF1] — 2026-09 (maintenance & features; commit `RF1:project`)

### Added
- **Stripe payments (test mode)**:
  - `POST /api/listings/{id}/checkout` — Stripe Checkout Session, graceful 503 when not configured, blocks self-booking (422), validates date range vs listing availability.
  - `POST /api/stripe/webhook` — signature-verified; `checkout.session.completed` (paid) marks payment + reservation paid.
  - `payments` table, migrations `2026_09_17_000001..000008` additions (payments, ratings, messages, `is_paid`, `comments.parent_id`).
  - `GET /api/payments`, `GET /api/payments/earnings` for owner payout view.
  - SPA pages `/payment/success` + `/payment/cancel`.
- **Ratings**: `ratings` table, `GET/POST /api/listings/{id}/ratings`, one rating per user/listing (unique index + upsert), averages in UI.
- **Threaded comments**: `comments.parent_id` (self-FK, cascade), nested `replies` in `GET /api/listings/{id}/comments`, reply UI.
- **Messages**: `messages` table; conversations (`GET /api/messages`), thread + mark-read (`GET/POST /api/messages/{userId}`, `POST /api/messages`); `/Messages` SPA page with `?user=` deep link.
- **Help Center**: FAQ page + contact form that posts a message (receiver 1).
- **Dashboard**: `GET /api/dashboard-stats` (owner-relative totals incl. revenue from paid payments) + responsive Dashboard UI.
- **Account** page tabs: Personal info (multipart profile update), Login & security (password change with current-password check), Payments & reservations.
- **Navbar search**: single query input → `/?search=` → `Homme` filters by title + location with empty state.
- **Performance**: lazy images (`loading="lazy"`, `decoding="async"`) on homepage/detail/wishlist cards.
- **Documentation**: full README rewrite, `docs/*.md` (architecture, API, database, auth, payments, emails, frontend, backend, docker, security, testing, troubleshooting, development, interview notes, known limitations, roadmap), CHANGELOG.md.

### Changed
- Write endpoints now require `auth:sanctum` (previously open) — listings, comments, wishlist, reservations.
- Listing `store` sets `user_id` server-side from the authenticated user (previously null → FK crash).
- `images` cast as JSON array (`$casts` property — `casts()` unsupported in Laravel 10).
- Frontend centralized API base URL via `VITE_BACKEND_URL` (was hardcoded `localhost:8000` in 4+ files).
- Wishlist is server-backed (was localStorage-only); AddListing sends `profile_image` field name as the backend expects.
- CORS: custom wildcard middleware removed; `config/cors.php` restricts origins to `FRONTEND_URL`.
- Sanctum token TTL set to 7 days; login/register rate-limited (5/min per email+IP).
- Frontend rebuilt on vite 8.3.0 + react-router 7.18.4 + swiper 14; removed unused deps (zustand, mui pickers, fa-regular, tailwind plugins, @types/react, react-router-dom).
- Backend: phpunit 10.5.64 (CVE-2026-24765), guzzle 7.15.5.
- DB standard: PostgreSQL in `.env.example` / docker-compose / Render; SQLite override documented for local dev; tests force SQLite in-memory.
- Remove Render worker service (nothing queued); remove `Etudiant` feature + dead code (Routers.jsx, empty App.css, Student.jsx, MenuOfuser, supervisord.log).
- LBaaS: images lazily loaded; price formatting utility introduced.

### Fixed
- P0/P2: registration `store()` TypeError, null `user_id` on listings/comments, empty factories (seeders/tests crashed), `casts()` ignored, SQLite `dropForeign`, missing unique index on wishlist.
- P1: CORS wildcard, unauthenticated writes, infinite token TTL, hardcoded supervisor credentials, fake payment form collecting real card data.
- P4: completed reservations (columns/endpoints/accessor), wishlist REST, listing PUT/DELETE + `my-listings`, comment table migration rename, email-verification decision documented (not enforced).
- Frontend: broken prop-types/ESLint (22+ errors), `numberFavories` array check, `profile_image` field name, forgot-password links pointing at facebook.com, broken Tailwind class in Account.

### Removed
- `Etudiant` model/controller/factory/seeder/migration; `Wishlest*` stale references; empty Router/App.css/Student files; fake card-payment UI; `react-router-dom` (superseded by `react-router`); `supervisord.log` from tracking; mismatched worker in render.yaml.

### Security
- `npm audit`: 5 → **0 vulnerabilities**.
- `composer audit`: residual advisories tracked & accepted (Laravel 10 framework, Symfony/*, league/commonmark, psy/psysh) — full fix requires Laravel 12 upgrade (DEFERRED, see docs/SECURITY.md S4).

### Testing
- `php artisan test`: **53 passed / 140 assertions** (Breeze auth suite + custom API suite: Auth, Listing, Comment, Wishlist, Reservation).

### Notes / Known
- Payments remain **test-mode only** — set `STRIPE_*` sandbox keys + run `stripe listen --forward-to localhost:8000/api/stripe/webhook`; checkout 503s until configured with a clear message.
- No email/notification system, no frontend test runner, no queues/jobs — documented in docs/.

## [Prior to RF1] — initial scaffold (RF:project, update-9)

Original project as received: Laravel 10 + React SPA with listings breeze/factory seeders, unmaintained sections (Etudiant, Wishlest leftovers), broken/unrouted controllers, unauthenticated write APIs, fake payment form, and an outdated README claiming MySQL.