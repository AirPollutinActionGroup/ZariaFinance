package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Grant Rule entity - owned by GrantAgreement
 */
@Entity
@Table(name = "grant_rule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "grant", callSuper = true)
@ToString(exclude = "grant")
public class GrantRule extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "grant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_rule_grant"))
    private GrantAgreement grant;

    @Column(nullable = false, length = 50)
    private String ruleCode;

    @Column(nullable = false, length = 255)
    private String ruleName;

    @Column(nullable = false, length = 100)
    private String ruleType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String ruleDefinition;

    @Column(length = 500)
    private String ruleValue;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isMandatory = false;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String ruleStatus = "ACTIVE";
}
