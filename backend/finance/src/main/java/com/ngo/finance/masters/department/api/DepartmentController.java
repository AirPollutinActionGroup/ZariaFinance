package com.ngo.finance.masters.department.api;

import com.ngo.finance.masters.department.dto.request.CreateDepartmentRequest;
import com.ngo.finance.masters.department.dto.request.UpdateDepartmentRequest;
import com.ngo.finance.masters.department.dto.response.DepartmentResponse;
import com.ngo.finance.masters.department.service.DepartmentService;
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
 * REST Controller for Department master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/departments")
@Tag(name = "Department", description = "Department Master APIs")
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @Operation(summary = "Register a new department")
    public ResponseEntity<DepartmentResponse> createDepartment(
            @Valid @RequestBody CreateDepartmentRequest request) {
        log.info("POST /api/v1/departments - Registering new department");
        DepartmentResponse response = departmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<DepartmentResponse> getDepartment(@PathVariable Long id) {
        log.info("GET /api/v1/departments/{} - Fetching department", id);
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @GetMapping
    @Operation(summary = "Get all departments")
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/departments - Fetching all departments");
        List<DepartmentResponse> response = (search != null && !search.isBlank())
                ? departmentService.searchDepartments(search)
                : departmentService.getAllDepartments();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a department")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepartmentRequest request) {
        log.info("PUT /api/v1/departments/{} - Updating department", id);
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a department")
    public ResponseEntity<Void> activateDepartment(@PathVariable Long id) {
        log.info("PATCH /api/v1/departments/{}/activate - Activating department", id);
        departmentService.activateDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a department")
    public ResponseEntity<Void> deactivateDepartment(@PathVariable Long id) {
        log.info("PATCH /api/v1/departments/{}/deactivate - Deactivating department", id);
        departmentService.deactivateDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
