package com.ngo.finance.fx.api;

import com.ngo.finance.fx.dto.FxRateResponse;
import com.ngo.finance.fx.service.FxRateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Reference-rate lookups backing the grant form's FX field. */
@Slf4j
@RestController
@RequestMapping("/api/v1/fx-rates")
@Tag(name = "FX rates", description = "Reference exchange rates to INR")
public class FxRateController {

    private final FxRateService fxRateService;

    @Autowired
    public FxRateController(FxRateService fxRateService) {
        this.fxRateService = fxRateService;
    }

    /**
     * Always 200 — an unavailable rate comes back with a null {@code rateToInr}
     * so the form can fall back to manual entry without surfacing an error.
     */
    @GetMapping
    @Operation(summary = "Get the reference rate to INR for a currency on a date")
    public ResponseEntity<FxRateResponse> getRate(
            @RequestParam String currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.debug("GET /api/v1/fx-rates - currency={} date={}", currency, date);
        return ResponseEntity.ok(fxRateService.getRate(currency, date));
    }
}
