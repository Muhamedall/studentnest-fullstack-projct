# TODO / Decisions Pending

This file tracks items that **cannot be completed automatically**, **require a business/product decision**, or **need real external credentials**. Revisit at the end of the maintenance pass.

| # | Item | Why blocked | Suggested decision |
|---|------|-------------|--------------------|
| 1 | Email verification enforcement (`MustVerifyEmail`) | Product decision: should users be forced to verify email before using the platform? | If yes, implement flow; if no, leave unenforced (document this). |
| 2 | Payment flow (`DetailesListing.jsx` fake payment modal) | Requires a real payment provider, PCI compliance, business rules (deposit, per-month billing, refunds). Not something to invent. | Remove the fake collection form now; add a placeholder "reserve" action gated on real requirements. |
| 3 | Email sending (SMTP) | `.env` MAIL_HOST=mailpit (dev container hostname) — no real mail credentials. | Provide real SMTP creds or use a transactional provider (Mailgun/SES/Resend). |
| 4 | MySQL availability for local run | No MySQL/MariaDB installed locally; Docker daemon not running. | Install MySQL locally, start Docker, or approve switching dev/test to SQLite. |
| 5 | "Forgot Password?" links pointing to facebook.com | Feature (backend password reset routes exist) never wired to frontend. | Decide whether to build a reset-UI flow on the SPA or drop the links. |
| 6 | Reservations business rules | Is a reservation a booking request, a confirmed contract, or just an inquiry? Who confirms it? | Product owner to define flow, statuses, and confirmation behavior. |
| 7 | `Etudiant` parallel table | Legacy/duplicate user table. Remove if truly obsolete; keep if historic data needed. | Confirm no external dependency on it, then remove or freeze. |
| 8 | Search functionality in Navbar | Intended scope of search (title only? location? filters?) | Product decision; wire to API or local filter once defined. |
| 9 | File/image storage backend | Currently local `storage/app/public` via symlink. Production needs S3/CDN. | Choose object storage provider; provide credentials. |