import { light } from './palette.js';

// Layout metrics and a light-mode convenience view of the palette. Colour-aware
// surfaces should prefer the MUI theme (useTheme()) or CSS custom properties so
// they adapt to dark mode; these constants are for static light-mode chrome.

export const accent = {
  main: light.ink,
  dark: light.ink,
  light: light.muted,
  contrastText: light.darkInk,
  gradient: light.card2,
  gradientHover: light.line,
  platinum: light.ink,
  silver: light.muted,
  hairline: light.line,
};

export const graphite = {
  25: light.card,
  50: light.paper,
  100: light.line,
  200: light.line,
  300: light.line,
  400: light.warn,
  500: light.muted,
  600: light.muted,
  700: light.ink,
  800: light.ink,
  900: light.ink,
  950: light.card,
};

export const semantic = {
  success: { main: light.ok, light: light.okBg, dark: light.ok },
  error: { main: light.err, light: light.errBg, dark: light.err },
  warning: { main: light.warn, light: light.warnBg, dark: light.warn },
  info: { main: light.info, light: light.infoBg, dark: light.info },
};

export const layout = {
  sidebarWidth: 224,
  topbarHeight: 56,
  contentMaxWidth: 1180,
  radius: { sm: 8, md: 12, lg: 14, pill: 999 },
};

export const shadows = {
  card: light.shadow,
  raised: light.shadow,
  graphiteGlow: 'none',
};
