# ADR-0004: Review mode while backend authentication is missing

- Status: Accepted (temporary by design)
- Date: 2026-07-03

## Context

`/api/userLogin` has no endpoints and `SecurityConfig` wires no authentication
mechanism (gap #1). We refuse to invent a login API or silently fake a signed-in
user; but stakeholders must be able to run and review the application.

## Decision

- `authRepository.login()` rejects with a typed 501 `AUTH_ENDPOINT_MISSING`
  error shown verbatim on the sign-in screen.
- A **"Continue in review mode"** action creates a client-side session named
  "Review Mode" with role from `VITE_REVIEW_MODE_ROLE` (default
  FINANCE_OFFICER) and a permanent badge in the top bar:
  *"Review mode — backend sign-in pending"*.
- The permission engine treats the review session like any other, so
  role-based UX (CEO read-only vs Finance edit) is demonstrable today.

## Consequences

- Honest: nothing pretends to be authenticated; the badge and this ADR make
  the interim state impossible to miss.
- Zero-cost removal: when login ships, implement `authRepository.login()` and
  delete `enterReviewMode` + the login-page button; no other code changes.
- Explicit risk: review mode grants UI capability without server enforcement —
  acceptable only because the backend enforces nothing yet either (gap #3);
  both must land together for production.
