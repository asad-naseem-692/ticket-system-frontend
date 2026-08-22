# Feature: My Tickets List (Customer UI)
**Owner:** Frontend | **Module:** Ticket Management

## Goal
Let a customer see all complaints they've submitted.

## Scope
- Page: `app/(customer)/my-tickets/page.tsx`
- Fetches from backend "my tickets" endpoint (token identifies the customer automatically).
- Renders a list using `components/TicketCard.tsx` — shows title, status, priority badge, SLA countdown.
- Click a card → go to `tickets/[id]`.
