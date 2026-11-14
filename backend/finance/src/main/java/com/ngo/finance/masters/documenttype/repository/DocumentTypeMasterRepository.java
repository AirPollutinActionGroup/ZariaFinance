package com.ngo.finance.masters.documenttype.repository;

import com.ngo.finance.masters.documenttype.entity.DocumentTypeMaster;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentTypeMasterRepository extends JpaRepository<DocumentTypeMaster, Long> {

    Optional<DocumentTypeMaster> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByNameIgnoreCase(String name);

    List<DocumentTypeMaster> findAllByOrderByNameAsc();

    List<DocumentTypeMaster> findByStatusTrueOrderByNameAsc();

    @Query("SELECT d FROM DocumentTypeMaster d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :term, '%'))"
            + " OR LOWER(d.code) LIKE LOWER(CONCAT('%', :term, '%')) ORDER BY d.name")
    List<DocumentTypeMaster> search(@Param("term") String term);
}
