# UI_REFERENCE — Workx (shadcn new-york / neutral)

## Goal

Notion-like product UI: calm, dense, text-first, low-chrome. Use shadcn components and existing CSS variables/tokens. Do NOT introduce custom color palettes in Phase 0.

## Style Constraints (Hard)

- Use existing shadcn tokens/classes only:
  - `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`,
  - `bg-muted/50`, `hover:bg-muted`, `ring-ring`, `outline-ring/50`.
- No custom hard-coded colors (no hex/rgb) in Phase 0.
- Keep visuals light:
  - minimal borders, minimal shadows, no gradients.
- Prefer density:
  - compact rows, compact controls, minimal padding.

## Layout

### App Shell

- Desktop layout:
  - Left sidebar (fixed width ~240px)
  - Main content area
- Sidebar items:
  - Home
  - Applications
  - Jobs
  - Inbox
- Header per page:
  - Title (h1)
  - Optional description (muted)
  - Toolbar row (filters + actions)

## Home (Dashboard)

Purpose: execution overview (not automation claims).

Sections:

1. Welcome

   - One sentence:
     “Discover, prioritize, and track your job applications.”

2. KPI row (Cards)

   - Total Applications
   - Active Interviews (screen + tech)
   - Overdue Actions
   - Applications This Week

3. Top Matches Today (compact table)

   - Role, Company, Source, Action: Save

4. Recent Activity (list)
   - Latest application log events (status change, next action set, note updated)

## Applications (Primary Working Table)

This is the main “database table”.

### Columns (v1)

- Company
- Role
- Status (inline dropdown)
- Priority (inline dropdown or badge + dropdown)
- Next Action (date-only `YYYY-MM-DD`)
- Source
- Updated

### Behaviors

- Row click opens Application Detail.
- Inline edits must:
  - update application state
  - append an audit log entry
- Filters toolbar (left to right):
  - Search input (text)
  - Status select (multi optional; start single)
  - Priority select
  - Clear button

### Density

- Table rows: compact (prefer `py-2` / `py-2.5`)
- Cells: keep text truncated with tooltip on hover for long values.

## Jobs (Discovery Table)

Purpose: review jobs → convert to applications.

### Columns (v1)

- Role
- Company
- Source
- Location
- Seniority
- Tags (compact badges)
- Action: “Save as Application”

### Behaviors

- Filters:
  - Search (title/company)
  - Tags (optional later)
  - Seniority
  - Source
- Save action creates Application defaults:
  - status = saved
  - priority = medium
  - nextActionAt = tomorrow (DATE-ONLY)

## Inbox

Purpose: daily execution list.

### Sections

- Overdue
- Today
- Upcoming

Each item shows:

- Company + Role
- Status
- Next Action date
  Actions:
- Mark done (clears nextActionAt OR moves to +7 days depending on status rule)
- Reschedule (set date-only)

## Application Detail

Purpose: context + decisions + timeline.

### Layout

- Header: Company + Role
- Controls row:
  - Status
  - Priority
  - Next Action (date-only)
- Notes (textarea)
- Timeline (audit log, newest first)

### Timeline entries

- Created
- Status changed
- Next action set/cleared
- Notes updated

## Interaction Rules

- Prefer inline interactions; avoid modals for core flows.
- Dropdowns/popovers must be shadcn components.
- Keyboard nav should work (tabbing through controls, dropdown selection).

## Copy & Tone

- UI language: Spanish (consistent).
- Avoid claims like “aplica automáticamente”.
- Prefer action-oriented labels:
  - “Guardar”
  - “Crear postulación”
  - “Marcar hecho”
  - “Reprogramar”
