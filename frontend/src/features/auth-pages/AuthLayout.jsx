import { Box, Card, CardContent } from '@mui/material';
import { graphite } from '../../theme/tokens.js';
import { BrandMark } from '../../app/layout/BrandMark.jsx';

/** Centered card on a graphite backdrop for public screens. */
export function AuthLayout({ children, maxWidth = 440 }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        backgroundColor: graphite[950],
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <BrandMark />
        </Box>
        <Card>
          <CardContent sx={{ p: 4 }}>{children}</CardContent>
        </Card>
      </Box>
    </Box>
  );
}
