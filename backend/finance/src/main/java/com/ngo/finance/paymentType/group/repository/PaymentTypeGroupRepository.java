package com.ngo.finance.paymentType.group.repository;

import com.ngo.finance.paymentType.group.entity.PaymentTypeGroup;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTypeGroupRepository extends JpaRepository<PaymentTypeGroup, Long> {

    boolean existsByName(String name);

    @Query("SELECT g FROM PaymentTypeGroup g WHERE g.name LIKE %:searchTerm%")
    List<PaymentTypeGroup> searchByName(@Param("searchTerm") String searchTerm);
}
