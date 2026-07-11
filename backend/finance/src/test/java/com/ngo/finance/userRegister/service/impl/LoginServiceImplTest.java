package com.ngo.finance.userRegister.service.impl;

import com.ngo.finance.userRegister.entity.UserRegister;
import com.ngo.finance.userRegister.repository.LoginRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginServiceImplTest {

    @Mock
    private LoginRepository loginRepository;

    @InjectMocks
    private LoginServiceImpl loginService;

    @Test
    void login_throwsAccessDenied_whenUserIsNotApproved() {
        UserRegister user = new UserRegister();
        user.setUsername("testuser");
        user.setPassword("password");
        user.setIsApproved(2); // 1 = approved, 0 = pending, 2 = rejected

        when(loginRepository.findByUsername("testuser")).thenReturn(user);

        assertThrows(AccessDeniedException.class, () -> loginService.login("testuser", "password"));
    }
}
