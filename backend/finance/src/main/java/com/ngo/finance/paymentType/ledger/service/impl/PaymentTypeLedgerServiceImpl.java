package com.ngo.finance.paymentType.ledger.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.paymentType.group.entity.PaymentTypeGroup;
import com.ngo.finance.paymentType.group.repository.PaymentTypeGroupRepository;
import com.ngo.finance.paymentType.ledger.dto.request.CreatePaymentTypeLedgerRequest;
import com.ngo.finance.paymentType.ledger.dto.request.UpdatePaymentTypeLedgerRequest;
import com.ngo.finance.paymentType.ledger.dto.response.PaymentTypeLedgerResponse;
import com.ngo.finance.paymentType.ledger.entity.PaymentTypeLedger;
import com.ngo.finance.paymentType.ledger.mapper.PaymentTypeLedgerMapper;
import com.ngo.finance.paymentType.ledger.repository.PaymentTypeLedgerRepository;
import com.ngo.finance.paymentType.ledger.service.PaymentTypeLedgerService;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Payment Type Ledger operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentTypeLedgerServiceImpl implements PaymentTypeLedgerService {

    private final PaymentTypeLedgerRepository ledgerRepository;

    private final PaymentTypeGroupRepository groupRepository;

    private final PaymentTypeLedgerMapper ledgerMapper;

    @Override
    public PaymentTypeLedgerResponse createLedger(CreatePaymentTypeLedgerRequest request) {
        log.info("Registering new payment type ledger: {}", request.getName());

        PaymentTypeGroup group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", request.getGroupId()));

        if (ledgerRepository.existsByNameAndGroupId(request.getName(), request.getGroupId())) {
            throw new ValidationException(
                    "A ledger with name '" + request.getName() + "' already exists in this group");
        }

        PaymentTypeLedger ledger = ledgerMapper.toEntity(request);
        ledger.setStatus(request.getStatus() == null || request.getStatus());

        PaymentTypeLedger saved = ledgerRepository.save(ledger);
        log.info("Payment type ledger registered successfully with id: {}", saved.getId());

        return toResponseWithGroup(saved, group);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentTypeLedgerResponse getLedgerById(Long id) {
        log.debug("Fetching payment type ledger with id: {}", id);
        PaymentTypeLedger ledger = ledgerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeLedger", id));
        return toResponseWithGroup(ledger, requireGroup(ledger.getGroupId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTypeLedgerResponse> getAllLedgers() {
        log.debug("Fetching all payment type ledgers");
        return toResponsesWithGroups(ledgerRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTypeLedgerResponse> searchLedgers(String searchTerm) {
        log.debug("Searching payment type ledgers with term: {}", searchTerm);
        return toResponsesWithGroups(ledgerRepository.searchByName(searchTerm));
    }

    @Override
    public PaymentTypeLedgerResponse updateLedger(Long id, UpdatePaymentTypeLedgerRequest request) {
        log.info("Updating payment type ledger with id: {}", id);

        PaymentTypeLedger ledger = ledgerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeLedger", id));

        Long targetGroupId = request.getGroupId() != null ? request.getGroupId() : ledger.getGroupId();
        PaymentTypeGroup group = groupRepository.findById(targetGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", targetGroupId));

        String targetName = request.getName() != null ? request.getName() : ledger.getName();
        boolean nameOrGroupChanged = !targetName.equals(ledger.getName())
                || !targetGroupId.equals(ledger.getGroupId());
        if (nameOrGroupChanged && ledgerRepository.existsByNameAndGroupId(targetName, targetGroupId)) {
            throw new ValidationException(
                    "A ledger with name '" + targetName + "' already exists in this group");
        }

        ledgerMapper.updateEntity(request, ledger);

        PaymentTypeLedger updated = ledgerRepository.save(ledger);
        log.info("Payment type ledger updated successfully");

        return toResponseWithGroup(updated, group);
    }

    @Override
    public void activateLedger(Long id) {
        log.info("Activating payment type ledger with id: {}", id);

        PaymentTypeLedger ledger = ledgerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeLedger", id));

        ledger.setStatus(true);
        ledgerRepository.save(ledger);

        log.info("Payment type ledger activated successfully");
    }

    @Override
    public void deactivateLedger(Long id) {
        log.info("Deactivating payment type ledger with id: {}", id);

        PaymentTypeLedger ledger = ledgerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeLedger", id));

        ledger.setStatus(false);
        ledgerRepository.save(ledger);

        log.info("Payment type ledger deactivated successfully");
    }

    private PaymentTypeGroup requireGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", groupId));
    }

    private PaymentTypeLedgerResponse toResponseWithGroup(PaymentTypeLedger ledger, PaymentTypeGroup group) {
        PaymentTypeLedgerResponse response = ledgerMapper.toResponse(ledger);
        response.setGroupName(group.getName());
        return response;
    }

    private List<PaymentTypeLedgerResponse> toResponsesWithGroups(List<PaymentTypeLedger> ledgers) {
        Map<Long, PaymentTypeGroup> groupsById = groupRepository
                .findAllById(ledgers.stream().map(PaymentTypeLedger::getGroupId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(PaymentTypeGroup::getId, Function.identity()));

        return ledgers.stream()
                .map(ledger -> {
                    PaymentTypeLedgerResponse response = ledgerMapper.toResponse(ledger);
                    PaymentTypeGroup group = groupsById.get(ledger.getGroupId());
                    response.setGroupName(group != null ? group.getName() : null);
                    return response;
                })
                .toList();
    }
}
