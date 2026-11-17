import { useState } from 'react';
import { Box, Button, Card, Link, Stack, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { ConfirmDialog, ErrorState, LoadingState, StatusChip } from '../../../shared/components/index.js';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { useGrantLifecycle } from '../../donor-management/hooks/useGrants.js';
import { useDonor } from '../../donor-management/hooks/useDonors.js';
import { grantService } from '../../donor-management/services/grantService.js';
import { FUND_CLASS_CODE_LABEL, FUND_CLASS_CODE_TONE } from '../../donor-management/constants.js';
import {
  PaymentSchedule,
  SpendingRules,
  findIssues,
} from '../../donor-management/pages/FundProfileDetailPage.jsx';
import {
  ACTION_COPY,
  GrantTransactions,
  MoneyStrip,
  SectionCard,
  TermRow,
} from '../../donor-management/pages/GrantDetailPage.jsx';
import { useFundingMoney, useFundingRecord } from '../hooks/useFunding.js';
import { LifecycleTracker } from '../components/LifecycleTracker.jsx';
import { STAGE_BY_KEY, classLetter, profileCommitted, stageOf } from '../lib/fundingRecords.js';
import { CLASS_NAME, MODULE_ID } from '../constants.js';

/** Header: who, what, which stage — plus every action available on the record. */
function FundingHeader({ profile, grant, stage, onAction }) {
  const navigate = useNavigate();
  const code = classLetter(profile, grant);
  const stageInfo = STAGE_BY_KEY[stage];
  const actions = grant ? grantService.availableActions(grant.isApproved, grant.isActive) : [];
  const committed = grant ? grant.totalGrantAmount : profileCommitted(profile);

  return (
    <Card sx={{ mb: 2, overflow: 'hidden' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 2, justifyContent: 'space-between', alignItems: { md: 'flex-start' } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Link
            component={RouterLink}
            to={`/donors/${profile.donorId}`}
            underline="hover"
            sx={{ color: 'secondary.main', fontWeight: 600, fontSize: 13 }}
          >
            {profile.donorName}
          </Link>
          <Typography component="h1" sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25, mt: 0.25 }}>
            {grant?.agreementName || profile.purpose || profile.profileCode}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
            <StatusChip label={stageInfo.label} tone={stageInfo.tone} />
            {code ? (
              <Tooltip title={FUND_CLASS_CODE_LABEL[code]}>
                <span>
                  <StatusChip label={`Class ${code} · ${CLASS_NAME[code]}`} tone={FUND_CLASS_CODE_TONE[code]} />
                </span>
              </Tooltip>
            ) : (
              <StatusChip label="Class not set" tone="warning" />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {profile.profileCode}
              {grant ? ` · ${grant.grantCode}` : ''}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ textAlign: { md: 'right' }, flexShrink: 0 }}>
          <Typography
            sx={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}
          >
            Committed
          </Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
            {committed ? formatInrExact(committed) : '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {grant ? `${formatDate(grant.startDate)} → ${formatDate(grant.endDate)}` : 'From the payment schedule'}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ px: { xs: 2, md: 3 }, py: 1.75, bgcolor: 'var(--card2)', borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}
        >
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 640 }}>
            <LifecycleTracker stage={stage} profile={profile} grant={grant} />
          </Box>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { lg: 'flex-end' } }}>
            <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/funding/${profile.id}/edit`)}
              >
                Edit
              </Button>
              {grant ? null : (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/funding/${profile.id}/edit?step=agreement`)}
                >
                  Record agreement
                </Button>
              )}
            </PermissionGate>
            <PermissionGate action={ACTIONS.APPROVE} moduleId={MODULE_ID}>
              {actions.map((action) => (
                <Button
                  key={action}
                  size="small"
                  variant={action === 'close' ? 'outlined' : 'contained'}
                  color={ACTION_COPY[action].color}
                  onClick={() => onAction(action)}
                >
                  {ACTION_COPY[action].label}
                </Button>
              ))}
            </PermissionGate>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

