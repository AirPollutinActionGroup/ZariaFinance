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
};
