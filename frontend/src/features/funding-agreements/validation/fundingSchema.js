import { z } from 'zod';
import {
  addOverCommitmentIssues,
  fundProfileFormDefaults,
  fundProfileSchema,
} from '../../donor-management/validation/fundProfileSchema.js';
import { foreignContributionDefaults, formatForeign } from '../../donor-management/lib/foreignContribution.js';

/**
 * The single Funding form = fund profile (terms) + grant agreement.
 *
 * Form shape: every fund-profile field at the top level (so the shared
 * FundProfileFields component binds unchanged), plus
 *   donorId        whose money it is (the profile's owner)
 *   withAgreement  record the agreement now, or save terms only
 *   agreement.*    the grant-agreement fields
 *
 * Validation reuses fundProfileSchema as-is and adds the agreement rules
 * (mirroring grantSchema minus the donor/profile pickers, which this form
 * supplies itself) only when withAgreement is on.
 *
 * FC book (foreign donor): when `requireFc` is on, currency, foreign amount,
 * rate date and FX rate are required — they derive the INR total. The
 * backend stores INR only, so they aren't persisted and aren't required
 * when editing.
 *
 * There is no agreement-name field: the backend still requires one, so the
 * form generates it on save (see agreementNameFor in FundingFormPage).
 */
export const agreementSchema = z
  .object({
    agreementDate: z.string().min(1, 'Agreement date is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z.string().trim().optional().or(z.literal('')),
    agreementDocumentPath: z.string().trim().optional().or(z.literal('')),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  });

function copyIssues(result, ctx, prefix = []) {
  if (result.success) return;
  for (const issue of result.error.issues) {
    ctx.addIssue({ code: 'custom', message: issue.message, path: [...prefix, ...issue.path] });
  }
}

export const fundingSchema = z
  .object({
    donorId: z.union([z.string(), z.number()]).refine((v) => String(v ?? '').trim() !== '', 'Donor is required'),
    withAgreement: z.boolean(),
    agreement: z.any(),
  })
  .loose()
  .superRefine((values, ctx) => {
    copyIssues(fundProfileSchema.safeParse(values), ctx);
    if (values.withAgreement) copyIssues(agreementSchema.safeParse(values.agreement || {}), ctx, ['agreement']);
    if (values.requireFc) {
      const issue = (path, message) => ctx.addIssue({ code: 'custom', message, path: [path] });
      if (!values.fcCurrency) issue('fcCurrency', 'Currency is required');
      if (!(Number(values.fcAmount) > 0)) issue('fcAmount', 'Amount in foreign currency is required');
      if (!values.fcRateDate) issue('fcRateDate', 'Rate date is required');
      if (!(Number(values.fcRate) > 0)) issue('fcRate', 'FX rate is required');
      if (values.disbursementType === 'TRANCHES') {
        (values.tranches || []).forEach((t, i) => {
          if (!(Number(t?.fcAmount) > 0)) {
            ctx.addIssue({ code: 'custom', message: `Tranche ${i + 1}: amount in ${values.fcCurrency || 'currency'} is required`, path: ['tranches', i, 'fcAmount'] });
          }
        });
      }
    }
    // FC book: the foreign tranche amounts can't exceed the foreign commitment either.
    if (values.fcActive && values.disbursementType === 'TRANCHES' && Number(values.fcAmount) > 0) {
      addOverCommitmentIssues(ctx, values.tranches, 'fcAmount', values.fcAmount, 'fcAmount', (n) =>
        formatForeign(values.fcCurrency, n),
      );
    }
  });

export const agreementFormDefaults = {
  agreementDate: '',
  startDate: '',
  endDate: '',
  description: '',
  agreementDocumentPath: '',
};

export const fundingFormDefaults = {
  ...fundProfileFormDefaults,
  ...foreignContributionDefaults,
  requireFc: false,
  fcActive: false,
  donorId: '',
  withAgreement: true,
  agreement: agreementFormDefaults,
};
