import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RhfMultiSelect } from './RhfMultiSelect.jsx';
import { geographyService } from '../../../features/donor-management/services/geographyService.js';

/**
 * Reusable API-connected Multi-Select for States/UTs + "All". Option values
 * are numeric state ids (geographyService.listStates() already maps
 * {value: state.id, label: state.stateName}) — every consumer sends these
 * straight through as stateIds, not names.
 *
 * "All" has two possible meanings depending on the consumer:
 *  - `allMeansEmpty` (default): "All" means unrestricted — the field submits
 *    as an empty list (e.g. a fund profile with no geography restriction).
 *  - `allSelectsEverything`: "All" is a shortcut that expands to literally
 *    every state id (e.g. donations, whose stateIds is required to be
 *    non-empty — there is no "unrestricted" concept to fall back to).
 */
export function GeographyMultiSelect({
  name = 'selectedGeographies',
  control,
  label = 'Geography name',
  required = false,
  helperText,
  allSelectsEverything = false,
}) {
  const { data: apiStates } = useQuery({
    queryKey: ['geography', 'states'],
    queryFn: () => geographyService.listStates(),
    staleTime: 1000 * 60 * 60,
  });

  const options = useMemo(() => [
    { value: 'ALL', label: 'All (Spendable anywhere)' },
    ...(apiStates || []),
  ], [apiStates]);

  // "All" is exclusive of specific states either way: picking it drops
  // whatever states were already selected, and picking a state while "All"
  // is active drops "All" rather than silently keeping both (the mapper would
  // otherwise treat the selection as "All" and discard the states unnoticed).
  const transformSelection = (values, previousValues) => {
    if (allSelectsEverything) {
      return values.includes('ALL') ? (apiStates || []).map((s) => s.value) : values;
    }
    const hadAll = (previousValues || []).includes('ALL');
    const hasAll = values.includes('ALL');
    if (hasAll && !hadAll) {
      return ['ALL'];
    }
    if (hasAll && hadAll && values.length > 1) {
      return values.filter((v) => v !== 'ALL');
    }
    return values;
  };

  const defaultHelperText = allSelectsEverything
    ? "Select Indian states / UTs, or select All to apply every state"
    : "Select Indian states / UTs, or select All (defaults to 'No geographies — spendable anywhere' if left blank)";

  return (
    <RhfMultiSelect
      name={name}
      control={control}
      label={label}
      options={options}
      required={required}
      helperText={helperText ?? defaultHelperText}
      transformSelection={transformSelection}
    />
  );
}
