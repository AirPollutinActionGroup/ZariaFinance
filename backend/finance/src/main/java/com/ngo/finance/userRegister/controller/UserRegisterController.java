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
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userRegister")
public class UserRegisterController {
    private final UserRegisterService userRegisterService;

    @PostMapping()
    public ResponseEntity<UserRegisterDto> registerUser(
            @Valid @RequestBody AddUserRegisterDto addUserRegisterDto) {
        UserRegisterDto userRegisterDto = userRegisterService.registerUser(addUserRegisterDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userRegisterDto);
    }

    @GetMapping
    public String getAllUsers() {
        // List<UserRegisterDto> users = userRegisterService.getAllUsers();

        return "dddddd";// ResponseEntity.status(HttpStatus.OK).body(users);
    }

}
