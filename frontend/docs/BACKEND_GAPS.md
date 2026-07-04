# Backend Gaps — required before further frontend scope

Platform rule: **the frontend never invents endpoints**. Where backend
capability is missing, the frontend stops at a documented seam and this
register is the demand signal to the backend team. Numbered gaps are
referenced from code comments.

## #1 — No authentication endpoint (CRITICAL)

`UserLoginController` (`/api/userLogin`) has zero endpoints, and
`SecurityConfig` configures no authentication mechanism while requiring
authentication on all non-public routes. In a strict deployment every
`/api/v1/**` call is unauthorised.

*Frontend seam:* `src/core/auth/authRepository.js` (the only file to change
when login ships). Interim: explicit, visibly-labelled **review mode**
(ADR-0004) with the role from `VITE_REVIEW_MODE_ROLE`.

**Needed:** login/logout/current-user endpoints returning the user's role and
account status.

## #2 — No user administration API

The scope requires manual approval by technology@a-pag.org with statuses
Pending Approval / Approved / Rejected / Suspended / Disabled. The backend's
`users.status` is a single boolean, `role` a free string, `GET /api/userRegister`
is a stub returning `"dddddd"`.

**Needed:** user list endpoint, status transition endpoints, status enum +
role enum on the users table. Frontend constants already define the agreed
status contract (`src/core/permissions/permissions.js`).

## #3 — Role model not persisted

Roles CEO / FINANCE_OFFICER / FUNDRAISING_LEAD are enforced by the frontend
permission engine, but the backend has no authorisation and stores role
`"USER"` by default. Until backend authorisation exists, frontend permissions
are a UX safeguard, not a security boundary.

## #4 — No master-data endpoints (programmes, states, cities)

`Programme`, `StateMaster`, `CityMaster`, `DistrictMaster` entities and
repositories exist but no controllers. `CreateGrantRequest.programmeId` and
donor `cityId`/`stateId` therefore cannot be picked from a list; the UI takes
validated numeric IDs with a labelled gap note.

**Needed:** `GET /api/v1/programmes`, `GET /api/v1/states`, `GET /api/v1/cities?stateId=`.

## #5 — Grant update is a stub

`PUT /api/v1/grants/{id}` returns 204 without persisting. Grant editing is
deliberately absent from the UI until this is implemented.

## #6 — No binary document upload

`POST /api/v1/documents` accepts a `documentPath` string, not file bytes.
The upload dialog registers metadata + path; a multipart endpoint is needed
for true uploads.

## #7 — Core finance modules have no API

Budget, Forecast, Actuals, Variance, Committed Costs (Trading), Unassigned
Funding, Donor Mapping (allocation percentages), Optimiser and Reporting are
specified in the scope document but have **no backend endpoints**. They are
not rendered in the app (no fake data); each becomes a module registered in
`src/app/modules.js` when its API ships.

## #8 — No pagination

All list endpoints return full collections. Acceptable at current volumes;
the repository layer isolates the change when `Pageable` params arrive.

## #9 — Donor contacts API missing

`CreateDonorContactRequest` and `DonorContactResponse` DTOs exist and
contacts are embedded in `DonorResponse`, but there is no endpoint to add or
edit contacts. The UI renders contacts read-only via the donor detail payload.

## #10 — Donor register schema extension (requested by business)

The approved donor register (see `docs/design-preview.html`, Donors screen)
requires fields that `DonorMaster`/`DonorResponse` do not carry today:

| Field | Notes |
| --- | --- |
| `donorSource` | Acquisition channel (CSR partnership, campaign, referral…) |
| `fcraApplicable` | Boolean compliance flag for foreign funds |
| `foreignFundSourceType` | e.g. Foreign Foundation / Foreign Corporate Philanthropy |
| `foreignCountryName` | Domicile country for FCRA reporting |
| `contactPerson` | Primary contact (exists only inside DonorContact today) |
| `panCardNumber` | Statutory identifier |
| `bankAccountRef` | Receiving account reference (masked in list views) |
| `mouDocumentLink` | Link to the signed MoU (could reuse GrantDocument with type MOU) |

Existing fields already covering register columns: `id`, `donorCode`,
`donorName`, `donorType`, `fundClass` (domicile), `email`, `phoneNumber`,
`address`, `isActive`, `createdAt`, `updatedAt`.

**Needed:** columns + DTO fields (or a donor-level document/contact join)
so the frontend can render the full compliance register without derivation.
