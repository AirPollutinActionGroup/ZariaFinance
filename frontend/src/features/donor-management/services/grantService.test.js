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
      { id: 7, grantCode: 'GR-7', fundClassCode: 'A', status: 'ACTIVE', isActive: true, isApproved: 2 },
    ]);
    const grants = await grantService.listGrants({ donorId: 3 });
    expect(grantApi.list).toHaveBeenCalledWith({ donorId: 3 });
    expect(grants[0].statusLabel).toBe('Active');
    expect(grants[0].approvalStatusLabel).toBe('Pending');
    expect(grants[0].fundClassLabel).toBe('Class A');
  });

  it('labels completed and cancelled grants from status, not the isActive flag', async () => {
    grantApi.list.mockResolvedValue([
      { id: 1, status: 'COMPLETED', isActive: false },
      { id: 2, status: 'CANCELLED', isActive: false },
    ]);
    const grants = await grantService.listGrants();
    expect(grants.map((g) => g.statusLabel)).toEqual(['Completed', 'Cancelled']);
  });

  it('serialises CreateGrantRequest with numeric ids, omitting the inherited total', async () => {
    grantApi.create.mockResolvedValue({ id: 9, grantCode: 'GR-9' });
    await grantService.createGrant({
      grantCode: 'GR-9',
      donorId: '3',
      fundProfileId: '5',
      programmeId: '8',
      agreementName: 'Clean Air 2026',
      status: 'ACTIVE',
      agreementDate: '2026-01-15',
      startDate: '2026-02-01',
      endDate: '2026-12-31',
      grantCurrency: 'USD',
      fxLockedRate: '85.5',
      approvalStatus: '1',
      approvedBy: '4',
      approvalDate: '2026-01-20',
      approvalRemarks: ' signed off ',
      description: '',
      agreementDocumentPath: '',
    });
    const payload = grantApi.create.mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        fundProfileId: 5,
        programmeId: 8,
        status: 'ACTIVE',
        grantCurrency: 'USD',
        fxLockedRate: 85.5,
        approvalStatus: 1,
        approvedBy: 4,
        approvalDate: '2026-01-20',
        approvalRemarks: 'signed off',
        description: null,
        agreementDocumentPath: null,
      }),
    );
    // The total is Σ of the fund profile's tranche plan, computed server-side.
    expect(payload).not.toHaveProperty('totalGrantAmount');
  });

  it('round-trips description and document path so an edit cannot wipe them', () => {
    const values = grantService.toFormValues({
      id: 4,
      status: 'COMPLETED',
      isApproved: 3,
      approvedBy: 6,
      approvalDate: '2026-03-04T10:15:00',
      description: 'existing note',
      agreementDocumentPath: '/docs/agreement.pdf',
    });
    expect(values.status).toBe('COMPLETED');
    expect(values.approvalStatus).toBe('3');
    expect(values.approvedBy).toBe('6');
    // The column is a timestamp; the form field is a date.
    expect(values.approvalDate).toBe('2026-03-04');
    expect(values.description).toBe('existing note');
    expect(values.agreementDocumentPath).toBe('/docs/agreement.pdf');
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
