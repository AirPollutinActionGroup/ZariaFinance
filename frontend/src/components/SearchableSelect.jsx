import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';

export function SearchableSelect({
  label,
  id,
  options = [],
  value,
  onChange,
  freeSolo = false,
  disabled = false,
  loading = false,
  placeholder = "",
  error,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Dynamic green colors for Light & Dark mode
  const greenText = isDark ? '#5CB98C' : '#1E6B4A'; // Mint in Dark, Forest in Light
  const greenBg = isDark ? 'rgba(92, 185, 140, 0.25)' : '#E7F1EB'; // Green Bar fill

  return (
    <Autocomplete
      id={id}
      options={options}
      freeSolo={freeSolo}
      disabled={disabled}
      loading={loading}
      clearOnBlur={!freeSolo}
      noOptionsText={freeSolo ? "Type custom name..." : "No options"}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option?.label || '';
      }}
      value={value || null}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      onInputChange={(event, newInputValue, reason) => {
        if (freeSolo && reason === 'input') {
          onChange(newInputValue);
        }
      }}
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            mt: 0.75,
            borderRadius: '10px',
            border: '1px solid',
            borderColor: theme.palette.divider,
            boxShadow: isDark
              ? '0 12px 32px -4px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5)'
              : '0 10px 28px -4px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)',
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            /* Smooth rounded corners for dropdown items */
            '& .MuiAutocomplete-option': {
              margin: '3px 6px',
              borderRadius: '6px',
              fontSize: '13.5px',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            },
            /* GREEN BAR HIGHLIGHT ON HOVER, FOCUS & SELECTION */
            '& .MuiAutocomplete-option.Mui-focused, & .MuiAutocomplete-option:hover, & .MuiAutocomplete-option[aria-selected="true"]': {
              backgroundColor: `${greenBg} !important`,
              color: `${greenText} !important`,
              fontWeight: 600,
            },
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={Boolean(error)}
          helperText={error || ' '}
          fullWidth
        />
      )}
    />
  );
}
