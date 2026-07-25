import { Box, Card, Typography } from '@mui/material';
import { formatInr } from '../../../lib/format/currency.js';

/**
 * Funding split into the three statutory buckets — FC (Foreign Contribution),
 * DC (Domestic Contribution) and CSR. Driven by the server summary; the three
 * buckets partition the same non-blocked grants as the funding chain, so their
 * committed amounts sum back to committed funding.
 */
export function FundingByClassCard({ rows }) {
  if (!rows || rows.length === 0) return null;

  const totalCommitted = rows.reduce((sum, row) => sum + row.committed, 0);

  return (
    <Card>
      <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
        <Typography variant="h6" sx={{ fontSize: 17 }}>
          Funding by class
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
          Committed funding classified into the statutory buckets — foreign (FCRA), domestic and CSR.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: '6px 10px',
          px: 2.5,
          py: 1,
          pb: 2.25,
        }}
      >
        {rows.map((row) => {
          const pct = totalCommitted > 0 ? Math.round((100 * row.committed) / totalCommitted) : 0;
          return (
            <Box key={row.bucket}>
              <Typography variant="overline" sx={{ fontSize: 9.5, display: 'block' }}>
                {row.bucket} · {row.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: (t) => t.typography.h2.fontFamily,
                  fontSize: 22,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  my: 0.25,
                }}
              >
                {formatInr(row.committed)}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                {pct}% of committed · {row.grantCount} grant{row.grantCount === 1 ? '' : 's'} ·{' '}
                {formatInr(row.received)} received
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
