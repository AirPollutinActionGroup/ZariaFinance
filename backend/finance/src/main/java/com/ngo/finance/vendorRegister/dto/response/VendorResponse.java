package com.ngo.finance.vendorRegister.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Vendor / Supplier Register
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VendorResponse {

    private Long id;

    private String vendorCode;

    private String entityType;

    private String legalName;

    private String hasIncorporationCertificate;

    private LocalDate dateOfIncorporation;

    private String registrationNo;

    private String aadhaarNumber;

    private String panNumber;

    private String hasGstRegistration;

    private String gstNumber;

    private String gstRegistrationType;

    private String tanNumber;

    private String hasMsmeRegistration;

    private String udyamNumber;

    private String enterpriseClassification;

    private String tdsSection;

    private String accountNumber;

    private String ifscCode;

    private String accountHolderName;

    private String bankName;

    private String branchName;

    private String paymentMode;

    private String contactName;

    private String phoneNumber;

    private String contactEmail;

    private String registeredAddress;

    private String state;

    private String pincode;

    private String vendorCategory;

    private String relatedParty;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
