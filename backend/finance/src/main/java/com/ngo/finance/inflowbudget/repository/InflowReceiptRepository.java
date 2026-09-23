package com.ngo.finance.inflowbudget.repository;

import com.ngo.finance.inflowbudget.entity.InflowReceipt;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InflowReceiptRepository extends JpaRepository<InflowReceipt, Long> {

    List<InflowReceipt> findByTrancheCriterionIdOrderByReceivedDateAsc(Long trancheCriterionId);

    List<InflowReceipt> findByTrancheCriterionIdInOrderByReceivedDateAsc(List<Long> trancheCriterionIds);

    Optional<InflowReceipt> findByTransactionId(Long transactionId);
}
