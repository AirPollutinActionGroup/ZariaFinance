package com.ngo.finance.donor.service.impl;

import com.ngo.finance.donor.dto.response.FcraRegisterEntry;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.common.enums.FundSourceDomicile;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.service.ReportsService;
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
            boolean foreign = Boolean.TRUE.equals(donor.getFcraApplicable())
                    || donor.getFundSourceDomicile() == FundSourceDomicile.FOREIGN;
            if (!foreign) continue;

            entries.add(FcraRegisterEntry.builder()
                    .donorCode(donor.getDonorCode())
                    .donorName(donor.getDonorName())
                    .foreignFundSourceType(donor.getForeignFundSourceType())
                    .foreignCountryName(donor.getForeignCountryId())
                    .grantCode(grant.getGrantCode())
                    .totalGrantAmount(grant.getTotalGrantAmount())
                    .build());
        }
        return entries;
    }
}
