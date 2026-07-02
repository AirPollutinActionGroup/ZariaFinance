import type { Donor } from '@/types/donor';

/**
 * Seed data. In production replace this module with a data layer
 * (REST/GraphQL) that returns `Donor[]`; the component tree is agnostic.
 */
export const DONORS: Donor[] = [
  {
    id: 'DNR-001', code: 'TATA-FND', name: 'Tata Foundation',
    source: 'Corporate CSR Foundation', type: 'Institutional',
    domicile: 'Domestic', fcra: 'Not applicable', foreignType: '—', foreignCountry: '—',
    contact: 'Ratan Mehta', email: 'grants@tatafoundation.org', phone: '+91 22 6665 8282',
    address: 'Bombay House, 24 Homi Mody Street, Fort, Mumbai 400001',
    panCardNumber: 'AAATT1234C', bankAccountRef: 'BNK-IN-0091', active: true,
    createdAt: '2023-04-12 09:14', updatedAt: '2026-05-30 16:42',
    committed: '₹1.20 Cr', received: '₹80.00 L', allocationPct: 100, fundType: 'Restricted',
    documents: [{ id: 'd1', name: 'Tata Foundation — MoU 2023-26.pdf', meta: 'PDF · 1.8 MB · uploaded 2023-04-12' }],
  },
  {
    id: 'DNR-002', code: 'GATES-F', name: 'Gates Foundation',
    source: 'Private Foundation', type: 'Institutional',
    domicile: 'Foreign', fcra: 'Applicable', foreignType: 'Philanthropic Foundation', foreignCountry: 'United States',
    contact: 'Sarah Klein', email: 'india.grants@gatesfoundation.org', phone: '+1 206 709 3100',
    address: '440 5th Avenue N, Seattle, WA 98109, USA',
    panCardNumber: 'AABCG5678D', bankAccountRef: 'BNK-FC-0102', active: true,
    createdAt: '2022-11-03 11:02', updatedAt: '2026-06-10 10:18',
    committed: '₹95.00 L', received: '₹65.00 L', allocationPct: 100, fundType: 'Restricted',
    documents: [
      { id: 'd2', name: 'Gates Foundation — Grant Agreement.pdf', meta: 'PDF · 2.4 MB · uploaded 2022-11-03' },
      { id: 'd3', name: 'FCRA undertaking — signed.pdf', meta: 'PDF · 640 KB · uploaded 2022-11-05' },
    ],
  },
  {
    id: 'DNR-003', code: 'APPI', name: 'Azim Premji Phil.',
    source: 'Private Foundation', type: 'Institutional',
    domicile: 'Domestic', fcra: 'Not applicable', foreignType: '—', foreignCountry: '—',
    contact: 'Anand Rao', email: 'partnerships@azimpremjifoundation.org', phone: '+91 80 6614 4900',
    address: 'Pixel B, PES Campus, Hosur Road, Bengaluru 560100',
    panCardNumber: 'AAATA9012E', bankAccountRef: 'BNK-IN-0044', active: true,
    createdAt: '2023-01-20 14:36', updatedAt: '2026-04-18 12:05',
    committed: '₹50.00 L', received: '₹50.00 L', allocationPct: 100, fundType: 'Unrestricted',
    documents: [{ id: 'd4', name: 'APPI — MoU.docx', meta: 'DOCX · 320 KB · uploaded 2023-01-20' }],
  },
  {
    id: 'DNR-004', code: 'ROCK-F', name: 'Rockefeller',
    source: 'Private Foundation', type: 'Institutional',
    domicile: 'Foreign', fcra: 'Applicable', foreignType: 'Philanthropic Foundation', foreignCountry: 'United States',
    contact: 'David Lin', email: 'asia@rockfound.org', phone: '+1 212 869 8500',
    address: '420 5th Avenue, New York, NY 10018, USA',
    panCardNumber: 'AADCR3344F', bankAccountRef: 'BNK-FC-0117', active: true,
    createdAt: '2023-06-08 08:51', updatedAt: '2026-03-22 17:29',
    committed: '₹42.00 L', received: '₹21.00 L', allocationPct: 80, fundType: 'Restricted',
    documents: [],
  },
  {
    id: 'DNR-005', code: 'IND-POOL', name: 'Individual Giving Pool',
    source: 'Retail / Individual Donors', type: 'Individual (Pooled)',
    domicile: 'Domestic', fcra: 'Not applicable', foreignType: '—', foreignCountry: '—',
    contact: 'Priya Nair (Custodian)', email: 'giving@zariya.org', phone: '+91 11 4080 5050',
    address: '242 Okhla Industrial Estate, Phase 3, New Delhi 110020',
    panCardNumber: '— (pooled receipts)', bankAccountRef: 'BNK-IN-0009', active: true,
    createdAt: '2022-08-15 10:00', updatedAt: '2026-06-25 19:11',
    committed: '₹30.00 L', received: '₹18.50 L', allocationPct: 100, fundType: 'Unrestricted',
    documents: [{ id: 'd5', name: 'Individual Giving — Pooling deed.pdf', meta: 'PDF · 980 KB · uploaded 2022-08-15' }],
  },
  {
    id: 'DNR-006', code: 'BLMBG-F', name: 'Bloomberg Philanthropies',
    source: 'Corporate Foundation', type: 'Institutional',
    domicile: 'Foreign', fcra: 'Applicable', foreignType: 'Corporate Philanthropy', foreignCountry: 'United States',
    contact: 'Megan Cho', email: 'environment@bloomberg.org', phone: '+1 212 205 0100',
    address: '25 East 78th Street, New York, NY 10075, USA',
    panCardNumber: 'AAECB7788G', bankAccountRef: 'BNK-FC-0125', active: true,
    createdAt: '2023-09-14 13:47', updatedAt: '2026-02-09 09:33',
    committed: '₹28.00 L', received: '₹8.00 L', allocationPct: 65, fundType: 'Restricted',
    documents: [],
  },
];

export const KPIS = {
  donors: 6,
  totalCommitted: '₹3.65 Cr',
  receivedYtd: '₹2.42 Cr',
  pipelineGap: '₹1.23 Cr',
};
