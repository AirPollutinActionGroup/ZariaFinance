/**
 * MOCK "Donor Module Master Workbook" — the illustrative dataset shipped with the
 * design preview (bucolic-axolotl-82d2a4.netlify.app). It is used ONLY as a
 * fallback on the dashboard when the backend returns no donors/grants, so a fresh
 * database still renders the approved demo screen. The moment real records exist,
 * the live data is used instead and this file is ignored.
 *
 * Objects are pre-shaped as view models (statusLabel already attached) so they can
 * bypass the donor/grant mappers and flow straight into the dashboard aggregators.
 *
 * Figures are authored in whole rupees. Portfolio totals (excluding the blocked
 * draft-donor grant) sum exactly to the preview: committed ₹10.68 Cr, received
 * ₹7.54 Cr, utilised ₹4.91 Cr, available ₹2.63 Cr, blocked ₹1.00 Cr.
 */

const L = 100_000; // one lakh, in rupees — keeps the figures readable below.

/** 14 donors — 13 active, 1 draft (the draft donor's grant is the blocked ₹1 Cr). */
export const MOCK_DONORS = [
  { id: 1, donorCode: 'DNR-001', donorName: 'Greenline Power CSR Trust', donorType: 'CSR', fundClass: 'CORPORATE', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 2, donorCode: 'DNR-002', donorName: 'Mehta Cement CSR Foundation', donorType: 'CSR', fundClass: 'CORPORATE', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 3, donorCode: 'DNR-003', donorName: 'Rohan Kapadia', donorType: 'Individual', fundClass: 'INDIVIDUAL', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 4, donorCode: 'DNR-004', donorName: 'Anjali Verma', donorType: 'Individual', fundClass: 'INDIVIDUAL', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 5, donorCode: 'DNR-005', donorName: 'Horizon Global Fund', donorType: 'Foundation', fundClass: 'INTERNATIONAL', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 6, donorCode: 'DNR-006', donorName: 'Suraksha Finserv CSR', donorType: 'CSR', fundClass: 'CORPORATE', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 7, donorCode: 'DNR-007', donorName: 'Aditya Steel Foundation', donorType: 'CSR', fundClass: 'CORPORATE', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 8, donorCode: 'DNR-008', donorName: 'Vandana Textiles CSR', donorType: 'CSR', fundClass: 'CORPORATE', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 9, donorCode: 'DNR-009', donorName: 'Blue Ocean Trust', donorType: 'Trust', fundClass: 'DOMESTIC', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 10, donorCode: 'DNR-010', donorName: 'Nirmala Devi', donorType: 'Individual', fundClass: 'INDIVIDUAL', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 11, donorCode: 'DNR-011', donorName: 'Sunrise Pharma CSR', donorType: 'CSR', fundClass: 'CORPORATE', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 12, donorCode: 'DNR-012', donorName: 'Cauvery Infra CSR', donorType: 'CSR', fundClass: 'CORPORATE', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 13, donorCode: 'DNR-013', donorName: 'Kisan Welfare Trust', donorType: 'NGO', fundClass: 'NGO', status: 'ACTIVE', statusLabel: 'Active', isActive: true },
  { id: 14, donorCode: 'DNR-014', donorName: 'Pledged Ventures', donorType: 'CSR', fundClass: 'CORPORATE', status: 'DRAFT', statusLabel: 'Draft', isActive: false },
];

/**
 * 14 grants — 12 active, 1 closed, 1 blocked (draft donor). `mockReceived` /
 * `mockUtilised` are the illustrative realised figures honoured verbatim by
 * deriveGrantFunding(). The first six (2026 start dates) are the newest and are
 * what the "Recent grant agreements" table surfaces.
 */
