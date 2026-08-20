package com.ngo.finance.organizationRegister.service;

import com.ngo.finance.organizationRegister.dto.request.CreateOrganizationRequest;
import com.ngo.finance.organizationRegister.dto.request.UpdateOrganizationRequest;
import com.ngo.finance.organizationRegister.dto.response.OrganizationResponse;
import java.util.List;

/**
 * Service interface for Organisation Register operations
 */
public interface OrganizationRegisterService {

    OrganizationResponse createOrganisation(CreateOrganizationRequest request);

    boolean shortNameExists(String shortName);

    OrganizationResponse getOrganisationById(Long id);

    List<OrganizationResponse> getAllOrganisations();

    List<OrganizationResponse> searchOrganisations(String searchTerm);

    OrganizationResponse updateOrganisation(Long id, UpdateOrganizationRequest request);

    void activateOrganisation(Long id);

    void deactivateOrganisation(Long id);
}
