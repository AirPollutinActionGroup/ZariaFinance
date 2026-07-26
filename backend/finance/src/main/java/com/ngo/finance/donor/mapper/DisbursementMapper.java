package com.ngo.finance.donor.mapper;

import com.ngo.finance.donor.dto.response.DisbursementScheduleResponse;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.GrantCriteriaReminder;
import com.ngo.finance.donor.entity.GrantDisbursementSchedule;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.entity.GrantTrancheCriterion;
import com.ngo.finance.notification.dto.RoleDirectoryEntryDto;
import com.ngo.finance.notification.service.RoleDirectoryService;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Disbursement configuration → response DTO.
 *
 * Hand-written rather than MapStruct: nearly every field is derived (allocated vs
 * committed, the final-tranche flag, reminder due dates, role holders) and the
 * graph is three levels deep.
 */
@Component
public class DisbursementMapper {

    @Autowired
    private RoleDirectoryService roleDirectoryService;

    /**
     * @param schedule null when the grant has no configuration yet — the response
     *                 still carries the committed total so the form can open.
     */
    public DisbursementScheduleResponse toResponse(GrantAgreement grant,
            GrantDisbursementSchedule schedule, List<GrantTranche> tranches) {

        BigDecimal committed = grant.getTotalGrantAmount() == null
                ? BigDecimal.ZERO : grant.getTotalGrantAmount();
        BigDecimal allocated = tranches.stream()
                .map(GrantTranche::getTrancheAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String frequencyLabel = schedule != null && schedule.getScheduleType() != null
                ? schedule.getScheduleType().getLabel() : null;

        List<DisbursementScheduleResponse.TrancheItem> trancheItems = tranches.stream()
                .map(t -> toTrancheItem(t, frequencyLabel, isFinal(t, tranches)))
                .toList();

        return DisbursementScheduleResponse.builder()
                .id(schedule != null ? schedule.getId() : null)
                .grantId(grant.getId())
                .grantCode(grant.getGrantCode())
                .disbursementType(schedule != null && schedule.getDisbursementType() != null
                        ? schedule.getDisbursementType().name() : null)
                .receivingDate(schedule != null ? schedule.getReceivingDate() : null)
                .scheduleType(schedule != null && schedule.getScheduleType() != null
                        ? schedule.getScheduleType().name() : null)
                .frequencyLabel(frequencyLabel)
                .finalised(schedule != null ? schedule.getFinalised() : Boolean.FALSE)
                .finalisedAt(schedule != null ? schedule.getFinalisedAt() : null)
                .totalAmountCommitted(committed)
                .allocatedAmount(allocated)
                .unallocatedAmount(committed.subtract(allocated))
                .balanced(committed.compareTo(allocated) == 0 && !tranches.isEmpty())
                .tranches(trancheItems)
                .build();
    }

    /** The last tranche by number — its expected release date is optional. */
    private boolean isFinal(GrantTranche tranche, List<GrantTranche> all) {
        return all.stream()
                .map(GrantTranche::getTrancheNumber)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .map(max -> max.equals(tranche.getTrancheNumber()))
                .orElse(false);
    }

    private DisbursementScheduleResponse.TrancheItem toTrancheItem(
            GrantTranche tranche, String frequencyLabel, boolean finalTranche) {

        List<DisbursementScheduleResponse.CriterionItem> criteria = tranche.getCriteria().stream()
                .sorted(Comparator.comparing(GrantTrancheCriterion::getSequence,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(c -> toCriterionItem(c, tranche))
                .toList();

        return DisbursementScheduleResponse.TrancheItem.builder()
                .id(tranche.getId())
                .trancheNumber(tranche.getTrancheNumber())
                .trancheName(tranche.getTrancheName())
                .amount(tranche.getTrancheAmount())
                .expectedReleaseDate(tranche.getPlannedReleaseDate())
                .frequencyLabel(frequencyLabel)
                .finalTranche(finalTranche)
                .trancheStatus(tranche.getTrancheStatus())
                .actualAmount(tranche.getActualAmount())
                .actualReleaseDate(tranche.getActualReleaseDate())
                .received(tranche.isReceived())
                .criteriaSatisfied(tranche.criteriaSatisfied())
                .criteriaMetCount(tranche.criteriaMetCount())
                .criteria(criteria)
                .build();
    }

    private DisbursementScheduleResponse.CriterionItem toCriterionItem(
            GrantTrancheCriterion criterion, GrantTranche tranche) {

        return DisbursementScheduleResponse.CriterionItem.builder()
                .id(criterion.getId())
                .sequence(criterion.getSequence())
                .criterionType(criterion.getCriterionType().name())
                .criterionTypeLabel(criterion.getCriterionType().getLabel())
                .releaseDate(criterion.getReleaseDate())
                .milestoneName(criterion.getMilestoneName())
                .verificationRole(criterion.getVerificationRole() != null
                        ? criterion.getVerificationRole().name() : null)
                .verificationRoleLabel(criterion.getVerificationRole() != null
                        ? criterion.getVerificationRole().getLabel() : null)
                .targetDate(criterion.getTargetDate())
                .utilisationPercent(criterion.getUtilisationPercent())
                .triggerBasis(criterion.getTriggerBasis() != null
                        ? criterion.getTriggerBasis().name() : null)
                .triggerBasisLabel(criterion.getTriggerBasis() != null
                        ? criterion.getTriggerBasis().getLabel() : null)
                .description(criterion.getDescription())
                .met(criterion.getMet())
                .metAt(criterion.getMetAt())
                .humanActioned(criterion.getCriterionType().isHumanActioned())
                .reminder(toReminderItem(criterion.getReminder(), tranche))
                .build();
    }

    private DisbursementScheduleResponse.ReminderItem toReminderItem(
            GrantCriteriaReminder reminder, GrantTranche tranche) {
        if (reminder == null) {
            return null;
        }

        RoleDirectoryEntryDto holder = roleDirectoryService
                .findByRole(reminder.getResponsibleRole())
                .orElse(null);

        return DisbursementScheduleResponse.ReminderItem.builder()
                .id(reminder.getId())
                .responsibleRole(reminder.getResponsibleRole().name())
                .responsibleRoleLabel(reminder.getResponsibleRole().getLabel())
                .reminderLeadDays(reminder.getReminderLeadDays())
                .repeatReminder(reminder.getRepeatReminder().name())
                .escalateToDeputy(reminder.getEscalateToDeputy())
                .dueDate(reminder.dueDate(tranche.getPlannedReleaseDate()))
                .responsiblePersonName(holder != null ? holder.getPrimaryUserName() : null)
                .deputyName(holder != null ? holder.getDeputyUserName() : null)
                .build();
    }
}
