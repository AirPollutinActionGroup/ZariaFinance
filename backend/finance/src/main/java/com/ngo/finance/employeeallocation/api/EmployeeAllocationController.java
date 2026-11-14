package com.ngo.finance.employeeallocation.api;

import com.ngo.finance.employeeallocation.dto.request.CreateEmployeeAllocationRequest;
import com.ngo.finance.employeeallocation.dto.request.EndEmployeeAllocationRequest;
import com.ngo.finance.employeeallocation.dto.response.EmployeeAllocationLogResponse;
import com.ngo.finance.employeeallocation.dto.response.EmployeeAllocationResponse;
import com.ngo.finance.employeeallocation.service.EmployeeAllocationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/employee-allocations")
@RequiredArgsConstructor
public class EmployeeAllocationController {

    private final EmployeeAllocationService employeeAllocationService;

    @GetMapping
    public ResponseEntity<List<EmployeeAllocationResponse>> getAllAllocations() {
        return ResponseEntity.ok(employeeAllocationService.getAllAllocations());
    }

    @PostMapping
    public ResponseEntity<EmployeeAllocationResponse> createAllocation(
            @Valid @RequestBody CreateEmployeeAllocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeAllocationService.createAllocation(request));
    }

    /** Removes an allocation made by mistake; the removal stays in the history. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAllocation(
            @PathVariable Long id, @RequestParam(required = false) String note) {
        employeeAllocationService.deleteAllocation(id, note);
        return ResponseEntity.noContent().build();
    }

    /** Ends an allocation (today, or on the given date) — it stays on record and in the history. */
    @PatchMapping("/{id}/end")
    public ResponseEntity<EmployeeAllocationResponse> endAllocation(
            @PathVariable Long id, @Valid @RequestBody(required = false) EndEmployeeAllocationRequest request) {
        return ResponseEntity.ok(employeeAllocationService.endAllocation(
                id, request != null ? request : new EndEmployeeAllocationRequest()));
    }

    /** An employee's allocation history (added / ended / removed), newest first. */
    @GetMapping("/history")
    public ResponseEntity<List<EmployeeAllocationLogResponse>> getHistory(@RequestParam Long employeeId) {
        return ResponseEntity.ok(employeeAllocationService.getHistory(employeeId));
    }
}
