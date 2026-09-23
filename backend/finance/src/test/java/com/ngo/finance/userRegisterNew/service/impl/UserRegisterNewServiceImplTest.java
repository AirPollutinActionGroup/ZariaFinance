package com.ngo.finance.userRegisterNew.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ngo.finance.common.exception.AccountPendingApprovalException;
import com.ngo.finance.common.exception.AccountRejectedException;
import com.ngo.finance.common.exception.InvalidCredentialsException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.organizationRegister.repository.OrganizationRegisterRepository;
import com.ngo.finance.roleDirectory.entity.RoleMaster;
import com.ngo.finance.roleDirectory.repository.RoleMasterRepository;
import com.ngo.finance.roleDirectory.repository.RoleMasterUserRepository;
import com.ngo.finance.userRegisterNew.dto.response.UserRegisterResponse;
import com.ngo.finance.userRegisterNew.entity.UserRegisterNew;
import com.ngo.finance.userRegisterNew.repository.UserRegisterNewRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserRegisterNewServiceImplTest {

    @Mock
    private UserRegisterNewRepository userRegisterNewRepository;

    @Mock
    private RoleMasterRepository roleMasterRepository;

    @Mock
    private RoleMasterUserRepository roleMasterUserRepository;

    @Mock
    private OrganizationRegisterRepository organisationRegisterRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserRegisterNewServiceImpl userRegisterNewService;

    private static UserRegisterNew approvedUser() {
        UserRegisterNew user = new UserRegisterNew();
        user.setId(1L);
        user.setFirstName("Priya");
        user.setLastName("Nair");
        user.setUsername("testuser");
        user.setPassword("hashed-password");
        user.setRoleId(6L);
        user.setOrganizationId(1L);
        user.setIsApproved(1); // 1 = approved, 2 = pending, 3 = rejected
        return user;
    }

    @Test
    void login_returnsResponse_whenCredentialsValidAndApproved() {
        UserRegisterNew user = approvedUser();
        RoleMaster role = RoleMaster.builder()
                .roleName("Chief Financial Officer")
                .permissionRole("FINANCE_OFFICER")
                .build();

        when(userRegisterNewRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed-password")).thenReturn(true);
        when(roleMasterRepository.findById(6L)).thenReturn(Optional.of(role));
        when(organisationRegisterRepository.findById(1L)).thenReturn(Optional.empty());

        UserRegisterResponse response = userRegisterNewService.login("testuser", "password");

        assertEquals("testuser", response.getUsername());
        assertEquals("FINANCE_OFFICER", response.getPermissionRole());
        assertEquals("APPROVED", response.getApprovalStatus());
    }

    @Test
    void login_throwsInvalidCredentials_whenUsernameNotFound() {
        when(userRegisterNewRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class,
                () -> userRegisterNewService.login("missing", "password"));
    }

    @Test
    void login_throwsInvalidCredentials_whenPasswordWrong() {
        UserRegisterNew user = approvedUser();
        when(userRegisterNewRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class,
                () -> userRegisterNewService.login("testuser", "wrong-password"));
    }

    @Test
    void login_throwsAccountPending_whenIsApprovedPending() {
        UserRegisterNew user = approvedUser();
        user.setIsApproved(2);
        when(userRegisterNewRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed-password")).thenReturn(true);

        assertThrows(AccountPendingApprovalException.class,
                () -> userRegisterNewService.login("testuser", "password"));
    }

    @Test
    void login_throwsAccountRejected_whenIsApprovedRejected() {
        UserRegisterNew user = approvedUser();
        user.setIsApproved(3);
        when(userRegisterNewRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed-password")).thenReturn(true);

        assertThrows(AccountRejectedException.class,
                () -> userRegisterNewService.login("testuser", "password"));
    }

    @Test
    void login_throwsValidationException_whenUsernameOrPasswordBlank() {
        assertThrows(ValidationException.class, () -> userRegisterNewService.login("", "password"));
        assertThrows(ValidationException.class, () -> userRegisterNewService.login("testuser", ""));
    }

    @Test
    void approve_autoAssignsRoleMasterUser_whenNotAlreadyAssigned() {
        UserRegisterNew user = approvedUser();
        user.setIsApproved(2);

        when(userRegisterNewRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRegisterNewRepository.save(any())).thenReturn(user);
        when(roleMasterUserRepository.existsByRoleMasterIdAndUserId(6L, 1L)).thenReturn(false);
        when(roleMasterRepository.findById(6L)).thenReturn(Optional.empty());
        when(organisationRegisterRepository.findById(1L)).thenReturn(Optional.empty());

        userRegisterNewService.approve(1L);

        verify(roleMasterUserRepository, times(1)).save(any());
    }

    @Test
    void approve_doesNotDuplicateAssignment_whenAlreadyAssigned() {
        UserRegisterNew user = approvedUser();
        user.setIsApproved(2);

        when(userRegisterNewRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRegisterNewRepository.save(any())).thenReturn(user);
        when(roleMasterUserRepository.existsByRoleMasterIdAndUserId(6L, 1L)).thenReturn(true);
        when(roleMasterRepository.findById(6L)).thenReturn(Optional.empty());
        when(organisationRegisterRepository.findById(1L)).thenReturn(Optional.empty());

        userRegisterNewService.approve(1L);

        verify(roleMasterUserRepository, never()).save(any());
    }
}
