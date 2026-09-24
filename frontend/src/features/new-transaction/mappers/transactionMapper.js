/**
 * TransactionMapper — translates between backend DTOs (TransactionResponse,
 * CreateTransactionRequest) and the frontend view/form model. View-model
 * field names mirror the page's original mock shape (id/date/fundName/...)
 * so the List/Detail pages don't need to change their column definitions.
 */

/** TransactionResponse → view model. */
export function fromTransactionResponse(dto) {
  return {
    ...dto,
    id: dto.transactionCode,
    date: dto.transactionDate,
    fundName: dto.fundProfileLabel,
    paymentModeLabel: dto.paymentModeName,
    bankAccountLabel: dto.bankAccountLabel || '—',
    groupLabel: dto.groupName,
    ledgerLabel: dto.ledgerName,
  };
}

/** New Transaction form state → CreateTransactionRequest. */
export function toCreateTransactionRequest(values) {
  return {
    type: values.type,
    book: values.book,
    transactionDate: values.date,
    category: values.category,
    partyId: String(values.partyId),
    partyName: values.partyName,
    donorId: Number(values.donorId),
    fundProfileId: Number(values.fundId),
    grantId: values.grantId ? Number(values.grantId) : null,
    inflowBudgetLineId: values.trancheId ? Number(values.trancheId) : null,
    amount: Number(values.amount),
    bankAccountId: values.bankAccount ? Number(values.bankAccount) : null,
    paymentModeId: Number(values.paymentMode),
    reference: values.reference?.trim() || null,
    groupId: Number(values.group),
    ledgerId: Number(values.ledgerType),
    notes: values.notes?.trim() || null,
  };
}
