package com.ngo.finance.vendorRegister.repository;

import com.ngo.finance.vendorRegister.entity.VendorRegister;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorRegisterRepository extends JpaRepository<VendorRegister, Long> {

    boolean existsByPanNumber(String panNumber);

    Optional<VendorRegister> findByVendorCode(String vendorCode);

    @Query("SELECT v FROM VendorRegister v WHERE v.legalName LIKE %:searchTerm% "
            + "OR v.vendorCode LIKE %:searchTerm% OR v.panNumber LIKE %:searchTerm% "
            + "OR v.contactName LIKE %:searchTerm%")
    List<VendorRegister> searchVendors(@Param("searchTerm") String searchTerm);
}
