package com.ngo.finance.vendorRegister.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity Type drives which identification, tax and document fields are
 * meaningful for a vendor (Individual vendors use Aadhaar in place of company
 * registration, and skip GST/TAN/Udyam) — enforced in the service layer.
 */
@Entity
@Table(name = "vendor_register")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorRegister extends AuditEntity {

    @Column(name = "vendor_code", unique = true, length = 20)
    private String vendorCode;

    @Column(name = "entity_type", nullable = false, length = 20)
    private String entityType;

    @Column(name = "legal_name", nullable = false, length = 255)
    private String legalName;

    @Column(name = "has_incorporation_certificate", length = 3)
    private String hasIncorporationCertificate;

    @Column(name = "date_of_incorporation")
    private LocalDate dateOfIncorporation;

    @Column(name = "registration_no", length = 50)
    private String registrationNo;

    @Column(name = "aadhaar_number", length = 12)
    private String aadhaarNumber;

    @Column(name = "pan_number", nullable = false, unique = true, length = 10)
    private String panNumber;

    @Column(name = "has_gst_registration", length = 3)
    private String hasGstRegistration;

    @Column(name = "gst_number", length = 15)
    private String gstNumber;

    @Column(name = "gst_registration_type", length = 20)
    private String gstRegistrationType;

    @Column(name = "tan_number", length = 10)
    private String tanNumber;

    @Column(name = "has_msme_registration", length = 3)
    private String hasMsmeRegistration;

    @Column(name = "udyam_number", length = 30)
    private String udyamNumber;

    @Column(name = "enterprise_classification", length = 10)
    private String enterpriseClassification;

    @Column(name = "tds_section", nullable = false, length = 5)
    private String tdsSection;

    @Column(name = "account_number", nullable = false, length = 30)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 11)
    private String ifscCode;

    @Column(name = "account_holder_name", nullable = false, length = 255)
    private String accountHolderName;

    @Column(name = "bank_name", length = 255)
    private String bankName;

    @Column(name = "branch_name", length = 255)
    private String branchName;

    @Column(name = "payment_mode", nullable = false, length = 10)
    private String paymentMode;

    @Column(name = "contact_name", nullable = false, length = 255)
    private String contactName;

    @Column(name = "phone_number", nullable = false, length = 10)
    private String phoneNumber;

    @Column(name = "contact_email", nullable = false, length = 255)
    private String contactEmail;

    @Column(name = "registered_address", nullable = false, columnDefinition = "TEXT")
    private String registeredAddress;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 6)
    private String pincode;

    @Column(name = "vendor_category", nullable = false, length = 30)
    private String vendorCategory;

    @Column(name = "related_party", nullable = false, length = 3)
    private String relatedParty;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;
}
