# Feature: Role-Based UI Routing
**Owner:** Frontend | **Module:** Authentication

## Goal
Show each user only the screens meant for their role.

## Scope
- Read role from the decoded token / logged-in user state.
- Customer → sees `(customer)` route group only.
- Agent → sees `(agent)` route group only.
- Admin → sees `(admin)` route group only.
- If a user manually navigates to a route not meant for their role, redirect them away (this is UX convenience only — the backend re-checks role on every request regardless).

## Not in scope here
Deciding/storing what the role actually is (backend feature: `role-assignment-storage`).
