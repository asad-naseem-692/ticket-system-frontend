# Feature: Sign Up (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let a new user (customer/agent/admin) create an account.

## Scope
- Page: `app/(auth)/signup/page.tsx`
- Fields: name, email, password, confirm password, role (if applicable).
- Password visibility toggle (eye / eye-off icon) on password and confirm password fields.
- Client-side validation only (required fields, email format, minimum 6 characters, password match) — this is UX help, not security.
- On submit → POST to backend signup endpoint.
- On success → display success notification and redirect to `/login?registered=true`.
- On error → show returned error message.

## Not in scope here
Password hashing, storing user in DB, role security checks (backend feature: `signup-api`).
