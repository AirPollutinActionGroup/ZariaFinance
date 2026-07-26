package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.StateMaster;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StateRepository extends JpaRepository<StateMaster, Long> {

    Optional<StateMaster> findByStateCode(String stateCode);

    List<StateMaster> findByIsActive(Boolean isActive);

    List<StateMaster> findByCountryIdAndIsActive(Long countryId, Boolean isActive);
}
