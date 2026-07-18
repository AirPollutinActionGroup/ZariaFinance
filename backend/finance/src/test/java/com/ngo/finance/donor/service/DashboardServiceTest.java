package com.ngo.finance.donor.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.ngo.finance.donor.dto.response.DashboardSummaryResponse;
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
}
