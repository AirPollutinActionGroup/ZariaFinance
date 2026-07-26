package com.ngo.finance.donation.repository;

import com.ngo.finance.donation.entity.DonationGikItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonationGikItemRepository extends JpaRepository<DonationGikItem, Long> {
}
