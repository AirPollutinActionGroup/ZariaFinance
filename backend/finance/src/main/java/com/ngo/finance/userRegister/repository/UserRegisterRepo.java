package com.ngo.finance.userRegister.repository;

import com.ngo.finance.userRegister.entity.UserRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRegisterRepo extends JpaRepository<UserRegister, Long> {

    boolean existsByUsername(String username);

    List<UserRegister> findByIsApproved(Integer isApproved);
}
