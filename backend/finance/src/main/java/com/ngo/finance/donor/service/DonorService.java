package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.request.CreateDonorRequest;
import com.ngo.finance.donor.dto.request.UpdateDonorRequest;
import com.ngo.finance.donor.dto.response.DonorResponse;
import java.util.List;

/**
 * Service interface for Donor operations
 */
public interface DonorService {

    DonorResponse createDonor(CreateDonorRequest request);

    DonorResponse getDonorById(Long id);

    DonorResponse getDonorByCode(String donorCode);

    /** The code the next new donor should get, e.g. DNR-CD-015. */
    String nextDonorCode();

    List<DonorResponse> getAllDonors();

    List<DonorResponse> searchDonors(String searchTerm);

    DonorResponse updateDonor(Long id, UpdateDonorRequest request);

    void activateDonor(Long id);

    void deActivateDonor(Long id);

    // void advanceOnboardingStep(Long donorId);
}
