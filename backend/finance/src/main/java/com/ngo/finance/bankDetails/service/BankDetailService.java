package com.ngo.finance.bankDetails.service;

import com.ngo.finance.bankDetails.dto.request.CreateBankDetailRequest;
import com.ngo.finance.bankDetails.dto.request.UpdateBankDetailRequest;
import com.ngo.finance.bankDetails.dto.response.BankDetailResponse;
import java.util.List;

/**
 * Service interface for Bank Details operations
 */
public interface BankDetailService {

    BankDetailResponse createBankDetail(CreateBankDetailRequest request);

    BankDetailResponse getBankDetailById(Long id);

    List<BankDetailResponse> getAllBankDetails();

    List<BankDetailResponse> searchBankDetails(String searchTerm);

    BankDetailResponse updateBankDetail(Long id, UpdateBankDetailRequest request);

    void activateBankDetail(Long id);

    void deactivateBankDetail(Long id);
}
