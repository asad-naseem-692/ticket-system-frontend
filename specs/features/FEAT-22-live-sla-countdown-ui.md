# Feature: Live SLA Countdown Display
**Owner:** Frontend | **Module:** SLA Timer & Alerts

## Goal
Show a ticking countdown to a ticket's SLA deadline.

## Scope
- Component: `components/SLACountdown.tsx`
- Input prop: `deadlineAt` (timestamp from backend).
- Updates every second client-side; turns red/urgent style when under 15 minutes remaining.
- Purely presentational — never decides breach itself, only displays what the backend already calculated.
