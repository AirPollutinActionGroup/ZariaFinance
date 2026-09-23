package com.ngo.finance.userRegister.controller;

import com.ngo.finance.userRegister.dto.LoginRequestDto;
import com.ngo.finance.userRegisterNew.dto.response.UserRegisterResponse;
import com.ngo.finance.userRegisterNew.service.UserRegisterNewService;
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

    private final UserRegisterNewService userRegisterNewService;

    @PostMapping
    public ResponseEntity<UserRegisterResponse> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        UserRegisterResponse user =
                userRegisterNewService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

}
