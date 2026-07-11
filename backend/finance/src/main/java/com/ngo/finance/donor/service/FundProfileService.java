package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.response.FundProfileResponse;
import java.util.List;

/**
 * Service for Donor Fund Profile operations (create / list-by-donor / get / update).
 */
public interface FundProfileService {

    FundProfileResponse createProfile(Long donorId, CreateFundProfileRequest request);

    List<FundProfileResponse> getProfilesByDonor(Long donorId);

    FundProfileResponse getProfileById(Long id);

    FundProfileResponse updateProfile(Long id, CreateFundProfileRequest request);
}
