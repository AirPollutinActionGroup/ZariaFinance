import { useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { formatInrExact } from '../../../lib/format/currency.js';
import { MONEY_SX } from '../../credit-notes/components/NoteLayout.jsx';
import { useFundSuggestions } from '../hooks/useFundSuggestions.js';

/** Wait for typing to settle before re-ranking on a new amount. */
function useSettled(value, ms = 500) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return settled;
}

const shell = (highlight) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 1.5,
  px: 2,
  py: 1.25,
  borderRadius: 2,
  border: '1px solid',
  borderColor: highlight ? 'primary.main' : 'divider',
  bgcolor: highlight ? 'action.hover' : 'var(--card2)',
});

/**
 * Top of the Fund & Grant section: as soon as a line is picked, shows the
 * best-scoring fund with "Use this fund" and "See all" (the dialog). Nothing
 * is filled in until the user chooses; once a fund is picked it shrinks to a
 * single "See suggestions" link.
 */
export function FundSuggestionBanner({ line, amount, date, book, fundPicked, onUse, onSeeAll }) {
  const settledAmount = useSettled(amount);
  const query = useFundSuggestions({ outflowLineId: line?.id, amount: settledAmount, date, book }, { enabled: Boolean(line) && !fundPicked });
  const suggestions = query.data || [];
  const best = suggestions[0];

  if (!line) {
    return (
      <Typography variant="caption" color="text.secondary">
        Select an outflow line above to get fund suggestions.
      </Typography>
    );
  }

  if (fundPicked) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Want to compare with other funds?
        </Typography>
        <Button size="small" startIcon={<AutoAwesomeOutlinedIcon />} onClick={onSeeAll}>
          See suggestions
        </Button>
      </Stack>
    );
  }

  if (query.isPending) {
    return (
      <Box sx={shell(false)}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Finding the best fund for this line…
        </Typography>
      </Box>
    );
  }

  if (query.isError || !best) {
    return (
      <Box sx={shell(false)}>
        <AutoAwesomeOutlinedIcon fontSize="small" color="disabled" />
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {query.isError
            ? 'Could not load fund suggestions — pick the donor and fund yourself.'
            : `No ${book} fund has money available for this line — leave the fund empty or check receipts.`}
        </Typography>
        {query.isError ? (
          <Button size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        ) : null}
      </Box>
    );
  }

  return (
    <Box sx={shell(true)}>
      <AutoAwesomeOutlinedIcon fontSize="small" color="primary" />
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography variant="caption" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Best fund for this line
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {best.donorName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            · {best.fundProfileName}
            {best.grantCode ? ` · ${best.grantCode}` : ''}
          </Typography>
          <Chip label={`Score ${best.score}`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, ...MONEY_SX }} />
          {best.coversAmount === false ? <Chip label="Partial cover" size="small" color="warning" variant="outlined" /> : null}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ ...MONEY_SX, display: 'block' }}>
          Available {formatInrExact(best.available)}
          {best.availableAfter != null ? ` → ${formatInrExact(best.availableAfter)} after this debit` : ''}
          {best.reasons.length ? ` · ${best.reasons.slice(0, 2).join(' · ')}` : ''}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" size="small" onClick={() => onUse(best)}>
          Use this fund
        </Button>
        <Button variant="outlined" size="small" onClick={onSeeAll}>
          {suggestions.length > 1 ? `See all ${suggestions.length}` : 'Details'}
        </Button>
      </Stack>
    </Box>
  );
}
