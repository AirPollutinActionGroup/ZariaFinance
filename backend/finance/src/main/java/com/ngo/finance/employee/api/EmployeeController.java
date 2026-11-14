package com.ngo.finance.employee.api;

import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employee.dto.request.UpdateEmployeeRequest;
import com.ngo.finance.employee.dto.request.UpdateEmployeeStatusRequest;
import com.ngo.finance.employee.dto.response.EmployeeResponse;
import com.ngo.finance.employee.dto.response.EmployeeDocumentResponse;
import com.ngo.finance.employee.dto.response.EmployeeUpdateLogResponse;
import com.ngo.finance.employee.entity.EmployeeDocument;
import com.ngo.finance.employee.service.EmployeeDocumentService;
import com.ngo.finance.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST Controller for Employee master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/employees")
@Tag(name = "Employee", description = "Employee Master APIs")
public class EmployeeController {

    private final EmployeeService employeeService;

    private final EmployeeDocumentService employeeDocumentService;

    @PostMapping
    @Operation(summary = "Register a new employee")
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        log.info("POST /api/v1/employees - Registering new employee");
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing employee")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id, @Valid @RequestBody UpdateEmployeeRequest request) {
        log.info("PUT /api/v1/employees/{} - Updating employee", id);
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<EmployeeResponse> getEmployee(@PathVariable Long id) {
        log.info("GET /api/v1/employees/{} - Fetching employee", id);
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping
    @Operation(summary = "Get all employees")
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees(@RequestParam(required = false) String search) {
        log.info("GET /api/v1/employees - Fetching all employees");
        List<EmployeeResponse> response = (search != null && !search.isBlank())
                ? employeeService.searchEmployees(search)
                : employeeService.getAllEmployees();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change an employee's lifecycle status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id, @Valid @RequestBody UpdateEmployeeStatusRequest request) {
        log.info("PATCH /api/v1/employees/{}/status - Updating status to {}", id, request.getStatus());
        employeeService.updateStatus(id, request.getStatus());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/update-logs")
    @Operation(summary = "Get an employee's field-level change history")
    public ResponseEntity<List<EmployeeUpdateLogResponse>> getUpdateLogs(@PathVariable Long id) {
        log.info("GET /api/v1/employees/{}/update-logs - Fetching update logs", id);
        return ResponseEntity.ok(employeeService.getUpdateLogs(id));
    }

    @PostMapping(value = "/{id}/documents/{type}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload (or replace) an employee's PAN Card / Aadhaar Card",
            description = "type is PAN_CARD or AADHAAR_CARD; the file is PDF, JPG or PNG up to 5 MB")
    public ResponseEntity<EmployeeDocumentResponse> uploadDocument(
            @PathVariable Long id, @PathVariable String type, @RequestPart("file") MultipartFile file) {
        log.info("POST /api/v1/employees/{}/documents/{} - Uploading document", id, type);
        return ResponseEntity.ok(employeeDocumentService.upload(id, type, file));
    }

    @GetMapping("/{id}/documents/{type}")
    @Operation(summary = "Download an employee's PAN Card / Aadhaar Card")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id, @PathVariable String type) {
        log.info("GET /api/v1/employees/{}/documents/{} - Downloading document", id, type);
        EmployeeDocument document = employeeDocumentService.get(id, type);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(document.getFileName()).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(document.getContent());
    }

    @DeleteMapping("/{id}/documents/{type}")
    @Operation(summary = "Remove an employee's PAN Card / Aadhaar Card")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id, @PathVariable String type) {
        log.info("DELETE /api/v1/employees/{}/documents/{} - Removing document", id, type);
        employeeDocumentService.delete(id, type);
        return ResponseEntity.noContent().build();
    }
}
