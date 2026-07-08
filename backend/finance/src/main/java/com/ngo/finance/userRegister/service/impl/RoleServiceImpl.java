package com.ngo.finance.userRegister.service.impl;

import com.ngo.finance.userRegister.dto.RoleAddDto;
import com.ngo.finance.userRegister.dto.RoleDto;
import com.ngo.finance.userRegister.entity.Role;
import com.ngo.finance.userRegister.repository.RoleRepository;
import com.ngo.finance.userRegister.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public RoleDto registerUser(RoleAddDto addRoleDto) {
        Role role = new Role();
        role.setName(addRoleDto.getName());
        roleRepository.save(role);

        RoleDto roleDto = new RoleDto();
        roleDto.setId(role.getId());
        roleDto.setName(role.getName());
        return roleDto;
    }

    @Override
    public void deleteUser(Long userId) {
        roleRepository.deleteById(userId);
    }

    @Override
    public RoleDto getUserById(Long userId) {
        Role role = roleRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + userId));

        RoleDto roleDto = new RoleDto();
        roleDto.setId(role.getId());
        roleDto.setName(role.getName());
        return roleDto;
    }

    @Override
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(role -> {
                    RoleDto dto = new RoleDto();
                    dto.setId(role.getId());
                    dto.setName(role.getName());
                    return dto;
                })
                .toList();
    }
}
