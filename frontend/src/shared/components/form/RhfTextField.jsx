import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

/**
 * React Hook Form ↔ MUI TextField binding. Server-side field errors
 * (ApiError.fieldErrors) are merged by the form container via setError,
 * so this component only ever reads RHF state. Validation errors always
 * take precedence over static helper text.
 */
export function RhfTextField({ name, control, label, required = false, helperText, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          value={field.value ?? ''}
          label={label}
          required={required}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message || helperText || ' '}
          fullWidth
        />
      )}
    />
  );
}
