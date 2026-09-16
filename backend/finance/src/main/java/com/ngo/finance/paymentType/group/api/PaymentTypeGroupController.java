package com.ngo.finance.paymentType.group.api;

import com.ngo.finance.paymentType.group.dto.request.CreatePaymentTypeGroupRequest;
import com.ngo.finance.paymentType.group.dto.request.UpdatePaymentTypeGroupRequest;
import com.ngo.finance.paymentType.group.dto.response.PaymentTypeGroupResponse;
import com.ngo.finance.paymentType.group.service.PaymentTypeGroupService;
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
 * REST Controller for Payment Type Group master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payment-type-groups")
@Tag(name = "PaymentTypeGroup", description = "Payment Type Group Master APIs")
public class PaymentTypeGroupController {

    private final PaymentTypeGroupService groupService;

    @PostMapping
    @Operation(summary = "Register a new payment type group")
    public ResponseEntity<PaymentTypeGroupResponse> createGroup(
            @Valid @RequestBody CreatePaymentTypeGroupRequest request) {
        log.info("POST /api/v1/payment-type-groups - Registering new payment type group");
        PaymentTypeGroupResponse response = groupService.createGroup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment type group by ID")
    public ResponseEntity<PaymentTypeGroupResponse> getGroup(@PathVariable Long id) {
        log.info("GET /api/v1/payment-type-groups/{} - Fetching payment type group", id);
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @GetMapping
    @Operation(summary = "Get all payment type groups")
    public ResponseEntity<List<PaymentTypeGroupResponse>> getAllGroups(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/payment-type-groups - Fetching all payment type groups");
        List<PaymentTypeGroupResponse> response = (search != null && !search.isBlank())
                ? groupService.searchGroups(search)
                : groupService.getAllGroups();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a payment type group")
    public ResponseEntity<PaymentTypeGroupResponse> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePaymentTypeGroupRequest request) {
        log.info("PUT /api/v1/payment-type-groups/{} - Updating payment type group", id);
        return ResponseEntity.ok(groupService.updateGroup(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a payment type group")
    public ResponseEntity<Void> activateGroup(@PathVariable Long id) {
        log.info("PATCH /api/v1/payment-type-groups/{}/activate - Activating payment type group", id);
        groupService.activateGroup(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a payment type group")
    public ResponseEntity<Void> deactivateGroup(@PathVariable Long id) {
        log.info("PATCH /api/v1/payment-type-groups/{}/deactivate - Deactivating payment type group", id);
        groupService.deactivateGroup(id);
        return ResponseEntity.noContent().build();
    }
}
