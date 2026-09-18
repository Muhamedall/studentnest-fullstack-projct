# Database

## 1. Per-Environment Configuration

| Environment | Driver | How configured |
|-------------|--------|----------------|
| Local dev | **SQLite** | `.env`: `DB_CONNECTION=sqlite`, `DB_DATABASE=database/database.sqlite`, file exists in repo |
| Automated tests | **SQLite in-memory** | `phpunit.xml` overrides (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`) |
| Docker Compose | **PostgreSQL 15** | `docker-compose.yml` env: DB `laravel`, user `laravel`, pass `secret`, host `db` |
| `.env.example` | **PostgreSQL** | DB `studentnest`, user `postgres`, port 5432 |
| Render (prod) | **PostgreSQL (managed)** | `render.yaml` `databases:` block; env wired from it |

> Important: local `.env` (gitignored) holds the SQLite override. `.env.example` (committed) documents PostgreSQL as the deploy profile, with commented instructions to switch back to SQLite locally. Legacy README claimed MySQL — that is no longer accurate.

## 2. Schema (current, source: migrations)

Migrations present (chronological):

1. `2014_10_12_000000_create_users_table`
2. `2014_10_12_100000_create_password_reset_tokens_table`
3. `2019_08_19_000000_create_failed_jobs_table`
4. `2019_12_14_000001_create_personal_access_tokens_table` (Sanctum)
5. `2024_05_14_223833_create_listings_table`
6. `2024_05_29_213532_create_reservations_table`
7. `2024_05_29_213533_add_details_to_reservations_table`
8. `2024_06_06_151734_create_comments_table` (renamed from `create_commenters_*`; creates `comments`)
9. `2024_09_03_135421_create_wishlists_table`
10. `2024_09_03_135422_update_wishlists_table` (unique index, cascades)
11. `2026_09_17_000001_create_payments_table`
12. `2026_09_17_000002_create_ratings_table`
13. `2026_09_17_000003_create_messages_table`
14. `2026_09_17_000004_add_paid_flag_to_reservations_table`
15. `2026_09_17_000005_add_parent_id_to_comments_table`

### Tables & columns

**users**
`id`, `name`, `email` (unique), `email_verified_at`, `password` (hashed), `dateOfBirth`, `city`, `profile_image`, `remember_token`, `created_at`, `updated_at`

**listings**
`id`, `title`, `location`, `price` (decimal), `images` (JSON array cast), `date_debut`, `date_fin`, `people`, `rooms`, `user_id` → users, timestamps

**comments**
`id`, `listing_id` → listings, `user_id` → users, `text`, `parent_id` (nullable, self-FK → comments, cascade), timestamps

**ratings**
`id`, `listing_id` → listings, `user_id` → users, `rating` (unsignedTinyInteger, default 5), timestamps, **unique(`listing_id`,`user_id`)**

**wishlists**
`id`, `user_id` → users, `listing_id` → listings, timestamps, **unique(`user_id`,`listing_id`)** (added via `update_wishlists_table`)

**reservations**
`id`, `user_id` → users, `listing_id` → listings, `start_date`, `end_date`, `status` (string, default `pending`), `is_paid` (bool, default false, added 000004), timestamps

**payments**
`id`, `user_id` → users, `listing_id` → listings, `reservation_id` → reservations (nullable), `amount` (decimal 10,2), `currency` (default `usd`), `provider` (default `stripe`), `stripe_session_id`, `stripe_payment_intent_id`, `status` (default `pending`), timestamps. All FKs cascade.

**messages**
`id`, `sender_id` → users, `receiver_id` → users, `listing_id` → listings (nullable), `body` (text), `read_at` (datetime, nullable), timestamps. All FKs cascade.

**Wishlists/comments/ratings FK cascades** remove child rows when a user/listing is deleted.

**Not present** (by design): `etudiants` (removed Phase 5), `Etudiant`/`Wishlest` models, workers/queues tables beyond default `failed_jobs`.

## 3. Relationships

```
users  1──< listings     listings.user_id
users  1──< reservations reservations.user_id (student)
users  1──< comments     comments.user_id
users  1──< ratings      ratings.user_id
users  1──< wishlists    wishlists.user_id
users  1──< payments     payments.user_id
users  1──< messages     sender/receiver
listings 1──< reservations (listing_id)
listings 1──< comments    (listing_id)
listings 1──< ratings     (listing_id)
listings 1──< wishlists   (listing_id)
listings 1──< payments    (listing_id)
listings 1──< messages    (listing_id)
comments parent_id ─(self)→ comments.id (replies)
reservations 1──< payments.reservation_id (nullable; a payment typically refers to a reservation)
```

## 4. Seeding

`DatabaseSeeder` → 11 users + listings + supporting data. Owners (e.g. demo `mohamedallaoui@gmail.com`) own the published listings; the seeded student `student2@test.com` allows testing the book-someone-else's-listing path. Factory support: `UserFactory`, `ListingFactory`, `WishlistFactory`, `ReservationFactory` all implemented.

Run: `php artisan migrate:fresh --seed`.

## 5. Migration Notes / Gotchas

- **SQLite cannot `dropForeign`** — anywhere a FK unique constraint changes (comments, wishlists), the table is recreated in the migration rather than altered (Phase 2 finding #44).
- Self-referencing FK on `comments.parent_id` was added in a **separate** migration (000005) so existing databases can `migrate` (not just `migrate:fresh`).
- Eloquent model uses **`$casts`** for `images` (array). Laravel 10.49 does **not** support the `casts()` method (Phase 2 finding #43).
- `Listing::fillable` includes `user_id` but routes set it server-side from the authenticated user (never trust client).

## 6. Drift / Todo (documented)

| Item | Status |
|------|--------|
| Currency | Payments table stores `currency` default `usd`; UI displays MAD. Unify (see `KNOWN_LIMITATIONS.md`). |
| Indexes | Unique indexes on ratings & wishlists already in place; consider composite index on `messages(sender_id, receiver_id, created_at)` and `reservations(listing_id, status)` for scale. |
| Local→prod | Render/Postgres is authoritative for deployed footprint; keep `.env.example` in sync. |

## 7. Backups / Integrity

- Local dev: the SQLite file + `php artisan migrate` are reproducible from scratch (`migrate:fresh --seed`).
- Production: managed Postgres (Render) snapshots; image storage is currently local disk (see ROADMAP item: object storage).