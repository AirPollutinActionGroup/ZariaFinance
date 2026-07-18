package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateDonorRequest;
import com.ngo.finance.donor.dto.request.UpdateDonorRequest;
import com.ngo.finance.donor.dto.response.DonorResponse;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.mapper.DonorMapper;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.donor.service.DonorService;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
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
    private DonorFundProfileRepository fundProfileRepository;

    @Autowired
    private GrantRepository grantRepository;

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
                .map(this::withFundingSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonorResponse> searchDonors(String searchTerm) {
        log.debug("Searching donors with term: {}", searchTerm);
        return donorRepository.searchByCodeOrName(searchTerm).stream()
                .filter(donor -> donor.getStatus() != DonorStatus.DRAFT)
                .map(donorMapper::toResponse)
                .map(this::withFundingSummary)
                .toList();
    }

    /**
     * Enriches a register row with fund-class codes and committed-funding totals
     * (issue #21, items 1 & 11). Committed amounts come from the donor's non-draft
     * grants, grouped by the restriction (fund mode) of each grant's fund profile;
     * profile counts come from the donor's fund profiles. Runs one profile + one
     * grant query per donor — acceptable at register scale.
     */
    private DonorResponse withFundingSummary(DonorResponse response) {
        Long donorId = response.getId();
        List<DonorFundProfile> profiles = fundProfileRepository.findByDonorId(donorId);
        List<GrantAgreement> grants = grantRepository.findByDonorId(donorId).stream()
                .filter(grant -> grant.getGrantStatus() != GrantStatus.DRAFT)
                .toList();

        response.setFundClassCodes(profiles.stream()
                .map(DonorFundProfile::getFundClassCode)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList());

        BigDecimal total = BigDecimal.ZERO;
        Map<String, BigDecimal> committedByMode = new LinkedHashMap<>();
        for (GrantAgreement grant : grants) {
            BigDecimal committed = grant.getReportingAmountInr() != null
                    ? grant.getReportingAmountInr()
                    : grant.getTotalGrantAmount();
            if (committed == null) {
                committed = BigDecimal.ZERO;
            }
            total = total.add(committed);
            String mode = grant.getFundProfile() != null && grant.getFundProfile().getFundMode() != null
                    ? grant.getFundProfile().getFundMode()
                    : "Unspecified";
            committedByMode.merge(mode, committed, BigDecimal::add);
        }
        response.setTotalCommitted(total);

        Map<String, Long> profileCountByMode = profiles.stream()
                .collect(Collectors.groupingBy(
                        profile -> profile.getFundMode() != null ? profile.getFundMode() : "Unspecified",
                        LinkedHashMap::new,
                        Collectors.counting()));

        Set<String> modes = new LinkedHashSet<>();
        modes.addAll(profileCountByMode.keySet());
        modes.addAll(committedByMode.keySet());
        response.setCommitmentBreakdown(modes.stream()
                .map(mode -> DonorResponse.CommitmentBucket.builder()
                        .fundMode(mode)
                        .committed(committedByMode.getOrDefault(mode, BigDecimal.ZERO))
                        .fundProfileCount(profileCountByMode.getOrDefault(mode, 0L).intValue())
                        .build())
                .toList());

        return response;
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
