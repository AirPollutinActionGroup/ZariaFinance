package com.ngo.finance.donation.repository;

import com.ngo.finance.donation.entity.TenantTaxConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantTaxConfigRepository extends JpaRepository<TenantTaxConfig, Long> {
}
