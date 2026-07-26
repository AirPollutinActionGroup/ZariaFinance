package com.ngo.finance.fx.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Reads the RBI reference rate from a configured JSON feed.
 *
 * Disabled by default: the RBI publishes reference rates without a stable public
 * JSON contract, so the feed URL, the field holding the rate and the field
 * holding the date are all configuration rather than assumptions baked into code.
 * Point {@code zaria.fx.rbi.url} at the feed your finance team actually signs
 * against and set {@code zaria.fx.rbi.enabled=true}; until then lookups fall back
 * to the cached {@code fx_rate} rows.
 *
 * The URL may contain {@code {currency}} and {@code {date}} placeholders, e.g.
 * {@code https://example.org/rbi/reference-rate?currency={currency}&date={date}}.
 */
@Slf4j
@Component
public class RbiFxRateProvider implements FxRateProvider {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;

    private final boolean enabled;
    private final String urlTemplate;
    private final String rateField;
    private final RestClient restClient;

    public RbiFxRateProvider(
            @Value("${zaria.fx.rbi.enabled:false}") boolean enabled,
            @Value("${zaria.fx.rbi.url:}") String urlTemplate,
            @Value("${zaria.fx.rbi.rate-field:rate}") String rateField) {
        this.enabled = enabled;
        this.urlTemplate = urlTemplate;
        this.rateField = rateField;
        this.restClient = RestClient.create();
    }

    @Override
    public Optional<BigDecimal> fetchRate(String currency, LocalDate date) {
        if (!enabled || urlTemplate == null || urlTemplate.isBlank()) {
            return Optional.empty();
        }

        String url = urlTemplate
                .replace("{currency}", currency)
                .replace("{date}", ISO.format(date));
        try {
            JsonNode body = restClient.get().uri(url).retrieve().body(JsonNode.class);
            if (body == null) {
                return Optional.empty();
            }
            JsonNode rate = body.at("/" + rateField.replace('.', '/'));
            if (rate.isMissingNode() || !rate.isNumber()) {
                log.warn("RBI feed response had no numeric '{}' field for {} on {}", rateField, currency, date);
                return Optional.empty();
            }
            return Optional.of(rate.decimalValue());
        } catch (Exception e) {
            // A rate lookup must never block saving a grant — the form stays editable.
            log.warn("RBI rate lookup failed for {} on {}: {}", currency, date, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public String sourceName() {
        return "RBI";
    }
}
