# TODO / Decisions Pending

This file tracks items that **cannot be completed automatically**, **require a business/product decision**, or **need real external credentials**. Revisit at the end of the maintenance pass.

## Settled during the maintenance pass (Phases 2–8, 2026-09-17)

| # | Item | Outcome |
|---|------|---------|
| 1 | Email verification enforcement (`MustVerifyEmail`) | **Not enforced** (deferred) — no SMTP available; would lock new users out |
| 2 | Fake payment form in `DetailesListing.jsx` | **Superseded** — replaced with real Stripe Checkout (test mode). Remaining work = set sandbox keys (`docs/PAYMENTS.md`) |
| 4 | MySQL availability for local run | **SQLite approved** for local dev/test (reversible override); PostgreSQL remains the prod profile |
| 5 | "Forgot Password?" facebook links | **Fixed** — dead link dropped; Sign up now opens the real form |
| 6 | Reservations business rules | See below — partially: reservation → Stripe payment → paid status now works; **owner confirmation & refunds still undecided** |
| 7 | `Etudiant` parallel table | **Removed** in Phase 5 (verified no references) |
| 8 | Navbar search | **Wired** — single input filters listings by title+location via `/?search=` |

## Still open — need product decision or external credentials

| # | Item | Why blocked | Suggested decision |
|---|------|-------------|--------------------|
| 3 | Real email sending (SMTP) | `.env` MAIL_HOST=mailpit (dev container hostname) — no real mail credentials. Booking/payment receipts + password reset cannot go out today. | Provide real SMTP creds or a transactional provider (Mailgun/SES/Resend); wire Mailable on `checkout.session.completed` |
| 6b | Reservation confirmation flow | Who confirms a reservation (owner accept/decline)? What happens to a cancelled/unpaid booking? Refund policy? | Product owner to define statuses & confirmation; implement `confirmed/rejected/cancelled` + Stripe refund events |
| 9 | File/image storage backend | Currently local `storage/app/public` via symlink. Production needs object storage. | Choose S3/CDN provider; provide credentials; switch `FILESYSTEM_DISK` |
| 10 | **Stripe live/sandbox keys** | `STRIPE_KEY`/`STRIPE_SECRET`/`STRIPE_WEBHOOK_SECRET` empty → checkout 503s with clear message; webhook never fires without `STRIPE_WEBHOOK_SECRET` + `stripe listen` | Put sandbox (test) keys in local `.env`; register a webhook endpoint in Stripe Dashboard for prod |
| 11 | Help Center receiver | Contact form posts to hardcoded `receiver_id = 1` | Make configurable (env variable or role-based support inbox) |
| 12 | Currency unification | UI labels **MAD**; Stripe checkout charges **USD** (`unit_amount = price*100`) | Decide: price in USD, or convert MAD→USD at checkout (needs FX source or fixed rate) |
| 13 | Frontend test runner | No test script (only lint/build) — regressions invisible | Add Vitest + React Testing Library for slices/util/route-guard logic |
| 14 | GDPR / consent / retention | No consent flows, privacy policy, or data-export/delete for real users | Add before on-boarding real student data |

## References

- `MAINTENANCE_PROGRESS.md` — full audit/fix log with severity legend (Phases 1–8).
- `docs/PAYMENTS.md` — how to enable Stripe test mode (keys, `stripe listen`, test card).
- `docs/KNOWN_LIMITATIONS.md` / `docs/ROADMAP.md` — larger feature backlog.