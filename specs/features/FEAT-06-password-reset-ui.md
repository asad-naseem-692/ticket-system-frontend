# Feature: Forgot / Reset Password (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let a user who forgot their password request a reset and set a new one.

## Scope
- Page: `app/(auth)/forgot-password/page.tsx` — email input, calls "request reset" endpoint.
- Page: `app/(auth)/reset-password/page.tsx` — new password + confirm, calls "confirm reset" endpoint using a token from the reset link/query param.

## Not in scope here
Generating reset tokens, validating them, updating the hashed password (backend feature: `password-reset-api`).
