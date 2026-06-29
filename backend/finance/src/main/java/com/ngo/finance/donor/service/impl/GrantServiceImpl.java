package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.dto.response.GrantDetailsResponse;
import com.ngo.finance.donor.dto.response.GrantListResponse;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.mapper.GrantMapper;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.service.GrantService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Grant Agreement operations
 */
@Slf4j
@Service
@Transactional
public class GrantServiceImpl implements GrantService {

    @Autowired
    private GrantRepository grantRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private GrantMapper grantMapper;

    @Override
    public GrantDetailsResponse createGrant(CreateGrantRequest request) {
        log.info("Creating new grant with code: {}", request.getGrantCode());

        GrantAgreement grant = grantMapper.toEntity(request);

        grant.setDonor(donorRepository.findById(request.getDonorId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor", request.getDonorId())));

        grant.setProgramme(programmeRepository.findById(request.getProgrammeId())
                .orElseThrow(() -> new ResourceNotFoundException("Programme", request.getProgrammeId())));

        grant.setGrantStatus(GrantStatus.DRAFT);

        GrantAgreement savedGrant = grantRepository.save(grant);
        log.info("Grant created successfully with id: {}", savedGrant.getId());

        return grantMapper.toDetailsResponse(savedGrant);
    }

    @Override
    @Transactional(readOnly = true)
    public GrantDetailsResponse getGrantById(Long id) {
        log.debug("Fetching grant with id: {}", id);
        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));
        return grantMapper.toDetailsResponse(grant);
    }

    @Override
    @Transactional(readOnly = true)
    public GrantDetailsResponse getGrantByCode(String grantCode) {
        log.debug("Fetching grant with code: {}", grantCode);
        GrantAgreement grant = grantRepository.findByGrantCode(grantCode)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", "code", grantCode));
        return grantMapper.toDetailsResponse(grant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrantListResponse> getAllGrants() {
        log.debug("Fetching all grants");
        return grantRepository.findAll().stream()
                .map(grantMapper::toListResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrantListResponse> getGrantsByDonorId(Long donorId) {
        log.debug("Fetching grants for donor id: {}", donorId);
        return grantRepository.findByDonorId(donorId).stream()
                .map(grantMapper::toListResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrantListResponse> getGrantsByProgrammeId(Long programmeId) {
        log.debug("Fetching grants for programme id: {}", programmeId);
        return grantRepository.findByProgrammeId(programmeId).stream()
                .map(grantMapper::toListResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrantListResponse> searchGrants(String searchTerm) {
        log.debug("Searching grants with term: {}", searchTerm);
        return grantRepository.searchByCodeOrName(searchTerm).stream()
                .map(grantMapper::toListResponse)
                .toList();
    }

    @Override
    public void approveGrant(Long id) {
        log.info("Approving grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        if (grant.getGrantStatus() == GrantStatus.DRAFT) {
            grant.setGrantStatus(GrantStatus.APPROVED);
            grantRepository.save(grant);
            log.info("Grant approved successfully");
        } else {
            log.warn("Cannot approve grant in status: {}", grant.getGrantStatus());
        }
    }

    @Override
    public void activateGrant(Long id) {
        log.info("Activating grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        if (grant.getGrantStatus() == GrantStatus.APPROVED) {
            grant.setGrantStatus(GrantStatus.ACTIVE);
            grantRepository.save(grant);
            log.info("Grant activated successfully");
        } else {
            log.warn("Cannot activate grant in status: {}", grant.getGrantStatus());
        }
    }

    @Override
    public void closeGrant(Long id) {
        log.info("Closing grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        grant.setGrantStatus(GrantStatus.CLOSED);
        grantRepository.save(grant);
        log.info("Grant closed successfully");
    }
}
