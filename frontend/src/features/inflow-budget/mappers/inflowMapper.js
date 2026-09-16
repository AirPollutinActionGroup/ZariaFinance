/**
 * InflowMapper — TrancheResponse ↔ the Inflow Budget page's row/form model.
 * The schedule is entirely the donor module's grant tranches; every field
 * here traces back to a TrancheResponse field — nothing is invented.
 */

/** TrancheResponse → inflow row view model. */
export function fromTrancheResponse(dto) {
  return {
    id: dto.id,
    grantId: dto.grantId,
    grantCode: dto.grantCode,
    trancheNumber: dto.trancheNumber,
    donor: dto.donorName,
    restriction: dto.fundMode,
    book: dto.book,
    expectedDate: dto.plannedReleaseDate,
    expectedAmount: dto.trancheAmount,
    expectedFx: dto.fxLockedRate,
    actualDate: dto.actualReleaseDate,
    actualAmount: dto.actualAmount,
    actualFx: dto.actualFxRate,
    bankRef: dto.bankReference,
    voucherNo: dto.receiptVoucherNo,
    varianceReason: dto.varianceReason,
  };
}

/** Record Receipt dialog form values → ReceiveTrancheRequest. */
export function toReceiveTrancheRequest(form) {
  return {
    actualAmount: Number(form.actualAmount),
    actualDate: form.actualDate || null,
    actualFxRate: form.actualFx !== '' && form.actualFx != null ? Number(form.actualFx) : null,
    bankReference: form.bankRef.trim(),
    receiptVoucherNo: form.voucherNo?.trim() || null,
    varianceReason: form.varianceReason?.trim() || null,
  };
}
