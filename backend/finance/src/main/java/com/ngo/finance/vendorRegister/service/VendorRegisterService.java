package com.ngo.finance.vendorRegister.service;

import com.ngo.finance.vendorRegister.dto.request.CreateVendorRequest;
import com.ngo.finance.vendorRegister.dto.response.VendorResponse;
import java.util.List;

public interface VendorRegisterService {
    VendorResponse createVendor(CreateVendorRequest request);

    VendorResponse getVendorById(Long id);

    List<VendorResponse> getAllVendors();

    List<VendorResponse> searchVendors(String searchTerm);

    void activateVendor(Long id);

    void deactivateVendor(Long id);
}
