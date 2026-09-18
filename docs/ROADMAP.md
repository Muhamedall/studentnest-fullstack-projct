# Roadmap

Suggested order by value/effort. Labels: **(P)** payments, **(A)** availability/auth, **(S)** security, **(I)** infra, **(F)** feature.

## Short-term (next sprint)

| # | Item | Why | Notes |
|---|------|-----|-------|
| R1 | Set real Stripe sandbox keys + verify end-to-end checkout webhook | Unblock payments demo | See `PAYMENTS.md` |
| R2 | Cross-check payments in the Dashboard (revenue shows MAD but USD charged) | Currency consistency | See R7 |
| R3 | Add booking + payment confirmation emails | Users currently get nothing | Needs SMTP (TODO #3) |
| R4 | Make Help Center recipient configurable (env/role-based) | Support form hardcodes receiver 1 | Small API change |
| R5 | Add tests for Stripe webhook (signature, replay, idempotency) | Payment path unverified by CI | `PaymentController@webhook` |

## Medium-term

| # | Item | Why | Notes |
|---|------|-----|-------|
| R6 | Move images to object storage (S3) + signed URLs | Local disk not durable (TODO #9) | `FilesystemDisk` change + migration |
| R7 | Unify pricing/currency (pick MAD or USD; convert at checkout) | Eliminate USD-vs-MAD mismatch | Config-level units, conversion service |
| R8 | Laravel 10 → 12 upgrade | Clears framework advisories (SECURITY S4) | 2-major migration; big but bounded |
| R9 | Refunds / cancellation policy + webhook handlers | Only `checkout.session.completed` handled | Stripe `refund` events + statuses |
| R10 | PostgreSQL parity tests (run suite against Postgres) | SQLite differs subtly | Add a CI job using `pgsql` |

## Longer-term (product)

| # | Item | Why | Notes |
|---|------|-----|-------|
| R11 | Real multi-role support inbox (owner/student/admin) | Current HelpCenter is a direct message to user 1 | Extend `messages` with roles/assignees |
| R12 | Realtime message/notification delivery (polling → websockets) | Better UX | Laravel Broadcast/Pusher or SSE |
| R13 | Stable listing slugs (SEO) | `dataListings/{title}` is collision-prone | Add `slug` column + lookup by slug |
| R14 | GDPR / consent / data retention | Before real user data | Privacy policy, consent checkbox, export/delete |
| R15 | Reservation confirmation flow (owner accept/decline) | Business rule (TODO #6) | Statuses: pending → confirmed/rejected/cancelled |
| R16 | Deposit / per-month billing | Richer monetization | Extends R9 |

## Cross-cutting

- **Testing**: add Vitest + React Testing Library for reducer/util/route-guard logic (`TESTING.md` §4).
- **CI**: lint + build + `php artisan test` gate on push; add `composer audit`/`npm audit` fail-on-vulnerability stage.
- **Observability**: structured logs for payments + profile changes (SECURITY S7), error tracking (Sentry).
- **Monitoring**: uptime + migration health check via `/healthz`.