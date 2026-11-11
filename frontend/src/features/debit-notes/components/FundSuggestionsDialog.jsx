import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import TuneIcon from '@mui/icons-material/Tune';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { LoadingState } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { FUND_CLASS_LABEL } from '../../donor-management/mappers/fundProfileMapper.js';
import { MONEY_SX } from '../../credit-notes/components/NoteLayout.jsx';
import { useFundSuggestions } from '../hooks/useFundSuggestions.js';
import { useFundSuggestionWeights } from '../hooks/useFundSuggestionWeights.js';
import { describeWeights, maxScore } from '../lib/fundSuggestionWeights.js';

const money = (v) => (v < 0 ? `−${formatInrExact(-v)}` : formatInrExact(v));

/** "Covers the full amount (+25)" → { text, points: 25 }; points null when the line carries none. */
function splitPoints(line) {
  const m = /^(.*) \(([+-]?\d+)\)$/.exec(line);
  return m ? { text: m[1], points: Number(m[2]) } : { text: line, points: null };
}

/** The server's reasons are sentences — show a two- or three-word label, keep the sentence for the tooltip. */
const SHORT_LABELS = [
  ['Same programme', 'Same programme'],
  ['Covers the full amount', 'Covers amount'],
  ['Restricted for this programme', 'Restricted for programme'],
  ['Backed by grant', 'Has grant'],
  ['Used on this budget line', 'Used on this line'],
  ['Unrestricted fund', 'Unrestricted'],
  ['No grant agreement', 'No grant'],
  ['Grant approval is still pending', 'Approval pending'],
];
const shortLabel = (text) => SHORT_LABELS.find(([prefix]) => text.startsWith(prefix))?.[1] ?? text;

/** Pros (earned points or neutral facts), cons (lost points) and cautions (no points, worth knowing). */
function explain(s) {
  const reasons = s.reasons.map(splitPoints);
  const warnings = s.warnings.map(splitPoints);
  const tag = ({ text, points }) => ({ label: shortLabel(text), full: points != null ? `${text} (${points > 0 ? '+' : ''}${points})` : text, points });
  return {
    pros: reasons.map(tag),
    cons: warnings.filter((w) => w.points != null).map(tag),
    cautions: warnings.filter((w) => w.points == null).map(tag),
  };
}

/** Score as a ring, on the same scale for every fund so they compare at a glance. */
function ScoreRing({ score, max, size = 56 }) {
  const stroke = size >= 56 ? 6 : 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.max(0, Math.min(1, score / max)) : 0;
  const color = score < 0 ? 'var(--err)' : pct >= 0.6 ? 'var(--ok)' : pct >= 0.3 ? 'var(--ink)' : 'var(--warn)';
  return (
    <Tooltip title={`Score ${score} of ${max}`}>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray .4s ease' }}
          />
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <Typography sx={{ ...MONEY_SX, fontWeight: 800, fontSize: size >= 56 ? 18 : 13, color, lineHeight: 1 }}>{score}</Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}

/** A short pill — ✓ for points earned, − for points lost, ⚠ for a caution. Hover for the full reason. */
function Tag({ tag, kind }) {
  const styles = {
    pro: { icon: <CheckRoundedIcon sx={{ fontSize: 14 }} />, color: 'var(--ok)', bg: 'var(--ok-bg)' },
    con: { icon: <RemoveRoundedIcon sx={{ fontSize: 14 }} />, color: 'var(--err)', bg: 'var(--err-bg)' },
    caution: { icon: <WarningAmberRoundedIcon sx={{ fontSize: 14 }} />, color: 'var(--warn)', bg: 'var(--warn-bg)' },
  }[kind];
  const neutral = kind === 'pro' && tag.points == null;
  return (
    <Tooltip title={tag.full}>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.4,
          px: 0.9,
          py: 0.2,
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          color: neutral ? 'text.secondary' : styles.color,
          bgcolor: neutral ? 'var(--card2)' : styles.bg,
        }}
      >
        {neutral ? null : styles.icon}
        {tag.label}
      </Box>
    </Tooltip>
  );
}

