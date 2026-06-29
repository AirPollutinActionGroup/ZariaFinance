package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.DistrictMaster;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DistrictRepository extends JpaRepository<DistrictMaster, Long> {

    Optional<DistrictMaster> findByDistrictCode(String districtCode);

    List<DistrictMaster> findByStateId(Long stateId);

    List<DistrictMaster> findByStateIdAndIsActive(Long stateId, Boolean isActive);
}
