# Code Review Checklist

Reject the PR if any item fails. Reviewers cite items by number.

## Contract fidelity
1. No invented endpoints — every repository function maps to a verified route in `docs/BACKEND_API.md`.
2. No renamed backend DTO fields or enum values; mappers only normalise/annotate.
3. Missing backend capability is registered in `docs/BACKEND_GAPS.md`, not faked, stubbed or mocked.

## Layering
4. Components contain no business logic and no direct Axios/repository imports.
5. Hooks call services; services call repositories; only repositories touch `lib/api`.
6. No feature imports another feature's internals (public `index.jsx` or a documented read-only hook reuse only).
7. `shared/` and `lib/` import nothing from `features/` or `core/`.

## Modules & permissions
8. New domains register via `app/modules.js` only; router/sidebar untouched.
9. Access checks use `can()` / `usePermission` / `PermissionGate` — never `user.role === '…'` inline.
10. New routes carry the correct `moduleId`; unauthorised access yields 404.

## Forms & errors
11. Every form has a Zod schema mirroring backend validation; server field errors merged via `applyServerErrors`.
12. All async surfaces handle loading, error (with retry where sensible) and empty states — no silent catches.

## Quality
13. Tests accompany logic: mappers, services (repos mocked), schemas, permission-sensitive UI.
14. `npm run lint`, `npm test`, `npm run build` all pass locally.
15. No hardcoded URLs, colours or credentials — env via `lib/config/env.js`, colour via `theme/tokens.js`.
16. No TypeScript, class components, deprecated APIs, TODOs or placeholder code.
17. JSDoc on new modules states responsibility and constraints; ADR added for architectural decisions.

## Security
18. No secrets or tokens in code or storage; session descriptor carries no credentials.
19. No `dangerouslySetInnerHTML`; user input never interpolated into URLs without encoding.
