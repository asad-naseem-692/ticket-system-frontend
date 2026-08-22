# Feature: Upload Attachment (UI)
**Owner:** Frontend | **Module:** Comments & Attachments

## Goal
Let a user attach a file/screenshot to a ticket.

## Scope
- Component: `components/AttachmentUploader.tsx` — file picker + upload progress bar.
- Basic client-side checks only (file size warning, allowed extensions hint) — real validation happens on the backend.
- On success, show the new attachment in the ticket's attachment list immediately.
