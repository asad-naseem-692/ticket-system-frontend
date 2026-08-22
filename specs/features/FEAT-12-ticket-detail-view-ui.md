# Feature: Ticket Detail View (UI)
**Owner:** Frontend | **Module:** Ticket Management

## Goal
Show everything about one ticket in one place.

## Scope
- Page: `app/tickets/[id]/page.tsx`
- Shows: title, description, status, priority badge, SLA countdown, comment thread, attachments.
- Composes: `PriorityBadge`, `SLACountdown`, `CommentBox`, `AttachmentUploader` components.
