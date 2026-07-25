package com.ngo.finance.donor.service.impl;

import com.ngo.finance.donor.dto.response.DashboardSummaryResponse;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.service.DashboardService;
import java.math.BigDecimal;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Computes the dashboard summary from live donor / grant / tranche records.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private GrantRepository grantRepository;

    @Override
    public DashboardSummaryResponse getSummary() {
        List<DonorMaster> donors = donorRepository.findAll();
        List<GrantAgreement> grants = grantRepository.findAll();

        long activeDonors = donors.stream().filter(d -> !isInactive(d)).count();

        BigDecimal committed = BigDecimal.ZERO;
        BigDecimal received = BigDecimal.ZERO;
        BigDecimal utilised = BigDecimal.ZERO;
        BigDecimal blocked = BigDecimal.ZERO;
        long blockedGrantCount = 0;

        for (GrantAgreement grant : grants) {
            BigDecimal committedAmount = grant.getReportingAmountInr() != null
                    ? grant.getReportingAmountInr()
                    : nz(grant.getTotalGrantAmount());

            if (isInactive(grant.getDonor())) {
                blocked = blocked.add(committedAmount);
                blockedGrantCount++;
                continue;
            }

            committed = committed.add(committedAmount);
            utilised = utilised.add(nz(grant.getUtilisedAmount()));
            // Tranche receipts are in the grant currency → convert to INR via the locked FX
            // rate.
            BigDecimal fx = nz(grant.getFxLockedRate());
            if (fx.signum() == 0)
                fx = BigDecimal.ONE;
            for (GrantTranche tranche : grant.getTranches()) {
                received = received.add(nz(tranche.getActualAmount()).multiply(fx));
            }
        }

        // Active count excludes blocked grants (active status but on an inactive
        // donor) so active / closed / blocked stay mutually exclusive.
        long activeGrants = grants.stream()
                .filter(g -> Boolean.TRUE.equals(g.getIsActive()) && !isInactive(g.getDonor()))
                .count();
        long closedGrants = grants.stream().filter(g -> Boolean.FALSE.equals(g.getIsActive())).count();

        return DashboardSummaryResponse.builder()
                .donorCount(donors.size())
                .activeDonorCount(activeDonors)
                .draftBlockingAmount(blocked)
                .grantCount(grants.size())
                .activeGrantCount(activeGrants)
                .closedGrantCount(closedGrants)
                .blockedGrantCount(blockedGrantCount)
                .committed(committed)
                .received(received)
                .utilised(utilised)
                .available(received.subtract(utilised))
                .open(committed.subtract(received))
                .blocked(blocked)
                .build();
    }

    private boolean isInactive(DonorMaster donor) {
        if (donor == null)
            return false;
        return Boolean.FALSE.equals(donor.getIsActive());
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
