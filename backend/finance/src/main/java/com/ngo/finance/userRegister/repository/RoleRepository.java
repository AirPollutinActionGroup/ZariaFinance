package com.ngo.finance.userRegister.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ngo.finance.userRegister.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

}
