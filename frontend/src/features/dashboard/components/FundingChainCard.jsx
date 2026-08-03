import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import { formatInr } from '../../../lib/format/currency.js';

const R = 54;
const STROKE = 18;
const CIRC = 2 * Math.PI * R;

export function FundingChainCard({ totals }) {
  const committed = totals.committed || 0;
  const received = totals.received || 0;
  const utilised = totals.utilised || 0;
  const available = totals.available ?? Math.max(0, received - utilised);
  const open = totals.open ?? Math.max(0, committed - received);
  const blocked = 0; // Write-off / Cancelled set to 0 per specification

  const denom = committed;

  // Chart 1 Segments: Pipeline Status (Original)
  const receivedPct = Math.round((100 * received) / denom);
  const openPct = Math.round((100 * open) / denom);
  const blockedPct = Math.round((100 * blocked) / denom);

  const pipelineSegments = [
    { label: 'Received', value: received, pct: receivedPct, desc: 'cash in bank', color: '#00E676' }, // Fluorescent Green
    { label: 'Open / Outstanding', value: open, pct: openPct, desc: 'contracted (receivable)', color: '#FACC15' }, // Light Yellow
    { label: 'Write-off / Cancelled', value: blocked, pct: blockedPct, desc: 'cancelled / written off', color: '#E53935' },
  ];

  // Chart 2 Segments: Utilization / Burn Rate out of Received
  const denom2 = received || 1;
  const utilisedPctOfReceived = Math.round((100 * utilised) / denom2);
  const availablePctOfReceived = Math.round((100 * available) / denom2);

  const stateSegments = [
    { label: 'Utilised', value: utilised, pct: utilisedPctOfReceived, color: '#F57C00' },
    { label: 'Available', value: available, pct: availablePctOfReceived, color: '#00ACC1' },
  ];

  const stateDetails = [
    { key: 'utilised', label: 'Utilised', value: utilised, pct: utilisedPctOfReceived, desc: 'spent against budget', color: '#F57C00' },
    { key: 'available', label: 'Available', value: available, pct: availablePctOfReceived, desc: 'received − utilised', color: '#00ACC1' },
  ];

  let offset1 = 0;
  let offset2 = 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
        <Typography variant="h6" sx={{ fontSize: 17 }}>
          The funding chain
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
          Every grant moves through four states. A commitment is a promise, not income; only
          received money can be utilised.
        </Typography>
      </Box>

      {/* Two Visually Equal Pie Charts Side-by-Side */}
      <Grid container spacing={2} sx={{ px: 2.5, py: 1.5, flexGrow: 1 }}>
        {/* CHART 1: Pipeline Breakdown (Original Chart & Legend) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, mb: 1.5 }}>
              Collection Realization Rate
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {/* SVG Donut Chart 1 */}
              <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Collection Realization Rate Chart">
                  <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line2, #e0e0e0)" strokeWidth={STROKE} />
                  <g transform="rotate(-90 70 70)">
                    {pipelineSegments.map((s) => {
                      const frac = denom > 0 ? s.value / denom : 0;
                      const len = Math.max(0, frac * CIRC - 2);
                      const el = (
                        <circle
                          key={s.label}
                          cx="70"
                          cy="70"
                          r={R}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={STROKE}
                          strokeDasharray={`${len} ${CIRC - len}`}
                          strokeDashoffset={-offset1}
                          strokeLinecap="butt"
                        />
                      );
                      offset1 += frac * CIRC;
                      return el;
                    })}
                  </g>
                </svg>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, lineHeight: 1 }}>
                    Committed
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25, fontSize: 13.5 }}>
                    {formatInr(denom)}
                  </Typography>
                </Box>
              </Box>

              {/* Legend for Chart 1 */}
              <Stack spacing={1} sx={{ minWidth: 0, flexGrow: 1 }}>
                {pipelineSegments.map((s) => (
                  <Box
                    key={s.label}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1,
                      py: 0.85,
                      borderRadius: 1,
                      bgcolor: 'var(--card2, rgba(0, 0, 0, 0.02))',
                      borderLeft: `3px solid ${s.color}`,
                    }}
                  >
                    <Box sx={{ pr: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 11.5, lineHeight: 1.1 }}>
                        {s.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 9.5, display: 'block' }}>
                        {s.desc}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12,
                        fontVariantNumeric: 'tabular-nums',
                        color: 'text.primary',
                        flexShrink: 0,
                      }}
                    >
                      {formatInr(s.value)}{' '}
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 10.5 }}>
                        ({s.pct}%)
                      </Box>
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>
        </Grid>

        {/* CHART 2: New 4-State Flow Breakdown Chart & Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, mb: 1.5 }}>
              Utilization / Burn Rate
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {/* SVG Donut Chart 2 (Visually Equal to Chart 1) */}
              <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Utilization Chart">
                  <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line2, #e0e0e0)" strokeWidth={STROKE} />
                  <g transform="rotate(-90 70 70)">
                    {stateSegments.map((s) => {
                      const frac = denom2 > 0 ? s.value / denom2 : 0;
                      const len = Math.max(0, frac * CIRC - 2);
                      const el = (
                        <circle
                          key={s.label}
                          cx="70"
                          cy="70"
                          r={R}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={STROKE}
                          strokeDasharray={`${len} ${CIRC - len}`}
                          strokeDashoffset={-offset2}
                          strokeLinecap="butt"
                        />
                      );
                      offset2 += frac * CIRC;
                      return el;
                    })}
                  </g>
                </svg>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, lineHeight: 1 }}>
                    Received
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25, fontSize: 13.5 }}>
                    {formatInr(received)}
                  </Typography>
                </Box>
              </Box>

              {/* Details List for Chart 2 */}
              <Stack spacing={1} sx={{ minWidth: 0, flexGrow: 1 }}>
                {stateDetails.map((item) => (
                  <Box
                    key={item.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1,
                      py: 1.25,
                      borderRadius: 1,
                      bgcolor: 'var(--card2, rgba(0, 0, 0, 0.02))',
                      borderLeft: `3px solid ${item.color}`,
                    }}
                  >
                    <Box sx={{ pr: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 11.5, lineHeight: 1.1 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 9.5, display: 'block' }}>
                        {item.desc}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12,
                        fontVariantNumeric: 'tabular-nums',
                        color: item.key === 'available' ? 'success.main' : 'text.primary',
                        flexShrink: 0,
                      }}
                    >
                      {formatInr(item.value)}{' '}
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 10.5 }}>
                        ({item.pct}%)
                      </Box>
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Explanation Banner */}
      <Box
        sx={{
          mx: 2.5,
          mb: 2,
          mt: 1,
          px: 1.75,
          py: 1.25,
          borderRadius: 1.5,
          bgcolor: 'var(--card2)',
          borderLeft: '3px solid',
          borderColor: 'divider',
          fontSize: 11.5,
          color: 'text.secondary',
        }}
      >
        <Box component="b" sx={{ color: 'text.primary' }}>
          Funding committed (receivable) — income side.
        </Box>{' '}
        Money donors have contractually promised. Sits in the trading / committed layer as pipeline;
        becomes income only when received.
      </Box>
    </Card>
  );
}


