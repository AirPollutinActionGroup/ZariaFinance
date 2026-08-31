package com.ngo.finance.vendorRegister.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.vendorRegister.dto.request.CreateVendorRequest;
import com.ngo.finance.vendorRegister.dto.response.VendorResponse;
import com.ngo.finance.vendorRegister.entity.VendorRegister;
import com.ngo.finance.vendorRegister.mapper.VendorMapper;
import com.ngo.finance.vendorRegister.repository.VendorRegisterRepository;
import com.ngo.finance.vendorRegister.service.VendorRegisterService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Vendor / Supplier Register operations.
 *
 * <p>Entity-type-conditional field requirements mirror the frontend's Zod
 * {@code superRefine} in {@code vendorCreateSchema.js} field-for-field, since
 * they cannot be expressed as static Bean Validation annotations on the
 * request DTO.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class VendorRegisterServiceImpl implements VendorRegisterService {

    private static final Pattern GST_REGEX =
            Pattern.compile("[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]");
    private static final Pattern AADHAAR_REGEX = Pattern.compile("\\d{12}");

    private final VendorRegisterRepository vendorRegisterRepository;

    private final VendorMapper vendorMapper;

    @Override
    public VendorResponse createVendor(CreateVendorRequest request) {
        log.info("Registering new vendor: {}", request.getLegalName());

        if (vendorRegisterRepository.existsByPanNumber(request.getPanNumber())) {
            throw new ValidationException("A vendor with PAN '" + request.getPanNumber() + "' already exists");
        }

        Map<String, String> errors = validateConditionalFields(request);
        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed for one or more fields", errors);
        }

        VendorRegister vendor = vendorMapper.toEntity(request);
        vendor.setStatus(true);

        VendorRegister saved = vendorRegisterRepository.save(vendor);
        saved.setVendorCode(String.format("VEN-%03d", saved.getId()));
        saved = vendorRegisterRepository.save(saved);

        log.info("Vendor registered successfully with id: {}", saved.getId());
        return vendorMapper.toResponse(saved);
    }

    /** Mirrors vendorCreateSchema.js's superRefine — collects every failure rather than failing fast. */
    private Map<String, String> validateConditionalFields(CreateVendorRequest request) {
        Map<String, String> errors = new HashMap<>();
        boolean isIndividual = "Individual".equals(request.getEntityType());

        if (isIndividual) {
            String aadhaar = request.getAadhaarNumber();
            if (aadhaar == null || !AADHAAR_REGEX.matcher(aadhaar).matches()) {
                errors.put("aadhaarNumber", "Enter a valid 12-digit Aadhaar number");
            }
            return errors;
        }

        String hasIncorporation = request.getHasIncorporationCertificate();
        if (!"Yes".equals(hasIncorporation) && !"No".equals(hasIncorporation)) {
            errors.put("hasIncorporationCertificate", "Select whether an Incorporation Certificate is available");
        } else if ("Yes".equals(hasIncorporation)) {
            if (isBlank(request.getRegistrationNo()) || request.getRegistrationNo().trim().length() < 2) {
                errors.put("registrationNo", "CIN / Registration number is required");
            }
            if (request.getDateOfIncorporation() == null) {
                errors.put("dateOfIncorporation", "Date of incorporation is required");
            }
        }

        String hasGst = request.getHasGstRegistration();
        if (!"Yes".equals(hasGst) && !"No".equals(hasGst)) {
            errors.put("hasGstRegistration", "Select whether the vendor is GST registered");
        } else if ("Yes".equals(hasGst)) {
            if (isBlank(request.getGstNumber()) || !GST_REGEX.matcher(request.getGstNumber()).matches()) {
                errors.put("gstNumber", "Enter a valid GSTIN");
            }
            if (isBlank(request.getGstRegistrationType())) {
                errors.put("gstRegistrationType", "GST registration type is required");
            }
        }

        String hasMsme = request.getHasMsmeRegistration();
        if (!"Yes".equals(hasMsme) && !"No".equals(hasMsme)) {
            errors.put("hasMsmeRegistration", "Select whether the vendor is MSME registered");
        } else if ("Yes".equals(hasMsme)) {
            if (isBlank(request.getUdyamNumber()) || request.getUdyamNumber().trim().length() < 2) {
                errors.put("udyamNumber", "Udyam / MSME number is required");
            }
            if (isBlank(request.getEnterpriseClassification())) {
                errors.put("enterpriseClassification", "Enterprise classification is required");
            }
        }

        return errors;
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public VendorResponse getVendorById(Long id) {
        log.debug("Fetching vendor with id: {}", id);
        VendorRegister vendor = vendorRegisterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
        return vendorMapper.toResponse(vendor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponse> getAllVendors() {
        log.debug("Fetching all vendors");
        return vendorRegisterRepository.findAll().stream()
                .map(vendorMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponse> searchVendors(String searchTerm) {
        log.debug("Searching vendors with term: {}", searchTerm);
        return vendorRegisterRepository.searchVendors(searchTerm).stream()
                .map(vendorMapper::toResponse)
                .toList();
    }

    @Override
    public void activateVendor(Long id) {
        log.info("Activating vendor with id: {}", id);
        VendorRegister vendor = vendorRegisterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
        vendor.setStatus(true);
        vendorRegisterRepository.save(vendor);
        log.info("Vendor activated successfully");
    }

    @Override
    public void deactivateVendor(Long id) {
        log.info("Deactivating vendor with id: {}", id);
        VendorRegister vendor = vendorRegisterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
        vendor.setStatus(false);
        vendorRegisterRepository.save(vendor);
        log.info("Vendor deactivated successfully");
    }
}
