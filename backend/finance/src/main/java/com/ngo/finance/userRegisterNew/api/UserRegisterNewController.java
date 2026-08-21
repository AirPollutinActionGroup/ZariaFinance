package com.ngo.finance.userRegisterNew.api;

import com.ngo.finance.userRegisterNew.dto.request.CreateUserRegisterRequest;
import com.ngo.finance.userRegisterNew.dto.response.UserRegisterResponse;
import com.ngo.finance.userRegisterNew.service.UserRegisterNewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for the extended registration flow (register-extended),
 * which captures a Role Directory role and an Organisation alongside the
 * applicant's account details.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user-registrations")
@Tag(name = "User Registration", description = "Extended user registration APIs")
public class UserRegisterNewController {

    private final UserRegisterNewService userRegisterNewService;

    @PostMapping
    @Operation(summary = "Register a new user with a role and organisation")
    public ResponseEntity<UserRegisterResponse> register(
            @Valid @RequestBody CreateUserRegisterRequest request) {
        log.info("POST /api/v1/user-registrations - Registering new user: {}", request.getUsername());
        UserRegisterResponse response = userRegisterNewService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/verify-username")
    @Operation(summary = "Check whether a username is already taken")
    public ResponseEntity<Map<String, Object>> verifyUsername(@RequestParam String username) {
        log.info("GET /api/v1/user-registrations/verify-username - Checking username: {}", username);
        boolean exists = userRegisterNewService.usernameExists(username);

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all extended registration requests")
    public ResponseEntity<List<UserRegisterResponse>> getAllRequests() {
        log.info("GET /api/v1/user-registrations - Fetching all user requests");
        return ResponseEntity.ok(userRegisterNewService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an extended registration request by ID")
    public ResponseEntity<UserRegisterResponse> getRequest(@PathVariable Long id) {
        log.info("GET /api/v1/user-registrations/{} - Fetching user request", id);
        return ResponseEntity.ok(userRegisterNewService.getById(id));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve a user request")
    public ResponseEntity<UserRegisterResponse> approve(@PathVariable Long id) {
        log.info("PATCH /api/v1/user-registrations/{}/approve - Approving user request", id);
        return ResponseEntity.ok(userRegisterNewService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Reject a user request")
    public ResponseEntity<UserRegisterResponse> reject(@PathVariable Long id) {
        log.info("PATCH /api/v1/user-registrations/{}/reject - Rejecting user request", id);
        return ResponseEntity.ok(userRegisterNewService.reject(id));
    }
}
