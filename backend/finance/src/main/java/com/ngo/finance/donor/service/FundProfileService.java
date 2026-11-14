package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.response.FundProfileResponse;
import java.util.List;

/**
 * Service for Donor Fund Profile operations (create / list / list-by-donor / get / update).
 */
public interface FundProfileService {

    FundProfileResponse createProfile(Long donorId, CreateFundProfileRequest request);

    /** Every fund profile across all donors, newest first. */
    List<FundProfileResponse> getAllProfiles();

    List<FundProfileResponse> getProfilesByDonor(Long donorId);

    FundProfileResponse getProfileById(Long id);

    FundProfileResponse updateProfile(Long id, CreateFundProfileRequest request);
}
