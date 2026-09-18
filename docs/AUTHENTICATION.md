# Authentication

StudentNest uses **Laravel Sanctum** (token-based) for the SPA→API auth. There is no session cookie flow on the frontend (Breeze session auth exists but is unused by the React app).

## 1. How It Works

1. **Register** → `POST /api/register` → backend validates + hashes password (`users.password` via `$casts['password' => 'hashed']`), returns the created user with **201** (no token issued on register).
2. **Login** → `POST /api/login` with `email`/`password` → `Auth::attempt` → on success issues a Sanctum personal access token (`createToken('authToken')`) and returns:
   ```json
   { "user": { "id": 11, "name": "...", "email": "...", ... },
     "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
   ```
3. **Attach** — the SPA stores `{ token, user, isLoggedIn }` in `localStorage` (via `usersSlice`), and the axios interceptor in `src/api/api.js` adds `Authorization: Bearer <token>` to every request.
4. **Logout** → `POST /api/logout` deletes all tokens for the user and clears client state.

## 2. Token Properties

- TTL: **7 days** (`config/sanctum.php` `expiration => 10080`). After expiry the API returns **401** and the SPA redirects to the login/signup flow.
- Bearer format: `<id>|<plaintextToken>` (single value string).
- On logout, **all** of the user's tokens are deleted (`tokens()->delete()`).

## 3. Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/login` | No | Login, returns user + bearer token |
| POST | `/api/register` | No | Create account (no token) |
| POST | `/api/logout` | Yes | Revoke all tokens |
| GET | `/api/user` | Yes | Current user profile |
| PUT | `/api/user/profile` | Yes | Update name/email/city/DOB/profile_image |
| PUT | `/api/user/password` | Yes | Change password (requires `current_password`) |

## 4. Profile & Password Rules

- `updateProfile`: `name`, `email` (unique, excluding self), `city`, `dateOfBirth`, `profile_image` (image ≤ 2MB). Profile image stored under `public/profile_images/`.
- `updatePassword`: requires `current_password` (validated against the DB hash); wrong current password → **422** `{ message: "The current password is incorrect." }`. New password min 8 chars + `confirmed`.

## 5. Security Hardening Applied (Phase 3)

- **Token expiry** enforced (7 days; formally `null` = never).
- **Rate limiting**: login/register → 5 attempts/minute per email+IP (`RateLimiter` registered in `AppServiceProvider`), applied via the `throttle:auth` middleware on those two routes only.
- **CORS**: only `FRONTEND_URL` is an allowed origin for `api/*` (custom wildcard middleware removed).
- No session cookies involved; the SPA never sets credentials on cross-origin requests.

## 6. Frontend Contract

- `src/components/Redux/usersSlice.js` — `setUser`, `setToken`, `clearUser` actions; persistence to `localStorage`.
- `ProtectedRoute.jsx` — wraps routes that require login; renders `<Navigate to="/" />` if `isLoggedIn !== true`.
- Protected SPA routes: `Account`, `ManageListing`, `AddListing`, `Dashboard`, `Wishlest`, `Messages`. `DetailesListing` is public but reservation/checkout actions require login (redirect handled in-app).

## 7. Known Gaps / Decisions

- **Email verification** is not enforced (routes exist, `MustVerifyEmail` NOT implemented on `User`). Requires SMTP + product decision — see `TODO_REMAINING.md` #1.
- No password-reset UI on the SPA (backend Breeze reset routes exist but are not exposed via the API; `forgot password` link was removed since no SMTP).
- Frontend has no token-refresh mechanism beyond re-login (in scope only if tokens are shortened or SPA sessions grow).