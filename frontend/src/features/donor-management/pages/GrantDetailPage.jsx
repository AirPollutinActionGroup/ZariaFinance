import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import {
  ConfirmDialog,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useGrant, useGrantLifecycle } from '../hooks/useGrants.js';
import { useFundProfile } from '../hooks/useFundProfiles.js';
import { useDonor } from '../hooks/useDonors.js';
import { useTransactions } from '../../new-transaction/hooks/useTransactions.js';
import { useFinancialYears } from '../../financial-year/hooks/useFinancialYears.js';
import { grantService } from '../services/grantService.js';
import { FUND_CLASS_CODE_TONE, GRANT_ACTIVE_TONE, MODULE_ID } from '../constants.js';
import { deriveDisbursementType, deriveReleaseCriteria } from '../lib/disbursement.js';

const ACTION_COPY = {
  approve: {
    label: 'Approve',
    title: 'Approve grant',
    description: 'Approve this grant agreement? Approval is recorded in the audit trail.',
    color: 'primary',
  },
  activate: {
    label: 'Activate',
    title: 'Activate grant',
    description: 'Activate this grant? Committed funds become part of the live position.',
    color: 'primary',
  },
  close: {
    label: 'Close',
    title: 'Close grant',
    description: 'Close this grant agreement? No further transactions can reference it.',
    color: 'error',
  },
  hold: {
    label: 'Put on hold',
    title: 'Put grant on hold',
    description: 'Put this grant agreement on hold? It stays active but is flagged for review.',
    color: 'warning',
  },
  resume: {
    label: 'Resume',
    title: 'Resume grant',
    description: 'Resume this grant agreement from hold and return it to approved status?',
    color: 'primary',
  },
  complete: {
    label: 'Mark completed',
    title: 'Mark grant completed',
    description: 'Mark this grant agreement as completed? This reflects the grant has run its course.',
    color: 'primary',
  },
};

/** Label/value row in the "register" style of the approved design. */
function TermRow({ label, children, last = false }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 1.75,
        alignItems: 'center',
        borderBottom: last ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          width: { xs: 140, sm: 190 },
          flexShrink: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'text.secondary',
        }}
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

