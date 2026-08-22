# Feature: Assigned Tickets List (Agent UI)
**Owner:** Frontend | **Module:** Ticket Management

## Goal
Let an agent see tickets currently assigned to them.

## Scope
- Page: `app/(agent)/assigned-tickets/page.tsx`
- Fetches from backend "assigned to me" endpoint.
- Same `TicketCard` component as customer view, but agent-focused actions (update status) shown.
