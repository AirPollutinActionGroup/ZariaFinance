import { Box, Card, CardContent, Typography } from '@mui/material';

/** Centered card on a warm ivory backdrop for public screens. */
export function AuthLayout({ children, maxWidth = 440 }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        px: 2,
        py: { xs: 4, md: 8 },
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ letterSpacing: '0.02em', color: 'text.primary' }}>
          Zariya
        </Typography>
        <Typography
          variant="overline"
          component="p"
          sx={{ mt: 0.5, color: 'secondary.main' }}
        >
          Budgeting · Trading · Reporting
        </Typography>
      </Box>

      <Box sx={{ width: '100%', maxWidth }}>
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 12 }}>
          <CardContent sx={{ p: 4 }}>{children}</CardContent>
        </Card>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
        © {new Date().getFullYear()} The Convergence Foundation · Authorized personnel only
      </Typography>
    </Box>
  );
}
