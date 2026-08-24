# Feature: Create Ticket (UI)
**Owner:** Frontend | **Module:** Ticket Management

## Goal
Let a customer submit a new support complaint.

## Scope
- Page: `app/(customer)/create-ticket/page.tsx`
- Protected by `AuthGuard` (accessible to customer and admin roles).
- Fields:
  - `title` (text input, required, min 3 characters)
  - `category` (select dropdown: "Technical Issue", "Billing", "Emergency", "General Inquiry", "Feedback", required)
  - `description` (textarea, required, min 5 characters)
- Client-side validation for required fields and minimum lengths.
- On submit → POST to backend create-ticket endpoint (`/tickets`).
- On success → show success message and redirect to `/my-tickets`.
- On failure → show returned error message.

## Not in scope here
Binding the ticket to the logged-in customer, priority scoring, SLA deadline (backend features: `customer-account-binding`, `automatic-priority-scoring`, `sla-deadline-calculation`).
