import { Controller } from 'react-hook-form';
import { MenuItem, TextField } from '@mui/material';

/**
 * React Hook Form ↔ MUI Select binding.
 * options: [{ value, label }]
 */
export function RhfSelect({ name, control, label, options, required = false, helperText, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          value={field.value ?? ''}
          select
          label={label}
          required={required}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message || helperText || ' '}
          fullWidth
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
