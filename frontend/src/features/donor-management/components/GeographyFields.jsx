import { Grid } from '@mui/material';
import { SearchableSelect } from '../../../components/SearchableSelect.jsx';
import { useGeographyCascade } from '../hooks/useGeographyCascade.js';

export function GeographyFields({ setValue, errors }) {
  const {
    countries,
    states,
    cities,
    selectedCountry,
    setSelectedCountry,
    selectedState,
    setSelectedState,
    selectedCity,
    setSelectedCity,
    loadingStates,
    loadingCities,
  } = useGeographyCascade(setValue);

  return (
    <>
      {/* 1. Country */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <SearchableSelect
          id="country"
          label="Country"
          options={countries}
          value={selectedCountry}
          onChange={setSelectedCountry}
          error={errors?.countryId?.message || errors?.country?.message}
        />
      </Grid>

      {/* 2. State */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <SearchableSelect
          id="state"
          label="State"
          options={states}
          freeSolo={true}
          value={selectedState}
          onChange={setSelectedState}
          loading={loadingStates}
          disabled={!selectedCountry}
          error={errors?.stateId?.message || errors?.state?.message}
        />
      </Grid>

      {/* 3. City */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <SearchableSelect
          id="city"
          label="City"
          options={cities}
          freeSolo={true}
          value={selectedCity}
          onChange={setSelectedCity}
          loading={loadingCities}
          disabled={!selectedCountry}
          error={errors?.cityId?.message || errors?.city?.message}
        />
      </Grid>
    </>
  );
}
