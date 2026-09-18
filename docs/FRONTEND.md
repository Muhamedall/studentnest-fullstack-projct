# Frontend

Stack: **React 18.2.0 + Vite 8.3.0 + react-router 7.18.4 + Redux Toolkit 2.2.3 + Tailwind CSS 3.4.3 + axios**. Located in `frontend-react/`.

## 1. Scripts

| Script | Command | Notes |
|--------|---------|-------|
| dev | `npm run dev` | Vite dev server, port 3000 (3001 if busy) |
| build | `npm run build` | Production build → `dist/` |
| lint | `npm run lint` | ESLint (`.eslintrc.cjs`), 0 warnings allowed |
| preview | `npm run preview` | Serve the production build |

Frontend has **no test runner** configured (`package.json` has no test script).

## 2. Directory Layout

```
src/
├── main.jsx                     React entry → mounts <App/>
├── App.jsx                      Router + <Navbar/> + <Routes>
├── api/api.js                   axios client, Bearer-token interceptor, STORAGE_URL export
├── components/
│   ├── Homme.jsx                Home: listing grid, search (uses useSearchParams)
│   ├── DetailesListing.jsx      Listing detail: images swiper, comments(+replies), ratings, booking/checkout
│   ├── Wishlest.jsx             Wishlist page
│   ├── Messages.jsx             In-app conversations (GET /api/messages..., ?user=)
│   ├── HelpCenter.jsx           FAQ + contact form (→ POST /api/messages, receiver 1)
│   ├── PaymentSuccess.jsx       Post-checkout landing (route payment/success)
│   ├── PaymentCancel.jsx        Post-checkout cancel landing (route payment/cancel)
│   ├── ProtectedRoute.jsx       Requires isLoggedIn → redirect to /
│   ├── NoPages.jsx              404 page
│   ├── Forms/Login.jsx Singup.jsx
│   ├── listings/                Dashboard, ManageListings, AddListing, EditListing, ViewReservations, ViewComments
│   ├── NavBar/Navbar.jsx        Single search input → /?search=...
│   └── Redux/
│       ├── store/store.js       Redux store
│       ├── usersSlice.js        auth state persisted to localStorage
│       ├── navbarSlice.js       mobile menu state
│       └── wishlestSlice.js     async wishlist thunks (API-backed) + count
└── utils/formatPrice.js         prices (MAD) formatting
```

## 3. Routes (`App.jsx`)

| Route | Element | Auth |
|-------|---------|------|
| `/` | HommePage | Public |
| `Login` | Login | Public |
| `Singup` | Singup | Public |
| `Account` | Account | Protected |
| `ManageListing` | ManageListings | Protected |
| `DetailesListing/:title` | DetailesListing | Public (book/checkout requires login) |
| `AddListing` | AddListing | Protected |
| `Dashboard` | Dashboard | Protected |
| `Wishlest` | Wishlest | Protected |
| `Messages` | Messages | Protected |
| `HelpCenter` | HelpCenter | Public |
| `payment/success` | PaymentSuccess | Public |
| `payment/cancel` | PaymentCancel | Public |
| `*` | NoPages | Public |

## 4. State (Redux Slices)

- **usersSlice** — `isLoggedIn`, `user`, `token`; actions `setUser`/`setToken`/`clearUser`; persisted to `localStorage` so a refresh keeps the session. Used by login/singup/logout and `ProtectedRoute`.
- **wishlestSlice** — server-backed wishlist: `fetchWishlist`, `addWishlistItem`, `removeWishlistItem` hitting `GET/POST/DELETE /api/wishlist`; exposes `numberFavories` for the navbar badge (note: treat count as a number, not an array).
- **navbarSlice** — mobile sidebar open/close.

Axios (`api/api.js`):
- baseURL: `import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"`.
- Request interceptor adds `Authorization: Bearer <token>` from localStorage when present.
- Exports `STORAGE_URL` (`<backend>/storage/`) for asset URLs.

## 5. Featured Behaviors (Phase 8 additions)

- **Search**: Navbar has a single text input. Submitting navigates to `/?search=<q>`; `Homme` reads the param via `useSearchParams` and filters listings by **title + location**, showing a "Results for ..." header and empty state.
- **Ratings**: `DetailesListing` shows average/count and lets the signed-in user rate 1–5 (`GET/POST /api/listings/{id}/ratings`).
- **Comments with replies**: threaded via `parent_id`; `ViewComments` renders `replies`.
- **Reservations + checkout**: inline date-range picker → `POST /api/listings/{id}/reservations`, then redirect to Stripe checkout URL or show an error (incl. self-booking 422 and 503 "Stripe not configured").
- **Dashboard stats**: stat cards powered by `GET /api/dashboard-stats` (emphasized metrics; responsive mobile grid).
- **Account**: tabs for Personal info, Login & security, Payments & reservations (avatar via `STORAGE_URL`).
- **Performance**: images use `loading="lazy"` + `decoding="async"` on grid/detail/wishlist cards (dev serving is slow ±600ms; lazily loading large galleried cards helps a lot).

## 6. Conventions & Gotchas

- ESLint enforces prop-types (`npm run lint` must pass with `--max-warnings 0`).
- Prices: `formatPrice(price)` → integer never shows decimals; UI appends `MAD`.
- `react-router` (v7) — import from `react-router`, not `react-router-dom` (uninstalled).
- Swiper v14: import `Navigation/Pagination/Keyboard/Mousewheel` from `swiper/modules`; pass via `modules` prop.
- `date-fns` is a declared dependency (used by Singup's date picker).
- Dev-server slow images → prefer `loading="lazy"`.
- ProtectedRoute component redirects to `/` (not a login page) when logged out.

## 7. Build Notes

- `vite.config.js`: `plugins: [react()]`, `postcss.config.js` already contains tailwindcss+autoprefixer (no inline `css.postcss` duplication).
- Bundle > 500 kB warning (React + FontAwesome) is benign; consider code-splitting if it matters.
- `index.html` title is `StudentNest` with a local favicon (the `/vite.svg` reference was removed).