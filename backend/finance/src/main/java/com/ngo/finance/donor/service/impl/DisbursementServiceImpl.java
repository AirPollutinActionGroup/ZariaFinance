package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest.CriterionItem;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest.ReminderItem;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest.TrancheItem;
import com.ngo.finance.donor.dto.response.DisbursementScheduleResponse;
import com.ngo.finance.donor.entity.FundProfileTranche;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.GrantCriteriaReminder;
import com.ngo.finance.donor.entity.GrantDisbursementSchedule;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.entity.GrantTrancheCriterion;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.RepeatReminder;
import com.ngo.finance.donor.mapper.DisbursementMapper;
import com.ngo.finance.donor.repository.GrantDisbursementScheduleRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.repository.GrantTrancheCriterionRepository;
import com.ngo.finance.donor.repository.GrantTrancheRepository;
import com.ngo.finance.donor.service.DisbursementService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Disbursement configuration for a grant.
 *
 * Two invariants drive most of the code here:
 *  - Money that has arrived is never lost: a tranche with a recorded receipt
 *    cannot be deleted, and its amount cannot be changed.
 *  - A lump sum is stored as exactly one tranche, so receipts, utilisation and
 *    reporting have a single shape to read.
 */
@Slf4j
@Service
@Transactional
public class DisbursementServiceImpl implements DisbursementService {

    @Autowired
    private GrantRepository grantRepository;

    @Autowired
    private GrantDisbursementScheduleRepository scheduleRepository;

    @Autowired
    private GrantTrancheRepository trancheRepository;

    @Autowired
    private GrantTrancheCriterionRepository criterionRepository;

    @Autowired
    private DisbursementMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public DisbursementScheduleResponse getSchedule(Long grantId) {
        GrantAgreement grant = findGrant(grantId);
        GrantDisbursementSchedule schedule = scheduleRepository.findByGrantId(grantId).orElse(null);
        return mapper.toResponse(grant, schedule, orderedTranches(grantId));
    }

    @Override
    public DisbursementScheduleResponse saveSchedule(Long grantId, DisbursementScheduleRequest request) {
        GrantAgreement grant = findGrant(grantId);
        log.info("Saving disbursement configuration for grant {}", grantId);

        // Also enforced by @ValidDisbursementSchedule at the API boundary; repeated
        // here so internal callers (prefill) cannot create a shape the API rejects.
        if (request.getDisbursementType() == DisbursementType.TRANCHES && request.getScheduleType() == null) {
            ValidationException error = new ValidationException("Schedule type is required for tranches");
            error.addError("scheduleType", "Choose a cadence: monthly, quarterly, half-yearly or yearly");
            throw error;
        }

        GrantDisbursementSchedule schedule = scheduleRepository.findByGrantId(grantId)
                .orElseGet(() -> GrantDisbursementSchedule.builder().grant(grant).build());
        schedule.setDisbursementType(request.getDisbursementType());
        schedule.setReceivingDate(request.getReceivingDate());
        schedule.setScheduleType(request.getScheduleType());

        List<TrancheItem> items = new ArrayList<>(
                request.getTranches() == null ? List.of() : request.getTranches());

        // A lump sum is one tranche released on the receiving date. Normalising it
        // here keeps the rest of the system free of lump-sum special cases.
        if (request.getDisbursementType() == DisbursementType.LUMP_SUM) {
            TrancheItem lumpSum = items.isEmpty() ? TrancheItem.builder().build() : items.get(0);
            lumpSum.setAmount(grant.getTotalGrantAmount());
            lumpSum.setExpectedReleaseDate(request.getReceivingDate());
            if (lumpSum.getTrancheName() == null || lumpSum.getTrancheName().isBlank()) {
                lumpSum.setTrancheName("Lump sum");
            }
            if (lumpSum.getCriteria() == null || lumpSum.getCriteria().isEmpty()) {
                lumpSum.setCriteria(List.of(
                        CriterionItem.builder().criterionType(CriterionType.ON_SIGNING).build()));
            }
            items = List.of(lumpSum);
        }

        applyTranches(grant, items);
        GrantDisbursementSchedule saved = scheduleRepository.save(schedule);

        // Re-finalise: an edit that unbalances the plan withdraws finalisation
        // rather than leaving a stale "complete" badge on it.
        List<GrantTranche> tranches = orderedTranches(grantId);
        if (Boolean.TRUE.equals(saved.getFinalised()) && !balances(grant, tranches)) {
            saved.setFinalised(false);
            saved.setFinalisedAt(null);
            log.info("Disbursement plan for grant {} no longer balances — finalisation withdrawn", grantId);
        }

        return mapper.toResponse(grant, saved, tranches);
    }

