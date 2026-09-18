# Backend

Laravel 10 (10.49.1) REST API. PHP >= 8.1 (local 8.3.30). Located in `backend-laravel/`.

## 1. Layout

```
backend-laravel/
├── app/
│   ├── Http/Controllers/   User, Listing, Comment, Rating, Wishlist,
│   │                       Reservation, Payment, Message, Dashboard
│   ├── Models/             User, Listing, Comment, Rating, Wishlist,
│   │                       Reservation, Payment, Message
│   └── Providers/AppServiceProvider.php  (rate limiters)
├── config/                 cors, sanctum, services(stripe), database, ...
├── database/
│   ├── migrations/         15 migrations (see DATABASE.md)
│   ├── factories/          User, Listing, Wishlist, Reservation (implemented)
│   ├── seeders/            DatabaseSeeder (11 users + data)
│   └── database.sqlite     local SQLite file
├── routes/api.php          all API routes
├── tests/                  PHPUnit feature tests
├── Dockerfile, docker-compose.yml, render.yaml, .env.example
```

## 2. Routing (`routes/api.php`)

Two groups + public endpoints:

- **Authenticated** (`auth:sanctum`): `/user`, `/user/profile`, `/user/password`, `/logout`, `/dashboard-stats`, `/listings` (POST), `/my-listings`, `/listings/{id}` (PUT/DELETE), `/comments` (POST), `/listings/{id}/ratings` (POST), `/wishlist` (GET/POST/DELETE), `/my-reservations`, `/listings/{id}/reservations` (GET/POST), `/listings/{id}/checkout`, `/payments`, `/payments/earnings`, `/messages` (GET/POST), `/messages/{userId}`.
- **Public**: `/login`, `/register` (both throttled), `/dataListings`, `/dataListings/{title}`, `/listings/{id}/comments` (GET), `/listings/{id}/ratings` (GET), `/stripe/webhook`, `/healthz`.

Write endpoints intentionally require auth (Phase 3 P1 security fix — previously listings/comments were open).

## 3. Controllers Summary

| Controller | Key methods & behaviors |
|------------|-------------------------|
| `UserController` | `store` register (validates email unique, optional profile_image via `->store('profile_images','public')`); `login` (Auth::attempt → personal access token); `logout` (delete all tokens); `updateProfile` (multipart); `updatePassword` (checks current → 422 on mismatch) |
| `ListingController` | `index` (all), `show` (by title), `store` (auth user_id, images array), `update`/`destroy` (ownership → 403), `myListings` (server-side filter) |
| `CommentController` | `index` (listing comments, nested `replies` via `parent_id`, `user_name` appended), `store` (auth user_id, validates listing) |
| `RatingController` | `index` (average/count/my_rating for authenticated caller), `store` (upsert by listing+user, validate 1–5) |
| `WishlistController` | REST index/store/destroy, `firstOrCreate` duplicates + unique index |
| `ReservationController` | `store` (validates dates, range against listing date_debut/date_fin), `index` (listing reservations — owner), `myReservations` (caller) |
| `PaymentController` | `checkout` (Stripe session; 404/422 self-booking/503 unconfigured), `webhook` (signature-verified), `index`, `earnings` (paid on owner listings) |
| `MessageController` | `index` (conversations with unread count), `show` (thread + marks read), `store` (validates receiver exists) |
| `DashboardController` | `stats` — owner-relative aggregates |

## 4. Models & Key Conventions

- All models: `$fillable` + `$casts`. Use the **`$casts` property** (Laravel 10.49 ignores a `casts()` method — a fixed gotcha).
- `Listing::$casts['images'] = 'array'` (JSON images).
- `User::$casts['password'] = 'hashed'` — hashing happens automatically on save.
- Accessors: `Reservation` exposes `user_name`; `Comment` exposes `user_name` for the frontend contract.
- Relations use Eloquent `HasMany`/`BelongsTo` (verified against real classes — dangling `Commenter`/`Wishlest` were removed in Phase 2).

## 5. Middleware & Providers

- `app/Http/Kernel.php` — `HandleCors` in global + api groups (`config/cors.php` enables); custom wildcard CorsMiddleware removed (Phase 3 P1).
- `AppServiceProvider::boot()` — `RateLimiter::for('auth', ...)` (5/min per email+IP), applied to `/login`, `/register`.
- Sanctum: personal-access tokens TTL 7 days (`config/sanctum.php`).
- No custom exception formatter — Laravel defaults return JSON for `api/*`, validation errors as 422 with `{ message, errors }`.

## 6. Dependencies (composer.json)

- Runtime: `laravel/framework ^10.10`, `laravel/sanctum ^3.3`, `stripe/stripe-php ^21.3`, `guzzlehttp/guzzle ^7.2`, `laravel/tinker ^2.8`.
- Dev: `phpunit ^10.1` (installed 10.5.64), `laravel/breeze ^1.29` (unused session UI), `laravel/pint ^1.0`, `laravel/sail ^1.18`, `fakerphp/faker ^1.9.1`, `mockery ^1.4.4`, `nunomaduro/collision ^7.0`, `spatie/laravel-ignition ^2.0`.

## 7. Validation & Errors

Double-check why we return these status codes (see docs/API.md §11):

- 401 (no/invalid token), 403 (non-owner), 404 (not found), 422 (validation / self-booking / date rules / wrong current password), 429 (rate limited), 503 (Stripe not configured).

## 8. Running

```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
# SQLite locally:
#   DB_CONNECTION=sqlite, DB_DATABASE=database/database.sqlite
php artisan migrate --seed
php artisan storage:link     # public/storage symlink for images
php artisan serve            # :8000
vendor/bin/pint              # style check
php artisan test             # 53 tests, 140 assertions
```

## 9. Known Backend Gaps

- Stripe keys intentionally empty → checkout 503 until configured (see PAYMENTS.md).
- No queues/jobs/email/notifications (see EMAILS.md).
- `dataListings/{title}` matches by title in non-unique field — the frontend contract (`DetailesListing/:title`) depends on unique titles; future: slug or id lookup (TODO #16).
- Laravel stays on 10.49.1 (documented advisories; upgrade to 12 clears them — DEFERRED).