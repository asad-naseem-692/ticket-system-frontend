# Feature: Update Ticket Status (UI)
**Owner:** Frontend | **Module:** Ticket Management

## Goal
Let an agent/admin move a ticket through its lifecycle.

## Scope
- Status dropdown/buttons inside `tickets/[id]/page.tsx`: Open → In Progress → Resolved → Closed.
- Only show transitions that make sense from the current status (e.g. don't show "Closed" as an option directly from "Open").
- On change → PATCH to backend status-update endpoint, show updated status immediately.

## Not in scope here
Validating whether the transition/role is actually allowed (backend feature: `update-ticket-status-api`).