function SectionCard({ title, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

/** Committed amount, per the signed agreement (no receipt tracking). */
function FundingPosition({ grant }) {
  const committedInr = Number(grant.totalGrantAmount) || 0;

  return (
    <Stack spacing={0.5}>
      <Typography variant="h3" sx={{ fontWeight: 700 }}>
        {formatInr(committedInr)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Committed — contracted / signed
      </Typography>
    </Stack>
  );
}

/**
 * Box 4 — disbursement model inherited live from the fund profile. Per the spec
 * this shows the disbursement type and, for tranche-based grants, the release
 * criteria as a list (implicit AND) rather than the old flat Type/Trigger/Gate.
 */
function DisbursementRule({ rule }) {
  if (!rule) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No disbursement rule defined on the inherited fund profile.
      </Typography>
    );
  }

  const disbursementType = deriveDisbursementType(rule);
  const isTranched = disbursementType === 'Tranches';
  const criteria = deriveReleaseCriteria(rule);
  const tranches = rule.trancheCriteria || [];

  return (
    <>
      <TermRow label="Disbursement type">
        <StatusChip label={disbursementType} tone={isTranched ? 'info' : 'neutral'} />
      </TermRow>

      {isTranched && tranches.length ? (
        <Box sx={{ pt: 2 }}>
          <Typography
            variant="caption"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}
          >
            Tranche schedule
          </Typography>
          <Table size="small" sx={{ mt: 1, '& td, & th': { borderColor: 'divider' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 0 }}>#</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Expected date</TableCell>
                <TableCell>Frequency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tranches.map((t, i) => (
                <TableRow key={t.id ?? i}>
                  <TableCell sx={{ pl: 0, border: i === tranches.length - 1 ? 0 : undefined }}>
                    {i + 1}
                    {t.isFinalTranche ? ' (final)' : ''}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, whiteSpace: 'nowrap', border: i === tranches.length - 1 ? 0 : undefined }}
                  >
                    {formatInr(t.amountCriteria)}
                  </TableCell>
                  <TableCell sx={{ border: i === tranches.length - 1 ? 0 : undefined }}>
                    {formatDate(t.expectedReleaseDate)}
                  </TableCell>
                  <TableCell sx={{ border: i === tranches.length - 1 ? 0 : undefined }}>
                    {t.frequencyLabel || t.frequency || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : null}

      <Box sx={{ pt: 2 }}>
        <Typography
          variant="caption"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}
        >
          Release criteria — all must be met
        </Typography>
        <Stack spacing={1} sx={{ mt: 1.25 }}>
          {criteria.map((c, i) => (
            <Stack key={`${c.label}-${i}`} direction="row" spacing={1.25} sx={{ alignItems: 'baseline' }}>
              <Box
                component="span"
                sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'var(--info)', mt: 0.75, flexShrink: 0 }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {c.label}
                </Typography>
                {c.detail ? (
                  <Typography variant="caption" color="text.secondary">
                    {c.detail}
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          ))}
        </Stack>
        {rule.ruleDescription ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            {rule.ruleDescription}
          </Typography>
        ) : null}
      </Box>
    </>
  );
}

/** Expected / received / spent totals for this grant's transactions. */
function TransactionSummary({ expectedAmount, receivedAmount, spentAmount }) {
  const stats = [
    { label: 'Expected amount', value: expectedAmount, color: 'text.primary' },
    { label: 'Received amount', value: receivedAmount, color: 'success.main' },
    { label: 'Spent amount', value: spentAmount, color: 'error.main' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {stats.map((s) => (
        <Grid key={s.label} size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--card2)' }}>
            <Typography variant="caption" color="text.secondary">
              {s.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>
              {formatInr(s.value)}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

/** Transactions recorded against this grant agreement, via the Payment Window form. */
function GrantTransactions({ transactions, isLoading, error, onRetry, navigate, expectedAmount }) {
  const [typeFilter, setTypeFilter] = useState('All');
  // null = user hasn't touched the FY filter yet, so it defaults to the
  // financial year marked current; 'All'/an id means the user picked it.
  const [fyFilter, setFyFilter] = useState(null);

  const financialYearsQuery = useFinancialYears();
  const financialYears = financialYearsQuery.data || [];
  const currentFy = financialYears.find((fy) => fy.current) || null;
  const effectiveFyFilter = fyFilter ?? (currentFy ? String(currentFy.id) : 'All');
  const selectedFy = financialYears.find((fy) => String(fy.id) === effectiveFyFilter) || null;

  const receivedAmount = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const spentAmount = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    const matchesFy = !selectedFy || (t.date >= selectedFy.startDate && t.date <= selectedFy.endDate);
    return matchesType && matchesFy;
  });

  const columns = [
    {
      key: 'id',
      header: 'Transaction ID',
      width: 140,
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {r.id}
        </Typography>
      ),
    },
    { key: 'date', header: 'Date', width: 110, render: (r) => formatDate(r.date) },
    {
      key: 'type',
      header: 'Type',
      width: 110,
      render: (r) => (
        <StatusChip
          label={r.type === 'DEBIT' ? 'Debit (Out)' : 'Credit (In)'}
          tone={r.type === 'DEBIT' ? 'error' : 'success'}
        />
      ),
    },
    { key: 'partyName', header: 'Payee / Donor', width: 200, render: (r) => r.partyName },
    { key: 'paymentModeLabel', header: 'Payment mode', width: 140, render: (r) => r.paymentModeLabel },
    { key: 'reference', header: 'Reference', width: 160, render: (r) => r.reference || '—' },
    {
      key: 'amount',
      header: 'Amount',
      width: 130,
      align: 'right',
      render: (r) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: r.type === 'DEBIT' ? 'error.main' : 'success.main' }}
        >
          {r.type === 'DEBIT' ? '−' : '+'}
          {formatInr(r.amount)}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <TransactionSummary
        expectedAmount={expectedAmount}
        receivedAmount={receivedAmount}
        spentAmount={spentAmount}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Select
          size="small"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 150, borderRadius: 2 }}
        >
          <MenuItem value="All">All Types</MenuItem>
          <MenuItem value="DEBIT">Debit (Out)</MenuItem>
          <MenuItem value="CREDIT">Credit (In)</MenuItem>
        </Select>

        <Select
          size="small"
          value={effectiveFyFilter}
          onChange={(e) => setFyFilter(e.target.value)}
          sx={{ minWidth: 170, borderRadius: 2 }}
        >
          <MenuItem value="All">All Financial Years</MenuItem>
          {financialYears.map((fy) => (
            <MenuItem key={fy.id} value={String(fy.id)}>
              {fy.code}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <DataTable
        columns={columns}
        rows={filteredTransactions}
        getRowKey={(r) => r.id}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        onRowClick={(r) => navigate(`/new-transaction/${r.id}`)}
        emptyTitle="No transactions recorded against this grant yet"
      />
    </>
  );
}

/** Single grant view — /grants/:id. Layout mirrors the approved detail design. */
export function GrantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const grantQuery = useGrant(id);
  const lifecycle = useGrantLifecycle(id);
  const [pendingAction, setPendingAction] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const grant = grantQuery.data;
  const profileQuery = useFundProfile(grant?.fundProfileId);
  const donorQuery = useDonor(grant?.donorId);
  const transactionsQuery = useTransactions();

  if (grantQuery.isPending) return <LoadingState label="Loading grant…" />;
  if (grantQuery.isError) return <ErrorState error={grantQuery.error} onRetry={grantQuery.refetch} />;

  const profile = profileQuery.data;
  const donor = donorQuery.data;
  const rule = profile?.disbursementRules?.[0];
  const actions = grantService.availableActions(grant.isApproved, grant.isActive);
  const grantTransactions = (transactionsQuery.data || []).filter((t) => t.grantId === grant.id);

  const runLifecycle = async () => {
    // approvedBy is a user id (no session id available yet — BACKEND_GAPS.md #1 —
    // so it's left unset here rather than sending the session's display name).
    const payload =
      pendingAction === 'approve' || pendingAction === 'hold'
        ? { remarks: approvalRemarks.trim() || undefined }
        : undefined;
    await lifecycle.mutateAsync({ action: pendingAction, payload });
    setPendingAction(null);
    setApprovalRemarks('');
  };

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2, color: 'text.secondary' }}
        onClick={() => navigate('/grants')}
      >
        Grant Agreements
      </Button>

      <PageHeader
        title={grant.grantCode}
        subtitle={grant.agreementName}
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <StatusChip
              label={grant.statusLabel}
              tone={GRANT_ACTIVE_TONE[grant.isActive] || 'neutral'}
            />
            <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/grants/${grant.id}/edit`)}
                >
                  Edit
                </Button>
              </Stack>
            </PermissionGate>
            <PermissionGate action={ACTIONS.APPROVE} moduleId={MODULE_ID}>
              <Stack direction="row" spacing={1.5}>
                {actions.map((action) => (
                  <Button
                    key={action}
                    variant={action === 'close' ? 'outlined' : 'contained'}
                    color={ACTION_COPY[action].color}
                    onClick={() => setPendingAction(action)}
                  >
                    {ACTION_COPY[action].label}
                  </Button>
                ))}
              </Stack>
            </PermissionGate>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Agreement terms">
            <TermRow label="Donor">
              {grant.donorId ? (
                <Link component={RouterLink} to={`/donors/${grant.donorId}`} underline="hover">
                  {grant.donorName}
                </Link>
              ) : (
                grant.donorName || '—'
              )}
            </TermRow>
            <TermRow label="Book">
              {donor ? (donor.fundSourceDomicile === 'FOREIGN' ? 'FC · Foreign contribution' : 'LC · Local contribution') : '—'}
            </TermRow>
            <TermRow label="Fund profile">
              {profile
                ? [profile.fundClassLabel, profile.fundModeLabel, profile.purpose]
                    .filter(Boolean)
                    .join(' · ')
                : grant.fundClassCode
                  ? `Class ${grant.fundClassCode}`
                  : '—'}
            </TermRow>
            <TermRow label="Agreement date">{formatDate(grant.agreementDate)}</TermRow>
            <TermRow label="Period">
              {`${formatDate(grant.startDate)} → ${formatDate(grant.endDate)}`}
            </TermRow>
            <TermRow label="Total grant amount">{formatInr(grant.totalGrantAmount)}</TermRow>
            <TermRow label="Approved by">
              {grant.isApproved === 1 && (grant.approvedByName || grant.approvedBy)
                ? grant.approvedByName || grant.approvedBy
                : '—'}
            </TermRow>
            {grant.isApproved === 1 && grant.approvalDate ? (
              <TermRow label="Approval date">{formatDateTime(grant.approvalDate)}</TermRow>
            ) : null}
            {grant.isApproved === 1 && grant.approvalRemarks ? (
              <TermRow label="Approval remarks">{grant.approvalRemarks}</TermRow>
            ) : null}
            <TermRow label="Status" last>
              <StatusChip
                label={grant.statusLabel}
                tone={GRANT_ACTIVE_TONE[grant.isActive] || 'neutral'}
              />
            </TermRow>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Funding position">
            <FundingPosition grant={grant} />
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Inherited fund profile">
            {profileQuery.isPending && grant.fundProfileId ? (
              <LoadingState label="Loading fund profile…" />
            ) : profile ? (
              <>
                <TermRow label="Fund class">
                  <StatusChip
                    label={profile.fundClassLabel}
                    tone={FUND_CLASS_CODE_TONE[profile.fundClassCode] || 'neutral'}
                  />
                </TermRow>
                <TermRow label="Fund mode">{profile.fundModeLabel}</TermRow>
                <TermRow label="FCRA">
                  {donor ? (donor.fcraApplicable ? 'Applicable' : 'Not applicable') : '—'}
                </TermRow>
                <TermRow label="Programme / Project">
                  {profile.programmeType === 'Project'
                    ? `${profile.parentProgrammeName || '—'} / ${profile.programmeName || '—'}`
                    : profile.programmeName || '—'}
                </TermRow>
                <TermRow label="Purpose">{profile.purpose || '—'}</TermRow>
                <TermRow label="Overhead cap">
                  {profile.overheadLimitPercent != null ? `${Number(profile.overheadLimitPercent)}%` : '—'}
                </TermRow>
                <TermRow label="Reporting frequency" last>
                  {profile.reportingFrequency || '—'}
                </TermRow>
              </>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No fund profile linked to this grant.
              </Typography>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Disbursement rule">
            {profileQuery.isPending && grant.fundProfileId ? (
              <LoadingState label="Loading disbursement rule…" />
            ) : (
              <DisbursementRule rule={rule} />
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard title="Transactions">
            <GrantTransactions
              transactions={grantTransactions}
              isLoading={transactionsQuery.isPending}
              error={transactionsQuery.isError ? transactionsQuery.error : null}
              onRetry={transactionsQuery.refetch}
              navigate={navigate}
              expectedAmount={grant.totalGrantAmount}
            />
          </SectionCard>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? ACTION_COPY[pendingAction].title : ''}
        description={pendingAction ? ACTION_COPY[pendingAction].description : ''}
        confirmLabel={pendingAction ? ACTION_COPY[pendingAction].label : ''}
        confirmColor={pendingAction ? ACTION_COPY[pendingAction].color : 'primary'}
        busy={lifecycle.isPending}
        onConfirm={runLifecycle}
        onClose={() => {
          setPendingAction(null);
          setApprovalRemarks('');
        }}
      >
        {pendingAction === 'approve' || pendingAction === 'hold' ? (
          <TextField
            label="Remarks (optional)"
            value={approvalRemarks}
            onChange={(e) => setApprovalRemarks(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            sx={{ mt: 2 }}
          />
        ) : null}
      </ConfirmDialog>
    </>
  );
}
