package com.ngo.finance.financialYear.service;

import com.ngo.finance.financialYear.dto.request.CreateFinancialYearRequest;
import com.ngo.finance.financialYear.dto.request.UpdateFinancialYearRequest;
import com.ngo.finance.financialYear.dto.response.FinancialYearResponse;
import java.util.List;

/**
 * Service interface for Financial Year operations
 */
public interface FinancialYearService {

    FinancialYearResponse createFinancialYear(CreateFinancialYearRequest request);

    FinancialYearResponse getFinancialYearById(Long id);

    List<FinancialYearResponse> getAllFinancialYears();

    FinancialYearResponse updateFinancialYear(Long id, UpdateFinancialYearRequest request);

    void setCurrentFinancialYear(Long id);
}
