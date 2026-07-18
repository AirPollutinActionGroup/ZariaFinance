import { describe, expect, it, vi, beforeEach } from 'vitest';
import { grantService } from './grantService.js';
import { grantApi } from '../api/grantApi.js';

vi.mock('../api/grantApi.js', () => ({
  grantApi: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    approve: vi.fn(),
    activate: vi.fn(),
    close: vi.fn(),
  },
}));

describe('grantService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps list responses to view models', async () => {
    grantApi.list.mockResolvedValue([
      { id: 7, grantCode: 'GR-7', fundClassCode: 'A', grantStatus: 'ACTIVE' },
    ]);
    const grants = await grantService.listGrants({ donorId: 3 });
    expect(grantApi.list).toHaveBeenCalledWith({ donorId: 3 });
    expect(grants[0].statusLabel).toBe('Active');
    expect(grants[0].fundClassLabel).toBe('Class A');
  });

  it('serialises CreateGrantRequest with numeric ids and amount', async () => {
    grantApi.create.mockResolvedValue({ id: 9, grantCode: 'GR-9' });
    await grantService.createGrant({
      grantCode: 'GR-9',
      donorId: '3',
      fundProfileId: '5',
      agreementName: 'Clean Air 2026',
      agreementDate: '2026-01-15',
      startDate: '2026-02-01',
      endDate: '2026-12-31',
      totalGrantAmount: '9500000',
      grantCurrency: 'INR',
      fxLockedRate: '1',
      description: '',
      agreementDocumentPath: '',
    });
    expect(grantApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fundProfileId: 5,
        totalGrantAmount: 9500000,
        description: null,
        agreementDocumentPath: null,
      }),
    );
  });

  describe('availableActions mirrors GrantController transitions', () => {
    it.each([
      ['DRAFT', ['approve']],
      ['PENDING_APPROVAL', ['approve']],
      ['APPROVED', ['activate', 'close']],
      ['ACTIVE', ['close']],
      ['ON_HOLD', ['close']],
      ['CLOSED', []],
      ['COMPLETED', []],
      ['TERMINATED', []],
    ])('%s → %j', (status, expected) => {
      expect(grantService.availableActions(status)).toEqual(expected);
    });
  });
});
