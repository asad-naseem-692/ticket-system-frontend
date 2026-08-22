# Feature: Closure Audit Log View (UI)
**Owner:** Frontend | **Module:** Reporting

## Goal
Show the full history of a closed ticket for accountability.

## Scope
- Timeline section inside `tickets/[id]/page.tsx` (visible once ticket is closed, or as an "audit" tab).
- Shows ordered events: created, assigned, status changes, comments, closed — each with timestamp and actor.
