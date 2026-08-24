# Feature: Forgot / Reset Password (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let a user who forgot their password request a reset and set a new one.

## Scope
- Page: `app/(auth)/forgot-password/page.tsx`:
  - Email input, calls `POST /auth/request-reset`.
  - In development mode, displays a direct "Proceed to Set New Password" action if the reset token is returned.
- Page: `app/(auth)/reset-password/page.tsx`:
  - Wrapped in `<Suspense>` to safely read `?token=` parameter.
  - Fields: New Password, Confirm New Password with independent show/hide eye toggles.
  - Client-side validation: minimum 6 characters, passwords match.
  - Calls `POST /auth/confirm-reset` with `{ token, new_password }`.
  - On success → redirects to `/login?reset=true`.

## Not in scope here
Generating reset tokens, validating them, updating the hashed password (backend feature: `password-reset-api`).
