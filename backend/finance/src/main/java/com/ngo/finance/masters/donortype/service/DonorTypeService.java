package com.ngo.finance.masters.donortype.service;

import com.ngo.finance.masters.donortype.dto.request.CreateDonorTypeRequest;
import com.ngo.finance.masters.donortype.dto.request.UpdateDonorTypeRequest;
import com.ngo.finance.masters.donortype.dto.response.DonorTypeResponse;
import java.util.List;

/**
 * Service interface for Donor Type operations
 */
public interface DonorTypeService {

    DonorTypeResponse createDonorType(CreateDonorTypeRequest request);

    DonorTypeResponse getDonorTypeById(Long id);

    List<DonorTypeResponse> getAllDonorTypes();

    List<DonorTypeResponse> searchDonorTypes(String searchTerm);

    DonorTypeResponse updateDonorType(Long id, UpdateDonorTypeRequest request);

    void activateDonorType(Long id);

    void deactivateDonorType(Long id);
}
