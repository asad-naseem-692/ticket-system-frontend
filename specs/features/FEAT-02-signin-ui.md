# Feature: Sign In (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let an existing user log in and reach their role-based dashboard.

## Scope
- Page: `app/(auth)/login/page.tsx`
- Fields: email, password
- On submit → POST to backend login endpoint.
- On success → store returned token (see `token-storage-ui`), redirect based on role (customer → my-tickets, agent → assigned-tickets, admin → all-tickets).
- On failure → show "invalid credentials" message (never reveal whether email or password was wrong).

## Not in scope here
Verifying credentials, issuing the JWT (backend feature: `signin-api`).
