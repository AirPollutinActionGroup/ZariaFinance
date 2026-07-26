import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RhfMultiSelect,
  RhfRadioGroup,
  RhfSelect,
  RhfTextField,
} from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { donationSchema, donationFormDefaults } from '../validation/donationSchema.js';
import {
  ANONYMOUS_ALLOWED_TYPES,
  BANK_ACCOUNT_TYPE,
  BEQUEST_STATUS,
  CITIZENSHIP,
  DONATION_CHANNEL,
  DONATION_TYPE,
  DONOR_IDENTIFICATION,
  EMPLOYER_MATCH_ROUTING,
  ESTATE_DOMICILE,
  FUND_MODE,
  GIK_INTENDED_USE,
  INVESTMENT_MODE,
  MANDATE_FREQUENCY,
  MANDATE_STATUS,
  UTILISATION_PERIOD_TYPE,
  toOptions,
} from '../constants.js';

const CURRENCY_OPTIONS = ['INR', 'USD', 'GBP', 'EUR'].map((c) => ({ value: c, label: c }));
const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };

function SectionTitle({ children }) {
  return (
    <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
      {children}
    </Typography>
  );
}

/**
 * Donation intake form — one type-routed form for all 7 donation types.
 * The form reveals only the block the selected donationType needs, mirroring
 * the backend rule engine (DonationServiceImpl): anonymous donations only
 * allow One-time / Major gift / Gift in kind, and a foreign donor's gift
 * locks to the FCRA designated account.
 */
