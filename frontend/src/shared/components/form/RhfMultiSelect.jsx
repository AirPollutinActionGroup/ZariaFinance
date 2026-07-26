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
          isOptionEqualToValue={(option, value) => option.value === value.value}
          value={options.filter((o) => (field.value || []).includes(o.value))}
          onChange={(_event, selected) => field.onChange(selected.map((o) => o.value))}
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
