# Security

Status summary: all **P1** security findings were fixed (Phases 3 & 7); dependency posture is `npm audit` → **0 vulnerabilities**, `composer audit` → residual tracked items (accepted risk for demo). Full severity/issue ledger lives in `MAINTENANCE_PROGRESS.md`.

## 1. Applied Hardening (Fixed)

| # | Severity | Finding | Fix |
|---|----------|---------|-----|
| 7 | P1 | Custom `CorsMiddleware` stamped `Access-Control-Allow-Origin: *` globally **+** credentials | Removed custom middleware; `config/cors.php` → `paths=['api/*','sanctum/csrf-cookie']`, `allowed_origins=[FRONTEND_URL]` via Laravel `HandleCors` |
| 8 | P1 | Write endpoints (listings, comments) were unauthenticated | Route group now `auth:sanctum` for all mutating endpoints |
| 9 | P1 | Sanctum tokens never expired | `config/sanctum.php` `expiration => 10080` (7 days) |
| 10 | P1 | Hardcoded supervisor credentials `admin/admin123` | Removed username/password from unix socket block in `docker/supervisord.conf` |
| 28 | P1 | Fake payment form collected real card data (logged to console) | Removed entirely; reservations now use Stripe Checkout (card data never touches our server) |
| 12/40 | P3/P3 | DB drift (mysql vs pgsql) & worker referencing missing `Dockerfile.worker` | Standardised PostgreSQL + removed Render worker (no queued jobs exist) |
| 34 | P6 | Tests could hit production DB | `phpunit.xml` now uses SQLite in-memory |

Plus: **rate limiting** on login/register (5/min per email+IP via `throttle:auth`), `JSX` no-target-blank re-enabled, `.env`/`supervisord.log` gitignored, `react-router`/`vite`/`phpunit` upgraded to clear CVEs.

## 2. Current Posture

- **Auth**: Bearer token (Sanctum), 7-day TTL, validated per request; brute-force-limited at the two public credential endpoints.
- **Payment**: Stripe Checkout (hosted), webhook signature-verified (`Webhook::constructEvent`), card numbers never touch backend code.
- **Data**: password hashed (bcrypt via `$casts['hashed']`); `profile_image` uploads validated (image, ≤2MB, jpeg/png/jpg/gif) and stored under public disk; `listing images` cast as JSON array.
- **Validation**: Laravel validation on every controller entry point; ownership checks on update/delete listing (403 non-owner); no mass-assignment (all models `$fillable` only allow intended fields).
- **Dependencies**: `npm audit` → 0; `composer audit` residual items explicitly documented (below).

## 3. Known / Accepted Risks (documented, mostly DEFERRED)

| Item | Why accepted | Required action |
|------|--------------|-----------------|
| Laravel framework **10.49.1** advisories: GHSA-crmm-hgp2-wgrp (signed-URL path confusion, no CVE) + CVE-2026-48019 (CRLF injection via `email` validation rule) | Fix requires **Laravel 12.60+** (10→12 = 2 major versions: Kernel removed, bootstrap rewritten). App doesn't use signed routes; email-validation flow unenforced in SPA. | Upgrade to Laravel 12 when budget allows (ROADMAP R8) |
| Symfony/* (10 CVEs), league/commonmark (13 CVEs), psy/psysh (priv-esc) in composer graph | Dev/runtime transitive packages; no direct exploitable surface in app code exercised | Track with `composer audit`; bumpable on next composer update |
| Email verification not enforced (MustVerifyEmail not applied) | No SMTP; enforcing would lock out every new user | Product decision (TODO #1) + SMTP (TODO #3) |
| `frontend-react/.env` used to be committed (only local URL — low risk) | Not credentials | Now gitignored |
| File/image storage on local `public` disk | Not durable for prod | Object storage (ROADMAP R6) |
| No CSRF middleware for token API | Token-based auth is CSRF-resilient by design (no cookies for SPA API) | Keep Bearer-header flow; do not add cookies for API |

## 4. Sensitive Data Checklist

- `.env` is gitignored; `.env.example` contains **no secrets** (empty Stripe vars).
- `supervisord.log` (runtime log) untracked + gitignored.
- Stripe keys — **never** commit; use environment variables (Render/CLI).
- Real users data: currently test users only; production requires GDPR/consent handling (ROADMAP note).

## 5. Hardening Plan (S1–S7, extends ROADMAP)

1. **S1** — Rotate & scope secrets; add a lint/CI gate that fails on `STRIPE_SECRET=` values in commits.
2. **S2** — Add `APP_DEBUG=false` + `SESSION_SECURE_COOKIE=true` guards for prod; enforce in CI.
3. **S3** — Dependency hygiene: schedule monthly `composer audit` + `npm audit`; bump phpunit, Symfony stack.
4. **S4** — Laravel 10→12 migration (clears remaining framework advisories) — biggest single step.
5. **S5** — Add integration tests for the Stripe webhook (signature + replay + idempotency). (Webhook path is currently untested by PHPUnit.)
6. **S6** — Object storage + signed URLs / CDN for images; add image dimension/type whitelist.
7. **S7** — Introduce audit logging for payment & profile changes (model events), plus optional 2FA for owner accounts (roadmap).

## 6. Useful Commands

```bash
cd backend-laravel
composer audit          # check package advisories
composer audit --locked
cd ../frontend-react
npm audit               # check JS advisories
npm audit fix           # after review
```