/**
 * Seed budgets for the frontend-only Budget module. Stands in for the Budget
 * API until it ships (BACKEND_GAPS #7). Amounts are phased by FY quarter.
 */
export const MOCK_BUDGETS = [
  {
    id: 'BUD-2026-001',
    name: 'Air Quality Monitoring — FY 2026-27',
    financialYear: '2026-27',
    budgetType: 'PROGRAMME',
    programmeId: null, // seed isn't tied to a real Programme record
    stateId: null, // seed isn't tied to a real State record — matched by name
    stateName: 'Delhi',
    programme: 'Clean Air Programme',
    owner: 'Programme Finance',
    notes: 'Approved by the board on 28 Mar 2026. Feeds the outflow schedule.',
    status: 'APPROVED',
    createdAt: '2026-02-10T09:30:00',
    updatedAt: '2026-03-28T16:05:00',
    lines: [
      { id: 'BL-01', category: 'PERSONNEL', description: 'Programme salaries — Air Quality team', book: 'LC', q1: 4350000, q2: 4350000, q3: 4350000, q4: 4350000 },
      { id: 'BL-02', category: 'EQUIPMENT', description: 'Low-cost PM2.5 sensor network (40 units)', book: 'FC', q1: 2800000, q2: 1200000, q3: 0, q4: 0 },
      { id: 'BL-03', category: 'PROGRAMME', description: 'Community awareness drives', book: 'LC', q1: 300000, q2: 450000, q3: 600000, q4: 350000 },
      { id: 'BL-04', category: 'TRAVEL', description: 'Field visits — district deployments', book: 'LC', q1: 180000, q2: 220000, q3: 220000, q4: 150000 },
      { id: 'BL-05', category: 'ADMIN', description: 'Office rent & utilities share', book: 'LC', q1: 270000, q2: 270000, q3: 270000, q4: 270000 },
    ],
    history: [
      { status: 'DRAFT', at: '2026-02-10T09:30:00', by: 'Programme Finance', note: 'Created' },
      { status: 'SUBMITTED', at: '2026-03-12T11:00:00', by: 'Programme Finance', note: '' },
      { status: 'APPROVED', at: '2026-03-28T16:05:00', by: 'Finance Controller', note: 'Board approved.' },
    ],
  },
  {
    id: 'BUD-2026-002',
    name: 'Clean Cooking Pilot — FY 2026-27',
    financialYear: '2026-27',
    budgetType: 'PROGRAMME',
    programmeId: null, // seed isn't tied to a real Programme record
    stateId: null,
    stateName: 'Maharashtra',
    programme: 'Household Energy',
    owner: 'Programme Finance',
    notes: '',
    status: 'SUBMITTED',
    createdAt: '2026-05-04T10:15:00',
    updatedAt: '2026-06-02T14:40:00',
    lines: [
      { id: 'BL-01', category: 'CONSULTANTS', description: 'Stove efficiency study', book: 'FC', q1: 0, q2: 900000, q3: 900000, q4: 0 },
      { id: 'BL-02', category: 'PROGRAMME', description: 'Pilot households — 500 stove kits', book: 'FC', q1: 0, q2: 2500000, q3: 1500000, q4: 0 },
      { id: 'BL-03', category: 'PERSONNEL', description: 'Field coordinators (2)', book: 'LC', q1: 0, q2: 360000, q3: 360000, q4: 360000 },
    ],
    history: [
      { status: 'DRAFT', at: '2026-05-04T10:15:00', by: 'Programme Finance', note: 'Created' },
      { status: 'SUBMITTED', at: '2026-06-02T14:40:00', by: 'Programme Finance', note: '' },
    ],
  },
  {
    id: 'BUD-2027-001',
    name: 'Policy Advocacy — FY 2027-28 (draft)',
    financialYear: '2027-28',
    budgetType: 'PROGRAMME',
    programmeId: null, // seed isn't tied to a real Programme record
    stateId: null,
    stateName: '',
    programme: 'Policy & Advocacy',
    owner: 'Policy Team',
    notes: 'Early estimate — to be revisited after Q3 review.',
    status: 'DRAFT',
    createdAt: '2026-09-01T12:00:00',
    updatedAt: '2026-09-01T12:00:00',
    lines: [
      { id: 'BL-01', category: 'PERSONNEL', description: 'Policy analysts (3)', book: 'LC', q1: 900000, q2: 900000, q3: 900000, q4: 900000 },
      { id: 'BL-02', category: 'PROGRAMME', description: 'Stakeholder roundtables', book: 'LC', q1: 150000, q2: 0, q3: 150000, q4: 0 },
    ],
    history: [{ status: 'DRAFT', at: '2026-09-01T12:00:00', by: 'Policy Team', note: 'Created' }],
  },
  {
    id: 'BUD-2026-003',
    name: 'Organisation Overheads — FY 2026-27',
    financialYear: '2026-27',
    budgetType: 'ORGANISATION',
    programmeId: null,
    stateId: null, // all states
    stateName: '',
    programme: 'Organisation-wide',
    owner: 'Finance & Admin',
    notes: 'Shared costs not charged to any single programme.',
    status: 'APPROVED',
    createdAt: '2026-02-20T10:00:00',
    updatedAt: '2026-03-28T16:10:00',
    lines: [
      { id: 'BL-01', category: 'ADMIN', description: 'Head office rent & utilities', book: 'LC', q1: 960000, q2: 960000, q3: 960000, q4: 960000 },
      { id: 'BL-02', category: 'PERSONNEL', description: 'Finance, HR & admin staff', book: 'LC', q1: 1800000, q2: 1800000, q3: 1800000, q4: 1800000 },
      { id: 'BL-03', category: 'CONSULTANTS', description: 'Statutory audit & legal', book: 'LC', q1: 0, q2: 250000, q3: 0, q4: 350000 },
    ],
    history: [
      { status: 'DRAFT', at: '2026-02-20T10:00:00', by: 'Finance & Admin', note: 'Created' },
      { status: 'SUBMITTED', at: '2026-03-10T12:00:00', by: 'Finance & Admin', note: '' },
      { status: 'APPROVED', at: '2026-03-28T16:10:00', by: 'Finance Controller', note: 'Board approved.' },
    ],
  },
];
