import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../src/theme/theme.js';

/** All stories render inside the production theme. */
export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  ),
];

export const parameters = {
  layout: 'padded',
};