export const MOCK_GRANTS = [
  // ── Headline six (shown in the recent table) ─────────────────────────────
  { id: 1, grantCode: 'ZRY/GA/2026/001', agreementName: 'Greenline Power CSR Trust', donorId: 1, donorName: 'Greenline Power CSR Trust', programmeName: 'PRG-CLEANAIR', fundClass: 'CORPORATE', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2026-06-01', totalGrantAmount: 50 * L, mockReceived: 33.33 * L, mockUtilised: 25 * L },
  { id: 2, grantCode: 'ZRY/GA/2026/002', agreementName: 'Mehta Cement CSR Foundation', donorId: 2, donorName: 'Mehta Cement CSR Foundation', programmeName: 'PRG-WATER', fundClass: 'CORPORATE', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2026-05-15', totalGrantAmount: 30 * L, mockReceived: 20 * L, mockUtilised: 15.5 * L },
  { id: 3, grantCode: 'ZRY/GA/2026/003', agreementName: 'Rohan Kapadia', donorId: 3, donorName: 'Rohan Kapadia', programmeName: 'PRG-CORE', fundClass: 'INDIVIDUAL', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2026-05-01', totalGrantAmount: 1.5 * L, mockReceived: 1.5 * L, mockUtilised: 1.2 * L },
  { id: 4, grantCode: 'ZRY/GA/2026/004', agreementName: 'Anjali Verma', donorId: 4, donorName: 'Anjali Verma', programmeName: null, fundClass: 'INDIVIDUAL', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2026-04-20', totalGrantAmount: 1 * L, mockReceived: 1 * L, mockUtilised: 0.8 * L },
  { id: 5, grantCode: 'ZRY/GA/2026/005', agreementName: 'Horizon Global Fund', donorId: 5, donorName: 'Horizon Global Fund', programmeName: 'PRG-CORE', fundClass: 'INTERNATIONAL', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2026-04-10', totalGrantAmount: 167 * L, mockReceived: 167 * L, mockUtilised: 110 * L },
  { id: 7, grantCode: 'ZRY/GA/2026/007', agreementName: 'Suraksha Finserv CSR', donorId: 6, donorName: 'Suraksha Finserv CSR', programmeName: 'PRG-CLEANAIR', fundClass: 'CORPORATE', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2026-04-01', totalGrantAmount: 40 * L, mockReceived: 26.67 * L, mockUtilised: 20.5 * L },

  // ── Portfolio fillers (older; complete the aggregate totals) ─────────────
  { id: 6, grantCode: 'ZRY/GA/2025/006', agreementName: 'Blue Ocean Trust', donorId: 9, donorName: 'Blue Ocean Trust', programmeName: 'PRG-WATER', fundClass: 'DOMESTIC', grantStatus: 'CLOSED', statusLabel: 'Closed', startDate: '2025-03-01', totalGrantAmount: 150 * L, mockReceived: 150 * L, mockUtilised: 142.5 * L },
  { id: 8, grantCode: 'ZRY/GA/2025/008', agreementName: 'Aditya Steel Foundation', donorId: 7, donorName: 'Aditya Steel Foundation', programmeName: 'PRG-CLEANAIR', fundClass: 'CORPORATE', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2025-06-01', totalGrantAmount: 200 * L, mockReceived: 130 * L, mockUtilised: 60 * L },
  { id: 9, grantCode: 'ZRY/GA/2025/009', agreementName: 'Vandana Textiles CSR', donorId: 8, donorName: 'Vandana Textiles CSR', programmeName: 'PRG-WATER', fundClass: 'CORPORATE', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2025-05-01', totalGrantAmount: 120 * L, mockReceived: 78 * L, mockUtilised: 40 * L },
  { id: 10, grantCode: 'ZRY/GA/2025/010', agreementName: 'Nirmala Devi', donorId: 10, donorName: 'Nirmala Devi', programmeName: 'PRG-CORE', fundClass: 'INDIVIDUAL', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2025-04-01', totalGrantAmount: 100 * L, mockReceived: 60 * L, mockUtilised: 30 * L },
  { id: 11, grantCode: 'ZRY/GA/2025/011', agreementName: 'Sunrise Pharma CSR', donorId: 11, donorName: 'Sunrise Pharma CSR', programmeName: 'PRG-CLEANAIR', fundClass: 'CORPORATE', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2025-03-15', totalGrantAmount: 90 * L, mockReceived: 50 * L, mockUtilised: 25 * L },
  { id: 12, grantCode: 'ZRY/GA/2025/012', agreementName: 'Cauvery Infra CSR', donorId: 12, donorName: 'Cauvery Infra CSR', programmeName: 'PRG-WATER', fundClass: 'CORPORATE', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2025-02-01', totalGrantAmount: 68.5 * L, mockReceived: 22 * L, mockUtilised: 12 * L },
  { id: 13, grantCode: 'ZRY/GA/2025/013', agreementName: 'Kisan Welfare Trust', donorId: 13, donorName: 'Kisan Welfare Trust', programmeName: 'PRG-CORE', fundClass: 'NGO', grantStatus: 'ACTIVE', statusLabel: 'Active', startDate: '2025-01-15', totalGrantAmount: 50 * L, mockReceived: 14.5 * L, mockUtilised: 8.5 * L },

  // ── Blocked: active-looking grant hanging off a draft donor (excluded) ────
  { id: 14, grantCode: 'ZRY/GA/2025/014', agreementName: 'Pledged Ventures', donorId: 14, donorName: 'Pledged Ventures', programmeName: 'PRG-CORE', fundClass: 'CORPORATE', grantStatus: 'DRAFT', statusLabel: 'Draft', startDate: '2025-12-01', totalGrantAmount: 100 * L, mockReceived: 0, mockUtilised: 0 },
];

/** True when a query returned no rows — signals the dashboard to use the mock. */
export const isEmpty = (data) => !Array.isArray(data) || data.length === 0;
