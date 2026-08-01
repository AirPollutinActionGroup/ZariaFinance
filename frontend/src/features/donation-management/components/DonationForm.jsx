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
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GeographyMultiSelect,
  RhfMultiSelect,
  RhfRadioGroup,
  RhfSelect,
  RhfTextField,
} from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { formatInrExact } from '../../../lib/format/currency.js';
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
  GIK_VALUATION_BASIS,
  INDIVIDUAL_ID_TYPE,
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
  donors = [],
  programmes = [],
  defaultValues,
  onSubmit,
  submitting,
  submitError,
  onCancel,
}) {
  const { control, handleSubmit, setValue, setError, formState: { errors } } = useForm({
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
  const employerMatchRouting = useWatch({ control, name: 'payrollBatch.employerMatchRouting' });
  const employerMoneyRouting = useWatch({ control, name: 'payrollBatch.employerMoneyRouting' });
  const programmeId = useWatch({ control, name: 'programmeId' });
  const sponsorshipTie = useWatch({ control, name: 'recurringMandate.sponsorshipTie' });
  const watchedCsvFile = useWatch({ control, name: 'payrollBatch.csvFile' });

  const selectedDonor = (donors || []).find((d) => String(d.id) === String(donorId));
  const isForeign = selectedDonor?.fundSourceDomicile === 'Foreign' || selectedDonor?.fundSourceDomicile === 'FOREIGN';
  const foreignDonor = isForeign;
  const bookValue = selectedDonor ? (isForeign ? 'FC · Foreign contribution' : 'LC · Local contribution') : '—';
  const isIndividualOrMajor =
    selectedDonor?.donorType === 'INDIVIDUAL' ||
    selectedDonor?.donorType === 'Individual' ||
    donationType === 'MAJOR_GIFT';

  const formattedAddress = selectedDonor
    ? [
        selectedDonor.address || selectedDonor.addressLine1 || selectedDonor.addressLine,
        selectedDonor.address2 || selectedDonor.addressLine2,
        selectedDonor.cityName || selectedDonor.city || selectedDonor.cityTown || selectedDonor.district,
        selectedDonor.stateName || selectedDonor.state,
        selectedDonor.pincode || selectedDonor.postalCode || selectedDonor.zipCode || selectedDonor.pin,
        selectedDonor.countryName || selectedDonor.country,
      ]
        .filter(Boolean)
        .join(', ') || '—'
    : '—';

  const hasPanOrId = Boolean(selectedDonor?.idNumber);
  const is10bdReportable = Boolean(selectedDonor?.donorName && hasPanOrId && formattedAddress !== '—');

  const indianEmployees = (employees?.fields || []).filter((f) => f.citizenship === 'INDIAN' || !f.citizenship);
  const indianTotal = indianEmployees.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const indianCount = indianEmployees.length;

  const foreignEmployees = (employees?.fields || []).filter((f) => f.citizenship === 'FOREIGN');
  const foreignTotal = foreignEmployees.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const foreignCount = foreignEmployees.length;

  const watchedGikItems = useWatch({ control, name: 'gikItems' }) || [];
  const totalFairValue = (watchedGikItems || []).reduce((acc, curr) => acc + (Number(curr?.fairValue) || 0), 0);

  const getGikTreatment = (intendedUse) => {
    switch (intendedUse) {
      case 'DISTRIBUTE_FREE':
      case 'Distribute free to beneficiaries':
        return 'Consumed — expense on distribution';
      case 'USE_INTERNALLY':
      case 'Use internally / consume in operations':
        return 'Consumed — expense on consumption';
      case 'RETAIN_FIXED_ASSET':
      case 'Retain and use as a fixed asset':
        return 'Kept — capitalise';
      case 'SELL_CONVERT_CASH':
      case 'Sell / convert to cash':
        return 'Held for sale — neither kept nor consumed';
      default:
        return '—';
    }
  };

  useEffect(() => {
    if (selectedDonor) {
      if (selectedDonor.idType) setValue('idType', selectedDonor.idType);
      if (selectedDonor.idNumber) setValue('idNumber', selectedDonor.idNumber);
    }
  }, [selectedDonor?.id, setValue]);

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

  // Gift in kind should always have ITEM 1 initialized by default
  useEffect(() => {
    if (donationType === 'GIK' && gikItems.fields.length === 0) {
      gikItems.append({
        itemDescription: '',
        quantity: '',
        fairValue: '',
        valuationBasis: 'MARKET_QUOTATION',
        valuationSource: '',
        intendedUse: 'DISTRIBUTE_FREE',
        treatment: '',
        programmeId: '',
        expiryDate: '',
        matchingLeg: '',
      });
    }
  }, [donationType, gikItems.fields.length]);

  useEffect(() => {
    if (donationType === 'GIK' && totalFairValue > 0) {
      setValue('amount', String(totalFairValue));
    }
  }, [donationType, totalFairValue, setValue]);

  const typeOptions = toOptions(DONATION_TYPE)
    .filter((o) => identification !== 'ANONYMOUS' || ANONYMOUS_ALLOWED_TYPES.includes(o.value))
    .map((o) => (o.value === 'LEGACY' ? { ...o, disabled: true } : o));
  const donorOptions = (donors || []).map((d) => ({
    value: String(d.id),
    label: `${d.donorName} — ${d.fundSourceDomicile || 'Domestic'}`,
  }));
  const programmeOptions = [{ value: '', label: '— not programme-tied —' }]
    .concat((programmes || []).map((p) => ({ value: String(p.id), label: p.programmeName })))
    .concat([{ value: 'OTHER', label: 'Other' }]);
  const gikProgrammeOptions = [{ value: '', label: 'Defaults from header — override per line' }]
    .concat((programmes || []).map((p) => ({ value: String(p.id), label: p.programmeName })))
    .concat([{ value: 'OTHER', label: 'Other' }]);
  const submit = handleSubmit(
    async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        applyServerErrors(error, setError);
      }
    },
    (errors) => {
      console.error('Client validation errors on donation save:', errors);
    }
  );

  return (
    <Card component="form" onSubmit={submit} noValidate>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {submitError && !submitError.fieldErrors ? (
            <Alert severity="error">{submitError.message}</Alert>
          ) : null}

          {Object.keys(errors).length > 0 ? (
            <Alert severity="error">
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Please fill in all required fields to save the donation:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0, fontSize: 13 }}>
                {Object.entries(errors).map(([key, err]) => {
                  const message = err?.message || (typeof err === 'object' && err?.root?.message) || 'Required field missing';
                  return <li key={key}>{String(message)}</li>;
                })}
              </Box>
            </Alert>
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
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect name="donorId" control={control} label="Donor" required options={donorOptions} />
              </Grid>

              {donorId ? (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Book"
                      value={bookValue}
                      disabled
                      fullWidth
                      helperText="Derived from donor fund source domicile"
                    />
                  </Grid>

                  {donationType === 'MAJOR_GIFT' && (isForeign || selectedDonor?.passportNumber) ? (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        label="Passport ID"
                        value={selectedDonor?.passportNumber || '—'}
                        disabled
                        fullWidth
                        slotProps={{ input: { sx: { textTransform: 'uppercase' } } }}
                        helperText="Donor passport details"
                      />
                    </Grid>
                  ) : null}

                  {isIndividualOrMajor ? (
                    <>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          label="ID type"
                          value={selectedDonor?.idType ? (INDIVIDUAL_ID_TYPE[selectedDonor.idType] || selectedDonor.idType) : '—'}
                          disabled
                          fullWidth
                          helperText="Derived from donor registry"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          label="ID number"
                          value={selectedDonor?.idNumber || '—'}
                          disabled
                          fullWidth
                          slotProps={{ input: { sx: { textTransform: 'uppercase' } } }}
                          helperText="Derived from donor registry"
                        />
                      </Grid>
                    </>
                  ) : null}

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Address"
                      value={formattedAddress}
                      disabled
                      fullWidth
                      helperText="Inherited from the donor record · required for 10BD"
                    />
                  </Grid>
                </>
              ) : null}
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
              {programmeId === 'OTHER' ? (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="otherProgramme"
                    control={control}
                    label="Other programme / purpose"
                    required
                    placeholder="Specify programme / purpose"
                  />
                </Grid>
              ) : null}
              <Grid size={{ xs: 12 }}>
                <GeographyMultiSelect
                  name="stateIds"
                  control={control}
                  label="Location / State"
                  required
                  helperText="One gift may fund work across several states — feeds FCRA state-wise disclosure. Select All to apply every state."
                  allSelectsEverything
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
              <Grid size={{ xs: 12 }}>
                <RhfRadioGroup
                  name="isConditionalGift"
                  control={control}
                  label="Conditional gift"
                  row
                  options={[
                    { value: 'false', label: 'No — recognise as income now' },
                    { value: 'true', label: 'Yes — donor can reclaim if unmet' },
                  ]}
                />
              </Grid>
              {isConditionalGift === 'true' || isConditionalGift === true ? (
                <Grid size={{ xs: 12 }}>
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

          {donationType === 'RECURRING' ? (
            <section>
              <SectionTitle>Recurring mandate</SectionTitle>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The only donation type with a forward schedule — but a mandate, not a tranche. No release criteria, no verification steps.
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfTextField
                    name="recurringMandate.mandateId"
                    control={control}
                    label="Mandate ID"
                    required
                    placeholder="NACH / eMandate ref"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfSelect
                    name="recurringMandate.frequency"
                    control={control}
                    label="Frequency"
                    required
                    options={toOptions(MANDATE_FREQUENCY)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfTextField
                    name="recurringMandate.startDate"
                    control={control}
                    label="Mandate start date"
                    required
                    {...dateProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfSelect
                    name="recurringMandate.mandateStatus"
                    control={control}
                    label="Mandate status"
                    required
                    options={toOptions(MANDATE_STATUS)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfTextField
                    name="recurringMandate.nextExpectedDebitDate"
                    control={control}
                    label="Next expected debit"
                    {...dateProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfSelect
                    name="recurringMandate.sponsorshipTie"
                    control={control}
                    label="Sponsorship tie"
                    options={[
                      { value: '', label: '— none —' },
                      { value: 'CHILD_SPONSORSHIP', label: 'Child sponsorship' },
                      { value: 'PROGRAMME_SPONSORSHIP', label: 'Programme sponsorship' },
                      { value: 'OTHER', label: 'Other' },
                    ]}
                  />
                </Grid>
                {sponsorshipTie === 'OTHER' ? (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <RhfTextField
                      name="recurringMandate.otherSponsorshipTie"
                      control={control}
                      label="Other sponsorship tie"
                      required
                      placeholder="Specify sponsorship tie"
                    />
                  </Grid>
                ) : null}
              </Grid>
            </section>
          ) : null}

          {donationType === 'PAYROLL_GIVING' ? (
            <section>
              <SectionTitle>Payroll giving</SectionTitle>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                One employer remittance explodes into many individual donor records.
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfTextField
                    name="payrollBatch.employer"
                    control={control}
                    label="Employer"
                    required
                    placeholder="Info Edge India Ltd"
                    helperText="A grouping tag for reporting — the employer is not the donor"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <input
                      type="file"
                      accept=".csv"
                      id="payroll-csv-upload"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setValue('payrollBatch.csvFile', file.name);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const text = event.target.result;
                          const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
                          const parsed = [];
                          for (let i = 1; i < lines.length; i++) {
                            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
                            if (cols.length >= 4) {
                              parsed.push({
                                name: cols[0] || `Employee ${i}`,
                                idType: cols[1] || 'PAN',
                                idNumber: cols[2] || '',
                                amount: cols[3] || '0',
                                citizenship: (cols[4] || 'INDIAN').toUpperCase().includes('FOREIGN') ? 'FOREIGN' : 'INDIAN',
                              });
                            }
                          }
                          if (parsed.length > 0) {
                            setValue('payrollBatch.employees', parsed);
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                    <RhfTextField
                      name="payrollBatch.csvFile"
                      control={control}
                      label="Employee giving list"
                      required
                      fullWidth
                      InputProps={{ readOnly: true, tabIndex: -1 }}
                      FormHelperTextProps={{ sx: { display: 'none' } }}
                      sx={{ pointerEvents: 'none' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                      <label htmlFor="payroll-csv-upload" style={{ cursor: 'pointer' }}>
                        <Button
                          component="span"
                          size="small"
                          startIcon={<UploadFileIcon />}
                          sx={{ textTransform: 'none', fontSize: 12, p: 0, minWidth: 0, fontWeight: 600 }}
                        >
                          {watchedCsvFile ? 'Change CSV' : 'Upload CSV'}
                        </Button>
                      </label>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Employees in list"
                    value={employees.fields.length > 0 ? `${employees.fields.length} employees` : '—'}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfSelect
                    name="payrollBatch.employerMatchRouting"
                    control={control}
                    label="Does the employer match?"
                    required
                    options={[
                      { value: 'NO', label: 'No — employee-only giving' },
                      { value: 'FULL_MATCH', label: 'Yes — full match' },
                      { value: 'PARTIAL_MATCH', label: 'Yes — partial match' },
                    ]}
                    helperText="Matching is optional. Most payroll giving is employee-only."
                  />
                </Grid>

                {employerMatchRouting && employerMatchRouting !== 'NO' ? (
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1D1C16' : '#F8F7F3'),
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Employer match — the company&apos;s own money, separate from the employees&apos;
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <RhfTextField
                            name="payrollBatch.matchAmount"
                            control={control}
                            label="Match amount (INR)"
                            required
                            placeholder="e.g. 200000"
                            helperText={
                              employerMatchRouting === 'FULL_MATCH'
                                ? 'Full match — mirrors the employee total'
                                : 'Partial match — enter the company\'s contribution'
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <RhfSelect
                            name="payrollBatch.employerMoneyRouting"
                            control={control}
                            label="What is the employer's money?"
                            required
                            options={[
                              {
                                value: 'PAYROLL_GIVING_TAGGED',
                                label: 'Keep in payroll giving — company donation, tagged to this drive',
                              },
                              {
                                value: 'CSR_ROUTED',
                                label: 'Treat as CSR — route to the CSR contribution income head',
                              },
                            ]}
                            helperText="Routing governs the company's half only — never the employees'"
                          />
                        </Grid>

                        {employerMoneyRouting === 'CSR_ROUTED' ? (
                          <Grid size={{ xs: 12 }}>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <RhfSelect
                                  name="payrollBatch.csrFinancialYear"
                                  control={control}
                                  label="CSR financial year"
                                  required
                                  options={[
                                    { value: 'FY 2026-27', label: 'FY 2026-27' },
                                    { value: 'FY 2025-26', label: 'FY 2025-26' },
                                    { value: 'FY 2024-25', label: 'FY 2024-25' },
                                  ]}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <RhfTextField
                                  name="payrollBatch.csrProjectRef"
                                  control={control}
                                  label="CSR project reference"
                                  placeholder="Company's internal CSR project ID, if any"
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        ) : null}
                      </Grid>
                    </Box>
                  </Grid>
                ) : null}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#201F18' : '#FDFCF9'),
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', fontWeight: 700, fontSize: 11 }}
                    >
                      INDIAN CITIZENS &rarr; LC BOOK
                    </Typography>
                    <Typography variant="h3" sx={{ my: 0.5, fontWeight: 700 }}>
                      {formatInrExact(indianTotal)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {indianCount} employees &middot; domestic account
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#201F18' : '#FDFCF9'),
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64B5F6', fontWeight: 700, fontSize: 11 }}
                    >
                      FOREIGN CITIZENS &rarr; FC BOOK
                    </Typography>
                    <Typography variant="h3" sx={{ my: 0.5, fontWeight: 700, color: '#64B5F6' }}>
                      {formatInrExact(foreignTotal)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {foreignCount} employees &middot; FCRA designated account only
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </section>
          ) : null}

          {donationType === 'GIK' ? (
            <section>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <SectionTitle>Gift in kind — line items</SectionTitle>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    gikItems.append({
                      itemDescription: '',
                      quantity: '',
                      fairValue: '',
                      valuationBasis: 'MARKET_QUOTATION',
                      valuationSource: '',
                      intendedUse: 'DISTRIBUTE_FREE',
                      treatment: '',
                      programmeId: '',
                      expiryDate: '',
                      matchingLeg: '',
                    })
                  }
                >
                  Add item
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                One gift may contain several different items, each with a different destination. Add a line per item and set its <strong>intended use</strong> — that, not the item itself, drives the accounting.
              </Typography>

              {gikItems.fields.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No line items yet — click &quot;Add item&quot; to add one.
                </Typography>
              ) : null}

              <Stack spacing={2.5}>
                {gikItems.fields.map((f, i) => {
                  const currentIntendedUse = watchedGikItems[i]?.intendedUse || f.intendedUse;
                  const currentItemProgrammeId = watchedGikItems[i]?.programmeId || f.programmeId;
                  const autoTreatment = getGikTreatment(currentIntendedUse);

                  return (
                    <Box
                      key={f.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1D1C16' : '#F8F7F3'),
                      }}
                    >
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'text.secondary', fontSize: 11 }}
                        >
                          ITEM {i + 1}
                        </Typography>
                        {gikItems.fields.length > 1 ? (
                          <IconButton aria-label="Remove item" size="small" onClick={() => gikItems.remove(i)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </Stack>

                      <Grid container spacing={2}>
                        {/* Row 1: Item description */}
                        <Grid size={{ xs: 12 }}>
                          <RhfTextField
                            name={`gikItems.${i}.itemDescription`}
                            control={control}
                            label="Item description"
                            required
                            placeholder="e.g. 500 shares of XYZ Ltd / 40 office chairs / 200 medicine strips"
                          />
                        </Grid>

                        {/* Row 2: Quantity, Fair value, Valuation basis, Valuation source */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <RhfTextField
                            name={`gikItems.${i}.quantity`}
                            control={control}
                            label="Quantity"
                            required
                            type="number"
                            placeholder="500"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <RhfTextField
                            name={`gikItems.${i}.fairValue`}
                            control={control}
                            label="Fair value (INR)"
                            required
                            type="number"
                            placeholder="840000"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <RhfSelect
                            name={`gikItems.${i}.valuationBasis`}
                            control={control}
                            label="Valuation basis"
                            required
                            options={toOptions(GIK_VALUATION_BASIS)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <RhfTextField
                            name={`gikItems.${i}.valuationSource`}
                            control={control}
                            label="Valuation source"
                            required
                            placeholder="Broker quote #4471 / Invoice INV-88"
                            helperText="The actual reference proving the value — depends on the basis chosen"
                          />
                        </Grid>

                        {/* Row 3: Intended use, Treatment, Programme / purpose, (Expiry date / Liquidation due date) */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <RhfSelect
                            name={`gikItems.${i}.intendedUse`}
                            control={control}
                            label="Intended use"
                            required
                            options={toOptions(GIK_INTENDED_USE)}
                            helperText="What will we do with this? This — not the item — drives the accounting."
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <TextField
                            label="Treatment"
                            value={autoTreatment}
                            disabled
                            fullWidth
                            helperText="Auto-derived from intended use · override with a logged reason for exceptions"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <RhfSelect
                            name={`gikItems.${i}.programmeId`}
                            control={control}
                            label="Programme / purpose"
                            required
                            options={gikProgrammeOptions}
                          />
                        </Grid>
                        {currentItemProgrammeId === 'OTHER' ? (
                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <RhfTextField
                              name={`gikItems.${i}.otherProgramme`}
                              control={control}
                              label="Other programme / purpose"
                              required
                              placeholder="Specify programme / purpose"
                            />
                          </Grid>
                        ) : null}

                        {currentIntendedUse === 'RETAIN_FIXED_ASSET' || currentIntendedUse === 'Retain and use as a fixed asset' ? null : currentIntendedUse === 'SELL_CONVERT_CASH' || currentIntendedUse === 'Sell / convert to cash' ? (
                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                              label="Liquidation due date"
                              value="31 Mar 2028"
                              disabled
                              fullWidth
                              helperText="Computed — 31 Mar of the second FY after receipt. The deadline, not the plan."
                            />
                          </Grid>
                        ) : (
                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <RhfTextField
                              name={`gikItems.${i}.expiryDate`}
                              control={control}
                              label="Expiry / use-by date"
                              {...dateProps}
                              helperText="Optional — flags distributable stock nearing expiry"
                            />
                          </Grid>
                        )}

                        {/* Extra row for Sell / convert to cash: Liquidation status, Actual sale date, Actual proceeds */}
                        {currentIntendedUse === 'SELL_CONVERT_CASH' || currentIntendedUse === 'Sell / convert to cash' ? (
                          <>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <RhfSelect
                                name={`gikItems.${i}.realisationStatus`}
                                control={control}
                                label="Liquidation status"
                                required
                                options={[
                                  { value: 'PENDING', label: 'Pending' },
                                  { value: 'REALISED', label: 'Realised' },
                                ]}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <RhfTextField
                                name={`gikItems.${i}.actualSaleDate`}
                                control={control}
                                label="Actual sale date"
                                {...dateProps}
                                helperText="Filled in later, when the asset is actually sold"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <RhfTextField
                                name={`gikItems.${i}.actualProceeds`}
                                control={control}
                                label="Actual proceeds (INR)"
                                type="number"
                                placeholder="—"
                                helperText="Entered at sale · difference from fair value is a gain/loss"
                              />
                            </Grid>
                          </>
                        ) : null}

                        {/* Row 4: Matching leg */}
                        <Grid size={{ xs: 12 }}>
                          <RhfTextField
                            name={`gikItems.${i}.matchingLeg`}
                            control={control}
                            label="Matching leg"
                            required
                            placeholder="Enter matching leg — asset or expense reference"
                            helperText="Entered manually by the finance user (no longer auto-generated)"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </Stack>

              {/* Total Fair Value Footer */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  p: 2,
                  mt: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1D1C16' : '#F8F7F3'),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total fair value &mdash; computed from lines, read-only
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatInrExact(totalFairValue)}
                </Typography>
              </Box>
            </section>
          ) : null}

          {donationType === 'CORPUS' ? (
            <section>
              <SectionTitle>Corpus</SectionTitle>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Capital, not revenue. Never enters the year&apos;s income or surplus.
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <RhfTextField
                    name="corpusDetail.writtenDirectionRef"
                    control={control}
                    label="Written direction reference"
                    required
                    placeholder="Letter ref / deed number"
                    helperText="Mandatory — save is blocked without it"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="corpusDetail.directionDate"
                    control={control}
                    label="Direction date"
                    required
                    {...dateProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="corpusDetail.directionDocumentPath"
                    control={control}
                    label="Direction document"
                    required
                    placeholder="Attach file..."
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <RhfSelect
                    name="corpusDetail.investmentMode"
                    control={control}
                    label="Investment mode — Sec 11(5)"
                    required
                    options={toOptions(INVESTMENT_MODE)}
                    helperText="Non-permitted modes risk the exemption — flagged as a compliance breach"
                  />
                </Grid>
              </Grid>
            </section>
          ) : null}

          <section>
            <SectionTitle>Tax &amp; receipting</SectionTitle>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="80G eligible"
                  value={
                    donationType === 'GIK'
                      ? 'No — 80G is not issued for gifts in kind'
                      : 'Yes'
                  }
                  disabled
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: donationType === 'GIK' ? '#E53935' : 'text.primary',
                      WebkitTextFillColor: 'inherit',
                      fontWeight: 600,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <RhfTextField
                  name="receiptNumber80g"
                  control={control}
                  label="80G receipt number"
                  placeholder="Enter receipt number"
                  disabled={donationType === 'GIK'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="10BD reportable"
                  value={is10bdReportable ? 'Yes — all three conditions met' : 'No — missing required donor details'}
                  disabled
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: 'text.primary',
                      WebkitTextFillColor: 'inherit',
                      fontWeight: 600,
                    },
                  }}
                  helperText="System-derived: Yes only if Donor Name + PAN + Address all present; else No"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <RhfTextField
                  name="certificate10be"
                  control={control}
                  label="10BE certificate"
                  placeholder="Enter 10BE certificate detail"
                  disabled={donationType === 'GIK'}
                />
              </Grid>
            </Grid>
          </section>

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
