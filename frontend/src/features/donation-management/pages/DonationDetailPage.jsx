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

/** Single donation view — /donations/:id. A donation has no committed stage: it is income the moment it lands. */
export function DonationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const donationQuery = useDonation(id);
  const issueEightyG = useIssueEightyGReceipt(id);
  const markTenBd = useMarkTenBdFiling(id);
  const [editingGikItem, setEditingGikItem] = useState(null);

  if (donationQuery.isPending) return <LoadingState label="Loading donation…" />;
  if (donationQuery.isError) return <ErrorState error={donationQuery.error} onRetry={donationQuery.refetch} />;

  const donation = donationQuery.data;
  const foreign = donation.currency && donation.currency !== 'INR';

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
            <StatusChip label={donation.bookLabel} tone={BOOK_TONE[donation.book] || 'neutral'} />
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
            <TermRow label="Book">
              <StatusChip label={donation.bookLabel} tone={BOOK_TONE[donation.book] || 'neutral'} />
            </TermRow>
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
                donation.donorName
              )}
            </TermRow>
            {donation.donorId ? (
              <>
                <TermRow label="ID">{donation.donorPanCardNumber ? `PAN · ${donation.donorPanCardNumber}` : 'No identifier on file'}</TermRow>
                <TermRow label="Address" last>
                  {donation.donorAddress || '—'}
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
            <TermRow label="Transaction ref" last>
              {donation.transactionRef || '—'}
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
