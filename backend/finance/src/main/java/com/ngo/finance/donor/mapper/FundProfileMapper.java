package com.ngo.finance.donor.mapper;

import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.response.FundProfileResponse;
import com.ngo.finance.donor.entity.DonorDisbursementRule;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorGeography;
import com.ngo.finance.donor.entity.DonorUtilisationRule;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for Donor Fund Profile ↔ DTOs.
 *
 * Hand-written (not MapStruct) because the profile owns three child collections
 * with parent back-references — clearer and less error-prone here than generated
 * mapping. The donor and programme associations are resolved in the service
 * (they need repository lookups) and are not touched here.
 */
@Component
public class FundProfileMapper {

    /** Build a new entity graph from the request. Donor & programme set by the service. */
    public DonorFundProfile toEntity(CreateFundProfileRequest request) {
        DonorFundProfile profile = DonorFundProfile.builder()
                .fundMode(request.getFundMode())
                .fundClassCode(request.getFundClassCode())
                .purpose(request.getPurpose())
                .programmeTied(request.getProgrammeTied())
                .reportingFrequency(request.getReportingFrequency())
                .adminAllowed(request.getAdminAllowed())
                .overheadLimitPercent(request.getOverheadLimitPercent())
                .movementAllowed(request.getMovementAllowed())
                .explanationRequired(request.getExplanationRequired())
                .onboardingComplete(request.getOnboardingComplete())
                .build();
        applyChildren(request, profile);
        return profile;
    }

    /** Update an existing entity's scalar fields and fully replace its child collections. */
    public void updateEntity(CreateFundProfileRequest request, DonorFundProfile profile) {
        profile.setFundMode(request.getFundMode());
        profile.setFundClassCode(request.getFundClassCode());
        profile.setPurpose(request.getPurpose());
        profile.setProgrammeTied(request.getProgrammeTied());
        profile.setReportingFrequency(request.getReportingFrequency());
        profile.setAdminAllowed(request.getAdminAllowed());
        profile.setOverheadLimitPercent(request.getOverheadLimitPercent());
        profile.setMovementAllowed(request.getMovementAllowed());
        profile.setExplanationRequired(request.getExplanationRequired());
        profile.setOnboardingComplete(request.getOnboardingComplete());

        // orphanRemoval on the collections deletes rows dropped from these lists.
        profile.getGeographies().clear();
        profile.getUtilisationRules().clear();
        profile.getDisbursementRules().clear();
        applyChildren(request, profile);
    }

    private void applyChildren(CreateFundProfileRequest request, DonorFundProfile profile) {
        if (request.getGeographies() != null) {
            for (CreateFundProfileRequest.GeographyItem g : request.getGeographies()) {
                profile.getGeographies().add(DonorGeography.builder()
                        .fundProfile(profile)
                        .geographyName(g.getGeographyName())
                        .build());
            }
        }
        if (request.getUtilisationRules() != null) {
            for (CreateFundProfileRequest.UtilisationRuleItem u : request.getUtilisationRules()) {
                profile.getUtilisationRules().add(DonorUtilisationRule.builder()
                        .fundProfile(profile)
                        .ruleType(u.getRuleType())
                        .limitPercentage(u.getLimitPercentage())
                        .description(u.getDescription())
                        .build());
            }
        }
        if (request.getDisbursementRules() != null) {
            for (CreateFundProfileRequest.DisbursementRuleItem d : request.getDisbursementRules()) {
                profile.getDisbursementRules().add(DonorDisbursementRule.builder()
                        .fundProfile(profile)
                        .ruleType(d.getRuleType())
                        .releaseTrigger(d.getReleaseTrigger())
                        .minPriorUtilisationRequired(d.getMinPriorUtilisationRequired())
                        .milestoneRequired(d.getMilestoneRequired())
                        .ruleDescription(d.getRuleDescription())
                        .build());
            }
        }
    }

    public FundProfileResponse toResponse(DonorFundProfile p) {
        List<FundProfileResponse.GeographyItem> geos = p.getGeographies().stream()
                .map(g -> FundProfileResponse.GeographyItem.builder()
                        .id(g.getId())
                        .geographyName(g.getGeographyName())
                        .build())
                .toList();

        List<FundProfileResponse.UtilisationRuleItem> utils = p.getUtilisationRules().stream()
                .map(u -> FundProfileResponse.UtilisationRuleItem.builder()
                        .id(u.getId())
                        .ruleType(u.getRuleType())
                        .limitPercentage(u.getLimitPercentage())
                        .description(u.getDescription())
                        .build())
                .toList();

        List<FundProfileResponse.DisbursementRuleItem> disbs = p.getDisbursementRules().stream()
                .map(d -> FundProfileResponse.DisbursementRuleItem.builder()
                        .id(d.getId())
                        .ruleType(d.getRuleType())
                        .releaseTrigger(d.getReleaseTrigger())
                        .minPriorUtilisationRequired(d.getMinPriorUtilisationRequired())
                        .milestoneRequired(d.getMilestoneRequired())
                        .ruleDescription(d.getRuleDescription())
                        .build())
                .toList();

        return FundProfileResponse.builder()
                .id(p.getId())
                .donorId(p.getDonor() != null ? p.getDonor().getId() : null)
                .donorName(p.getDonor() != null ? p.getDonor().getDonorName() : null)
                .fundMode(p.getFundMode())
                .fundClassCode(p.getFundClassCode())
                .purpose(p.getPurpose())
                .programmeTied(p.getProgrammeTied())
                .programmeId(p.getProgramme() != null ? p.getProgramme().getId() : null)
                .programmeName(p.getProgramme() != null ? p.getProgramme().getProgrammeName() : null)
                .reportingFrequency(p.getReportingFrequency())
                .adminAllowed(p.getAdminAllowed())
                .overheadLimitPercent(p.getOverheadLimitPercent())
                .movementAllowed(p.getMovementAllowed())
                .explanationRequired(p.getExplanationRequired())
                .onboardingComplete(p.getOnboardingComplete())
                .geographies(geos)
                .utilisationRules(utils)
                .disbursementRules(disbs)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
