import {
  Avatar,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { formatDateRange } from '../utils/formatDate.js';

function initials(name) {
  return (name || '')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** One employee's allocation rows, grouped under a header with the running total. */
export function EmployeeAllocationCard({ employeeName, empCode, rows, onRemove }) {
  const total = rows.reduce((sum, r) => sum + r.allocationPct, 0);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, fontSize: 13 }}>
              {initials(employeeName)}
            </Avatar>
            <div>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>{employeeName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {empCode}
              </Typography>
            </div>
          </Stack>
          <Chip label={`${total}% allocated`} size="small" sx={{ fontWeight: 600 }} />
        </Stack>

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
              {rows.map((r) => (
                <TableRow key={r.id}>
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
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {formatDateRange(r.startDate, r.endDate)}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', maxWidth: 220 }}>{r.remark || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onRemove(r.id)} aria-label="Remove allocation">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
