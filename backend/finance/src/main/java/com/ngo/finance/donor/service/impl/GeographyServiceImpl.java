package com.ngo.finance.donor.service.impl;

import com.ngo.finance.donor.dto.response.CityLookupResponse;
import com.ngo.finance.donor.dto.response.CountryLookupResponse;
import com.ngo.finance.donor.dto.response.StateLookupResponse;
import com.ngo.finance.donor.entity.CityMaster;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.CountryRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.donor.service.GeographyService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class GeographyServiceImpl implements GeographyService {

    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    @Override
    public List<CountryLookupResponse> getActiveCountries() {
        return countryRepository.findByIsActive(true).stream()
                .map(country -> CountryLookupResponse.builder()
                        .id(country.getId())
                        .countryCode(country.getCountryCode())
                        .countryName(country.getCountryName())
                        .build())
                .toList();
    }

    @Override
    public List<StateLookupResponse> getActiveStates() {
        return stateRepository.findByIsActive(true).stream()
                .map(this::toLookupResponse)
                .toList();
    }

    @Override
    public List<StateLookupResponse> getActiveStatesByCountry(Long countryId) {
        return stateRepository.findByCountryIdAndIsActive(countryId, true).stream()
                .map(this::toLookupResponse)
                .toList();
    }

    private StateLookupResponse toLookupResponse(StateMaster state) {
        return StateLookupResponse.builder()
                .id(state.getId())
                .stateCode(state.getStateCode())
                .stateName(state.getStateName())
                .build();
    }

    @Override
    public List<CityLookupResponse> getActiveCities() {
        return cityRepository.findByIsActive(true).stream()
                .map(this::toLookupResponse)
                .toList();
    }

    @Override
    public List<CityLookupResponse> getActiveCitiesByState(Long stateId) {
        return cityRepository.findActiveCitiesByStateId(stateId).stream()
                .map(this::toLookupResponse)
                .toList();
    }

    @Override
    public List<CityLookupResponse> getActiveCitiesByDistrict(Long districtId) {
        return cityRepository.findByDistrictIdAndIsActive(districtId, true).stream()
                .map(this::toLookupResponse)
                .toList();
    }

    private CityLookupResponse toLookupResponse(CityMaster city) {
        return CityLookupResponse.builder()
                .id(city.getId())
                .cityCode(city.getCityCode())
                .cityName(city.getCityName())
                .build();
    }

}