/** Shown in place of the money strip until an agreement exists. */
function NoAgreementCallout({ profileId }) {
  const navigate = useNavigate();
  return (
    <Card
      sx={{
        mb: 2,
        px: { xs: 2, md: 3 },
        py: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
        borderStyle: 'dashed',
      }}
    >
      <DescriptionOutlinedIcon sx={{ color: 'var(--info)' }} />
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          No grant agreement yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The terms are in place. Record the signed agreement to start approval and track money received and spent.
        </Typography>
      </Box>
      <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/funding/${profileId}/edit?step=agreement`)}>
          Record agreement
        </Button>
      </PermissionGate>
    </Card>
  );
}

function IssuesBanner({ issues, profileId }) {
  const navigate = useNavigate();
  if (!issues.length) return null;
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ mb: 2, px: 2, py: 1.25, borderRadius: 2, bgcolor: 'var(--warn-bg)', alignItems: 'flex-start' }}
    >
      <WarningAmberRoundedIcon sx={{ fontSize: 18, color: 'var(--warn)', mt: '2px' }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {issues.length === 1 ? '1 thing to check in the terms' : `${issues.length} things to check in the terms`}
        </Typography>
        {issues.map((issue) => (
          <Typography key={issue} variant="body2" sx={{ fontSize: 13, color: 'text.secondary' }}>
            • {issue}
          </Typography>
        ))}
      </Box>
      <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
        <Button
          size="small"
          onClick={() => navigate(`/funding/${profileId}/edit`)}
          sx={{ color: 'var(--warn)', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          Fix →
        </Button>
      </PermissionGate>
    </Stack>
  );
}

/** Overview tab: the agreement and the terms side by side. */
function OverviewTab({ profile, grant, donor }) {
  const approved = grant?.isApproved === 1;
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
      <SectionCard title="Agreement">
        {grant ? (
          <>
            <TermRow label="Grant code">
              <Box component="span" sx={{ fontFamily: 'monospace' }}>{grant.grantCode}</Box>
            </TermRow>
            <TermRow label="Agreement date">{formatDate(grant.agreementDate)}</TermRow>
            <TermRow label="Period">{`${formatDate(grant.startDate)} → ${formatDate(grant.endDate)}`}</TermRow>
            <TermRow label="Book">
              {donor ? (donor.fundSourceDomicile === 'FOREIGN' ? 'FC · Foreign contribution' : 'LC · Local contribution') : '—'}
            </TermRow>
            <TermRow label="FCRA">{donor ? (donor.fcraApplicable ? 'Applicable' : 'Not applicable') : '—'}</TermRow>
            <TermRow label="Approved by">
              {approved && (grant.approvedByName || grant.approvedBy) ? grant.approvedByName || grant.approvedBy : 'Not approved yet'}
            </TermRow>
            {approved && grant.approvalDate ? (
              <TermRow label="Approved on">{formatDateTime(grant.approvalDate)}</TermRow>
            ) : null}
            {grant.approvalRemarks ? <TermRow label="Remarks">{grant.approvalRemarks}</TermRow> : null}
            <TermRow label="Notes" last>{grant.description || '—'}</TermRow>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            Dates, approval and the signed document appear here once the agreement is recorded.
          </Typography>
        )}
      </SectionCard>

      <SectionCard title="Terms">
        <TermRow label="Fund mode">{profile.fundModeLabel}</TermRow>
        <TermRow label="Class">{profile.fundClassLabel}</TermRow>
        <TermRow label="Programme">
          {profile.programmeName
            ? profile.parentProgrammeName && profile.parentProgrammeName !== profile.programmeName
              ? `${profile.parentProgrammeName} › ${profile.programmeName}`
              : profile.programmeName
            : 'Not tied to a programme'}
        </TermRow>
        <TermRow label="Purpose">{profile.purpose || '—'}</TermRow>
        <TermRow label="Reporting">{profile.reportingFrequencyLabel || profile.reportingFrequency || '—'}</TermRow>
        <TermRow label="Overhead cap">
          {profile.overheadLimitPercent != null ? `${Number(profile.overheadLimitPercent)}%` : '—'}
        </TermRow>
        <TermRow label="Onboarding" last>
          {profile.onboardingComplete ? 'Complete' : 'Not complete'}
        </TermRow>
      </SectionCard>
    </Box>
  );
}

/** One funding record — /funding/:id (id = fund profile id). */
export function FundingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, grant, profileQuery, grantQuery } = useFundingRecord(id);
  const donorQuery = useDonor(profile?.donorId);
  const money = useFundingMoney(grant, profile);
  const lifecycle = useGrantLifecycle(grant?.id);
  const [tab, setTab] = useState('overview');
  const [pendingAction, setPendingAction] = useState(null);
  const [remarks, setRemarks] = useState('');

  if (profileQuery.isPending || grantQuery.isPending) return <LoadingState label="Loading funding…" />;
  if (profileQuery.isError) return <ErrorState error={profileQuery.error} onRetry={profileQuery.refetch} />;
  if (grantQuery.isError) return <ErrorState error={grantQuery.error} onRetry={grantQuery.refetch} />;

  const stage = stageOf(grant);
  const issues = findIssues(profile);

  const closeDialog = () => {
    setPendingAction(null);
    setRemarks('');
  };
  const runLifecycle = async () => {
    const payload =
      pendingAction === 'approve' || pendingAction === 'hold' ? { remarks: remarks.trim() || undefined } : undefined;
    await lifecycle.mutateAsync({ action: pendingAction, payload });
    closeDialog();
  };

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'rules', label: 'Schedule & rules' },
    ...(grant ? [{ value: 'transactions', label: `Transactions${money.transactions.length ? ` · ${money.transactions.length}` : ''}` }] : []),
  ];
  const activeTab = tabs.some((t) => t.value === tab) ? tab : 'overview';

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 1.5, color: 'text.secondary' }}
        onClick={() => navigate('/funding')}
      >
        Funding Agreements
      </Button>

      <FundingHeader profile={profile} grant={grant} stage={stage} onAction={setPendingAction} />

      {grant ? (
        <Box sx={{ mb: 2 }}>
          <MoneyStrip committed={grant.totalGrantAmount} received={money.received} spent={money.spent} />
        </Box>
      ) : (
        <NoAgreementCallout profileId={profile.id} />
      )}

      <IssuesBanner issues={issues} profileId={profile.id} />

      <Tabs
        value={activeTab}
        onChange={(_e, value) => setTab(value)}
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider', minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600 } }}
      >
        {tabs.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {activeTab === 'overview' ? <OverviewTab profile={profile} grant={grant} donor={donorQuery.data} /> : null}
      {activeTab === 'rules' ? (
        <>
          <PaymentSchedule profile={profile} />
          <SpendingRules profile={profile} />
        </>
      ) : null}
      {activeTab === 'transactions' && grant ? (
        <GrantTransactions
          transactions={money.transactions}
          isLoading={money.isLoading}
          error={money.error}
          onRetry={money.retry}
          navigate={navigate}
        />
      ) : null}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
        Terms created {formatDateTime(profile.createdAt)} · last updated {formatDateTime(profile.updatedAt)}
      </Typography>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? ACTION_COPY[pendingAction].title : ''}
        description={pendingAction ? ACTION_COPY[pendingAction].description : ''}
        confirmLabel={pendingAction ? ACTION_COPY[pendingAction].label : ''}
        confirmColor={pendingAction ? ACTION_COPY[pendingAction].color : 'primary'}
        busy={lifecycle.isPending}
        onConfirm={runLifecycle}
        onClose={closeDialog}
      >
        {pendingAction === 'approve' || pendingAction === 'hold' ? (
          <TextField
            label="Remarks (optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
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
