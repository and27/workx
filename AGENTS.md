# AGENTS.md — Workx

## Purpose

This file defines hard rules and conventions for Codex contributions. It is NOT a roadmap. It is the architecture contract that keeps the codebase adaptable (memory today, Supabase tomorrow).

## Architecture: Ports & Adapters (Non-negotiable)

- Domain is framework-agnostic:
  - `src/domain/**` MUST NOT import from `react`, `next/*`, or UI libs.
- UI must not know adapters:
  - Pages/components MUST call `src/services/usecases/**` only.
- Adapters are swappable:
  - `src/adapters/**` implements `src/ports/**`.
  - Today: `memory` adapter.
  - Day 3: add `supabase` adapter without rewriting UI.
- Composition root decides adapters:
  - `src/composition/repositories.ts` is the ONLY place where adapters are selected.

## Phase Guardrails (for this repo state)

- No Supabase code in Phase 0 (UI-first):
  - Do not add `@supabase/*` packages.
  - Do not create DB clients or RLS policies yet.
- Persistence is mocked:
  - Use in-memory repositories with deterministic seed data.
- No scraping worker yet:
  - Do not add Playwright/cron in this phase.
- Allowed in Phase 0:
  - UI libs (shadcn/radix), date utilities, test runner (Vitest), and small formatting helpers.
- Not allowed in Phase 0:
  - Supabase SDKs, Playwright, cron/worker infra.

## Data Modeling Rules

- IDs are `string` (uuid-like), never numbers.
- Dates:
  - Use ISO strings.
  - For "nextActionAt", use DATE-ONLY: `YYYY-MM-DD` to avoid timezone bugs.
- Status and priority are closed enums:
  - Status: `saved | applied | screen | tech | offer | rejected | ghosted`
  - Priority: `low | medium | high`
- Every write must generate an audit log entry.

## Date Semantics (Hard Rule)

- `nextActionAt` is DATE-ONLY (`YYYY-MM-DD`) in local time semantics.
- Inbox grouping:
  - overdue: `nextActionAt < today`
  - today: `nextActionAt === today`
  - upcoming: `nextActionAt > today`
- No time-of-day comparisons in Phase 0.

## UI/UX Contract (Notion-like)

- Visual style: minimal, neutral, text-first, subtle borders.
- Layout:
  - Left sidebar navigation.
  - Top filter bar.
  - Main content list/table.
- States:
  - loading / empty / error must exist in UI (even if memory adapter rarely errors).
- Accessibility:
  - Inputs have labels.
  - Buttons are real `<button>`.
  - Focus ring visible.

## Conventions

### File naming

- kebab-case for folders, PascalCase for React components.
- Domain entities use camelCase exports.

### Imports

- Use `@/` alias for internal imports.
- No deep relative imports like `../../../`.

### Error handling

- Use typed results in use cases (`Result<T, E>`) or throw domain-safe errors.
- Never swallow errors silently.

### Logging & audit

- Application changes must append `ApplicationLogEntry`:
  - status change
  - notes update
  - next action set/cleared
  - created from job

## Ports (interfaces)

- Ports live in `src/ports/**` and must be stable.
- Query objects only:
  - avoid multiple positional params.
- Use async APIs (`Promise`) even for memory adapter to match future DB adapter.

## Adapters

- `src/adapters/memory/**` is the only implementation in Phase 0.
- Seed data must be realistic and varied:
  - > = 25 jobs
  - > = 10 applications
  - mix of overdue/today/upcoming next actions
  - logs exist for each application

## Use cases (application services)

- Use cases are the only place allowed to implement:
  - grouping logic (Inbox)
  - derived fields
  - audit log creation
- UI components must not implement business rules.

## Testing (Selective TDD)

- We apply TDD selectively: test business logic, not UI wiring.
- Must-have unit tests (Phase 0):
  - `listInbox` groups applications into `overdue / today / upcoming` using DATE-ONLY `YYYY-MM-DD`.
  - `createApplicationFromJob` sets defaults:
    - status=`saved`, priority=`medium`, nextActionAt=`tomorrow` (date-only), creates audit log.
  - `updateApplication` always appends an audit log entry when:
    - status changes
    - notes changes
    - nextActionAt changes
- UI component tests are optional in Phase 0; prefer type-safety + manual verification.
- Preferred test runner: Vitest.
- Tests live under `src/services/usecases/**/__tests__/*`.

## Acceptance Criteria for a PR

A PR is "done" only when:

- `npm run dev` runs without TS errors.
- All pages render with seeded data.
- No UI code imports adapters directly.
- Domain has no React/Next imports.
- Updates create corresponding log entries.
- Required use case unit tests pass.

## Commit/PR Style (preferred)

- Small commits, semantic messages:
  - `chore: scaffold ports and domain`
  - `feat: memory repositories + seed`
  - `feat: jobs/inbox/application pages`
- Each PR should mention:
  - what contracts changed (if any)
  - how it keeps adapters swappable
