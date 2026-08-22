# Feature: Manual Priority Override (Admin UI)
**Owner:** Frontend | **Module:** Priority & SLA

## Goal
Let an admin manually change a ticket's auto-assigned priority.

## Scope
- Dropdown next to `PriorityBadge` in `tickets/[id]/page.tsx`, visible only when logged-in user role is admin.
- On change → PATCH to backend override endpoint, show updated badge + updated SLA countdown.
