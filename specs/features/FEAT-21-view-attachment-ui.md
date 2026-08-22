# Feature: View Attachment (UI)
**Owner:** Frontend | **Module:** Comments & Attachments

## Goal
Let a user preview or download files attached to a ticket.

## Scope
- Attachment list inside `tickets/[id]/page.tsx`: filename, size, uploaded-by, download/preview link.
- Images render as thumbnails; other file types show a generic file icon + download link.
