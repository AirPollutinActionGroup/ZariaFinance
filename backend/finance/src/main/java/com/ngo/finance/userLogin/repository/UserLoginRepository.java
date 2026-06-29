package com.ngo.finance.userLogin.repository;

import com.ngo.finance.userRegister.entity.UserRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserLoginRepository extends JpaRepository<UserRegister, Long> {

}
