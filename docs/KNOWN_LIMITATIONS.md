# Known Limitations

Honest inventory of what the project does **not** do yet, plus the reasons. Grouped by impact. Items tagged `(TODO)` appear in `TODO_REMAINING.md`; items tagged `(ROADMAP)` appear in `ROADMAP.md`.

## Payments

| Limitation | Detail | Reason / Fix |
|------------|--------|--------------|
| **Test mode only** | `STRIPE_KEY`/`STRIPE_SECRET`/`STRIPE_WEBHOOK_SECRET` are empty in the repo; checkout returns 503 until set | Sandbox env (`Quvio · sandbox`) has keys dropped in locally, not committed. See `PAYMENTS.md`. |
| **USD vs MAD mismatch** | Checkout charges `usd` (`unit_amount = price*100`), UI shows MAD | Prices entered in MAD; would need a currency decision (unify or convert). (ROADMAP R7) |
| **No refunds / disputes** | Only `checkout.session.completed` handled; no cancellation/refund webhooks | Out of scope for demo. (ROADMAP R9) |
| **No payment emails** | No receipt/confirmation email | No email system (below). |
| **Webhook untested by PHPUnit** | Verified manually only | Add integration tests (SECURITY S5). |

## Email / Notifications

| Limitation | Detail | Reason |
|------------|--------|--------|
| **No email** | No mailable/notification/job code exists; `MAIL_*` in `.env.example` is inert | No SMTP provider; queue sync. (TODO #3) |
| **No email verification** | `MustVerifyEmail` not on `User`; routes exist but unused | Enforcing without SMTP would lock new users out. (TODO #1) |
| **No password-reset UI** | SPA has no reset flow (backend Breeze reset routes exist) | Requires SMTP + UI; facebook placeholder link was removed. (TODO #5 settled: link dropped) |

## Messaging / Support

| Limitation | Detail | Reason / Fix |
|------------|--------|--------------|
| **Help Center receiver hardcoded** | Contact form posts to `receiver_id = 1` | Product choice; make configurable + role-based. (KNOWN/ROADMAP R11) |
| **No realtime** | Message threads require manual refresh | No websockets/polling layer. (ROADMAP R12) |
| **Read receipts = basic** | `read_at` set when the thread is opened | Sufficient for demo. |

## Data / Deployment

| Limitation | Detail | Reason / Fix |
|------------|--------|--------------|
| **Images on local disk** | `storage/app/public` via symlink | Production needs object storage (S3/CDN). (TODO #9, ROADMAP R6) |
| **`dataListings/{title}` lookup by non-unique title** | Non-deterministic if titles repeat | Prefer slug/id. (TODO notes, ROADMAP R13) |
| **SQLite for tests** | In-memory SQLite; Postgres prod | Parities mostly fine; exotic SQL may diverge. (ROADMAP R10) |
| **Frontend bundle > 500 kB** | React + FontAwesome | Build warning only; code-split if needed. |
| **No jobs/queues** | `QUEUE_CONNECTION=sync` | Nothing to dispatch yet; revisit with emails. |

## Product / Business Rules

| Limitation | Detail | Need |
|------------|--------|------|
| **Reservation flow undefined long-term** | Currently: request → (owner books) → Stripe payment → paid. Who confirms & refund rules? | Product decision (TODO #6). |
| **Single-currency, single-region pricing model** | MAD labels, USD checkout, no deposits / per-month billing | Beyond demo scope. |
| **GDPR/cookie/consent** | No consent flows or data-retention rules | Needed before real user data. (ROADMAP R14) |

## Framework / Security (accepted risk)

| Limitation | Detail | Status |
|------------|--------|--------|
| Laravel pinned to 10.49.1 | Known signed-URL + CRLF-email-rule advisories (no real impact here); fix = Laravel 12 | DEFERRED (SECURITY S4) |
| Symfony/league/commonmark/psysh residual composer advisories | Not exploitable in-app surface | Track with `composer audit` |
| Frontend no tests | Lint + build only | Add Vitest+RTL (TESTING §4) |

## What IS Covered (don't forget)

Search by title+location, threaded comments, 1–5 ratings (one per user), wishlist, reservations with date validation, Stripe checkout + verified webhook, payments/earnings, messages with unread counts, dashboard stats, profile/password management, help center, payment success/cancel pages, protected routes, rate-limited login, best-effort images (lazy-loading).