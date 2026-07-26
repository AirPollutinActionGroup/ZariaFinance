package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.response.CityLookupResponse;
import com.ngo.finance.donor.dto.response.CountryLookupResponse;
import com.ngo.finance.donor.dto.response.StateLookupResponse;
import java.util.List;

public interface GeographyService {

    List<CountryLookupResponse> getActiveCountries();

    List<StateLookupResponse> getActiveStates();

    List<StateLookupResponse> getActiveStatesByCountry(Long countryId);

    List<CityLookupResponse> getActiveCities();

    List<CityLookupResponse> getActiveCitiesByState(Long stateId);

    List<CityLookupResponse> getActiveCitiesByDistrict(Long districtId);
}
