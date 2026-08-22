# Feature: Permission-Aware UI Controls
**Owner:** Frontend | **Module:** Assignment & RBAC

## Goal
Hide/disable actions the current user isn't allowed to perform, for a clean UX.

## Scope
- Wrap admin-only buttons (assign, reassign, override priority) with a role check from the logged-in user's state.
- This is a UX convenience only — it is NOT a security boundary. The backend re-checks permission on every request regardless of what the UI shows.
