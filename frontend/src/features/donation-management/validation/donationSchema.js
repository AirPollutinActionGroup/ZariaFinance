import { z } from 'zod';
import { ANONYMOUS_ALLOWED_TYPES } from '../constants.js';

/**
 * Mirrors CreateDonationRequest bean validation plus the cross-field
 * business rules DonationServiceImpl enforces (anonymous type gate, foreign
 * account lock, per-type required blocks). The server remains the source of
 * truth for the harder gates (CSR-corpus block, payroll sum reconciliation,
 * 80G/10BD chain) — this schema only prevents obviously incomplete submits.
 */

const gikItemSchema = z
  .object({
    itemDescription: z.string().trim().min(1, 'Item description is required'),
    quantity: z.string().optional().or(z.literal('')),
    fairValue: z.string().trim().min(1, 'Fair value is required').refine((v) => Number(v) > 0, 'Must be positive'),
    valuationBasis: z.string().optional().or(z.literal('')),
    valuationSource: z.string().optional().or(z.literal('')),
    intendedUse: z.string().min(1, 'Intended use is required'),
    treatment: z.string().optional().or(z.literal('')),
    programmeId: z.union([z.number(), z.string()]).optional().or(z.literal('')),
    otherProgramme: z.string().optional().or(z.literal('')),
    expiryDate: z.string().optional().or(z.literal('')),
    realisationStatus: z.string().optional().or(z.literal('')),
    actualSaleDate: z.string().optional().or(z.literal('')),
    actualProceeds: z.string().optional().or(z.literal('')),
    matchingLeg: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.programmeId === 'OTHER' && (!data.otherProgramme || !data.otherProgramme.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['otherProgramme'],
        message: 'Please specify the other programme / purpose',
      });
    }
  });

const corpusDetailSchema = z.object({
  writtenDirectionRef: z.string().trim(),
  directionDate: z.string(),
  directionDocumentPath: z.string().trim(),
  investmentMode: z.string(),
});

const recurringMandateSchema = z.object({
  mandateId: z.string().trim(),
  frequency: z.string(),
  startDate: z.string(),
  mandateStatus: z.string().optional().or(z.literal('')),
  nextExpectedDebitDate: z.string().optional().or(z.literal('')),
  sponsorshipTie: z.string().optional().or(z.literal('')),
  otherSponsorshipTie: z.string().optional().or(z.literal('')),
});

const payrollEmployeeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  idType: z.string().optional().or(z.literal('')),
  idNumber: z.string().optional().or(z.literal('')),
  amount: z.string().trim().min(1, 'Amount is required').refine((v) => Number(v) > 0, 'Must be positive'),
  citizenship: z.string().min(1, 'Citizenship is required'),
});

const payrollBatchSchema = z.object({
  employer: z.string().trim(),
  employerMatchRouting: z.string().optional().or(z.literal('')),
  matchAmount: z.string().optional().or(z.literal('')),
  employerMoneyRouting: z.string().optional().or(z.literal('')),
  csrFinancialYear: z.string().optional().or(z.literal('')),
  csrProjectRef: z.string().optional().or(z.literal('')),
  employees: z.array(payrollEmployeeSchema),
});

const legacyDetailSchema = z.object({
  bequestStatus: z.string(),
  probateReference: z.string().optional().or(z.literal('')),
  expectedValue: z.string().optional().or(z.literal('')),
  estateDomicile: z.string(),
});

