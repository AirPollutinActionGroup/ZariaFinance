package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.GrantDisbursementSchedule;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrantDisbursementScheduleRepository extends JpaRepository<GrantDisbursementSchedule, Long> {

    Optional<GrantDisbursementSchedule> findByGrantId(Long grantId);
}
