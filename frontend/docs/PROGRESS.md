# Delivery Progress Tracker

Last updated: 2026-07-03

## Phase 1 — Backend discovery ✅
- [x] Repository analysed (controllers, DTOs, enums, validation, security, error handling)
- [x] Contract documented — `BACKEND_API.md`
- [x] Gaps & risks registered — `BACKEND_GAPS.md` (9 numbered gaps)

## Phase 2 — Architecture blueprint ✅
- [x] `ARCHITECTURE.md` (28 sections) + 6 ADRs

## Phase 3 — Frontend foundation ✅
- [x] Vite + React 19 project, ESLint flat config
- [x] Graphite design tokens + MUI theme, Inter Variable
- [x] App shell (sidebar/topbar) matching approved layout
- [x] Module registry (Open/Closed) + permission engine + guards
- [x] Auth provider, session persistence, review mode (ADR-0004)
- [x] Axios client + ApiError taxonomy + query client/keys
- [x] Shared component library + RHF/Zod bindings

## Phase 4 — Features ✅ (backend-supported scope)
- [x] Dashboard (live aggregation of donors/grants; graphite highlight KPI)
- [x] Donor Management — donors (list/search/create/edit/detail/activate/deactivate)
- [x] Donor Management — grants (list/search/create/detail/approve/activate/close)
- [x] Donor Management — documents (register/upload metadata/versions/delete)
- [x] User registration (real endpoint) + pending-approval flow

## Phase 5 — Validation ✅
- [x] 38 Vitest unit/component tests passing
- [x] 3 Playwright e2e smoke tests passing
- [x] `npm run lint` clean; production build clean (vendor-chunked)
- [x] Storybook workbench configured with design-system stories

## Blocked on backend (see BACKEND_GAPS.md)
- [ ] Real sign-in (gap #1) → replace review mode
- [ ] User administration & approval workflow (gap #2, #3)
- [ ] Programme/state/city pickers (gap #4)
- [ ] Grant editing (gap #5) · binary document upload (gap #6)
- [ ] Budget · Forecast · Actuals · Variance · Committed · Unassigned ·
      Donor Mapping allocations · Optimiser · Reports (gap #7)
