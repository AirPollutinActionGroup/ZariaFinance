# ADR-0001: Plug-and-play module registry

- Status: Accepted
- Date: 2026-07-03

## Context

Zariya must host an unbounded set of business domains over a decade. Naive
growth (router imports every page, sidebar hardcodes every link) makes each
new module a cross-cutting change and each removal a risky sweep.

## Decision

Features export a **module definition** (`id`, `title`, `navSection`,
`navItems`, `routes`) from their `index.jsx`. A tiny registry
(`core/modules/moduleRegistry.js`) composes routing and navigation, filtered
by the permission engine. `app/modules.js` is the single registration point.

## Consequences

- Adding/removing a domain is one folder + one line (Open/Closed).
- The shell (router, sidebar) has zero knowledge of business features.
- Module ids double as permission scope keys — one identity per domain.
- Trade-off: all module code is statically imported today; if bundle size
  becomes a concern, definitions can adopt `React.lazy` per route without
  changing the registry contract.
