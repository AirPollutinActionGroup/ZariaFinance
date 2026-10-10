import { describe, expect, it } from 'vitest';
import { fromSuggestionResponse } from './suggestionMapper.js';

describe('fromSuggestionResponse', () => {
  it('normalises money to numbers and keeps ids numeric', () => {
    const vm = fromSuggestionResponse({
      outflowLineId: 'BUD-2026-001-BL01-Q2',
      book: 'LC',
      amount: '500.00',
      date: '2026-10-07',
      suggestions: [
        {
          rank: 1,
          score: 85,
          donorId: 7,
          donorName: 'Clean Air Trust',
          fundProfileId: 12,
          fundProfileName: 'Delhi monitoring',
          grant: { id: 3, grantCode: 'GA-001', endDate: '2027-03-31', totalGrantAmount: '100000' },
          received: '9000.00',
          debited: '1000',
          available: '8000',
          availableAfter: '7500',
          coversAmount: true,
          reasons: ['Same programme'],
        },
      ],
      excluded: [{ donorId: 8, donorName: 'Other', fundProfileId: 13, fundProfileName: 'F', reason: 'Booked FC — this note is LC' }],
    });

    expect(vm.amount).toBe(500);
    const [s] = vm.suggestions;
    expect(s).toMatchObject({ donorId: 7, fundProfileId: 12, available: 8000, availableAfter: 7500, received: 9000, debited: 1000 });
    expect(s.grant).toMatchObject({ grantCode: 'GA-001', totalGrantAmount: 100000 });
    expect(s.warnings).toEqual([]);
    expect(vm.excluded[0].reason).toBe('Booked FC — this note is LC');
  });

  it('handles no amount, no grant and empty lists', () => {
    const vm = fromSuggestionResponse({ outflowLineId: 'X', book: 'FC', amount: null });
    expect(vm.amount).toBeNull();
    expect(vm.suggestions).toEqual([]);
    expect(vm.excluded).toEqual([]);

    const [s] = fromSuggestionResponse({ suggestions: [{ rank: 1, donorId: 1, fundProfileId: 2, available: 5 }] }).suggestions;
    expect(s.grant).toBeNull();
    expect(s.availableAfter).toBeNull();
  });
});
