# Feature: Reassign Ticket (Admin UI)
**Owner:** Frontend | **Module:** Assignment & RBAC

## Goal
Let an admin move a ticket from one agent to another.

## Scope
- Same dropdown as `assign-ticket-ui`, populated via `backend/specs/features/FEAT-34-list-agents-api.md` (`GET /users/agents`).
- Allows changing an existing assignment via `PATCH /tickets/{id}/reassign`.
- Show a small "previously assigned to X" note / audit context.
