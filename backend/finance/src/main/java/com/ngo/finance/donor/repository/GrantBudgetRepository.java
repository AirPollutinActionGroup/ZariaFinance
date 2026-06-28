package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.GrantBudgetHead;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrantBudgetRepository extends JpaRepository<GrantBudgetHead, Long> {

    List<GrantBudgetHead> findByGrantId(Long grantId);

    Optional<GrantBudgetHead> findByGrantIdAndHeadCode(Long grantId, String headCode);

    List<GrantBudgetHead> findByGrantIdOrderByHeadCode(Long grantId);
}
