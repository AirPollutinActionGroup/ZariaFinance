import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { MONEY_SX } from '../../credit-notes/components/NoteLayout.jsx';
import { useDebitNoteSuggestions } from '../hooks/useDebitNotes.js';

const scoreColor = (score) => (score >= 70 ? 'success' : score >= 40 ? 'primary' : 'warning');

/** One suggested fund — the whole card is the radio target. */
function SuggestionCard({ suggestion: s, selected, onSelect, amount }) {
  return (
    <Box
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        display: 'flex',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        cursor: 'pointer',
        outline: 'none',
        '&:hover': { borderColor: 'primary.light' },
        '&:focus-visible': { boxShadow: (t) => `0 0 0 2px ${t.palette.primary.main}` },
      }}
    >
      <Radio checked={selected} tabIndex={-1} size="small" sx={{ p: 0.5, alignSelf: 'flex-start' }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            #{s.rank}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {s.donorName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
            · {s.fundProfileName}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.75 }}>
          {s.grant ? (
            <Chip size="small" variant="outlined" label={`${s.grant.grantCode}${s.grant.endDate ? ` · ends ${formatDate(s.grant.endDate)}` : ''}`} />
          ) : null}
          {s.fundClassLabel ? <Chip size="small" variant="outlined" label={s.fundClassLabel} /> : null}
          {s.programmeName ? <Chip size="small" variant="outlined" label={s.programmeName} /> : null}
        </Stack>

        {s.reasons.length ? (
          <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
            {s.reasons.map((r) => (
              <Chip key={r} size="small" color="success" variant="outlined" icon={<CheckIcon />} label={r} />
            ))}
          </Stack>
        ) : null}
        {s.warnings.map((w) => (
          <Typography key={w} variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
            <WarningAmberIcon sx={{ fontSize: 16 }} /> {w}
          </Typography>
        ))}
      </Box>

      <Box sx={{ width: 150, flexShrink: 0, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Available
        </Typography>
        <Typography variant="body2" sx={{ ...MONEY_SX, fontWeight: 700 }}>
          {formatInrExact(s.available)}
        </Typography>
        {amount ? (
          <Typography variant="caption" sx={{ ...MONEY_SX, display: 'block', color: s.availableAfter < 0 ? 'error.main' : 'text.secondary' }}>
            after: {formatInrExact(s.availableAfter)}
          </Typography>
        ) : null}
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={s.score} color={scoreColor(s.score)} sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="caption" color="text.secondary">
            {s.score}% match
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Suggests the donor fund to charge a debit note to — the top 10 for the
 * chosen outflow line, ranked by the server. Nothing is filled in until the
 * user picks one and presses Select; Cancel leaves the form as it was.
 */
export function FundSuggestionDialog({ open, onClose, onSelect, line, amount, date, book, currentFundId }) {
  const query = useDebitNoteSuggestions({ outflowLineId: line?.id, amount, date, book }, { enabled: open });
  const data = query.data;
  const [picked, setPicked] = useState(null);
  // Default to the fund already on the form, if it's among the suggestions.
  const selectedId = picked ?? (data?.suggestions.some((s) => s.fundProfileId === currentFundId) ? currentFundId : null);
  const selected = data?.suggestions.find((s) => s.fundProfileId === selectedId) || null;

  const close = () => {
    setPicked(null);
    onClose();
  };
  const confirm = () => {
    if (!selected) return;
    setPicked(null);
    onSelect(selected);
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="md" fullWidth scroll="paper" aria-labelledby="fund-suggestion-title">
      <DialogTitle id="fund-suggestion-title" sx={{ pb: 1 }}>
        Suggested funds
        {line ? (
          <Typography variant="body2" color="text.secondary">
            {line.budgetCode} · {line.lineCode} · Q{line.quarter} — {line.line} · {book}
            {amount > 0 ? ` · ${formatInrExact(amount)}` : ' · enter an amount to check which funds cover it'}
          </Typography>
        ) : null}
      </DialogTitle>

      <DialogContent dividers>
        {query.isPending ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Ranking donor funds…
            </Typography>
          </Stack>
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
        ) : (
          <Stack spacing={1.5} role="radiogroup" aria-label="Suggested funds">
            {data.suggestions.length === 0 ? (
              <Alert severity="info">
                No donor fund can pay this line right now — the debit can still be issued without a fund (paid from general funds).
              </Alert>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Best match first — same programme, enough balance, restricted money for this programme and grants about to lapse rank higher. Pick
                the one to charge, or Cancel to choose yourself.
              </Typography>
            )}

            {data.suggestions.map((s) => (
              <SuggestionCard
                key={s.fundProfileId}
                suggestion={s}
                amount={data.amount}
                selected={s.fundProfileId === selectedId}
                onSelect={() => setPicked(s.fundProfileId)}
              />
            ))}

            {data.excluded.length ? (
              <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" color="text.secondary">
                    {data.excluded.length} fund{data.excluded.length === 1 ? '' : 's'} not suggested — why?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Stack spacing={0.75}>
                    {data.excluded.map((e) => (
                      <Box key={e.fundProfileId} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {e.donorName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          · {e.fundProfileName} — {e.reason}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ) : null}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={close} color="inherit">
          Cancel
        </Button>
        <Button onClick={confirm} variant="contained" disabled={!selected}>
          Select fund
        </Button>
      </DialogActions>
    </Dialog>
  );
}
