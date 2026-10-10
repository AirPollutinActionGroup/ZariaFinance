package com.ngo.finance.masters.donortype.repository;

import com.ngo.finance.masters.donortype.entity.DonorTypeMaster;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DonorTypeMasterRepository extends JpaRepository<DonorTypeMaster, Long> {

    boolean existsByName(String name);

    boolean existsByIdAndStatusTrue(Long id);

    @Query("SELECT d FROM DonorTypeMaster d WHERE d.name LIKE %:searchTerm%")
    List<DonorTypeMaster> searchByName(@Param("searchTerm") String searchTerm);
}
