package com.ngo.finance.donor.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.ngo.finance.donor.dto.response.DashboardSummaryResponse;
import com.ngo.finance.donor.dto.response.FundingClassBreakdown;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.service.impl.DashboardServiceImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private DonorRepository donorRepository;

    @Mock
    private GrantRepository grantRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    private DonorMaster donor(DonorStatus status, boolean active) {
        return DonorMaster.builder().status(status).isActive(active).build();
    }

    private DonorMaster foreignDonor() {
        return DonorMaster.builder()
                .status(DonorStatus.ACTIVE)
                .isActive(true)
                .donorType("Foundation")
                .donorSource("Sponsorship")
                .fundSourceDomicile("Foreign")
                .fcraApplicable(true)
                .build();
    }

    private DonorMaster csrDonor() {
        return DonorMaster.builder()
                .status(DonorStatus.ACTIVE)
                .isActive(true)
                .donorType("Corporate CSR")
                .donorSource("CSR")
                .fundSourceDomicile("Domestic")
                .fcraApplicable(false)
                .build();
    }

    private DonorMaster domesticDonor() {
        return DonorMaster.builder()
                .status(DonorStatus.ACTIVE)
                .isActive(true)
                .donorType("Individual")
                .donorSource("Individual")
                .fundSourceDomicile("Domestic")
                .fcraApplicable(false)
                .build();
    }

    private GrantAgreement grant(
            GrantStatus status, DonorMaster donor, BigDecimal committedInr, BigDecimal receivedActual) {
        GrantTranche tranche = GrantTranche.builder().actualAmount(receivedActual).build();
        return GrantAgreement.builder()
                .donor(donor)
                .grantStatus(status)
                .reportingAmountInr(committedInr)
                .utilisedAmount(BigDecimal.ZERO)
                .fxLockedRate(BigDecimal.ONE)
                .tranches(List.of(tranche))
                .build();
    }

    @Test
    public void getSummary_excludesDraftDonorsAndDraftGrantsFromAllMetrics() {
        DonorMaster activeDonor = donor(DonorStatus.ACTIVE, true);
        DonorMaster draftDonor = donor(DonorStatus.DRAFT, false);

        // Draft donor is excluded from donor counts entirely.
        when(donorRepository.findAll()).thenReturn(List.of(activeDonor, draftDonor));

        GrantAgreement activeGrant =
                grant(GrantStatus.ACTIVE, activeDonor, new BigDecimal("10000000"), new BigDecimal("4000000"));
        GrantAgreement approvedGrant =
                grant(GrantStatus.APPROVED, activeDonor, new BigDecimal("5000000"), new BigDecimal("1000000"));
        // Draft grant on an ACTIVE donor — must NOT contribute to any metric.
        GrantAgreement draftGrant =
                grant(GrantStatus.DRAFT, activeDonor, new BigDecimal("9000000"), new BigDecimal("3000000"));

        when(grantRepository.findAll()).thenReturn(List.of(activeGrant, approvedGrant, draftGrant));

        DashboardSummaryResponse summary = dashboardService.getSummary();

        // Counts exclude Draft records.
        assertEquals(1, summary.getDonorCount(), "Draft donor excluded from donor count");
        assertEquals(0, summary.getDraftDonorCount(), "No Draft donors surface in metrics");
        assertEquals(2, summary.getGrantCount(), "Draft grant excluded from grant count");
        assertEquals(1, summary.getActiveGrantCount());

        // Funding chain excludes the Draft grant's committed / received amounts.
        assertEquals(0, new BigDecimal("15000000").compareTo(summary.getCommitted()),
                "Draft grant's 9,000,000 excluded from committed");
        assertEquals(0, new BigDecimal("5000000").compareTo(summary.getReceived()),
                "Draft grant's 3,000,000 tranche excluded from received");
    }

    @Test
    public void getSummary_classifiesFundingIntoFcDcCsrBuckets() {
        DonorMaster foreign = foreignDonor();
        DonorMaster csr = csrDonor();
        DonorMaster domestic = domesticDonor();
        when(donorRepository.findAll()).thenReturn(List.of(foreign, csr, domestic));

        GrantAgreement fcGrant =
                grant(GrantStatus.ACTIVE, foreign, new BigDecimal("16700000"), new BigDecimal("100000"));
        GrantAgreement csrGrant =
                grant(GrantStatus.ACTIVE, csr, new BigDecimal("5000000"), new BigDecimal("3000000"));
        GrantAgreement dcGrant =
                grant(GrantStatus.ACTIVE, domestic, new BigDecimal("150000"), new BigDecimal("150000"));
        when(grantRepository.findAll()).thenReturn(List.of(fcGrant, csrGrant, dcGrant));

        DashboardSummaryResponse summary = dashboardService.getSummary();

        Map<String, FundingClassBreakdown> byBucket = summary.getFundingByClass().stream()
                .collect(Collectors.toMap(FundingClassBreakdown::getBucket, Function.identity()));

        // Always emits all three buckets, in FC → CSR → DC order.
        assertEquals(List.of("FC", "CSR", "DC"),
                summary.getFundingByClass().stream().map(FundingClassBreakdown::getBucket).toList());

        assertEquals(1, byBucket.get("FC").getGrantCount());
        assertEquals(0, new BigDecimal("16700000").compareTo(byBucket.get("FC").getCommitted()));
        assertEquals(1, byBucket.get("CSR").getGrantCount());
        assertEquals(0, new BigDecimal("5000000").compareTo(byBucket.get("CSR").getCommitted()));
        assertEquals(1, byBucket.get("DC").getGrantCount());
        assertEquals(0, new BigDecimal("150000").compareTo(byBucket.get("DC").getCommitted()));

        // Invariant: the buckets partition the funding chain — committed / received sum back.
        BigDecimal bucketCommitted = summary.getFundingByClass().stream()
                .map(FundingClassBreakdown::getCommitted)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal bucketReceived = summary.getFundingByClass().stream()
                .map(FundingClassBreakdown::getReceived)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, summary.getCommitted().compareTo(bucketCommitted),
                "Bucket committed sums back to funding-chain committed");
        assertEquals(0, summary.getReceived().compareTo(bucketReceived),
                "Bucket received sums back to funding-chain received");
    }

    @Test
    public void getSummary_excludesBlockedGrantsFromBuckets() {
        DonorMaster inactiveCsr = csrDonor();
        inactiveCsr.setIsActive(false); // blocked: active grant on an inactive donor
        when(donorRepository.findAll()).thenReturn(List.of(inactiveCsr));

        GrantAgreement blocked =
                grant(GrantStatus.ACTIVE, inactiveCsr, new BigDecimal("5000000"), new BigDecimal("3000000"));
        when(grantRepository.findAll()).thenReturn(List.of(blocked));

        DashboardSummaryResponse summary = dashboardService.getSummary();

        // Blocked commitment is out of every bucket (matches the funding-chain treatment).
        summary.getFundingByClass().forEach(b -> {
            assertEquals(0, b.getGrantCount(), b.getBucket() + " bucket has no grants");
            assertEquals(0, BigDecimal.ZERO.compareTo(b.getCommitted()), b.getBucket() + " committed is zero");
        });
    }
}
