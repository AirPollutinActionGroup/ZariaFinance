package com.ngo.finance.paymentType.group.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.paymentType.group.dto.request.CreatePaymentTypeGroupRequest;
import com.ngo.finance.paymentType.group.dto.request.UpdatePaymentTypeGroupRequest;
import com.ngo.finance.paymentType.group.dto.response.PaymentTypeGroupResponse;
import com.ngo.finance.paymentType.group.entity.PaymentTypeGroup;
import com.ngo.finance.paymentType.group.mapper.PaymentTypeGroupMapper;
import com.ngo.finance.paymentType.group.repository.PaymentTypeGroupRepository;
import com.ngo.finance.paymentType.group.service.PaymentTypeGroupService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Payment Type Group operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentTypeGroupServiceImpl implements PaymentTypeGroupService {

    private final PaymentTypeGroupRepository groupRepository;

    private final PaymentTypeGroupMapper groupMapper;

    @Override
    public PaymentTypeGroupResponse createGroup(CreatePaymentTypeGroupRequest request) {
        log.info("Registering new payment type group: {}", request.getName());

        if (groupRepository.existsByName(request.getName())) {
            throw new ValidationException("A group with name '" + request.getName() + "' already exists");
        }

        PaymentTypeGroup group = groupMapper.toEntity(request);
        group.setStatus(request.getStatus() == null || request.getStatus());

        PaymentTypeGroup saved = groupRepository.save(group);
        log.info("Payment type group registered successfully with id: {}", saved.getId());

        return groupMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentTypeGroupResponse getGroupById(Long id) {
        log.debug("Fetching payment type group with id: {}", id);
        PaymentTypeGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", id));
        return groupMapper.toResponse(group);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTypeGroupResponse> getAllGroups() {
        log.debug("Fetching all payment type groups");
        return groupRepository.findAll().stream()
                .map(groupMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTypeGroupResponse> searchGroups(String searchTerm) {
        log.debug("Searching payment type groups with term: {}", searchTerm);
        return groupRepository.searchByName(searchTerm).stream()
                .map(groupMapper::toResponse)
                .toList();
    }

    @Override
    public PaymentTypeGroupResponse updateGroup(Long id, UpdatePaymentTypeGroupRequest request) {
        log.info("Updating payment type group with id: {}", id);

        PaymentTypeGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", id));

        if (request.getName() != null
                && !request.getName().equals(group.getName())
                && groupRepository.existsByName(request.getName())) {
            throw new ValidationException("A group with name '" + request.getName() + "' already exists");
        }

        groupMapper.updateEntity(request, group);

        PaymentTypeGroup updated = groupRepository.save(group);
        log.info("Payment type group updated successfully");

        return groupMapper.toResponse(updated);
    }

    @Override
    public void activateGroup(Long id) {
        log.info("Activating payment type group with id: {}", id);

        PaymentTypeGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", id));

        group.setStatus(true);
        groupRepository.save(group);

        log.info("Payment type group activated successfully");
    }

    @Override
    public void deactivateGroup(Long id) {
        log.info("Deactivating payment type group with id: {}", id);

        PaymentTypeGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", id));

        group.setStatus(false);
        groupRepository.save(group);

        log.info("Payment type group deactivated successfully");
    }
}
