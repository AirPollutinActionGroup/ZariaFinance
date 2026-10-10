package com.ngo.finance.budget.mapper;

import com.ngo.finance.budget.dto.response.BudgetResponse;
import com.ngo.finance.budget.entity.Budget;
import com.ngo.finance.budget.entity.BudgetLine;
import com.ngo.finance.budget.entity.BudgetStatusHistory;
import com.ngo.finance.budget.enums.BudgetType;
import org.springframework.stereotype.Component;

/**
 * Entity → response mapping for budgets. Hand-written (not MapStruct) because
 * the response flattens several associations (programme, state, category)
 * and derives totals, codes and the scope label.
 */
@Component
public class BudgetMapper {

    public static final String ORGANISATION_WIDE = "Organisation-wide";

    /** List row: header + totals, without lines, history or notes. */
    public BudgetResponse toSummary(Budget budget) {
        return baseBuilder(budget).build();
    }

    /** Detail: everything, including lines and the approval history. */
    public BudgetResponse toDetail(Budget budget) {
        return baseBuilder(budget)
                .notes(budget.getNotes())
                .lines(budget.getLines().stream().map(this::toLine).toList())
                .history(budget.getHistory().stream().map(this::toHistory).toList())
                .build();
    }

    private BudgetResponse.BudgetResponseBuilder baseBuilder(Budget budget) {
        boolean programmeBudget = budget.getBudgetType() == BudgetType.PROGRAMME && budget.getProgramme() != null;
        return BudgetResponse.builder()
                .id(budget.getId())
                .budgetCode(budget.getBudgetCode())
                .name(budget.getName())
                .financialYear(budget.getFinancialYear())
                .financialYearId(budget.getFinancialYearRef().getId())
                .financialYearCode(budget.getFinancialYearRef().getCode())
                .budgetType(budget.getBudgetType().name())
                .programmeId(programmeBudget ? budget.getProgramme().getId() : null)
                .programmeName(programmeBudget ? budget.getProgramme().getProgrammeName() : null)
                .scope(programmeBudget ? budget.getProgramme().getProgrammeName() : ORGANISATION_WIDE)
                .stateId(budget.getState() != null ? budget.getState().getId() : null)
                .stateName(budget.getState() != null ? budget.getState().getStateName() : null)
                .owner(budget.getOwner())
                .status(budget.getStatus().name())
                .total(budget.getTotal())
                .lineCount(budget.getLines().size())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt());
    }

    private BudgetResponse.Line toLine(BudgetLine line) {
        return BudgetResponse.Line.builder()
                .id(line.getId())
                .lineNo(line.getLineNo())
                .lineCode(String.format("BL-%02d", line.getLineNo()))
                .categoryId(line.getCategory().getId())
                .categoryName(line.getCategory().getName())
                .categoryActive(Boolean.TRUE.equals(line.getCategory().getStatus()))
                .description(line.getDescription())
                .book(line.getBook().name())
                .q1(line.getQ1())
                .q2(line.getQ2())
                .q3(line.getQ3())
                .q4(line.getQ4())
                .total(line.getTotal())
                .build();
    }

    private BudgetResponse.HistoryEntry toHistory(BudgetStatusHistory entry) {
        return BudgetResponse.HistoryEntry.builder()
                .status(entry.getStatus().name())
                .at(entry.getCreatedAt())
                .by(entry.getCreatedBy())
                .note(entry.getNote())
                .build();
    }
}
