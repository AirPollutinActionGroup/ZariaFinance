package com.ngo.finance.inflowbudget.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.entity.DonorTrancheCriterion;
import com.ngo.finance.inflowbudget.dto.response.InflowBudgetLineResponse;
import com.ngo.finance.inflowbudget.mapper.InflowBudgetMapper;
import com.ngo.finance.inflowbudget.repository.InflowBudgetLineRepository;
import com.ngo.finance.inflowbudget.service.InflowBudgetService;
import com.ngo.finance.outflow.entity.CreditNote;
import com.ngo.finance.outflow.repository.CreditNoteRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inflow Budget lines are the donor tranche schedule. What was received on a
 * line is the credit notes received against it: a credit note names its
 * tranche, and a lump-sum credit note (no tranche) counts on its fund
 * profile's earliest line.
 */
@Service
@Transactional(readOnly = true)
public class InflowBudgetServiceImpl implements InflowBudgetService {

    static final String LUMP_SUM = "Lump Sum";

    private static final Comparator<DonorTrancheCriterion> EARLIEST_FIRST = Comparator
            .comparing(DonorTrancheCriterion::getExpectedReleaseDate, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(DonorTrancheCriterion::getId);

    private final InflowBudgetLineRepository repository;
    private final CreditNoteRepository creditNoteRepository;
    private final InflowBudgetMapper mapper;

    @Autowired
    public InflowBudgetServiceImpl(
            InflowBudgetLineRepository repository,
            CreditNoteRepository creditNoteRepository,
            InflowBudgetMapper mapper) {
        this.repository = repository;
        this.creditNoteRepository = creditNoteRepository;
        this.mapper = mapper;
    }

    @Override
    public List<InflowBudgetLineResponse> getAllLines() {
        List<DonorTrancheCriterion> criteria = repository.findAllInflowLines();
        Map<Long, List<CreditNote>> received = creditNotesByCriterion(criteria);
        return criteria.stream()
                .map(c -> mapper.toResponse(c, received.getOrDefault(c.getId(), List.of())))
                .toList();
    }

    @Override
    public InflowBudgetLineResponse getLineById(Long id) {
        DonorTrancheCriterion criterion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inflow budget line", id));
        return mapper.toResponse(criterion, creditNotesByCriterion(fundCriteriaOf(criterion)).getOrDefault(id, List.of()));
    }

    /** Credit notes received on each of these lines, keyed by criterion id. */
    private Map<Long, List<CreditNote>> creditNotesByCriterion(List<DonorTrancheCriterion> criteria) {
        Map<Long, List<CreditNote>> byId = new HashMap<>();
        if (criteria.isEmpty()) {
            return byId;
        }
        Map<String, DonorTrancheCriterion> criterionByRef = criteria.stream()
                .collect(Collectors.toMap(c -> String.valueOf(c.getId()), c -> c, (a, b) -> a));
        creditNoteRepository.findByTrancheRefIn(criterionByRef.keySet())
                .forEach(n -> add(byId, criterionByRef.get(n.getTrancheRef()), n));

        // Lump sum: the fund profile's earliest line takes the money.
        Map<String, DonorTrancheCriterion> firstLineByFund = criteria.stream()
                .collect(Collectors.toMap(
                        c -> String.valueOf(c.getDonorDisbursementRule().getFundProfile().getId()),
                        c -> c,
                        (a, b) -> EARLIEST_FIRST.compare(a, b) <= 0 ? a : b));
        creditNoteRepository.findByDisbursementTypeAndTrancheRefIsNullAndFundProfileRefIn(LUMP_SUM, firstLineByFund.keySet())
                .forEach(n -> add(byId, firstLineByFund.get(n.getFundProfileRef()), n));
        return byId;
    }

    private static void add(Map<Long, List<CreditNote>> byId, DonorTrancheCriterion criterion, CreditNote note) {
        if (criterion != null) {
            byId.computeIfAbsent(criterion.getId(), k -> new ArrayList<>()).add(note);
        }
    }

    /** Every line on the same fund profile — needed to place lump-sum credit notes. */
    private List<DonorTrancheCriterion> fundCriteriaOf(DonorTrancheCriterion criterion) {
        Long fundId = criterion.getDonorDisbursementRule().getFundProfile().getId();
        return repository.findAllInflowLines().stream()
                .filter(c -> Objects.equals(c.getDonorDisbursementRule().getFundProfile().getId(), fundId))
                .toList();
    }
}
