package com.ngo.finance.userRegisterNew.service.impl;

import com.ngo.finance.common.exception.AccountPendingApprovalException;
import com.ngo.finance.common.exception.AccountRejectedException;
import com.ngo.finance.common.exception.InvalidCredentialsException;
import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.organizationRegister.entity.OrganizationRegister;
import com.ngo.finance.organizationRegister.enums.OrganizationStatus;
import com.ngo.finance.organizationRegister.repository.OrganizationRegisterRepository;
import com.ngo.finance.roleDirectory.entity.RoleMaster;
import com.ngo.finance.roleDirectory.entity.RoleMasterUser;
import com.ngo.finance.roleDirectory.repository.RoleMasterRepository;
import com.ngo.finance.roleDirectory.repository.RoleMasterUserRepository;
import com.ngo.finance.userRegisterNew.dto.request.CreateUserRegisterRequest;
import com.ngo.finance.userRegisterNew.dto.response.UserRegisterResponse;
import com.ngo.finance.userRegisterNew.entity.UserRegisterNew;
import com.ngo.finance.userRegisterNew.repository.UserRegisterNewRepository;
import com.ngo.finance.userRegisterNew.service.UserRegisterNewService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for the extended registration flow. Fully
 * standalone from the legacy userRegister module — its own table
 * (user_register_new) and repository — but validates the selected role and
 * organisation exist and are active before saving.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserRegisterNewServiceImpl implements UserRegisterNewService {

    private static final int APPROVAL_APPROVED = 1;
    private static final int APPROVAL_PENDING = 2;
    private static final int APPROVAL_REJECTED = 3;

    private final UserRegisterNewRepository userRegisterNewRepository;

    private final RoleMasterRepository roleMasterRepository;

    private final RoleMasterUserRepository roleMasterUserRepository;

    private final OrganizationRegisterRepository organisationRegisterRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public UserRegisterResponse register(CreateUserRegisterRequest request) {
        log.info("Registering new user (extended): {}", request.getUsername());

        if (userRegisterNewRepository.existsByEmailId(request.getEmailId())) {
            throw new ValidationException("An account with email '" + request.getEmailId() + "' already exists");
        }
        if (userRegisterNewRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRegisterNewRepository.existsByMobileNo(request.getMobileNo())) {
            throw new ValidationException(
                    "An account with mobile number '" + request.getMobileNo() + "' already exists");
        }

        RoleMaster role = roleMasterRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", request.getRoleId()));
        if (!Boolean.TRUE.equals(role.getStatus())) {
            throw new ValidationException("Selected role is not active");
        }

        OrganizationRegister organisation = organisationRegisterRepository.findById(request.getOrganisationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organisation", request.getOrganisationId()));
        if (organisation.getStatus() != OrganizationStatus.ACTIVE) {
            throw new ValidationException("Selected organisation is not active");
        }

        UserRegisterNew user = new UserRegisterNew();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName() == null || request.getLastName().isBlank()
                ? null
                : request.getLastName().trim());
        user.setEmailId(request.getEmailId().trim());
        user.setMobileNo(request.getMobileNo().trim());
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoleId(role.getId());
        user.setOrganizationId(organisation.getId());

        UserRegisterNew saved = userRegisterNewRepository.save(user);
        log.info("User registered successfully with id: {}", saved.getId());

        return toResponse(saved, role, organisation);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean usernameExists(String username) {
        return userRegisterNewRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRegisterResponse> listAll() {
        log.debug("Fetching all extended registration requests");
        return userRegisterNewRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserRegisterResponse getById(Long id) {
        log.debug("Fetching extended registration request with id: {}", id);
        UserRegisterNew user = userRegisterNewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User request", id));
        return toResponse(user);
    }

    @Override
    public UserRegisterResponse approve(Long id) {
        log.info("Approving user request with id: {}", id);
        UserRegisterNew user = userRegisterNewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User request", id));
        user.setIsApproved(APPROVAL_APPROVED);
        UserRegisterNew saved = userRegisterNewRepository.save(user);

        if (!roleMasterUserRepository.existsByRoleMasterIdAndUserId(saved.getRoleId(), saved.getId())) {
            roleMasterUserRepository.save(RoleMasterUser.builder()
                    .roleMasterId(saved.getRoleId())
                    .userId(saved.getId())
                    .build());
            log.info("User {} auto-assigned to role {} on approval", saved.getId(), saved.getRoleId());
        }

        return toResponse(saved);
    }

    @Override
    public UserRegisterResponse reject(Long id) {
        log.info("Rejecting user request with id: {}", id);
        UserRegisterNew user = userRegisterNewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User request", id));
        user.setIsApproved(APPROVAL_REJECTED);
        return toResponse(userRegisterNewRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserRegisterResponse login(String username, String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new ValidationException("Username and password must not be empty");
        }

        UserRegisterNew user = userRegisterNewRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        Integer isApproved = user.getIsApproved();
        if (isApproved == null || isApproved != APPROVAL_APPROVED) {
            if (isApproved != null && isApproved == APPROVAL_PENDING) {
                throw new AccountPendingApprovalException("User account is pending for approval");
            }
            throw new AccountRejectedException("User account has been rejected");
        }

        return toResponse(user);
    }

    /** Resolves the role/organisation for a persisted row before mapping. */
    private UserRegisterResponse toResponse(UserRegisterNew user) {
        RoleMaster role = roleMasterRepository.findById(user.getRoleId()).orElse(null);
        OrganizationRegister organisation =
                organisationRegisterRepository.findById(user.getOrganizationId()).orElse(null);
        return toResponse(user, role, organisation);
    }

    private UserRegisterResponse toResponse(UserRegisterNew user, RoleMaster role, OrganizationRegister organisation) {
        return UserRegisterResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .emailId(user.getEmailId())
                .mobileNo(user.getMobileNo())
                .username(user.getUsername())
                .roleId(user.getRoleId())
                .roleName(role != null ? role.getRoleName() : null)
                .permissionRole(role != null ? role.getPermissionRole() : null)
                .organisationId(user.getOrganizationId())
                .organisationName(organisation != null ? organisation.getName() : null)
                .status(user.getStatus())
                .approvalStatus(approvalStatusLabel(user.getIsApproved()))
                .approvedBy(user.getApprovedBy())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private static String approvalStatusLabel(Integer isApproved) {
        if (isApproved != null && isApproved == APPROVAL_APPROVED) return "APPROVED";
        if (isApproved != null && isApproved == APPROVAL_REJECTED) return "REJECTED";
        return "PENDING";
    }
}
