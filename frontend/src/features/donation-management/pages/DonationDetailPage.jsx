import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader, RhfSelect, RhfTextField, StatusChip } from '../../../shared/components/index.js';
import { useForm } from 'react-hook-form';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { formatInr, formatInrExact } from '../../../lib/format/currency.js';
import { useDonor } from '../../donor-management/hooks/useDonors.js';
import {
  useDonation,
  useIssueEightyGReceipt,
  useMarkTenBdFiling,
  useUpdateGikIntendedUse,
} from '../hooks/useDonations.js';
import {
  BOOK_TONE,
  EIGHTY_G_STATUS_TONE,
  FUND_MODE_TONE,
  GIK_INTENDED_USE,
  GIK_REALISATION_STATUS_TONE,
  MANDATE_STATUS_TONE,
  RECOGNITION_STATUS_TONE,
  TEN_BE_STATUS_TONE,
  toOptions,
} from '../constants.js';

function TermRow({ label, children, last = false }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ py: 1.75, alignItems: 'center', borderBottom: last ? 'none' : '1px solid', borderColor: 'divider' }}
    >
      <Typography
        variant="caption"
        sx={{ width: { xs: 140, sm: 190 }, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Box sx={{ minWidth: 0 }}>
        {typeof children === 'string' || typeof children === 'number' ? (
          <Typography variant="body1">{children}</Typography>
        ) : (
          children
        )}
      </Box>
    </Stack>
  );
}

