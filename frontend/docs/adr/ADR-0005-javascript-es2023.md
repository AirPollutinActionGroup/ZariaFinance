# ADR-0005: JavaScript (ES2023+), not TypeScript

- Status: Accepted (platform mandate)
- Date: 2026-07-03

## Context

The platform brief mandates JavaScript and forbids TypeScript.

## Decision & mitigations

We accept the mandate and compensate for the missing type layer with:

- **Zod schemas** at every input boundary (forms) mirroring backend validation.
- **Mappers** as the single place DTO shapes are interpreted, unit-tested
  against representative payloads.
- **JSDoc** on public functions (editors surface it; reviewers enforce it).
- **Constants modules** mirroring backend enums so strings are never retyped.
- ESLint (flat config, react-hooks) as the automated correctness net.

## Consequences

Runtime contract drift is caught by tests and Zod rather than a compiler. If
the mandate is ever lifted, the layering (repos/mappers/services) is exactly
where types would attach with minimal churn.
