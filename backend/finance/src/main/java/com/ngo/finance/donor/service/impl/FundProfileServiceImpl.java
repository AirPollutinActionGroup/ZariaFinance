package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.response.FundProfileResponse;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.mapper.FundProfileMapper;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.service.FundProfileService;
import com.ngo.finance.programme.entity.Programme;
import com.ngo.finance.programme.repository.ProgrammeRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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

    private static final String PROFILE_CODE_PREFIX = "FP-";

    @Autowired
    private DonorFundProfileRepository profileRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private FundProfileMapper mapper;

    @Autowired
    private GrantRepository grantRepository;

    @Override
    public FundProfileResponse createProfile(Long donorId, CreateFundProfileRequest request) {
        log.info("Creating fund profile for donor id: {}", donorId);

        DonorMaster donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", donorId));

        DonorFundProfile profile = mapper.toEntity(request);
        profile.setDonor(donor);
        profile.setProfileCode(nextProfileCode(LocalDate.now().getYear()));
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
        return toResponsesWithGrantCodes(
                profileRepository.findByDonorId(donorId), grantRepository.findByDonorId(donorId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundProfileResponse> getAllProfiles() {
        log.debug("Fetching all fund profiles");
        return toResponsesWithGrantCodes(profileRepository.findAllNewestFirst(), grantRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public FundProfileResponse getProfileById(Long id) {
        log.debug("Fetching fund profile with id: {}", id);
        FundProfileResponse response = mapper.toResponse(findOrThrow(id));
        grantRepository.findByFundProfileId(id).stream().findFirst()
                .ifPresent(grant -> response.setAssignedGrantCode(grant.getGrantCode()));
        return response;
    }

    /** Maps profiles to responses, stamping each with the code of the grant it backs (if any). */
    private List<FundProfileResponse> toResponsesWithGrantCodes(
            List<DonorFundProfile> profiles, List<GrantAgreement> grants) {
        // toMap with a merge function: a fund profile is meant to back at most one
        // grant, but pre-existing data may still have more than one attached to it
        // (predates that constraint) — keep the first rather than crash on lookup.
        Map<Long, String> grantCodeByProfileId = grants.stream()
                .filter(grant -> grant.getFundProfile() != null)
                .collect(Collectors.toMap(
                        grant -> grant.getFundProfile().getId(), GrantAgreement::getGrantCode,
                        (first, second) -> first));

        return profiles.stream()
                .map(mapper::toResponse)
                .peek(response -> response.setAssignedGrantCode(grantCodeByProfileId.get(response.getId())))
                .toList();
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

    /**
     * FP-{year}-{nnn}: one more than the highest number used this year. Parsed
     * numerically (not string-sorted) so FP-2026-1000 still follows FP-2026-999.
     */
    String nextProfileCode(int year) {
        String prefix = PROFILE_CODE_PREFIX + year + "-";
        int next = profileRepository.findProfileCodesByPrefix(prefix).stream()
                .map(code -> code.substring(prefix.length()))
                .filter(suffix -> suffix.matches("\\d+"))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0) + 1;
        return prefix + String.format("%03d", next);
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
