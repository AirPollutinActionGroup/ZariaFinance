package com.ngo.finance.userRegister.repository;

import com.ngo.finance.userRegister.entity.UserRegister;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginRepository extends JpaRepository<UserRegister, Long> {

    UserRegister findByUsername(String username);

}
