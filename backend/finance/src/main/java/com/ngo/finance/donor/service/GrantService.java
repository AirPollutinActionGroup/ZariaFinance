package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.request.ApproveGrantRequest;
import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.dto.request.GrantRemarksRequest;
import com.ngo.finance.donor.dto.response.GrantDetailsResponse;
import com.ngo.finance.donor.dto.response.GrantListResponse;
import java.util.List;

/**
 * Service interface for Grant Agreement operations
 */
public interface GrantService {

    GrantDetailsResponse createGrant(CreateGrantRequest request);

    GrantDetailsResponse updateGrant(Long id, CreateGrantRequest request);

    GrantDetailsResponse getGrantById(Long id);

    GrantDetailsResponse getGrantByCode(String grantCode);

    List<GrantListResponse> getAllGrants();

    List<GrantListResponse> getGrantsByDonorId(Long donorId);

    List<GrantListResponse> getGrantsByProgrammeId(Long programmeId);

    List<GrantListResponse> searchGrants(String searchTerm);

    void approveGrant(Long id, ApproveGrantRequest request);

    void activateGrant(Long id);

    void closeGrant(Long id);

    void holdGrant(Long id, GrantRemarksRequest request);

    void resumeGrant(Long id);

    void completeGrant(Long id);
}
