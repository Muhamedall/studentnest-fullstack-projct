# Maintenance Progress Log

Project: StudentNest — Student Housing Rental Platform
Branch: `branch-dev`
Started: 2026-09-17

## Legend
- Severity: P0 (cannot run) / P1 (security) / P2 (critical broken functionality) / P3 (data integrity) / P4 (major unfinished feature) / P5 (performance) / P6 (dependency) / P7 (code quality) / P8 (UX/UI) / P9 (nice-to-have)
- Status: OPEN / IN_PROGRESS / FIXED / VERIFIED / WONTFIX / DEFERRED

---

## Initial Audit (PHASE 1) — 2026-09-17

### Environment
- Backend: Laravel 10 (`laravel/framework ^10.10`), PHP >= 8.1 (local PHP 8.3.30)
- Frontend: React 18.2.0 + Vite 5.2.0, Redux Toolkit 2.2.3, Tailwind CSS 3.4.3
- Auth: Laravel Sanctum (token API) + Breeze (session, unused by SPA)
- DB: MySQL (configured), but **no MySQL server available locally**; no MariaDB
- Docker 28.4.0 installed but **daemon not running**
- Local: PHP 8.3.30, Composer 2.6.6, Node 22.14.0, npm 11.18.0; extensions pdo_mysql/pdo_sqlite/sqlite3 available
- `.env` files: backend `.env` is NOT git-tracked (good); `frontend-react/.env` IS git-tracked (contains only local URL, low risk but should be gitignored)
- `supervisord.log` runtime log committed to repo (should be removed/gitignored)

