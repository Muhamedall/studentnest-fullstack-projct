# Architecture

Companion doc to the project README. Describes how the two applications are structured and how data flows end-to-end.

## 1. System Overview

StudentNest is a two-process full-stack application:

- **React SPA** (`frontend-react/`) — user interface. Runs on Vite dev server (`:3000`) or as a static build (`dist/`).
- **Laravel REST API** (`backend-laravel/`) — data + business logic. Runs on `artisan serve` (`:8000`) or the Docker nginx+php-fpm image.

They communicate exclusively over HTTP/JSON. There is no server-side rendering and no shared process.

## 2. Runtime Topology

```
┌──────────────────────────────┐
│       Browser (SPA :3000)    │
│  React 18 + Redux Toolkit    │
│  react-router Single Page    │
└──────────────┬───────────────┘
               │ axios
               │ Authorization: Bearer <sanctum token>
               │ Origin: http://localhost:3000
               ▼
┌──────────────────────────────┐
│   Laravel API (:8000)        │
│  routes/api.php              │
│  middleware: api→ sanctum,   │
│             HandleCors(CORS) │
│  Controllers → Eloquent      │
└──────┬───────────────┬───────┘
       │               │ (rates/throttle)
       ▼               ▼
   Database       Stripe (Checkout)
  sqlite/pgsql    signature-verified webhook
```

Flow of a booking:

1. User opens a listing (`GET /api/dataListings/{title}`).
2. User picks a date range, checks out → `POST /api/listings/{id}/checkout`.
3. Backend creates a pending `Reservation` + `Payment`, calls Stripe to create a Checkout Session, returns `checkout_url`.
4. Browser redirects to `checkout.stripe.com` (PCI-safe; card data never hits our server).
5. Stripe redirects back to `/payment/success` or `/payment/cancel` (SPA routes).
6. Stripe notifies `POST /api/stripe/webhook` (signature verified); backend flips `Payment.status ∈ pending→paid` and `Reservation.status → paid`, `is_paid → true`.

## 3. Backend Layers

```
routes/api.php                    ← routing (auth:sanctum group + public)
  └─ app/Http/Controllers/*        ← request validation + use-cases
       └─ app/Models/*              ← Eloquent, $fillable + $casts
            └─ database/migrations  ← schema
config/  laravel + custom (cors, sanctum, services(stripe)) 
app/Http/Middleware  (HandleCors, auth:sanctum via package)
app/Providers/AppServiceProvider (rate-limiters, etc.)
```

### Controllers → responsibilities

| Controller | Methods | Owns |
|------------|---------|------|
| `UserController` | `store` (register), `login`, `logout`, `updateProfile`, `updatePassword` | `users` |
| `ListingController` | `index`, `show`, `store`, `update`, `destroy`, `myListings` | `listings` |
| `CommentController` | `index` (nested replies), `store` | `comments` |
| `RatingController` | `index`, `store` (upsert, 1–5) | `ratings` |
| `WishlistController` | `index`, `store`, `destroy` | `wishlists` |
| `ReservationController` | `store`, `index`, `myReservations` | `reservations` |
| `PaymentController` | `checkout`, `webhook`, `index`, `earnings` | `payments`, Stripe |
| `MessageController` | `index` (conversations), `show`, `store` | `messages` |
| `DashboardController` | `stats` (aggregates for signed-in user) | reads all |

## 4. Frontend Layers

```
src/main.jsx → <App/>
  App.props: <BrowserRouter>
    <Navbar/> (global)
    <Routes> → pages
       public: Homme, DetailesListing, Login, Singup, Nopages, HelpCenter, PaymentSuccess, PaymentCancel
       protected (ProtectedRoute): Account, ManageListing, AddListing, Dashboard, Wishlest, Messages
  components/Redux/
    usersSlice     → auth state (token, user, isLoggedIn) persisted (localStorage)
    navbarSlice    → mobile menu state
    wishlestSlice  → wishlist thunks (API-backed) + count
  api/api.js      → axios instance, Attach-Token interceptor, STORAGE_URL export
  utils/formatPrice.js
```

### Page → API map

