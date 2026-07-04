import { Stack } from '@mui/material';
import { StatusChip } from './StatusChip.jsx';

export default {
  title: 'Shared/StatusChip',
  component: StatusChip,
};

export const Tones = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <StatusChip label="Domestic" tone="neutral" />
      <StatusChip label="Foreign · FCRA" tone="graphite" />
      <StatusChip label="Restricted" tone="outlined" />
      <StatusChip label="Active" tone="success" />
      <StatusChip label="Pending Approval" tone="warning" />
      <StatusChip label="Terminated" tone="error" />
      <StatusChip label="Approved" tone="info" />
    </Stack>
  ),
};
