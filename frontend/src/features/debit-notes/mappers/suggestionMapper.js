/**
 * FundSuggestionResponse → the view model the suggestion dialog uses. Money
 * arrives as JSON numbers or strings (BigDecimal) — normalised to numbers.
 * Ids stay numbers so they match the donor / fund profile pickers' values.
 */

const num = (value) => (value == null || value === '' ? 0 : Number(value));
const numOrNull = (value) => (value == null || value === '' ? null : Number(value));

function fromItem(dto) {
  return {
    rank: dto.rank,
    score: dto.score ?? 0,
    donorId: dto.donorId,
    donorName: dto.donorName || '',
    fundProfileId: dto.fundProfileId,
    fundProfileName: dto.fundProfileName || '',
    fundClassLabel: dto.fundClassLabel || null,
    programmeName: dto.programmeName || null,
    grant: dto.grant
      ? {
          id: dto.grant.id,
          grantCode: dto.grant.grantCode || '',
          agreementName: dto.grant.agreementName || '',
          endDate: dto.grant.endDate || null,
          totalGrantAmount: numOrNull(dto.grant.totalGrantAmount),
        }
      : null,
    received: num(dto.received),
    debited: num(dto.debited),
    available: num(dto.available),
    availableAfter: numOrNull(dto.availableAfter),
    coversAmount: Boolean(dto.coversAmount),
    reasons: dto.reasons || [],
    warnings: dto.warnings || [],
  };
}

export function fromSuggestionResponse(dto) {
  return {
    outflowLineId: dto.outflowLineId,
    book: dto.book,
    amount: numOrNull(dto.amount),
    date: dto.date || null,
    suggestions: (dto.suggestions || []).map(fromItem),
    excluded: (dto.excluded || []).map((e) => ({
      donorId: e.donorId,
      donorName: e.donorName || '',
      fundProfileId: e.fundProfileId,
      fundProfileName: e.fundProfileName || '',
      reason: e.reason || '',
    })),
  };
}
