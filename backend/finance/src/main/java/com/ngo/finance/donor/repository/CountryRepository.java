package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.CountryMaster;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CountryRepository extends JpaRepository<CountryMaster, Long> {

    Optional<CountryMaster> findByCountryCode(String countryCode);

    List<CountryMaster> findByIsActive(Boolean isActive);
}
