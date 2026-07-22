package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.response.CityLookupResponse;
import com.ngo.finance.donor.dto.response.CountryLookupResponse;
import com.ngo.finance.donor.dto.response.StateLookupResponse;
import com.ngo.finance.donor.service.GeographyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/geography")
@RequiredArgsConstructor
@Tag(name = "Geography", description = "Geography Master Lookup APIs")
public class GeographyController {

    private final GeographyService geographyService;

    @GetMapping("/countries")
    @Operation(summary = "Get all active countries")
    public ResponseEntity<List<CountryLookupResponse>> getCountries() {
        log.info("GET /api/v1/geography/countries - Fetching active countries");
        return ResponseEntity.ok(geographyService.getActiveCountries());
    }

    @GetMapping("/states")
    @Operation(summary = "Get active states, optionally filtered by country")
    public ResponseEntity<List<StateLookupResponse>> getStates(@RequestParam(required = false) Long countryId) {
        log.info("GET /api/v1/geography/states - Fetching active states for countryId: {}", countryId);
        List<StateLookupResponse> states = countryId != null
                ? geographyService.getActiveStatesByCountry(countryId)
                : geographyService.getActiveStates();
        return ResponseEntity.ok(states);
    }

    @GetMapping("/cities")
    @Operation(summary = "Get active cities, optionally filtered by state")
    public ResponseEntity<List<CityLookupResponse>> getCities(@RequestParam(required = false) Long stateId) {
        log.info("GET /api/v1/geography/cities - Fetching active cities for stateId: {}", stateId);
        List<CityLookupResponse> cities = stateId != null
                ? geographyService.getActiveCitiesByState(stateId)
                : geographyService.getActiveCities();
        return ResponseEntity.ok(cities);
    }
}
