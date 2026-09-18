# API Reference

Base URL: `http://localhost:8000/api` (local default). Content-Type `application/json` unless noted (multipart for file uploads).

Auth: `Authorization: Bearer <token>` for any row marked **Auth**. Tokens issued by `POST /login`, expire in 7 days. Unauthenticated mutating requests → `401`.

Conventions: errors return JSON `{ "message": "..." }` with 4xx/5xx. Foreign-key references are integers.

---

## 1. Auth & User

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| POST | `/login` | No | `email`, `password` | `{ user, token }` |
| POST | `/register` | No | `name`, `email`, `password`, `dateOfBirth?`, `city?`, `profile_image?` (multipart, image ≤2MB) | 201 `{ user }` |
| POST | `/logout` | Yes | — | `{ message }` |
| GET | `/user` | Yes | — | `{ user }` |
| PUT | `/user/profile` | Yes | `name?`, `email?`, `city?`, `dateOfBirth?`, `profile_image?` | `{ message, user }` |
| PUT | `/user/password` | Yes | `current_password`, `password`, `password_confirmation` | `{ message }` (422 if current wrong) |

> Throttle: `login` + `register` limited to 5 attempts/min per email+IP → 429.

## 2. Listings

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/dataListings` | No | — | Array of listings |
| GET | `/dataListings/{title}` | No | — | Single listing (by title) |
| POST | `/listings` | Yes | `title`, `location`, `price`, `images[]` (multipart), `date_debut?`, `date_fin?`, `people?`, `rooms?` | 201 listing |
| GET | `/my-listings` | Yes | — | Listings owned by caller |
| PUT | `/listings/{id}` | Yes | same as store | Updated listing |
| DELETE | `/listings/{id}` | Yes | — | 200 |

Ownership: update/delete return **403** for non-owner, **404** if not found.

## 3. Comments

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/listings/{id}/comments` | No | — | Nested `{ id, text, user_name, parent_id, replies: [] , created_at }` |
| POST | `/comments` | Yes | `listing_id`, `text`, `parent_id?` | 201 comment |

Replies: `parent_id` points to an existing comment on the same listing; controller nests children under `replies`.

## 4. Ratings

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/listings/{id}/ratings` | No | — | `{ average, count, my_rating (null if guest) }` |
| POST | `/listings/{id}/ratings` | Yes | `rating` (int 1–5) | 201 `{ message, rating, average, count }` |

Upsert semantics: one rating per (listing_id, user_id) — DB `unique` index; posting again **updates** the value.

## 5. Wishlist

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/wishlist` | Yes | — | Array of user's wishlist items |
| POST | `/wishlist` | Yes | `listing_id` | 201 wishlist item |
| DELETE | `/wishlist/{listingId}` | Yes | — | 200 |

Duplicates prevented (`firstOrCreate` + unique index `{listing_id,user_id}`).

## 6. Reservations

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/my-reservations` | Yes | — | Caller's reservations |
| GET | `/listings/{id}/reservations` | Yes | — | Reservations for a listing (owner) |
| POST | `/listings/{id}/reservations` | Yes | `start_date`, `end_date` | 201 reservation |

Validation: both dates required; `end_date` after `start_date`; date range constrained to listing `date_debut`/`date_fin` when set (422 otherwise).

## 7. Payments / Checkout

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| POST | `/listings/{id}/checkout` | Yes | `start_date`, `end_date` | `{ checkout_url, session_id, payment_id, reservation_id }` |
| GET | `/payments` | Yes | — | Caller's payments incl. `listing`, `reservation` |
| GET | `/payments/earnings` | Yes | — | `{ total, payments[] }` for paid payments against the caller's listings |
| POST | `/stripe/webhook` | **No** (signature) | raw Stripe payload + `Stripe-Signature` header | `{ received: true }` |

`checkout` behavior:

- Uses listing price → Stripe Checkout Session (`mode=payment`, `card`, currency **usd**).
- 422 if you try to book **your own** listing.
- 503 (graceful) if `services.stripe.secret` is empty — to enable, set `STRIPE_SECRET` (test mode).
- Creates/updates `Reservation` (status `pending`) and `Payment` (status `pending`) with `stripe_session_id`.

`webhook` events handled: `checkout.session.completed` (paid) → `payment.status=paid`, `reservation.status=paid`, `reservation.is_paid=true`. Requires `STRIPE_WEBHOOK_SECRET`; bad signature → 400.

## 8. Messages

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/messages` | Yes | — | Conversations `[ { user, last_message, last_message_at, listing_title, unread } ]` |
| GET | `/messages/{userId}` | Yes | — | `{ other, messages: [ { id, body, sender_id, listing_title, created_at, mine } ] }` (marks incoming as read) |
| POST | `/messages` | Yes | `receiver_id`, `body`, `listing_id?` | 201 new message |

Body limit 2000 chars. `receiver_id` must exist (validated). Unread count: messages where `read_at IS NULL` and `receiver_id = me`.

## 9. Dashboard

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/dashboard-stats` | Yes | — | `{ listings_count, reservations_count, pending_reservations, comments_count, wishlist_count, total_revenue, paid_reservations, my_reservations_count, unread_messages }` |

Stats are owner-relative (counts against listings owned by the caller; `total_revenue` sums **paid** payments against them).

## 10. Health

| Method | Path | Auth | Body | Returns |
|--------|------|------|------|---------|
| GET | `/healthz` | No | — | `{ status: "ok" }` |

## 11. Status Code Summary

| Code | Meaning / examples |
|------|--------------------|
| 200 | OK list/update/delete, login, logout, profile |
| 201 | Created (register, listing, comment, rating, wishlist, reservation, message) |
| 401 | Missing/expired token |
| 403 | Non-owner attempting update/delete |
| 404 | Listing/comment/message target not found |
| 422 | Validation failed (incl. own-listing booking, date range, wrong current password) |
| 429 | Rate limited (login/register) |
| 503 | Stripe not configured (checkout/webhook gracefully degrade) |