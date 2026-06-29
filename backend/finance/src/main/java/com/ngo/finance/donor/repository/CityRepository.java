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
}
