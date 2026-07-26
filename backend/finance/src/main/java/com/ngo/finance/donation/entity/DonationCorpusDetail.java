package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.InvestmentMode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Corpus-only detail. Written donor direction is mandatory — a corpus gift
 * without a specific letter calling it out as corpus is not corpus.
 */
@Entity
@Table(name = "donation_corpus_detail")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "donation", callSuper = true)
@ToString(exclude = "donation")
public class DonationCorpusDetail extends AuditEntity {

    @OneToOne
    @JoinColumn(name = "donation_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_corpus_detail_donation"))
    private Donation donation;

    @Column(name = "written_direction_ref", nullable = false, length = 255)
    private String writtenDirectionRef;

    @Column(name = "direction_date", nullable = false)
    private LocalDate directionDate;

    @Column(name = "direction_document_path", nullable = false, length = 500)
    private String directionDocumentPath;

    @Column(name = "investment_mode", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private InvestmentMode investmentMode;
}
