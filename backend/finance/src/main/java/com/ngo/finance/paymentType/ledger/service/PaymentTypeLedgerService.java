package com.ngo.finance.paymentType.ledger.service;

import com.ngo.finance.paymentType.ledger.dto.request.CreatePaymentTypeLedgerRequest;
import com.ngo.finance.paymentType.ledger.dto.request.UpdatePaymentTypeLedgerRequest;
import com.ngo.finance.paymentType.ledger.dto.response.PaymentTypeLedgerResponse;
import java.util.List;

/**
 * Service interface for Payment Type Ledger operations
 */
public interface PaymentTypeLedgerService {

    PaymentTypeLedgerResponse createLedger(CreatePaymentTypeLedgerRequest request);

    PaymentTypeLedgerResponse getLedgerById(Long id);

    List<PaymentTypeLedgerResponse> getAllLedgers();

    List<PaymentTypeLedgerResponse> searchLedgers(String searchTerm);

    PaymentTypeLedgerResponse updateLedger(Long id, UpdatePaymentTypeLedgerRequest request);

    void activateLedger(Long id);

    void deactivateLedger(Long id);
}
