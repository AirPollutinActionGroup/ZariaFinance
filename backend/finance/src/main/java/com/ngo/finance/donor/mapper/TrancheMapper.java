package com.ngo.finance.donor.mapper;

import com.ngo.finance.donor.dto.request.CreateTrancheRequest;
import com.ngo.finance.donor.dto.response.TrancheResponse;
import com.ngo.finance.donor.entity.GrantTranche;
import org.springframework.stereotype.Component;

/**
 * Mapper for Grant Tranche ↔ DTOs (hand-written; the grant back-reference is set
 * by the service).
 */
@Component
public class TrancheMapper {

    public GrantTranche toEntity(CreateTrancheRequest request) {
        return GrantTranche.builder()
                .trancheNumber(request.getTrancheNumber())
                .trancheName(request.getTrancheName())
                .trancheAmount(request.getTrancheAmount())
                .plannedReleaseDate(request.getPlannedReleaseDate())
                .conditionsToRelease(request.getConditionsToRelease())
                .priorUtilisationRequired(request.getPriorUtilisationRequired())
                .trancheStatus("Expected")
                .conditionMet("Pending")
                .build();
    }

    public TrancheResponse toResponse(GrantTranche t) {
        return TrancheResponse.builder()
                .id(t.getId())
                .grantId(t.getGrant() != null ? t.getGrant().getId() : null)
                .trancheNumber(t.getTrancheNumber())
                .trancheName(t.getTrancheName())
                .trancheAmount(t.getTrancheAmount())
                .plannedReleaseDate(t.getPlannedReleaseDate())
                .actualAmount(t.getActualAmount())
                .actualReleaseDate(t.getActualReleaseDate())
                .conditionsToRelease(t.getConditionsToRelease())
                .priorUtilisationRequired(t.getPriorUtilisationRequired())
                .conditionMet(t.getConditionMet())
                .trancheStatus(t.getTrancheStatus())
                .build();
    }
}
