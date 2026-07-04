# Backend API Contract (Phase 1 — Discovery)

Verified against `backend/finance` source on this branch (Spring Boot 4, Java 21,
PostgreSQL + Flyway). **The backend is immutable and the single source of truth**;
this document records what exists — nothing here is aspirational.

Base path: `/api` (nginx and the Vite dev server proxy `/api/*` to the backend on port 5174).

## Donors — `DonorController` (`/api/v1/donors`)

| Method & path | Request | Response | Notes |
| --- | --- | --- | --- |
| `POST /api/v1/donors` | `CreateDonorRequest` | `201 DonorResponse` | `donorCode` unique (`@UniqueDonorCode`) |
| `GET /api/v1/donors/{id}` | — | `200 DonorResponse` | 404 via `ResourceNotFoundException` |
| `GET /api/v1/donors?search=` | — | `200 DonorResponse[]` | unpaginated list; optional search |
| `PUT /api/v1/donors/{id}` | `UpdateDonorRequest` | `200 DonorResponse` | no `donorCode` in update DTO |
| `PATCH /api/v1/donors/{id}/activate` | — | `204` | |
| `PATCH /api/v1/donors/{id}/deactivate` | — | `204` | |

`CreateDonorRequest`: `donorCode`*, `donorName`*, `donorType`*, `fundClass`* (enum),
`email`* (@Email), `phoneNumber`, `website`, `registrationNumber`, `taxId`,
`address`, `cityId`, `stateId`, `country`, `postalCode`.

`DonorResponse` adds: `id`, `status` (DonorStatus), `onboardingStep`, `isActive`,
`contacts[] (DonorContactResponse)`, audit fields (`createdAt/updatedAt/createdBy/updatedBy`).

## Grants — `GrantController` (`/api/v1/grants`)

| Method & path | Request | Response | Notes |
| --- | --- | --- | --- |
| `POST /api/v1/grants` | `CreateGrantRequest` | `201 GrantDetailsResponse` | `@ValidGrantDates` on the class |
| `GET /api/v1/grants/{id}` | — | `200 GrantDetailsResponse` | |
| `GET /api/v1/grants?donorId=&programmeId=&search=` | — | `200 GrantListResponse[]` | exactly one filter applied, priority donorId → programmeId → search |
| `PUT /api/v1/grants/{id}` | `CreateGrantRequest` | `204` | **stub — does not persist** (gap #5) |
| `PATCH /api/v1/grants/{id}/approve` | — | `204` | |
| `PATCH /api/v1/grants/{id}/activate` | — | `204` | |
| `PATCH /api/v1/grants/{id}/close` | — | `204` | |

`CreateGrantRequest`: `grantCode`*, `donorId`*, `programmeId`*, `agreementName`*,
`agreementDate`*, `startDate`*, `endDate`*, `totalGrantAmount`* (@Positive, BigDecimal),
`fundClass`* (enum), `description`, `agreementDocumentPath`. Dates are `LocalDate`
(`YYYY-MM-DD`).

## Documents — `DocumentController` (`/api/v1/documents`)

| Method & path | Request | Response |
| --- | --- | --- |
| `POST /api/v1/documents` | `UploadDocumentRequest` (`grantId`*, `documentName`*, `documentType`*, `documentPath`) | `201 DocumentResponse` |
| `GET /api/v1/documents/{id}` | — | `200 DocumentResponse` |
| `GET /api/v1/documents?grantId=&documentName=` | — | `200 DocumentResponse[]` (documentName → version history) |
| `DELETE /api/v1/documents/{id}` | — | `204` |

## User registration — `UserRegisterController` (`/api/userRegister`)

| Method & path | Request | Response | Notes |
| --- | --- | --- | --- |
| `POST /api/userRegister` | `AddUserRegisterDto` | `201 UserRegisterDto` | validation: `firstName`* ; `emailId`* @Email; `mobileNo`* `^[6-9]\d{9}$`; `username`* 4–20; `password`* 8–100 |
| `GET /api/userRegister` | — | `200 "dddddd"` | stub — unusable (gap #2) |

## Other

- `GET /api/public/messages` → `Message[]` (public healthcheck-style endpoint).
- `UserLoginController` (`/api/userLogin`) — **no endpoints** (gap #1).
- Swagger: `/swagger-ui.html`, `/api-docs` (permitted without auth).

## Enums (mirrored verbatim in `src/features/donor-management/constants.js`)

- `FundClass`: DOMESTIC, INTERNATIONAL, GOVERNMENT, CORPORATE, INDIVIDUAL, NGO
- `DonorStatus`: DRAFT, PENDING_APPROVAL, APPROVED, ONBOARDED, ACTIVE, INACTIVE, SUSPENDED, TERMINATED
- `GrantStatus`: DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE, ON_HOLD, COMPLETED, TERMINATED, CLOSED
- `DocumentType`: AGREEMENT, MOU, FINANCIAL_STATEMENT, AUDIT_REPORT, REPORT, DISBURSEMENT, UTILIZATION, OTHER

## Error envelope (`GlobalExceptionHandler`)

```json
{
  "timestamp": "2026-07-03T10:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Validation failed for one or more fields",
  "path": "/api/v1/donors",
  "errors": { "donorCode": "Donor code is required" }
}
```

Mapped 1:1 by `src/lib/api/ApiError.js`; `errors` feeds React Hook Form field errors.

## Security posture

`SecurityConfig` permits `/`, `/api/public/**` and Swagger; **everything else
requires an authenticated Spring Security session**, yet no authentication
mechanism (form login / HTTP basic / JWT) is configured. CORS allows
`localhost:5173-5175` with credentials. See `BACKEND_GAPS.md` #1 — this is the
most important integration risk.

## Cross-cutting conventions observed

- No pagination, sorting or filtering beyond the query params listed above.
- IDs are `Long`; money is `BigDecimal`; `LocalDate`/`LocalDateTime` ISO strings.
- Audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) on all v1 responses.
- `@JsonInclude(NON_NULL)` on response DTOs — absent fields mean null.
