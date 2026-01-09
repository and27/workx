# Workx

Workx is a Phase 0, UI-first job application tracker. It uses a clean
Ports & Adapters architecture with a memory adapter today and a future
database adapter tomorrow.

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
