package com.ngo.finance.donor.mapper;

import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.response.FundProfileResponse;
import com.ngo.finance.donor.entity.DonorDisbursementRule;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorTrancheDetail;
import com.ngo.finance.donor.entity.DonorUtilisationRule;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for Donor Fund Profile ↔ DTOs.
 *
 * Hand-written (not MapStruct) because the profile owns three child collections
 * with parent back-references — clearer and less error-prone here than generated
 * mapping. The donor, programme and spendable-location (state) associations are
 * resolved in the service (they need repository lookups) and are not touched
 * here.
 */
@Component
public class FundProfileMapper {

    /** Build a new entity graph from the request. Donor, programme & spendable
     *  locations are set by the service. */
    public DonorFundProfile toEntity(CreateFundProfileRequest request) {
        DonorFundProfile profile = DonorFundProfile.builder()
                .fundMode(request.getFundMode())
                .fundClassCode(request.getFundClassCode())
                .purpose(request.getPurpose())
                .programmeTied(request.getProgrammeTied())
                .reportingFrequency(request.getReportingFrequency())
                .movementAllowed(request.getMovementAllowed())
                .explanationRequired(request.getExplanationRequired())
                .onboardingComplete(request.getOnboardingComplete())
                .build();
        applyChildren(request, profile);
        return profile;
    }

    /** Update an existing entity's scalar fields and fully replace its rule
     *  collections (spendable locations are replaced by the service). */
    public void updateEntity(CreateFundProfileRequest request, DonorFundProfile profile) {
        profile.setFundMode(request.getFundMode());
        profile.setFundClassCode(request.getFundClassCode());
        profile.setPurpose(request.getPurpose());
        profile.setProgrammeTied(request.getProgrammeTied());
        profile.setReportingFrequency(request.getReportingFrequency());
        profile.setMovementAllowed(request.getMovementAllowed());
        profile.setExplanationRequired(request.getExplanationRequired());
        profile.setOnboardingComplete(request.getOnboardingComplete());

        // orphanRemoval on the collections deletes rows dropped from these lists.
        profile.getUtilisationRules().clear();
        profile.getDisbursementRules().clear();
        applyChildren(request, profile);
    }

    private void applyChildren(CreateFundProfileRequest request, DonorFundProfile profile) {
        if (request.getUtilisationRules() != null) {
            for (CreateFundProfileRequest.UtilisationRuleItem u : request.getUtilisationRules()) {
                profile.getUtilisationRules().add(DonorUtilisationRule.builder()
                        .fundProfile(profile)
                        .ruleType(u.getRuleType())
                        .otherRuleType(u.getOtherRuleType())
                        .limitPercentage(u.getLimitPercentage())
                        .description(u.getDescription())
                        .build());
            }
        }
        if (request.getDisbursementRules() != null) {
            for (CreateFundProfileRequest.DisbursementRuleItem d : request.getDisbursementRules()) {
                DonorDisbursementRule rule = DonorDisbursementRule.builder()
                        .fundProfile(profile)
                        .totalAmountCommitted(d.getTotalAmountCommitted())
                        .disbursementType(d.getDisbursementType())
                        .build();
                if (d.getTrancheDetail() != null) {
                    for (CreateFundProfileRequest.TrancheDetailItem t : d.getTrancheDetail()) {
                        rule.getTrancheDetail().add(DonorTrancheDetail.builder()
                                .disbursementRule(rule)
                                .amount(t.getAmount())
                                .frequency(t.getFrequency())
                                .isFinalTranche(t.getIsFinalTranche())
                                .releaseCriteria(t.getReleaseCriteria())
                                .releaseDate(t.getReleaseDate())
                                .milestoneName(t.getMilestoneName())
                                .signOfRole(t.getSignOfRole())
                                .otherSignOfRole(t.getOtherSignOfRole())
                                .targetDate(t.getTargetDate())
                                .utilisationPercentage(t.getUtilisationPercentage())
                                .triggerBase(t.getTriggerBase())
                                .description(t.getDescription())
                                .responsibleRole(t.getResponsibleRole())
                                .otherResponsibleRole(t.getOtherResponsibleRole())
                                .reminderLeadTime(t.getReminderLeadTime())
                                .repeatReminder(t.getRepeatReminder())
                                .escalateToDeputy(t.getEscalateToDeputy())
                                .build());
                    }
                }
                profile.getDisbursementRules().add(rule);
            }
        }
    }

    public FundProfileResponse toResponse(DonorFundProfile p) {
        List<FundProfileResponse.SpendableLocationItem> locations = p.getSpendableLocations().stream()
                .map(l -> FundProfileResponse.SpendableLocationItem.builder()
                        .id(l.getId())
                        .stateId(l.getState() != null ? l.getState().getId() : null)
                        .stateName(l.getState() != null ? l.getState().getStateName() : null)
                        .build())
                .toList();

        List<FundProfileResponse.UtilisationRuleItem> utils = p.getUtilisationRules().stream()
                .map(u -> FundProfileResponse.UtilisationRuleItem.builder()
                        .id(u.getId())
                        .ruleType(u.getRuleType())
                        .otherRuleType(u.getOtherRuleType())
                        .limitPercentage(u.getLimitPercentage())
                        .description(u.getDescription())
                        .build())
                .toList();

        List<FundProfileResponse.DisbursementRuleItem> disbs = p.getDisbursementRules().stream()
                .map(this::toDisbursementRuleItem)
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
                .movementAllowed(p.getMovementAllowed())
                .explanationRequired(p.getExplanationRequired())
                .onboardingComplete(p.getOnboardingComplete())
                .spendableLocations(locations)
                .utilisationRules(utils)
                .disbursementRules(disbs)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private FundProfileResponse.DisbursementRuleItem toDisbursementRuleItem(DonorDisbursementRule d) {
        List<FundProfileResponse.TrancheDetailItem> tranches = d.getTrancheDetail().stream()
                .map(t -> FundProfileResponse.TrancheDetailItem.builder()
                        .id(t.getId())
                        .amount(t.getAmount())
                        .frequency(t.getFrequency())
                        .isFinalTranche(t.getIsFinalTranche())
                        .releaseCriteria(t.getReleaseCriteria())
                        .releaseDate(t.getReleaseDate())
                        .milestoneName(t.getMilestoneName())
                        .signOfRole(t.getSignOfRole())
                        .otherSignOfRole(t.getOtherSignOfRole())
                        .targetDate(t.getTargetDate())
                        .utilisationPercentage(t.getUtilisationPercentage())
                        .triggerBase(t.getTriggerBase())
                        .description(t.getDescription())
                        .responsibleRole(t.getResponsibleRole())
                        .otherResponsibleRole(t.getOtherResponsibleRole())
                        .reminderLeadTime(t.getReminderLeadTime())
                        .repeatReminder(t.getRepeatReminder())
                        .escalateToDeputy(t.getEscalateToDeputy())
                        .build())
                .toList();

        return FundProfileResponse.DisbursementRuleItem.builder()
                .id(d.getId())
                .totalAmountCommitted(d.getTotalAmountCommitted())
                .disbursementType(d.getDisbursementType())
                .trancheDetail(tranches)
                .build();
    }
}
