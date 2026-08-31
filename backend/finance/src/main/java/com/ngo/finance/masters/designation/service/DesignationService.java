package com.ngo.finance.masters.designation.service;

import com.ngo.finance.masters.designation.dto.request.CreateDesignationRequest;
import com.ngo.finance.masters.designation.dto.request.UpdateDesignationRequest;
import com.ngo.finance.masters.designation.dto.response.DesignationResponse;
import java.util.List;

/**
 * Service interface for Designation operations
 */
public interface DesignationService {

    DesignationResponse createDesignation(CreateDesignationRequest request);

    DesignationResponse getDesignationById(Long id);

    List<DesignationResponse> getAllDesignations();

    List<DesignationResponse> searchDesignations(String searchTerm);

    DesignationResponse updateDesignation(Long id, UpdateDesignationRequest request);

    void activateDesignation(Long id);

    void deactivateDesignation(Long id);
}
