// Zariya design language — palette tokens.
//
// Ported from the Donor Module design preview: a quiet, editorial "paper"
// aesthetic. Warm ivory canvas, ink text, hairline borders, serif display for
// headings. Both a light and a dark palette are defined; the same tokens drive
// the MUI theme (see theme.js) and the CSS custom properties (see
// styles/theme.css) so plain-CSS and MUI surfaces stay in lockstep.

export const light = {
  paper: '#F6F4EE', // app canvas
  card: '#FDFCF9', // raised surface
  card2: '#F1EEE6', // sunken / subtle surface
  ink: '#23241F', // primary text
  muted: '#75705F', // secondary text
  line: '#E4E0D4', // hairline border
  line2: '#EFECE2', // softer hairline (table rows)
  thead: '#F8F6F0', // table header / hover
  ok: '#1E6B4A',
  okBg: '#E7F1EB',
  err: '#B3372B',
  errBg: '#F8E9E6',
  warn: '#8F6A12',
  warnBg: '#F6EFDC',
  info: '#3A5B8C',
  infoBg: '#E9EEF6',
  dark: '#23241F', // inverted surface (active nav, buttons, toast)
  darkInk: '#F3F1EA', // text on inverted surface
  shadow: '0 1px 2px rgba(35,36,31,.05), 0 2px 6px rgba(35,36,31,.05)',
};

export const dark = {
  paper: '#191813',
  card: '#201F18',
  card2: '#26251D',
  ink: '#EDEAE0',
  muted: '#A39D8D',
  line: '#37352A',
  line2: '#2C2A21',
  thead: '#23221A',
  ok: '#5CB98C',
  okBg: 'rgba(46,125,87,.18)',
  err: '#E08A7C',
  errBg: 'rgba(179,55,43,.18)',
  warn: '#D9B35E',
  warnBg: 'rgba(143,106,18,.18)',
  info: '#8FAAD6',
  infoBg: 'rgba(58,91,140,.2)',
  dark: '#EDEAE0',
  darkInk: '#191813',
  shadow: '0 1px 2px rgba(0,0,0,.4)',
};

export const palettes = { light, dark };

export const SERIF =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif';
export const SANS =
  '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
