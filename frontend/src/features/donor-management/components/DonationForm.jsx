import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { donationSchema } from '../validation/donationSchema.js';

export function DonationForm({ onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donationCode: '',
      donationType: 'major',
      receiptDate: '',
      channel: 'Bank transfer / NEFT / RTGS',
      isAnonymous: false,
      donorId: 'Rohan Kapadia — DNR-CD-003',
      idType: 'PAN',
      idNumber: '',
      address: '',
      fundMode: 'res',
      fundClass: 'Class A — fully restricted',
      programme: 'Clean Air Action Programme',
      locations: ['Delhi', 'Madhya Pradesh'],
      utilisationPeriod: 'fy',
      isConditional: false,
      currency: 'INR',
      amount: '',
      fxRate: 1,
      bankAccountId: 'Domestic — current account',
      transactionRef: '',
    },
  });

  const donationType = watch('donationType');
  const isAnonymous = watch('isAnonymous');
  const fundMode = watch('fundMode');
  const currency = watch('currency');

  return (
    <Card component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={4}>
          {/* SECTION 01: DONATION IDENTITY */}
          <Box component="section">
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Donation Identity
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Donation Code"
                  placeholder="e.g. ZRY/DN/2026/0008"
                  {...register('donationCode')}
                  helperText="Auto-generated · read-only"
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Donation Type *"
                  {...register('donationType')}
                  error={Boolean(errors.donationType)}
                  helperText={errors.donationType?.message || ' '}
                  fullWidth
                >
                  <MenuItem value="major">Major gift / HNI</MenuItem>
                  <MenuItem value="onetime">One-time donation</MenuItem>
                  <MenuItem value="recurring">Recurring giving</MenuItem>
                  <MenuItem value="payroll">Payroll giving</MenuItem>
                  <MenuItem value="legacy">Legacy / bequest</MenuItem>
                  <MenuItem value="gik">Gift in kind</MenuItem>
                  <MenuItem value="corpus">Corpus</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  type="date"
                  label="Receipt Date *"
                  {...register('receiptDate')}
                  error={Boolean(errors.receiptDate)}
                  helperText="Date of credit, not date of entry"
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      sx: {
                        '& ::-webkit-calendar-picker-indicator': {
                          filter: (theme) => (theme.palette.mode === 'dark' ? 'invert(0.9) brightness(1.2)' : 'none'),
                          cursor: 'pointer',
                        },
                      },
                    },
                  }}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Channel *"
                  {...register('channel')}
                  error={Boolean(errors.channel)}
                  helperText=" "
                  fullWidth
                >
                  <MenuItem value="Bank transfer / NEFT / RTGS">Bank transfer / NEFT / RTGS</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Card">Card</MenuItem>
                  <MenuItem value="Standing instruction">Standing instruction</MenuItem>
                  <MenuItem value="In-kind — no cash">In-kind — no cash</MenuItem>
                </TextField>
              </Grid>.

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Book"
                  value="LC · Local contribution"
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Inherited from the donor · cannot change"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          {/* SECTION 02: DONOR IDENTIFICATION */}
          <Box component="section">
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Donor Identification
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Donor Identification *
              </Typography>
              <RadioGroup
                row
                value={isAnonymous ? 'anon' : 'named'}
                onChange={(e) => setValue('isAnonymous', e.target.value === 'anon')}
              >
                <FormControlLabel value="named" control={<Radio color="primary" />} label="Named donor" />
                <FormControlLabel value="anon" control={<Radio color="primary" />} label="Anonymous" />
              </RadioGroup>
            </FormControl>

            {!isAnonymous ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    label="Donor *"
                    {...register('donorId')}
                    helperText="Searchable. Creating here adds the record to the Donor Register."
                    fullWidth
                  >
                    <MenuItem value="Rohan Kapadia — DNR-CD-003">Rohan Kapadia — DNR-CD-003</MenuItem>
                    <MenuItem value="Anjali Verma — DNR-CD-004">Anjali Verma — DNR-CD-004</MenuItem>
                    <MenuItem value="Horizon Global Fund — DNR-CD-005">Horizon Global Fund — DNR-CD-005</MenuItem>
                    <MenuItem value="new">+ Create new donor…</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="ID Type *"
                    {...register('idType')}
                    helperText="Inherited from donor record. Pick-one — statutory 10BD identifier."
                    fullWidth
                  >
                    <MenuItem value="PAN">PAN</MenuItem>
                    <MenuItem value="Aadhaar">Aadhaar</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                    <MenuItem value="Voter ID">Voter ID</MenuItem>
                    <MenuItem value="Driving licence">Driving licence</MenuItem>
                    <MenuItem value="Foreign Tax Identification Number">Foreign Tax Identification Number</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="ID Number *"
                    placeholder="e.g. ABCDE1234F"
                    {...register('idNumber')}
                    error={Boolean(errors.idNumber)}
                    helperText="Format-validated per ID type. PAN: 5 letters, 4 digits, 1 letter."
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Address"
                    placeholder="e.g. 14 Nehru Park, New Delhi 110021"
                    {...register('address')}
                    helperText="Inherited from the donor record · required for 10BD"
                    fullWidth
                  />
                </Grid>
              </Grid>
            ) : (
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  An 80G receipt and the 10BD statement both need an identified donor.
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Collection source *"
                      placeholder="e.g. Donation box, Event collection"
                      {...register('collectionSource')}
                      helperText="e.g. Donation box, Event collection"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Source reference *"
                      placeholder="Box location · event name and date · bank credit reference"
                      {...register('sourceReference')}
                      helperText="Box location · event name and date · bank credit reference"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}
          </Box>

          {/* SECTION 03: FUND TREATMENT */}
          <Box component="section">
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Fund Treatment
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Fund Mode *" {...register('fundMode')} fullWidth>
                  <MenuItem value="unres">Unrestricted</MenuItem>
                  <MenuItem value="res">Restricted</MenuItem>
                </TextField>
              </Grid>

              {fundMode === 'res' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select label="Fund Class" {...register('fundClass')} fullWidth>
                    <MenuItem value="Class A — fully restricted">Class A — fully restricted</MenuItem>
                    <MenuItem value="Class B — movement with explanation">Class B — movement with explanation</MenuItem>
                    <MenuItem value="Class C — fully unrestricted">Class C — fully unrestricted</MenuItem>
                  </TextField>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Programme"
                  {...register('programme')}
                  helperText="Independent of restriction — an unrestricted gift can still be programme-tied"
                  fullWidth
                >
                  <MenuItem value="— not programme-tied —">— not programme-tied —</MenuItem>
                  <MenuItem value="Clean Air Action Programme">Clean Air Action Programme</MenuItem>
                  <MenuItem value="Urban Water & Sanitation">Urban Water & Sanitation</MenuItem>
                  <MenuItem value="new">+ Create new programme…</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Location / State *"
                  defaultValue={['Delhi']}
                  slotProps={{ select: { multiple: true } }}
                  helperText="Multi-select — one gift may fund work across several states. Feeds FCRA state-wise disclosure."
                  fullWidth
                >
                  <MenuItem value="Delhi">Delhi</MenuItem>
                  <MenuItem value="Madhya Pradesh">Madhya Pradesh</MenuItem>
                  <MenuItem value="Rajasthan">Rajasthan</MenuItem>
                  <MenuItem value="Uttar Pradesh">Uttar Pradesh</MenuItem>
                  <MenuItem value="All states">All states</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select label="Utilisation period *" {...register('utilisationPeriod')} fullWidth>
                  <MenuItem value="fy">Single financial year</MenuItem>
                  <MenuItem value="multi">Multi-year</MenuItem>
                  <MenuItem value="defined">Defined period</MenuItem>
                  <MenuItem value="perp">Perpetual — corpus</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  type="date"
                  label="Utilisation start"
                  {...register('utilisationStart')}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      sx: {
                        '& ::-webkit-calendar-picker-indicator': {
                          filter: (theme) => (theme.palette.mode === 'dark' ? 'invert(0.9) brightness(1.2)' : 'none'),
                          cursor: 'pointer',
                        },
                      },
                    },
                  }}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  type="date"
                  label="Utilisation end"
                  {...register('utilisationEnd')}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      sx: {
                        '& ::-webkit-calendar-picker-indicator': {
                          filter: (theme) => (theme.palette.mode === 'dark' ? 'invert(0.9) brightness(1.2)' : 'none'),
                          cursor: 'pointer',
                        },
                      },
                    },
                  }}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl component="fieldset">
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Conditional Gift *
                  </Typography>
                  <RadioGroup
                    row
                    value={watch('isConditional') ? 'yes' : 'no'}
                    onChange={(e) => setValue('isConditional', e.target.value === 'yes')}
                  >
                    <FormControlLabel value="no" control={<Radio color="primary" />} label="No — recognise as income now" />
                    <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes — donor can reclaim if conditions unmet" />
                  </RadioGroup>
                  <FormHelperText>
                    &quot;Yes&quot; books this as deferred income (a liability), not current-year income. Restriction alone does not defer income — only a reclaim condition does.
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* SECTION 04: MONEY & BANKING */}
          <Box component="section">
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Money & Banking
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: currency !== 'INR' ? 4 : 6 }}>
                <TextField select label="Currency *" {...register('currency')} fullWidth>
                  <MenuItem value="INR">INR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: currency !== 'INR' ? 4 : 6 }}>
                <TextField
                  type="number"
                  label="Amount *"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                  error={Boolean(errors.amount)}
                  helperText={errors.amount?.message || ' '}
                  fullWidth
                />
              </Grid>

              {currency !== 'INR' && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    type="number"
                    label="FX Rate → INR *"
                    {...register('fxRate', { valueAsNumber: true })}
                    helperText="RBI reference rate on receipt date"
                    fullWidth
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Bank Account Received Into *" {...register('bankAccountId')} fullWidth>
                  <MenuItem value="Domestic — current account">Domestic — current account</MenuItem>
                  <MenuItem value="FCRA designated — SBI Main Branch">FCRA designated — SBI Main Branch</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Transaction Reference"
                  placeholder="UTR / cheque no."
                  {...register('transactionRef')}
                  helperText="Used to match the Tally voucher"
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Tally Voucher"
                  value="Not yet matched"
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Read-only. Amount and date confirm against Tally entry on reconciliation."
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          {/* DYNAMIC CONDITIONAL TYPE BLOCKS */}
          {donationType === 'gik' && (
            <Box component="section">
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                Gift in Kind
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Item Description *" placeholder="e.g. 120 school desks" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField type="number" label="Quantity *" placeholder="120" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField type="number" label="Fair Value (INR) *" placeholder="840000" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField select label="Valuation Basis *" defaultValue="Market quotation" fullWidth>
                    <MenuItem value="Market quotation">Market quotation</MenuItem>
                    <MenuItem value="Supplier invoice">Supplier invoice</MenuItem>
                    <MenuItem value="Registered valuer certificate">Registered valuer certificate</MenuItem>
                    <MenuItem value="Donor declaration">Donor declaration</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          )}

          {donationType === 'corpus' && (
            <Box component="section">
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                Corpus
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Written Direction Reference *"
                    placeholder="Letter ref / deed number"
                    helperText="Mandatory — save is blocked without it"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField type="date" label="Direction Date *" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select label="Investment Mode — Sec 11(5) *" defaultValue="Scheduled bank deposit" fullWidth>
                    <MenuItem value="Scheduled bank deposit">Scheduled bank deposit</MenuItem>
                    <MenuItem value="Government securities">Government securities</MenuItem>
                    <MenuItem value="Post office savings">Post office savings</MenuItem>
                    <MenuItem value="Units of UTI">Units of UTI</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          )}

          {donationType === 'recurring' && (
            <Box component="section">
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                Recurring Mandate
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Mandate ID *" placeholder="NACH / eMandate ref" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select label="Frequency *" defaultValue="Monthly" fullWidth>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Quarterly">Quarterly</MenuItem>
                    <MenuItem value="Half-yearly">Half-yearly</MenuItem>
                    <MenuItem value="Annual">Annual</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField type="date" label="Mandate Start Date *" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select label="Mandate Status *" defaultValue="Active" fullWidth>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Paused">Paused</MenuItem>
                    <MenuItem value="Failed">Failed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          )}

          {donationType === 'payroll' && (
            <Box component="section">
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                Payroll Giving
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select label="Employer *" defaultValue="Info Edge India Ltd" fullWidth>
                    <MenuItem value="Info Edge India Ltd">Info Edge India Ltd</MenuItem>
                    <MenuItem value="Greenline Power Ltd">Greenline Power Ltd</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Employer Match Routing"
                    defaultValue="Keep in payroll giving — tagged"
                    fullWidth
                  >
                    <MenuItem value="Keep in payroll giving — tagged">Keep in payroll giving — tagged</MenuItem>
                    <MenuItem value="Treat as CSR — route to 1103">Treat as CSR — route to 1103</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          )}

          {donationType === 'legacy' && (
            <Box component="section">
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                Legacy / Bequest
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField select label="Bequest Status *" defaultValue="In probate" fullWidth>
                    <MenuItem value="Notified">Notified</MenuItem>
                    <MenuItem value="In probate">In probate</MenuItem>
                    <MenuItem value="Received">Received</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="Probate Reference" placeholder="Court / executor ref" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField type="number" label="Expected Value" placeholder="1800000" fullWidth />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ACTIONS */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" size="large" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              Save Donation
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
} 
