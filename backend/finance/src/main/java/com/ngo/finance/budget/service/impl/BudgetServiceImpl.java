package com.ngo.finance.budget.service.impl;

import com.ngo.finance.budget.dto.request.BudgetLineRequest;
import com.ngo.finance.budget.dto.request.BudgetTransitionRequest;
import com.ngo.finance.budget.dto.request.SaveBudgetRequest;
import com.ngo.finance.budget.dto.response.BudgetResponse;
import com.ngo.finance.budget.entity.Budget;
import com.ngo.finance.budget.entity.BudgetLine;
import com.ngo.finance.budget.enums.BudgetStatus;
import com.ngo.finance.budget.enums.BudgetType;
import com.ngo.finance.budget.mapper.BudgetMapper;
import com.ngo.finance.budget.repository.BudgetLineRepository;
import com.ngo.finance.budget.repository.BudgetRepository;
import com.ngo.finance.budget.service.BudgetService;
import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.financialYear.entity.FinancialYear;
import com.ngo.finance.financialYear.repository.FinancialYearRepository;
import com.ngo.finance.masters.budgetcategory.entity.BudgetCategory;
import com.ngo.finance.masters.budgetcategory.repository.BudgetCategoryRepository;
import com.ngo.finance.programme.entity.Programme;
import com.ngo.finance.programme.repository.ProgrammeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Budget operations.
 *
 * <p>Rules: a PROGRAMME budget needs a programme; every line needs an
 * existing category (new lines an active one), a description and an amount
 * in at least one quarter. Only Draft / Rejected budgets can be edited, only
 * Drafts deleted, and status moves follow {@link BudgetStatus#canMoveTo}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;

    private final BudgetLineRepository budgetLineRepository;

    private final BudgetCategoryRepository budgetCategoryRepository;

    private final ProgrammeRepository programmeRepository;

    private final StateRepository stateRepository;

    private final FinancialYearRepository financialYearRepository;

    private final BudgetMapper budgetMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> listBudgets(String financialYear, BudgetStatus status, BudgetType budgetType, String search) {
        String q = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        return budgetRepository.findAllByOrderByUpdatedAtDesc().stream()
                .filter(b -> financialYear == null || financialYear.isBlank() || financialYear.equals(b.getFinancialYear()))
                .filter(b -> status == null || status == b.getStatus())
                .filter(b -> budgetType == null || budgetType == b.getBudgetType())
                .map(budgetMapper::toSummary)
                .filter(r -> q.isEmpty() || Stream.of(r.getBudgetCode(), r.getName(), r.getScope(), r.getStateName())
                        .anyMatch(text -> text != null && text.toLowerCase(Locale.ROOT).contains(q)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudget(Long id) {
        return budgetMapper.toDetail(findOrThrow(id));
    }

    @Override
    public BudgetResponse createBudget(SaveBudgetRequest request) {
        log.info("Creating budget '{}' for financial year id {}", request.getName(), request.getFinancialYearId());
        Budget budget = Budget.builder().build(); // builder applies the defaults (Draft, empty lines/history)
        applyHeader(budget, request);
        budget.setBudgetCode(nextBudgetCode(budget.getFinancialYear()));
        budget.replaceLines(buildLines(request.getLines(), Set.of()));

        String actor = actor(request.getActor());
        budget.setCreatedBy(actor);
        budget.setUpdatedBy(actor);
        budget.addHistory(BudgetStatus.DRAFT, actor, "Created");
        if (Boolean.TRUE.equals(request.getSubmit())) {
            budget.setStatus(BudgetStatus.SUBMITTED);
            budget.addHistory(BudgetStatus.SUBMITTED, actor, null);
        }

        Budget saved = budgetRepository.save(budget);
        log.info("Budget created: {} (id {})", saved.getBudgetCode(), saved.getId());
        return budgetMapper.toDetail(saved);
    }

    @Override
    public BudgetResponse updateBudget(Long id, SaveBudgetRequest request) {
        log.info("Updating budget with id: {}", id);
        Budget budget = findOrThrow(id);
        if (!budget.getStatus().isEditable()) {
            throw new ValidationException("A " + budget.getStatus().name().toLowerCase(Locale.ROOT)
                    + " budget can no longer be edited");
        }

        // Categories already on this budget stay allowed even if since deactivated.
        Set<Long> existingCategoryIds = new HashSet<>();
        budget.getLines().forEach(l -> existingCategoryIds.add(l.getCategory().getId()));

        applyHeader(budget, request);
        budget.replaceLines(buildLines(request.getLines(), existingCategoryIds));

        String actor = actor(request.getActor());
        budget.setUpdatedBy(actor);
        if (budget.getStatus() == BudgetStatus.REJECTED) {
            budget.setStatus(BudgetStatus.DRAFT);
            budget.addHistory(BudgetStatus.DRAFT, actor, "Revised after rejection");
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            budget.setStatus(BudgetStatus.SUBMITTED);
            budget.addHistory(BudgetStatus.SUBMITTED, actor, null);
        }

        return budgetMapper.toDetail(budgetRepository.save(budget));
    }

    @Override
    public BudgetResponse submitBudget(Long id, BudgetTransitionRequest request) {
        return transition(id, BudgetStatus.SUBMITTED, request, false);
    }

    @Override
    public BudgetResponse withdrawBudget(Long id, BudgetTransitionRequest request) {
        return transition(id, BudgetStatus.DRAFT, request, false);
    }

    @Override
    public BudgetResponse approveBudget(Long id, BudgetTransitionRequest request) {
        return transition(id, BudgetStatus.APPROVED, request, false);
    }

    @Override
    public BudgetResponse rejectBudget(Long id, BudgetTransitionRequest request) {
        return transition(id, BudgetStatus.REJECTED, request, true);
    }

    @Override
    public void deleteBudget(Long id) {
        Budget budget = findOrThrow(id);
        if (budget.getStatus() != BudgetStatus.DRAFT) {
            throw new ValidationException("Only draft budgets can be deleted");
        }
        budgetRepository.delete(budget);
        log.info("Budget deleted: {}", budget.getBudgetCode());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Long> getCategoryUsage() {
        Map<Long, Long> usage = new LinkedHashMap<>();
        for (Object[] row : budgetLineRepository.countLinesByCategory()) {
            usage.put((Long) row[0], (Long) row[1]);
        }
        return usage;
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private BudgetResponse transition(Long id, BudgetStatus target, BudgetTransitionRequest request, boolean noteRequired) {
        Budget budget = findOrThrow(id);
        if (!budget.getStatus().canMoveTo(target)) {
            throw new ValidationException("Cannot move a budget from " + budget.getStatus() + " to " + target);
        }
        String note = request == null || request.getNote() == null ? null : request.getNote().trim();
        if (noteRequired && (note == null || note.isEmpty())) {
            throw new ValidationException("Give a reason so the owner knows what to change");
        }
        String actor = actor(request == null ? null : request.getActor());
        budget.setStatus(target);
        budget.setUpdatedBy(actor);
        budget.addHistory(target, actor, note == null || note.isEmpty() ? null : note);
        log.info("Budget {} moved to {}", budget.getBudgetCode(), target);
        return budgetMapper.toDetail(budgetRepository.save(budget));
    }

    private void applyHeader(Budget budget, SaveBudgetRequest request) {
        String name = request.getName().trim().replaceAll("\\s+", " ");
        if (name.isEmpty()) {
            throw new ValidationException("Budget name is required");
        }
        budget.setName(name);

        FinancialYear year = financialYearRepository.findById(request.getFinancialYearId())
                .orElseThrow(() -> new ValidationException("Financial year " + request.getFinancialYearId() + " does not exist"));
        boolean yearChanged = budget.getFinancialYearRef() == null || !year.getId().equals(budget.getFinancialYearRef().getId());
        // A draft already in a year that has since closed can still be revised; nothing new goes into a closed year.
        if (yearChanged && year.getEndDate().isBefore(LocalDate.now())) {
            throw new ValidationException(year.getCode() + " is closed — choose an active or upcoming financial year");
        }
        budget.setFinancialYearRef(year);
        budget.setFinancialYear(labelOf(year));
        budget.setBudgetType(request.getBudgetType());

        if (request.getBudgetType() == BudgetType.PROGRAMME) {
            if (request.getProgrammeId() == null) {
                throw new ValidationException("Select the programme");
            }
            Programme programme = programmeRepository.findById(request.getProgrammeId())
                    .orElseThrow(() -> new ValidationException("Programme " + request.getProgrammeId() + " does not exist"));
            budget.setProgramme(programme);
        } else {
            budget.setProgramme(null); // organisation-wide
        }

        if (request.getStateId() != null) {
            StateMaster state = stateRepository.findById(request.getStateId())
                    .orElseThrow(() -> new ValidationException("State " + request.getStateId() + " does not exist"));
            budget.setState(state);
        } else {
            budget.setState(null); // all states
        }

        budget.setOwner(trimToNull(request.getOwner()));
        budget.setNotes(trimToNull(request.getNotes()));
    }

    private List<BudgetLine> buildLines(List<BudgetLineRequest> requests, Set<Long> allowedInactiveCategoryIds) {
        List<BudgetLine> lines = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            BudgetLineRequest r = requests.get(i);
            String where = "Line " + (i + 1) + ": ";

            BudgetCategory category = budgetCategoryRepository.findById(r.getCategoryId())
                    .orElseThrow(() -> new ValidationException(where + "category " + r.getCategoryId() + " does not exist"));
            if (!Boolean.TRUE.equals(category.getStatus()) && !allowedInactiveCategoryIds.contains(category.getId())) {
                throw new ValidationException(where + "category '" + category.getName() + "' is inactive");
            }

            BudgetLine line = BudgetLine.builder()
                    .category(category)
                    .description(r.getDescription().trim())
                    .book(r.getBook())
                    .q1(amount(r.getQ1()))
                    .q2(amount(r.getQ2()))
                    .q3(amount(r.getQ3()))
                    .q4(amount(r.getQ4()))
                    .build();
            if (line.getDescription().isEmpty()) {
                throw new ValidationException(where + "description is required");
            }
            if (line.getTotal().signum() <= 0) {
                throw new ValidationException(where + "phase an amount into at least one quarter");
            }
            lines.add(line);
        }
        return lines;
    }

    /** "2026-27" from the year's start date (an Apr 2026 – Mar 2027 year). */
    static String labelOf(FinancialYear year) {
        int start = year.getStartDate().getYear();
        return String.format("%d-%02d", start, (start + 1) % 100);
    }

    /** BUD-{FY start year}-{nnn}, one sequence per year. */
    private String nextBudgetCode(String financialYearLabel) {
        String prefix = "BUD-" + financialYearLabel.substring(0, 4) + "-";
        int next = budgetRepository.findTopByBudgetCodeStartingWithOrderByBudgetCodeDesc(prefix)
                .map(b -> Integer.parseInt(b.getBudgetCode().substring(prefix.length())) + 1)
                .orElse(1);
        return prefix + String.format("%03d", next);
    }

    private Budget findOrThrow(Long id) {
        return budgetRepository.findWithLinesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
    }

    private static BigDecimal amount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private static String actor(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? "System" : trimmed;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
