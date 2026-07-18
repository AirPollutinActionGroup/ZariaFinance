package com.ngo.finance.donor.service.impl;

import com.ngo.finance.donor.FundingClassifier;
import com.ngo.finance.donor.dto.response.FcraRegisterEntry;
import com.ngo.finance.donor.dto.response.UtilisationComplianceEntry;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.service.ReportsService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-only reporting aggregations over the donor module.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class ReportsServiceImpl implements ReportsService {

    @Autowired
    private GrantRepository grantRepository;

    @Override
    public List<FcraRegisterEntry> getFcraRegister() {
        List<FcraRegisterEntry> entries = new ArrayList<>();
        for (GrantAgreement grant : grantRepository.findAll()) {
            var donor = grant.getDonor();
            if (donor == null) continue;
            if (!FundingClassifier.isForeign(donor)) continue;

            entries.add(FcraRegisterEntry.builder()
                    .donorCode(donor.getDonorCode())
                    .donorName(donor.getDonorName())
                    .foreignFundSourceType(donor.getForeignFundSourceType())
                    .foreignCountryName(donor.getForeignCountryName())
                    .bankAccountRef(donor.getBankAccountRef())
                    .grantCode(grant.getGrantCode())
                    .grantCurrency(grant.getGrantCurrency())
                    .totalGrantAmount(grant.getTotalGrantAmount())
                    .reportingAmountInr(grant.getReportingAmountInr())
                    .receivedInr(sumReceived(grant))
                    .build());
        }
        return entries;
    }

    @Override
    public List<UtilisationComplianceEntry> getUtilisationCompliance() {
        List<UtilisationComplianceEntry> entries = new ArrayList<>();
        for (GrantAgreement grant : grantRepository.findAll()) {
            DonorFundProfile profile = grant.getFundProfile();
            BigDecimal committed = grant.getReportingAmountInr() != null
                    ? grant.getReportingAmountInr() : nz(grant.getTotalGrantAmount());
            BigDecimal received = sumReceived(grant);
            BigDecimal utilised = nz(grant.getUtilisedAmount());

            BigDecimal pct = committed.signum() > 0
                    ? utilised.multiply(BigDecimal.valueOf(100)).divide(committed, 1, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            boolean compliant = utilised.compareTo(committed) <= 0;

            entries.add(UtilisationComplianceEntry.builder()
                    .grantCode(grant.getGrantCode())
                    .donorName(grant.getDonor() != null ? grant.getDonor().getDonorName() : null)
                    .fundClassCode(profile != null ? profile.getFundClassCode() : null)
                    .overheadLimitPercent(profile != null ? profile.getOverheadLimitPercent() : null)
                    .committed(committed)
                    .received(received)
                    .utilised(utilised)
                    .utilisationPercent(pct)
                    .compliant(compliant)
                    .note(compliant ? "Within committed" : "Utilised exceeds committed")
                    .build());
        }
        return entries;
    }

    /** Total received in INR = Σ actual tranche amount × the grant's locked FX rate. */
    private BigDecimal sumReceived(GrantAgreement grant) {
        BigDecimal fx = nz(grant.getFxLockedRate());
        if (fx.signum() == 0) fx = BigDecimal.ONE;
        BigDecimal sum = BigDecimal.ZERO;
        for (GrantTranche t : grant.getTranches()) {
            sum = sum.add(nz(t.getActualAmount()).multiply(fx));
        }
        return sum;
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
