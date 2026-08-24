# AGENTS.md — Frontend (Next.js)

## Scope
This file applies to the `frontend/` folder only. This is its own GitHub
repo, deployed to **Vercel**. A sibling `backend/AGENTS.md` covers the
backend — do not build backend logic here.

## Tech stack (do not substitute)
Next.js (App Router) + TypeScript + Tailwind CSS. All API calls go to a
separately deployed FastAPI backend.

## Build order — full-stack, one feature at a time
This project is built as **vertical slices** together with the backend,
not backend-then-frontend. For each feature:
1. Look at `specs/features/` in this folder for the next unbuilt frontend
   feature, in `FEAT-XX` numeric order — this pairs with the matching
   backend feature just approved.
2. Implement ONLY that feature's frontend part — don't get ahead.
3. Give a short summary: feature name, files created/changed, any
   assumptions or things needing confirmation.
4. **Stop and wait for explicit approval** before starting the next
   feature. If changes are requested, make them and stop again for
   approval.
5. Once approved, update that feature's spec `.md` file if the real
   implementation differs from the original plan — the spec must always
   describe current behavior, not just what was originally planned.

## Core invariant
No business logic here. Priority scoring, SLA math, permission checks,
and all validation happen on the backend. This frontend only sends
requests and renders whatever the backend returns — never re-implement a
decision the backend already made.

## Hard rules
- Never hardcode the backend URL — always read
  `process.env.NEXT_PUBLIC_API_BASE_URL`.
- All API calls go through one client module (`lib/api.ts`) — don't
  scatter `fetch()` calls across components.
- Auth token is attached automatically as a Bearer header on every
  request (see token storage feature).
- Role-based screens live in separate route groups — `(customer)`,
  `(agent)`, `(admin)` — kept simple and separate, not one screen full of
  role conditionals.
- Client-side validation is UX only; the backend re-validates everything,
  so never assume frontend checks are sufficient.

## Backend connection during development
`NEXT_PUBLIC_API_BASE_URL` = `http://localhost:8000` while both frontend
and backend run locally (the local backend itself connects to the real
Railway Postgres via its public URL — see backend/AGENTS.md). Once both
sides are deployed, I will give you the real Railway backend URL to use
instead — don't guess it.

## Data dictionary — use exactly these field names, always
Because frontend and backend are separate repos/sessions, matching field
names exactly is the only thing that makes them actually connect. Never
rename, abbreviate, or reshape these for convenience.

**Conventions:** `snake_case` fields, ISO 8601 UTC timestamps (e.g.
`"2026-08-22T14:30:00Z"`), UUID string ids, errors as
`{ "detail": "message" }`, list endpoints return plain JSON arrays.

- **User**: `id, name, email, role ("customer"|"agent"|"admin"), created_at`
- **Auth response**: `{ "access_token": string, "token_type": "bearer", "user": User }`
- **Ticket**: `id, title, description, category, status ("open"|"in_progress"|"resolved"|"closed"), priority ("critical"|"high"|"medium"|"low"), customer_id, assigned_agent_id (nullable), created_at, deadline_at, sla_breached (boolean)`
- **Comment**: `id, ticket_id, author_id, visibility ("internal"|"public"), content, created_at`
- **Attachment**: `id, ticket_id, uploaded_by, filename, url, size_bytes, created_at`
- **Notification**: `id, user_id, ticket_id, type, message, created_at, read (boolean)`
- **Audit Log**: `id, ticket_id, actor_id, action, timestamp, details`

If a feature needs a field not listed here, use the same conventions and
flag it clearly in your summary — it needs to be added to this same
dictionary in **both** `frontend/AGENTS.md` and `backend/AGENTS.md`.
Never invent or rename a field silently on just one side.

## Design System

All screens and components follow these tokens and shared UI patterns to maintain a clean, trustworthy, light-mode design for daily business operations.

