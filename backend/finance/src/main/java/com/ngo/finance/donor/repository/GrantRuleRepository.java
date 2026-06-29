package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.GrantRule;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrantRuleRepository extends JpaRepository<GrantRule, Long> {

    List<GrantRule> findByGrantId(Long grantId);

    Optional<GrantRule> findByGrantIdAndRuleCode(Long grantId, String ruleCode);

    List<GrantRule> findByGrantIdAndIsMandatory(Long grantId, Boolean isMandatory);
}
