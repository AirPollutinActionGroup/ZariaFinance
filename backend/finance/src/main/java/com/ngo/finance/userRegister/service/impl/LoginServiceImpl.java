package com.ngo.finance.userRegister.service.impl;

import org.springframework.stereotype.Service;

import com.ngo.finance.userRegister.dto.UserRegisterDto;
import com.ngo.finance.userRegister.entity.UserRegister;
import com.ngo.finance.userRegister.repository.LoginRepository;
import com.ngo.finance.userRegister.service.LoginService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final LoginRepository loginRepository;

    @Override
    public UserRegisterDto login(String username, String password) {
        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Username and password must not be empty");
        }

        UserRegister user = loginRepository.findByUsername(username);
        if (user == null || !password.equals(user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setId(user.getId());
        userRegisterDto.setFirstName(user.getFirstName());
        userRegisterDto.setLastName(user.getLastName());
        userRegisterDto.setEmailId(user.getEmailId());
        userRegisterDto.setMobileNo(user.getMobileNo());
        userRegisterDto.setUsername(user.getUsername());
        userRegisterDto.setPassword(user.getPassword());
        userRegisterDto.setRole(user.getRole());
        userRegisterDto.setStatus(user.getStatus());

        return userRegisterDto;
    }

}
