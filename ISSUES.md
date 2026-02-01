# Issues (GitHub mirrors)

This file mirrors the issue descriptions created in GitHub for Phase 3 + Epic 4.

## Phase 3

### Phase 3.3: Ollama coarse triage with confidence (status:ready) (#20)

Context
- Phase 3 requires coarse triage with confidence and tags (Ollama).

Scope
- Extend JobTriage decision to include confidence (0–1) and tags[] from Ollama JSON.
- Parse structured JSON from Ollama: decision, confidence, reasons[], tags[].
- Accept decision when confidence >= 0.75; otherwise keep status "maybe".
- Persist triage output (status, reasons, provider, triagedAt).

Acceptance Criteria
- Ollama prompt and parser return decision + confidence + reasons + tags.
- confidence >= 0.75 accepts decision; lower confidence yields status "maybe".
- Results are persisted via jobRepository.updateTriage.
- No OpenAI usage in this issue.

Out of scope
- OpenAI disambiguation and caps.
- Background jobs/scheduling.

### Phase 3.4: OpenAI disambiguation (structured output + caps) (#21)

Context
- Some jobs are ambiguous and require higher-quality reasoning.

Scope
- Implement OpenAI disambiguation for triage "maybe" decisions.
- Use OpenAI Responses API with structured output.
- Enforce a hard cap of N calls/day (configurable).
- Persist final triage decision when OpenAI returns a result.

Acceptance Criteria
- Responses API used with a JSON schema output that includes:
  - finalDecision
  - fitScore (0–100)
  - reasons[]
  - dealbreakers[]
  - matchedSkills[]
  - missingSkills[]
  - recommendedNextAction
- OpenAI is called only for "maybe" or low-confidence cases.
- Daily cap enforced and surfaced (skip when cap reached).
- Final triage persists on job.

Out of scope
- Calling OpenAI for every job.
- Fine-tuning models.

### Phase 3.5: Selected for you default + modal reasons (#22)

Context
- Phase 3 requires the jobs list to surface the highest-signal items first.

Scope
- Default jobs view shows shortlist results first (Selected for you).
- Triage badge appears in rows; triage reasons live in the job detail modal only.
- Keep filters for Selected / Maybe / Rejected.

Acceptance Criteria
- Default view is shortlist-first (no manual filter required).
- Job rows display triage badge (shortlist/maybe/reject).
- Job detail modal displays triage reasons when present.
- No ranking UI beyond simple ordering.

Out of scope
- Editable scoring sliders.
- Advanced analytics.

### Phase 3.6: Versioned triage re-run (#23)

Context
- When the user profile changes, existing triage results may become invalid.

Scope
- Add profileVersion to UserProfile.
- Add triageVersion to Job.
- When versions mismatch, mark job as "needs re-triage" and surface in UI or filters.

Acceptance Criteria
- profileVersion and triageVersion are stored in domain/ports/adapters.
- Mismatch triggers a needs-retriage state (no background job required).
- Triage can be re-run manually.

Out of scope
- Real-time streaming re-triage.
- Historical diffing.

## Epic 4 - Job Sources

### Epic 4: Add We Work Remotely job source (#24)

Context
- Expand job ingestion sources beyond Remotive.

Scope
- Add adapter at src/adapters/wwr/job-source.ts implementing jobSource.
- Map WWR fields to jobSourceRecord (source, externalId, role, company, location, seniority, tags, description, sourceUrl, publishedAt).
- Filter/normalize tags and seniority.
- Update composition to allow selecting WWR source.

Acceptance Criteria
- WWR adapter returns a normalized list of jobSourceRecord.
- Ingestion works when source="WWR" (We Work Remotely).
- No UI changes required.

Out of scope
- Scraping; use official feed/API only.

### Epic 4: Add Remote OK job source (#25)

Context
- Expand job ingestion sources beyond Remotive.

Scope
- Add adapter at src/adapters/remote-ok/job-source.ts implementing jobSource.
- Map Remote OK fields to jobSourceRecord (source, externalId, role, company, location, seniority, tags, description, sourceUrl, publishedAt).
- Filter/normalize tags and seniority.
- Update composition to allow selecting Remote OK source.

Acceptance Criteria
- Remote OK adapter returns a normalized list of jobSourceRecord.
- Ingestion works when source="Remote OK".
- No UI changes required.

Out of scope
- Scraping; use official feed/API only.

### Epic 4: Add Web3 Jobs job source (#26)

Context
- Expand job ingestion sources to include Web3 roles.

Scope
- Add adapter at src/adapters/web3-jobs/job-source.ts implementing jobSource.
- Map Web3 Jobs fields to jobSourceRecord (source, externalId, role, company, location, seniority, tags, description, sourceUrl, publishedAt).
- Filter/normalize tags and seniority.
- Update composition to allow selecting Web3 Jobs source.

Acceptance Criteria
- Web3 Jobs adapter returns a normalized list of jobSourceRecord.
- Ingestion works when source="Web3 Jobs".
- No UI changes required.

Out of scope
- Scraping; use official feed/API only.

### Epic 4: Multi-source job ingestion routing (#27)

Context
- Multiple sources will coexist (Remotive + WWR + Remote OK + Web3 Jobs).

Scope
- Create a composite jobSource that routes by query.source.
- Support ingesting a specific source or all sources.
- Update composition root to use the composite.
- Add/extend API routes for each source or a generic /api/ingest endpoint.

Acceptance Criteria
- jobSource can ingest a single source or all sources.
- Remotive behavior remains unchanged.
- New sources can be added without UI changes.

Out of scope
- Scheduling or cron ingestion.
