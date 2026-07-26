import { Controller } from 'react-hook-form';
import { FormControlLabel, FormHelperText, Radio, RadioGroup, Stack, Typography } from '@mui/material';

/**
 * React Hook Form ↔ MUI RadioGroup binding.
 * options: [{ value, label }]
 */
export function RhfRadioGroup({ name, control, label, options, row = true, helperText }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Stack spacing={0.5}>
          {label ? (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          ) : null}
          <RadioGroup {...field} value={field.value ?? ''} row={row}>
            {options.map((option) => (
              <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
            ))}
          </RadioGroup>
          <FormHelperText error={Boolean(fieldState.error)}>
            {fieldState.error?.message || helperText || ' '}
          </FormHelperText>
        </Stack>
      )}
    />
  );
}
