# ROADMAP – Workx

Status: Phase 3 in progress; Phase 3.1 + 3.2 complete; Phase 2.3 in progress.

## Phase 0 – Execution UI (Portfolio Core) ✅

**Goal:** Prove an execution-first user experience without backend dependency.

**Delivers:**

- Execution-focused dashboard (Home).
- Inbox: Overdue / Today / Upcoming.
- Applications as the primary working surface.
- Jobs as discovery → convert to application.
- Application detail with timeline (audit log).
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
- API trigger for ingestion (Remotive endpoint).
- Jobs list in UI.
- “Top matches today” (flat list, no ranking).
- Deduplication via `(source, externalId)` upsert.

**Non-goals:**

- Automated scraping, ranking, snapshots.

**Exit criteria:**

- Jobs can be ingested manually and reviewed daily.

---

## Phase 2.2 – Multi-source Job Discovery (Epic 4) ✅ Complete

**Goal:** Expand manual ingestion to multiple sources without UI changes.

**Delivers:**

- Additional sources (WWR + Web3 + Remote OK).
- Composite jobSource router for source-based ingestion.
- Generic `/api/ingest` endpoint + source-specific routes.
- Normalization/dedup by `(source, externalId)` across sources.

**Status update (2026-02-02):**
- ✅ WWR adapter
- ✅ Web3 adapter
- ✅ Remote OK adapter
- ✅ Multi-source router + generic ingest endpoint

**Non-goals:**

- Scheduling/cron ingestion.
- Ranking or scoring.

**Exit criteria:**

- Each configured source ingests successfully via `/api/ingest`.
- Adding a new source requires no UI changes.

---

## Phase 2.3 – Ingest Reliability & Limits (Epic 5) 🟡 In Progress

**Goal:** Reduce ingest ambiguity and rate-limit risk without adding automation.

**Delivers:**

- Daily ingest cap (server enforced).
- UI indicator for daily cap usage.
- Ingest run tracking endpoint (`/api/ingest/status`).
- Web3 adapter diagnostics (debug counts, date ranges).

**Non-goals:**

- Scheduled/cron ingestion.
- Full scraping fallback.
- Automatic source health retries.

**Exit criteria:**

- User can see remaining ingest capacity.
- Ingest runs expose basic health signals per source.

---

## Phase 2.1 – Daily Decision UX (Closure) ✅

**Goal:** Remove ambiguity and friction from daily decisions.

**Delivers:**

- Actionable Home metrics (Overdue card navigates to items).
- Clear temporal context in discovery (publishedAt / recency).
- Ability to close loops:
  - Reprogram action
  - Mark action as done
  - Archive/close stale applications
- Job row interaction with JD preview (modal/sheet).

**Non-goals:**

- Automation, ranking, agents.

**Exit criteria:**

- User knows what to do today in < 60 seconds.
- Overdue items are resolvable without workaround.
- Discovery decisions do not require opening external sites by default.

---

## Phase 3 – Job Triage & Ranking (Agent-Assisted) 🟡 In Progress

**Goal:** Reduce decision fatigue by filtering and prioritizing jobs using the user’s real profile.

**Delivers:**

- Explicit user profile:
  - Must-have skills
  - Hard-no constraints
  - Preferences
- Two-stage job triage:
  - Coarse filtering (rules / local LLM such as Ollama).
  - Disambiguation for “maybe” cases (LLM, explainable).
- Proposed: OpenAI fallback when Ollama is unavailable (V0 optional).
- Job classification:
  - `shortlist / maybe / reject`
  - Reasons and dealbreakers
- Default view surfaces only “Selected for you”.
- Lightweight scoring (heuristic, not ML-heavy).

**Status update (2026-02-02):**
- ✅ User profile is defined in composition.
- ✅ Job triage fields persist on Job (status/reasons/provider/triagedAt).
- ✅ Coarse triage via Ollama with confidence gating.
- ✅ Jobs UI defaults to shortlist-first + triage badge; reasons live in job detail modal.
- 🟡 OpenAI disambiguation exists but lacks structured schema + daily caps.
- ⏳ Versioned re-triage on profile changes not implemented yet.

**Non-goals:**

- Auto-apply.
- Fully autonomous agents.
- Large-scale scraping.
- Multi-user personalization.

**Exit criteria:**

- User reviews significantly fewer jobs per day.
- High-confidence jobs surface without reading full JDs.
- Every triage decision is explainable (“why this / why not”).

---

## Phase 3.1 – Performance & UX responsiveness ✅ Complete

**Goal:** Make the app feel fast and responsive under Supabase latency.

**Delivers:**

- Parallelized server queries in Home/Jobs/Applications detail.
- Reduced duplicate queries (reuse results or lightweight queries).
- Smaller payloads for list views (select only needed columns).
- Safe caching/revalidation for frequently read lists.

**Non-goals:**

- Major UI redesign.
- Background jobs or realtime subscriptions.

**Exit criteria:**

- Home/Jobs/Applications feel noticeably faster.
- Fewer repository calls per page render.
- No regressions in data freshness for critical actions.

---

## Phase 3.2 – Curation & Manual Capture (Producto) ✅ Complete

**Goal:** Improve curation quality and capture off-source opportunities without breaking the existing triage flow.

**Delivers:**

- Automatic ranking for `shortlist` jobs (score 0–100 + rationale).
- Provider selection via environment variable (Ollama/OpenAI).
- Manual job capture form (source = `Manual`).
- Optional auto-triage for manual jobs when sufficient JD is provided.
- UI: shortlist sorted by rank score with visible ranking reason.

**Non-goals:**

- Manual ranking (drag & drop).
- Auto-apply workflows.
- Multi-user personalization.

**Exit criteria:**

- Shortlist is ordered by rank score with an explainable reason.
- Manual jobs can be created and optionally triaged.
- Ranking respects triage status (only `shortlist` is ranked).

**Status update (2026-02-03):**
- ✅ Ranking for shortlist jobs (0–100 + reason).
- ✅ Provider selection via env.
- ✅ Manual job capture page + optional auto-triage.

---

## Phase 4 – Productivity Automation (Optional)

**Goal:** Reduce follow-up overhead for a single user.

**Delivers:**

- Follow-up reminders.
- Message templates (copy/open LinkedIn or email).
- Calendar nudges.
- Lightweight analytics (conversion by stage/source).

**Non-goals:**

- Full ATS replacement.
- Enterprise integrations.

**Exit criteria:**

- Measurable reduction in missed follow-ups.
- Clear productivity gain for a single user.
