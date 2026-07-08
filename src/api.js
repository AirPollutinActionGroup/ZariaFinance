/**
 * Backend API client for the Zariya donor module.
 *
 * Endpoints mirror branch `fet--UserAndDonorModule` of Jaimin020/ZariaFinance
 * (Spring Boot, base path /api). Nothing here is invented:
 *
 *   DonorController      /api/v1/donors            POST · GET/{id} · GET?search= · PUT/{id}
 *                                                  PATCH /{id}/activate · /{id}/deactivate
 *   GrantController      /api/v1/grants            POST · GET/{id} · GET?donorId=|programmeId=|search=
 *                                                  PUT/{id} · PATCH /{id}/approve · /activate · /close
 *   ProgrammeController  /api/v1/programmes        GET
 *   GeographyController  /api/v1/geography/states  GET
 *                        /api/v1/geography/cities  GET?stateId=
 *   DocumentController   /api/v1/documents         POST · GET/{id} · GET?grantId=&documentName= · DELETE/{id}
 *   UserLoginController  /api/userLogin            POST {username, password}
 *   UserRegisterController /api/userRegister       POST (AddUserRegisterDto)
 *
 * Entities WITHOUT backend endpoints on that branch (fund profiles, tranches,
 * utilisation & disbursement rules) remain client-side state — see store.jsx.
 */

const BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';
const TIMEOUT_MS = 8000;

async function http(method, path, body, params) {
  const url = new URL(BASE + path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && v !== '' && url.searchParams.set(k, v));
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      /* Backend error envelope: {timestamp,status,error,message,path,errors} */
      let payload = null;
      try { payload = await res.json(); } catch { /* non-JSON error body */ }
      const err = new Error((payload && (payload.message || payload.error)) || `HTTP ${res.status}`);
      err.status = res.status;
      err.fieldErrors = payload && payload.errors;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  } finally {
    clearTimeout(timer);
  }
}

/* ── raw endpoints (names/paths verbatim from the branch controllers) ── */
export const endpoints = {
  listDonors: (search) => http('GET', '/v1/donors', null, { search }),
  getDonor: (id) => http('GET', `/v1/donors/${id}`),
  createDonor: (req) => http('POST', '/v1/donors', req),
  updateDonor: (id, req) => http('PUT', `/v1/donors/${id}`, req),
  activateDonor: (id) => http('PATCH', `/v1/donors/${id}/activate`),
  deactivateDonor: (id) => http('PATCH', `/v1/donors/${id}/deactivate`),

  listGrants: (filters = {}) => http('GET', '/v1/grants', null, filters),
  getGrant: (id) => http('GET', `/v1/grants/${id}`),
  createGrant: (req) => http('POST', '/v1/grants', req),
  approveGrant: (id) => http('PATCH', `/v1/grants/${id}/approve`),
  activateGrant: (id) => http('PATCH', `/v1/grants/${id}/activate`),
  closeGrant: (id) => http('PATCH', `/v1/grants/${id}/close`),

  listProgrammes: () => http('GET', '/v1/programmes'),
  listStates: () => http('GET', '/v1/geography/states'),
  listCities: (stateId) => http('GET', '/v1/geography/cities', null, { stateId }),

  listDocuments: (grantId, documentName) => http('GET', '/v1/documents', null, { grantId, documentName }),
  uploadDocument: (req) => http('POST', '/v1/documents', req),
  deleteDocument: (id) => http('DELETE', `/v1/documents/${id}`),

  login: (username, password) => http('POST', '/userLogin', { username, password }),
  registerUser: (dto) => http('POST', '/userRegister', dto),
};

/* ── DTO → app-model mappers (backend field names preserved on the wire) ── */

/** DonorStatus enum → the app's two donor statuses (Active | Draft). */
const donorStatus = (dto) =>
  dto.status === 'ACTIVE' || (dto.isActive && !['DRAFT', 'PENDING_APPROVAL'].includes(dto.status))
    ? 'Active'
    : 'Draft';

