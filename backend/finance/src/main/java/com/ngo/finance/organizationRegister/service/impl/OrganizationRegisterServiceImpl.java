package com.ngo.finance.organizationRegister.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.organizationRegister.dto.request.CreateOrganizationRequest;
import com.ngo.finance.organizationRegister.dto.request.UpdateOrganizationRequest;
import com.ngo.finance.organizationRegister.dto.response.OrganizationResponse;
import com.ngo.finance.organizationRegister.entity.OrganizationRegister;
import com.ngo.finance.organizationRegister.enums.OrganizationStatus;
import com.ngo.finance.organizationRegister.mapper.OrganizationMapper;
import com.ngo.finance.organizationRegister.repository.OrganizationRegisterRepository;
import com.ngo.finance.organizationRegister.service.OrganizationRegisterService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Organisation Register operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationRegisterServiceImpl implements OrganizationRegisterService {

    private final OrganizationRegisterRepository organisationRegisterRepository;

    private final StateRepository stateRepository;

    private final CityRepository cityRepository;

    private final OrganizationMapper organisationMapper;

    @Override
    public OrganizationResponse createOrganisation(CreateOrganizationRequest request) {
        log.info("Registering new organisation: {}", request.getName());

        if (organisationRegisterRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("An organisation with email '" + request.getEmail() + "' already exists");
        }

        String shortName = normalizeShortName(request.getShortName());
        if (organisationRegisterRepository.existsByShortName(shortName)) {
            throw new ValidationException("An organisation with short name '" + shortName + "' already exists");
        }

        OrganizationRegister organisation = organisationMapper.toEntity(request);
        organisation.setShortName(shortName);
        organisation.setState(stateRepository.findById(request.getStateId())
                .orElseThrow(() -> new ResourceNotFoundException("State", request.getStateId())));
        organisation.setCity(cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City", request.getCityId())));
        organisation.setStatus(OrganizationStatus.PENDING);

        OrganizationRegister saved = organisationRegisterRepository.save(organisation);
        log.info("Organisation registered successfully with id: {}", saved.getId());

        return organisationMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean shortNameExists(String shortName) {
        return organisationRegisterRepository.existsByShortName(normalizeShortName(shortName));
    }

    private static String normalizeShortName(String shortName) {
        return shortName == null ? null : shortName.trim().toLowerCase();
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganisationById(Long id) {
        log.debug("Fetching organisation with id: {}", id);
        OrganizationRegister organisation = organisationRegisterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organisation", id));
        return organisationMapper.toResponse(organisation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganisations() {
        log.debug("Fetching all organisations");
        return organisationRegisterRepository.findAll().stream()
                .map(organisationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponse> searchOrganisations(String searchTerm) {
        log.debug("Searching organisations with term: {}", searchTerm);
        return organisationRegisterRepository.searchByNameOrShortName(searchTerm).stream()
                .map(organisationMapper::toResponse)
                .toList();
    }

    @Override
    public OrganizationResponse updateOrganisation(Long id, UpdateOrganizationRequest request) {
        log.info("Updating organisation with id: {}", id);

        OrganizationRegister organisation = organisationRegisterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organisation", id));

        if (request.getStateId() != null) {
            organisation.setState(stateRepository.findById(request.getStateId())
                    .orElseThrow(() -> new ResourceNotFoundException("State", request.getStateId())));
        }

        if (request.getCityId() != null) {
            organisation.setCity(cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City", request.getCityId())));
        }

        if (request.getShortName() != null) {
            String shortName = normalizeShortName(request.getShortName());
            if (!shortName.equals(organisation.getShortName())
                    && organisationRegisterRepository.existsByShortName(shortName)) {
                throw new ValidationException("An organisation with short name '" + shortName + "' already exists");
            }
            request.setShortName(shortName);
        }

        organisationMapper.updateEntity(request, organisation);

        OrganizationRegister updated = organisationRegisterRepository.save(organisation);
        log.info("Organisation updated successfully");

        return organisationMapper.toResponse(updated);
    }

    @Override
    public void activateOrganisation(Long id) {
        log.info("Activating organisation with id: {}", id);

        OrganizationRegister organisation = organisationRegisterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organisation", id));

        organisation.setStatus(OrganizationStatus.ACTIVE);
        organisationRegisterRepository.save(organisation);

        log.info("Organisation activated successfully");
    }

    @Override
    public void deactivateOrganisation(Long id) {
        log.info("Deactivating organisation with id: {}", id);

        OrganizationRegister organisation = organisationRegisterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organisation", id));

        organisation.setStatus(OrganizationStatus.INACTIVE);
        organisationRegisterRepository.save(organisation);

        log.info("Organisation deactivated successfully");
    }
}
