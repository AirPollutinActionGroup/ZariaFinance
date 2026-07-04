# Zariya Enterprise Frontend — Architecture Blueprint

> Internal engineering standard. Owner: Frontend Platform. Status: v1, living document.
> Companion documents: [BACKEND_API.md](BACKEND_API.md), [BACKEND_GAPS.md](BACKEND_GAPS.md), [adr/](adr), [PROGRESS.md](PROGRESS.md).

## 1. Executive summary

Zariya's frontend is a modular React 19 + Vite platform designed to host an
unbounded number of business domains (Budget, Forecast, Actuals, Variance,
Committed Costs, Donor Management, Reporting, …) over a 10-year horizon. The
first shipped slice is the platform foundation plus the modules the existing
Spring Boot backend can actually serve today: **Dashboard**, **Donor
Management** (donors, grants, documents) and **User Registration**. The
backend is immutable and the single source of truth; every DTO field, enum
value and endpoint is mirrored verbatim, and missing capability is registered
in BACKEND_GAPS.md rather than faked. The visual system is *premium graphite
black* (ADR-0006).

## 2. High-level architecture

```
┌────────────────────────────────────────────────────────────┐
│  app/            composition root (providers, router,      │
│                  layout shell, module registration)        │
├────────────────────────────────────────────────────────────┤
│  features/*      self-owned business modules               │
│    pages → components → hooks → services → api(repos)      │
├────────────────────────────────────────────────────────────┤
│  core/           auth · permissions · module registry      │
│  shared/         presentation-only component library       │
│  lib/            api client · query client · config ·      │
│                  formatting · form utilities               │
├────────────────────────────────────────────────────────────┤
│  theme/          design tokens + MUI theme (graphite)      │
└────────────────────────────────────────────────────────────┘
            │  Axios (relative /api, cookie session)
            ▼
   nginx ──► Spring Boot backend ──► PostgreSQL
```

Dependency rules (enforced in review):

- `features` may import from `core`, `shared`, `lib`, `theme` — never from another feature's internals (the one sanctioned cross-feature import is a module's public `index.jsx`, or documented read-only reuse such as the dashboard consuming donor-management hooks).
- `shared` and `lib` never import from `features` or `core`.
- Only `features/*/api/*` and `core/auth/authRepository.js` may touch the Axios client.

## 3. Folder structure

```
src/
├─ app/                     # composition root
│  ├─ App.jsx               # providers + router
│  ├─ modules.js            # THE module registration point (Open/Closed)
│  ├─ providers/AppProviders.jsx
│  ├─ router/               # AppRouter, HomeRedirect, RequireModuleAccess
│  └─ layout/               # AppShell, SideNav, TopBar, BrandMark
├─ core/
│  ├─ auth/                 # AuthContext, RequireAuth, authRepository, sessionStorage
│  ├─ permissions/          # policy table, engine, usePermission, PermissionGate
│  └─ modules/              # moduleRegistry
├─ shared/components/       # PageHeader, DataTable, StatCard, StatusChip, forms…
├─ lib/                     # api/, query/, config/, format/, forms/
├─ theme/                   # tokens.js (all colour decisions), theme.js
└─ features/
   ├─ dashboard/            # pages/ services/ index.jsx
   ├─ donor-management/     # api/ mappers/ services/ hooks/ validation/
   │                        # components/ pages/ constants.js index.jsx
   ├─ registration/         # api/ services/ validation/ pages/
   └─ auth-pages/           # Login, PendingApproval, NotFound, AuthLayout
```

## 4. Feature architecture

Every feature owns its full vertical slice. Canonical flow (Donor Management):

```
DonorsListPage ──uses──► useDonors (TanStack Query hook)
                             │
                             ▼
                       donorService        ← business logic, mapping
                             │
                             ▼
                        donorApi (repo)    ← one function per endpoint
                             │
                             ▼
                        http (Axios)       ← baseURL /api, ApiError normalisation
```

Components contain zero business logic; services contain zero JSX; repositories
contain zero mapping. Each layer is independently testable (see §15).

## 5. Authentication

