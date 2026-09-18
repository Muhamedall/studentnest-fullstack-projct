# Payments (Stripe)

Status: **implemented, running in test mode only.** No live/secret credentials are stored in the repo.

## 1. Scope

- **Checkout**: Stripe **Checkout Sessions** (hosted payment page). Card data never touches our server → PCI scope avoided.
- **Webhook**: `POST /api/stripe/webhook` verifies the signature and flips payment/reservation to paid.
- **Data**: `payments` table + `reservation.is_paid` flag.
- Dashboards/earnings transact against `payments` (paid rows only).

## 2. Current Configuration

`config/services.php → stripe`:

```php
'key'            => env('STRIPE_KEY'),
'secret'         => env('STRIPE_SECRET'),
'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
'frontend_success_url' => env('FRONTEND_URL', 'http://localhost:3000').'/payment/success',
'frontend_cancel_url'  => env('FRONTEND_URL', 'http://localhost:3000').'/payment/cancel',
```

`.env` values (all **empty** by default):

```
FRONTEND_URL=http://localhost:3000
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
```

Behavior without keys: `POST /api/listings/{id}/checkout` returns **503** with a clear message; webhook returns **503** if secret missing. This is intentional (graceful first-run).

## 3. Flow

```
[DetailesListing SPA]
  pick dates → POST /api/listings/{id}/checkout
      │ (auth:sanctum; validates dates; blocks booking own listing 422)
      v
  Reservation (firstOrCreate, is_paid=false, status=pending)
  Payment     (updateOrCreate, status=pending, stripe_session_id=<id>)
  Stripe Checkout Session created →
      { checkout_url, session_id, payment_id, reservation_id }
      │ browser redirect to checkout.stripe.com
      v
      user pays with test card 4242 4242 4242 4242 (any future date, any CVC)
      │
      ├── success → /payment/success
      └── cancel  → /payment/cancel
      Stripe async webhook → /api/stripe/webhook (signature verified)
         checkout.session.completed + payment_status="paid"
            → Payment.status = paid
            → Reservation.status = paid, is_paid = true
```

## 4. Enabling Test Mode (Recommended)

1. **Get test keys** — Stripe Dashboard → Developers → API keys → use **test** keys (`sk_test_...`, `pk_test_...`). Do **not** use live keys for the sandbox.
2. Set in `backend-laravel/.env`:
   ```
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. **Webhook relay** (local): install `stripe` CLI, then:
   ```
   stripe listen --forward-to localhost:8000/api/stripe/webhook
   ```
   The CLI prints a `whsec_...` — copy it into `STRIPE_WEBHOOK_SECRET`. (Used CLI authorization tied to the sandbox environment "Quvio · sandbox", account `acct_1TGRlB034q7CkYD6`.)
4. Restart `php artisan serve`, log in, open a listing not owned by you, choose dates, checkout with `4242 4242 4242 4242`.
5. Confirm `payments.status=paid` and `reservations.status=paid` after the webhook fires.

> Alert condition (delivery off): Checkout sessions succeed but the SPA **success page** won't reflect changes until the webhook lands. `stripe listen` is the local single-dev setup; use a registered endpoint in production.

## 5. Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/listings/{id}/checkout` | Yes | Create session + payment/reservation rows; returns checkout_url |
| POST | `/api/stripe/webhook` | No (signature) | Mark payment + reservation paid |
| GET | `/api/payments` | Yes | Caller's payments |
| GET | `/api/payments/earnings` | Yes | Paid payments on the owner's listings |

## 6. Webhook Details

- Reads raw body + `Stripe-Signature` header.
- `Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret)`; bad signature → `400 { "message": "Invalid signature" }`.
- Handles `checkout.session.completed` **only when** `session.payment_status === 'paid'`.
- Locates the matching `payments` row by `stripe_session_id`; sets `status=paid`, records `stripe_payment_intent_id`, marks `reservation` paid.

## 7. Notes & Known Issues

- **Currency**: checkout uses `usd`; UI shows MAD (see `KNOWN_LIMITATIONS.md`). Prices are passed as `unit_amount = price*100` (minor units) — fractional MAD prices will be rounded.
- **Metadata**: session carries `listing_id`, `reservation_id`, `user_id` for reconciliation (used by webhook look-up).
- **No auto-refund / dispute handling** yet — roadmapping on `ROADMAP.md`.
- **No email** is sent on payment success/failure (see `EMAILS.md`).
- Errors are user-friendly: self-booking → 422; missing keys → 503 with actionable text.