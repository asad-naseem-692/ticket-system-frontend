# Feature: Sign Up (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let a new user (customer/agent/admin) create an account.

## Scope
- Page: `app/(auth)/signup/page.tsx`
- Fields: name, email, password, confirm password, role (if applicable)
- Client-side validation only (required fields, email format, password match) — this is UX help, not security.
- On submit → POST to backend signup endpoint.
- On success → redirect to login. On error → show returned error message.

## Not in scope here
Password hashing, storing user in DB, role security checks (backend feature: `signup-api`).
