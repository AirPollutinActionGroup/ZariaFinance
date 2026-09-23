package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.EightyGStatus;
import com.ngo.finance.donation.enums.RecognitionStatus;
import com.ngo.finance.donation.enums.TenBeStatus;
import com.ngo.finance.donation.enums.UtilisationPeriodType;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.FundMode;
import com.ngo.finance.programme.entity.Programme;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "donation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "donor", "programme", "locations", "gikItems", "corpusDetail",
                "recurringMandate", "payrollBatch", "legacyDetail" }, callSuper = true)
@ToString(exclude = { "donor", "programme", "locations", "gikItems", "corpusDetail",
                "recurringMandate", "payrollBatch", "legacyDetail" })
public class Donation extends AuditEntity {

        @Column(nullable = false, unique = true, length = 30)
        private String donationCode;

        @ManyToOne
        @JoinColumn(name = "donor_id", foreignKey = @ForeignKey(name = "fk_donation_donor"))
        private DonorMaster donor;

        @Column(nullable = false, length = 30)
        @Enumerated(EnumType.STRING)
        private DonationType donationType;

        @Column(name = "amount", nullable = false, precision = 19, scale = 2)
        private BigDecimal amount;

        @Column(name = "fund_mode", nullable = false, length = 20)
        @Enumerated(EnumType.STRING)
        private FundMode fundMode;

        @Column(name = "fund_class", length = 30)
        @Enumerated(EnumType.STRING)
        private FundClass fundClass;

        @ManyToOne
        @JoinColumn(name = "programme_id", foreignKey = @ForeignKey(name = "fk_donation_programme"))
        private Programme programme;

        @Column(name = "is_conditional_gift", nullable = false)
        @Builder.Default
        private Boolean isConditionalGift = false;

        @Column(name = "condition_description", columnDefinition = "TEXT")
        private String conditionDescription;

        @Column(name = "utilisation_period_type", nullable = false, length = 20)
        @Enumerated(EnumType.STRING)
        private UtilisationPeriodType utilisationPeriodType;

        @Column(name = "utilisation_start_date")
        private LocalDate utilisationStartDate;

        @Column(name = "utilisation_end_date")
        private LocalDate utilisationEndDate;


        

        @Column(name = "recognition_status", nullable = false, length = 20)
        @Enumerated(EnumType.STRING)
        private RecognitionStatus recognitionStatus;

        // ── Tax & receipting — all computed server-side, never user-set ────────
        @Column(name = "eighty_g_status", nullable = false, length = 40)
        @Enumerated(EnumType.STRING)
        private EightyGStatus eightyGStatus;

        @Column(name = "eighty_g_receipt_number", length = 30)
        private String eightyGReceiptNumber;

        @Column(name = "eighty_g_issued_at")
        private LocalDateTime eightyGIssuedAt;

        @Column(name = "ten_bd_reportable", nullable = false)
        private Boolean tenBdReportable;

        @Column(name = "ten_bd_failure_reason", length = 255)
        private String tenBdFailureReason;

        @Column(name = "ten_be_status", nullable = false, length = 30)
        @Enumerated(EnumType.STRING)
        private TenBeStatus tenBeStatus;

        @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private List<DonationLocation> locations = new ArrayList<>();

        @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private List<DonationGikItem> gikItems = new ArrayList<>();

        @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
        private DonationCorpusDetail corpusDetail;

        @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
        private DonationRecurringMandate recurringMandate;

        @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
        private DonationPayrollBatch payrollBatch;

        @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
        private DonationLegacyDetail legacyDetail;
}
