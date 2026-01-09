# Workx

Workx is a job application tracker built with a clean Ports & Adapters
architecture. It runs with the memory adapter by default and can use
Supabase for persistence when env vars are present.

## Architecture (Ports & Adapters)

- Domain: `src/domain/**` (framework-agnostic types and entities)
- Ports: `src/ports/**` (stable interfaces)
- Adapters: `src/adapters/**` (Phase 0 uses memory)
- Use cases: `src/services/usecases/**` (business rules and logs)
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

## Scripts

- `npm run dev` - local dev server
- `npm run test` - run Vitest
- `npm run lint` - lint

## Notes

- All dates for `nextActionAt` are date-only strings: `YYYY-MM-DD`.
- All writes append an audit log entry via use cases.
