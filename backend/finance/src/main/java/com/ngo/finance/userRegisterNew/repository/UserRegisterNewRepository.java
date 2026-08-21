package com.ngo.finance.userRegisterNew.repository;

import com.ngo.finance.userRegisterNew.entity.UserRegisterNew;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRegisterNewRepository extends JpaRepository<UserRegisterNew, Long> {

    boolean existsByEmailId(String emailId);

    boolean existsByUsername(String username);

    boolean existsByMobileNo(String mobileNo);

    Optional<UserRegisterNew> findByUsername(String username);
}