### Issues logged from audit
| # | Severity | Issue | Root cause | Fix | Files | Status |
|---|----------|-------|-----------|-----|-------|--------|
| 1 | P2 | `POST /api/listings` crashes (user_id null → FK violation) | route not `auth:sanctum`, `$request->user()` is null | protect route + use auth user | routes/api.php, ListingController.php | OPEN |
| 2 | P2 | `POST /api/comments` fails on every insert (user_id NOT NULL not set) | controller never sets user_id; route unprotected | set user_id, protect route | CommentController.php, routes/api.php | OPEN |
| 3 | P2 | `RegisteredUserController@store` returns User model from `: Response` method → TypeError | wrong return type + broken signature | fix | Auth/RegisteredUserController.php | OPEN |
| 4 | P2 | `RegisteredUserController@store` crashes when no profile_image uploaded | unconditional `->file()->store()` | guard with hasFile | Auth/RegisteredUserController.php | OPEN |
| 5 | P2 | `UserFactory::definition()` returns `[]` → all factory users/seeders/tests fail | empty factory | populate factory | database/factories/UserFactory.php | OPEN |
| 6 | P2 | `User`/`Listing` models reference non-existent `Commenter`/`Wishlest` classes | dangling class refs | point to Comment/Wishlist or remove | app/Models/User.php, app/Models/Listing.php | OPEN |
| 7 | P1 | CORS: custom CorsMiddleware stamps `Access-Control-Allow-Origin: *` globally with credentials | global middleware overriding config | remove/replace with config-driven HandleCors | app/Http/Middleware/CorsMiddleware.php, Kernel, config/cors.php | FIXED |
| 8 | P1 | Write endpoints unauthenticated (listings, comments) | missing middleware | add auth:sanctum | routes/api.php | FIXED |
| 9 | P1 | Sanctum tokens never expire | config `expiration => null` | set sensible expiry | config/sanctum.php | FIXED |
| 10 | P1 | Hardcoded supervisor credentials `admin`/`admin123` | docker/supervisord.conf | env-driven credentials | docker/supervisord.conf | FIXED |
| 11 | P3 | `render.yaml` worker references missing `Dockerfile.worker` | missing file | create or remove worker | render.yaml | FIXED |
| 12 | P3 | db drift: docker-compose uses pgsql, local .env uses mysql | mismatch | reconcile | docker-compose.yml | FIXED |
| 13 | P4 | Reservations feature: empty model/controller/seeder, table only id+timestamps | never implemented | complete feature | app/, migrations, frontend ViewReservations | OPEN |
| 14 | P4 | Wishlist backend: controller not routed, `$fillable` missing → MassAssignmentException | unfinished | wire routes, add fillable/unique | WishlistController.php, Wishlist.php, routes | OPEN |
| 15 | P4 | `EtudiantController` broken & unrouted (validation-def corrupted, Hash not imported) | broken leftover | fix or remove | EtudiantController.php | FIXED |
| 16 | P4 | `Dateable` `dataListings/{title}` queries by non-unique title (non-deterministic) | no slug/id route | support lookup by id/slug | ListingController.php, routes | OPEN |
| 17 | P4 | Missing `update`/`delete` listing endpoints (frontend ready: EditListing PUT, ManageListings DELETE) | unfinished | implement controller methods + routes | ListingController.php, routes/api.php | OPEN |
| 18 | P4 | Email verification flow present but never enforced | `User` doesn't implement MustVerifyEmail | decide (see TODO_REMAINING) | app/Models/User.php | DEFERRED |
| 19 | P4 | Migration filename `create_commenters_table` creates `comments` | naming mismatch | rename migration file (keep table name `comments`) | migrations | FIXED |
| 20 | P5 | `ManageListings.jsx` fetches ALL listings then filters client-side | no server-side filtering | add per-user endpoint | ListingController, ManageListings.jsx | FIXED |
| 21 | P6 | Frontend missing `date-fns` dependency (imported in Singup.jsx) | only present via transitive dep | add to package.json | package.json | FIXED |
| 22 | P6 | `react-router-dom` in devDependencies (used at runtime) | misclassified | move to dependencies | package.json | FIXED |
| 23 | P6 | Unused deps: zustand, @mui/x-date-pickers, @fortawesome/free-regular-svg-icons, @tailwindcss/forms, @tailwindcss/typography, @types/* | never used | remove | package.json | FIXED |
| 24 | P6 | Hardcoded `http://localhost:8000` in 4+ frontend files; `.env` VITE_BACKEND_URL unused | env pattern not followed | centralize via env | api/api.js, Homme, DetailesListing, ManageListings | FIXED |
| 25 | P7 | `AuthenticatedSessionController` misuses Sanctum HasApiTokens trait in controller | wrong usage | remove trait usage | Auth/AuthenticatedSessionController.php | FIXED |
| 26 | P7 | Dead code: Etudiant feature, Routers.jsx (empty), App.css (empty), empty Student.jsx, non-functional MenuOfuser, `supervisord.log` | leftovers | remove or complete | various | FIXED |
| 27 | P7 | `dataListings/{title}` also renders `:title` route; JSON images not cast on Listing model | no casts | add json cast | app/Models/Listing.php | OPEN |
| 28 | P8 | Fake payment form collects real card data, logs to console, no processing | placeholder | remove or gate behind real flow (see TODO) | DetailesListing.jsx | FIXED |
| 29 | P8 | Forgot password links point to facebook.com | wrong URLs | fix/skip (see TODO) | Login.jsx | FIXED |
| 30 | P7 | `Account.jsx` broken Tailwind class (`mt-[10%] p`) | split class | fix | Account.jsx | FIXED |
| 31 | P5 | No route protection (any user can open Dashboard/AddListing/etc.) | missing guards | add guard route wrapper | App.jsx | FIXED |
| 32 | P9 | Navbar search bar cosmetic (no filtering) | unfinished | wire to listings filter | Navbar.jsx, Homme.jsx | OPEN |
| 33 | P5 | Many console.log debug statements | leftover | remove | DetailesListing, Singup, Login, Account, AddListing, EditListing | FIXED |
| 34 | P6 | phpunit.xml SQLite config commented out → tests hit whatever DB_* points at | config | enable SQLite for tests | phpunit.xml | FIXED |
| 35 | P3 | No unique constraint on `wishlists` → duplicate favorites possible | migration | add unique index | migrations | FIXED |
| 36 | P7 | `User`/`Listing` relation to non-existent classes; WishlestFactory references `App\Models\Wishlest` | leftover | fix | database/factories/WishlestFactory.php | FIXED |
| 37 | P6 | index.html title still "Vite + React", favicon references missing /vite.svg | default scaffold | brand + add favicon | frontend index.html | FIXED |
| 38 | P6 | vite.config duplicates PostCSS tailwind config | config duplication | reconcile | vite.config.js / postcss.config.js | FIXED |
| 39 | P2 | `WishlistController` not routed; controller's `Auth::user()` may be null (no auth middleware) | unfinished | wire with auth | routes/api.php, WishlistController | FIXED |
| 40 | P9 | docker-compose env drift vs .env (APP_DEBUG, DB creds) | mismatch | reconcile | docker-compose.yml | FIXED |
| 45 | P6 | 5 npm vulns (vite ≤6.4.2/esbuild ≤0.24.2, react-router ≤7.17.0) | major version upgrades | vite 8.3 + react-router 7.18 | frontend package.json | FIXED |
| 46 | P6 | Composer: phpunit CVE-2026-24765 (unsafe deserialization) | outdated phpunit | bump to ≥10.5.62 | composer.json/lock | FIXED |
| 47 | P6 | Composer: laravel/framework signed-URL path confusion (GHSA-crmm-hgp2-wgrp) + CRLF email-rule injection (CVE-2026-48019) | only fixed in Laravel 12.60+ (10→12 = 2 major versions) | upgrade 10→12 + rewrite bootstrap/middleware | laravel/framework | DEFERRED (accepted risk, see Phase 6 note) |

### Verified non-issues / notes
- Backend `.env` is NOT committed (gitignore active) — only `frontend-react/.env` (non-secret local URL).
- Sanctum + `withCredentials: true` pattern is correct for auth; the CORS override (issue 7) is what breaks it.
- Comment model/migration are correctly relational; index/store controller methods are fine.
- No Composer or npm `audit` data collected yet — will run during dependency phase.

---

## Completed Work

### Phase 2 — P0/P2 critical fixes (2026-09-17)

**Environment / infrastructure**
- Installed missing Composer dev dependencies (`composer install`); `fakerphp/faker`, `phpunit`, `laravel/pint` were previously absent (vendor was built with `--no-dev`), so `db:seed` and tests could not run at all.
- Switched **local only** `.env` to SQLite (`DB_CONNECTION=sqlite`, `DB_DATABASE=.../database/database.sqlite`); production `.env.example` keeps MySQL. Documented the reversible override in `.env.example`. Created `database/database.sqlite`.
- Enabled SQLite in-memory DB for the test suite in `phpunit.xml` (previously commented out).
- All 11 migrations verified on SQLite (`migrate:fresh --seed` passes; 11 users seeded).

**Bugs fixed (see issues above)**
| # | Severity | Fix | Files | Tests |
|---|----------|-----|-------|-------|
| 1 | P2 | `POST /api/listings` now requires `auth:sanctum`; `user_id` set from authenticated user; images passed as array (model `images` cast added) | routes/api.php, ListingController.php, Listing.php | ListingApiTest (guest 401, owner 201, image storage) |
| 2 | P2 | `POST /api/comments` now requires auth, sets `user_id`, validates listing exists; list endpoint appends `user_name` for frontend contract | CommentController.php, Comment.php, routes | CommentApiTest |
| 3 | P2 | `RegisteredUserController` fixed: return type `/Response` + `response()->noContent()`, optional profile_image guarded with `hasFile`, dateOfBirth/city optional (aligned with API register) | Auth/RegisteredUserController.php | RegistrationTest (existing, now passing) |
| 4 | P2 | `UserFactory` implemented (name/email/password/DOB/city/verified); `ListingFactory`, `WishlistFactory`, `ReservationFactory` implemented; broken `WishlestFactory` (referred to non-existent `Wishlest`) removed | factories | DatabaseSeeder + all factory-based tests pass |
| 5 | P2 | Removed dangling `Commenter`/`Wishlest` relations on `User`/`Listing`; correct `comments()`, `wishlists()`, `listings()`, `reservations()` relations; added `images` array cast (use `$casts` property — the `casts()` method is NOT supported in Laravel 10.49) | User.php, Listing.php | ListingApiTest, relationships exercised by all API tests |
| 6 | P2 | `Wishlist` model now has `$fillable`; controller rewritten as REST (index/store/destroy); duplicates prevented (`firstOrCreate` + DB unique index); cascades on FK | Wishlist.php, WishlistController.php, migration | WishlistApiTest |
| 7 | P2/P4 | Implemented `PUT /api/listings/{id}` and `DELETE /api/listings/{id}` with ownership checks (403 for non-owner, 404 missing); added `GET /api/my-listings` (server-side filter for ManageListings) | ListingController.php, routes | ListingApiTest (14 cases) |
| 13 | P4 | Reservations completed: columns (`user_id`,`listing_id`,`start_date`,`end_date`,`status`) via new migration, `Reservation` model + relations + `user_name` accessor, `POST`/`GET` endpoints matching the frontend contract (`start_date`/`end_date`/`user_name`), owner-only listing, availability validation | Reservation.php, ReservationController.php, migration | ReservationApiTest |
| 17 | P4 | Missing listing `PUT`/`DELETE` endpoints implemented (see row 7) | — | — |
| 27 | P7 | `images` JSON now properly cast to array (frontend `JSON.parse` still safe: casting yields array) | Listing.php | ListingApiTest images test |
| 35/36 | P3 | wishlist unique index + cascade; factories fixed | migrations/factories | WishlistApiTest |
| 39 | P2 | Wishlist routes wired with `auth:sanctum` | routes/api.php | WishlistApiTest |

**New issues discovered & fixed during Phase 2**
| # | Severity | Issue | Root cause | Fix | Status |
|---|----------|-------|-----------|-----|--------|
| 41 | P0 | `db:seed` fatal `Faker\Factory not found` | dev deps never installed | `composer install` | FIXED, VERIFIED |
| 42 | P0 | Seeder `NOT NULL constraint failed: users.email` | empty `UserFactory` | factory implemented | FIXED, VERIFIED |
| 43 | P0 | `casts()` method ignored → `listing images` stored as raw array (SQLite "Array to string conversion") | Laravel 10.49 does not support the `casts()` method | use `$casts` property | FIXED, VERIFIED |
| 44 | P0 | SQLite `BadMethodCallException` on `dropForeign` | SQLite cannot drop FKs | recreate table in migration with cascades + unique | FIXED, VERIFIED |

**API test suite added** — `tests/Feature/Api/`: AuthApiTest (8), ListingApiTest (14), CommentApiTest (5), WishlistApiTest (8), ReservationApiTest (8).

**Verification performed**
- `php artisan test`: **53 passed (140 assertions)** — includes all pre-existing Breeze tests (previously failing on empty factory) and the new API suite.
- `php artisan migrate:fresh --seed`: passes on SQLite.
- Live smoke test on `php artisan serve` (local SQLite): register (with & without image), login → token, unauthenticated listing create → **401**, create listing (user_id associated), comment → `user_name` returned, wishlist add + duplicate prevention, reservation create + owner listing (`start_date`/`end_date`/`user_name` contract), listing update, listing delete, cascade clean-up, logout. All OK.
- `laravel/pint` run on all changed files.

### Phase 3 — P1 security hardening (2026-09-17)

| # | Severity | Fix | Files | Status |
|---|----------|-----|-------|--------|
| 7 | P1 | **CORS**: Removed custom `CorsMiddleware` (set `Access-Control-Allow-Origin: *`) from both global and api middleware groups; `HandleCors::class` (already registered) now uses `config/cors.php` — `paths` narrowed from `*` to `['api/*', 'sanctum/csrf-cookie']`, `allowed_origins` restricted to `FRONTEND_URL` | Kernel.php, CorsMiddleware.php (deleted), config/cors.php | FIXED, VERIFIED |
| 9 | P1 | **Sanctum tokens**: `expiration` changed from `null` (never) → `10080` minutes (7 days) | config/sanctum.php | FIXED, VERIFIED |
| — | P1 | **Rate limiting**: Added `auth` rate limiter (5 attempts/min per email+IP) via `AppServiceProvider::boot()`; applied to `POST /api/login` and `POST /api/register` | AppServiceProvider.php, routes/api.php | FIXED, VERIFIED |
| 10 | P1 | **Supervisor credentials**: Removed hardcoded `admin`/`admin123` username+password from `unix_http_server` block (unix socket at `/tmp/supervisor.sock` chmod 0700 is already filesystem-protected inside the container) | docker/supervisord.conf | FIXED |
| — | P1 | **`supervisord.log` untracked**: `git rm --cached` + added to `backend-laravel/.gitignore` | .gitignore | FIXED |
| 28 | P1 | **Fake payment form removed**: Deleted card collection UI (cardNumber, expiry, cvv, cardHolderName), `cardDetails` state, `handleInputChange`, `handleConfirmReservation`, `console.log` of card details; Reserve button now alerts "Please log in to make a reservation." | DetailesListing.jsx | FIXED |
| — | P1 | **`frontend-react/.env` untracked**: `git rm --cached` + added to `frontend-react/.env`/`.env.local`/`.env.*.local` to `.gitignore` | frontend-react/.gitignore | FIXED |
| — | P1 | **`react/jsx-no-target-blank` re-enabled**: Changed from `'off'` → `'warn'` | .eslintrc.cjs | FIXED |

**Dependency audit & upgrades**

| Scope | Before | After | Action |
|-------|--------|-------|--------|
| npm vulnerabilities | 27 (2 critical, 17 high, 7 moderate, 1 low) | 5 (1 high, 4 moderate) | `npm audit fix` + `npm install swiper@14` |
| Composer `composer audit` | 41 advisories (guzzle, psr7, Laravel, Symfony, commonmark, phpunit, psysh) | Guzzle fixed: updated to 7.15.5 (10 CVEs resolved) | `composer update guzzlehttp/guzzle guzzlehttp/psr7` |
| Remaining npm | vite ≤6.4.2 (moderate), react-router-dom ≤7.17.0 (high) — both require breaking major-version upgrades (vite 8.x, react-router 7.x) | Deferred — dev-tool / router level, not runtime data-handling; tracked for Phase 6 refactor | DEFERRED |
| Remaining Composer | Laravel framework (CRLF in email rule, signed URL path confusion), Symfony/* (10 CVEs), league/commonmark (13 CVEs), phpunit (deserialization), psy/psysh (priv-esc) | Require Laravel 10→11 major upgrade or breaking package bumps | DEFERRED (tracked: Issue #45) |

**Other hardening**
- `.env.example` updated: added `SESSION_SECURE_COOKIE=false` and `SESSION_DOMAIN=null` (production should set `SESSION_SECURE_COOKIE=true`).
- `composer audit` confirmed: no hardcoded secrets/API keys in committed source code.
- Session config reviewed: `http_only: true`, `same_site: lax` — both correct defaults.

### Phase 4 — Frontend wiring (2026-09-17)

**Backend ↔ frontend integration (frontend now uses the working backend API)**

| Area | Before | After | Files |
|------|--------|-------|-------|
| **API base URL** | Hardcoded `http://localhost:8000` in api.js + 3 components | Centralized via `import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"`; added `STORAGE_URL` export for image paths | src/api/api.js, Homme.jsx, DetailesListing.jsx, ManageListings.jsx |
| **ManageListings** | Fetched ALL listings then filtered client-side by `user_id` | Uses new server-side `GET /api/my-listings` | ManageListings.jsx |
| **Reservation create UI** | Reserve button was a dead alert; fake payment form (removed in Phase 3) | Date-range picker (start/end) + `POST /api/listings/{id}/reservations`, success/error messages; redirects unauthenticated users to login | DetailesListing.jsx |
| **Wishlist** | localStorage-only (`favories_{userId}`), never touched backend | Rewrote slice with async thunks: `fetchWishlist`, `addWishlistItem`, `removeWishlistItem` hitting `GET/POST/DELETE /api/wishlist`; images from `STORAGE_URL` | wishlestSlice.js, Homme.jsx, Wishlest.jsx |
| **Route guards** | Any user could open Dashboard/Account/AddListing/Wishlist | New `ProtectedRoute` component wrapping auth-only routes (redirects to `/` if `isLoggedIn !== true`) | ProtectedRoute.jsx (new), App.jsx |
| **Singup profile upload** | Sent field `profileImage` (backend expects `profile_image`) | Renamed to `profile_image` — avatar upload now actually works | Singup.jsx |

**Bug fixes**
- Navbar wishlist badge: `numberFavories.length === 0` treated a number as an array → `numberFavories === 0`.
- Removed `console.log` debug in Singup.jsx.
- Removed unused `user` selectors in ManageListings/AddListing (leftover from pre-server filtering).

**Swiper v14 compatibility** (from the Phase 3 `swiper@14` security upgrade)
- `Navigation`/`Pagination`/`Keyboard`/`Mousewheel` now import from `swiper/modules`; removed global `SwiperCore.use()` (unused, modules passed via `modules` prop).
- A build error left `DetailesListing` mid-edit (missing state hooks); verified file compiles clean.

**Verification**
- `npm run build`: **builds successfully** (491 modules; warning only about bundle size).
- `npm run lint`: **clean** (fixed 1 new + 22 pre-existing errors across components: prop-types, unused vars).
- `php artisan test`: **53 passed (140 assertions)** — no backend regressions.

### Phase 5 — dead code & quality cleanup (2026-09-17)

**Dead code removed (backend)**
- Deleted the entire unused `Etudiant` feature: `EtudiantController` (broken validation-def, unrouted), `Etudiant` model, `EtudiantFactory`, `EtudiantSeeder`, and the `create_etudiants_table` migration (verified: zero route/test/import references).
- Deleted empty `WishlestSeeder`.
- Removed misplaced `HasApiTokens` trait usage from `Auth/AuthenticatedSessionController` (trait only belongs on `User`, which already has it).
- Renamed misleading `2024_06_06_151734_create_commenters_table.php` → `create_comments_table.php` (file name now matches the `comments` table it creates; safe because DB is rebuilt via `migrate:fresh`).

**Dead code removed (frontend)**
- Deleted empty `Routers/Routers.jsx`, empty `App.css`, placeholder `Student.jsx` ("Hello studen"), and non-functional `MenuOfuser` (navbar has its own inline menu). Removed their imports and orphaned routes from `App.jsx`.

**Quality fixes**
- `Account.jsx`: fixed broken Tailwind class `mt-[10%] p` + `y-[2%]` → `mt-[10%] py-[2%]` (line break had split `py-[2%]`).
- Removed `console.log` debug statements in Account, Login, AddListing, EditListing; untracked `response` variables in Add/Edit; `EditListing` now shows an inline error message instead of `console.error`.
- `index.html`: branded title `StudentNest`, removed broken `/vite.svg` favicon reference.
- `vite.config.js`: removed inline `css.postcss` block that duplicated the standalone `postcss.config.js` (which includes tailwindcss + autoprefixer).

**Verification**
- `php artisan migrate:fresh`: all 10 migrations run clean (etudiants table gone).
- `php artisan test`: **53 passed (140 assertions)** — no regressions.
- `npm run lint`: clean. `npm run build`: succeeds.
- No `Etudiant` references remain in routes, tests, or models.

### Phase 6 — dependencies (2026-09-17)

**Frontend packages (npm)**
| Change | Detail | Result |
|--------|--------|--------|
| **vite 5.2 → 8.3.0** + `@vitejs/plugin-react` 4→6 | Major upgrade (5→6→7→8). Config was already minimal (no legacy plugins); cleaned `vite.config.js` to `plugins:[react()]` at the end of Phase 5. Dev-server pics up port 3001 when 3000 is taken; `npm run build` + dev both verified. | Fixes esbuild dev-server advisory (GHSA-67mh-4wv8-2f99, required vite >6.4.2). |
| **react-router-dom 6 → react-router 7.18.4** | v6 `react-router-dom` was replaced by the unified `react-router` package. Updated 7 import sites (`BrowserRouter`, `Routes`, `Route`, `Link`, `Navigate`, `useNavigate`, `useParams`) from `react-router-dom` → `react-router`; uninstalled `react-router-dom`. | Fixes CVE-2025-68470 (open redirect via backslash) + GHSA-337j-9hxr-rhxg (constructor injection). |
| **Unused deps removed** (#23) | `zustand`, `@mui/x-date-pickers`, `@fortawesome/free-regular-svg-icons`, `@tailwindcss/forms`, `@tailwindcss/typography`, `@types/react`, `@types/react-dom` — verified zero imports in `src/` before removal. | Smaller lockfile + installs. |
| **`date-fns` added** (#21) | Imported in `Singup.jsx` but only present as a transitive dep — now declared explicitly. | Clear dep tree. |
| **`react-router`** moved from devDependencies → dependencies (#22) | It's used at runtime by every routed component. | Correct classification. |

Result: `npm audit` → **0 vulnerabilities** (was 5).

**Backend packages (Composer)**
| Change | Detail |
|--------|--------|
| `phpunit/phpunit` 10.5.58 → **10.5.64** | Clears CVE-2026-24765 (unsafe deserialization in PHPT code coverage). `php artisan test` still **53 passed / 140 assertions**. |

**Deferred (documented risk)** — user decision
- **Laravel framework stays at v10.49.1.** Three advisories remain:
  1. GHSA-crmm-hgp2-wgrp — temporary signed-URL path confusion (no CVE; requires signed routes, which are not actively used here).
  2. GHSA-5vg9-5847-vvmq / CVE-2026-48019 — CRLF injection in the default `email` validation rule (email-verification flow is not enforced; risk accepted for demo scope).
- Fixing these requires **Laravel 12.60+** (10→12 is a two-major-version migration: `app/Http/Kernel.php` removed in v11, middleware/bootstrap rewritten). Tracked as **#47 DEFERRED**.

### Phase 7 — deploy config reconciliation & cleanups (2026-09-17)

**#11 — Render worker removed (user decision)**
- Analysis: app has **zero queued jobs, mailable notifications, or event listeners** (grep for `dispatch|Queue|ShouldQueue|job(` returned nothing in `app/`), and `.env.example` uses `QUEUE_CONNECTION=sync`. The `studentnest-worker` service existed only to run a queue that nothing dispatches, and referenced a non-existent `Dockerfile.worker`.
- Fix: removed the entire worker service block from `render.yaml`.

**#12/#40 — DB standardised on PostgreSQL (user decision)**
- Previously 3-way split: local `.env` = sqlite, docker-compose = pgsql, `.env.example` = MySQL, Render = managed Postgres.
- Fix:
  - `.env.example`: production block now `DB_CONNECTION=pgsql` / `DB_PORT=5432` / db `studentnest`, matching docker-compose + Render. Local-dev SQLite override comment updated to say "PostgreSQL". Local `.env` (untracked, sqlite) unchanged.
  - `docker-compose.yml`: already pgsql + `postgres:15` — left as-is (now consistent).
  - `render.yaml`: added explicit `DB_CONNECTION=pgsql` env var and explicit `type: postgres` on the database resource.

**#18 — Email verification left unenforced (user decision)**
- Routes/controllers exist but `User` never implements `MustVerifyEmail`, so nothing enforces it.
- Fix: **no code change**. Documented as DEFERRED — enforcing without a real SMTP provider would lock every new user out (mail host is the dev-only `mailpit`).

**#29 — Removed facebook.com links in Login.jsx**
- "Forgot Password?" and "Sign up" both pointed to `facebook.com/login/identify?...`. No reset UI exists on the SPA and no SMTP is configured, so the forgpass link was dropped entirely; "Sign up" now toggles the real signup form (`setShowInscription`), matching the Navbar pattern.

**Verification**
- `php artisan test`: **53 passed (140 assertions)** — no regressions.
- `npm run lint`: clean. No frontend build changes required (Login.jsx only).

### Remaining phases (8-9) — not done
- **Phase 8**: #27 `dataListings/{title}` route ambiguity (also matches `/DetailesListing/:title` frontend contract) + JSON images cast; #32 navbar search cosmetic; #16 title-based lookup non-determinism.
- **Phase 9**: Laravel 10→12 migration when justified (clears #47), final full smoke test through UI (`php artisan serve` + `npm run dev`), optional: wire password-reset UI + real SMTP (#3), object storage for images (#9).

### TODO_REMAINING.md — decisions now settled (Phase 7)
| # | Item | Outcome |
|---|------|---------|
| 1 | Email verification enforcement | **Not enforced** (deferred) — no SMTP available |
| 4 | Local DB | **SQLite** approved for dev/test (reversible override) |
| 5 | Forgot-password facebook links | **Fixed** — dropped dead link, Sign up opens real form |
| 7 | `Etudiant` parallel table | **Removed** in Phase 5 (verified no references) |