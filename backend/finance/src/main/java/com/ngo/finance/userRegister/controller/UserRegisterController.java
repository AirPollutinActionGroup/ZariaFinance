package com.ngo.finance.userRegister.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import com.ngo.finance.userRegister.service.UserRegisterService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.ngo.finance.userRegister.dto.AddUserRegisterDto;
import com.ngo.finance.userRegister.dto.UserRegisterDto;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashMap;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userRegister")
public class UserRegisterController {

    private final UserRegisterService userRegisterService;

    @PostMapping
    public ResponseEntity<UserRegisterDto> registerUser(
            @Valid @RequestBody AddUserRegisterDto addUserRegisterDto) {
        UserRegisterDto userRegisterDto = userRegisterService.registerUser(addUserRegisterDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userRegisterDto);
    }

    @GetMapping
    public ResponseEntity<List<UserRegisterDto>> getAllUsers() {
        List<UserRegisterDto> users = userRegisterService.getAllUsers();

        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @Valid @PathVariable Long userId) {
        userRegisterService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserRegisterDto> getSingleUser(@Valid @PathVariable Long userId) {

        UserRegisterDto userData = userRegisterService.getUserById(userId);
        return ResponseEntity.ok(userData);
    }

    @GetMapping("/verify-username")
    public ResponseEntity<Map<String, Object>> verifyUsername(
            @Valid @RequestParam String username) {
        boolean exists = userRegisterService.userNameVerified(username);

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<UserRegisterDto>> getPendingUsers() {
        List<UserRegisterDto> pendingUsers = userRegisterService.getPendingUsers();
        return ResponseEntity.ok(pendingUsers);
    }

    @PostMapping("/userApprove")
    public ResponseEntity<Map<String, Object>> approveUser(
            @Valid @RequestParam Long userId,
            @Valid @RequestParam Long primaryId,
            @Valid @RequestParam Integer approveReject) {

        UserRegisterDto approvedUser = userRegisterService.approveRejectUser(userId, primaryId, approveReject);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User approved successfully");
        response.put("result", approvedUser);

        return ResponseEntity.ok(response);
    }

}