export const donationSchema = z
  .object({
    donationType: z.string().min(1, 'Donation type is required'),
    receiptDate: z.string().min(1, 'Receipt date is required'),
    channel: z.string().min(1, 'Channel is required'),
    identification: z.string().min(1, 'Donor identification is required'),
    donorId: z.string().optional().or(z.literal('')),
    idType: z.string().optional().or(z.literal('')),
    idNumber: z.string().optional().or(z.literal('')),
    anonymousCollectionSource: z.string().optional().or(z.literal('')),
    anonymousSourceReference: z.string().optional().or(z.literal('')),
    fundMode: z.string().min(1, 'Fund mode is required'),
    fundClassCode: z.string().optional().or(z.literal('')),
    programmeId: z.string().optional().or(z.literal('')),
    otherProgramme: z.string().optional().or(z.literal('')),
    stateIds: z.array(z.union([z.number(), z.string()])).optional().default([]),
    utilisationPeriodType: z.string().min(1, 'Utilisation period is required'),
    utilisationStartDate: z.string().optional().or(z.literal('')),
    utilisationEndDate: z.string().optional().or(z.literal('')),
    isConditionalGift: z.union([z.boolean(), z.string()]).optional(),
    conditionDescription: z.string().optional().or(z.literal('')),
    currency: z.string().trim().min(1, 'Currency is required'),
    amount: z.string().trim().min(1, 'Amount is required').refine((v) => Number(v) > 0, 'Amount must be positive'),
    fxRate: z.string().optional().or(z.literal('')),
    bankAccountType: z.string().min(1, 'Bank account type is required'),
    transactionRef: z.string().optional().or(z.literal('')),
    tallyVoucherRef: z.string().optional().or(z.literal('')),
    receiptNumber80g: z.string().optional().or(z.literal('')),
    certificate10be: z.string().optional().or(z.literal('')),
    gikItems: z.array(gikItemSchema),
    corpusDetail: corpusDetailSchema,
    recurringMandate: recurringMandateSchema,
    payrollBatch: payrollBatchSchema,
    legacyDetail: legacyDetailSchema,
  })
  .superRefine((values, ctx) => {
    if (values.identification === 'NAMED' && !values.donorId) {
      ctx.addIssue({ code: 'custom', path: ['donorId'], message: 'Donor is required for a named donation' });
    }
    if (values.identification === 'ANONYMOUS') {
      if (!values.anonymousCollectionSource?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['anonymousCollectionSource'],
          message: 'Collection source is required for an anonymous donation',
        });
      }
      if (!values.anonymousSourceReference?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['anonymousSourceReference'],
          message: 'Source reference is required for an anonymous donation',
        });
      }
      if (values.donationType && !ANONYMOUS_ALLOWED_TYPES.includes(values.donationType)) {
        ctx.addIssue({
          code: 'custom',
          path: ['donationType'],
          message: 'Anonymous donations may only be One-time, Major gift or Gift in kind',
        });
      }
    }

    if (values.donationType === 'GIK' && values.gikItems.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['gikItems'], message: 'At least one line item is required' });
    }
    if (values.donationType === 'CORPUS') {
      if (!values.corpusDetail.writtenDirectionRef.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['corpusDetail', 'writtenDirectionRef'],
          message: 'Written direction reference is required',
        });
      }
      if (!values.corpusDetail.directionDocumentPath.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['corpusDetail', 'directionDocumentPath'],
          message: 'Direction document is required',
        });
      }
      if (!values.corpusDetail.investmentMode) {
        ctx.addIssue({
          code: 'custom',
          path: ['corpusDetail', 'investmentMode'],
          message: 'Investment mode is required',
        });
      }
    }
    if (values.donationType === 'RECURRING') {
      if (!values.recurringMandate.mandateId.trim()) {
        ctx.addIssue({ code: 'custom', path: ['recurringMandate', 'mandateId'], message: 'Mandate ID is required' });
      }
      if (!values.recurringMandate.frequency) {
        ctx.addIssue({ code: 'custom', path: ['recurringMandate', 'frequency'], message: 'Frequency is required' });
      }
      if (!values.recurringMandate.startDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['recurringMandate', 'startDate'],
          message: 'Mandate start date is required',
        });
      }
      if (values.recurringMandate?.sponsorshipTie === 'OTHER' && (!values.recurringMandate?.otherSponsorshipTie || !values.recurringMandate?.otherSponsorshipTie.trim())) {
        ctx.addIssue({
          code: 'custom',
          path: ['recurringMandate', 'otherSponsorshipTie'],
          message: 'Please specify the other sponsorship tie',
        });
      }
    }
    if (values.donationType === 'PAYROLL_GIVING') {
      if (!values.payrollBatch.employer.trim()) {
        ctx.addIssue({ code: 'custom', path: ['payrollBatch', 'employer'], message: 'Employer is required' });
      }
      if (values.payrollBatch.employees.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['payrollBatch', 'employees'],
          message: 'At least one employee is required',
        });
      }
    }
    if (values.donationType === 'LEGACY') {
      if (!values.legacyDetail.bequestStatus) {
        ctx.addIssue({
          code: 'custom',
          path: ['legacyDetail', 'bequestStatus'],
          message: 'Bequest status is required',
        });
      }
      if (!values.legacyDetail.estateDomicile) {
        ctx.addIssue({
          code: 'custom',
          path: ['legacyDetail', 'estateDomicile'],
          message: 'Estate domicile is required',
        });
      }
    }
    if (values.programmeId === 'OTHER' && (!values.otherProgramme || !values.otherProgramme.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['otherProgramme'],
        message: 'Please specify the other programme / purpose',
      });
    }
  });

export const donationFormDefaults = {
  donationType: '',
  receiptDate: new Date().toISOString().split('T')[0],
  channel: 'BANK_TRANSFER',
  identification: 'NAMED',
  donorId: '',
  idType: '',
  idNumber: '',
  anonymousCollectionSource: '',
  anonymousSourceReference: '',
  fundMode: 'UNRESTRICTED',
  fundClassCode: '',
  programmeId: '',
  otherProgramme: '',
  stateIds: [],
  utilisationPeriodType: 'SINGLE_FY',
  utilisationStartDate: '',
  utilisationEndDate: '',
  isConditionalGift: false,
  conditionDescription: '',
  currency: 'INR',
  amount: '',
  fxRate: '1',
  bankAccountType: 'DOMESTIC_CURRENT',
  transactionRef: '',
  tallyVoucherRef: '',
  receiptNumber80g: '',
  certificate10be: '',
  gikItems: [],
  corpusDetail: {
    writtenDirectionRef: '',
    directionDate: '',
    directionDocumentPath: '',
    investmentMode: '',
  },
  recurringMandate: {
    mandateId: '',
    frequency: '',
    startDate: '',
    mandateStatus: 'ACTIVE',
    nextExpectedDebitDate: '',
    sponsorshipTie: '',
    otherSponsorshipTie: '',
  },
  payrollBatch: {
    employer: '',
    employerMatchRouting: 'NO',
    matchAmount: '',
    employerMoneyRouting: 'PAYROLL_GIVING_TAGGED',
    csrFinancialYear: 'FY 2026-27',
    csrProjectRef: '',
    employees: [],
  },
  legacyDetail: {
    bequestStatus: '',
    probateReference: '',
    expectedValue: '',
    estateDomicile: '',
  },
};
