package com.ngo.finance.donation.service;

import com.ngo.finance.donation.dto.request.TenantTaxConfigRequest;
import com.ngo.finance.donation.dto.response.TenantTaxConfigResponse;

public interface TenantTaxConfigService {

    TenantTaxConfigResponse getConfig();

    TenantTaxConfigResponse updateConfig(TenantTaxConfigRequest request);
}
