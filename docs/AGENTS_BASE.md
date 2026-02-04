# AGENTS.md — Base (Agnostico)

Este documento es un punto de partida reutilizable para proyectos nuevos. Ajusta lo que aplique a tu stack (Next/Vite/React/TS).

## Propósito

Definir reglas mínimas de contribución: arquitectura, datos, UX, workflow y calidad. No es un roadmap.

## Arquitectura (contratos mínimos)

- Define capas explícitas y límites de importación (ej. dominio, servicios, UI, adaptadores).
- La UI no debe depender de detalles de infraestructura directamente.
- La composición del runtime vive en un solo lugar (composition root).

## Modelado de datos

- IDs como `string` (uuid-like) para consistencia.
- Fechas:
  - ISO strings para timestamps.
  - Para fechas sin hora, usar `YYYY-MM-DD` (date-only).
- Enums cerrados para estados/roles/priority, sin strings libres.
- Cada cambio persistente debe generar audit log o evento (si el dominio lo requiere).

## Semántica de fechas

- Define reglas explícitas para “hoy”, “vencido”, “próximo”.
- Evita comparaciones con timezones implícitos; siempre normaliza.

## UX / Accesibilidad

- Estados obligatorios: loading / empty / error.
- Inputs con labels y botones reales (`<button>`).
- Focus visible.
- No esconder acciones críticas detrás de hover únicamente.

## Workflow (branches, PRs, issues)

- Rama de integración (`dev`) y rama de release (`main`).
- Todo cambio requiere issue/ticket antes de implementarse.
- PRs pequeños con Summary + Testing.
- Incluir `Closes #NN` en el body.

## Calidad / Testing

- Pruebas a lógica de negocio antes que UI.
- Agregar smoke tests manuales mínimos si se tocó UI.

## Migraciones (si hay DB)

- Toda columna nueva requiere migración + actualización de schema.
- No editar migrations ya aplicadas.

## Higiene de merges

- Evita editar el mismo archivo “caliente” en PRs paralelos.
- Rebase antes del PR y revisa el diff final.
