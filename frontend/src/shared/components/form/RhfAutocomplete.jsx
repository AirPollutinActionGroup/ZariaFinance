import { Controller } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';

/**
 * React Hook Form ↔ MUI Autocomplete (single select) binding — a searchable
 * alternative to RhfSelect for long lists such as donors, programmes and users.
 *
 * options: [{ value, label }]. The field value is a single `value`, matching
 * RhfSelect so a field can be swapped between the two without touching the
 * schema or the mapper. Values are compared as strings because form state holds
 * ids as strings while options may carry numbers.
 */
export function RhfAutocomplete({
  name,
  control,
  label,
  options,
  required = false,
  helperText,
  disabled = false,
  placeholder,
}) {
  const asKey = (value) => (value === null || value === undefined ? '' : String(value));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          options={options}
          disabled={disabled}
          getOptionLabel={(option) => option?.label ?? ''}
          isOptionEqualToValue={(option, value) => asKey(option.value) === asKey(value?.value)}
          value={options.find((o) => asKey(o.value) === asKey(field.value)) || null}
          onChange={(_event, selected) => field.onChange(selected ? selected.value : '')}
          onBlur={field.onBlur}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={field.ref}
              label={label}
              required={required}
              placeholder={placeholder}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message || helperText || ' '}
            />
          )}
        />
      )}
    />
  );
}
