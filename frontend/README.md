# Zariya Frontend

Enterprise SaaS frontend for **Zariya — the Budgeting, Trading & Reporting Tool** (A-PAG · TCF).
React 19 · JavaScript (ES2023+) · Vite · Material UI · TanStack Query · React Hook Form · Zod · Axios.

The visual language is **premium graphite black** — deep charcoal surfaces with a metallic
gradient accent and platinum foreground (replacing the yellow accent of the review draft).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173, proxies /api → localhost:5174
```

The Spring Boot backend (`backend/finance`) must run on port 5174 (or set
`VITE_PROXY_TARGET`). In the docker-compose deployment nginx performs the same
`/api` routing, so the app only ever calls relative URLs.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server with API proxy |
| `npm run build` | Production build (vendor-chunked) |
| `npm test` | Vitest unit/component suite |
| `npm run test:e2e` | Playwright smoke suite (set `PLAYWRIGHT_CHROMIUM_PATH` to reuse a pre-installed Chromium) |
| `npm run lint` | ESLint (flat config, react-hooks rules) |
| `npm run storybook` | Component workbench for the design system |

## Architecture in one paragraph

Features are self-contained modules registered in `src/app/modules.js`
(Open/Closed: adding a domain touches no existing code). Inside a feature the
dependency flow is strictly `components → hooks → services → api (repositories)
→ Axios client → backend`. The backend is the single source of truth: DTO field
names, enum values and endpoints are mirrored verbatim, never invented. A
declarative permission engine (`src/core/permissions`) gates navigation, routes
and actions by role; the module registry composes routing and the sidebar from
module definitions.

Read next:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the full engineering blueprint
- [`docs/BACKEND_API.md`](docs/BACKEND_API.md) — verified backend contract this app binds to
- [`docs/BACKEND_GAPS.md`](docs/BACKEND_GAPS.md) — missing backend capabilities (blockers listed, none assumed)
- [`docs/adr/`](docs/adr) — architecture decision records
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — delivery tracker
