package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.response.FundProfileResponse;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.mapper.FundProfileMapper;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.service.FundProfileService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Donor Fund Profile operations.
 */
@Slf4j
@Service
@Transactional
public class FundProfileServiceImpl implements FundProfileService {

    @Autowired
    private DonorFundProfileRepository profileRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private FundProfileMapper mapper;

    @Override
    public FundProfileResponse createProfile(Long donorId, CreateFundProfileRequest request) {
        log.info("Creating fund profile for donor id: {}", donorId);

        DonorMaster donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", donorId));

        DonorFundProfile profile = mapper.toEntity(request);
        profile.setDonor(donor);
        applyProgramme(request, profile);

        DonorFundProfile saved = profileRepository.save(profile);
        log.info("Fund profile created with id: {}", saved.getId());
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundProfileResponse> getProfilesByDonor(Long donorId) {
        log.debug("Fetching fund profiles for donor id: {}", donorId);
        if (!donorRepository.existsById(donorId)) {
            throw new ResourceNotFoundException("Donor", donorId);
        }
        return profileRepository.findByDonorId(donorId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FundProfileResponse getProfileById(Long id) {
        log.debug("Fetching fund profile with id: {}", id);
        return mapper.toResponse(findOrThrow(id));
    }

    @Override
    public FundProfileResponse updateProfile(Long id, CreateFundProfileRequest request) {
        log.info("Updating fund profile with id: {}", id);
        DonorFundProfile profile = findOrThrow(id);
        mapper.updateEntity(request, profile);
        applyProgramme(request, profile);
        DonorFundProfile saved = profileRepository.save(profile);
        log.info("Fund profile updated: {}", saved.getId());
        return mapper.toResponse(saved);
    }

    private DonorFundProfile findOrThrow(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fund profile", id));
    }

    private void applyProgramme(CreateFundProfileRequest request, DonorFundProfile profile) {
        if (request.getProgrammeId() != null) {
            Programme programme = programmeRepository.findById(request.getProgrammeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Programme", request.getProgrammeId()));
            profile.setProgramme(programme);
        } else {
            profile.setProgramme(null);
        }
    }
}
