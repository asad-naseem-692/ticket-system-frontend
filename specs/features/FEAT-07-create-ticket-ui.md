# Feature: Create Ticket (UI)
**Owner:** Frontend | **Module:** Ticket Management

## Goal
Let a customer submit a new support complaint.

## Scope
- Page: `app/(customer)/create-ticket/page.tsx`
- Fields: title, description, category/attachment (optional).
- Client-side required-field validation only.
- On submit → POST to backend create-ticket endpoint, show success message, redirect to `my-tickets`.

## Not in scope here
Binding the ticket to the logged-in customer, priority scoring, SLA deadline (backend features).
