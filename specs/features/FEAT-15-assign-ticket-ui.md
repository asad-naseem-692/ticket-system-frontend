# Feature: Assign Ticket to Agent (Admin UI)
**Owner:** Frontend | **Module:** Assignment & RBAC

## Goal
Let an admin pick which agent handles a ticket.

## Scope
- Dropdown of agents in `tickets/[id]/page.tsx` and/or `all-tickets` table, visible only to admin role.
- Populated via `backend/specs/features/FEAT-34-list-agents-api.md` (`GET /users/agents`).
- On select → POST to backend assign endpoint (`POST /tickets/{id}/assign`), show assigned agent's name on the ticket.
