import { createTheme } from '@mui/material/styles';
import { accent, graphite, layout, semantic, shadows } from './tokens.js';

/**
 * Material UI theme for Zariya — premium graphite black.
 * Consumes tokens.js exclusively; do not introduce raw colour values here.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: accent.main,
      dark: accent.dark,
      light: accent.light,
      contrastText: accent.contrastText,
    },
    secondary: {
      main: graphite[600],
      contrastText: '#FFFFFF',
    },
    success: semantic.success,
    error: semantic.error,
    warning: semantic.warning,
    info: semantic.info,
    background: {
      default: graphite[50],
      paper: '#FFFFFF',
    },
    text: {
      primary: graphite[900],
      secondary: graphite[500],
    },
    divider: graphite[200],
  },
  typography: {
    fontFamily: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.3rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.1rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontSize: '0.9rem', fontWeight: 600 },
    subtitle1: { fontSize: '0.95rem', color: graphite[500] },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.825rem' },
    caption: { fontSize: '0.75rem', color: graphite[500] },
    overline: { fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: layout.radius.sm },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: graphite[50] },
        '*::-webkit-scrollbar': { width: 8, height: 8 },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: graphite[300],
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: layout.radius.sm, paddingInline: 16 },
        containedPrimary: {
          background: accent.gradient,
          '&:hover': { background: accent.gradientHover },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: layout.radius.md,
          border: `1px solid ${graphite[200]}`,
          boxShadow: shadows.card,
        },
      },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: layout.radius.md } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: graphite[25],
            color: graphite[600],
            fontWeight: 600,
            fontSize: '0.78rem',
            letterSpacing: '0.02em',
            borderBottom: `1px solid ${graphite[200]}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${graphite[100]}`, fontSize: '0.85rem' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.72rem' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: graphite[900], fontSize: '0.75rem' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 999,
          backgroundColor: graphite[200],
        },
        bar: { borderRadius: 999, backgroundColor: graphite[900] },
      },
    },
  },
});
