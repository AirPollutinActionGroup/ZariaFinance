# ADR-0002: TanStack Query + context; no Redux/MobX

- Status: Accepted
- Date: 2026-07-03

## Context

The platform brief allows Redux Toolkit only with a compelling documented
reason. Our state inventory: server data (donors, grants, documents), a
session descriptor, and local UI state.

## Consequences / Rationale

- Server data belongs in a request cache with invalidation semantics —
  TanStack Query models staleness, retries and optimistic updates natively;
  a Redux store would re-implement this poorly.
- Session state is a single small object — React context suffices.
- No global mutable domain state exists by design; introducing a store would
  create the very coupling the architecture forbids.
- Revisit trigger: cross-feature client-side workflows with long-lived draft
  state (e.g. budget worksheet editing). Even then, prefer a feature-scoped
  store over an app-global one.
