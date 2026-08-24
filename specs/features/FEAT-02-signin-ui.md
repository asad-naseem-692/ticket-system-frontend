# Feature: Sign In (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let an existing user log in and reach their role-based dashboard.

## Scope
- Page: `app/(auth)/login/page.tsx`
- Fields: email, password.
- Password visibility toggle (eye / eye-off icon) inside password input field.
- Handles incoming notice banners (`?registered=true` and `?reset=true`).
- Supports return destination redirects via `?redirect=/path`.
- Wrapped in `<Suspense>` for Next.js App Router client parameter compliance.
- On submit → POST to backend login endpoint (`/auth/login`).
- On success → store returned token in localStorage (see `token-storage-ui`), redirect based on role (customer → `/my-tickets`, agent → `/assigned-tickets`, admin → `/all-tickets`).
- On failure → show "invalid credentials" message (never reveal whether email or password was wrong), or clear network connection error if backend is unreachable.

## Not in scope here
Verifying credentials, issuing the JWT (backend feature: `signin-api`).
