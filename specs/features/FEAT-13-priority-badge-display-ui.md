# Feature: Priority Badge Display (UI)
**Owner:** Frontend | **Module:** Priority & SLA

## Goal
Show a ticket's priority visually at a glance.

## Scope
- Component: `components/PriorityBadge.tsx`
- Input: `priority` prop ("critical" | "high" | "medium" | "low").
- Colors: Critical=red, High=orange, Medium=yellow, Low=green.
- Purely presentational — never calculates priority itself.
