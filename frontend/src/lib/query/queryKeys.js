/**
 * Central query-key factory.
 *
 * Keys are hierarchical so invalidation can be performed at any level,
 * e.g. invalidating queryKeys.donors.all() refetches lists and details.
 */
export const queryKeys = {
  donors: {
    all: () => ['donors'],
    list: (search) => ['donors', 'list', { search: search || '' }],
    detail: (id) => ['donors', 'detail', String(id)],
  },
  grants: {
    all: () => ['grants'],
    list: (filters) => ['grants', 'list', filters || {}],
    detail: (id) => ['grants', 'detail', String(id)],
  },
  programmes: {
    all: () => ['programmes'],
    detail: (id) => ['programmes', 'detail', String(id)],
  },
  fundProfiles: {
    all: () => ['fundProfiles'],
    byDonor: (donorId) => ['fundProfiles', 'byDonor', String(donorId)],
    detail: (id) => ['fundProfiles', 'detail', String(id)],
  },
  documents: {
    all: () => ['documents'],
    byGrant: (grantId, documentName) => [
      'documents',
      'byGrant',
      String(grantId),
      { documentName: documentName || '' },
    ],
    detail: (id) => ['documents', 'detail', String(id)],
  },
  donations: {
    all: () => ['donations'],
    list: (filters) => ['donations', 'list', filters || {}],
    detail: (id) => ['donations', 'detail', String(id)],
  },
  tenantTaxConfig: {
    all: () => ['tenantTaxConfig'],
  },
  fxRates: {
    all: () => ['fxRates'],
    lookup: (currency, date) => ['fxRates', 'lookup', { currency: currency || '', date: date || '' }],
  },
  users: {
    all: () => ['users'],
  },
  organisations: {
    all: () => ['organisations'],
    list: (search) => ['organisations', 'list', { search: search || '' }],
    detail: (id) => ['organisations', 'detail', String(id)],
  },
  roles: {
    all: () => ['roles'],
    list: (search) => ['roles', 'list', { search: search || '' }],
    detail: (id) => ['roles', 'detail', String(id)],
    assignedUsers: (id) => ['roles', 'assignedUsers', String(id)],
  },
  userRequests: {
    all: () => ['userRequests'],
    detail: (id) => ['userRequests', 'detail', String(id)],
  },
  paymentModes: {
    all: () => ['paymentModes'],
    list: (search) => ['paymentModes', 'list', { search: search || '' }],
  },
  vendors: {
    all: () => ['vendors'],
    list: (search) => ['vendors', 'list', { search: search || '' }],
    detail: (id) => ['vendors', 'detail', String(id)],
  },
  departments: {
    all: () => ['departments'],
    list: (search) => ['departments', 'list', { search: search || '' }],
  },
  designations: {
    all: () => ['designations'],
    list: (search) => ['designations', 'list', { search: search || '' }],
  },
  financialYears: {
    all: () => ['financialYears'],
  },
  bankDetails: {
    all: () => ['bankDetails'],
    list: (search) => ['bankDetails', 'list', { search: search || '' }],
  },
  employees: {
    all: () => ['employees'],
    list: (search) => ['employees', 'list', { search: search || '' }],
    detail: (id) => ['employees', 'detail', String(id)],
  },
};
