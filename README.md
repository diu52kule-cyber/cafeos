# RAASTA Scan-to-Order Frontend

Premium mobile-first hospitality web app prototype for **RAASTA - Dharampeth, Nagpur**. This is now a frontend-only static project for Vercel deployment.

The app simulates:

- QR table onboarding
- Temporary table session UI
- Group ordering and join approval
- Digital menu browsing
- Item customization
- Shared cart review
- Order confirmation and status tracking
- Time-based ambience switching

## Project Structure

```text
.
+-- index.html
+-- config.js
+-- styles.css
+-- app.js
+-- vercel.json
+-- package.json
+-- assets/
|   +-- raasta-logo-source.png
|   +-- rooftop-sunset.png
|   +-- lounge-led.png
|   +-- banquette-art.png
|   +-- led-interior.png
|   +-- rooftop-bar.png
|   +-- skydeck-night.png
+-- qa-entry.png
+-- qa-menu-cart.png
+-- qa-confirmation.png
```

## Run Locally

No build step is required. You can run it with any static file server.

Option 1, Python:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/index.html
```

Option 2, npm:

```powershell
npm run dev
```

## Deploy On Vercel

This project is ready to deploy as a static frontend.

### Vercel Settings

Use these settings in Vercel:

```text
Framework Preset: Other
Build Command: leave empty, or use npm run build
Output Directory: .
Install Command: npm install
```

The included `vercel.json` supports QR-style routes:

```text
/t/R07
/table/R07
```

Both routes rewrite to `index.html`, so the frontend can read table IDs later without needing a backend route.

## Backend Data Mode

The app JavaScript now expects backend APIs. Menu, session, cart, join approval, and order submission are no longer hardcoded in the browser.

Set your backend URL in:

```text
config.js
```

Example:

```js
window.RAASTA_CONFIG = {
  API_BASE_URL: "https://your-railway-backend.up.railway.app"
};
```

For local testing with the backend on the same origin, keep it empty:

```js
window.RAASTA_CONFIG = {
  API_BASE_URL: ""
};
```

The browser can also override this without editing files:

```js
localStorage.setItem("RAASTA_API_BASE_URL", "https://your-backend-url")
```

Required backend endpoints:

```text
GET  /api/menu?period=evening
POST /api/sessions/start
GET  /api/sessions/:sessionId
GET  /api/sessions/:sessionId/cart
POST /api/sessions/:sessionId/cart/items
POST /api/sessions/:sessionId/orders
POST /api/sessions/:sessionId/join-request/:requestId/approve
```

## Backend API Contract

The frontend expects these backend response shapes.

Required integration points:

- Load menu from `GET /api/menu`
- Start QR session with `POST /api/sessions/start`
- Join a table with `POST /api/sessions/:sessionId/join-request`
- Add cart items with `POST /api/sessions/:sessionId/cart/items`
- Submit order with `POST /api/sessions/:sessionId/orders`
- Track order status with WebSocket or polling

Recommended production backend:

- Node.js, Express, NestJS, FastAPI, or Django
- PostgreSQL for sessions, menu, orders, and billing
- Redis for live table sessions
- WebSocket or Socket.IO for group ordering updates
- POS/KDS integration for kitchen routing
- Payment gateway integration if in-app payment is required

## Frontend Files

### `index.html`

Contains the app shell and all main interface sections:

- Splash/loading screen
- Scan-to-order entry screen
- Table session view
- Menu section
- Shared cart
- Item customization bottom sheet
- Order confirmation

### `styles.css`

Contains the full premium hospitality visual system:

- Matte black and deep charcoal base
- Warm gold and amber accents
- Rooftop image backgrounds
- Glassmorphism panels
- Mobile-first layout
- Sticky category navigation
- Bottom sheet styling
- Responsive desktop layout

### `app.js`

Contains frontend interaction logic that calls the backend:

- Fetches live menu data from the backend
- Starts QR table sessions through the backend
- Reads guests and pending joins from the backend
- Adds cart items through the backend
- Submits orders through the backend
- Renders item customization from backend modifier groups
- Keeps only temporary UI state in the browser

## QA Screenshots

Rendered verification screenshots are included:

- `qa-entry.png`
- `qa-menu-cart.png`
- `qa-confirmation.png`

## Notes

This is intentionally frontend-only for Vercel. There is no bundled server or database in this version, so `config.js` must point to a separate backend for the app to be fully usable.
