package com.ngo.finance.notification.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.enums.ResponsibleRole;
import com.ngo.finance.notification.dto.RoleDirectoryEntryDto;
import com.ngo.finance.notification.entity.RoleDirectoryEntry;
import com.ngo.finance.notification.repository.RoleDirectoryRepository;
import com.ngo.finance.notification.service.RoleDirectoryService;
import com.ngo.finance.userRegister.entity.UserRegister;
import com.ngo.finance.userRegister.repository.UserRegisterRepo;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class RoleDirectoryServiceImpl implements RoleDirectoryService {

    @Autowired
    private RoleDirectoryRepository directoryRepository;

    @Autowired
    private UserRegisterRepo userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleDirectoryEntryDto> getDirectory() {
        return directoryRepository.findAll().stream()
                .sorted(Comparator.comparing(e -> e.getRole().ordinal()))
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<RoleDirectoryEntryDto> updateDirectory(List<RoleDirectoryEntryDto> entries) {
        if (entries != null) {
            for (RoleDirectoryEntryDto dto : entries) {
                if (dto.getRole() == null) {
                    throw new ValidationException("Role is required for every directory entry");
                }
                RoleDirectoryEntry entry = directoryRepository.findByRole(dto.getRole())
                        .orElseGet(() -> RoleDirectoryEntry.builder().role(dto.getRole()).build());

                validateUsers(dto);
                entry.setPrimaryUserId(dto.getPrimaryUserId());
                entry.setDeputyUserId(dto.getDeputyUserId());
                directoryRepository.save(entry);
                log.info("Role directory updated for {}", dto.getRole());
            }
        }
        return getDirectory();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RoleDirectoryEntryDto> findByRole(ResponsibleRole role) {
        return directoryRepository.findByRole(role).map(this::toDto);
    }

    private void validateUsers(RoleDirectoryEntryDto dto) {
        if (dto.getPrimaryUserId() != null && !userRepository.existsById(dto.getPrimaryUserId())) {
            throw new ResourceNotFoundException("User", dto.getPrimaryUserId());
        }
        if (dto.getDeputyUserId() != null && !userRepository.existsById(dto.getDeputyUserId())) {
            throw new ResourceNotFoundException("User", dto.getDeputyUserId());
        }
        // Escalating to yourself is a no-op that looks like cover.
        if (dto.getDeputyUserId() != null && dto.getDeputyUserId().equals(dto.getPrimaryUserId())) {
            ValidationException error = new ValidationException("A person cannot be their own deputy");
            error.addError("deputyUserId", "Choose someone other than the role holder");
            throw error;
        }
    }

    private RoleDirectoryEntryDto toDto(RoleDirectoryEntry entry) {
        return RoleDirectoryEntryDto.builder()
                .role(entry.getRole())
                .roleLabel(entry.getRole().getLabel())
                .primaryUserId(entry.getPrimaryUserId())
                .primaryUserName(displayName(entry.getPrimaryUserId()))
                .deputyUserId(entry.getDeputyUserId())
                .deputyUserName(displayName(entry.getDeputyUserId()))
                .build();
    }

    private String displayName(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).map(RoleDirectoryServiceImpl::fullName).orElse(null);
    }

    /** First + last name, falling back to the username. */
    public static String fullName(UserRegister user) {
        String name = ((user.getFirstName() == null ? "" : user.getFirstName()) + " "
                + (user.getLastName() == null ? "" : user.getLastName())).trim();
        return name.isEmpty() ? user.getUsername() : name;
    }
}
