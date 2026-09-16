package com.ngo.finance.transaction.repository;

import com.ngo.finance.transaction.entity.Transaction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionCode(String transactionCode);

    List<Transaction> findAllByOrderByTransactionDateDescIdDesc();
}
