import { useEffect, useRef } from 'react';
import { Box, Button, Grid, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { Controller, useWatch } from 'react-hook-form';
import { RhfSelect } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { useFxRate } from '../hooks/useFxRate.js';
import { CURRENCY_SYMBOL, FC_CURRENCIES, inrFromForeign } from '../lib/foreignContribution.js';

// Re-exported so existing imports from this component keep working.
export {
  CURRENCY_SYMBOL,
  FC_CURRENCIES,
  foreignContributionDefaults,
  formatForeign,
  inrFromForeign,
  todayIso,
} from '../lib/foreignContribution.js';

const CURRENCY_OPTIONS = FC_CURRENCIES.map((c) => ({ value: c, label: `${c} · ${CURRENCY_SYMBOL[c]}` }));

/** Plain number field bound to the form; keeps the raw string so typing isn't fought. */
function NumberField({ name, control, label, adornment, helperText, step = 'any' }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          type="number"
          label={label}
          required
          fullWidth
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message || helperText}
          slotProps={{
            htmlInput: { min: 0, step },
            input: adornment
              ? {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {adornment}
                    </InputAdornment>
                  ),
                  sx: { fontVariantNumeric: 'tabular-nums' },
                }
              : { sx: { fontVariantNumeric: 'tabular-nums' } },
          }}
        />
      )}
    />
  );
}

/**
 * Foreign contribution (FC book): the donor commits in a foreign currency.
 * The FX rate is looked up from the backend reference table (RBI) for the
 * chosen date and can be overridden; the INR "Total amount committed" is
 * then amount × rate, written back into the form.
 *
 * Note: the backend stores INR only — currency, foreign amount and rate are
 * used to derive the INR total and are not persisted yet.
 */
export function ForeignContributionFields({ control, setValue }) {
  const currency = useWatch({ control, name: 'fcCurrency' });
  const amount = useWatch({ control, name: 'fcAmount' });
  const rateDate = useWatch({ control, name: 'fcRateDate' });
  const rate = useWatch({ control, name: 'fcRate' });

  const fxQuery = useFxRate(currency, rateDate);
  const reference = fxQuery.data?.rateToInr ?? null;

  // Auto-fill the reference rate whenever currency/date change — but only the
  // first time for each lookup, so a rate the user typed is never overwritten.
  const appliedLookup = useRef(null);
  useEffect(() => {
    const key = `${currency}|${rateDate}`;
    if (reference != null && appliedLookup.current !== key) {
      appliedLookup.current = key;
      setValue('fcRate', String(reference), { shouldValidate: true, shouldDirty: true });
    }
  }, [currency, rateDate, reference, setValue]);

  // Keep the INR total in step with amount × rate.
  const inr = inrFromForeign(amount, rate);
  useEffect(() => {
    if (inr != null) setValue('totalAmount', String(inr), { shouldValidate: true, shouldDirty: true });
  }, [inr, setValue]);

  const usingReference = reference != null && Number(rate) === Number(reference);
  let rateHint;
  if (fxQuery.isFetching) rateHint = 'Looking up the reference rate…';
  else if (reference == null && fxQuery.isFetched) rateHint = 'No reference rate for this date — enter it manually';
  else if (usingReference) {
    rateHint = `${fxQuery.data.source === 'RBI' ? 'RBI' : 'Reference'} rate${
      fxQuery.data.stale && fxQuery.data.rateDate ? ` from ${formatDate(fxQuery.data.rateDate)}` : ''
    }`;
  } else rateHint = 'Entered manually';

  return (
    <Box sx={{ mb: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ px: 2, py: 1.25, alignItems: 'center', bgcolor: 'var(--card2)', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <CurrencyExchangeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Foreign contribution · FC book
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This donor gives in a foreign currency. The INR total is calculated as amount × FX rate.
          </Typography>
        </Box>
        {reference != null && !usingReference ? (
          <Button
            size="small"
            onClick={() => setValue('fcRate', String(reference), { shouldValidate: true, shouldDirty: true })}
            sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Use reference rate
          </Button>
        ) : null}
      </Stack>

      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RhfSelect name="fcCurrency" control={control} label="Currency" options={CURRENCY_OPTIONS} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <NumberField
            name="fcAmount"
            control={control}
            label={`Amount in ${currency || 'currency'}`}
            adornment={CURRENCY_SYMBOL[currency]}
            helperText="As stated in the agreement"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="fcRateDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                type="date"
                label="Rate date"
                required
                fullWidth
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message || 'Date the rate is locked on'}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <NumberField
            name="fcRate"
            control={control}
            label={`FX rate (₹ per ${currency || 'unit'})`}
            adornment="₹"
            helperText={rateHint}
            step="0.0001"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
