package com.ngo.finance.inflowbudget.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.entity.DonorTrancheCriterion;
import com.ngo.finance.inflowbudget.dto.request.RecordInflowReceiptRequest;
import com.ngo.finance.inflowbudget.dto.response.InflowBudgetLineResponse;
import com.ngo.finance.inflowbudget.entity.InflowReceipt;
import com.ngo.finance.inflowbudget.mapper.InflowBudgetMapper;
import com.ngo.finance.inflowbudget.repository.InflowBudgetLineRepository;
import com.ngo.finance.inflowbudget.repository.InflowReceiptRepository;
import com.ngo.finance.inflowbudget.service.InflowBudgetService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class InflowBudgetServiceImpl implements InflowBudgetService {

    private final InflowBudgetLineRepository repository;
    private final InflowReceiptRepository receiptRepository;
    private final InflowBudgetMapper mapper;

    @Autowired
    public InflowBudgetServiceImpl(
            InflowBudgetLineRepository repository,
            InflowReceiptRepository receiptRepository,
            InflowBudgetMapper mapper) {
        this.repository = repository;
        this.receiptRepository = receiptRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InflowBudgetLineResponse> getAllLines() {
        List<DonorTrancheCriterion> criteria = repository.findAllInflowLines();
        List<Long> criterionIds = criteria.stream().map(DonorTrancheCriterion::getId).toList();
        Map<Long, List<InflowReceipt>> receiptsByCriterionId = receiptRepository
                .findByTrancheCriterionIdInOrderByReceivedDateAsc(criterionIds).stream()
                .collect(Collectors.groupingBy(r -> r.getTrancheCriterion().getId()));

        return criteria.stream()
                .map(c -> mapper.toResponse(c, receiptsByCriterionId.getOrDefault(c.getId(), List.of())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InflowBudgetLineResponse getLineById(Long id) {
        DonorTrancheCriterion criterion = findCriterion(id);
        return mapper.toResponse(criterion, receiptsFor(id));
    }

    /**
     * A line can be receipted in more than one instalment (e.g. two separate
     * transactions against the same tranche), so this adds a new InflowReceipt
     * row rather than replacing the criterion's totals — each instalment stays
     * individually visible instead of being squashed into one running total.
     */
    @Override
    public InflowBudgetLineResponse recordReceipt(Long id, RecordInflowReceiptRequest request) {
        DonorTrancheCriterion criterion = findCriterion(id);

        InflowReceipt receipt = new InflowReceipt();
        receipt.setTrancheCriterion(criterion);
        receipt.setReceivedDate(request.getActualDate());
        receipt.setReceivedAmount(request.getActualAmount());
        receipt.setBankReference(request.getReceiptRef());
        receipt.setReceiptVoucherNo(request.getReceiptNo());
        receipt.setVarianceReason(request.getVarianceReason());
        receipt.setTransactionId(request.getTransactionId());
        receiptRepository.save(receipt);

        log.info("Recorded inflow receipt of {} for tranche criterion {}", request.getActualAmount(), id);
        return mapper.toResponse(criterion, receiptsFor(id));
    }

    @Override
    public InflowBudgetLineResponse reverseReceipt(Long id, Long transactionId) {
        DonorTrancheCriterion criterion = findCriterion(id);
        receiptRepository.findByTransactionId(transactionId).ifPresent(receiptRepository::delete);
        log.info("Reversed inflow receipt posted by transaction {} for tranche criterion {}", transactionId, id);
        return mapper.toResponse(criterion, receiptsFor(id));
    }

    private List<InflowReceipt> receiptsFor(Long criterionId) {
        return receiptRepository.findByTrancheCriterionIdOrderByReceivedDateAsc(criterionId);
    }

    private DonorTrancheCriterion findCriterion(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inflow budget line", id));
    }
}
