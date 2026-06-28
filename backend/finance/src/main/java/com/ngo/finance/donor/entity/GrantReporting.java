package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Grant Reporting entity - owned by GrantAgreement
 */
@Entity
@Table(name = "grant_reporting")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"grant", "schedule"}, callSuper = true)
@ToString(exclude = {"grant", "schedule"})
public class GrantReporting extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "grant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reporting_grant"))
    private GrantAgreement grant;

    @ManyToOne
    @JoinColumn(name = "reporting_schedule_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reporting_schedule"))
    private ReportingScheduleMaster schedule;

    @Column(nullable = false, length = 50)
    private String reportingFrequency;

    @Column(nullable = false)
    private Integer reportDueDays;

    @Column
    private LocalDateTime lastReportDate;

    @Column
    private LocalDateTime nextReportDate;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String reportingStatus = "PENDING";
}
