package com.ngo.finance.financialYear.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.financialYear.dto.request.CreateFinancialYearRequest;
import com.ngo.finance.financialYear.dto.request.UpdateFinancialYearRequest;
import com.ngo.finance.financialYear.dto.response.FinancialYearResponse;
import com.ngo.finance.financialYear.entity.FinancialYear;
import com.ngo.finance.financialYear.mapper.FinancialYearMapper;
import com.ngo.finance.financialYear.repository.FinancialYearRepository;
import com.ngo.finance.financialYear.service.FinancialYearService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Financial Year operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FinancialYearServiceImpl implements FinancialYearService {

    private final FinancialYearRepository financialYearRepository;

    private final FinancialYearMapper financialYearMapper;

    @Override
    public FinancialYearResponse createFinancialYear(CreateFinancialYearRequest request) {
        log.info("Creating new financial year: {}", request.getCode());

        validateDateOrder(request.getStartDate(), request.getEndDate());

        if (financialYearRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new ValidationException("A financial year with code '" + request.getCode() + "' already exists");
        }

        List<FinancialYear> overlapping =
                financialYearRepository.findOverlapping(request.getStartDate(), request.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new ValidationException("This period overlaps with " + overlapping.get(0).getCode());
        }

        FinancialYear financialYear = financialYearMapper.toEntity(request);

        boolean makeCurrent = Boolean.TRUE.equals(request.getCurrent());
        if (makeCurrent) {
            clearCurrentFlag();
        }
        financialYear.setCurrent(makeCurrent);

        FinancialYear saved = financialYearRepository.save(financialYear);
        log.info("Financial year created successfully with id: {}", saved.getId());

        return financialYearMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialYearResponse getFinancialYearById(Long id) {
        log.debug("Fetching financial year with id: {}", id);
        FinancialYear financialYear = financialYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Financial year", id));
        return financialYearMapper.toResponse(financialYear);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinancialYearResponse> getAllFinancialYears() {
        log.debug("Fetching all financial years");
        return financialYearRepository.findAllByOrderByStartDateAsc().stream()
                .map(financialYearMapper::toResponse)
                .toList();
    }

    @Override
    public FinancialYearResponse updateFinancialYear(Long id, UpdateFinancialYearRequest request) {
        log.info("Updating financial year with id: {}", id);

        FinancialYear financialYear = financialYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Financial year", id));

        LocalDate newStartDate =
                request.getStartDate() != null ? request.getStartDate() : financialYear.getStartDate();
        LocalDate newEndDate = request.getEndDate() != null ? request.getEndDate() : financialYear.getEndDate();
        validateDateOrder(newStartDate, newEndDate);

        if (request.getCode() != null
                && !request.getCode().equalsIgnoreCase(financialYear.getCode())
                && financialYearRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new ValidationException("A financial year with code '" + request.getCode() + "' already exists");
        }

        List<FinancialYear> overlapping = financialYearRepository.findOverlapping(newStartDate, newEndDate).stream()
                .filter(fy -> !fy.getId().equals(id))
                .toList();
        if (!overlapping.isEmpty()) {
            throw new ValidationException("This period overlaps with " + overlapping.get(0).getCode());
        }

        financialYearMapper.updateEntity(request, financialYear);

        FinancialYear updated = financialYearRepository.save(financialYear);
        log.info("Financial year updated successfully");

        return financialYearMapper.toResponse(updated);
    }

    @Override
    public void setCurrentFinancialYear(Long id) {
        log.info("Setting financial year {} as current", id);

        FinancialYear financialYear = financialYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Financial year", id));

        clearCurrentFlag();
        financialYear.setCurrent(true);
        financialYearRepository.save(financialYear);

        log.info("Financial year {} set as current", id);
    }

    private void clearCurrentFlag() {
        financialYearRepository.findByCurrentTrue().ifPresent(fy -> {
            fy.setCurrent(false);
            financialYearRepository.save(fy);
        });
    }

    private void validateDateOrder(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new ValidationException("End date cannot be before the start date");
        }
    }
}
