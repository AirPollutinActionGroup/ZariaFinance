import { useEffect, useRef, useState } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/** Debounced search input used by list pages. */
export function SearchField({ value, onChange, placeholder = 'Search…', delayMs = 300 }) {
  const [draft, setDraft] = useState(value ?? '');
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleChange = (event) => {
    const next = event.target.value;
    setDraft(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), delayMs);
  };

  return (
    <TextField
      value={draft}
      onChange={handleChange}
      placeholder={placeholder}
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
