package com.ngo.finance.donor.service.impl;

import com.ngo.finance.donor.FundingClassifier;
import com.ngo.finance.donor.dto.response.DashboardSummaryResponse;
import com.ngo.finance.donor.dto.response.FundingClassBreakdown;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.enums.FundingBucket;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.service.DashboardService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

    private static final Set<GrantStatus> CLOSED_STATUSES =
            Set.of(GrantStatus.CLOSED, GrantStatus.COMPLETED);

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private GrantRepository grantRepository;

    @Override
    public DashboardSummaryResponse getSummary() {
        // Draft records never contribute to any dashboard metric — exclude them
        // at the source so every downstream count and funding-chain figure is
        // Draft-free. (Non-draft grants on inactive/draft donors remain in the
        // "blocked" bucket handled separately.)
        List<DonorMaster> donors = donorRepository.findAll().stream()
                .filter(d -> d.getStatus() != DonorStatus.DRAFT)
                .toList();
        List<GrantAgreement> grants = grantRepository.findAll().stream()
                .filter(g -> g.getGrantStatus() != GrantStatus.DRAFT)
                .toList();

        long activeDonors = donors.stream().filter(d -> !isInactive(d)).count();
        long draftDonors = donors.stream().filter(d -> d.getStatus() == DonorStatus.DRAFT).count();

        BigDecimal committed = BigDecimal.ZERO;
        BigDecimal received = BigDecimal.ZERO;
        BigDecimal utilised = BigDecimal.ZERO;
        BigDecimal blocked = BigDecimal.ZERO;
        long blockedGrantCount = 0;

        // FC / DC / CSR breakdown accumulates over the same non-blocked grants as
        // the funding chain, so each bucket's committed / received sums back to
        // the chain totals.
        Map<FundingBucket, BucketAcc> byClass = new EnumMap<>(FundingBucket.class);

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
            // Tranche receipts are in the grant currency → convert to INR via the locked FX rate.
            BigDecimal fx = nz(grant.getFxLockedRate());
            if (fx.signum() == 0) fx = BigDecimal.ONE;
            BigDecimal grantReceived = BigDecimal.ZERO;
            for (GrantTranche tranche : grant.getTranches()) {
                grantReceived = grantReceived.add(nz(tranche.getActualAmount()).multiply(fx));
            }
            received = received.add(grantReceived);

            byClass.computeIfAbsent(FundingClassifier.classify(grant.getDonor()), b -> new BucketAcc())
                    .add(committedAmount, grantReceived);
        }

        // Active count excludes blocked grants (active status but on an inactive
        // donor) so active / closed / blocked stay mutually exclusive.
        long activeGrants = grants.stream()
                .filter(g -> g.getGrantStatus() == GrantStatus.ACTIVE && !isInactive(g.getDonor()))
                .count();
        long closedGrants = grants.stream().filter(g -> CLOSED_STATUSES.contains(g.getGrantStatus())).count();

        return DashboardSummaryResponse.builder()
                .donorCount(donors.size())
                .activeDonorCount(activeDonors)
                .draftDonorCount(draftDonors)
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
                .fundingByClass(buildFundingByClass(byClass))
                .build();
    }

    /**
     * Emit one row per bucket in FC → CSR → DC order, always present (zeroed
     * when a bucket has no grants) so the client can render a stable layout.
     */
    private List<FundingClassBreakdown> buildFundingByClass(Map<FundingBucket, BucketAcc> byClass) {
        List<FundingClassBreakdown> rows = new ArrayList<>();
        for (FundingBucket bucket : FundingBucket.values()) {
            BucketAcc acc = byClass.getOrDefault(bucket, new BucketAcc());
            rows.add(FundingClassBreakdown.builder()
                    .bucket(bucket.getCode())
                    .label(bucket.getLabel())
                    .grantCount(acc.count)
                    .committed(acc.committed)
                    .received(acc.received)
                    .build());
        }
        return rows;
    }

    /** Mutable per-bucket accumulator used while walking the grant list. */
    private static final class BucketAcc {
        private long count;
        private BigDecimal committed = BigDecimal.ZERO;
        private BigDecimal received = BigDecimal.ZERO;

        private void add(BigDecimal committedAmount, BigDecimal receivedAmount) {
            count++;
            committed = committed.add(committedAmount);
            received = received.add(receivedAmount);
        }
    }

    private boolean isInactive(DonorMaster donor) {
        if (donor == null) return false;
        return Boolean.FALSE.equals(donor.getIsActive()) || donor.getStatus() == DonorStatus.DRAFT;
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
