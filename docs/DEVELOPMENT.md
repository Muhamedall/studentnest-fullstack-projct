# Development Guide

How to work on StudentNest without tripping over the earlier maintenance findings.

## 1. Get Started

```bash
# Backend
cd backend-laravel
composer install
cp .env.example .env        # then set APP_KEY via: php artisan key:generate
# SQLite for local dev:
#   DB_CONNECTION=sqlite / DB_DATABASE=database/database.sqlite
php artisan migrate --seed
php artisan storage:link
php artisan serve            # :8000

# Frontend
cd ../frontend-react
npm install
npm run dev                  # :3000
```

Demo accounts: `mohamedallaoui@gmail.com`/`123456789` (owner), `student2@test.com`/`123456789` (student).

## 2. Daily Loop

1. Backend: edit → `vendor/bin/pint` → `php artisan test`.
2. Frontend: edit → `npm run lint` (keep 0 warnings) → `npm run build`.
3. Full smoke: `php artisan serve` + `npm run dev` → register/login, list CRUD, comment, rating, wishlist, reserve, checkout (Stripe), messages, dashboard.

## 3. Adding a Backend Feature

1. Migration → `php artisan make:migration`.
2. Model (`$fillable`, `$casts` property, relations).
3. Controller + route (`auth:sanctum` for write ops).
4. Test in `tests/Feature/Api/*Test.php` (SQLite in-memory).
5. `php artisan test`, `vendor/bin/pint`.

## 4. Adding a Frontend Feature

1. Add page component under `src/components/`.
2. Wire route in `App.jsx` (wrap auth-only pages with `<ProtectedRoute>`).
3. Slice actions under `src/components/Redux/` if global state needed.
4. API calls through `src/api/api.js` (or a fresh axios there) — never hardcode `localhost:8000` in components.
5. Lint must stay clean; add prop-types.

## 5. Conventions Checklist

- Laravel 10: **`$casts` property** only (the `casts()` method silently fails).
- Never accept client-supplied `user_id` — derive from `$request->user()`.
- Foreign-key cascades: on SQLite, rebuild the table (can't `dropForeign`).
- Frontend: `react-router` imports from `react-router` (v7), not `react-router-dom`.
- Swiper `swiper/modules` for modules.
- ESLint: no unused vars, no unused `eslint-disable`, prop-types required.
- Keep `npm run lint --max-warnings 0`; keep `php artisan test` green before finishing.
- `formatPrice` returns integer-or-2dp; append `MAD` in UI (current display currency).

## 6. Git Workflow

- Do maintenance/feature work on `branch-dev`; `master` holds released/summary history.
- Commit in the repo's existing style (e.g. `RF1:project` style messages).
- Keep `.env` out of commits (gitignored). Never commit Stripe/DB credentials.
- After finishing: verify with `git status`/`git diff`, run backend tests + frontend lint/build, then commit only if asked.

## 7. Environment Variables

Backend `.env` (see `.env.example`): `APP_KEY`, `DB_*`, `FRONTEND_URL`, `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `SESSION_SECURE_COOKIE`, `SESSION_DOMAIN`.

Frontend: `VITE_BACKEND_URL` (default `http://localhost:8000`), used for the API + `STORAGE_URL`.

## 8. Where Things Live

| Concern | Files |
|---------|-------|
| Routes | `backend-laravel/routes/api.php` |
| CORS | `backend-laravel/config/cors.php` |
| Stripe config | `backend-laravel/config/services.php` |
| Rate limiter | `backend-laravel/app/Providers/AppServiceProvider.php` |
| SPA router | `frontend-react/src/App.jsx` |
| Axios + token | `frontend-react/src/api/api.js` |
| Auth state | `frontend-react/src/components/Redux/usersSlice.js` |
| Dashboard | `frontend-react/src/components/listings/Dashboard.jsx` + `DashboardController` |

## 9. Testing & Linting Notes

- `php artisan test` → 53 passed / 140 assertions (SQLite in-memory).
- `npm run lint` → must be 0 warnings; `npm run build` → succeeds (chunk-size warning is benign).
- No frontend test runner yet — see `TESTING.md` for proposed Vitest setup.