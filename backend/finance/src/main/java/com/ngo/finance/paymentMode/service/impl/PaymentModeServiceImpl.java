package com.ngo.finance.paymentMode.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.paymentMode.dto.request.CreatePaymentModeRequest;
import com.ngo.finance.paymentMode.dto.request.UpdatePaymentModeRequest;
import com.ngo.finance.paymentMode.dto.response.PaymentModeResponse;
import com.ngo.finance.paymentMode.entity.PaymentMode;
import com.ngo.finance.paymentMode.mapper.PaymentModeMapper;
import com.ngo.finance.paymentMode.repository.PaymentModeRepository;
import com.ngo.finance.paymentMode.service.PaymentModeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Payment Mode operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentModeServiceImpl implements PaymentModeService {

    private final PaymentModeRepository paymentModeRepository;

    private final PaymentModeMapper paymentModeMapper;

    @Override
    public PaymentModeResponse createPaymentMode(CreatePaymentModeRequest request) {
        log.info("Registering new payment mode: {}", request.getName());

        if (paymentModeRepository.existsByName(request.getName())) {
            throw new ValidationException("A payment mode with name '" + request.getName() + "' already exists");
        }

        PaymentMode paymentMode = paymentModeMapper.toEntity(request);
        paymentMode.setStatus(request.getStatus() == null || request.getStatus());

        PaymentMode saved = paymentModeRepository.save(paymentMode);
        log.info("Payment mode registered successfully with id: {}", saved.getId());

        return paymentModeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentModeResponse getPaymentModeById(Long id) {
        log.debug("Fetching payment mode with id: {}", id);
        PaymentMode paymentMode = paymentModeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment mode", id));
        return paymentModeMapper.toResponse(paymentMode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentModeResponse> getAllPaymentModes() {
        log.debug("Fetching all payment modes");
        return paymentModeRepository.findAll().stream()
                .map(paymentModeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentModeResponse> searchPaymentModes(String searchTerm) {
        log.debug("Searching payment modes with term: {}", searchTerm);
        return paymentModeRepository.searchByName(searchTerm).stream()
                .map(paymentModeMapper::toResponse)
                .toList();
    }

    @Override
    public PaymentModeResponse updatePaymentMode(Long id, UpdatePaymentModeRequest request) {
        log.info("Updating payment mode with id: {}", id);

        PaymentMode paymentMode = paymentModeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment mode", id));

        if (request.getName() != null
                && !request.getName().equals(paymentMode.getName())
                && paymentModeRepository.existsByName(request.getName())) {
            throw new ValidationException("A payment mode with name '" + request.getName() + "' already exists");
        }

        paymentModeMapper.updateEntity(request, paymentMode);

        PaymentMode updated = paymentModeRepository.save(paymentMode);
        log.info("Payment mode updated successfully");

        return paymentModeMapper.toResponse(updated);
    }

    @Override
    public void activatePaymentMode(Long id) {
        log.info("Activating payment mode with id: {}", id);

        PaymentMode paymentMode = paymentModeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment mode", id));

        paymentMode.setStatus(true);
        paymentModeRepository.save(paymentMode);

        log.info("Payment mode activated successfully");
    }

    @Override
    public void deactivatePaymentMode(Long id) {
        log.info("Deactivating payment mode with id: {}", id);

        PaymentMode paymentMode = paymentModeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment mode", id));

        paymentMode.setStatus(false);
        paymentModeRepository.save(paymentMode);

        log.info("Payment mode deactivated successfully");
    }
}
