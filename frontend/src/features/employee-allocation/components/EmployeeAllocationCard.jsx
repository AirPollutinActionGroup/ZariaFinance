import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { StatusChip } from '../../../shared/components/index.js';
import { formatDateRange } from '../utils/formatDate.js';
import { isActiveAllocation } from '../services/employeeAllocationService.js';
import { AllocationActionDialog } from './AllocationActionDialog.jsx';
import { AllocationHistory } from './AllocationHistory.jsx';

function initials(name) {
  return (name || '')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * One employee's allocations. The total counts only running allocations;
 * ended ones stay listed (faded) until removed. Each row can be ended or
 * removed, and the employee's full history opens below.
 */
export function EmployeeAllocationCard({ employeeId, employeeName, empCode, rows, colorMap }) {
  const [acting, setActing] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const runningRows = rows.filter(isActiveAllocation);
  const total = runningRows.reduce((sum, r) => sum + r.allocationPct, 0);
  const endedCount = rows.filter((r) => !isActiveAllocation(r)).length;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, fontSize: 13 }}>{initials(employeeName)}</Avatar>
            <div>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>{employeeName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {empCode}
                {endedCount ? ` · ${endedCount} ended` : ''}
              </Typography>
            </div>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${total}% allocated`}
              size="small"
              color={total > 100 ? 'error' : total === 100 ? 'success' : 'default'}
              sx={{ fontWeight: 600 }}
            />
            <Button
              size="small"
              startIcon={<HistoryIcon fontSize="small" />}
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
            >
              {showHistory ? 'Hide history' : 'History'}
            </Button>
          </Stack>
        </Stack>

        {/* Running allocations as one stacked bar; the grey tail is free time. */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', bgcolor: 'action.hover' }}>
            {runningRows.map((r, idx) => (
              <Box
                key={r.id}
                title={`${r.programmeName}${r.projectName ? ` › ${r.projectName}` : ''}: ${r.allocationPct}%`}
                sx={{
                  width: `${Math.min(r.allocationPct, 100)}%`,
                  bgcolor: colorMap?.get(r.programmeId) || 'text.secondary',
                  borderRight: idx < runningRows.length - 1 ? '2px solid' : 'none',
                  borderColor: 'background.paper',
                }}
              />
            ))}
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.5 }}>
            {runningRows.map((r) => (
              <Stack key={r.id} direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 9, height: 9, borderRadius: 0.5, bgcolor: colorMap?.get(r.programmeId) || 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {r.projectName || r.programmeName} · {r.allocationPct}%
                </Typography>
              </Stack>
            ))}
            {total < 100 ? (
              <Typography variant="caption" color="text.secondary">
                Free · {100 - total}%
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Program</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>State / city</TableCell>
                <TableCell align="right">Alloc.</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Remark</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const active = isActiveAllocation(r);
                return (
                  <TableRow key={r.id} sx={active ? undefined : { '& td': { color: 'text.disabled' } }}>
                    <TableCell>{r.programmeName}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{r.projectName || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{r.role || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {(r.stateNames || []).join(', ') || '—'}
                      {r.cityNames?.length ? ` · ${r.cityNames.join(', ')}` : ''}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {r.allocationPct}%
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {formatDateRange(r.startDate, r.endDate)}
                      {active ? null : (
                        <Box component="span" sx={{ ml: 1 }}>
                          <StatusChip label="Ended" tone="neutral" />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', maxWidth: 220 }}>{r.remark || '—'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" color="inherit" onClick={() => setActing(r)} sx={{ whiteSpace: 'nowrap' }}>
                        {active ? 'End / Remove' : 'Remove'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Collapse in={showHistory} unmountOnExit>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Allocation history
            </Typography>
            <AllocationHistory employeeId={employeeId} />
          </Box>
        </Collapse>
      </CardContent>

      {acting ? <AllocationActionDialog allocation={acting} onClose={() => setActing(null)} /> : null}
    </Card>
  );
}
