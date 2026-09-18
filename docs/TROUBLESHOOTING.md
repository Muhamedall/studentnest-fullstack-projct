# Troubleshooting

Common issues and fixes observed across the maintenance pass.

## Backend won't start / artisan errors

- **`[RuntimeException] No application encryption key has been specified.`**
  Run `php artisan key:generate`, confirm `APP_KEY=` set in `.env`.
- **Composer/vendor missing** (`Class "Faker\Factory" not found`, `db:seed` crash): `composer install` (earlier vendor was built with `--no-dev`).
- **BadMethodCallException `dropForeign` while migrating (SQLite)**: SQLite can't drop FKs with `AlterTable`. If you hit this in your own branch, recreate the table in the migration (as done for comments/wishlists) — do not retry the same migration on SQLite.
- **`casts()` method ignored** (images storing as "Array to string conversion"): Laravel 10.49 only honors the **`$casts` property** — use `protected $casts = [...]`, not `casts(): array`.
- **Database file missing**: ensure `database/database.sqlite` exists (`touch`, or the file is present in the repo) and `DB_CONNECTION=sqlite`, `DB_DATABASE=database/database.sqlite`.

## Local DB (choice mismatch)

- `docker-compose` uses PostgreSQL (`laravel`/`laravel`/`secret`) while local `.env` uses SQLite. Don't mix: if you run compose, set `.env` to pgsql **or** run `artisan serve` with SQLite (they're separate app instances). Production follows Render env (`studentnest-db`).

## CORS / "blocked by CORS policy"

- Backend `.env` must set `FRONTEND_URL=http://localhost:3000`. If you run Vite on another port (3001 when 3000 busy), update `FRONTEND_URL` accordingly and restart `artisan serve`.

## Login works but API 401

- Token expired (7-day TTL) — log in again.
- SPA isn't attaching the header — restart with a fresh localStorage (usersSlice persists token); verify the request carries `Authorization: Bearer <token>`.
- Using `withCredentials` + cookies? Not needed for Sanctum token flow here; rely on the Bearer header.

## Checkout returns 503 "Stripe is not configured yet…"

Set `STRIPE_SECRET` (test key) in `.env`; also `STRIPE_KEY` and `STRIPE_WEBHOOK_SECRET` for full flow (see `docs/PAYMENTS.md`). Restart `php artisan serve`.

## Webhook doesn't mark payment paid

- Webhook **must** come from Stripe; run `stripe listen --forward-to localhost:8000/api/stripe/webhook` (or register an endpoint). Verify `STRIPE_WEBHOOK_SECRET=whsec_...` matches what `stripe listen` prints.
- Recheck the Stripe Dashboard test event has `payment_status = "paid"`; `checkout.session.completed` only handled when paid.
- Sanity: `payments.stripe_session_id` must match the session — the row is found by that lookup.

## Images not showing

- `public/storage` symlink missing → `php artisan storage:link`.
- `STORAGE_URL` derives from `VITE_BACKEND_URL`; if backend runs elsewhere, set `VITE_BACKEND_URL`.

## Frontend build / lint

- `npm run lint` fails with warnings → run `npx eslint . --fix` then re-lint; keep `--max-warnings 0`.
- Build >500 kB chunk warning is expected (React/FontAwesome) — ignore unless you split bundles.
- "Duplicate" postcss: tailwind is configured in `postcss.config.js` only; don't re-add a `css.postcss` block in `vite.config.js`.

## Ports

- Backend on `:8000`, frontend on `:3000`. Vite auto-switches to `3001` when busy — make sure `FRONTEND_URL` matches the actual SPA port (see CORS note).

## After pulling a branch with new migrations

```bash
php artisan migrate        # additive migrations (e.g. payments/ratings/messages/parent_id)
php artisan migrate:fresh --seed   # destructive but safe locally (SQLite)
```

Reservations/payments columns exist only after running these.

## Docker

- `docker compose up --build` then run migrations manually: `docker compose exec app php artisan migrate --seed`.
- Nginx serves from `public/`; if images fail behind the container, re-run `php artisan storage:link` inside it.
- Compose DB creds (`laravel`/`secret`) differ from `.env.example` (`postgres`) — don't reuse the wrong ones across instances.

## Demo accounts

- Owner: `mohamedallaoui@gmail.com` / `123456789` (owns seeded listings; can't book own listing → 422 by design).
- Test student: `student2@test.com` / `123456789` (use this one to book, rate, message the owner).