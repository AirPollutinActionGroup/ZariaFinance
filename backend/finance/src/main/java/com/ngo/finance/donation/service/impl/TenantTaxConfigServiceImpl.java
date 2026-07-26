package com.ngo.finance.donation.service.impl;

import com.ngo.finance.donation.dto.request.TenantTaxConfigRequest;
import com.ngo.finance.donation.dto.response.TenantTaxConfigResponse;
import com.ngo.finance.donation.entity.TenantTaxConfig;
import com.ngo.finance.donation.repository.TenantTaxConfigRepository;
import com.ngo.finance.donation.service.TenantTaxConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * A single row is expected (seeded by migration); this service reads/updates
 * that row rather than tracking an id, so it's resilient to how it was seeded.
 */
@Slf4j
@Service
@Transactional
public class TenantTaxConfigServiceImpl implements TenantTaxConfigService {

    @Autowired
    private TenantTaxConfigRepository repository;

    @Override
    @Transactional(readOnly = true)
    public TenantTaxConfigResponse getConfig() {
        return toResponse(fetchOrCreate());
    }

    @Override
    public TenantTaxConfigResponse updateConfig(TenantTaxConfigRequest request) {
        TenantTaxConfig config = fetchOrCreate();
        config.setOrg80gRegistrationNumber(request.getOrg80gRegistrationNumber());
        config.setOrg80gValidFrom(request.getOrg80gValidFrom());
        config.setOrg80gValidTo(request.getOrg80gValidTo());
        config.setSection35RegistrationNumber(request.getSection35RegistrationNumber());
        config.setSection35ValidFrom(request.getSection35ValidFrom());
        config.setSection35ValidTo(request.getSection35ValidTo());
        return toResponse(repository.save(config));
    }

    private TenantTaxConfig fetchOrCreate() {
        return repository.findAll().stream().findFirst()
                .orElseGet(() -> repository.save(TenantTaxConfig.builder().build()));
    }

    private TenantTaxConfigResponse toResponse(TenantTaxConfig config) {
        return TenantTaxConfigResponse.builder()
                .id(config.getId())
                .org80gRegistrationNumber(config.getOrg80gRegistrationNumber())
                .org80gValidFrom(config.getOrg80gValidFrom())
                .org80gValidTo(config.getOrg80gValidTo())
                .section35RegistrationNumber(config.getSection35RegistrationNumber())
                .section35ValidFrom(config.getSection35ValidFrom())
                .section35ValidTo(config.getSection35ValidTo())
                .receiptNumberSequence(config.getReceiptNumberSequence())
                .build();
    }
}
