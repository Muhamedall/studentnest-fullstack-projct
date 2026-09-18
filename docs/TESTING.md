# Testing

## Current State

**Backend**: PHPUnit 10.5.64 — **53 tests, 140 assertions, ~17s** green.
**Frontend**: **no test runner configured** (no test script; only dev/build/lint/preview).

## 1. Backend Test Layout

`backend-laravel/tests/`:

```
tests/
├── CreatesApplication.php
├── TestCase.php
├── Unit/ExampleTest.php
├── Feature/
│   ├── ExampleTest.php
│   ├── Auth/
│   │   ├── AuthenticationTest.php      (login, logout, protected routes)
│   │   ├── RegistrationTest.php        (register incl. no-image path)
│   │   ├── PasswordResetTest.php       (Breeze token flow)
│   │   └── EmailVerificationTest.php   (verification routes)
│   └── Api/                             ← custom API suite (added Phase 2)
│       ├── AuthApiTest.php             login/register/logout contract
│       ├── ListingApiTest.php          14 cases: guest 401, owner 201, images, update/delete/CORS
│       ├── CommentApiTest.php          comments + user_name + auth
│       ├── WishlistApiTest.php         CRUD + duplicate prevention
│       └── ReservationApiTest.php      create + owner listing + availability
```

## 2. Configuration

`phpunit.xml` force **SQLite in-memory** for tests (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`) so tests never touch the dev/prod DB. Factories (`UserFactory`, `ListingFactory`, `WishlistFactory`, `ReservationFactory`) generate fixtures on demand (fixed Phase 2 — previously factories were empty and `db:seed`/tests crashed).

## 3. Run

```bash
cd backend-laravel
php artisan test            # all tests (53 passed, 140 assertions)
php artisan test --filter=ListingApiTest   # single file
vendor/bin/phpunit          # alias runner
```

## 4. Coverage Notes (verified)

- New-ish endpoints **without tests yet**: checkout/webhook (`PaymentController` — mocked external calls would be needed), messages, ratings, dashboard-stats, updateProfile/updatePassword, payments/earnings. These were verified **manually** during the Phase 8 smoke test (see MAINTENANCE_PROGRESS).
- Decision: payout-critical Stripe path should get an integration-style test next (S5 in SECURITY.md).

## 5. Frontend

No test framework present. Options when adding one: Vitest + React Testing Library (Vite-native, matches existing tooling). Suggested scope: `usersSlice` reducer, `formatPrice`, `ProtectedRoute`, and Homme filtering logic. Lint (`npm run lint`, 0 warnings) is the only frontend gate today.

## 6. Manual Smoke Script (used during maintenance)

1. `php artisan test` (backend green).
2. `npm run lint` + `npm run build` (frontend green).
3. Live on `:8000`: register, login→token, unauthenticated create→401, listing create, comment (with `user_name`), rating upsert, wishlist add+dedupe, reservation create, checkout→ (503 until keys) then Stripe session with keys, webhook marks paid, password change OK/422, profile update, messages, logout.