/** DonorResponse → app donor. Fields absent from the API map to null (UI shows "missing"). */
export function mapDonor(dto) {
  const domicile = dto.fundClass === 'INTERNATIONAL' ? 'Foreign' : 'Domestic';
  const primary = (dto.contacts || []).find((c) => c.isPrimary) || (dto.contacts || [])[0];
  return {
    id: String(dto.id),
    code: dto.donorCode,
    name: dto.donorName,
    source: dto.donorType || '—',
    type: dto.donorType || '—',
    domicile,
    fcra: domicile === 'Foreign',
    foreignType: domicile === 'Foreign' ? 'Foreign' : 'Domestic / NA',
    country: dto.country || null,
    contact: primary ? primary.contactName : '—',
    email: dto.email || '—',
    phone: dto.phoneNumber || '—',
    address: [dto.address, dto.cityName, dto.stateName, dto.postalCode].filter(Boolean).join(', ') || '—',
    pan: dto.taxId || null,
    bankRef: null, /* no bank-account field in DonorResponse */
    active: Boolean(dto.isActive),
    status: donorStatus(dto),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    mou: null, /* MoU lives in the grant document register */
    onboarding: donorStatus(dto) === 'Draft'
      ? { fundMode: false, fundClass: false, pan: Boolean(dto.taxId), bankRef: false, financeApproved: false }
      : undefined,
  };
}

/**
 * The branch exposes no fund-profile API; until it does, an API donor gets a
 * placeholder profile in "pending" state (honest: rules unconfirmed).
 */
export function placeholderProfile(donor) {
  return {
    id: `FP-${donor.id}`,
    donorId: donor.id,
    mode: null,
    cls: 'pending',
    purpose: 'Fund-use rules not yet captured via API',
    tied: false,
    prog: null,
    freq: null,
    adminAllowed: null,
    overhead: null,
    movement: false,
    explain: false,
    onboarded: donor.status === 'Active',
  };
}

/** GrantStatus enum → app grant status; the donor-draft block rule is applied by the caller. */
const grantStatus = (s) => (['CLOSED', 'COMPLETED', 'TERMINATED'].includes(s) ? 'Closed' : 'Active');

/** GrantListResponse/GrantDetailsResponse → app grant (INR-only until FX lands in the API). */
export function mapGrant(dto, donorsById) {
  const donor = dto.donorId != null
    ? donorsById.get(String(dto.donorId))
    : [...donorsById.values()].find((d) => d.name === dto.donorName);
  const status = donor && donor.status !== 'Active' ? 'Blocked' : grantStatus(dto.grantStatus);
  return {
    id: String(dto.id),
    donorId: donor ? donor.id : null,
    fp: donor ? `FP-${donor.id}` : null,
    name: dto.agreementName,
    ref: dto.grantCode,
    start: dto.startDate,
    end: dto.endDate,
    ccy: 'INR',
    fx: 1,
    amount: Number(dto.totalGrantAmount) || 0,
    status,
    approved: '—', /* approver identity not exposed by the API */
    utilisedInr: 0, /* utilisation posts from Actuals; no endpoint yet */
  };
}

/** ProgrammeListResponse → app programme (shape used by P() lookups). */
export function mapProgramme(dto) {
  return {
    id: String(dto.id),
    code: dto.programmeCode,
    name: dto.programmeName,
    desc: '',
    active: Boolean(dto.isActive),
    kind: dto.programmeCode === 'PRG-CORE' || dto.programmeCode === 'PRG-HOLD' ? 'pool' : 'delivery',
  };
}

/** One-shot hydration used by the store at boot. */
export async function fetchAll() {
  const [donorDtos, grantDtos, programmeDtos] = await Promise.all([
    endpoints.listDonors(),
    endpoints.listGrants(),
    endpoints.listProgrammes().catch(() => []),
  ]);
  const donors = donorDtos.map(mapDonor);
  const donorsById = new Map(donors.map((d) => [d.id, d]));
  return {
    donors,
    profiles: donors.map(placeholderProfile),
    grants: grantDtos.map((g) => mapGrant(g, donorsById)),
    programmes: programmeDtos.map(mapProgramme),
    tranches: [], /* no tranche endpoint on this branch */
    drules: [],   /* no disbursement-rule endpoint on this branch */
  };
}
