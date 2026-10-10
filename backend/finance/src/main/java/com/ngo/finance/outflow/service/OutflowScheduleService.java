package com.ngo.finance.outflow.service;

import com.ngo.finance.budget.entity.Budget;
import com.ngo.finance.budget.entity.BudgetLine;
import com.ngo.finance.budget.enums.BudgetStatus;
import com.ngo.finance.budget.mapper.BudgetMapper;
import com.ngo.finance.budget.repository.BudgetRepository;
import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.outflow.dto.response.OutflowRowResponse;
import com.ngo.finance.outflow.repository.DebitNoteRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The outflow schedule, derived (never stored) from APPROVED budgets: one row
 * per budget line per quarter with an amount. Also resolves a row id for the
 * debit / credit note services.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OutflowScheduleService {

    /** Days past the quarter's end before an unspent row is Overdue rather than Pending. */
    public static final int OVERDUE_THRESHOLD_DAYS = 15;

    private static final String[] QUARTER_MONTHS = {"Apr–Jun", "Jul–Sep", "Oct–Dec", "Jan–Mar"};

    private static final Pattern ROW_ID = Pattern.compile("^(BUD-\\d{4}-\\d{3,})-BL(\\d{2,})-Q([1-4])$");

    private final BudgetRepository budgetRepository;

    private final DebitNoteRepository debitNoteRepository;

    /** A resolved outflow row: the budget line and quarter it stands for. */
    public record OutflowRow(Budget budget, BudgetLine line, int quarter) {

        public String id() {
            return rowId(budget, line, quarter);
        }

        public BigDecimal expectedAmount() {
            return switch (quarter) {
                case 1 -> line.getQ1();
                case 2 -> line.getQ2();
                case 3 -> line.getQ3();
                default -> line.getQ4();
            };
        }

        /** Last day of the quarter, from the financial year's start date. */
        public LocalDate expectedDate() {
            return budget.getFinancialYearRef().getStartDate().plusMonths(3L * quarter).minusDays(1);
        }
    }

    public static String rowId(Budget budget, BudgetLine line, int quarter) {
        return String.format("%s-BL%02d-Q%d", budget.getBudgetCode(), line.getLineNo(), quarter);
    }

    /** Rows of every approved budget, optionally for one financial year ("2026-27"). */
    public List<OutflowRowResponse> listRows(String financialYear) {
        Map<String, BigDecimal> debits = sums(debitNoteRepository.sumByRow());
        LocalDate today = LocalDate.now();

        List<OutflowRowResponse> rows = new ArrayList<>();
        for (Budget budget : budgetRepository.findAllByStatusOrderByBudgetCodeAsc(BudgetStatus.APPROVED)) {
            if (financialYear != null && !financialYear.isBlank() && !financialYear.equals(budget.getFinancialYear())) {
                continue;
            }
            for (BudgetLine line : budget.getLines()) {
                for (int q = 1; q <= 4; q++) {
                    OutflowRow row = new OutflowRow(budget, line, q);
                    if (row.expectedAmount().signum() <= 0) {
                        continue;
                    }
                    String key = line.getId() + ":" + q;
                    rows.add(toResponse(row, debits.getOrDefault(key, BigDecimal.ZERO), today));
                }
            }
        }
        rows.sort((a, b) -> a.getExpectedDate().compareTo(b.getExpectedDate()) != 0
                ? a.getExpectedDate().compareTo(b.getExpectedDate())
                : a.getId().compareTo(b.getId()));
        return rows;
    }

    public OutflowRowResponse getRow(String rowId) {
        OutflowRow row = resolve(rowId);
        return toResponse(row, spentOn(row), LocalDate.now());
    }

    /**
     * Finds the row a note is raised against. Unknown ids are 404s for the
     * outflow API; the note services catch the not-found and report a 400.
     */
    public OutflowRow resolve(String rowId) {
        Matcher m = ROW_ID.matcher(rowId == null ? "" : rowId.trim());
        if (!m.matches()) {
            throw new ResourceNotFoundException("Outflow row '" + rowId + "' not found");
        }
        Budget budget = budgetRepository.findWithLinesByBudgetCode(m.group(1))
                .orElseThrow(() -> new ResourceNotFoundException("Outflow row '" + rowId + "' not found"));
        if (budget.getStatus() != BudgetStatus.APPROVED) {
            throw new ValidationException(budget.getBudgetCode() + " is not approved, so it has no outflow rows yet");
        }
        int lineNo = Integer.parseInt(m.group(2));
        int quarter = Integer.parseInt(m.group(3));
        BudgetLine line = budget.getLines().stream()
                .filter(l -> l.getLineNo() == lineNo)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Outflow row '" + rowId + "' not found"));
        OutflowRow row = new OutflowRow(budget, line, quarter);
        if (row.expectedAmount().signum() <= 0) {
            throw new ResourceNotFoundException("Outflow row '" + rowId + "' not found — nothing is phased into that quarter");
        }
        return row;
    }

    /** Spent on a row = the debit notes raised against it. */
    public BigDecimal spentOn(OutflowRow row) {
        return debitNoteRepository.sumOnRow(row.line().getId(), (short) row.quarter());
    }

    private OutflowRowResponse toResponse(OutflowRow row, BigDecimal debit, LocalDate today) {
        Budget budget = row.budget();
        BudgetLine line = row.line();
        BigDecimal expected = row.expectedAmount();
        BigDecimal spent = debit;
        BigDecimal remaining = expected.subtract(spent);
        return OutflowRowResponse.builder()
                .id(row.id())
                .budgetId(budget.getId())
                .budgetCode(budget.getBudgetCode())
                .budgetName(budget.getName())
                .financialYear(budget.getFinancialYear())
                .budgetType(budget.getBudgetType().name())
                .scope(budget.getProgramme() != null ? budget.getProgramme().getProgrammeName() : BudgetMapper.ORGANISATION_WIDE)
                .stateName(budget.getState() != null ? budget.getState().getStateName() : null)
                .lineId(line.getId())
                .lineCode(String.format("BL-%02d", line.getLineNo()))
                .quarter(row.quarter())
                .quarterLabel("Q" + row.quarter() + " (" + QUARTER_MONTHS[row.quarter() - 1] + ")")
                .categoryId(line.getCategory().getId())
                .categoryName(line.getCategory().getName())
                .line(line.getDescription())
                .book(line.getBook().name())
                .expectedDate(row.expectedDate())
                .expectedAmount(expected)
                .debitTotal(debit)
                .spent(spent)
                .remaining(remaining)
                .status(statusOf(remaining, row.expectedDate(), today))
                .build();
    }

    /** Fully spent → PAID; otherwise by how far past the quarter's end today is. */
    static String statusOf(BigDecimal remaining, LocalDate expectedDate, LocalDate today) {
        if (remaining.signum() <= 0) {
            return "PAID";
        }
        long daysLate = ChronoUnit.DAYS.between(expectedDate, today);
        if (daysLate <= 0) {
            return "DUE";
        }
        return daysLate <= OVERDUE_THRESHOLD_DAYS ? "PENDING" : "OVERDUE";
    }

    private static Map<String, BigDecimal> sums(List<Object[]> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] r : rows) {
            map.put(r[0] + ":" + r[1], (BigDecimal) r[2]);
        }
        return map;
    }
}
