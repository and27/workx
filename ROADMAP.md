# ROADMAP — Workx

## Phase 0 - UI-first (Portfolio Core) [DONE]

**Goal:** Build a portfolio-grade product experience without backend infra.

Scope:

- Notion-style UI using shadcn/ui.
- Domain models, ports, and memory adapters.
- Dashboard (Home) with execution-focused metrics.
- Applications table (primary working view).
- Jobs table (discovery → convert to application).
- Inbox view (Overdue / Today / Upcoming).
- Application detail with timeline (audit log).
- Selective TDD for use cases (no UI tests required).

Out of scope:

- Supabase integration.
- Authentication.
- Scraping workers.
- Auto-application to job portals.

Exit criteria:

- App runs locally with seeded data.
- All business rules live in use cases.
- UI never imports adapters directly.

---

## Phase 1 - Persistence & Auth (Day 3) [DONE]

**Goal:** Replace memory adapter with real persistence.

Scope:

- Supabase integration (DB + Storage).
- Supabase adapter implementing existing ports.
- Optional email/password auth.
- Data migration from seed → DB.
- Keep UI unchanged.

Out of scope:

- Advanced permissions.
- Multi-tenant orgs.
- Scraping automation.

Exit criteria:

- Switching adapters does not require UI refactors.
- Data persists across reloads.
- Existing tests still pass.

---

## Phase 2 - Job Discovery & Ranking [IN PROGRESS]

**Goal:** Assist job discovery without auto-applying.

Scope:

- Manual ingestion (1-2 sources).
- Daily scraper (1-2 sources).
- Job ranking/scoring (stack match, seniority).
- “Top matches today” in Dashboard.
- Deduplication and snapshots.

Out of scope:

- LinkedIn auto-apply.
- Large-scale scraping.
- Proxy infrastructure.

Exit criteria:

- Scraper runs once daily.
- Jobs appear in UI without manual input.

---

## Phase 3 — Productivity Automation (Optional)

**Goal:** Reduce manual follow-up work.

Scope:

- Follow-up reminders.
- Message templates (copy/open LinkedIn).
- Calendar reminders.
- Analytics (conversion by stage/source).

Out of scope:

- Full ATS replacement.
- Enterprise integrations.

Exit criteria:

- Clear productivity gain for a single user.
