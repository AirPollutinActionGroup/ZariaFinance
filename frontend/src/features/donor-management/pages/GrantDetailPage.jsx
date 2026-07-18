import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
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
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import {
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useGrant, useGrantLifecycle } from '../hooks/useGrants.js';
import { useFundProfile } from '../hooks/useFundProfiles.js';
import { useDonor } from '../hooks/useDonors.js';
import { useTranchesByGrant } from '../hooks/useTranches.js';
import { grantService } from '../services/grantService.js';
import { FUND_CLASS_CODE_TONE, GRANT_STATUS_TONE, MODULE_ID } from '../constants.js';
import { DocumentsPanel } from '../components/DocumentsPanel.jsx';
import { TranchesPanel } from '../components/TranchesPanel.jsx';

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
};

/** Statuses at or past approval — used to decide whether "Approved by" is meaningful. */
const POST_APPROVAL = ['APPROVED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CLOSED'];

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

/** Committed / Received / Utilised / Available table driven by live tranche data. */
function FundingPosition({ grant, tranches }) {
  const fx = grant.grantCurrency && grant.grantCurrency !== 'INR' ? Number(grant.fxLockedRate || 1) : 1;
  const committedInr = Number(grant.reportingAmountInr ?? grant.totalGrantAmount) || 0;
  const received = tranches.filter((t) => t.actualAmount != null);
  const receivedInr = received.reduce((sum, t) => sum + Number(t.actualAmount || 0), 0) * fx;
  const utilisedInr = Number(grant.utilisedAmount || 0);
  const availableInr = receivedInr - utilisedInr;
  const utilisedPct = committedInr > 0 ? Math.round((utilisedInr / committedInr) * 100) : 0;

  const rows = [
    {
      stage: 'Committed',
      amount: committedInr,
      basis: 'contracted / signed (receivable)',
    },
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
          <TableCell sx={{ pl: 0, py: 2, fontWeight: 700, border: 0 }}>
            Available (realised)
          </TableCell>
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
  );
}

/** First disbursement rule of the inherited fund profile + live gate check. */
function DisbursementRule({ rule, grant, tranches }) {
  if (!rule) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No disbursement rule defined on the inherited fund profile.
      </Typography>
    );
  }

  const gate = rule.minPriorUtilisationRequired != null ? Number(rule.minPriorUtilisationRequired) : null;
  const gateLabel =
    gate != null
      ? `≥${gate}% prior-tranche utilisation${rule.milestoneRequired ? ' + milestone / UC' : ''}`
      : rule.milestoneRequired
        ? 'milestone / UC'
        : '—';

  // Gate check — utilisation against funds received so far.
  const fx = grant.grantCurrency && grant.grantCurrency !== 'INR' ? Number(grant.fxLockedRate || 1) : 1;
  const receivedInr =
    tranches
      .filter((t) => t.actualAmount != null)
      .reduce((sum, t) => sum + Number(t.actualAmount || 0), 0) * fx;
  const utilisedInr = Number(grant.utilisedAmount || 0);
  const utilisedPct = receivedInr > 0 ? Math.round((utilisedInr / receivedInr) * 100) : 0;
  const gateMet = gate != null && utilisedPct >= gate;

  return (
    <>
      <TermRow label="Type">{rule.ruleType || '—'}</TermRow>
      <TermRow label="Trigger">{rule.releaseTrigger || '—'}</TermRow>
      <TermRow label="Gate" last={gate == null}>
        {gateLabel}
      </TermRow>
      {gate != null ? (
        <Box sx={{ pt: 2.5 }}>
          <Typography
            variant="caption"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}
          >
            Gate check — utilisation of received funds
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, utilisedPct)}
            color={gateMet ? 'success' : 'primary'}
            sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
            <Typography variant="body2">
              <Box component="span" sx={{ fontWeight: 700, color: gateMet ? 'var(--ok)' : 'var(--warn)' }}>
                {utilisedPct}%
              </Box>{' '}
              utilised
            </Typography>
            <Typography variant="body2" color="text.secondary">
              gate {gate}%
            </Typography>
          </Stack>
          {rule.ruleDescription ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              {rule.ruleDescription}
            </Typography>
          ) : null}
        </Box>
      ) : null}
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

  const grant = grantQuery.data;
  const tranchesQuery = useTranchesByGrant(grant ? Number(id) : null);
  const profileQuery = useFundProfile(grant?.fundProfileId);
  const donorQuery = useDonor(grant?.donorId);

  if (grantQuery.isPending) return <LoadingState label="Loading grant…" />;
  if (grantQuery.isError) return <ErrorState error={grantQuery.error} onRetry={grantQuery.refetch} />;

  const tranches = tranchesQuery.data || [];
  const profile = profileQuery.data;
  const donor = donorQuery.data;
  const actions = grantService.availableActions(grant.grantStatus);
  const foreign = grant.grantCurrency && grant.grantCurrency !== 'INR';
  // FX-locked rate is only meaningful for foreign-sourced funding. A domestic
  // donor's grant is in INR, so the rate is shown as N/A (issue #21, item 12).
  const domesticSource = (donor?.fundSourceDomicile || '').toLowerCase() === 'domestic';

  const runLifecycle = async () => {
    await lifecycle.mutateAsync(pendingAction);
    setPendingAction(null);
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
              tone={GRANT_STATUS_TONE[grant.grantStatus] || 'neutral'}
            />
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
            <TermRow label="Programme">{grant.programmeName || 'Untied'}</TermRow>
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
              {POST_APPROVAL.includes(grant.grantStatus) && grant.updatedBy ? grant.updatedBy : '—'}
            </TermRow>
            <TermRow label="Status" last>
              <StatusChip
                label={grant.statusLabel}
                tone={GRANT_STATUS_TONE[grant.grantStatus] || 'neutral'}
              />
            </TermRow>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Funding position">
            <FundingPosition grant={grant} tranches={tranches} />
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
              <DisbursementRule
                rule={profile?.disbursementRules?.[0]}
                grant={grant}
                tranches={tranches}
              />
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
        onClose={() => setPendingAction(null)}
      />
    </>
  );
}
