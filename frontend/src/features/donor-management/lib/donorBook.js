/**
 * A donor's Book (LC / FC). Many donor records have no `book` saved, so fall
 * back the same way the backend does (FundingClassifier.isForeign in
 * InflowBudgetMapper.resolveBook): FCRA-applicable or foreign-domiciled → FC,
 * otherwise LC.
 */
export function donorBook(donor) {
  if (!donor) return '';
  if (donor.book === 'LC' || donor.book === 'FC') return donor.book;
  return donor.fcraApplicable === true || donor.fundSourceDomicile === 'FOREIGN' ? 'FC' : 'LC';
}
