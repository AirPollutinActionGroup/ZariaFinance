package com.ngo.finance.bankDetails.api;

import com.ngo.finance.bankDetails.dto.request.CreateBankDetailRequest;
import com.ngo.finance.bankDetails.dto.request.UpdateBankDetailRequest;
import com.ngo.finance.bankDetails.dto.response.BankDetailResponse;
import com.ngo.finance.bankDetails.service.BankDetailService;
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
 * REST Controller for Bank Details master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bank-details")
@Tag(name = "Bank Details", description = "Bank Details Master APIs")
public class BankDetailController {

    private final BankDetailService bankDetailService;

    @PostMapping
    @Operation(summary = "Register a new bank account")
    public ResponseEntity<BankDetailResponse> createBankDetail(
            @Valid @RequestBody CreateBankDetailRequest request) {
        log.info("POST /api/v1/bank-details - Registering new bank account");
        BankDetailResponse response = bankDetailService.createBankDetail(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bank account by ID")
    public ResponseEntity<BankDetailResponse> getBankDetail(@PathVariable Long id) {
        log.info("GET /api/v1/bank-details/{} - Fetching bank account", id);
        return ResponseEntity.ok(bankDetailService.getBankDetailById(id));
    }

    @GetMapping
    @Operation(summary = "Get all bank accounts")
    public ResponseEntity<List<BankDetailResponse>> getAllBankDetails(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/bank-details - Fetching all bank accounts");
        List<BankDetailResponse> response = (search != null && !search.isBlank())
                ? bankDetailService.searchBankDetails(search)
                : bankDetailService.getAllBankDetails();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a bank account")
    public ResponseEntity<BankDetailResponse> updateBankDetail(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBankDetailRequest request) {
        log.info("PUT /api/v1/bank-details/{} - Updating bank account", id);
        return ResponseEntity.ok(bankDetailService.updateBankDetail(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a bank account")
    public ResponseEntity<Void> activateBankDetail(@PathVariable Long id) {
        log.info("PATCH /api/v1/bank-details/{}/activate - Activating bank account", id);
        bankDetailService.activateBankDetail(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a bank account")
    public ResponseEntity<Void> deactivateBankDetail(@PathVariable Long id) {
        log.info("PATCH /api/v1/bank-details/{}/deactivate - Deactivating bank account", id);
        bankDetailService.deactivateBankDetail(id);
        return ResponseEntity.noContent().build();
    }
}
