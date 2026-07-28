import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RhfMultiSelect } from './RhfMultiSelect.jsx';
import { geographyApi } from '../../../features/donor-management/api/geographyApi.js';

/**
 * Reusable API-connected Multi-Select for States/UTs + "All".
 * Fetches states directly from backend geographyApi.listStates().
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
    queryFn: () => geographyApi.listStates(),
    staleTime: 1000 * 60 * 60,
  });

  const options = useMemo(() => [
    { value: 'ALL', label: 'All (Spendable anywhere)' },
    ...(apiStates || []).map((s) => ({
      value: s.id,
      label: s.stateName || s.name || String(s.label || s.id),
    })),
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
