import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RhfMultiSelect } from './RhfMultiSelect.jsx';
import { geographyService } from '../../../features/donor-management/services/geographyService.js';

/**
 * Reusable API-connected Multi-Select for States/UTs + "All". Option values
 * are numeric state ids (geographyService.listStates() already maps
 * {value: state.id, label: state.stateName}) — every consumer sends these
 * straight through as stateIds, not names.
 */
export function GeographyMultiSelect({
  name = 'selectedGeographies',
  control,
  label = 'Geography name',
  required = false,
  helperText = "Select Indian states / UTs, or select All (defaults to 'No geographies — spendable anywhere' if left blank)",
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

  return (
    <RhfMultiSelect
      name={name}
      control={control}
      label={label}
      options={options}
      required={required}
      helperText={helperText}
    />
  );
}
