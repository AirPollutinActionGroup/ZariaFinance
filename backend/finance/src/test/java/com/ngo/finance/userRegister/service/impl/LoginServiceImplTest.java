package com.ngo.finance.userRegister.service.impl;

import com.ngo.finance.userRegister.entity.UserRegister;
import com.ngo.finance.userRegister.repository.LoginRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.ngo.finance.common.exception.AccountPendingApprovalException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginServiceImplTest {

    @Mock
    private LoginRepository loginRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private LoginServiceImpl loginService;

    @Test
    void login_throwsAccountPending_whenUserIsNotApproved() {
        UserRegister user = new UserRegister();
        user.setUsername("testuser");
        user.setPassword("hashedPassword");
        user.setIsApproved(2); // 1 = approved, 2 = pending, 3 = rejected

        when(loginRepository.findByUsername("testuser")).thenReturn(user);
        when(passwordEncoder.matches("password", "hashedPassword")).thenReturn(true);

        assertThrows(AccountPendingApprovalException.class, () -> loginService.login("testuser", "password"));
    }
}
