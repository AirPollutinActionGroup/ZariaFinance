package com.ngo.finance.bankDetails.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.Book;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Bank details master entity — statutory bank accounts held by the
 * organisation, each associated with a domestic (LC) or foreign (FC) book.
 */
@Entity
@Table(name = "bank_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankDetail extends AuditEntity {

    @Column(nullable = false, length = 5)
    @Enumerated(EnumType.STRING)
    private Book book;

    @Column(nullable = false, length = 255)
    private String bankName;

    @Column(nullable = false, length = 30)
    private String accountNumber;

    @Column(nullable = false, length = 11)
    private String ifsc;

    @Column(nullable = false, length = 255)
    private String branchName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;
}
