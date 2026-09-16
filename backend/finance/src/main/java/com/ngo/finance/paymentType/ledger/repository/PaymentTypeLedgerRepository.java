package com.ngo.finance.paymentType.ledger.repository;

import com.ngo.finance.paymentType.ledger.entity.PaymentTypeLedger;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTypeLedgerRepository extends JpaRepository<PaymentTypeLedger, Long> {

    boolean existsByNameAndGroupId(String name, Long groupId);

    @Query("SELECT l FROM PaymentTypeLedger l WHERE l.name LIKE %:searchTerm%")
    List<PaymentTypeLedger> searchByName(@Param("searchTerm") String searchTerm);
}
