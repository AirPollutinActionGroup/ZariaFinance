package com.ngo.finance.userRegister.repository;

import org.springframework.stereotype.Repository;
import com.ngo.finance.userRegister.entity.UserRegister;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface UserRegisterRepo extends JpaRepository<UserRegister, Long> {

}
