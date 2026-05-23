# RAASTA Scan-to-Order Rooftop UI

Premium mobile-first hospitality web app prototype for **RAASTA - Dharampeth, Nagpur**. The current code is a static frontend prototype that simulates the scan-to-order journey, group ordering, menu browsing, item customization, cart review, and order status tracking.

## Project Structure

```text
.
+-- index.html
+-- styles.css
+-- app.js
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

This app is plain HTML, CSS, and JavaScript. No build step is required.

```powershell
cd C:\Users\VISHWESH\Documents\Codex\2026-05-23\files-mentioned-by-the-user-screenshot
python -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/index.html
```

The prototype currently runs with mock in-browser state. Refreshing the page resets the session.

## Frontend Features Included

- QR-style table entry screen
- Table/zone session onboarding
- Guest name, optional phone, and pax count form
- Temporary shared table session UI
- Live guest avatars and pending join approval
- Time-based ambience switch: breakfast, evening, late night
- Sticky menu category tabs
- Premium menu item cards
- Veg/non-veg indicators
- Item customization bottom sheet
- Required and optional modifier UI
- Quantity controls
- Shared cart and split preview mode
- Kitchen notes
- Send order to kitchen CTA
- Order confirmation screen
- Animated status stages: received, preparing, ready, served

## Backend Goal

The backend should turn the static prototype into a live hospitality ordering system where multiple guests can scan the same table QR, join a temporary table session, collaboratively build an order, and send it to the kitchen or POS.

## Recommended Backend Stack

Any modern backend can support this product. A good production stack would be:

- **Node.js + Express/NestJS** or **Django/FastAPI**
- **PostgreSQL** for orders, menu, sessions, and audit history
- **Redis** for short-lived table sessions, join requests, and live cart cache
- **WebSocket / Socket.IO** for live table updates
- **Object storage/CDN** for menu item images
- **JWT or signed session tokens** for guest table access
- **POS/KDS integration layer** for kitchen order routing

## Core Backend Requirements

### 1. QR Table Session

Each QR code should contain a unique table reference.

Example QR URL:

```text
https://order.raasta.in/t/R07?zone=sky-terrace
```

Backend behavior:

- Validate `tableId` and `zoneId`
- Create a temporary table session if none exists
- Reuse the active session if the table is already live
- Expire sessions after checkout, manual close, or inactivity
- Prevent guests from joining closed sessions

### 2. Guest Session

Store lightweight guest identity for the table session.

Fields:

- Guest name
- Optional phone
- Pax count from first guest
- Guest initials/avatar color
- Device/session token
- Join approval state

Joining logic:

- First scanner becomes session host by default
- Additional scanners enter a pending state
- Host approves or rejects join request
- Approved guests can add items to the shared cart

### 3. Live Group Ordering

Backend must support collaborative cart updates.

Required behavior:

- Multiple guests can add items to one table cart
- Each cart item stores owner guest ID
- Cart total updates in real time
- Guests see who added each item
- Cart supports shared and split-bill views
- Cart changes broadcast to all approved guests

Use WebSocket events such as:

```text
session:joined
session:guest_pending
session:guest_approved
cart:item_added
cart:item_updated
cart:item_removed
cart:total_updated
order:submitted
order:status_changed
```

### 4. Digital Menu API

Menu must be time-aware and venue-aware.

Menu API should support:

- Categories
- Item availability
- Item images
- Prices
- Taxes/service charges
- Veg/non-veg flag
- Add-ons and modifiers
- Forced modifier groups
- Optional modifier groups
- Time-based menus

Example menus:

- Breakfast
- Lunch
- Evening cafe
- Night lounge

### 5. Item Modifiers

Backend should validate all modifiers before adding to cart.

Modifier group examples:

- Size selection, required, single choice
- Spice level, required or optional
- Extra cheese, optional
- Ice level, optional
- Beverage mixer, required for selected drinks
- Side dish, optional or required

Validation rules:

- Required groups must be selected
- Single-choice groups accept only one option
- Multi-choice groups respect min/max limits
- Disabled or unavailable modifiers cannot be submitted
- Final price is calculated server-side

### 6. Cart and Order Review

Backend must calculate totals server-side.

Cart calculations:

- Base item price
- Modifier price
- Quantity
- Taxes
- Service charge
- Discounts, if any
- Round-off rules
- Split preview by guest ownership

Never trust frontend totals for final order value.

### 7. Kitchen Order Submission

When the user taps **Send Order to Kitchen**, backend should:

- Lock submitted cart lines
- Create an order record
- Send order to POS/KDS/kitchen printer
- Keep session open for additional rounds if required
- Broadcast order status to all guests

Order stages:

```text
received
preparing
ready
served
cancelled
```

### 8. Table Session Lifecycle

Suggested lifecycle:

```text
created -> active -> ordering -> submitted -> serving -> bill_requested -> closed
```

Important rules:

- New orders can be added while session is active
- Closed sessions cannot accept new guests or orders
- Staff can force close or transfer a session
- Session history should remain available for billing and audit

## Suggested Database Tables

```text
venues
zones
tables
table_sessions
guests
join_requests
menu_categories
menu_items
modifier_groups
modifier_options
cart_items
cart_item_modifiers
orders
order_items
payments
staff_users
audit_logs
```

## Suggested API Endpoints

### Session

```http
POST /api/sessions/start
GET  /api/sessions/:sessionId
POST /api/sessions/:sessionId/join-request
POST /api/sessions/:sessionId/join-request/:requestId/approve
POST /api/sessions/:sessionId/join-request/:requestId/reject
POST /api/sessions/:sessionId/close
```

### Menu

```http
GET /api/menu?venueId=raasta-dharampeth&zoneId=sky-terrace&period=evening
GET /api/menu/items/:itemId
```

### Cart

```http
GET    /api/sessions/:sessionId/cart
POST   /api/sessions/:sessionId/cart/items
PATCH  /api/sessions/:sessionId/cart/items/:cartItemId
DELETE /api/sessions/:sessionId/cart/items/:cartItemId
```

### Orders

```http
POST /api/sessions/:sessionId/orders
GET  /api/orders/:orderId/status
POST /api/orders/:orderId/status
```

### Billing

```http
GET  /api/sessions/:sessionId/bill
POST /api/sessions/:sessionId/payment-intent
POST /api/sessions/:sessionId/payments/confirm
```

## Example Request Payloads

### Start Session

```json
{
  "tableId": "R07",
  "zoneId": "sky-terrace",
  "guest": {
    "name": "Vishwesh",
    "phone": "+919876543210",
    "pax": 4
  }
}
```

### Add Cart Item

```json
{
  "guestId": "guest_123",
  "menuItemId": "item_sunset_negroni",
  "quantity": 1,
  "modifiers": [
    {
      "groupId": "size",
      "optionId": "signature"
    },
    {
      "groupId": "addons",
      "optionId": "smoked_chilli_oil"
    }
  ],
  "note": "Less ice"
}
```

### Submit Order

```json
{
  "sessionId": "sess_123",
  "guestId": "guest_123",
  "cartItemIds": ["cart_1", "cart_2"],
  "kitchenNote": "Birthday table. Serve desserts with candle."
}
```

## Frontend Integration Notes

The current mock data lives in:

```text
app.js
```

Important frontend state to replace with backend calls:

- `menu` array: replace with `GET /api/menu`
- `state.guests`: replace with session guest data
- `state.cart`: replace with backend cart API
- `approveJoin`: connect to join request approval endpoint
- `sendOrder`: connect to order submission endpoint
- Order timeline: connect to live order status WebSocket

Suggested integration flow:

1. Read `tableId` and `zoneId` from QR URL params.
2. Call `POST /api/sessions/start`.
3. Store returned `guestToken` and `sessionId`.
4. Connect to WebSocket room for the session.
5. Fetch menu for current time period.
6. Send cart changes to backend.
7. Render cart updates from WebSocket events.
8. Submit order to kitchen.
9. Track order status live.

## Security Requirements

- Use signed guest session tokens
- Validate table IDs server-side
- Prevent guests from editing other sessions
- Rate-limit session start and join requests
- Validate all cart prices server-side
- Sanitize kitchen notes
- Keep staff-only endpoints authenticated
- Log order changes and cancellations
- Use HTTPS in production

## Production Requirements

- Reliable WebSocket reconnect logic
- POS/KDS fallback if integration is down
- Staff override tools for table/session issues
- Menu availability controls
- Item sold-out states
- Tax and service charge configuration
- Kitchen print/KDS routing by item category
- Payment gateway integration, if in-app payment is required
- Analytics for table conversion, ordering speed, and item popularity
- Error states for network loss and order submission failure

## Environment Variables

Suggested backend `.env` values:

```text
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
SESSION_TTL_MINUTES=180
QR_BASE_URL=https://order.raasta.in
POS_PROVIDER=
POS_API_KEY=
PAYMENT_PROVIDER=
PAYMENT_SECRET_KEY=
CDN_BASE_URL=
```

## Deployment Checklist

- Configure production domain and HTTPS
- Generate QR codes for each table
- Map QR codes to valid `tableId` and `zoneId`
- Upload menu images to CDN
- Seed menu categories, items, and modifiers
- Configure tax/service charge rules
- Test multi-device group ordering
- Test join approval flow
- Test kitchen order submission
- Test order status updates
- Test session expiry and table reset
- Train staff on order and table-session handling

## Current Prototype Limitations

- No real backend is connected yet
- Cart and session state are stored only in browser memory
- Guest approval is simulated
- Order status is animated locally
- Menu data is hardcoded
- Payment and POS/KDS integration are not implemented

## Visual QA

Rendered QA screenshots are included:

- `qa-entry.png`
- `qa-menu-cart.png`
- `qa-confirmation.png`
