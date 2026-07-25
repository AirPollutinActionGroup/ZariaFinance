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
    hold: vi.fn(),
    resume: vi.fn(),
    complete: vi.fn(),
  },
}));

describe('grantService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps list responses to view models', async () => {
    grantApi.list.mockResolvedValue([
      { id: 7, grantCode: 'GR-7', fundClassCode: 'A', isActive: true },
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
      // [isApproved, isActive, expected]
      [2, true, ['approve']],
      [2, false, ['approve']],
      [1, true, ['hold', 'complete', 'close']],
      [1, false, ['activate']],
      [3, true, ['resume']],
      [3, false, ['resume']],
      [4, true, []],
      [undefined, true, []],
    ])('isApproved=%s isActive=%s → %j', (isApproved, isActive, expected) => {
      expect(grantService.availableActions(isApproved, isActive)).toEqual(expected);
    });
  });
});