function SectionCard({ title, children, actions = null }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h4" component="h2">
            {title}
          </Typography>
          {actions}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

/** Dialog to log a GIK line item's intended-use change (never silently overwritten). */
function IntendedUseDialog({ item, donationId, open, onClose }) {
  const { control, handleSubmit, reset } = useForm({ defaultValues: { intendedUse: item?.intendedUse || '', reason: '' } });
  const mutation = useUpdateGikIntendedUse(donationId);

  const submit = handleSubmit(async (values) => {
    await mutation.mutateAsync({ gikItemId: item.id, ...values });
    reset();
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change intended use — {item?.itemDescription}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <RhfSelect name="intendedUse" control={control} label="New intended use" required options={toOptions(GIK_INTENDED_USE)} />
          <RhfTextField name="reason" control={control} label="Reason" required multiline minRows={2} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={mutation.isPending} color="inherit">
          Cancel
        </Button>
        <Button onClick={submit} disabled={mutation.isPending} variant="contained">
          {mutation.isPending ? 'Saving…' : 'Save change'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function UtilisationPieChart({ utilised, available, total }) {
  const utilisedPct = total > 0 ? (utilised / total) * 100 : 0;
  const availablePct = total > 0 ? (available / total) * 100 : 100;

  const radius = 55;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const availableOffset = circumference - (availablePct / 100) * circumference;

  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 1 }}>
      <Box sx={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#2e7d32"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#0288d1"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={availableOffset}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {availablePct.toFixed(1)}%
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11, mt: 0.5 }}>
            Available
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0288d1' }} />
          <Typography variant="caption" sx={{ fontSize: 12 }}>Utilised ({utilisedPct.toFixed(0)}%)</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2e7d32' }} />
          <Typography variant="caption" sx={{ fontSize: 12 }}>Available ({availablePct.toFixed(0)}%)</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

/** Single donation view — /donations/:id. A donation has no committed stage: it is income the moment it lands. */
export function DonationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const donationQuery = useDonation(id);
  const donation = donationQuery.data;
  const donorQuery = useDonor(donation?.donorId);
  const issueEightyG = useIssueEightyGReceipt(id);
  const markTenBd = useMarkTenBdFiling(id);
  const [editingGikItem, setEditingGikItem] = useState(null);

  if (donationQuery.isPending) return <LoadingState label="Loading donation…" />;
  if (donationQuery.isError) return <ErrorState error={donationQuery.error} onRetry={donationQuery.refetch} />;

  const donor = donorQuery.data;

  const foreign = donation.currency && donation.currency !== 'INR';

  const donorTypeLabel =
    donor?.donorTypeLabel ||
    donor?.donorType ||
    donation?.donorTypeLabel ||
    donation?.donorType ||
    '—';

  const donorTypeUpper = String(donorTypeLabel).toUpperCase();

  const isIndividualDonor = donorTypeUpper.includes('INDIVIDUAL');

  const isHniDonation =
    donation.donationType === 'MAJOR_GIFT' ||
    donation.donationType === 'HNI' ||
    String(donation.typeLabel).toUpperCase().includes('HNI') ||
    String(donation.typeLabel).toUpperCase().includes('MAJOR GIFT');

  const isForeignBook =
    donation.book === 'FC' ||
    donation.book === 'FOREIGN' ||
    String(donation.bookLabel).toUpperCase().includes('FOREIGN') ||
    String(donation.bookLabel).toUpperCase().includes('FC') ||
    donor?.fundSourceDomicile === 'Foreign' ||
    donor?.fundSourceDomicile === 'FOREIGN';

  const shouldShowPassport = isIndividualDonor && isHniDonation && isForeignBook;

  const fullAddress = [
    donor?.address || donation?.donorAddress || donation?.address,
    donor?.address2 || donation?.donorAddress2 || donation?.address2,
    donor?.cityName || donor?.city || donation?.donorCity || donation?.cityName || donation?.city,
    donor?.stateName || donor?.state || donation?.donorState || donation?.stateName || donation?.state,
    donor?.postalCode || donor?.pincode || donation?.donorPostalCode || donation?.pincode || donation?.postalCode,
    donor?.countryName || donor?.country || donation?.donorCountry || donation?.countryName || donation?.country,
  ]
    .filter(Boolean)
    .join(', ') || '—';

  const receivedAmount = Number(donation.amount) || 0;
  const utilisedAmount = Number(donation.utilisedAmount || donation.totalUtilised || 0);
  const availableAmount = Math.max(0, receivedAmount - utilisedAmount);

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/donations')}>
        Donations
      </Button>

      <PageHeader
        title={donation.donationCode}
        subtitle={`${donation.typeLabel} · ${donation.donorName} · received ${formatDate(donation.receiptDate)}`}
        actions={
          <Stack direction="row" spacing={1.5}>
            <StatusChip label={donation.recognitionLabel} tone={RECOGNITION_STATUS_TONE[donation.recognitionStatus] || 'neutral'} />
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Donation terms">
            <TermRow label="Code">{donation.donationCode}</TermRow>
            <TermRow label="Type">{donation.typeLabel}</TermRow>
            <TermRow label="Receipt date">{formatDate(donation.receiptDate)}</TermRow>
            <TermRow label="Channel">{donation.channel}</TermRow>
            <TermRow label="Recorded by">{donation.createdBy || '—'}</TermRow>
            <TermRow label="Status" last>
              <StatusChip label={donation.recognitionLabel} tone={RECOGNITION_STATUS_TONE[donation.recognitionStatus] || 'neutral'} />
            </TermRow>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Donor & identification">
            <TermRow label="Donor">
              {donation.donorId ? (
                <Link component={RouterLink} to={`/donors/${donation.donorId}`} underline="hover">
                  {donation.donorName}
                </Link>
              ) : (
                donation.donorName || '—'
              )}
            </TermRow>
            {donation.donorId ? (
              <>
                <TermRow label="Donor type">{donorTypeLabel}</TermRow>
                <TermRow label="Domicile">
                  {donor?.fundSourceDomicile || donation?.fundSourceDomicile || (isForeignBook ? 'Foreign' : 'Domestic')}
                </TermRow>
                <TermRow label="Book">
                  <StatusChip
                    label={
                      donation.bookLabel ||
                      (isForeignBook ? 'FC · Foreign contribution' : 'LC · Local contribution')
                    }
                    tone={BOOK_TONE[donation.book] || 'neutral'}
                  />
                </TermRow>
                {shouldShowPassport ? (
                  <TermRow label="Passport ID">{donor?.passportNumber || donation.passportNumber || donation.foreignTaxIdentifier || '—'}</TermRow>
                ) : null}
                {donation.idTypeLabel || donation.idNumber || donor?.panCardNumber ? (
                  <TermRow label="ID details">{`${donation.idTypeLabel || donation.idType || (donor?.panCardNumber ? 'PAN Card' : '')} · ${donation.idNumber || donor?.panCardNumber || ''}`}</TermRow>
                ) : (
                  <TermRow label="ID">No identifier on file</TermRow>
                )}
                <TermRow label="Address" last>
                  {fullAddress}
                </TermRow>
              </>
            ) : (
              <>
                <TermRow label="Collection source">{donation.anonymousCollectionSource || '—'}</TermRow>
                <TermRow label="Source reference" last>
                  {donation.anonymousSourceReference || '—'}
                </TermRow>
              </>
            )}
            {donation.anonymousFyLimit != null ? (
              <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: 'error.main', color: 'error.contrastText' }}>
                <Typography variant="subtitle2">Section 115BBC applies</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Running anonymous total this FY: {formatInrExact(donation.anonymousFyRunningTotal)} against a
                  limit of {formatInrExact(donation.anonymousFyLimit)}. Above this, the excess is taxed at 30%.
                </Typography>
              </Box>
            ) : null}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>
                Utilisation position
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Three stages, not four. A donation has no committed stage — it is income the moment it lands.
              </Typography>

              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={2} alignItems="stretch">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined" sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'action.hover' }}>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 600 }}>
                          RECEIVED
                        </Typography>
                        <Typography variant="h4" sx={{ my: 1.5, fontFamily: 'serif' }}>
                          {formatInr(receivedAmount)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          cash in bank · income recognised
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined" sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'action.hover' }}>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 600 }}>
                          UTILISED
                        </Typography>
                        <Typography variant="h4" sx={{ my: 1.5, fontFamily: 'serif' }}>
                          {formatInr(utilisedAmount)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          spent against budget lines · from Tally
                        </Typography>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined" sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'action.hover' }}>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 600 }}>
                          AVAILABLE
                        </Typography>
                        <Typography variant="h4" sx={{ my: 1.5, fontFamily: 'serif', color: 'success.main' }}>
                          {formatInr(availableAmount)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          received - utilised
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <UtilisationPieChart
                    utilised={utilisedAmount}
                    available={availableAmount}
                    total={receivedAmount}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Fund treatment">
            <TermRow label="Fund mode">
              <StatusChip label={donation.fundModeLabel} tone={FUND_MODE_TONE[donation.fundMode] || 'neutral'} />
            </TermRow>
            <TermRow label="Fund class">{donation.fundClassCode ? `Class ${donation.fundClassCode}` : '—'}</TermRow>
            <TermRow label="Programme">{donation.programmeName || '— not programme-tied —'}</TermRow>
            <TermRow label="Location">{(donation.stateNames || []).join(', ') || '—'}</TermRow>
            <TermRow label="Utilisation period">{donation.utilisationPeriodType}</TermRow>
            <TermRow label="Conditional gift" last>
              {donation.isConditionalGift ? donation.conditionDescription || 'Yes' : 'No — recognised as income'}
            </TermRow>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Money & banking">
            <TermRow label="Currency">{donation.currency}</TermRow>
            <TermRow label="Amount">
              {foreign ? `${donation.currency} ${Number(donation.amount).toLocaleString('en-IN')}` : formatInr(donation.amount)}
            </TermRow>
            <TermRow label="FX rate">{foreign ? String(donation.fxRate) : `— (${donation.currency} gift)`}</TermRow>
            <TermRow label="Reporting amount (INR)">{formatInr(donation.reportingAmountInr ?? donation.amount)}</TermRow>
            <TermRow label="Bank account">{donation.bankAccountType}</TermRow>
            <TermRow label="Transaction ref">{donation.transactionRef || '—'}</TermRow>
            <TermRow label="Tally voucher ref" last>
              {donation.tallyVoucherRef || donation.tallyVoucher || '—'}
            </TermRow>
          </SectionCard>
        </Grid>

        <Grid size={12}>
          <SectionCard title="Tax & receipting">
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TermRow label="80G eligible">
                  <StatusChip label={donation.eightyGLabel} tone={EIGHTY_G_STATUS_TONE[donation.eightyGStatus] || 'neutral'} />
                </TermRow>
                <TermRow label="Receipt number">{donation.eightyGReceiptNumber || 'Not yet issued'}</TermRow>
                <TermRow label="Issued at" last>
                  {donation.eightyGIssuedAt ? formatDateTime(donation.eightyGIssuedAt) : '—'}
                </TermRow>
                {donation.eightyGStatus === 'ELIGIBLE_PENDING_ISSUE' ? (
                  <Button
                    sx={{ mt: 1 }}
                    variant="outlined"
                    size="small"
                    disabled={issueEightyG.isPending}
                    onClick={() => issueEightyG.mutate()}
                  >
                    {issueEightyG.isPending ? 'Issuing…' : 'Issue 80G receipt'}
                  </Button>
                ) : null}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TermRow label="10BD reportable">{donation.tenBdReportable ? 'Yes' : 'No'}</TermRow>
                <TermRow label="Reason" last>
                  {donation.tenBdFailureReason || '—'}
                </TermRow>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TermRow label="10BE status" last>
                  <StatusChip label={donation.tenBeLabel} tone={TEN_BE_STATUS_TONE[donation.tenBeStatus] || 'neutral'} />
                </TermRow>
                {donation.tenBdReportable && donation.tenBeStatus !== 'ISSUED' && donation.tenBeStatus !== 'NOT_APPLICABLE' ? (
                  <Button
                    sx={{ mt: 1 }}
                    variant="outlined"
                    size="small"
                    disabled={markTenBd.isPending}
                    onClick={() => markTenBd.mutate()}
                  >
                    {markTenBd.isPending ? 'Advancing…' : 'Advance 10BD/10BE filing'}
                  </Button>
                ) : null}
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        {donation.gikItems && donation.gikItems.length > 0 ? (
          <Grid size={12}>
            <SectionCard title="Gift in kind — line items">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Fair value</TableCell>
                    <TableCell>Intended use</TableCell>
                    <TableCell>Liquidation due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donation.gikItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.itemDescription}</TableCell>
                      <TableCell align="right">{formatInrExact(item.fairValue)}</TableCell>
                      <TableCell>{item.intendedUseLabel}</TableCell>
                      <TableCell>{item.liquidationDueDate ? formatDate(item.liquidationDueDate) : '—'}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={item.liquidationOverdue ? 'Overdue' : item.realisationLabel}
                          tone={item.liquidationOverdue ? 'error' : GIK_REALISATION_STATUS_TONE[item.realisationStatus] || 'neutral'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => setEditingGikItem(item)}>
                          Change use
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </Grid>
        ) : null}

        {donation.corpusDetail ? (
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Corpus detail">
              <TermRow label="Written direction ref">{donation.corpusDetail.writtenDirectionRef}</TermRow>
              <TermRow label="Direction date">{formatDate(donation.corpusDetail.directionDate)}</TermRow>
              <TermRow label="Investment mode" last>
                {donation.corpusDetail.investmentModeLabel}
              </TermRow>
            </SectionCard>
          </Grid>
        ) : null}

        {donation.recurringMandate ? (
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Recurring mandate">
              <TermRow label="Mandate ID">{donation.recurringMandate.mandateId}</TermRow>
              <TermRow label="Frequency">{donation.recurringMandate.frequencyLabel}</TermRow>
              <TermRow label="Status">
                <StatusChip
                  label={donation.recurringMandate.mandateStatusLabel}
                  tone={MANDATE_STATUS_TONE[donation.recurringMandate.mandateStatus] || 'neutral'}
                />
              </TermRow>
              <TermRow label="Next expected debit" last>
                {donation.recurringMandate.nextExpectedDebitDate ? formatDate(donation.recurringMandate.nextExpectedDebitDate) : '—'}
              </TermRow>
            </SectionCard>
          </Grid>
        ) : null}

        {donation.legacyDetail ? (
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Legacy / bequest detail">
              <TermRow label="Bequest status">{donation.legacyDetail.bequestStatusLabel}</TermRow>
              <TermRow label="Probate reference">{donation.legacyDetail.probateReference || '—'}</TermRow>
              <TermRow label="Expected value">
                {donation.legacyDetail.expectedValue != null ? formatInr(donation.legacyDetail.expectedValue) : '—'}
              </TermRow>
              <TermRow label="Estate domicile" last>
                {donation.legacyDetail.estateDomicileLabel}
              </TermRow>
            </SectionCard>
          </Grid>
        ) : null}

        {donation.payrollBatch ? (
          <Grid size={12}>
            <SectionCard title="Payroll giving batch">
              <TermRow label="Employer">{donation.payrollBatch.employer}</TermRow>
              <TermRow label="Indian → LC">{formatInr(donation.payrollBatch.indianTotal)}</TermRow>
              <TermRow label="Foreign → FC" last>
                {formatInr(donation.payrollBatch.foreignTotal)}
              </TermRow>
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Citizenship</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donation.payrollBatch.employees.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.name}</TableCell>
                      <TableCell>{e.idType ? `${e.idType} · ${e.idNumber || '—'}` : '—'}</TableCell>
                      <TableCell align="right">{formatInrExact(e.amount)}</TableCell>
                      <TableCell>{e.citizenshipLabel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </Grid>
        ) : null}
      </Grid>

      <IntendedUseDialog
        item={editingGikItem}
        donationId={Number(id)}
        open={Boolean(editingGikItem)}
        onClose={() => setEditingGikItem(null)}
      />
    </>
  );
}
