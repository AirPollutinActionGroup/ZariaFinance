package com.ngo.finance.userRegister.controller;

import com.ngo.finance.userRegister.dto.LoginRequestDto;
import com.ngo.finance.userRegister.dto.UserRegisterDto;
import com.ngo.finance.userRegister.service.LoginService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userLogin")
public class UserLoginController {

    private final LoginService loginService;

    @PostMapping
    public ResponseEntity<UserRegisterDto> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        UserRegisterDto user = loginService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

}
