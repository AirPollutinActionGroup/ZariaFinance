import { Box, Stack, Typography } from '@mui/material';
import { accent } from '../../theme/tokens.js';

/** Zariya wordmark with the graphite tile (was the yellow tile in the draft). */
export function BrandMark() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        aria-hidden
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          background: accent.gradient,
          border: `1px solid ${accent.hairline}`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Typography sx={{ color: accent.platinum, fontWeight: 800, fontSize: 20 }}>Z</Typography>
      </Box>
      <Box>
        <Typography sx={{ color: accent.platinum, fontWeight: 700, lineHeight: 1.2 }}>
          Zariya
        </Typography>
        <Typography sx={{ color: accent.silver, fontSize: 11 }}>
          Budget · Trade · Report
        </Typography>
      </Box>
    </Stack>
  );
}
