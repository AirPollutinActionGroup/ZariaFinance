package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateDonorRequest;
import com.ngo.finance.donor.dto.request.UpdateDonorRequest;
import com.ngo.finance.donor.dto.response.DonorResponse;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.mapper.DonorMapper;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.donor.service.DonorService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Donor operations
 */
@Slf4j
@Service
@Transactional
public class DonorServiceImpl implements DonorService {

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private DonorMapper donorMapper;

    @Override
    public DonorResponse createDonor(CreateDonorRequest request) {
        log.info("Creating new donor with code: {}", request.getDonorCode());

        DonorMaster donor = donorMapper.toEntity(request);

        if (request.getStateId() != null) {
            donor.setState(stateRepository.findById(request.getStateId())
                    .orElseThrow(() -> new ResourceNotFoundException("State", request.getStateId())));
        }

        if (request.getCityId() != null) {
            donor.setCity(cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City", request.getCityId())));
        }

        donor.setStatus(DonorStatus.DRAFT);
        donor.setOnboardingStep(1);
        donor.setIsActive(false);

        DonorMaster savedDonor = donorRepository.save(donor);
        log.info("Donor created successfully with id: {}", savedDonor.getId());

        return donorMapper.toResponse(savedDonor);
    }

    @Override
    @Transactional(readOnly = true)
    public DonorResponse getDonorById(Long id) {
        log.debug("Fetching donor with id: {}", id);
        DonorMaster donor = donorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", id));
        return donorMapper.toResponse(donor);
    }

    @Override
    @Transactional(readOnly = true)
    public DonorResponse getDonorByCode(String donorCode) {
        log.debug("Fetching donor with code: {}", donorCode);
        DonorMaster donor = donorRepository.findByDonorCode(donorCode)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", "code", donorCode));
        return donorMapper.toResponse(donor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonorResponse> getAllDonors() {
        log.debug("Fetching all donors");
        return donorRepository.findAll().stream()
                .filter(donor -> donor.getStatus() != DonorStatus.DRAFT)
                .map(donorMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonorResponse> searchDonors(String searchTerm) {
        log.debug("Searching donors with term: {}", searchTerm);
        return donorRepository.searchByCodeOrName(searchTerm).stream()
                .filter(donor -> donor.getStatus() != DonorStatus.DRAFT)
                .map(donorMapper::toResponse)
                .toList();
    }

    @Override
    public DonorResponse updateDonor(Long id, UpdateDonorRequest request) {
        log.info("Updating donor with id: {}", id);

        DonorMaster donor = donorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", id));

        if (request.getStateId() != null) {
            donor.setState(stateRepository.findById(request.getStateId())
                    .orElseThrow(() -> new ResourceNotFoundException("State", request.getStateId())));
        }

        if (request.getCityId() != null) {
            donor.setCity(cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City", request.getCityId())));
        }

        donorMapper.updateEntity(new CreateDonorRequest(
                donor.getDonorCode(),
                request.getDonorName(),
                request.getDonorType(),
                request.getFundClass(),
                request.getEmail(),
                request.getPhoneNumber(),
                request.getWebsite(),
                request.getRegistrationNumber(),
                request.getTaxId(),
                request.getAddress(),
                request.getCityId(),
                request.getStateId(),
                request.getCountry(),
                request.getPostalCode()
        ), donor);

        DonorMaster updated = donorRepository.save(donor);
        log.info("Donor updated successfully");

        return donorMapper.toResponse(updated);
    }

    @Override
    public void activateDonor(Long id) {
        log.info("Activating donor with id: {}", id);

        DonorMaster donor = donorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", id));

        donor.setIsActive(true);
        donor.setStatus(DonorStatus.ACTIVE);
        donorRepository.save(donor);

        log.info("Donor activated successfully");
    }

    @Override
    public void deactivateDonor(Long id) {
        log.info("Deactivating donor with id: {}", id);

        DonorMaster donor = donorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", id));

        donor.setIsActive(false);
        donor.setStatus(DonorStatus.INACTIVE);
        donorRepository.save(donor);

        log.info("Donor deactivated successfully");
    }

    @Override
    public void advanceOnboardingStep(Long donorId) {
        log.info("Advancing onboarding step for donor with id: {}", donorId);

        DonorMaster donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", donorId));

        if (donor.getOnboardingStep() < 10) {
            donor.setOnboardingStep(donor.getOnboardingStep() + 1);
            donorRepository.save(donor);
            log.info("Onboarding step advanced to: {}", donor.getOnboardingStep());
        }
    }
}
