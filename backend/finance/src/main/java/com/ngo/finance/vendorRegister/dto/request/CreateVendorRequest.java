package com.ngo.finance.vendorRegister.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new Vendor / Supplier.
 *
 * <p>Entity-type-conditional requirements (e.g. Aadhaar only for Individual;
 * CIN/GST/Udyam details only when their respective "has..." flag is Yes)
 * cannot be expressed as static Bean Validation annotations here, since they
 * depend on the value of another field — they are enforced in
 * {@code VendorRegisterServiceImpl} instead, mirroring the frontend's Zod
 * {@code superRefine} logic field-for-field.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVendorRequest {

    @NotBlank(message = "Entity type is required")
    @Pattern(
            regexp = "Individual|Proprietorship|Partnership|Pvt Ltd|LLP|Trust|Section 8",
            message = "Entity type is not a recognised value")
    private String entityType;

    @NotBlank(message = "Legal name is required")
    private String legalName;

    @Pattern(regexp = "Yes|No", message = "Must be Yes or No")
    private String hasIncorporationCertificate;

    private LocalDate dateOfIncorporation;

    private String registrationNo;

    @Pattern(regexp = "^$|\\d{12}", message = "Enter a valid 12-digit Aadhaar number")
    private String aadhaarNumber;

    @NotBlank(message = "PAN number is required")
    @Pattern(regexp = "[A-Z]{5}[0-9]{4}[A-Z]", message = "Enter a valid PAN (e.g. ABCDE1234F)")
    private String panNumber;

    @Pattern(regexp = "Yes|No", message = "Must be Yes or No")
    private String hasGstRegistration;

    @Pattern(regexp = "^$|[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]", message = "Enter a valid GSTIN")
    private String gstNumber;

    @Pattern(regexp = "^$|Regular|Composition|Unregistered|SEZ", message = "GST registration type is not a recognised value")
    private String gstRegistrationType;

    private String tanNumber;

    @Pattern(regexp = "Yes|No", message = "Must be Yes or No")
    private String hasMsmeRegistration;

    private String udyamNumber;

    @Pattern(regexp = "^$|Micro|Small|Medium", message = "Enterprise classification is not a recognised value")
    private String enterpriseClassification;

    @NotBlank(message = "TDS applicable section is required")
    @Pattern(regexp = "194C|194J", message = "TDS applicable section is not a recognised value")
    private String tdsSection;

    @NotBlank(message = "Account number is required")
    @Size(min = 4, message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "[A-Z]{4}0[A-Z0-9]{6}", message = "Enter a valid IFSC code")
    private String ifscCode;

    @NotBlank(message = "Account holder name is required")
    private String accountHolderName;

    private String bankName;

    private String branchName;

    @NotBlank(message = "Payment mode preference is required")
    private String paymentMode;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "\\d{10}", message = "Enter a valid 10-digit phone number")
    private String phoneNumber;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Enter a valid email address")
    private String contactEmail;

    @NotBlank(message = "Registered address is required")
    private String registeredAddress;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "\\d{6}", message = "Enter a valid 6-digit pincode")
    private String pincode;

    @NotBlank(message = "Vendor category is required")
    @Pattern(
            regexp = "Goods|Services|Consulting|Logistics|IT|Grantee-linked",
            message = "Vendor category is not a recognised value")
    private String vendorCategory;

    @NotBlank(message = "Select whether the vendor is a related party")
    @Pattern(regexp = "Yes|No", message = "Must be Yes or No")
    private String relatedParty;
}
