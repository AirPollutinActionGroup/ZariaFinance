import { useState, useEffect } from 'react';
import { geographyService } from '../services/geographyService.js';

export function useGeographyCascade(setValue) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Check if selected country is India
  const isIndia =
    selectedCountry?.label?.toLowerCase() === 'india' ||
    selectedCountry?.value === 'INDIA_ID_OR_NAME' ||
    (typeof selectedCountry === 'string' && selectedCountry.toLowerCase() === 'india');

  // 1. Fetch Countries on Mount
  useEffect(() => {
    geographyService
      .listCountries()
      .then(setCountries)
      .catch((err) => console.error('Error loading countries:', err));
  }, []);

  // 2. Fetch States when Country changes
  useEffect(() => {
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);
    if (setValue) {
      setValue('stateId', '');
      setValue('cityId', '');
    }

    if (selectedCountry && isIndia) {
      const countryId = selectedCountry?.value || selectedCountry;
      setLoadingStates(true);
      geographyService
        .listStates(countryId)
        .then((data) => setStates(data || []))
        .catch(() => setStates([]))
        .finally(() => setLoadingStates(false));
    }
  }, [selectedCountry, isIndia, setValue]);

  // 3. Fetch Cities when State changes
  useEffect(() => {
    setSelectedCity(null);
    setCities([]);
    if (setValue) {
      setValue('cityId', '');
    }

    if (selectedState && isIndia) {
      const stateId = selectedState?.value || selectedState;
      setLoadingCities(true);
      geographyService
        .listCities(stateId)
        .then((data) => setCities(data || []))
        .catch(() => setCities([]))
        .finally(() => setLoadingCities(false));
    }
  }, [selectedState, isIndia, setValue]);

  const handleCountryChange = (val) => {
    setSelectedCountry(val);
    if (setValue) {
      const countryVal = typeof val === 'string' ? val : val?.value || '';
      setValue('countryId', countryVal);
    }
  };

  const handleStateChange = (val) => {
    setSelectedState(val);
    if (setValue) {
      const stateVal = typeof val === 'string' ? val : val?.value || '';
      setValue('stateId', stateVal);
    }
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
