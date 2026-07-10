import { createTheme } from '@mui/material/styles';
import { palettes, SERIF, SANS } from './palette.js';

// Zariya design language: quiet, editorial, precise.
// Warm paper canvas, ink text, hairline borders. Serif display for headings,
// system sans for UI. Hierarchy comes from type, spacing and hairlines — no
// gradients, no heavy shadows. Both light and dark modes share one token set
// (see palette.js); createAppTheme(mode) maps those tokens onto MUI.

export { SERIF, SANS };

export function createAppTheme(mode = 'light') {
  const c = palettes[mode] || palettes.light;
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: c.ink, contrastText: c.darkInk },
      secondary: { main: c.warn },
      background: { default: c.paper, paper: c.card },
      divider: c.line,
      text: { primary: c.ink, secondary: c.muted },
      success: { main: c.ok },
      error: { main: c.err },
      warning: { main: c.warn },
      info: { main: c.info },
      action: {
        hover: c.card2,
        selected: c.card2,
      },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: SANS,
      fontSize: 13.5,
      h1: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '.005em' },
      h2: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '.005em' },
      h3: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '.005em' },
      h4: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '.005em' },
      h5: { fontFamily: SERIF, fontWeight: 600 },
      h6: { fontFamily: SERIF, fontWeight: 600 },
      subtitle1: { color: c.muted },
      subtitle2: { color: c.muted, fontWeight: 600 },
      overline: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '.13em',
        color: c.muted,
      },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: c.paper },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: c.line,
            borderRadius: 8,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, paddingInline: 16, fontSize: 12.5 },
          contained: {
            backgroundColor: c.dark,
            color: c.darkInk,
            '&:hover': { backgroundColor: c.dark, opacity: 0.9 },
          },
          outlined: {
            borderColor: c.line,
            color: c.ink,
            '&:hover': { borderColor: c.ink, backgroundColor: c.card2 },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: c.line },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: c.card,
            border: `1px solid ${c.line}`,
            borderRadius: 12,
            boxShadow: c.shadow,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: c.card,
            '& fieldset': { borderColor: c.line },
            '&:hover fieldset': { borderColor: c.muted },
            '&.Mui-focused fieldset': { borderWidth: 1, borderColor: c.info },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottomColor: c.line2, fontSize: 12.5 },
          head: {
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.11em',
            textTransform: 'uppercase',
            color: c.muted,
            backgroundColor: c.thead,
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          hover: { '&:hover': { backgroundColor: c.thead } },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 999, fontSize: 10.5 },
          outlined: { borderColor: c.line },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundImage: 'none', backgroundColor: c.card },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            border: `1px solid ${c.line}`,
            borderRadius: 14,
            backgroundColor: c.card,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: c.dark, color: c.darkInk, fontSize: 12 },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: { color: isDark ? c.info : c.info },
        },
      },
    },
  });
}

// Default light theme — kept for any importer that wants a ready-made theme.
export const theme = createAppTheme('light');
