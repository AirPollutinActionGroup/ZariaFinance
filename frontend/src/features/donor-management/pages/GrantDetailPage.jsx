import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  LinearProgress,
  Link,
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
import { useTranchesByGrant } from '../hooks/useTranches.js';
import { grantService } from '../services/grantService.js';
import { FUND_CLASS_CODE_TONE, GRANT_ACTIVE_TONE, MODULE_ID } from '../constants.js';
import { DocumentsPanel } from '../components/DocumentsPanel.jsx';
import { TranchesPanel } from '../components/TranchesPanel.jsx';
import { FundingDonut } from '../components/FundingDonut.jsx';
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

/** Per-tranche Committed → Received → Utilised → Available strip (Advanced view). */
function TrancheCycle({ tranche, currency }) {
  const committed = Number(tranche.trancheAmount) || 0;
  const received = Number(tranche.actualAmount) || 0;
  const utilised = Number(tranche.utilisedAmount) || 0;
  const available = received - utilised;
  const utilisedPct = received > 0 ? Math.min(100, Math.round((utilised / received) * 100)) : 0;
  const money = (n) => (currency && currency !== 'INR' ? `${currency} ` : '₹') + Number(n).toLocaleString('en-IN');

  return (
    <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Tranche {tranche.trancheNumber}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          committed {money(committed)} · received {money(received)}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={utilisedPct}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          utilised {money(utilised)} ({utilisedPct}%)
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--ok)', fontWeight: 600 }}>
          available {money(available)}
        </Typography>
      </Stack>
    </Box>
  );
}

