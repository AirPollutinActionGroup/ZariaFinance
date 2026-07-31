import {
  BEQUEST_STATUS,
  BOOK,
  DONATION_TYPE,
  DONOR_IDENTIFICATION,
  EIGHTY_G_STATUS,
  ESTATE_DOMICILE,
  FUND_MODE,
  CITIZENSHIP,
  GIK_INTENDED_USE,
  GIK_REALISATION_STATUS,
  INVESTMENT_MODE,
  MANDATE_FREQUENCY,
  MANDATE_STATUS,
  RECOGNITION_STATUS,
  TEN_BE_STATUS,
} from '../constants.js';

/**
 * DonationMapper — translates between backend DTOs (DonationListResponse,
 * DonationDetailResponse, CreateDonationRequest) and frontend view/form
 * models. Backend field names are preserved verbatim; the mapper only
 * normalises empties and attaches display labels.
 */

const label = (map, value) => map[value] || value || '—';

/** DonationListResponse → view model (register row). */
export function fromDonationListResponse(dto) {
  return {
    ...dto,
    typeLabel: label(DONATION_TYPE, dto.donationType),
    fundModeLabel: label(FUND_MODE, dto.fundMode),
    bookLabel: label(BOOK, dto.book),
    identificationLabel: label(DONOR_IDENTIFICATION, dto.identification),
    eightyGLabel: label(EIGHTY_G_STATUS, dto.eightyGStatus),
    recognitionLabel: label(RECOGNITION_STATUS, dto.recognitionStatus),
  };
}

function fromGikItem(item) {
  return {
    ...item,
    intendedUseLabel: label(GIK_INTENDED_USE, item.intendedUse),
    realisationLabel: label(GIK_REALISATION_STATUS, item.realisationStatus),
  };
}

function fromCorpusDetail(detail) {
  if (!detail) return null;
  return { ...detail, investmentModeLabel: label(INVESTMENT_MODE, detail.investmentMode) };
}

function fromRecurringMandate(mandate) {
  if (!mandate) return null;
  return {
    ...mandate,
    frequencyLabel: label(MANDATE_FREQUENCY, mandate.frequency),
    mandateStatusLabel: label(MANDATE_STATUS, mandate.mandateStatus),
  };
}

function fromPayrollBatch(batch) {
  if (!batch) return null;
  return {
    ...batch,
    employees: (batch.employees || []).map((e) => ({
      ...e,
      citizenshipLabel: label(CITIZENSHIP, e.citizenship),
    })),
  };
}

function fromLegacyDetail(detail) {
  if (!detail) return null;
  return {
    ...detail,
    bequestStatusLabel: label(BEQUEST_STATUS, detail.bequestStatus),
    estateDomicileLabel: label(ESTATE_DOMICILE, detail.estateDomicile),
  };
}

/** DonationDetailResponse → view model. */
export function fromDonationDetailResponse(dto) {
  return {
    ...fromDonationListResponse(dto),
    tenBeLabel: label(TEN_BE_STATUS, dto.tenBeStatus),
    gikItems: (dto.gikItems || []).map(fromGikItem),
    corpusDetail: fromCorpusDetail(dto.corpusDetail),
    recurringMandate: fromRecurringMandate(dto.recurringMandate),
    payrollBatch: fromPayrollBatch(dto.payrollBatch),
    legacyDetail: fromLegacyDetail(dto.legacyDetail),
  };
}

const nullIfBlank = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
};

const numberOrNull = (value) => (value === '' || value === null || value === undefined ? null : Number(value));

/** Form values → CreateDonationRequest. Only the block matching donationType is sent. */
export function toCreateDonationRequest(values) {
  const base = {
    donationType: values.donationType,
    receiptDate: values.receiptDate,
    channel: values.channel,
    identification: values.identification,
    donorId: values.identification === 'NAMED' ? Number(values.donorId) : null,
    anonymousCollectionSource:
      values.identification === 'ANONYMOUS' ? nullIfBlank(values.anonymousCollectionSource) : null,
    anonymousSourceReference:
      values.identification === 'ANONYMOUS' ? nullIfBlank(values.anonymousSourceReference) : null,
    fundMode: values.fundMode,
    fundClassCode: nullIfBlank(values.fundClassCode),
    programmeId: values.programmeId ? Number(values.programmeId) : null,
    // 'ALL' is GeographyMultiSelect's client-only sentinel for "spendable
    // anywhere" — it isn't a real state id, so it must not reach the backend.
    stateIds: (values.stateIds || [])
      .filter((id) => id !== 'ALL')
      .map(Number)
      .filter((n) => Number.isFinite(n)),
    utilisationPeriodType: values.utilisationPeriodType,
    utilisationStartDate: nullIfBlank(values.utilisationStartDate),
    utilisationEndDate: nullIfBlank(values.utilisationEndDate),
    isConditionalGift: values.isConditionalGift === 'true' || values.isConditionalGift === true,
    conditionDescription: nullIfBlank(values.conditionDescription),
    currency: (values.currency || 'INR').trim().toUpperCase(),
    amount: Number(values.amount),
    fxRate: numberOrNull(values.fxRate) ?? 1,
    bankAccountType: values.bankAccountType,
    transactionRef: nullIfBlank(values.transactionRef),
    tallyVoucherRef: nullIfBlank(values.tallyVoucherRef),
    gikItems: null,
    corpusDetail: null,
    recurringMandate: null,
    payrollBatch: null,
    legacyDetail: null,
  };

  switch (values.donationType) {
    case 'GIK':
      base.gikItems = (values.gikItems || []).map((item) => ({
        itemDescription: item.itemDescription.trim(),
        fairValue: Number(item.fairValue),
        intendedUse: item.intendedUse,
        expiryDate: nullIfBlank(item.expiryDate),
      }));
      break;
    case 'CORPUS':
      base.corpusDetail = {
        writtenDirectionRef: values.corpusDetail.writtenDirectionRef.trim(),
        directionDate: values.corpusDetail.directionDate,
        directionDocumentPath: values.corpusDetail.directionDocumentPath.trim(),
        investmentMode: values.corpusDetail.investmentMode,
      };
      break;
    case 'RECURRING':
      base.recurringMandate = {
        mandateId: values.recurringMandate.mandateId.trim(),
        frequency: values.recurringMandate.frequency,
        startDate: values.recurringMandate.startDate,
        mandateStatus: values.recurringMandate.mandateStatus || 'ACTIVE',
        nextExpectedDebitDate: nullIfBlank(values.recurringMandate.nextExpectedDebitDate),
        sponsorshipTie: nullIfBlank(values.recurringMandate.sponsorshipTie),
      };
      break;
    case 'PAYROLL_GIVING':
      base.payrollBatch = {
        employer: values.payrollBatch.employer.trim(),
        employerMatchRouting: values.payrollBatch.employerMatchRouting || 'PAYROLL_GIVING_TAGGED',
        employees: (values.payrollBatch.employees || []).map((e) => ({
          name: e.name.trim(),
          idType: nullIfBlank(e.idType),
          idNumber: nullIfBlank(e.idNumber),
          amount: Number(e.amount),
          citizenship: e.citizenship,
        })),
      };
      break;
    case 'LEGACY':
      base.legacyDetail = {
        bequestStatus: values.legacyDetail.bequestStatus,
        probateReference: nullIfBlank(values.legacyDetail.probateReference),
        expectedValue: numberOrNull(values.legacyDetail.expectedValue),
        estateDomicile: values.legacyDetail.estateDomicile,
      };
      break;
    default:
      break;
  }

  return base;
}
