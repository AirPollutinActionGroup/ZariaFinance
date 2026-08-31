package com.ngo.finance.vendorRegister.api;

import com.ngo.finance.vendorRegister.dto.request.CreateVendorRequest;
import com.ngo.finance.vendorRegister.dto.response.VendorResponse;
import com.ngo.finance.vendorRegister.service.VendorRegisterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Vendor / Supplier Register operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/vendors")
@Tag(name = "Vendor Register", description = "Vendor / Supplier Registration APIs")
public class VendorRegisterController {

    private final VendorRegisterService vendorRegisterService;

    @PostMapping
    @Operation(summary = "Register a new vendor")
    public ResponseEntity<VendorResponse> createVendor(@Valid @RequestBody CreateVendorRequest request) {
        log.info("POST /api/v1/vendors - Registering new vendor");
        VendorResponse response = vendorRegisterService.createVendor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vendor by ID")
    public ResponseEntity<VendorResponse> getVendor(@PathVariable Long id) {
        log.info("GET /api/v1/vendors/{} - Fetching vendor", id);
        return ResponseEntity.ok(vendorRegisterService.getVendorById(id));
    }

    @GetMapping
    @Operation(summary = "Get all vendors")
    public ResponseEntity<List<VendorResponse>> getAllVendors(@RequestParam(required = false) String search) {
        log.info("GET /api/v1/vendors - Fetching all vendors");
        List<VendorResponse> response = (search != null && !search.isBlank())
                ? vendorRegisterService.searchVendors(search)
                : vendorRegisterService.getAllVendors();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a vendor")
    public ResponseEntity<Void> activateVendor(@PathVariable Long id) {
        log.info("PATCH /api/v1/vendors/{}/activate - Activating vendor", id);
        vendorRegisterService.activateVendor(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a vendor")
    public ResponseEntity<Void> deactivateVendor(@PathVariable Long id) {
        log.info("PATCH /api/v1/vendors/{}/deactivate - Deactivating vendor", id);
        vendorRegisterService.deactivateVendor(id);
        return ResponseEntity.noContent().build();
    }
}
