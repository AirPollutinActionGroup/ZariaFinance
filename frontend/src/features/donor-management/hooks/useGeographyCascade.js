import { useState, useEffect } from 'react';
import { geographyService } from '../services/geographyService.js';

function isCountryIndia(country) {
  return (
    country?.label?.toLowerCase() === 'india' ||
    country?.value === 'INDIA_ID_OR_NAME' ||
    (typeof country === 'string' && country.toLowerCase() === 'india')
  );
}

export function useGeographyCascade(setValue, isDomestic = false) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // 1. Fetch Countries on Mount & handle isDomestic
  useEffect(() => {
    geographyService
      .listCountries()
      .then((data) => {
        setCountries(data || []);
        if (isDomestic) {
          const india = (data || []).find((c) => isCountryIndia(c)) || { value: 1, label: 'India' };
          setSelectedCountry(india);
          if (setValue) {
            const countryVal = typeof india === 'string' ? india : india?.value || '';
            setValue('countryId', countryVal);
          }
          setStates([]);
          const countryId = india?.value || india;
          setLoadingStates(true);
          geographyService
            .listStates(countryId)
            .then((statesData) => setStates(statesData || []))
            .catch(() => setStates([]))
            .finally(() => setLoadingStates(false));
        }
      })
      .catch((err) => console.error('Error loading countries:', err));
  }, [isDomestic, setValue]);

  // Fetch states for a given country, replacing whatever was loaded before.
  const loadStatesFor = (country) => {
    setStates([]);
    if (country && isCountryIndia(country)) {
      const countryId = country?.value || country;
      setLoadingStates(true);
      geographyService
        .listStates(countryId)
        .then((data) => setStates(data || []))
        .catch(() => setStates([]))
        .finally(() => setLoadingStates(false));
    }
  };

  // Fetch cities for a given state, replacing whatever was loaded before.
  const loadCitiesFor = (state) => {
    setCities([]);
    if (state && isCountryIndia(selectedCountry)) {
      const stateId = state?.value || state;
      setLoadingCities(true);
      geographyService
        .listCities(stateId)
        .then((data) => setCities(data || []))
        .catch(() => setCities([]))
        .finally(() => setLoadingCities(false));
    }
  };

  const handleCountryChange = (val) => {
    setSelectedCountry(val);
    setSelectedState(null);
    setSelectedCity(null);
    if (setValue) {
      const countryVal = typeof val === 'string' ? val : val?.value || '';
      setValue('countryId', countryVal);
      setValue('stateId', '');
      setValue('cityId', '');
    }
    loadStatesFor(val);
  };

  const handleStateChange = (val) => {
    setSelectedState(val);
    setSelectedCity(null);
    if (setValue) {
      const stateVal = typeof val === 'string' ? val : val?.value || '';
      setValue('stateId', stateVal);
      setValue('cityId', '');
    }
    loadCitiesFor(val);
  };

  const handleCityChange = (val) => {
    setSelectedCity(val);
    if (setValue) {
      const cityVal = typeof val === 'string' ? val : val?.value || '';
      setValue('cityId', cityVal);
    }
  };

  return {
    countries,
    states,
    cities,
    selectedCountry,
    setSelectedCountry: handleCountryChange,
    selectedState,
    setSelectedState: handleStateChange,
    selectedCity,
    setSelectedCity: handleCityChange,
    loadingStates,
    loadingCities,
  };
}
