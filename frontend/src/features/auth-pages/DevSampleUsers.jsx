import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { env } from '../../lib/config/env.js';

/**
 * Development-only cheat-sheet of the seeded sample users (see the backend
 * migration V12__seed_sample_users.sql). Rendered ONLY in dev builds — in a
 * production build `env.isDev` is false and this component returns null, so the
 * credentials never ship to real users.
 *
 * On the login screen, pass `onPick` to make a row click prefill the form.
 */
const SAMPLE_USERS = [
  { username: 'ceoadmin', password: 'Ceo@12345', role: 'CEO', state: 'approved' },
  { username: 'financeofc', password: 'Finance@123', role: 'Finance Officer', state: 'approved' },
  { username: 'fundlead', password: 'Fund@12345', role: 'Fundraising Lead', state: 'approved' },
  { username: 'pendingfo', password: 'Pending@123', role: 'Finance Officer', state: 'pending' },
  { username: 'rejectedfl', password: 'Rejected@12', role: 'Fundraising Lead', state: 'rejected' },
];

const STATE_TONE = { approved: 'success', pending: 'warning', rejected: 'error' };

export function DevSampleUsers({ onPick = null }) {
  if (!env.isDev) return null;

  return (
    <Box
      sx={{
        mt: 3,
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        p: 1.5,
        bgcolor: 'action.hover',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip label="DEV" size="small" color="warning" sx={{ fontWeight: 700, height: 18 }} />
        <Typography variant="caption" color="text.secondary">
          Sample users (dev only){onPick ? ' — click a row to fill the form' : ''}
        </Typography>
      </Box>

      <Table size="small" sx={{ '& td, & th': { px: 1, py: 0.5, borderColor: 'divider' } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: 11 }}>Username</TableCell>
            <TableCell sx={{ fontSize: 11 }}>Password</TableCell>
            <TableCell sx={{ fontSize: 11 }}>Role</TableCell>
            <TableCell sx={{ fontSize: 11 }} align="right">
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {SAMPLE_USERS.map((user) => (
            <TableRow
              key={user.username}
              hover={Boolean(onPick)}
              onClick={onPick ? () => onPick(user) : undefined}
              sx={{
                cursor: onPick ? 'pointer' : 'default',
                '&:last-child td': { border: 0 },
              }}
            >
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{user.username}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{user.password}</TableCell>
              <TableCell sx={{ fontSize: 12 }}>{user.role}</TableCell>
              <TableCell align="right">
                <Chip
                  label={user.state}
                  size="small"
                  color={STATE_TONE[user.state]}
                  variant="outlined"
                  sx={{ height: 18, fontSize: 10, textTransform: 'capitalize' }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
