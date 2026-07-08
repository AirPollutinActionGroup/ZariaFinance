package com.ngo.finance.userRegister.service;

import com.ngo.finance.userRegister.dto.RoleAddDto;
import com.ngo.finance.userRegister.dto.RoleDto;
import java.util.List;


public interface RoleService {

    RoleDto registerUser(RoleAddDto addRoleDto);

    void deleteUser(Long userId);

    RoleDto getUserById(Long userId);

    List<RoleDto> getAllRoles();

}
