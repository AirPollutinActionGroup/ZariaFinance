package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.CityMaster;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CityRepository extends JpaRepository<CityMaster, Long> {

    Optional<CityMaster> findByCityCode(String cityCode);

    List<CityMaster> findByDistrictId(Long districtId);

    List<CityMaster> findByDistrictIdAndIsActive(Long districtId, Boolean isActive);

    List<CityMaster> findByIsActive(Boolean isActive);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM CityMaster c WHERE c.district.state.id = :stateId AND c.isActive = true")
    List<CityMaster> findActiveCitiesByStateId(@org.springframework.data.repository.query.Param("stateId") Long stateId);
}