    @Override
    public DisbursementScheduleResponse finalise(Long grantId) {
        GrantAgreement grant = findGrant(grantId);
        GrantDisbursementSchedule schedule = scheduleRepository.findByGrantId(grantId)
                .orElseThrow(() -> new ResourceNotFoundException("Disbursement schedule", "grant", grantId));

        List<GrantTranche> tranches = orderedTranches(grantId);
        if (tranches.isEmpty()) {
            throw new ValidationException("Add at least one tranche before finalising");
        }
        if (!balances(grant, tranches)) {
            BigDecimal allocated = allocated(tranches);
            BigDecimal difference = grant.getTotalGrantAmount().subtract(allocated);
            ValidationException error = new ValidationException(
                    "Tranche amounts must add up to the total grant amount before finalising");
            error.addError("tranches", difference.signum() > 0
                    ? "Short by " + difference.abs().toPlainString()
                    : "Over by " + difference.abs().toPlainString());
            throw error;
        }

        schedule.setFinalised(true);
        schedule.setFinalisedAt(LocalDateTime.now());
        log.info("Disbursement plan finalised for grant {}", grantId);
        return mapper.toResponse(grant, scheduleRepository.save(schedule), tranches);
    }

    @Override
    public DisbursementScheduleResponse markCriterionMet(Long criterionId, Long userId) {
        GrantTrancheCriterion criterion = criterionRepository.findById(criterionId)
                .orElseThrow(() -> new ResourceNotFoundException("Release criterion", criterionId));

        criterion.setMet(true);
        criterion.setMetAt(LocalDateTime.now());
        criterion.setMetBy(userId);
        criterionRepository.save(criterion);

        GrantTranche tranche = criterion.getTranche();
        syncTrancheGate(tranche);
        trancheRepository.save(tranche);

        Long grantId = tranche.getGrant().getId();
        log.info("Criterion {} marked met; tranche {} gate satisfied: {}",
                criterionId, tranche.getId(), tranche.criteriaSatisfied());
        return getSchedule(grantId);
    }

