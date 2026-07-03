# ADR-0006: Premium graphite black design system

- Status: Accepted
- Date: 2026-07-03

## Context

The review-draft design used a yellow accent (logo tile, active nav item,
highlight KPI card). Direction: replace yellow with a **premium graphite
black** identity while keeping the approved layout (dark sidebar, light
content, register-style tables, status chips).

## Decision

- All colour flows from `src/theme/tokens.js`: a 12-step graphite scale,
  an accent object (graphite gradient + platinum/silver foregrounds + hairline
  border) and a semantic set (success/error/warning/info) reserved for status.
- The yellow surfaces map to graphite: brand tile, active nav pill and the
  highlight `StatCard` use `accent.gradient` with platinum text.
- Components never hardcode hex values; MUI component defaults are themed
  centrally (`theme.js`).
- Typography: self-hosted Inter Variable (no external font requests).

## Consequences

- Rebranding (or restoring an accent colour) is a tokens-file change.
- Status colours remain semantic and are never used decoratively, preserving
  the favourable/adverse visual coding required by the scope document.
