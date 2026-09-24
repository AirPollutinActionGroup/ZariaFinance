package com.ngo.finance.transaction.api;

import com.ngo.finance.transaction.dto.request.CreateTransactionRequest;
import com.ngo.finance.transaction.dto.response.TransactionResponse;
import com.ngo.finance.transaction.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Transaction (Payment Window Cr/Dr) operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transactions", description = "Payment Window (Debit/Credit) Transaction APIs")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @Operation(summary = "Record a new transaction")
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody CreateTransactionRequest request) {
        log.info("POST /api/v1/transactions - Recording new transaction");
        TransactionResponse response = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all transactions")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions() {
        log.info("GET /api/v1/transactions - Fetching all transactions");
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/{transactionCode}")
    @Operation(summary = "Get transaction by transaction code")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable String transactionCode) {
        log.info("GET /api/v1/transactions/{} - Fetching transaction", transactionCode);
        return ResponseEntity.ok(transactionService.getTransactionByCode(transactionCode));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction (reverses any Inflow Budget receipt it posted)")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        log.info("DELETE /api/v1/transactions/{} - Deleting transaction", id);
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