export function DonationForm({
  donors,
  programmes,
  states,
  defaultValues,
  onSubmit,
  submitting,
  submitError,
  onCancel,
}) {
  const { control, handleSubmit, setValue, setError } = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: defaultValues || donationFormDefaults,
  });

  const gikItems = useFieldArray({ control, name: 'gikItems' });
  const employees = useFieldArray({ control, name: 'payrollBatch.employees' });

  const donationType = useWatch({ control, name: 'donationType' });
  const identification = useWatch({ control, name: 'identification' });
  const donorId = useWatch({ control, name: 'donorId' });
  const isConditionalGift = useWatch({ control, name: 'isConditionalGift' });
  const currency = useWatch({ control, name: 'currency' });

  const selectedDonor = donors.find((d) => String(d.id) === String(donorId));
  const foreignDonor = selectedDonor?.fundSourceDomicile === 'Foreign';

  // Foreign donor's gift can only land in the FCRA designated account — lock, don't just warn.
  useEffect(() => {
    if (foreignDonor) setValue('bankAccountType', 'FCRA_DESIGNATED');
  }, [foreignDonor, setValue]);

  // Anonymous donations may only be one of three types — clear an now-invalid selection.
  useEffect(() => {
    if (identification === 'ANONYMOUS' && donationType && !ANONYMOUS_ALLOWED_TYPES.includes(donationType)) {
      setValue('donationType', '');
    }
  }, [identification, donationType, setValue]);

  const typeOptions = toOptions(DONATION_TYPE).filter(
    (o) => identification !== 'ANONYMOUS' || ANONYMOUS_ALLOWED_TYPES.includes(o.value),
  );
  const donorOptions = donors.map((d) => ({
    value: String(d.id),
    label: `${d.donorName} — ${d.fundSourceDomicile || 'Domestic'}`,
  }));
  const programmeOptions = [{ value: '', label: '— not programme-tied —' }].concat(
    (programmes || []).map((p) => ({ value: String(p.id), label: p.programmeName })),
  );
  const stateOptions = (states || []).map((s) => ({ value: String(s.id), label: s.stateName }));

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  return (
    <Card component="form" onSubmit={submit} noValidate>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {submitError && !submitError.fieldErrors ? (
            <Alert severity="error">{submitError.message}</Alert>
          ) : null}

          <section>
            <SectionTitle>Donation identity</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="donationType"
                  control={control}
                  label="Donation type"
                  required
                  options={typeOptions}
                  helperText={identification === 'ANONYMOUS' ? 'Restricted for anonymous donations' : undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField name="receiptDate" control={control} label="Receipt date" required {...dateProps} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="channel"
                  control={control}
                  label="Channel"
                  required
                  options={toOptions(DONATION_CHANNEL)}
                />
              </Grid>
            </Grid>
          </section>

          <section>
            <SectionTitle>Donor identification</SectionTitle>
            <RhfRadioGroup
              name="identification"
              control={control}
              options={toOptions(DONOR_IDENTIFICATION)}
              helperText="An 80G receipt and the 10BD statement both need an identified donor."
            />
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {identification === 'ANONYMOUS' ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfTextField
                      name="anonymousCollectionSource"
                      control={control}
                      label="Collection source"
                      required
                      helperText="e.g. Donation box, Event collection"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfTextField
                      name="anonymousSourceReference"
                      control={control}
                      label="Source reference"
                      required
                      helperText="Box location · event name and date · bank credit reference"
                    />
                  </Grid>
                </>
              ) : (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfSelect name="donorId" control={control} label="Donor" required options={donorOptions} />
                </Grid>
              )}
            </Grid>
          </section>

          <section>
            <SectionTitle>Fund treatment</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect name="fundMode" control={control} label="Fund mode" required options={toOptions(FUND_MODE)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="fundClassCode"
                  control={control}
                  label="Fund class (A/B/C)"
                  helperText="Restriction class, optional"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect name="programmeId" control={control} label="Programme" options={programmeOptions} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <RhfMultiSelect
                  name="stateIds"
                  control={control}
                  label="Location / State"
                  required
                  options={stateOptions}
                  helperText="One gift may fund work across several states — feeds FCRA state-wise disclosure"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="utilisationPeriodType"
                  control={control}
                  label="Utilisation period"
                  required
                  options={toOptions(UTILISATION_PERIOD_TYPE)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="utilisationStartDate"
                  control={control}
                  label="Utilisation start"
                  {...dateProps}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField name="utilisationEndDate" control={control} label="Utilisation end" {...dateProps} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfRadioGroup
                  name="isConditionalGift"
                  control={control}
                  label="Conditional gift"
                  options={[
                    { value: 'false', label: 'No — recognise as income now' },
                    { value: 'true', label: 'Yes — donor can reclaim if unmet' },
                  ]}
                />
              </Grid>
              {isConditionalGift === 'true' || isConditionalGift === true ? (
                <Grid size={{ xs: 12, sm: 8 }}>
                  <RhfTextField
                    name="conditionDescription"
                    control={control}
                    label="Condition description"
                    multiline
                    minRows={2}
                  />
                </Grid>
              ) : null}
            </Grid>
          </section>

          <section>
            <SectionTitle>Money &amp; banking</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfSelect name="currency" control={control} label="Currency" required options={CURRENCY_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="amount"
                  control={control}
                  label="Amount"
                  required
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
              </Grid>
              {currency && currency !== 'INR' ? (
                <Grid size={{ xs: 6, sm: 3 }}>
                  <RhfTextField
                    name="fxRate"
                    control={control}
                    label="FX rate → INR"
                    type="number"
                    helperText="RBI reference rate on receipt date"
                    slotProps={{ htmlInput: { min: 0, step: '0.0001' } }}
                  />
                </Grid>
              ) : null}
              <Grid size={{ xs: 12, sm: 5 }}>
                <RhfSelect
                  name="bankAccountType"
                  control={control}
                  label="Bank account received into"
                  required
                  options={toOptions(BANK_ACCOUNT_TYPE)}
                  disabled={foreignDonor}
                  helperText={foreignDonor ? "Locked — this donor's gift must land in the FCRA account" : undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name="transactionRef" control={control} label="Transaction reference" helperText="UTR / cheque no." />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name="tallyVoucherRef" control={control} label="Tally voucher reference" />
              </Grid>
            </Grid>
          </section>

          {donationType === 'GIK' ? (
            <section>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <SectionTitle>Gift in kind — line items</SectionTitle>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    gikItems.append({ itemDescription: '', fairValue: '', intendedUse: '', expiryDate: '' })
                  }
                >
                  Add item
                </Button>
              </Stack>
              {gikItems.fields.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No line items yet — add at least one.
                </Typography>
              ) : null}
              <Stack spacing={2}>
                {gikItems.fields.map((f, i) => (
                  <Box key={f.id}>
                    {i > 0 ? <Divider sx={{ mb: 2 }} /> : null}
                    <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <RhfTextField
                          name={`gikItems.${i}.itemDescription`}
                          control={control}
                          label="Item description"
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <RhfTextField
                          name={`gikItems.${i}.fairValue`}
                          control={control}
                          label="Fair value"
                          required
                          type="number"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <RhfSelect
                          name={`gikItems.${i}.intendedUse`}
                          control={control}
                          label="Intended use"
                          required
                          options={toOptions(GIK_INTENDED_USE)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <RhfTextField
                          name={`gikItems.${i}.expiryDate`}
                          control={control}
                          label="Expiry date"
                          {...dateProps}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <IconButton aria-label="Remove item" onClick={() => gikItems.remove(i)} sx={{ mt: 1 }}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
              <Alert severity="warning" sx={{ mt: 2 }}>
                80G is not issued for gifts in kind. A "Sell" line must be realised by 31 March of the second
                financial year after receipt.
              </Alert>
            </section>
          ) : null}

          {donationType === 'CORPUS' ? (
            <section>
              <SectionTitle>Corpus</SectionTitle>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="corpusDetail.writtenDirectionRef"
                    control={control}
                    label="Written direction reference"
                    required
                    helperText="Letter ref / deed number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <RhfTextField
                    name="corpusDetail.directionDate"
                    control={control}
                    label="Direction date"
                    required
                    {...dateProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <RhfSelect
                    name="corpusDetail.investmentMode"
                    control={control}
                    label="Investment mode — Sec 11(5)"
                    required
                    options={toOptions(INVESTMENT_MODE)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <RhfTextField
                    name="corpusDetail.directionDocumentPath"
                    control={control}
                    label="Direction document"
                    required
                    helperText="Reference path/URL of the attached letter"
                  />
                </Grid>
              </Grid>
              <Alert severity="error" sx={{ mt: 2 }}>
                A corpus gift without written donor direction is not corpus. Domestic corpus cannot come from CSR
                funds — that is enforced server-side.
              </Alert>
            </section>
          ) : null}

          {donationType === 'RECURRING' ? (
            <section>
              <SectionTitle>Recurring mandate</SectionTitle>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="recurringMandate.mandateId"
                    control={control}
                    label="Mandate ID"
                    required
                    helperText="NACH / eMandate ref"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfSelect
                    name="recurringMandate.frequency"
                    control={control}
                    label="Frequency"
                    required
                    options={toOptions(MANDATE_FREQUENCY)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="recurringMandate.startDate"
                    control={control}
                    label="Mandate start date"
                    required
                    {...dateProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfSelect
                    name="recurringMandate.mandateStatus"
                    control={control}
                    label="Mandate status"
                    options={toOptions(MANDATE_STATUS)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="recurringMandate.nextExpectedDebitDate"
                    control={control}
                    label="Next expected debit"
                    {...dateProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="recurringMandate.sponsorshipTie"
                    control={control}
                    label="Sponsorship tie"
                  />
                </Grid>
              </Grid>
            </section>
          ) : null}

          {donationType === 'PAYROLL_GIVING' ? (
            <section>
              <SectionTitle>Payroll giving</SectionTitle>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="payrollBatch.employer"
                    control={control}
                    label="Employer"
                    required
                    helperText="A grouping tag for reporting — the employer is not the donor"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfSelect
                    name="payrollBatch.employerMatchRouting"
                    control={control}
                    label="Employer match routing"
                    options={toOptions(EMPLOYER_MATCH_ROUTING)}
                  />
                </Grid>
              </Grid>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">Employee giving list</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    employees.append({ name: '', idType: '', idNumber: '', amount: '', citizenship: '' })
                  }
                >
                  Add employee
                </Button>
              </Stack>
              {employees.fields.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No employees yet — add at least one. The sum of employee amounts must equal the total below.
                </Typography>
              ) : null}
              <Stack spacing={2}>
                {employees.fields.map((f, i) => (
                  <Box key={f.id}>
                    {i > 0 ? <Divider sx={{ mb: 2 }} /> : null}
                    <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <RhfTextField name={`payrollBatch.employees.${i}.name`} control={control} label="Name" required />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <RhfTextField name={`payrollBatch.employees.${i}.idType`} control={control} label="ID type" />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <RhfTextField name={`payrollBatch.employees.${i}.idNumber`} control={control} label="ID number" />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <RhfTextField
                          name={`payrollBatch.employees.${i}.amount`}
                          control={control}
                          label="Amount"
                          required
                          type="number"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <RhfSelect
                          name={`payrollBatch.employees.${i}.citizenship`}
                          control={control}
                          label="Citizenship"
                          required
                          options={toOptions(CITIZENSHIP)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <IconButton aria-label="Remove employee" onClick={() => employees.remove(i)} sx={{ mt: 1 }}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
              <Alert severity="error" sx={{ mt: 2 }}>
                Indian citizens post to the LC book; foreign citizens must post to the FCRA account only. The sum
                of employee amounts must equal the total remittance — the server blocks the save on any mismatch.
              </Alert>
            </section>
          ) : null}

          {donationType === 'LEGACY' ? (
            <section>
              <SectionTitle>Legacy / bequest</SectionTitle>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfSelect
                    name="legacyDetail.bequestStatus"
                    control={control}
                    label="Bequest status"
                    required
                    options={toOptions(BEQUEST_STATUS)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="legacyDetail.probateReference"
                    control={control}
                    label="Probate reference"
                    helperText="Court / executor ref"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="legacyDetail.expectedValue"
                    control={control}
                    label="Expected value"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfSelect
                    name="legacyDetail.estateDomicile"
                    control={control}
                    label="Estate domicile"
                    required
                    options={toOptions(ESTATE_DOMICILE)}
                  />
                </Grid>
              </Grid>
              <Alert severity="warning" sx={{ mt: 2 }}>
                Recognition date is when probate clears, not when notified — excluded from income until then.
              </Alert>
            </section>
          ) : null}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button color="inherit" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save donation'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
