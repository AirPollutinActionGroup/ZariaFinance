package com.ngo.finance.inflowbudget.service;

import com.ngo.finance.inflowbudget.dto.request.RecordInflowReceiptRequest;
import com.ngo.finance.inflowbudget.dto.response.InflowBudgetLineResponse;
import java.util.List;

public interface InflowBudgetService {

    List<InflowBudgetLineResponse> getAllLines();

    InflowBudgetLineResponse getLineById(Long id);

    InflowBudgetLineResponse recordReceipt(Long id, RecordInflowReceiptRequest request);

    /** Deletes the instalment posted by this transaction — used when the transaction that posted it is deleted. */
    InflowBudgetLineResponse reverseReceipt(Long id, Long transactionId);
}
