package com.ngo.finance.paymentMode.repository;

import com.ngo.finance.paymentMode.entity.PaymentMode;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentModeRepository extends JpaRepository<PaymentMode, Long> {

    boolean existsByName(String name);

    @Query("SELECT p FROM PaymentMode p WHERE p.name LIKE %:searchTerm%")
    List<PaymentMode> searchByName(@Param("searchTerm") String searchTerm);
}
