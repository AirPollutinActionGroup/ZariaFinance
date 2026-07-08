package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.response.CityLookupResponse;
import com.ngo.finance.donor.dto.response.StateLookupResponse;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.StateRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/geography")
@Tag(name = "Geography", description = "Geography Master Lookup APIs")
public class GeographyController {

    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    public GeographyController(StateRepository stateRepository, CityRepository cityRepository) {
        this.stateRepository = stateRepository;
        this.cityRepository = cityRepository;
    }

    @GetMapping("/states")
    @Operation(summary = "Get all active states")
    public ResponseEntity<List<StateLookupResponse>> getStates() {
        log.info("GET /api/v1/geography/states - Fetching active states");
        List<StateLookupResponse> states = stateRepository.findByIsActive(true).stream()
                .map(state -> StateLookupResponse.builder()
                        .id(state.getId())
                        .stateCode(state.getStateCode())
                        .stateName(state.getStateName())
                        .build())
                .toList();
        return ResponseEntity.ok(states);
    }

    @GetMapping("/cities")
    @Operation(summary = "Get active cities, optionally filtered by state")
    public ResponseEntity<List<CityLookupResponse>> getCities(@RequestParam(required = false) Long stateId) {
        log.info("GET /api/v1/geography/cities - Fetching active cities for stateId: {}", stateId);
        List<CityLookupResponse> cities;
        if (stateId != null) {
            cities = cityRepository.findActiveCitiesByStateId(stateId).stream()
                    .map(city -> CityLookupResponse.builder()
                            .id(city.getId())
                            .cityCode(city.getCityCode())
                            .cityName(city.getCityName())
                            .build())
                    .toList();
        } else {
            cities = cityRepository.findByIsActive(true).stream()
                    .map(city -> CityLookupResponse.builder()
                            .id(city.getId())
                            .cityCode(city.getCityCode())
                            .cityName(city.getCityName())
                            .build())
                    .toList();
        }
        return ResponseEntity.ok(cities);
    }
}
