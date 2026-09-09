package com.ngo.finance.employeeallocation.api;

import com.ngo.finance.employeeallocation.dto.request.CreateEmployeeAllocationRequest;
import com.ngo.finance.employeeallocation.dto.response.EmployeeAllocationResponse;
import com.ngo.finance.employeeallocation.service.EmployeeAllocationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAllocation(@PathVariable Long id) {
        employeeAllocationService.deleteAllocation(id);
        return ResponseEntity.noContent().build();
    }
}
