# AGENTS.md — Frontend

## Who reads this
This file is instructions for the AI coding agent (Antigravity) building the
**frontend only**. A sibling `backend/AGENTS.md` exists for the backend
build — do not build backend logic here.

## What you're building
A Next.js frontend for a Customer Support Ticket & SLA Automation system.
Every screen and component this repo needs is specified as a separate file
under `docs/features/`. Build one feature at a time, following its spec.

## Tech stack (do not substitute)
- Next.js (App Router) + TypeScript
- Tailwind CSS for styling
- Fetch-based API client talking to a separately deployed FastAPI backend

## Hard rules
1. **No business logic here.** Priority scoring, SLA deadline math, RBAC
   permission checks, and all data validation happen on the backend. This
   frontend only sends requests and renders whatever the backend returns.
   If a spec seems to require a decision (e.g. "is this allowed?"), assume
   the backend already decided and is telling you the answer — don't
   re-implement the decision here.
2. **Never hardcode the backend URL.** Always read it from
   `process.env.NEXT_PUBLIC_API_BASE_URL`.
3. **All API calls go through one client module** (`lib/api.ts`) — don't
   scatter `fetch()` calls across components.
4. **Auth token** is attached automatically to every request as a Bearer
   token (see `FEAT-04-token-storage-ui.md`).
5. **Role-based screens**: build the three route groups — `(customer)`,
   `(agent)`, `(admin)` — matching `FEAT-05-role-based-ui-routing.md`. Don't
   merge them into one generic screen with conditionals everywhere; keep
   each role's pages separate and simple.
6. **Client-side validation is UX only.** Show helpful inline errors, but
   never assume validation here is sufficient — the backend re-validates
   everything.

## What you should set up yourself (not covered by feature specs)
Since this repo is built independently, please create the following as part
of project setup, using sensible defaults:
- `.env.example` and a local `.env` — must include at least
  `NEXT_PUBLIC_API_BASE_URL` (default it to `http://localhost:8000` for
  local dev).
- `.gitignore` appropriate for a Next.js + Node project (node_modules,
  .next, .env*, etc.).
- `package.json` with Next.js, React, TypeScript, Tailwind.
- `Dockerfile` (multi-stage: build then run) for optional local
  containerized testing — note that when deployed to **Vercel**, Vercel
  builds Next.js natively and this Dockerfile is not used there.
- `vercel.json` only if you need to override Vercel's auto-detected
  settings; otherwise Vercel needs no extra config for a standard Next.js
  app.

## Feature specs
All specs are in `docs/features/` as a simple flat list, numbered
FEAT-01 through FEAT-27 in build order (auth first, then ticket
management, then priority/SLA display, then assignment UI, then
comments/attachments, then SLA timer/alerts, then reporting). Build them
in that numeric order unless told otherwise — later features depend on
earlier ones (e.g. you need auth working before ticket lists make sense).

## Data dictionary — use these exact field names, always
Because the frontend and backend are built as two separate repos
(possibly in separate Antigravity sessions), a feature "matching its own
spec" is not enough — the two sides must also agree on exact field names,
or the frontend and backend will fail to connect even though each side
looks correct on its own. To prevent this, always use exactly the field
names and types below when reading data from the backend. Do not rename,
abbreviate, or reshape them for convenience — if the backend response
doesn't match this dictionary, treat that as a bug to flag, not something
to silently adapt around in the frontend.

**Conventions:** all field names are `snake_case`. All timestamps are ISO
8601 UTC strings (e.g. `"2026-08-22T14:30:00Z"`). All ids are UUID strings.
Error responses look like `{ "detail": "message" }`. List endpoints return
a plain JSON array unless a spec explicitly says otherwise.

**User**
`id, name, email, role ("customer"|"agent"|"admin"), created_at`

**Auth response** (login/signup)
`{ "access_token": string, "token_type": "bearer", "user": User }`

**Ticket**
`id, title, description, category, status ("open"|"in_progress"|"resolved"|"closed"), priority ("critical"|"high"|"medium"|"low"), customer_id, assigned_agent_id (nullable), created_at, deadline_at, sla_breached (boolean)`

**Comment**
`id, ticket_id, author_id, visibility ("internal"|"public"), content, created_at`

**Attachment**
`id, ticket_id, uploaded_by, filename, url, size_bytes, created_at`

**Notification**
`id, user_id, ticket_id, type, message, created_at, read (boolean)`

If a feature you're building needs a field not listed here, use
`snake_case` and the same conventions above, then say so explicitly in
your implementation summary — the field needs to be added to this same
dictionary in **both** `frontend/AGENTS.md` and `backend/AGENTS.md` so the
two repos stay in sync. Never invent a field name silently on just one
side.

## Keep specs and code in sync (mandatory, every time)
The spec file for a feature is the source of truth for what that feature is
supposed to do — not just a one-time planning document. Whenever you add,
change, or remove behavior in a feature after it's already been built:
1. **Update that feature's `.md` file in `docs/features/` in the same
   change** — add/edit/remove the relevant bullet points so the spec still
   accurately describes the current behavior.
2. If the change affects what data the frontend expects from the backend
   (new field, changed endpoint, changed response shape), note that clearly
   in the spec so it's visible to whoever is working on the backend repo.
3. If a change doesn't fit any existing feature file, create a new
   `FEAT-XX-name.md` for it, following the same format as the others,
   rather than leaving the change undocumented.
4. Never let a spec describe behavior that no longer exists in the code, and
   never let the code do something its spec doesn't mention. Treat a stale
   or missing spec update as an incomplete task, not an optional cleanup
   step.

## Never let a change to one feature break a feature it depends on
Some feature specs mention other features they depend on (e.g. "Ticket
Detail View" depends on "Sign In" already being built, "Reassign Ticket"
depends on "Assign Ticket"). Before changing a feature that other features
rely on:
1. **Check `docs/features/` for any file that references the feature
   you're about to change** — treat every such reference as a dependent
   that must keep working exactly as its own spec describes.
2. If your change is scoped to the feature you're working on and doesn't
   require altering the behavior described in a dependency's spec, proceed
   normally — just don't touch that dependency's code or spec.
3. If your change genuinely requires altering a dependency's behavior (its
   props, its output shape, what it renders, when it triggers), that is a
   deliberate cross-feature change, not a side-effect: update that
   dependency's own spec file explicitly to describe the new behavior, and
   check every other feature that depends on it to confirm it still holds.
4. **Never modify a dependency's spec or code silently as a byproduct of
   working on something else.** If you're not sure whether a change ripples
   into a dependency, treat that uncertainty as a signal to check its spec
   file, not to guess.

## Deployment target
This repo deploys to **Vercel**. It talks to a backend deployed separately
on **Railway**. The only environment variable Vercel needs is
`NEXT_PUBLIC_API_BASE_URL`, set to the deployed backend's public URL.