### 1. Color Palette & Tokens
- **Canvas Background**: `#FAFAFA` (soft off-white)
- **Cards & Surfaces**: `#FFFFFF` (clean white)
- **Headings & Primary Text**: `#1F2933` (warm charcoal, never harsh black)
- **Body & Subtitle Text**: `#52606D`
- **Muted & Placeholder Text**: `#9AA5B1`
- **Borders**: `#E4E7EB` (`border-light`)
- **Primary Accent (Teal)**: `#0D9488` (`primary-600`), hover `#0F766E` (`primary-700`), light tint `#F0FDFA` (`primary-50`)
- **Priority Badges (Soft background style)**:
  - Critical: `bg-red-50 text-[#DC2626] border border-red-200/80`
  - High: `bg-orange-50 text-[#F97316] border border-orange-200/80`
  - Medium: `bg-amber-50 text-[#D97706] border border-amber-200/80`
  - Low: `bg-slate-50 text-[#64748B] border border-slate-200`
- **Status Badges (Soft background style)**:
  - Open: `bg-blue-50 text-[#2563EB] border border-blue-200/80`
  - In Progress: `bg-teal-50 text-[#0D9488] border border-teal-200/80`
  - Resolved: `bg-emerald-50 text-[#059669] border border-emerald-200/80`
  - Closed: `bg-slate-100 text-[#52606D] border border-slate-200`

### 2. Typography & Hierarchy
- **Font Family**: Inter (`next/font/google`), loaded via variable `--font-inter`.
- **Hierarchy**: Weight-based (400 regular, 500 medium, 600 semibold, 700 bold).
- **Line Height**: 1.5+ for body text and descriptions.

### 3. Spacing & Radius
- **Border Radius**: 10–12px (`rounded-xl`) on cards, inputs, selects, textareas, and primary buttons.
- **Card Shadows**: `shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]` default; `hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.06)] hover:-translate-y-0.5` on clickable cards.
- **Form Controls**: Consistent 40px (`h-10`) height, teal focus ring (`focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20`).

### 4. Shared UI Components (`components/ui/`)
- **`Button`** (`components/ui/Button.tsx`): Variants: `primary`, `secondary`, `danger`, `ghost`. Supports `sm`, `md`, `lg`, loading state, and icons.
- **`Card`** (`components/ui/Card.tsx`): White card container with optional `hoverable` lift. Includes `CardHeader`, `CardBody`, and `CardFooter`.
- **`Badge`** (`components/ui/Badge.tsx`): Standardized soft badge supporting priority and status variants.
- **`Input`** (`components/ui/Input.tsx`): Rounded-xl input with label, error text, helper text, and teal focus ring.
- **`Select`** (`components/ui/Select.tsx`): Rounded-xl select dropdown with custom chevron indicator.
- **`Textarea`** (`components/ui/Textarea.tsx`): Rounded-xl textarea with matching styling and generous padding.
- **`EmptyState`** (`components/ui/EmptyState.tsx`): Friendly empty state with soft teal icon container, title, description, and action button.
- **`Skeleton`** (`components/ui/Skeleton.tsx`): Smooth shimmer animation placeholder for async data loading.

## Never let a change to one feature break a feature it depends on
Before changing a feature other features rely on, check `specs/features/`
for anything referencing it. If a change is genuinely needed, update that
feature's spec explicitly and confirm nothing else depending on it
breaks. Never modify a dependency's code or spec silently as a side
effect of unrelated work.

## What you set up yourself (not covered by feature specs)
- `.env.example` and local `.env` with at least `NEXT_PUBLIC_API_BASE_URL`
  (default `http://localhost:8000`).
- `.gitignore` for a Next.js/Node project (`node_modules`, `.next`,
  `.env*`, etc.) — `.env` must never be committed.
- `package.json` with Next.js, React, TypeScript, Tailwind.
- `Dockerfile` only needed for optional local container testing — Vercel
  builds Next.js natively and doesn't use it.

## Deployment target
Vercel, connected to the `frontend/` GitHub repo. Only required env var:
`NEXT_PUBLIC_API_BASE_URL`, set to the deployed backend's public Railway
URL once that exists.
