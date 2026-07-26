package com.ngo.finance.donation.service;

import com.ngo.finance.donation.dto.request.CreateDonationRequest;
import com.ngo.finance.donation.dto.request.UpdateGikIntendedUseRequest;
import com.ngo.finance.donation.dto.response.DonationDetailResponse;
import com.ngo.finance.donation.dto.response.DonationListResponse;
import java.util.List;

public interface DonationService {

    DonationDetailResponse createDonation(CreateDonationRequest request);

    DonationDetailResponse updateDonation(Long id, CreateDonationRequest request);

    DonationDetailResponse getDonationById(Long id);

    DonationDetailResponse getDonationByCode(String donationCode);

    List<DonationListResponse> getAllDonations();

    List<DonationListResponse> getDonationsByDonorId(Long donorId);

    List<DonationListResponse> getDonationsByComplianceState(String complianceState);

    List<DonationListResponse> searchDonations(String searchTerm);

    DonationDetailResponse updateGikIntendedUse(Long donationId, Long gikItemId, UpdateGikIntendedUseRequest request);

    DonationDetailResponse issueEightyGReceipt(Long id);

    DonationDetailResponse markTenBdFiling(Long id);
}