/** Committed / Received / Utilised / Available driven by live tranche data. */
function FundingPosition({ grant, tranches, rule }) {
  const [advanced, setAdvanced] = useState(false);
  const fx = grant.grantCurrency && grant.grantCurrency !== 'INR' ? Number(grant.fxLockedRate || 1) : 1;
  const committedInr = Number(grant.reportingAmountInr ?? grant.totalGrantAmount) || 0;
  const received = tranches.filter((t) => t.actualAmount != null);
  const receivedInr = received.reduce((sum, t) => sum + Number(t.actualAmount || 0), 0) * fx;
  const utilisedInr = Number(grant.utilisedAmount || 0);
  const availableInr = receivedInr - utilisedInr;
  const utilisedPct = committedInr > 0 ? Math.round((utilisedInr / committedInr) * 100) : 0;

  // Per-tranche breakdown is only meaningful for tranche-based disbursement
  // (spec §3): a lump-sum grant has a single release, so hide the toggle.
  const isTranched = deriveDisbursementType(rule, tranches) === 'Tranches' && tranches.length > 0;

  const rows = [
    { stage: 'Committed', amount: committedInr, basis: 'contracted / signed (receivable)' },
    {
      stage: 'Received',
      amount: receivedInr,
      basis: tranches.length
        ? `${received.length} of ${tranches.length} tranches recognised`
        : 'no tranches scheduled yet',
    },
    {
      stage: 'Utilised',
      amount: utilisedInr,
      basis: `${utilisedPct}% of committed · spent against budget lines`,
    },
  ];

  return (
    <Stack spacing={2}>
      <FundingDonut committed={committedInr} received={receivedInr} utilised={utilisedInr} />

      <Table size="small" sx={{ '& td, & th': { borderColor: 'divider' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ pl: 0 }}>Stage</TableCell>
            <TableCell align="right">Amount (INR)</TableCell>
            <TableCell>Basis</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.stage}>
              <TableCell sx={{ pl: 0, py: 2 }}>{row.stage}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {formatInr(row.amount)}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{row.basis}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ pl: 0, py: 2, fontWeight: 700, border: 0 }}>Available (realised)</TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'var(--ok)', border: 0 }}
            >
              {formatInr(availableInr)}
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', border: 0 }}>
              received − utilised · spendable now
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {isTranched ? (
        <Box>
          <Button size="small" onClick={() => setAdvanced((v) => !v)} sx={{ px: 0 }}>
            {advanced ? 'Hide per-tranche breakdown' : 'Advanced — per-tranche breakdown'}
          </Button>
          <Collapse in={advanced} unmountOnExit>
            <Box sx={{ mt: 1 }}>
              {tranches.map((t) => (
                <TrancheCycle key={t.id} tranche={t} currency={grant.grantCurrency} />
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Per-tranche amounts are in the grant currency. Received & utilised originate from Tally.
              </Typography>
            </Box>
          </Collapse>
        </Box>
      ) : null}
    </Stack>
  );
}

/**
 * Box 4 — disbursement model inherited live from the fund profile. Per the spec
 * this shows the disbursement type and, for tranche-based grants, the release
 * criteria as a list (implicit AND) rather than the old flat Type/Trigger/Gate.
 */
function DisbursementRule({ rule, tranches }) {
  if (!rule) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No disbursement rule defined on the inherited fund profile.
      </Typography>
    );
  }

  const disbursementType = deriveDisbursementType(rule, tranches);
  const isTranched = disbursementType === 'Tranches';
  const criteria = deriveReleaseCriteria(rule);
  const firstDate = tranches.find((t) => t.plannedReleaseDate)?.plannedReleaseDate;

  return (
    <>
      <TermRow label="Disbursement type">
        <StatusChip label={disbursementType} tone={isTranched ? 'info' : 'neutral'} />
      </TermRow>
      {isTranched ? (
        <TermRow label="Schedule">{`${tranches.length || 0} tranche${tranches.length === 1 ? '' : 's'}`}</TermRow>
      ) : (
        <TermRow label="Receiving date">{formatDate(firstDate)}</TermRow>
      )}

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

/** Single grant view — /grants/:id. Layout mirrors the approved detail design. */
export function GrantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const grantQuery = useGrant(id);
  const lifecycle = useGrantLifecycle(id);
  const [pendingAction, setPendingAction] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const grant = grantQuery.data;
  const tranchesQuery = useTranchesByGrant(grant ? Number(id) : null);
  const profileQuery = useFundProfile(grant?.fundProfileId);
  const donorQuery = useDonor(grant?.donorId);

  if (grantQuery.isPending) return <LoadingState label="Loading grant…" />;
  if (grantQuery.isError) return <ErrorState error={grantQuery.error} onRetry={grantQuery.refetch} />;

  const tranches = tranchesQuery.data || [];
  const profile = profileQuery.data;
  const donor = donorQuery.data;
  const rule = profile?.disbursementRules?.[0];
  const actions = grantService.availableActions(grant.isApproved, grant.isActive);
  const foreign = grant.grantCurrency && grant.grantCurrency !== 'INR';
  // FX-locked rate is only meaningful for foreign-sourced funding. A domestic
  // donor's grant is in INR, so the rate is shown as N/A (issue #21, item 12).
  const domesticSource = (donor?.fundSourceDomicile || '').toLowerCase() === 'domestic';

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
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/grants/${grant.id}/edit`)}
              >
                Edit
              </Button>
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
            <TermRow label="Fund profile">
              {profile
                ? [profile.fundClassLabel, profile.fundModeLabel, profile.purpose]
                    .filter(Boolean)
                    .join(' · ')
                : grant.fundClassCode
                  ? `Class ${grant.fundClassCode}`
                  : '—'}
            </TermRow>
            <TermRow label="Programme">{grant.programmeName || 'Untied'}</TermRow>
            <TermRow label="Agreement date">{formatDate(grant.agreementDate)}</TermRow>
            <TermRow label="Period">
              {`${formatDate(grant.startDate)} → ${formatDate(grant.endDate)}`}
            </TermRow>
            <TermRow label="Currency (CCY)">{grant.grantCurrency || 'INR'}</TermRow>
            <TermRow label="FX-locked rate (at signing)">
              {domesticSource
                ? 'N/A'
                : foreign
                  ? String(grant.fxLockedRate ?? '—')
                  : '— (INR grant)'}
            </TermRow>
            <TermRow label="Total grant amount">
              {foreign
                ? `${grant.grantCurrency} ${Number(grant.totalGrantAmount).toLocaleString('en-IN')}`
                : formatInr(grant.totalGrantAmount)}
            </TermRow>
            <TermRow label="Reporting amount (INR)">
              {formatInr(grant.reportingAmountInr ?? grant.totalGrantAmount)}
            </TermRow>
            <TermRow label="Approved by">
              {grant.isApproved === 1 && grant.approvedBy ? grant.approvedBy : '—'}
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
            <FundingPosition grant={grant} tranches={tranches} rule={rule} />
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
              <DisbursementRule rule={rule} tranches={tranches} />
            )}
          </SectionCard>
        </Grid>

        <Grid size={12}>
          <TranchesPanel grantId={Number(id)} grantCurrency={grant.grantCurrency} />
        </Grid>

        <Grid size={12}>
          <DocumentsPanel grantId={Number(id)} />
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
