package com.ngo.finance.bankDetails.repository;

import com.ngo.finance.bankDetails.entity.BankDetail;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BankDetailRepository extends JpaRepository<BankDetail, Long> {

    boolean existsByAccountNumber(String accountNumber);

    @Query("SELECT b FROM BankDetail b WHERE b.bankName LIKE %:searchTerm% "
            + "OR b.accountNumber LIKE %:searchTerm% "
            + "OR b.ifsc LIKE %:searchTerm% "
            + "OR b.branchName LIKE %:searchTerm%")
    List<BankDetail> search(@Param("searchTerm") String searchTerm);
}
