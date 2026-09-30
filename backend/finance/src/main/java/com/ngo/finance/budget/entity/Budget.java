package com.ngo.finance.budget.entity;

import com.ngo.finance.budget.enums.BudgetStatus;
import com.ngo.finance.budget.enums.BudgetType;
import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.financialYear.entity.FinancialYear;
import com.ngo.finance.programme.entity.Programme;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A budget for one programme (or the whole organisation) in one financial
 * year, made of quarterly-phased {@link BudgetLine}s and carrying its approval
 * {@link BudgetStatusHistory}. Getters/setters only — no @Data, to keep the
 * bidirectional line/history associations out of equals/hashCode/toString.
 */
@Entity
@Table(name = "budget")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget extends AuditEntity {

    /** Display id, e.g. BUD-2026-001 (year = FY start year). */
    @Column(name = "budget_code", nullable = false, unique = true, length = 30, updatable = false)
    private String budgetCode;

    @Column(nullable = false, length = 255)
    private String name;

    /** The Financial Year master record this budget belongs to. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "financial_year_id", nullable = false)
    private FinancialYear financialYearRef;

    /** Label derived from {@link #financialYearRef}'s start date, e.g. "2026-27" — what the UI filters and links by. */
    @Column(name = "financial_year", nullable = false, length = 7)
    private String financialYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_type", nullable = false, length = 20)
    private BudgetType budgetType;

    /** Required for PROGRAMME budgets, null for ORGANISATION ones. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id")
    private Programme programme;

    /** Null = all states. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id")
    private StateMaster state;

    @Column(length = 255)
    private String owner;

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BudgetStatus status = BudgetStatus.DRAFT;

    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineNo ASC")
    @Builder.Default
    private List<BudgetLine> lines = new ArrayList<>();

    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC, id ASC")
    @Builder.Default
    private List<BudgetStatusHistory> history = new ArrayList<>();

    /**
     * Replaces the lines with {@code newLines}, numbered 1, 2, 3… in order.
     * Existing rows are updated in place (and surplus ones removed) rather than
     * cleared and re-inserted: Hibernate flushes inserts before deletes, which
     * would briefly duplicate (budget_id, line_no) and break its unique key.
     */
    public void replaceLines(List<BudgetLine> newLines) {
        for (int i = 0; i < newLines.size(); i++) {
            BudgetLine source = newLines.get(i);
            if (i < lines.size()) {
                BudgetLine target = lines.get(i);
                target.setCategory(source.getCategory());
                target.setDescription(source.getDescription());
                target.setBook(source.getBook());
                target.setQ1(source.getQ1());
                target.setQ2(source.getQ2());
                target.setQ3(source.getQ3());
                target.setQ4(source.getQ4());
                target.setLineNo(i + 1);
            } else {
                source.setBudget(this);
                source.setLineNo(i + 1);
                lines.add(source);
            }
        }
        while (lines.size() > newLines.size()) {
            lines.remove(lines.size() - 1);
        }
    }

    public void addHistory(BudgetStatus newStatus, String by, String note) {
        BudgetStatusHistory entry = BudgetStatusHistory.builder()
                .budget(this)
                .status(newStatus)
                .note(note)
                .build();
        entry.setCreatedBy(by);
        history.add(entry);
    }

    public BigDecimal getTotal() {
        return lines.stream().map(BudgetLine::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
