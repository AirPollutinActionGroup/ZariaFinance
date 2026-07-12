package com.ngo.finance.userRegister.service.impl;

import org.springframework.stereotype.Service;

import com.ngo.finance.common.exception.AccountPendingApprovalException;
import com.ngo.finance.common.exception.AccountRejectedException;
import com.ngo.finance.common.exception.InvalidCredentialsException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.userRegister.dto.UserRegisterDto;
import com.ngo.finance.userRegister.entity.UserRegister;
import com.ngo.finance.userRegister.repository.LoginRepository;
import com.ngo.finance.userRegister.service.LoginService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final LoginRepository loginRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserRegisterDto login(String username, String password) {
        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
            throw new ValidationException("Username and password must not be empty");
        }

        UserRegister user = loginRepository.findByUsername(username);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        if (!user.getIsApproved().equals(1)) { // 1 = approved, 2 = pending, 3 = rejected
            if (user.getIsApproved().equals(2)) {
                throw new AccountPendingApprovalException("User account is pending for approval");
            }
            throw new AccountRejectedException("User account has been rejected");
        }

        UserRegisterDto userRegisterDto = new UserRegisterDto();
        userRegisterDto.setId(user.getId());
        userRegisterDto.setFirstName(user.getFirstName());
        userRegisterDto.setLastName(user.getLastName());
        userRegisterDto.setEmailId(user.getEmailId());
        userRegisterDto.setMobileNo(user.getMobileNo());
        userRegisterDto.setUsername(user.getUsername());
        userRegisterDto.setRole(user.getRole());
        userRegisterDto.setStatus(user.getStatus());

        return userRegisterDto;
    }

}
