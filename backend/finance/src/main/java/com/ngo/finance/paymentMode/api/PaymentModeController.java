package com.ngo.finance.paymentMode.api;

import com.ngo.finance.paymentMode.dto.request.CreatePaymentModeRequest;
import com.ngo.finance.paymentMode.dto.request.UpdatePaymentModeRequest;
import com.ngo.finance.paymentMode.dto.response.PaymentModeResponse;
import com.ngo.finance.paymentMode.service.PaymentModeService;
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
 * REST Controller for Payment Mode master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payment-modes")
@Tag(name = "Payment Mode", description = "Payment Mode Master APIs")
public class PaymentModeController {

    private final PaymentModeService paymentModeService;

    @PostMapping
    @Operation(summary = "Register a new payment mode")
    public ResponseEntity<PaymentModeResponse> createPaymentMode(
            @Valid @RequestBody CreatePaymentModeRequest request) {
        log.info("POST /api/v1/payment-modes - Registering new payment mode");
        PaymentModeResponse response = paymentModeService.createPaymentMode(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment mode by ID")
    public ResponseEntity<PaymentModeResponse> getPaymentMode(@PathVariable Long id) {
        log.info("GET /api/v1/payment-modes/{} - Fetching payment mode", id);
        return ResponseEntity.ok(paymentModeService.getPaymentModeById(id));
    }

    @GetMapping
    @Operation(summary = "Get all payment modes")
    public ResponseEntity<List<PaymentModeResponse>> getAllPaymentModes(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/payment-modes - Fetching all payment modes");
        List<PaymentModeResponse> response = (search != null && !search.isBlank())
                ? paymentModeService.searchPaymentModes(search)
                : paymentModeService.getAllPaymentModes();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a payment mode")
    public ResponseEntity<PaymentModeResponse> updatePaymentMode(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePaymentModeRequest request) {
        log.info("PUT /api/v1/payment-modes/{} - Updating payment mode", id);
        return ResponseEntity.ok(paymentModeService.updatePaymentMode(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a payment mode")
    public ResponseEntity<Void> activatePaymentMode(@PathVariable Long id) {
        log.info("PATCH /api/v1/payment-modes/{}/activate - Activating payment mode", id);
        paymentModeService.activatePaymentMode(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a payment mode")
    public ResponseEntity<Void> deactivatePaymentMode(@PathVariable Long id) {
        log.info("PATCH /api/v1/payment-modes/{}/deactivate - Deactivating payment mode", id);
        paymentModeService.deactivatePaymentMode(id);
        return ResponseEntity.noContent().build();
    }
}