function Tags({ s, limit }) {
  const { pros, cons, cautions } = explain(s);
  const earned = pros.filter((t) => t.points != null);
  const facts = pros.filter((t) => t.points == null);
  const all = [
    ...earned.map((t) => ({ t, kind: 'pro' })),
    ...cons.map((t) => ({ t, kind: 'con' })),
    ...cautions.map((t) => ({ t, kind: 'caution' })),
    ...facts.map((t) => ({ t, kind: 'pro' })),
  ];
  const shown = limit ? all.slice(0, limit) : all;
  return (
    <Stack direction="row" spacing={0.6} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {shown.map(({ t, kind }) => (
        <Tag key={t.full} tag={t} kind={kind} />
      ))}
      {shown.length < all.length ? (
        <Tooltip title={all.slice(shown.length).map(({ t }) => t.full).join(' · ')}>
          <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', px: 0.5, cursor: 'help' }}>
            +{all.length - shown.length} more
          </Box>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

const fundLine = (s) =>
  [s.fundProfileName, s.grantCode ? `${s.grantCode}${s.grantEndDate ? ` · ends ${formatDate(s.grantEndDate)}` : ''}` : null, s.fundClass ? (FUND_CLASS_LABEL[s.fundClass] || s.fundClass).split(' · ')[0] : null]
    .filter(Boolean)
    .join(' · ');

/** The best fund — large, green-accented, with its own Use button. */
function TopPick({ s, max, hasAmount, onUse }) {
  const short = s.coversAmount === false;
  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1.5px solid var(--ok)',
        bgcolor: 'background.paper',
        boxShadow: '0 6px 20px rgba(30, 107, 74, 0.12)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 0.75, bgcolor: 'var(--ok)', color: 'var(--card)' }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Best match</Typography>
        </Stack>
        <Typography sx={{ ...MONEY_SX, fontSize: 12, fontWeight: 700 }}>
          Score {s.score} of {max}
        </Typography>
      </Stack>

      <Box
        sx={{
          p: 2,
          display: 'grid',
          columnGap: 2,
          rowGap: 1.25,
          alignItems: 'center',
          gridTemplateColumns: { xs: 'auto 1fr', sm: 'auto minmax(0, 1fr) auto' },
        }}
      >
        <Box sx={{ gridRow: { sm: '1 / span 2' } }}>
          <ScoreRing score={s.score} max={max} size={64} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.25 }}>{s.donorName}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {fundLine(s)}
          </Typography>
        </Box>
        <Box sx={{ gridColumn: { xs: '1 / -1', sm: '2' }, gridRow: { sm: '2' } }}>
          <Tags s={s} limit={4} />
        </Box>
        <Box
          sx={{
            gridColumn: { xs: '1 / -1', sm: '3' },
            gridRow: { sm: '1 / span 2' },
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-end' },
            justifyContent: 'space-between',
            gap: 1.25,
          }}
        >
          <Box sx={{ textAlign: { sm: 'right' } }}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>
              {hasAmount ? 'Left after this debit' : 'Available'}
            </Typography>
            <Typography sx={{ ...MONEY_SX, fontWeight: 800, fontSize: 22, lineHeight: 1.2, color: hasAmount ? (short ? 'var(--err)' : 'var(--ok)') : 'text.primary' }}>
              {money(hasAmount ? s.availableAfter : s.available)}
            </Typography>
            {hasAmount ? (
              <Typography sx={{ ...MONEY_SX, fontSize: 12, color: 'text.secondary' }}>of {money(s.available)} available</Typography>
            ) : null}
          </Box>
          <Button onClick={onUse} variant="contained" disableElevation startIcon={<CheckRoundedIcon />} sx={{ whiteSpace: 'nowrap', fontWeight: 800, px: 2.5 }}>
            Use this fund
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/** Any other fund — one row, same columns as its neighbours, its own Use button. */
function OptionRow({ s, max, hasAmount, onUse }) {
  const short = s.coversAmount === false;
  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'center',
        columnGap: 1.5,
        rowGap: 0.75,
        gridTemplateColumns: { xs: 'auto minmax(0, 1fr) auto', md: 'auto minmax(0, 1fr) 120px auto' },
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'border-color .12s ease, box-shadow .12s ease',
        '&:hover': { borderColor: 'text.secondary', boxShadow: 'var(--shadow)' },
      }}
    >
      <ScoreRing score={s.score} max={max} size={40} />
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 14.5 }}>
          {s.donorName}
        </Typography>
        <Typography noWrap variant="caption" color="text.secondary" component="div">
          {fundLine(s)}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', gridColumn: { xs: '2', md: 'auto' }, gridRow: { xs: '2', md: 'auto' }, justifySelf: { xs: 'start', md: 'end' } }}>
        <Typography sx={{ ...MONEY_SX, fontWeight: 700, fontSize: 14, color: hasAmount ? (short ? 'var(--err)' : 'var(--ok)') : 'text.primary' }}>
          {money(hasAmount ? s.availableAfter : s.available)}
        </Typography>
        <Typography sx={{ ...MONEY_SX, fontSize: 11, color: 'text.secondary' }}>
          {hasAmount ? `left of ${money(s.available)}` : 'available'}
        </Typography>
      </Box>
      <Button size="small" variant="outlined" onClick={onUse} sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
        Use
      </Button>
      <Box sx={{ gridColumn: { xs: '1 / -1', md: '2 / -1' } }}>
        <Tags s={s} limit={3} />
      </Box>
    </Box>
  );
}

