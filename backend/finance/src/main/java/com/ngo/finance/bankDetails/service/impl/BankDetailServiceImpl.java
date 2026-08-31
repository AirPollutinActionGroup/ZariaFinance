package com.ngo.finance.bankDetails.service.impl;

import com.ngo.finance.bankDetails.dto.request.CreateBankDetailRequest;
import com.ngo.finance.bankDetails.dto.request.UpdateBankDetailRequest;
import com.ngo.finance.bankDetails.dto.response.BankDetailResponse;
import com.ngo.finance.bankDetails.entity.BankDetail;
import com.ngo.finance.bankDetails.mapper.BankDetailMapper;
import com.ngo.finance.bankDetails.repository.BankDetailRepository;
import com.ngo.finance.bankDetails.service.BankDetailService;
import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donation.enums.Book;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Bank Details operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BankDetailServiceImpl implements BankDetailService {

    private final BankDetailRepository bankDetailRepository;

    private final BankDetailMapper bankDetailMapper;

    @Override
    public BankDetailResponse createBankDetail(CreateBankDetailRequest request) {
        log.info("Registering new bank account: {}", request.getAccountNumber());

        if (bankDetailRepository.existsByAccountNumber(request.getAccountNumber())) {
            throw new ValidationException(
                    "A bank account with number '" + request.getAccountNumber() + "' already exists");
        }

        BankDetail bankDetail = bankDetailMapper.toEntity(request);
        bankDetail.setStatus(request.getStatus() == null || request.getStatus());

        BankDetail saved = bankDetailRepository.save(bankDetail);
        log.info("Bank account registered successfully with id: {}", saved.getId());

        return bankDetailMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BankDetailResponse getBankDetailById(Long id) {
        log.debug("Fetching bank account with id: {}", id);
        BankDetail bankDetail = bankDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", id));
        return bankDetailMapper.toResponse(bankDetail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankDetailResponse> getAllBankDetails() {
        log.debug("Fetching all bank accounts");
        return bankDetailRepository.findAll().stream()
                .map(bankDetailMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankDetailResponse> searchBankDetails(String searchTerm) {
        log.debug("Searching bank accounts with term: {}", searchTerm);
        return bankDetailRepository.search(searchTerm).stream()
                .map(bankDetailMapper::toResponse)
                .toList();
    }

    @Override
    public BankDetailResponse updateBankDetail(Long id, UpdateBankDetailRequest request) {
        log.info("Updating bank account with id: {}", id);

        BankDetail bankDetail = bankDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", id));

        if (request.getAccountNumber() != null
                && !request.getAccountNumber().equals(bankDetail.getAccountNumber())
                && bankDetailRepository.existsByAccountNumber(request.getAccountNumber())) {
            throw new ValidationException(
                    "A bank account with number '" + request.getAccountNumber() + "' already exists");
        }

        bankDetailMapper.updateEntity(request, bankDetail);

        BankDetail updated = bankDetailRepository.save(bankDetail);
        log.info("Bank account updated successfully");

        return bankDetailMapper.toResponse(updated);
    }

    @Override
    public void activateBankDetail(Long id) {
        log.info("Activating bank account with id: {}", id);

        BankDetail bankDetail = bankDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", id));

        bankDetail.setStatus(true);
        bankDetailRepository.save(bankDetail);

        log.info("Bank account activated successfully");
    }

    @Override
    public void deactivateBankDetail(Long id) {
        log.info("Deactivating bank account with id: {}", id);

        BankDetail bankDetail = bankDetailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", id));

        bankDetail.setStatus(false);
        bankDetailRepository.save(bankDetail);

        log.info("Bank account deactivated successfully");
    }
}
