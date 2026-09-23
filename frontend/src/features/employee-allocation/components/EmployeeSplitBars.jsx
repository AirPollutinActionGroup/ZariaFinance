import { Box, Stack, Typography, useTheme } from '@mui/material';
import { buildProgrammeColorMap } from '../utils/colors.js';

/** "Current split by employee" — one stacked bar + legend per employee. */
export function EmployeeSplitBars({ allocations }) {
  const theme = useTheme();

  const byEmployee = new Map();
  for (const a of allocations) {
    if (!byEmployee.has(a.employeeId)) byEmployee.set(a.employeeId, []);
    byEmployee.get(a.employeeId).push(a);
  }
  if (byEmployee.size === 0) return null;

  const colorMap = buildProgrammeColorMap(
    allocations.map((a) => a.programmeId),
    theme.palette.mode,
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Current split by employee
      </Typography>
      <Stack spacing={3}>
        {Array.from(byEmployee.entries()).map(([employeeId, rows]) => {
          const total = rows.reduce((sum, r) => sum + r.allocationPct, 0);
          const free = Math.max(0, 100 - total);
          return (
            <Box key={employeeId}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {rows[0].employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {total}% allocated · {free}% free
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                  height: 14,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'action.hover',
                }}
              >
                {rows.map((r, idx) => (
                  <Box
                    key={r.id}
                    title={`${r.programmeName} — ${r.projectName}: ${r.allocationPct}%`}
                    sx={{
                      width: `${Math.min(r.allocationPct, 100)}%`,
                      minWidth: 2,
                      height: '100%',
                      bgcolor: colorMap.get(r.programmeId),
                      borderRight: idx < rows.length - 1 ? '2px solid' : 'none',
                      borderColor: 'background.paper',
                    }}
                  />
                ))}
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.5 }}>
                {rows.map((r) => (
                  <Stack key={r.id} direction="row" spacing={0.75} alignItems="center">
                    <Box
                      sx={{ width: 9, height: 9, borderRadius: 0.5, bgcolor: colorMap.get(r.programmeId) }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {r.programmeName} · {r.projectName} · {r.allocationPct}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
