import { Box, Button, Card, Chip, Grid, Link, Stack, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { ErrorState, LoadingState, StatusChip } from '../../../shared/components/index.js';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { formatInr, formatInrExact } from '../../../lib/format/currency.js';
import { pct } from '../../credit-notes/components/CreditSummaryCard.jsx';
import { useFundProfile } from '../hooks/useFundProfiles.js';
import { FUND_CLASS_CODE_LABEL, FUND_CLASS_SHORT, MODULE_ID } from '../constants.js';

/* ---------- vocabulary ---------- */

/** Restriction classes, strictest first, in plain words. Colours are theme tokens (light + dark). */
const CLASSES = [
  { code: 'A', name: 'Fully restricted', short: 'Locked to one project & budget', fg: 'var(--err)', bg: 'var(--err-bg)' },
  { code: 'B', name: 'Flexible', short: 'Can move, with an explanation', fg: 'var(--warn)', bg: 'var(--warn-bg)' },
  { code: 'C', name: 'Free to use', short: 'Any programme or running cost', fg: 'var(--ok)', bg: 'var(--ok-bg)' },
];
const CLASS_BY_CODE = Object.fromEntries(CLASSES.map((c) => [c.code, c]));

const STEP_COLORS = ['var(--ink)', 'var(--info)', 'var(--ok)', 'var(--warn)', 'var(--err)', 'var(--muted)'];

/* ---------- helpers ---------- */

const classOf = (profile) => FUND_CLASS_SHORT[profile.fundClass] || null;

const committedOf = (profile) =>
  profile.disbursementRules.reduce((sum, rule) => sum + (Number(rule.totalAmount) || 0), 0);

function programmeLabel(profile) {
  if (!profile.programmeName) return null;
  if (profile.parentProgrammeName && profile.parentProgrammeName !== profile.programmeName) {
    return `${profile.parentProgrammeName} › ${profile.programmeName}`;
  }
  return profile.programmeName;
}

const isLumpSum = (rule) => rule.disbursementType === 'LUMP_SUM' || (rule.trancheCriteria || []).length <= 1;

/** The rule's instalments as a uniform list (a lump sum becomes one instalment). */
function instalmentsOf(rule) {
  const tranches = rule.trancheCriteria || [];
  if (isLumpSum(rule)) {
    return [
      {
        ...(tranches[0] || {}),
        amountCriteria: rule.totalAmount,
        expectedReleaseDate: rule.receivingDate || tranches[0]?.expectedReleaseDate,
        isFinalTranche: true,
      },
    ];
  }
  return tranches;
}

/** A release gate as a short chip label, e.g. "Fixed date · 29 Dec 2026". */
function criterionChip(c) {
  const label = c.releaseCriteriaLabel || c.releaseCriteria || 'Other condition';
  const detail =
    c.milestoneName ||
    (c.releaseDate && formatDate(c.releaseDate)) ||
    (c.utilisationPercentage != null && `${c.utilisationPercentage}% spent`) ||
    (c.targetDate && `by ${formatDate(c.targetDate)}`);
  return detail ? `${label} · ${detail}` : label;
}

function criterionTooltip(c) {
  return [
    c.description,
    (c.verificationSignOffRoleLabel || c.otherVerificationSignOffRole) &&
      `Signed off by ${c.verificationSignOffRoleLabel || c.otherVerificationSignOffRole}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

function movementRule(profile) {
  if (!profile.movementAllowed) {
    return { answer: 'Not allowed', detail: 'Spend exactly as budgeted', fg: 'var(--err)', bg: 'var(--err-bg)' };
  }
  if (profile.explanationRequired) {
    return { answer: 'Allowed, with a reason', detail: 'Each move needs a written reason', fg: 'var(--warn)', bg: 'var(--warn-bg)' };
  }
  return { answer: 'Allowed freely', detail: 'No approval or reason needed', fg: 'var(--ok)', bg: 'var(--ok-bg)' };
}

/** Settings that contradict each other or are missing — surfaced so someone fixes them. */
function findIssues(profile) {
  const code = classOf(profile);
  const issues = [];
  if (!code) issues.push('No restriction class is set, so it is unclear how tightly this money is controlled.');
  if (code === 'A' && profile.fundMode === 'UNRESTRICTED') {
    issues.push('Class A (fully restricted), but the fund mode is set to Unrestricted.');
  }
  if ((code === 'B' || code === 'C') && profile.fundMode === 'RESTRICTED') {
    issues.push(`Class ${code} (${CLASS_BY_CODE[code].name.toLowerCase()}), but the fund mode is set to Restricted.`);
  }
  if (code === 'A' && profile.movementAllowed) {
    issues.push('Class A money should stay on its budget lines, but moving it is allowed.');
  }
  if (code === 'B' && !profile.movementAllowed) {
    issues.push('Class B money is meant to move between budget lines, but movement is switched off.');
  }
  if (code === 'B' && profile.movementAllowed && !profile.explanationRequired) {
    issues.push('Class B moves need a written explanation, but “explanation required” is off.');
  }
  if (code === 'C' && !profile.movementAllowed) {
    issues.push('Class C money can be used freely, but moving it between budget lines is switched off.');
  }
  if (!profile.disbursementRules.length) {
    issues.push('No payment schedule, so the committed amount and dates are unknown.');
  }
  profile.disbursementRules.forEach((rule) => {
    (rule.trancheCriteria || []).forEach((tranche, index) => {
      (tranche.criteria || []).forEach((c) => {
        if (c.releaseDate && tranche.expectedReleaseDate && c.releaseDate !== tranche.expectedReleaseDate) {
          issues.push(
            `Instalment ${index + 1} is expected on ${formatDate(tranche.expectedReleaseDate)}, but its fixed release date is ${formatDate(c.releaseDate)}.`,
          );
        }
      });
    });
    if (rule.balanced === false && Number(rule.unallocatedAmount)) {
      issues.push(`${formatInr(rule.unallocatedAmount)} of the committed amount is not assigned to any instalment.`);
    }
  });
  return issues;
}

/* ---------- small building blocks ---------- */

function Overline({ children, sx }) {
  return (
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        fontSize: 10.5,
        fontWeight: 600,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

function Pill({ fg, bg, children, icon: Icon }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.1,
        py: 0.35,
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        color: fg,
        bgcolor: bg,
        whiteSpace: 'nowrap',
      }}
    >
      {Icon ? <Icon sx={{ fontSize: 15 }} /> : null}
      {children}
    </Box>
  );
}

/* ---------- hero ---------- */

/** Slim A | B | C segmented scale with this profile's class highlighted. */
function RestrictionScale({ code }) {
  const active = code ? CLASS_BY_CODE[code] : null;
  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 1, lg: 2 }} sx={{ alignItems: { lg: 'center' } }}>
      <Overline sx={{ flexShrink: 0, width: { lg: 150 } }}>How restricted?</Overline>
      <Stack
        direction="row"
        sx={{
          flex: 1,
          maxWidth: 620,
          p: '3px',
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {CLASSES.map((c) => {
          const isActive = c.code === code;
          return (
            <Tooltip key={c.code} title={FUND_CLASS_CODE_LABEL[c.code]}>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 0.6,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: isActive ? c.bg : 'transparent',
                  boxShadow: isActive ? `inset 0 0 0 1.5px ${c.fg}` : 'none',
                  color: isActive ? c.fg : 'text.secondary',
                  cursor: 'help',
                }}
              >
                {isActive ? <CheckCircleOutlineIcon sx={{ fontSize: 15 }} /> : null}
                <Typography sx={{ fontSize: 13, fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap', color: 'inherit' }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    {c.code}
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {' '}
                    · {c.name}
                  </Box>
                </Typography>
              </Stack>
            </Tooltip>
          );
        })}
      </Stack>
      <Typography variant="body2" sx={{ color: active ? 'text.primary' : 'var(--warn)', minWidth: 0 }}>
        {active ? active.short : 'No class chosen yet'}
      </Typography>
    </Stack>
  );
}

function Hero({ profile, issues, onEdit }) {
  const code = classOf(profile);
  const cls = code ? CLASS_BY_CODE[code] : null;
  const committed = committedOf(profile);
  const rule = profile.disbursementRules[0];
  const instalments = rule ? instalmentsOf(rule) : [];
  const dates = instalments.map((t) => t.expectedReleaseDate).filter(Boolean).sort();
  const stripPx = { xs: 2, md: 3 };

  return (
    <Card sx={{ mb: 4, overflow: 'hidden' }}>
      {/* identity + money */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ px: stripPx, py: 2.5, justifyContent: 'space-between', alignItems: { md: 'center' } }}
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
          <Stack direction="row" spacing={1.25} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.25 }}>
            <Typography
              component="h1"
              sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}
            >
              {profile.profileCode}
            </Typography>
            {cls ? (
              <Pill fg={cls.fg} bg={cls.bg}>
                Class {code} · {cls.name}
              </Pill>
            ) : (
              <Pill fg="var(--warn)" bg="var(--warn-bg)">
                Class not set
              </Pill>
            )}
            {profile.assignedGrantCode ? (
              <Pill fg="var(--info)" bg="var(--info-bg)" icon={LinkIcon}>
                {profile.assignedGrantCode}
              </Pill>
            ) : (
              <Pill fg="var(--ok)" bg="var(--ok-bg)" icon={CheckCircleOutlineIcon}>
                Available for a grant
              </Pill>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {profile.purpose || 'No purpose recorded'}
            {profile.reportingFrequencyLabel ? (
              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                {' '}
                · {profile.reportingFrequencyLabel} reports to donor
              </Box>
            ) : null}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Box sx={{ textAlign: { md: 'right' } }}>
            <Overline>Committed</Overline>
            <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {rule ? formatInrExact(committed) : '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {!rule
                ? 'No payment schedule yet'
                : instalments.length === 1
                  ? `One payment${dates[0] ? ` · ${formatDate(dates[0])}` : ''}`
                  : `${instalments.length} instalments${
                      dates.length ? ` · ${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}` : ''
                    }`}
            </Typography>
          </Box>
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEdit} sx={{ whiteSpace: 'nowrap' }}>
              Edit
            </Button>
          </PermissionGate>
        </Stack>
      </Stack>

      {/* restriction scale */}
      <Box sx={{ px: stripPx, py: 1.5, bgcolor: 'var(--card2)', borderTop: '1px solid', borderColor: 'divider' }}>
        <RestrictionScale code={code} />
      </Box>

      {/* things to check */}
      {issues.length ? (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ px: stripPx, py: 1.25, bgcolor: 'var(--warn-bg)', borderTop: '1px solid', borderColor: 'divider', alignItems: 'flex-start' }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 18, color: 'var(--warn)', mt: '2px' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {issues.length === 1 ? '1 thing to check' : `${issues.length} things to check`}
            </Typography>
            {issues.map((issue) => (
              <Typography key={issue} variant="body2" sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.55 }}>
                • {issue}
              </Typography>
            ))}
          </Box>
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button size="small" onClick={onEdit} sx={{ color: 'var(--warn)', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Fix these →
            </Button>
          </PermissionGate>
        </Stack>
      ) : null}
    </Card>
  );
}

/* ---------- payment schedule ---------- */

/** Thin bar split by instalment share — the visual summary of the rows below it. */
function SplitBar({ instalments }) {
  if (instalments.length < 2) return null;
  return (
    <Stack direction="row" sx={{ height: 6, borderRadius: 3, overflow: 'hidden', gap: '2px', mb: 1 }}>
      {instalments.map((t, index) => (
        <Tooltip key={t.id ?? index} title={`Instalment ${index + 1}: ${formatInrExact(t.amountCriteria)}`}>
          <Box sx={{ flexGrow: Number(t.amountCriteria) || 0, flexBasis: 0, bgcolor: STEP_COLORS[index % STEP_COLORS.length] }} />
        </Tooltip>
      ))}
    </Stack>
  );
}

/** One instalment as a single compact row: # · date · amount (share) · condition · final. */
function InstalmentRow({ index, count, instalment, total }) {
  const color = STEP_COLORS[index % STEP_COLORS.length];
  const criteria = instalment.criteria || [];
  const share = pct(Number(instalment.amountCriteria) || 0, Number(total) || 0);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '28px 1fr auto', md: '28px 130px 170px 1fr auto' },
        alignItems: 'center',
        columnGap: 2,
        rowGap: 0.75,
        py: 1.5,
        borderTop: index === 0 ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: color,
          color: 'var(--paper)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {index + 1}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14.5, whiteSpace: 'nowrap' }}>
          {instalment.expectedReleaseDate ? formatDate(instalment.expectedReleaseDate) : 'Date not set'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { md: 'none' } }}>
          {count > 1 ? `${share}% of total` : 'Full amount'}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: 'baseline', justifyContent: { xs: 'flex-end', md: 'flex-start' } }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {formatInrExact(instalment.amountCriteria)}
        </Typography>
        {count > 1 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'inline' } }}>
            {share}%
          </Typography>
        ) : null}
      </Stack>

      <Stack
        direction="row"
        spacing={0.75}
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'center', gridColumn: { xs: '2 / -1', md: 'auto' } }}
      >
        <Typography variant="caption" color="text.secondary">
          Released when
        </Typography>
        {criteria.length ? (
          criteria.map((c, i) => (
            <Tooltip key={c.id ?? i} title={criterionTooltip(c)}>
              <Chip size="small" variant="outlined" label={criterionChip(c)} />
            </Tooltip>
          ))
        ) : (
          <Typography variant="caption" color="text.disabled">
            no condition recorded
          </Typography>
        )}
      </Stack>

      <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 44, textAlign: 'right' }}>
        {instalment.isFinalTranche && count > 1 ? <Pill fg="var(--muted)" bg="var(--card2)">Final</Pill> : null}
      </Box>
    </Box>
  );
}

function PaymentSchedule({ profile }) {
  const rule = profile.disbursementRules[0];
  const instalments = rule ? instalmentsOf(rule) : [];
  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1.25, gap: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontSize: 18 }}>
          Payment schedule
        </Typography>
        {rule ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
            <Box component="strong" sx={{ color: 'text.primary' }}>
              {formatInrExact(rule.totalAmount)}
            </Box>{' '}
            {instalments.length === 1 ? 'in one payment' : `in ${instalments.length} instalments`}
          </Typography>
        ) : null}
      </Stack>
      <Card sx={{ px: { xs: 2, md: 2.5 }, pt: instalments.length > 1 ? 2 : 0.5, pb: 0.5 }}>
        {rule ? (
          <>
            <SplitBar instalments={instalments} />
            {instalments.map((instalment, index) => (
              <InstalmentRow
                key={instalment.id ?? index}
                index={index}
                count={instalments.length}
                instalment={instalment}
                total={rule.totalAmount}
              />
            ))}
          </>
        ) : (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            No payment schedule has been added yet.
          </Typography>
        )}
      </Card>
    </Box>
  );
}

/* ---------- spending rules ---------- */

/** One rule as a compact row: icon · question · answer · short note. */
function RuleRow({ icon: Icon, label, note, children, first = false }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '28px 1fr', md: '28px 190px 1fr', lg: '28px 190px 1fr auto' },
        alignItems: 'center',
        columnGap: 2,
        rowGap: 0.25,
        py: 1.5,
        borderTop: first ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1.25,
          bgcolor: 'var(--card2)',
          display: 'grid',
          placeItems: 'center',
          gridRow: { xs: 'span 2', md: 'auto' },
        }}
      >
        <Icon sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ minWidth: 0, gridColumn: { xs: '2', md: 'auto' } }}>
        {children}
        {note ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', lg: 'none' }, mt: 0.25 }}>
            {note}
          </Typography>
        ) : null}
      </Box>
      {/* Wide screens: the note sits in its own right-hand column instead of under the answer. */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'right', whiteSpace: 'nowrap' }}
      >
        {note || ''}
      </Typography>
    </Box>
  );
}

const answerSx = { fontWeight: 600, fontSize: 14.5 };

function SpendingRules({ profile }) {
  const programme = programmeLabel(profile);
  const movement = movementRule(profile);
  const committed = committedOf(profile);
  const limits = profile.utilisationRules;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1.25, gap: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontSize: 18 }}>
          Spending rules
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
          What, where and how freely
        </Typography>
      </Stack>

      <Card sx={{ px: { xs: 2, md: 2.5 }, py: 0.5 }}>
        <RuleRow
          first
          icon={CategoryOutlinedIcon}
          label="Programme"
          note={programme ? 'No other programme may use it' : 'Not tied to a programme'}
        >
          <Typography sx={answerSx}>{programme || 'Any programme'}</Typography>
        </RuleRow>

        <RuleRow
          icon={PlaceOutlinedIcon}
          label="Location"
          note={profile.geographies.length ? 'Only in these states' : 'No state restriction'}
        >
          {profile.geographies.length ? (
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {profile.geographies.map((geo) => (
                <Chip key={geo.id ?? geo.stateId} size="small" label={geo.stateName} />
              ))}
            </Stack>
          ) : (
            <Typography sx={answerSx}>Anywhere</Typography>
          )}
        </RuleRow>

        <RuleRow icon={SwapHorizOutlinedIcon} label="Moving between budget lines" note={movement.detail}>
          <Pill fg={movement.fg} bg={movement.bg}>
            {movement.answer}
          </Pill>
        </RuleRow>

        <RuleRow
          icon={PieChartOutlineOutlinedIcon}
          label="Spending limits"
          note={limits.length ? 'Share of the fund a cost type may use' : null}
        >
          {limits.length ? (
            <Stack spacing={1}>
              {limits.map((rule, index) => {
                const limit = rule.limitPercentage != null ? Number(rule.limitPercentage) : null;
                const name = rule.otherRuleType || rule.ruleTypeLabel || rule.ruleType;
                return (
                  <Tooltip key={rule.id ?? index} title={rule.description || ''}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
                      <Typography sx={{ ...answerSx, whiteSpace: 'nowrap' }}>{name}</Typography>
                      {limit != null ? (
                        <>
                          <Box
                            sx={{
                              width: 90,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'var(--card2)',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <Box sx={{ height: '100%', width: `${Math.min(limit, 100)}%`, bgcolor: 'var(--warn)' }} />
                          </Box>
                          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                            up to <strong>{limit}%</strong>
                            {committed ? (
                              <Box component="span" sx={{ color: 'text.secondary' }}>
                                {' '}
                                · {formatInrExact((committed * limit) / 100)}
                              </Box>
                            ) : null}
                          </Typography>
                        </>
                      ) : null}
                    </Stack>
                  </Tooltip>
                );
              })}
            </Stack>
          ) : (
            <Typography sx={answerSx}>No limits</Typography>
          )}
        </RuleRow>
      </Card>
    </Box>
  );
}

/* ---------- page ---------- */

/** Read-only view of one fund profile — /fund-profiles/:id. */
export function FundProfileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useFundProfile(id);

  if (query.isPending) return <LoadingState label="Loading fund profile…" />;
  if (query.isError) {
    return <ErrorState error={query.error} onRetry={query.refetch} />;
  }

  const profile = query.data;
  const issues = findIssues(profile);
  const edit = () => navigate(`/fund-profiles/${profile.id}/edit`);

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2, color: 'text.secondary' }}
        onClick={() => navigate('/fund-profiles')}
      >
        All fund profiles
      </Button>

      <Hero profile={profile} issues={issues} onEdit={edit} />

      <PaymentSchedule profile={profile} />
      <SpendingRules profile={profile} />

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
        Onboarding {profile.onboardingComplete ? 'complete' : 'not complete'} · Created{' '}
        {formatDateTime(profile.createdAt)} · Last updated {formatDateTime(profile.updatedAt)}
      </Typography>
    </>
  );
}
