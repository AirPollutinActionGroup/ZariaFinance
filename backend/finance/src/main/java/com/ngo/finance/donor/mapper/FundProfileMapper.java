package com.ngo.finance.donor.mapper;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.response.FundProfileResponse;
import com.ngo.finance.donor.entity.DonorDisbursementRule;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorTrancheCriterion;
import com.ngo.finance.donor.entity.DonorUtilisationRule;
import com.ngo.finance.donor.entity.SpendableGeography;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.repository.StateRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Mapper for Donor Fund Profile ↔ DTOs.
 *
 * Hand-written (not MapStruct) because the profile owns three child collections
 * with parent back-references — clearer and less error-prone here than generated
 * mapping. The donor and programme associations are resolved in the service
 * (they need repository lookups) and are not touched here; geography's stateId
 * is resolved right here instead, since it sits inside a growing/shrinking list
 * rather than a single FK on the parent.
 */
@Component
public class FundProfileMapper {

    @Autowired
    private StateRepository stateRepository;

    /** Build a new entity graph from the request. Donor & programme set by the service. */
    public DonorFundProfile toEntity(CreateFundProfileRequest request) {
        DonorFundProfile profile = DonorFundProfile.builder()
                .fundMode(request.getFundMode())
                .fundClass(request.getFundClass())
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
        profile.setFundClass(request.getFundClass());
        profile.setPurpose(request.getPurpose());
        profile.setProgrammeTied(request.getProgrammeTied());
        profile.setReportingFrequency(request.getReportingFrequency());
        profile.setMovementAllowed(request.getMovementAllowed());
        profile.setExplanationRequired(request.getExplanationRequired());
        profile.setOnboardingComplete(request.getOnboardingComplete());

        // orphanRemoval on the collections deletes rows dropped from these lists;
        // disbursementRules' own orphanRemoval cascades through to their tranche
        // criteria, so clearing it here is enough to drop both levels.
        profile.getGeographies().clear();
        profile.getUtilisationRules().clear();
        profile.getDisbursementRules().clear();
        applyChildren(request, profile);
    }

