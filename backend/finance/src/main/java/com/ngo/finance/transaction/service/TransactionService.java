package com.ngo.finance.transaction.service;

import com.ngo.finance.transaction.dto.request.CreateTransactionRequest;
import com.ngo.finance.transaction.dto.response.TransactionResponse;
import java.util.List;

/**
 * Service interface for Transaction (Payment Window Cr/Dr) operations
 */
public interface TransactionService {

    TransactionResponse createTransaction(CreateTransactionRequest request);

    TransactionResponse getTransactionByCode(String transactionCode);

    List<TransactionResponse> getAllTransactions();

    void deleteTransaction(Long id);
}
