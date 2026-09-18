# Interview Notes

Quick talking points about the project — aimed at explaining **what**, **why**, and **how** in an interview setting. All facts below are true of the current codebase.

## 1. One-line Pitch

"StudentNest is a full-stack student housing marketplace: a Laravel 10 REST API + a React/Vite SPA where owners publish listings and students search, rate, chat, and book — payments via Stripe Checkout."

## 2. Tech Choices & Why

- **Laravel + Sanctum**: token-based API auth out of the box, strong validation + Eloquent ORM, mature ecosystem.
- **React + Vite**: fast dev server (HMR), simple SPA router (react-router v7), rejected heavier meta-frameworks to keep the API/SPA split clean.
- **Redux Toolkit**: global auth + wishlist state with server-backed thunks.
- **Tailwind**: utility CSS for rapid, consistent UI.
- **Stripe Checkout** (hosted): removes PCI scope — card data never touches our server.
- **SQLite local / PostgreSQL prod**: zero-friction local DX (no DB server needed), PostgreSQL alignment via Docker Compose + Render for the deployed footprint.

## 3. What I Actually Did on This Project (maintenance pass)

- **Diagnosed a broken codebase**: found 47 issues (P0–P9 severity model) from a full audit — crashes in listings/comments/registration/factories, unauthenticated write endpoints, CORS misconfig, infinite tokens, and dead code.
- **Fixed critical paths end-to-end**: made all write APIs authenticated, completed reservations + wishlist + listing CRUD + server-side filtering, fixed factories/seeders so the whole test suite could run.
- **Hardened security**: removed wildcard CORS, set token TTL, added rate limiting, removed a fake "payment" form that accepted real card data, upgraded vulnerable deps (`npm audit` to 0).
- **Shipped real features**: Stripe payments (checkout + signature-verified webhook + payments/earnings), threaded comments, ratings with upsert, messages/conversations, dashboard stats, account management, Help Center, payment success/cancel pages, navbar search.
- **Documented everything**: README + docs/ (architecture, API, DB, auth, payments, emails, frontend, backend, docker, security, testing, troubleshooting, dev guide, known limitations, roadmap), CHANGELOG.md, and a MAINTENANCE_PROGRESS.md audit log.

## 4. Key Endpoints I Can Talk About

- `POST /api/listings/{id}/checkout` — validates dates, rejects self-booking, creates pending reservation+payment, returns Stripe Checkout URL.
- `POST /api/stripe/webhook` — signature-verified; on `checkout.session.completed` (paid) flips payment + reservation to paid.
- `GET /api/dashboard-stats` — owner-relative aggregates (listings, reservations, revenue from paid payments, unread messages).
- `GET /api/messages`, `GET /api/messages/{userId}`, `POST /api/messages` — conversation threads with unread counts, marked-read on open.

## 5. Security Decisions to Mention

- CORS narrowed to `FRONTEND_URL`; tokens 7-day expiry; login/register rate-limited 5/min per email+IP.
- Webhooks signature-verified with `STRIPE_WEBHOOK_SECRET`; card data never touches our server (Stripe Checkout).
- `.env` gitignored; no secrets in repo; `composer audit` / `npm audit` tracked.
- Doc'd trade-off: Laravel stays on 10.49 (known advisories) until a 10→12 migration is budgeted; email verification unenforced (no SMTP).

## 6. Honest Limitations to Own

- Payments are **test mode only** until sandbox keys + `stripe listen` are set; checkout degrades to a clear 503 otherwise.
- UI price labels use **MAD**; Stripe checkout charges **USD** — a known currency mismatch to unify.
- **No email/notifications** exist yet (booking/payment confirmations don't reach users by mail).
- **No frontend tests** (only lint/build); the Stripe webhook path is verified manually, not yet covered by PHPUnit.
- Help Center "support" is a hard-coded message receiver (id 1), not a configurable inbox.

## 7. Architecture in 30 Seconds

SPA (`react-router` + Redux) → axios with Bearer Sanctum token → Laravel API (`routes/api.php`, `auth:sanctum` group) → Eloquent (SQLite local / Postgres prod) → Stripe (Checkout + webhook). SPA routes split: public pages + `<ProtectedRoute>`-wrapped owner/account pages.

## 8. Demo Script in 3 Steps

1. Login owner `mohamedallaoui@gmail.com` → Dashboard shows live stats; manage listings.
2. Logout → login `student2@test.com` → open a listing, rate/comment, add to wishlist, pick dates → checkout with Stripe test card `4242 4242 4242 4242` → success page.
3. Swap back to owner → Messages shows the conversation; Dashboard shows paid reservation revenue once webhook fires.

## 9. Projects Page Bullets (short form for a CV)

- Built a Laravel 10 + React/Vite student-housing platform with listings, wishlist, reservations, threaded comments, ratings, messaging, dashboard stats, account management, and Stripe Checkout payments (test mode).
- Ran a P0–P9 audit + fix pass: restored auth on write endpoints, fixed CORS + token expiry + rate limiting, completed unfinished reservations/wishlist/CRUD, removed dead code, added a 53-test API suite.
- Delivered complete technical documentation: architecture, API reference, database schema, security review, and roadmap.
- Result: `npm audit` 0 vulnerabilities, build/lint clean, PHPUnit 53 passed / 140 assertions.

## 10. Questions to Ask (reverse interview)

- "Where is this heading — one-off demo or production? That decides Laravel 12 migration priority."
- "Is email/SMTP budgeted? It unlocks verification + booking receipts."
- "Should pricing be unified on MAD or Migrated to USD/€?"
- "Who operates reservations (owner confirms, auto-accept)?"