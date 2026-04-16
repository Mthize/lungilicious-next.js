# Lungilicious API v1 Contract

This document defines the API contract for the Lungilicious backend. It serves as the primary reference for frontend development and system integration.

## Authentication

All endpoints require a valid session cookie unless marked as public. The backend uses a cookie named `session-id` which is HttpOnly, Secure, and has SameSite=Strict. Role-based access control (RBAC) is enforced across five distinct roles.

## Standard Response Shapes

### Error Response
All non-2xx responses follow this structure:
```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "Bad Request",
  "requestId": "req-12345",
  "timestamp": "2026-04-16T10:00:00.000Z"
}
```

### Pagination Shape
Paginated results use this wrapper:
```json
{
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

## Health Endpoints
**Phase 1. Status: Implemented.**

### GET /health
*   **Description:** Returns the overall system health status.
*   **Auth:** Public.
*   **Response:** `{ "status": "ok", "info": { "db": { "status": "up" }, "redis": { "status": "up" } } }`

### GET /health/db
*   **Description:** Returns the database health status only.
*   **Auth:** Public.
*   **Response:** `{ "status": "up" }`

### GET /health/redis
*   **Description:** Returns the Redis health status only.
*   **Auth:** Public.
*   **Response:** `{ "status": "up" }`

## Authentication Endpoints
**Phase 1. Status: Stubs returning 501.**

### POST /auth/register
*   **Description:** Registers a new user account.
*   **Auth:** Public.
*   **Rate Limit:** 5 requests per minute.
*   **Request Body:** `{ "email": "user@example.com", "password": "...", "firstName": "John", "lastName": "Doe" }`
*   **Response:** `201 Created`

### POST /auth/login
*   **Description:** Authenticates a user and sets a session cookie.
*   **Auth:** Public.
*   **Rate Limit:** 10 requests per minute.
*   **Request Body:** `{ "email": "user@example.com", "password": "..." }`
*   **Response:** `200 OK` with `Set-Cookie` header.

### POST /auth/logout
*   **Description:** Revokes the current session and clears the session cookie.
*   **Auth:** Requires session.
*   **Response:** `204 No Content`

### POST /auth/refresh
*   **Description:** Rotates the current session to maintain activity.
*   **Auth:** Requires session.
*   **Response:** `200 OK`

### POST /auth/forgot-password
*   **Description:** Initiates the password recovery process.
*   **Auth:** Public.
*   **Rate Limit:** 3 requests per minute.
*   **Request Body:** `{ "email": "user@example.com" }`
*   **Response:** `202 Accepted`

### POST /auth/reset-password
*   **Description:** Resets the password using a valid token.
*   **Auth:** Public.
*   **Request Body:** `{ "token": "...", "newPassword": "..." }`
*   **Response:** `200 OK`

### POST /auth/verify-email
*   **Description:** Verifies a user email address using a token.
*   **Auth:** Public.
*   **Request Body:** `{ "token": "..." }`
*   **Response:** `200 OK`

### POST /auth/mfa/verify
*   **Description:** Verifies a multi-factor authentication code.
*   **Auth:** Requires partial session.
*   **Request Body:** `{ "code": "123456", "factorId": "..." }`
*   **Response:** `200 OK`

## Customer Endpoints
**Future Phase.**

### GET /me
*   **Description:** Returns the profile of the authenticated user.
*   **Auth:** Requires session.
*   **Implementation Note:** Returns 501 in Phase 1.
*   **Response:** User profile object.

### PATCH /me
*   **Description:** Updates the authenticated user profile.
*   **Auth:** Requires session.
*   **Request Body:** `{ "firstName": "string", "lastName": "string", "phone": "string" }` (all optional)
*   **Response:** Updated user profile object.

### GET /me/orders
*   **Description:** Returns a paginated list of orders for the authenticated user.
*   **Auth:** Requires session.
*   **Response:** Paginated order list.

### GET /me/orders/:id
*   **Description:** Returns details for a specific order owned by the user.
*   **Auth:** Requires session.
*   **Response:** Order detail object.

### GET /me/addresses
*   **Description:** Returns all saved addresses for the user.
*   **Auth:** Requires session.
*   **Response:** List of address objects.

### POST /me/addresses
*   **Description:** Adds a new address to the user profile.
*   **Auth:** Requires session.
*   **Request Body:** `{ "label": "Home", "line1": "...", "line2": "...", "city": "...", "province": "...", "postalCode": "...", "country": "..." }`
*   **Response:** Created address object.

### PATCH /me/addresses/:id
*   **Description:** Updates an existing address owned by the user.
*   **Auth:** Requires session.
*   **Request Body:** Address update fields.
*   **Response:** Updated address object.

### DELETE /me/addresses/:id
*   **Description:** Removes an address from the user profile.
*   **Auth:** Requires session.
*   **Response:** `204 No Content`

## Cart Endpoints
**Future Phase.**

### GET /cart
*   **Description:** Returns the current cart contents.
*   **Auth:** Public or session (supports guest carts).
*   **Response:** Cart object.

### POST /cart/items
*   **Description:** Adds an item to the cart.
*   **Auth:** Public or session.
*   **Request Body:** `{ "productVariantId": "...", "quantity": 1 }`
*   **Response:** Updated cart object.

### PATCH /cart/items/:id
*   **Description:** Updates the quantity of a cart item.
*   **Auth:** Public or session.
*   **Request Body:** `{ "quantity": 2 }`
*   **Response:** Updated cart object.

### DELETE /cart/items/:id
*   **Description:** Removes an item from the cart.
*   **Auth:** Public or session.
*   **Response:** Updated cart object.

### POST /cart/apply-coupon
*   **Description:** Applies a discount code to the cart.
*   **Auth:** Public or session.
*   **Request Body:** `{ "code": "SAVE10" }`
*   **Response:** Updated cart object.

## Checkout Endpoints
**Future Phase.**

### POST /checkout/start
*   **Description:** Initializes the checkout process.
*   **Auth:** Requires session.
*   **Response:** Checkout session object.

### POST /checkout/address
*   **Description:** Sets the shipping address for the checkout.
*   **Auth:** Requires session.
*   **Request Body:** `{ "addressId": "..." }`
*   **Response:** Updated checkout session.

### POST /checkout/shipping
*   **Description:** Sets the shipping method for the checkout.
*   **Auth:** Requires session.
*   **Request Body:** `{ "shippingMethodId": "..." }`
*   **Response:** Updated checkout session.

### POST /checkout/payment-intent
*   **Description:** Creates a payment intent and returns a redirect URL.
*   **Auth:** Requires session.
*   **Response:** `{ "redirectUrl": "..." }`

### POST /checkout/confirm
*   **Description:** Finalizes the checkout after payment.
*   **Auth:** Requires session.
*   **Response:** Order confirmation object.

## Payments Endpoints
**Future Phase.**

### POST /payments/create-session
*   **Description:** Creates a payment provider session.
*   **Auth:** Requires session.
*   **Response:** Session details.

### POST /payments/refunds
*   **Description:** Processes a refund for an order.
*   **Auth:** Requires ADMIN role.
*   **Request Body:** `{ "orderId": "...", "amount": 100, "reason": "..." }`
*   **Response:** Refund status object.

### POST /payments/webhooks/:provider
*   **Description:** Receives asynchronous notifications from payment providers.
*   **Auth:** Public (signature verified).
*   **Response:** `{ "received": true }`

## Public Storefront Endpoints
**Future Phase.**

### GET /products
*   **Description:** Returns a paginated and filterable list of products.
*   **Auth:** Public.
*   **Response:** Paginated product list.

### GET /products/:slug
*   **Description:** Returns details for a single product by its slug.
*   **Auth:** Public.
*   **Response:** Product detail object.

### GET /categories
*   **Description:** Returns a list of product categories.
*   **Auth:** Public.
*   **Response:** Category list.

### GET /pages/:slug
*   **Description:** Returns content for a static page.
*   **Auth:** Public.
*   **Response:** Page content object.

### GET /faq
*   **Description:** Returns frequently asked questions.
*   **Auth:** Public.
*   **Response:** FAQ list.

### GET /campaigns/:slug
*   **Description:** Returns details for a marketing campaign.
*   **Auth:** Public.
*   **Response:** Campaign object.

## Admin Endpoints
**Future Phase. All require ADMIN role.**

### CRUD /admin/products
*   **Description:** Manage product catalog.
*   **Auth:** Requires ADMIN role.

### CRUD /admin/categories
*   **Description:** Manage product categories.
*   **Auth:** Requires ADMIN role.

### CRUD /admin/pages
*   **Description:** Manage static pages.
*   **Auth:** Requires ADMIN role.

### GET /admin/orders
*   **Description:** List all orders with filters.
*   **Auth:** Requires ADMIN role.

### GET /admin/orders/:id
*   **Description:** View specific order details.
*   **Auth:** Requires ADMIN role.

### PATCH /admin/orders/:id
*   **Description:** Update order status or details.
*   **Auth:** Requires ADMIN role.

### POST /admin/orders/:id/refund
*   **Description:** Trigger a refund for a specific order.
*   **Auth:** Requires ADMIN role.

### GET /admin/inventory
*   **Description:** View inventory levels across variants.
*   **Auth:** Requires ADMIN role.

### PATCH /admin/inventory/:variantId
*   **Description:** Update stock levels for a variant.
*   **Auth:** Requires ADMIN role.

### GET /admin/audit-logs
*   **Description:** View system audit logs.
*   **Auth:** Paginated and filterable. Requires ADMIN role.
