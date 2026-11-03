package com.ngo.finance.fundsuggestion.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.fundsuggestion.service.RankingWeights;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** The saved fund suggestion weights — a single row (see V122). */
@Entity
@Table(name = "fund_suggestion_weights")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundSuggestionWeights extends AuditEntity {

    @Column(name = "programme_match", nullable = false)
    private Integer programmeMatch;

    @Column(name = "covers_amount", nullable = false)
    private Integer coversAmount;

    @Column(name = "restricted_for_programme", nullable = false)
    private Integer restrictedForProgramme;

    @Column(name = "expiry_max", nullable = false)
    private Integer expiryMax;

    @Column(name = "has_grant", nullable = false)
    private Integer hasGrant;

    @Column(nullable = false)
    private Integer unrestricted;

    @Column(name = "expiry_window_days", nullable = false)
    private Integer expiryWindowDays;

    @Column(name = "change_reason", length = 500)
    private String changeReason;

    public RankingWeights toWeights() {
        return new RankingWeights(programmeMatch, coversAmount, restrictedForProgramme, expiryMax, hasGrant,
                unrestricted, expiryWindowDays);
    }

    public void apply(RankingWeights w) {
        programmeMatch = w.programmeMatch();
        coversAmount = w.coversAmount();
        restrictedForProgramme = w.restrictedForProgramme();
        expiryMax = w.expiryMax();
        hasGrant = w.hasGrant();
        unrestricted = w.unrestricted();
        expiryWindowDays = w.expiryWindowDays();
    }
}
