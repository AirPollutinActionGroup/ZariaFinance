/**
 * Zariya design tokens — "Premium Graphite" edition.
 *
 * The original review-draft design used a yellow accent. Per the approved
 * direction the accent is now a premium graphite black: deep charcoal
 * surfaces with a subtle metallic gradient and platinum foreground.
 * All colour decisions flow from this file; components never hardcode hex.
 */

export const graphite = {
  25: '#FAFAFB',
  50: '#F6F7F8',
  100: '#EDEEF1',
  200: '#DFE1E5',
  300: '#C6C9CF',
  400: '#9BA0A8',
  500: '#6F747D',
  600: '#4C5158',
  700: '#33373D',
  800: '#232629',
  900: '#17191C',
  950: '#0C0D0F',
};

export const accent = {
  /** Primary interactive colour (buttons, active states). */
  main: graphite[900],
  dark: graphite[950],
  light: graphite[700],
  contrastText: '#FFFFFF',
  /** Metallic sheen used on brand tile, active nav pill and highlight card. */
  gradient: 'linear-gradient(135deg, #2B2F35 0%, #17191C 55%, #202329 100%)',
  gradientHover: 'linear-gradient(135deg, #33383F 0%, #1C1F23 55%, #262A30 100%)',
  /** Platinum foreground for text sitting on graphite surfaces. */
  platinum: '#E8EAED',
  silver: '#B7BCC3',
  hairline: 'rgba(255, 255, 255, 0.08)',
};

export const semantic = {
  success: { main: '#0F7B4D', light: '#E6F4EE', dark: '#0A5C3A' },
  error: { main: '#C4362A', light: '#FBEAE8', dark: '#96291F' },
  warning: { main: '#9A6700', light: '#FBF3E0', dark: '#7A5200' },
  info: { main: '#2F5FA8', light: '#E9F0FA', dark: '#234A85' },
};

export const layout = {
  sidebarWidth: 256,
  topbarHeight: 64,
  contentMaxWidth: 1280,
  radius: { sm: 8, md: 12, lg: 16, pill: 999 },
};

export const shadows = {
  card: '0 1px 2px rgba(12, 13, 15, 0.05), 0 1px 3px rgba(12, 13, 15, 0.06)',
  raised: '0 4px 16px rgba(12, 13, 15, 0.10)',
  graphiteGlow: '0 8px 24px rgba(12, 13, 15, 0.35)',
};
