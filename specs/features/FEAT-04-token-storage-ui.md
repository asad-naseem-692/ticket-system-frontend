# Feature: Auth Token Storage & Attachment (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Keep the logged-in user's session available across pages and attach it to every API call.

## Scope
- `lib/auth.ts`: functions to save/read/clear the token after login.
- `lib/api.ts`: every request automatically adds `Authorization: Bearer <token>` header.
- If a request comes back `401 Unauthorized`, clear token and redirect to `/login`.

## Not in scope here
Generating or verifying the token (backend feature: `jwt-token-generation`).
