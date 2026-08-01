import { Controller } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';

/**
 * React Hook Form ↔ MUI Autocomplete(multiple) binding.
 * options: [{ value, label }]. Field value is an array of `value`s.
 */
export function RhfMultiSelect({ name, control, label, options, required = false, helperText }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          multiple
          options={options}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => String(option.value) === String(value.value)}
          value={options.filter((o) => (field.value || []).some((v) => String(v) === String(o.value)))}
          onChange={(_event, selected) => field.onChange(selected.map((o) => o.value))}
          slotProps={{
            paper: {
              elevation: 4,
              sx: {
                maxHeight: 180,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(0,0,0,0.5)'
                    : '0 8px 24px rgba(0,0,0,0.1)',
                borderRadius: 2,
                mt: 0.5,
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              required={required}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message || helperText || ' '}
            />
          )}
        />
      )}
    />
  );
}