The backend uses Spring Security cookie sessions but currently exposes **no
login endpoint** (gap #1). The design keeps the entire capability behind
`core/auth/authRepository.js`:

- `login()` fails fast with a typed `ApiError (501, AUTH_ENDPOINT_MISSING)` whose
  message is surfaced verbatim on the sign-in screen.
- **Review mode** (ADR-0004) creates an explicit, visibly-badged client-side
  session with a configurable role so the platform is usable while the backend
  catches up. It is labelled in the top bar and never impersonates a real user.
- Registration is real: `POST /api/userRegister`, then the pending-approval
  screen (accounts activate only after manual approval by
  technology@a-pag.org — statuses PENDING_APPROVAL/APPROVED/REJECTED/
  SUSPENDED/DISABLED are the agreed contract, `USER_STATUS` in code).
- Session descriptor (name, role, status, mode — no credentials) persists in
  `sessionStorage`; the security session itself is the backend cookie.

When login ships, only `authRepository.js` changes.

## 6. Authorization

Declarative policy table in `core/permissions/permissions.js`:

| Role | Scope | Actions |
| --- | --- | --- |
| CEO | all modules (wildcard) | view, comment |
| FINANCE_OFFICER (Accounts) | all modules | view, edit, comment, approve |
| FUNDRAISING_LEAD | donor-management only | view, edit, comment |

- `can(user, action, moduleId)` is a pure function (unit-tested); non-APPROVED
  account statuses are denied everything.
- Enforcement layers: sidebar (registry filters by VIEW), routes
  (`RequireModuleAccess` renders 404, not 403, to avoid leaking route
  existence), actions (`<PermissionGate>` / `usePermission`).
- Frontend permissions are UX guardrails until backend authorisation exists
  (gap #3) — this is stated, not hidden.

## 7. Routing

React Router v7, `BrowserRouter`. Public routes (`/login`, `/register`,
`/pending-approval`) sit outside `RequireAuth`; everything else nests under
the guard + `AppShell`. Module routes come exclusively from the registry —
the router never names a business feature. `HomeRedirect` sends users to the
first module their role can see.

## 8. State management

- **Server state**: TanStack Query only. Hierarchical query keys
  (`lib/query/queryKeys.js`) allow subtree invalidation; mutations invalidate
  at the domain root. staleTime 30s; no retry on 4xx.
- **Session state**: React context (`AuthProvider`).
- **UI state**: local `useState` inside components.
- **No Redux/MobX** (ADR-0002): no client-global mutable domain state exists;
  server cache + context cover current and forecast needs.

## 9. API layer

Single Axios instance (`lib/api/apiClient.js`): relative `/api` base URL (nginx
and Vite proxy), `withCredentials`, 30s timeout, and a response interceptor that
converts every failure into `ApiError` — the backend's `ErrorResponse` envelope
(timestamp/status/error/message/path/errors) mapped 1:1, including per-field
validation errors. Repositories are the only Axios consumers.

## 10. Business logic

Lives in feature `services/` (pure orchestration + domain rules such as
`grantService.availableActions`) and `mappers/` (DTO ↔ view/form models —
backend names preserved, only null-normalisation and display labels added).
Dashboard aggregation is a pure function over real endpoint data — the
platform renders no number a backend record cannot justify.

## 11. Shared components

`shared/components` is presentation-only: `PageHeader`, `StatCard` (with the
graphite `highlight` variant), `StatusChip` (tone-mapped pills matching the
approved register design), `DataTable` (canonical loading/error/empty/data
states), `ConfirmDialog`, `SearchField` (debounced), `LoadingState`,
`ErrorState`, `EmptyState`, RHF bindings (`RhfTextField`, `RhfSelect`).
Domain components own enum→tone mappings; shared components never import
feature code.

## 12. Forms

React Hook Form + Zod via `zodResolver`. Every schema mirrors the backend's
bean validation (same rules, same messages where the backend defines them);
`lib/forms/applyServerErrors.js` merges `ApiError.fieldErrors` into RHF so
server rejections land on the exact field. Codes are immutable in edit mode
when the update DTO omits them (e.g. `donorCode`).

## 13. Performance

- Vendor chunking (react / mui / data) keeps app-code deploys from busting
  framework caches; gzip total ≈ 229 kB.
- Query caching prevents duplicate fetches across dashboard/list/detail.
- Debounced search; memo-free by default (measure before memoising).
- Self-hosted Inter Variable (no third-party font requests).

## 14. Error handling

One taxonomy: `ApiError` with `isNetworkError/isValidationError/isNotFound/
isAuthError`. Queries render `ErrorState` with retry; mutations surface field
errors into forms and a summary alert otherwise. Unknown failures show the
backend message when present, a safe generic otherwise. No silent catches.

## 15. Testing strategy

| Level | Tool | What |
| --- | --- | --- |
| Unit | Vitest | permission engine, module registry, ApiError mapping, mappers, services (repos mocked), formatters, schemas |
| Component | RTL + jsdom | pages with mocked services + real providers (e.g. permission-gated actions on DonorsListPage) |
| E2E | Playwright | auth redirect, review-mode shell, registration validation |
| Visual/dev | Storybook | shared design-system components |

38 unit/component tests + 3 e2e tests pass in CI-equivalent runs. Test seams:
services mock repositories; pages mock services; the registry exposes
`clearRegistryForTests()`.

## 16. Coding standards

ES2023 modules, functional components + hooks only, no classes, no default
exports (except config files that require them), one component per file,
JSDoc on every non-trivial module. ESLint flat config with
`react-hooks` (latest rules incl. `set-state-in-effect`) is CI-blocking.
Naming: `PascalCase.jsx` components, `camelCase.js` modules, feature ids in
kebab-case. Comments state constraints, not narration.

## 17. Security

- No tokens in localStorage; the auth session is a backend cookie, the UI
  descriptor holds no credentials.
- All requests same-origin relative `/api` (no CORS wildcarding; backend CORS
  allows credentials from dev origins only).
- Zod validation before any payload leaves the client; server revalidates.
- React escapes output; no `dangerouslySetInnerHTML` anywhere.
- Route guards fail closed (unknown role/module ⇒ no access, 404 not 403).
- Review mode is explicit and visible — it cannot silently masquerade as auth.

## 18. Scalability

Adding module N+1: create `features/<name>/` with the standard skeleton,
export a module definition, add one `registerModule` line in `app/modules.js`.
Nothing else changes — nav, routing and permissions compose from the
definition. Team ownership maps to feature folders (CODEOWNERS-ready);
cross-feature contact is limited to public `index.jsx` exports.

## 19. Donor Management module (complete)

- **Donors**: register list (search, status/fund-class chips), create, edit
  (code immutable), detail (profile, contacts, grants), activate/deactivate
  with confirmation. Endpoints: all six of `DonorController`.
- **Grants**: pipeline list (search), create (donor picked from live register;
  programmeId numeric pending gap #4), detail with lifecycle actions
  approve/activate/close mapped to `GrantController` transitions and gated on
  the APPROVE permission; grant editing intentionally absent (backend stub,
  gap #5).
- **Documents**: per-grant register, metadata upload (path-based per backend
  contract, gap #6), versions display, delete with confirmation.
- Full layer stack with tests at mapper/service/schema/page level.

## 20. Architecture diagrams

See §2 (system layers) and §4 (feature flow). Module registration:

```
features/donor-management/index.jsx ─┐
features/dashboard/index.jsx ────────┼─► app/modules.js ─► core/modules registry
(future: budget, forecast, …) ───────┘        │
                       ┌──────────────────────┼──────────────────────┐
                       ▼                      ▼                      ▼
                 AppRouter routes      SideNav sections      permission moduleIds
```

## 21. Common enterprise mistakes (and how this codebase avoids them)

1. Axios calls inside components → repositories only, lint-reviewable import rule.
2. Hardcoded URLs/permissions → env.js + policy table.
3. Client state framework for server data → TanStack Query cache.
4. Renaming backend fields "for cleanliness" → mappers preserve names verbatim.
5. Fake data to fill design gaps → BACKEND_GAPS.md instead.
6. God-shared folder → shared is presentation-only; domain stays in features.
7. Permission checks sprinkled as `user.role === '…'` → single `can()` engine.
8. Unbounded module coupling → registry + one-line registration.
9. Swallowed errors → ApiError taxonomy + canonical state components.
10. Storing credentials client-side → cookie session only.

## 22. Code review checklist

Maintained separately: [CODE_REVIEW_CHECKLIST.md](CODE_REVIEW_CHECKLIST.md).

## 23. Architecture decision records

[adr/](adr): ADR-0001 module registry · ADR-0002 no Redux · ADR-0003 backend
as source of truth · ADR-0004 review mode pending backend auth · ADR-0005
JavaScript not TypeScript · ADR-0006 graphite design system.

## 24. Deployment strategy

Docker-compose topology (repo root): nginx gateway (:83) → frontend (Vite,
:5173) + backend (:5174). The frontend container currently runs the dev
server for team development; production promotes `npm run build` output to a
static nginx layer (same relative `/api` contract, no code change). Config is
build-time via `VITE_*` variables documented in `.env.example`.

## 25. CI/CD recommendations

Pipeline per PR: `npm ci` → `lint` → `test` (Vitest) → `build` → Playwright
smoke (with `PLAYWRIGHT_CHROMIUM_PATH` on pre-provisioned runners) →
`build-storybook` as artefact. Merge to main deploys behind the nginx
gateway; rollback = redeploy previous image (static assets are immutable and
content-hashed).

## 26. Observability & monitoring

Today: ApiError carries backend `path`/`status` for supportable error surfaces;
React Query Devtools in dev. Next (when an APM key exists): wire a reporter in
`lib/api/apiClient.js` (single seam) for failed requests, plus web-vitals
reporting from `main.jsx`. Never log payloads containing donor PII.

## 27. Versioning strategy

App version in `package.json` (semver, displayed in the sidebar footer as the
release label). The backend API is versioned in the path (`/api/v1`); a v2
would add new repository modules side-by-side rather than mutating v1 repos.
Query keys embed no version — cache resets on deploy.

## 28. Documentation standards

Every module: JSDoc header stating responsibility and constraints. Every
architectural decision: ADR. Every backend mismatch: numbered gap entry
referenced from code comments (`gap #4`). Docs live with the code and change
in the same PR as the behaviour they describe.
