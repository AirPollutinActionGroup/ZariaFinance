package com.ngo.finance.paymentType.ledger.api;

import com.ngo.finance.paymentType.ledger.dto.request.CreatePaymentTypeLedgerRequest;
import com.ngo.finance.paymentType.ledger.dto.request.UpdatePaymentTypeLedgerRequest;
import com.ngo.finance.paymentType.ledger.dto.response.PaymentTypeLedgerResponse;
import com.ngo.finance.paymentType.ledger.service.PaymentTypeLedgerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Payment Type Ledger master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payment-type-ledgers")
@Tag(name = "PaymentTypeLedger", description = "Payment Type Ledger Master APIs")
public class PaymentTypeLedgerController {

    private final PaymentTypeLedgerService ledgerService;

    @PostMapping
    @Operation(summary = "Register a new payment type ledger")
    public ResponseEntity<PaymentTypeLedgerResponse> createLedger(
            @Valid @RequestBody CreatePaymentTypeLedgerRequest request) {
        log.info("POST /api/v1/payment-type-ledgers - Registering new payment type ledger");
        PaymentTypeLedgerResponse response = ledgerService.createLedger(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment type ledger by ID")
    public ResponseEntity<PaymentTypeLedgerResponse> getLedger(@PathVariable Long id) {
        log.info("GET /api/v1/payment-type-ledgers/{} - Fetching payment type ledger", id);
        return ResponseEntity.ok(ledgerService.getLedgerById(id));
    }

    @GetMapping
    @Operation(summary = "Get all payment type ledgers")
    public ResponseEntity<List<PaymentTypeLedgerResponse>> getAllLedgers(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/payment-type-ledgers - Fetching all payment type ledgers");
        List<PaymentTypeLedgerResponse> response = (search != null && !search.isBlank())
                ? ledgerService.searchLedgers(search)
                : ledgerService.getAllLedgers();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a payment type ledger")
    public ResponseEntity<PaymentTypeLedgerResponse> updateLedger(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePaymentTypeLedgerRequest request) {
        log.info("PUT /api/v1/payment-type-ledgers/{} - Updating payment type ledger", id);
        return ResponseEntity.ok(ledgerService.updateLedger(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a payment type ledger")
    public ResponseEntity<Void> activateLedger(@PathVariable Long id) {
        log.info("PATCH /api/v1/payment-type-ledgers/{}/activate - Activating payment type ledger", id);
        ledgerService.activateLedger(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a payment type ledger")
    public ResponseEntity<Void> deactivateLedger(@PathVariable Long id) {
        log.info("PATCH /api/v1/payment-type-ledgers/{}/deactivate - Deactivating payment type ledger", id);
        ledgerService.deactivateLedger(id);
        return ResponseEntity.noContent().build();
    }
}
