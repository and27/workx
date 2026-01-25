# Workx

Workx is a single-user job search execution system: it helps you decide what to do today and keeps a clean timeline of actions taken.

It is built with a Ports & Adapters architecture. By default it runs in **memory mode** (seeded data). When Supabase env vars are present, it uses **Supabase persistence**.

Job discovery foundations are implemented via a manual ingestion flow (Remotive source) and a jobs list with filters. Automated scraping and ranking are future phases (see `ROADMAP.md`).

## Daily Decision Loop

Workx is designed to be opened once per day.

When you open it, it helps you decide:

- Which applications require action today (especially overdue next actions).
- Which new jobs are worth converting into applications.
- What you can safely ignore.

Every feature should reduce decision fatigue and increase execution speed.

## Architecture (Ports & Adapters)

- Domain: `src/domain/**` (framework-agnostic types and entities)
- Ports: `src/ports/**` (stable interfaces)
- Adapters: `src/adapters/**` (memory + optional Supabase)
- Use cases: `src/services/usecases/**` (business rules, writes, audit logs)
- Composition: `src/composition/**` (wire adapters to ports)
- UI: `app/**` (calls use cases only)

## Getting Started

```bash
npm install
```

Create a `.env.local` with Supabase values to enable the Supabase adapter:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_key
```

Apply the schema in `supabase/schema.sql` to your Supabase project.

```bash
npm run dev
```

Open http://localhost:3000

## Manual Job Ingestion (Remotive)

With the dev server running, you can trigger manual ingestion from Remotive:

```bash
curl "http://localhost:3000/api/ingest/remotive?limit=50"
```

This will upsert jobs by `externalId` and make them available in the Jobs page.

## Scripts

- `npm run dev` - local dev server
- `npm run test` - run Vitest
- `npm run lint` - lint

## Notes

- All dates for `nextActionAt` are date-only strings: `YYYY-MM-DD`.
- All writes append an audit log entry via use cases.
