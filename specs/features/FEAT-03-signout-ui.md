# Feature: Sign Out (UI)
**Owner:** Frontend | **Module:** Authentication

## Goal
Let a logged-in user log out cleanly.

## Scope
- "Logout" button in the shared layout/header.
- On click: clear stored token, clear any cached user state, redirect to `/login`.

## Not in scope here
Server-side token invalidation, if implemented (backend feature: `signout-api`).
