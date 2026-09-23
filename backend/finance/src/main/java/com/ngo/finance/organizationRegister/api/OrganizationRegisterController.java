package com.ngo.finance.organizationRegister.api;

import com.ngo.finance.organizationRegister.dto.request.CreateOrganizationRequest;
import com.ngo.finance.organizationRegister.dto.request.UpdateOrganizationRequest;
import com.ngo.finance.organizationRegister.dto.response.OrganizationResponse;
import com.ngo.finance.organizationRegister.service.OrganizationRegisterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Organisation Register operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/organisations")
@Tag(name = "Organisation Register", description = "Partner Organisation Registration APIs")
public class OrganizationRegisterController {

    private final OrganizationRegisterService organisationRegisterService;

    @PostMapping
    @Operation(summary = "Register a new organisation")
    public ResponseEntity<OrganizationResponse> createOrganisation(
            @Valid @RequestBody CreateOrganizationRequest request) {
        log.info("POST /api/v1/organisations - Registering new organisation");
        OrganizationResponse response = organisationRegisterService.createOrganisation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/verify-short-name")
    @Operation(summary = "Check whether an organisation short name is already taken")
    public ResponseEntity<Map<String, Object>> verifyShortName(@RequestParam String shortName) {
        log.info("GET /api/v1/organisations/verify-short-name - Checking short name: {}", shortName);
        boolean exists = organisationRegisterService.shortNameExists(shortName);

        Map<String, Object> response = new HashMap<>();
        response.put("shortName", shortName);
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get organisation by ID")
    public ResponseEntity<OrganizationResponse> getOrganisation(@PathVariable Long id) {
        log.info("GET /api/v1/organisations/{} - Fetching organisation", id);
        return ResponseEntity.ok(organisationRegisterService.getOrganisationById(id));
    }

    @GetMapping
    @Operation(summary = "Get all organisations")
    public ResponseEntity<List<OrganizationResponse>> getAllOrganisations(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/organisations - Fetching all organisations");
        List<OrganizationResponse> response = (search != null && !search.isBlank())
                ? organisationRegisterService.searchOrganisations(search)
                : organisationRegisterService.getAllOrganisations();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an organisation")
    public ResponseEntity<OrganizationResponse> updateOrganisation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrganizationRequest request) {
        log.info("PUT /api/v1/organisations/{} - Updating organisation", id);
        return ResponseEntity.ok(organisationRegisterService.updateOrganisation(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate an organisation")
    public ResponseEntity<Void> activateOrganisation(@PathVariable Long id) {
        log.info("PATCH /api/v1/organisations/{}/activate - Activating organisation", id);
        organisationRegisterService.activateOrganisation(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate an organisation")
    public ResponseEntity<Void> deactivateOrganisation(@PathVariable Long id) {
        log.info("PATCH /api/v1/organisations/{}/deactivate - Deactivating organisation", id);
        organisationRegisterService.deactivateOrganisation(id);
        return ResponseEntity.noContent().build();
    }
}
