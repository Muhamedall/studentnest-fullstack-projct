# Emails & Notifications

## Status: NO EMAIL/NOTIFICATION SYSTEM IMPLEMENTED

There is **no** mail sending, notification, or queued-job layer in this project at this time. Verified facts:

- `composer.json` includes no mailer package beyond Laravel's own `laravel/framework` (default SMTP transport exists but nothing dispatches mail).
- No `Mail`/`Mailable`/`Notification`/`Event`/`Job` classes in `app/`.
- `QUEUE_CONNECTION=sync` everywhere; no workers/queues jobs are dispatched.
- The frontend has no notification/inbox concepts — in-app "messages" are stored in the `messages` table and rendered via the Messages page (not email).

## What .env has (but is unused)

`.env.example` ships standard Laravel mail placeholders:

```
MAIL_MAILER=smtp
MAIL_HOST=mailpit        # local container hostname (mailpit dev captivity)
MAIL_PORT=1025
MAIL_FROM_ADDRESS="hello@example.com"
```

These are inert: nothing reads them in app logic today.

## What this means for users & product owners

1. Users get **no welcome, booking-confirmation, payment-receipt, or admin-alert email**.
2. Password reset API exists (Breeze) but cannot send mail; the SPA has no reset UI.
3. Email verification (MustVerifyEmail) is present but **not enforced** — enforcing it without SMTP would lock every new user out (see `TODO_REMAINING.md` #1, #3).

## To enable (roadmap / TODO_REMAINING #3)

- Provide real SMTP creds **or** a transactional provider (Mailgun/SES/Resend) in `.env`.
- Add: booking confirmation + payment receipt on `checkout.session.completed`; password-reset mail; option for account-verification mail.

Recommended order: see `ROADMAP.md` (item R3) and `KNOWN_LIMITATIONS.md` (L2).