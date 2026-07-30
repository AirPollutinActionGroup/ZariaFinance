import { Grid, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useWatch } from 'react-hook-form';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { UTILISATION_RULE_TYPES } from '../constants.js';

/**
 * Single Utilisation Rule row with conditional Limit % field based on Rule Type selection.
 */
export function UtilisationRuleRow({ control, path, index, onRemove }) {
  const ruleType = useWatch({ control, name: `${path}.ruleType` });
  const isNotApplicable = ruleType === 'NOT_APPLICABLE';
  const isOther = ruleType === 'OTHER_CUSTOM';
  const showLimit = Boolean(ruleType && !isNotApplicable);

  // Dynamic grid sizing based on visible fields
  const ruleTypeXs = isOther ? 12 : 5;
  const ruleTypeSm = isOther ? 4 : (showLimit ? 5 : 6);
  const limitXs = 12;
  const limitSm = 3;
  const descXs = 11;
  const descSm = showLimit ? (isOther ? 3 : 4) : (isOther ? 4 : 5);

  return (
    <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Grid size={{ xs: ruleTypeXs, sm: ruleTypeSm }}>
        <RhfSelect
          name={`${path}.ruleType`}
          control={control}
          label="Rule type"
          required
          options={UTILISATION_RULE_TYPES}
        />
      </Grid>

      {isOther ? (
        <Grid size={{ xs: 12, sm: 3 }}>
          <RhfTextField
            name={`${path}.otherRuleType`}
            control={control}
            label="Specify rule type"
            placeholder="e.g. Travel Cap"
            required
          />
        </Grid>
      ) : null}

      {showLimit ? (
        <Grid size={{ xs: limitXs, sm: limitSm }}>
          <RhfTextField
            name={`${path}.limitPercentage`}
            control={control}
            label="Limit %"
            required
            type="number"
            placeholder="e.g. 10"
            slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
          />
        </Grid>
      ) : null}

      <Grid size={{ xs: descXs, sm: descSm }}>
        <RhfTextField
          name={`${path}.description`}
          control={control}
          label="Description (Optional)"
          placeholder="Additional details..."
        />
      </Grid>

      <Grid size={{ xs: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton aria-label={`Remove rule ${index + 1}`} onClick={onRemove} sx={{ mt: 0.5 }}>
          <DeleteOutlineIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}
