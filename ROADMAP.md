# ROADMAP – Workx

## Phase 0 – Execution UI (Portfolio Core) ✅

**Goal:** Prove an execution-first user experience without backend dependency.

**Delivers:**

- Execution-focused dashboard (Home).
- Inbox: Overdue / Today / Upcoming.
- Applications as the primary working surface.
- Jobs as discovery → convert to application.
- Application timeline (audit log).
- Clean Ports & Adapters architecture with memory adapter.
- Selective TDD for use cases.

**Non-goals:**

- Persistence, authentication, automation.

**Exit criteria:**

- App runs locally with seeded data.
- All business rules live in use cases.
- UI depends only on use cases (never adapters).

---

## Phase 1 – Persistence (Supabase) ✅

**Goal:** Persist execution data without changing the user experience.

**Delivers:**

- Supabase adapter implementing existing ports.
- Database schema and migrations.
- Optional email/password authentication.
- Memory ↔ Supabase swap with no UI changes.

**Non-goals:**

- Permissions, multi-tenant support, automation.

**Exit criteria:**

- Data survives reloads.
- Switching adapters does not require UI refactors.
- Existing tests still pass.

---

## Phase 2 – Job Discovery (Manual Ingestion) ✅

**Goal:** Feed the daily execution loop with real job opportunities.

**Delivers:**

- Manual job ingestion (Remotive source).
- API trigger for ingestion.
- Jobs list with basic filters in UI.
- “Top matches today” (flat list, no ranking).
- Deduplication via `(source, externalId)` upsert.

**Non-goals:**

- Automated scraping, ranking, snapshots.

**Exit criteria:**

- Jobs can be ingested manually and reviewed daily.

---

## Phase 2.1 – Daily Decision UX (Closure)

**Goal:** Make discovery and execution actionable without ambiguity.

Scope:

- Overdue metrics link to actionable views.
- Clear temporal context for job discovery (publishedAt).
- Reduce “informational-only” UI elements.

Exit criteria:

- User can identify overdue actions in one click.
- User understands job freshness at a glance.

---

## Phase 3 – Discovery Ranking (Light, Future)

**Goal:** Reduce decision fatigue by prioritizing relevant jobs.

**Delivers:**

- Basic ranking heuristics (seniority, keywords, recency).
- Ordered “Top matches today”.
- Improved deduplication rules.

**Non-goals:**

- ML models, heavy scoring pipelines, mass scraping.

**Exit criteria:**

- Jobs appear pre-sorted by relevance with minimal configuration.

---

## Phase 4 – Productivity Automation (Optional)

**Goal:** Reduce follow-up overhead for a single user.

**Delivers:**

- Follow-up reminders.
- Message templates (copy/open LinkedIn or email).
- Calendar nudges.
- Lightweight analytics (conversion by stage/source).

**Non-goals:**

- Full ATS replacement, enterprise features.

**Exit criteria:**

- Measurable reduction in manual tracking and missed follow-ups.