/**
 * Top 10 funds (donor → fund profile → grant) a debit note on this outflow row
 * could be charged to: the best match up top, the rest below on the same score
 * scale. Nothing is filled in until the user clicks Use; Cancel leaves the form
 * as it was.
 */
export function FundSuggestionsDialog({ open, onClose, onSelect, line, amount, date, book }) {
  const query = useFundSuggestions({ outflowLineId: line?.id, amount, date, book }, { enabled: open });
  const weightsQuery = useFundSuggestionWeights();
  const weights = weightsQuery.data?.weights;
  const max = weights ? maxScore(weights) : 100;
  const suggestions = query.data || [];
  const [best, ...others] = suggestions;
  const hasAmount = amount > 0;

  const use = (s) => {
    onSelect(s);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="fund-suggestions-title"
      slotProps={{ paper: { sx: { borderRadius: 3, m: { xs: 1.5, sm: 4 }, width: { xs: 'calc(100% - 24px)', sm: undefined } } } }}
    >
      <DialogTitle id="fund-suggestions-title" sx={{ pr: 6, pt: 2, pb: 1.5 }}>
        <Typography sx={{ fontFamily: (t) => t.typography.h2.fontFamily, fontSize: 19, fontWeight: 800 }}>Which fund pays for this?</Typography>
        <Typography variant="body2" color="text.secondary" sx={MONEY_SX}>
          {line ? `${line.line} · ${line.lineCode} Q${line.quarter}` : ''}
          {hasAmount ? ` · ${formatInrExact(amount)}` : ''} · {book}
        </Typography>
        <IconButton aria-label="Close" size="small" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 1.5, sm: 3 }, pt: '4px !important', pb: 2 }}>
        {query.isPending ? (
          <LoadingState label="Finding funds…" />
        ) : query.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            {query.error?.message || 'Could not load fund suggestions.'}
          </Alert>
        ) : !best ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 2, borderRadius: 3, bgcolor: 'var(--card2)' }}>
            <Typography sx={{ fontWeight: 800 }}>No fund has money for this line</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mt: 0.5 }}>
              Charge the note without a fund, or check receipts in Credit Notes.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {!hasAmount ? (
              <Alert severity="info" variant="outlined">
                Enter the amount on the form to see which funds can cover it.
              </Alert>
            ) : null}
            <TopPick s={best} max={max} hasAmount={hasAmount} onUse={() => use(best)} />
            {others.length ? (
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
                  Other options · {others.length}
                </Typography>
                <Stack spacing={1}>
                  {others.map((s) => (
                    <OptionRow key={s.fundProfileId} s={s} max={max} hasAmount={hasAmount} onUse={() => use(s)} />
                  ))}
                </Stack>
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                This is the only {book} fund with money for this line.
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title={weights ? `Score: ${describeWeights(weights)}` : ''} placement="top-start">
          <Link
            component={RouterLink}
            to="/masters?tab=fund-suggestion"
            target="_blank"
            rel="noopener"
            variant="caption"
            sx={{ mr: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}
          >
            <TuneIcon sx={{ fontSize: 15 }} />
            How scores work
          </Link>
        </Tooltip>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
