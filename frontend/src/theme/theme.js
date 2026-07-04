import { createTheme } from '@mui/material/styles';

// Zariya design language: quiet, editorial, precise.
// Warm ivory canvas, ink text, hairline borders, a single restrained bronze
// accent. Serif display for headings, system sans for UI. No gradients, no
// heavy shadows — hierarchy comes from type, spacing and hairlines.

const ink = '#1C1E22';
const inkSoft = '#5C6168';
const ivory = '#F7F6F2';
const paper = '#FFFFFF';
const hairline = '#E7E4DD';
const bronze = '#8C6F46';

export const SERIF = '"Georgia", "Cambria", "Times New Roman", serif';
export const SANS = '"Inter Variable", "Inter", -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ink, contrastText: '#FCFBF8' },
    secondary: { main: bronze },
    background: { default: ivory, paper },
    divider: hairline,
    text: { primary: ink, secondary: inkSoft },
    success: { main: '#3E7256' },
    error: { main: '#A94438' },
    warning: { main: '#9A6B2F' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: SANS,
    h1: { fontFamily: SERIF, fontWeight: 500, letterSpacing: '-0.01em' },
    h2: { fontFamily: SERIF, fontWeight: 500, letterSpacing: '-0.01em' },
    h3: { fontFamily: SERIF, fontWeight: 500, letterSpacing: '-0.01em' },
    h4: { fontFamily: SERIF, fontWeight: 500, letterSpacing: '-0.005em' },
    h5: { fontFamily: SERIF, fontWeight: 500 },
    h6: { fontFamily: SERIF, fontWeight: 500 },
    subtitle1: { color: inkSoft },
    subtitle2: { color: inkSoft, fontWeight: 500 },
    overline: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.14em',
      color: inkSoft,
    },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: ivory },
        '*::-webkit-scrollbar': { width: 8, height: 8 },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: hairline,
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 18 },
        contained: {
          backgroundColor: ink,
          color: '#FCFBF8',
          '&:hover': { backgroundColor: '#2e3137' },
        },
        outlined: { borderColor: hairline, '&:hover': { borderColor: ink } },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: hairline },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${hairline}`, borderRadius: 12 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: paper,
          '& fieldset': { borderColor: hairline },
          '&:hover fieldset': { borderColor: inkSoft },
          '&.Mui-focused fieldset': { borderWidth: 1, borderColor: ink },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: hairline },
        head: {
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: inkSoft,
          backgroundColor: 'transparent',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 999 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundImage: 'none' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { border: `1px solid ${hairline}`, borderRadius: 14 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: ink, fontSize: 12 },
      },
    },
  },
});