| Page | API calls |
|------|-----------|
| Home `Homme` | `GET /api/dataListings`, `GET /api/listings/{id}/ratings` |
| Listing detail `DetailesListing` | `GET /api/dataListings/{title}`, `GET/POST /api/listings/{id}/comments`, `GET/POST /api/listings/{id}/ratings`, `POST /api/listings/{id}/reservations`, `POST /api/listings/{id}/checkout` |
| Login | `POST /api/login` → stores token+user |
| Singup | `POST /api/register` (multipart incl. `profile_image`) |
| Account | `PUT /api/user/profile`, `PUT /api/user/password`, `GET /api/payments` |
| ManageListings | `GET /api/my-listings`, `PUT/DELETE /api/listings/{id}` |
| AddListing | `POST /api/listings` (multipart images) |
| EditListing | `PUT /api/listings/{id}` |
| Dashboard | `GET /api/dashboard-stats` |
| Wishlest | `GET/POST/DELETE /api/wishlist` |
| Messages | `GET /api/messages`, `GET /api/messages/{userId}`, `POST /api/messages` |
| HelpCenter | `POST /api/messages` (radios → receiver 1) |
| PaymentSuccess/Cancel | none (landing pages) |

## 5. Auth Flow

- Register → backend hashes password (`$casts['password'=>'hashed']`) and returns user 201.
- Login → `Auth::attempt` → issues a Sanctum personal-access token (`createToken('authToken')`), returns `{ user, token }`.
- SPA stores `{ token, user, isLoggedIn }` in localStorage (usersSlice) and attaches `Bearer <token>` via axios interceptor.
- Logout → `POST /api/logout` deletes all user tokens.
- Protected routes render via `ProtectedRoute` component (redirect to `/` if `isLoggedIn !== true`).
- Token TTL: **7 days** (`config/sanctum.php`, `expiration = 10080` min). Login/register throttled 5/min per email+IP.

## 6. CORS & Security Border

- `config/cors.php`: `paths = ['api/*', 'sanctum/csrf-cookie']`, `allowed_origins = [FRONTEND_URL]`. Laravel's `HandleCors` applies to `api/*`.
- All mutating routes except `login/register/webhook` sit behind `auth:sanctum`.
- The Stripe webhook is **unauthenticated by design** — protected by signature verification (`Stripe\Webhook::constructEvent`) using `STRIPE_WEBHOOK_SECRET`; returns 400 on bad signature, 503 if not configured.

## 7. Data Model (high level)

```
users 1──────< listings       (owner)
users 1──────< reservations  (student)
users 1──────< wishlists
users 1──────< comments      replies via comments.parent_id → comments.id
users 1──────< ratings       (unique listing+user)
users 1──────< payments      (student who paid)
users 1──────< messages      (sender/receiver pair + optional listing)
listing 1───< reservations / comments / ratings / wishlists / payments / messages.listing_id
reservation 1───< payments.reservation_id (nullable)
payment ──> stripe_session_id (Checkout Session) / stripe_payment_intent_id
```

## 8. Warning: `comments.parent_id` & nested replies

`comments` gained `parent_id` (nullable, self-FK with cascade). `CommentController@index` builds nested replies per listing; frontend `DetailesListing` and `ViewComments` render threaded replies. SQLite/FK note: the self-FK was added in a **separate** migration (`2026_09_17_000005_add_parent_id_to_comments_table`), so `migrate` (not only `migrate:fresh`) applies cleanly to existing DBs.

## 9. Config-driven knobs

| Config | Where | Meaning |
|--------|-------|---------|
| Stripe keys/URLs | `config/services.php → stripe` | `services.stripe.key/secret/webhook_secret`, success/cancel URL built from `FRONTEND_URL` |
| CORS | `config/cors.php` | allowed origins for `api/*` |
| Token TTL | `config/sanctum.php` | 10080 min |
| Rate limit | `AppServiceProvider::boot()` | `RateLimiter 'auth'` (login/register 5/min) |
| DB | `config/database.php` | sqlite/pgsql |

## 10. Known Trade-offs / Deviations

- **Currency mismatch**: listings and dashboards are labelled **MAD**, but Stripe checkout charges **USD** (`PaymentController::checkout`, `currency => 'usd'`). Documented; rigged for demo (see `KNOWN_LIMITATIONS.md`).
- Support form hardcodes receiver (`HelpCenter → POST /api/messages` to receiver 1). Not yet configurable.
- No realtime (polling/pull-to-refresh only); no queues/jobs; no email/notifications.
- Frontend chunks > 500 kB (React + FontAwesome) — build warning only.