    private void applyChildren(CreateFundProfileRequest request, DonorFundProfile profile) {
        if (request.getGeographies() != null) {
            for (CreateFundProfileRequest.GeographyItem g : request.getGeographies()) {
                StateMaster state = stateRepository.findById(g.getStateId())
                        .orElseThrow(() -> new ResourceNotFoundException("State", g.getStateId()));
                profile.getGeographies().add(SpendableGeography.builder()
                        .fundProfile(profile)
                        .state(state)
                        .build());
            }
        }
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
                        .totalAmount(d.getTotalAmount())
                        .disbursementType(d.getDisbursementType())
                        .build();
                if (d.getTrancheCriteria() != null) {
                    for (CreateFundProfileRequest.TrancheCriterionItem c : d.getTrancheCriteria()) {
                        DonorTrancheCriterion criterion = new DonorTrancheCriterion();
                        criterion.setDonorDisbursementRule(rule);
                        criterion.setAmountCriteria(c.getAmountCriteria());
                        criterion.setExpectedReleaseDate(c.getExpectedReleaseDate());
                        criterion.setFrequency(c.getFrequency());
                        criterion.setIsFinalTranche(c.getIsFinalTranche());
                        criterion.setReleaseCriteria(c.getReleaseCriteria());
                        criterion.setReleaseDate(c.getReleaseDate());
                        criterion.setMilestoneName(c.getMilestoneName());
                        criterion.setVerificationSignOffRole(c.getVerificationSignOffRole());
                        criterion.setOtherVerificationSignOffRole(c.getOtherVerificationSignOffRole());
                        criterion.setTargetDate(c.getTargetDate());
                        criterion.setUtilisationPercentage(c.getUtilisationPercentage());
                        criterion.setTriggerBasis(c.getTriggerBasis());
                        criterion.setDescription(c.getDescription());
                        criterion.setRemindSomeone(c.getRemindSomeone());
                        criterion.setResponsibleRole(c.getResponsibleRole());
                        criterion.setOtherResponsibleRole(c.getOtherResponsibleRole());
                        criterion.setReminderLeadTime(c.getReminderLeadTime());
                        criterion.setRepeatReminder(c.getRepeatReminder());
                        criterion.setEscalateToDeputy(c.getEscalateToDeputy());
                        rule.getDonorTrancheCriteria().add(criterion);
                    }
                }
                profile.getDisbursementRules().add(rule);
            }
        }
    }

    public FundProfileResponse toResponse(DonorFundProfile p) {
        List<FundProfileResponse.GeographyItem> geos = p.getGeographies().stream()
                .map(g -> FundProfileResponse.GeographyItem.builder()
                        .id(g.getId())
                        .stateId(g.getState() != null ? g.getState().getId() : null)
                        .stateName(g.getState() != null ? g.getState().getStateName() : null)
                        .stateCode(g.getState() != null ? g.getState().getStateCode() : null)
                        .build())
                .toList();

        List<FundProfileResponse.UtilisationRuleItem> utils = p.getUtilisationRules().stream()
                .map(u -> FundProfileResponse.UtilisationRuleItem.builder()
                        .id(u.getId())
                        .ruleType(u.getRuleType() != null ? u.getRuleType().name() : null)
                        .ruleTypeLabel(u.getRuleType() != null ? u.getRuleType().getLabel() : null)
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
                .fundMode(p.getFundMode() != null ? p.getFundMode().name() : null)
                .fundClass(p.getFundClass() != null ? p.getFundClass().name() : null)
                .fundClassLabel(p.getFundClass() != null ? p.getFundClass().getLabel() : null)
                .purpose(p.getPurpose())
                .programmeTied(p.getProgrammeTied())
                .programmeId(p.getProgramme() != null ? p.getProgramme().getId() : null)
                .programmeName(p.getProgramme() != null ? p.getProgramme().getProgrammeName() : null)
                .reportingFrequency(p.getReportingFrequency() != null ? p.getReportingFrequency().name() : null)
                .reportingFrequencyLabel(
                        p.getReportingFrequency() != null ? p.getReportingFrequency().getLabel() : null)
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
        List<FundProfileResponse.TrancheCriterionItem> criteria = d.getDonorTrancheCriteria().stream()
                .sorted(Comparator.comparing(DonorTrancheCriterion::getExpectedReleaseDate,
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(DonorTrancheCriterion::getId,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toTrancheCriterionItem)
                .toList();

        BigDecimal allocated = criteria.stream()
                .map(FundProfileResponse.TrancheCriterionItem::getAmountCriteria)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal unallocated = d.getTotalAmount() != null ? d.getTotalAmount().subtract(allocated) : null;

        return FundProfileResponse.DisbursementRuleItem.builder()
                .id(d.getId())
                .totalAmount(d.getTotalAmount())
                .disbursementType(d.getDisbursementType() != null ? d.getDisbursementType().name() : null)
                .disbursementTypeLabel(
                        d.getDisbursementType() != null ? d.getDisbursementType().getLabel() : null)
                .trancheCriteria(criteria)
                .allocatedAmount(allocated)
                .unallocatedAmount(unallocated)
                .balanced(unallocated != null && unallocated.signum() == 0)
                .build();
    }

    private FundProfileResponse.TrancheCriterionItem toTrancheCriterionItem(DonorTrancheCriterion c) {
        return FundProfileResponse.TrancheCriterionItem.builder()
                .id(c.getId())
                .amountCriteria(c.getAmountCriteria())
                .expectedReleaseDate(c.getExpectedReleaseDate())
                .frequency(c.getFrequency() != null ? c.getFrequency().name() : null)
                .frequencyLabel(c.getFrequency() != null ? c.getFrequency().getLabel() : null)
                .isFinalTranche(c.getIsFinalTranche())
                .releaseCriteria(c.getReleaseCriteria() != null ? c.getReleaseCriteria().name() : null)
                .releaseCriteriaLabel(c.getReleaseCriteria() != null ? c.getReleaseCriteria().getLabel() : null)
                .releaseDate(c.getReleaseDate())
                .milestoneName(c.getMilestoneName())
                .verificationSignOffRole(
                        c.getVerificationSignOffRole() != null ? c.getVerificationSignOffRole().name() : null)
                .verificationSignOffRoleLabel(
                        c.getVerificationSignOffRole() != null ? c.getVerificationSignOffRole().getLabel() : null)
                .otherVerificationSignOffRole(c.getOtherVerificationSignOffRole())
                .targetDate(c.getTargetDate())
                .utilisationPercentage(c.getUtilisationPercentage())
                .triggerBasis(c.getTriggerBasis() != null ? c.getTriggerBasis().name() : null)
                .triggerBasisLabel(c.getTriggerBasis() != null ? c.getTriggerBasis().getLabel() : null)
                .description(c.getDescription())
                .remindSomeone(c.getRemindSomeone())
                .responsibleRole(c.getResponsibleRole() != null ? c.getResponsibleRole().name() : null)
                .responsibleRoleLabel(c.getResponsibleRole() != null ? c.getResponsibleRole().getLabel() : null)
                .otherResponsibleRole(c.getOtherResponsibleRole())
                .reminderLeadTime(c.getReminderLeadTime())
                .repeatReminder(c.getRepeatReminder() != null ? c.getRepeatReminder().name() : null)
                .repeatReminderLabel(c.getRepeatReminder() != null ? c.getRepeatReminder().getLabel() : null)
                .escalateToDeputy(c.getEscalateToDeputy())
                .build();
    }
}
