package com.ngo.finance.donation.api;

import com.ngo.finance.donation.dto.request.TenantTaxConfigRequest;
import com.ngo.finance.donation.dto.response.TenantTaxConfigResponse;
import com.ngo.finance.donation.service.TenantTaxConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Manages the singleton org-level tax registration facts (80G validity,
 * Section 35, receipt sequence) the donation tax chain evaluates against.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/tenant/tax-config")
@Tag(name = "Tenant Tax Config", description = "Org-level 80G / Section 35 registration settings")
public class TenantTaxConfigController {

    private final TenantTaxConfigService tenantTaxConfigService;

    @Autowired
    public TenantTaxConfigController(TenantTaxConfigService tenantTaxConfigService) {
        this.tenantTaxConfigService = tenantTaxConfigService;
    }

    @GetMapping
    @Operation(summary = "Get the tenant tax configuration")
    public ResponseEntity<TenantTaxConfigResponse> getConfig() {
        return ResponseEntity.ok(tenantTaxConfigService.getConfig());
    }

    @PutMapping
    @Operation(summary = "Update the tenant tax configuration")
    public ResponseEntity<TenantTaxConfigResponse> updateConfig(@Valid @RequestBody TenantTaxConfigRequest request) {
        log.info("PUT /api/v1/tenant/tax-config - Updating tenant tax config");
        return ResponseEntity.ok(tenantTaxConfigService.updateConfig(request));
    }
}
