# ADR-0003: Backend is the immutable source of truth

- Status: Accepted
- Date: 2026-07-03

## Context

The Spring Boot backend (`backend/finance`) pre-exists and is owned by
another workstream. Frontend rewrites of contracts create silent drift.

## Decision

- Endpoints, DTO field names, enum values and validation rules are mirrored
  verbatim (`docs/BACKEND_API.md` is the verified contract).
- Repositories expose exactly one function per real endpoint; nothing is
  invented, stubbed or mocked in production code.
- Mappers may normalise nulls and attach display labels but never rename
  backend fields.
- Missing capability is registered in `docs/BACKEND_GAPS.md` (numbered,
  referenced from code) instead of being faked.

## Consequences

- The UI can only show what the backend can serve — e.g. Budget/Forecast
  modules are absent until their APIs exist (gap #7). This is a feature:
  every number on screen is defensible in an audit.
- Backend contract changes localise to `api/` + `mappers/` per feature.
