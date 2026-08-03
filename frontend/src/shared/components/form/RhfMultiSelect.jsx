import { Controller } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';

/**
 * React Hook Form ↔ MUI Autocomplete(multiple) binding.
 * options: [{ value, label }]. Field value is an array of `value`s.
 * `transformSelection(values, previousValues)` lets a caller post-process the
 * raw selected values (e.g. expanding a sentinel option into every other
 * option's value, or making it exclusive of the rest) before they reach the
 * field; `previousValues` is the field's value before this change, so the
 * caller can tell what was just added vs already there.
 */
export function RhfMultiSelect({ name, control, label, options, required = false, helperText, transformSelection }) {
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
          onChange={(_event, selected) => {
            const values = selected.map((o) => o.value);
            field.onChange(transformSelection ? transformSelection(values, field.value || []) : values);
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