    @Override
    public DisbursementScheduleResponse prefillFromFundProfile(Long grantId) {
        GrantAgreement grant = findGrant(grantId);
        if (grant.getFundProfile() == null || grant.getFundProfile().getTranches().isEmpty()) {
            throw new ValidationException("The grant's fund profile has no tranche plan to copy");
        }
        if (!orderedTranches(grantId).isEmpty()) {
            throw new ValidationException("This grant already has tranches — clear them before prefilling");
        }

        // Prefill copies amounts and dates, not a cadence: the schedule type is the
        // user's call, so it must already be chosen.
        GrantDisbursementSchedule existing = scheduleRepository.findByGrantId(grantId).orElse(null);
        if (existing == null || existing.getScheduleType() == null) {
            ValidationException error = new ValidationException(
                    "Choose Tranches and a schedule type before prefilling from the fund profile");
            error.addError("scheduleType", "Schedule type is required first");
            throw error;
        }

        List<TrancheItem> items = grant.getFundProfile().getTranches().stream()
                .sorted(Comparator.comparing(FundProfileTranche::getTrancheNumber,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(t -> TrancheItem.builder()
                        .trancheName(t.getTrancheName())
                        .amount(t.getTrancheAmount())
                        .expectedReleaseDate(t.getPlannedReleaseDate())
                        // The profile plan carries no release conditions, so each
                        // copied tranche starts with the neutral On Signing gate
                        // for the user to refine.
                        .criteria(List.of(CriterionItem.builder()
                                .criterionType(CriterionType.ON_SIGNING).build()))
                        .build())
                .toList();

        DisbursementScheduleRequest request = DisbursementScheduleRequest.builder()
                .disbursementType(DisbursementType.TRANCHES)
                .scheduleType(existing.getScheduleType())
                .tranches(items)
                .build();

        log.info("Prefilling grant {} with {} tranches from its fund profile plan", grantId, items.size());
        return saveSchedule(grantId, request);
    }

    /**
     * Reconcile the stored tranches with the submitted list: update by id, insert
     * the rest, delete what is missing — refusing to touch received money.
     */
    private void applyTranches(GrantAgreement grant, List<TrancheItem> items) {
        Map<Long, GrantTranche> existing = new HashMap<>();
        for (GrantTranche tranche : orderedTranches(grant.getId())) {
            existing.put(tranche.getId(), tranche);
        }

        Set<Long> keptIds = new LinkedHashSet<>();
        int number = 1;

        for (TrancheItem item : items) {
            GrantTranche tranche;
            if (item.getId() != null) {
                tranche = existing.get(item.getId());
                if (tranche == null) {
                    throw new ResourceNotFoundException("Tranche", item.getId());
                }
                // Re-pricing money that has already landed would make the receipt
                // and the plan disagree with no way to tell which is right.
                if (tranche.isReceived() && tranche.getTrancheAmount().compareTo(item.getAmount()) != 0) {
                    ValidationException error = new ValidationException(
                            "Tranche " + tranche.getTrancheNumber() + " has already been received");
                    error.addError("tranches", "Cannot change the amount of a received tranche");
                    throw error;
                }
                keptIds.add(tranche.getId());
            } else {
                tranche = GrantTranche.builder().grant(grant).build();
            }

            tranche.setTrancheNumber(number++);
            tranche.setTrancheName(item.getTrancheName());
            tranche.setTrancheAmount(item.getAmount());
            tranche.setPlannedReleaseDate(item.getExpectedReleaseDate());
            if (tranche.getTrancheStatus() == null) {
                tranche.setTrancheStatus("PENDING");
            }

            applyCriteria(tranche, item.getCriteria() == null ? List.of() : item.getCriteria());
            syncTrancheGate(tranche);
            trancheRepository.save(tranche);
        }

        for (GrantTranche tranche : existing.values()) {
            if (keptIds.contains(tranche.getId())) {
                continue;
            }
            if (tranche.isReceived()) {
                ValidationException error = new ValidationException(
                        "Tranche " + tranche.getTrancheNumber() + " has already been received");
                error.addError("tranches", "Cannot remove a tranche whose receipt is recorded");
                throw error;
            }
            trancheRepository.delete(tranche);
        }
    }

    /** Replace a tranche's criteria, preserving the met state of ones kept by id. */
    private void applyCriteria(GrantTranche tranche, List<CriterionItem> items) {
        Map<Long, GrantTrancheCriterion> existing = new HashMap<>();
        for (GrantTrancheCriterion criterion : tranche.getCriteria()) {
            if (criterion.getId() != null) {
                existing.put(criterion.getId(), criterion);
            }
        }

        List<GrantTrancheCriterion> rebuilt = new ArrayList<>();
        int sequence = 1;

        for (CriterionItem item : items) {
            GrantTrancheCriterion criterion = item.getId() != null ? existing.get(item.getId()) : null;
            if (criterion == null) {
                criterion = GrantTrancheCriterion.builder().tranche(tranche).met(false).build();
            }

            criterion.setSequence(sequence++);
            criterion.setCriterionType(item.getCriterionType());
            criterion.setReleaseDate(item.getReleaseDate());
            criterion.setMilestoneName(item.getMilestoneName());
            criterion.setVerificationRole(item.getVerificationRole());
            criterion.setTargetDate(item.getTargetDate());
            criterion.setUtilisationPercent(item.getUtilisationPercent());
            criterion.setTriggerBasis(item.getTriggerBasis());
            criterion.setDescription(item.getDescription());
            applyReminder(criterion, item.getReminder());
            rebuilt.add(criterion);
        }

        // orphanRemoval deletes the criteria (and their reminders) dropped here.
        tranche.getCriteria().clear();
        tranche.getCriteria().addAll(rebuilt);
    }

    private void applyReminder(GrantTrancheCriterion criterion, ReminderItem item) {
        if (item == null) {
            criterion.setReminder(null);
            return;
        }
        GrantCriteriaReminder reminder = criterion.getReminder();
        if (reminder == null) {
            reminder = GrantCriteriaReminder.builder().criterion(criterion).build();
        }
        reminder.setResponsibleRole(item.getResponsibleRole());
        reminder.setReminderLeadDays(item.getReminderLeadDays());
        // Defaults are applied here, not left to @Builder.Default: Lombok drops the
        // field initialiser when that annotation is present, so a JSON body that
        // omits these optional fields deserialises them as null.
        reminder.setRepeatReminder(item.getRepeatReminder() == null
                ? RepeatReminder.ONCE : item.getRepeatReminder());
        reminder.setEscalateToDeputy(item.getEscalateToDeputy() == null
                ? Boolean.TRUE : item.getEscalateToDeputy());
        criterion.setReminder(reminder);
    }

    /**
     * Keep the legacy {@code conditionMet} flag in step with the structured
     * criteria — TranchesPanel and the receipt guard still read it.
     */
    private void syncTrancheGate(GrantTranche tranche) {
        tranche.setConditionMet(tranche.criteriaSatisfied() ? "Met" : "Pending");
    }

    private List<GrantTranche> orderedTranches(Long grantId) {
        return trancheRepository.findTranchesByGrantIdOrderedByNumber(grantId);
    }

    private static BigDecimal allocated(List<GrantTranche> tranches) {
        return tranches.stream()
                .map(GrantTranche::getTrancheAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static boolean balances(GrantAgreement grant, List<GrantTranche> tranches) {
        BigDecimal total = grant.getTotalGrantAmount();
        return total != null && allocated(tranches).compareTo(total) == 0;
    }

    private GrantAgreement findGrant(Long grantId) {
        return grantRepository.findById(grantId)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", grantId));
    }
}
