package com.ngo.finance.userRegister.repository;

import com.ngo.finance.userRegister.entity.UserRegister;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRegisterRepo extends JpaRepository<UserRegister, Long> {

    boolean existsByUsername(String username);
}
