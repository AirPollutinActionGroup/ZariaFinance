package com.ngo.finance.masters.donortype.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.masters.donortype.dto.request.CreateDonorTypeRequest;
import com.ngo.finance.masters.donortype.dto.request.UpdateDonorTypeRequest;
import com.ngo.finance.masters.donortype.dto.response.DonorTypeResponse;
import com.ngo.finance.masters.donortype.entity.DonorTypeMaster;
import com.ngo.finance.masters.donortype.mapper.DonorTypeMapper;
import com.ngo.finance.masters.donortype.repository.DonorTypeMasterRepository;
import com.ngo.finance.masters.donortype.service.DonorTypeService;
import java.util.HashSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Donor Type operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DonorTypeServiceImpl implements DonorTypeService {

    private final DonorTypeMasterRepository donorTypeMasterRepository;

    private final DonorTypeMapper donorTypeMapper;

    @Override
    public DonorTypeResponse createDonorType(CreateDonorTypeRequest request) {
        log.info("Registering new donor type: {}", request.getName());

        if (donorTypeMasterRepository.existsByName(request.getName())) {
            throw new ValidationException("A donor type with name '" + request.getName() + "' already exists");
        }

        DonorTypeMaster donorType = donorTypeMapper.toEntity(request);
        donorType.setStatus(request.getStatus() == null || request.getStatus());
        donorType.setAllowedFundSourceDomiciles(request.getAllowedFundSourceDomiciles() == null
                ? new HashSet<>()
                : new HashSet<>(request.getAllowedFundSourceDomiciles()));
        donorType.setAllowedContributionTypes(request.getAllowedContributionTypes() == null
                ? new HashSet<>()
                : new HashSet<>(request.getAllowedContributionTypes()));

        DonorTypeMaster saved = donorTypeMasterRepository.save(donorType);
        log.info("Donor type registered successfully with id: {}", saved.getId());

        return donorTypeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DonorTypeResponse getDonorTypeById(Long id) {
        log.debug("Fetching donor type with id: {}", id);
        DonorTypeMaster donorType = donorTypeMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor type", id));
        return donorTypeMapper.toResponse(donorType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonorTypeResponse> getAllDonorTypes() {
        log.debug("Fetching all donor types");
        return donorTypeMasterRepository.findAll().stream()
                .map(donorTypeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonorTypeResponse> searchDonorTypes(String searchTerm) {
        log.debug("Searching donor types with term: {}", searchTerm);
        return donorTypeMasterRepository.searchByName(searchTerm).stream()
                .map(donorTypeMapper::toResponse)
                .toList();
    }

    @Override
    public DonorTypeResponse updateDonorType(Long id, UpdateDonorTypeRequest request) {
        log.info("Updating donor type with id: {}", id);

        DonorTypeMaster donorType = donorTypeMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor type", id));

        if (request.getName() != null
                && !request.getName().equals(donorType.getName())
                && donorTypeMasterRepository.existsByName(request.getName())) {
            throw new ValidationException("A donor type with name '" + request.getName() + "' already exists");
        }

        donorTypeMapper.updateEntity(request, donorType);
        if (request.getAllowedFundSourceDomiciles() != null) {
            donorType.setAllowedFundSourceDomiciles(new HashSet<>(request.getAllowedFundSourceDomiciles()));
        }
        if (request.getAllowedContributionTypes() != null) {
            donorType.setAllowedContributionTypes(new HashSet<>(request.getAllowedContributionTypes()));
        }

        DonorTypeMaster updated = donorTypeMasterRepository.save(donorType);
        log.info("Donor type updated successfully");

        return donorTypeMapper.toResponse(updated);
    }

    @Override
    public void activateDonorType(Long id) {
        log.info("Activating donor type with id: {}", id);

        DonorTypeMaster donorType = donorTypeMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor type", id));

        donorType.setStatus(true);
        donorTypeMasterRepository.save(donorType);

        log.info("Donor type activated successfully");
    }

    @Override
    public void deactivateDonorType(Long id) {
        log.info("Deactivating donor type with id: {}", id);

        DonorTypeMaster donorType = donorTypeMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor type", id));

        donorType.setStatus(false);
        donorTypeMasterRepository.save(donorType);

        log.info("Donor type deactivated successfully");
    }
}
