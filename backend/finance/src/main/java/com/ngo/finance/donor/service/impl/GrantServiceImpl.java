package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.dto.response.GrantDetailsResponse;
import com.ngo.finance.donor.dto.response.GrantListResponse;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.mapper.GrantMapper;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.service.GrantService;
import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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
    private DonorFundProfileRepository fundProfileRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private GrantMapper grantMapper;

    /** Auto-generated grant code prefix: ZRY/GA/YYYY/NNN. */
    private static final String GRANT_CODE_PREFIX = "ZRY/GA/";
    private static final Pattern LEADING_DIGITS = Pattern.compile("^(\\d+)");

    @Override
    public GrantDetailsResponse createGrant(CreateGrantRequest request) {
        GrantAgreement grant = grantMapper.toEntity(request);
        grant.setGrantCode(resolveGrantCode(request));
        log.info("Creating new grant with code: {}", grant.getGrantCode());
        applyFundProfile(grant, request.getFundProfileId(), request.getProgrammeId());
        applyFinancials(grant, request);
        grant.setGrantStatus(GrantStatus.DRAFT);

        GrantAgreement savedGrant = grantRepository.save(grant);
        log.info("Grant created successfully with id: {}", savedGrant.getId());

        return grantMapper.toDetailsResponse(savedGrant);
    }

    @Override
    public GrantDetailsResponse updateGrant(Long id, CreateGrantRequest request) {
        log.info("Updating grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        // grantCode is the immutable business key; everything else is editable.
        grant.setAgreementName(request.getAgreementName());
        grant.setAgreementDate(request.getAgreementDate());
        grant.setStartDate(request.getStartDate());
        grant.setEndDate(request.getEndDate());
        grant.setTotalGrantAmount(request.getTotalGrantAmount());
        grant.setDescription(request.getDescription());
        grant.setAgreementDocumentPath(request.getAgreementDocumentPath());

        applyFundProfile(grant, request.getFundProfileId(), request.getProgrammeId());
        applyFinancials(grant, request);

        GrantAgreement saved = grantRepository.save(grant);
        log.info("Grant updated successfully: {}", saved.getId());
        return grantMapper.toDetailsResponse(saved);
    }

    /**
     * Attach the fund profile and inherit its donor onto the grant. The programme
     * defaults to the profile's programme, but an explicit {@code programmeId}
     * (entered on the form) overrides it.
     */
    private void applyFundProfile(GrantAgreement grant, Long fundProfileId, Long programmeId) {
        DonorFundProfile profile = fundProfileRepository.findById(fundProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Fund profile", fundProfileId));
        grant.setFundProfile(profile);
        grant.setDonor(profile.getDonor());

        if (programmeId != null) {
            Programme programme = programmeRepository.findById(programmeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Programme", programmeId));
            grant.setProgramme(programme);
        } else {
            grant.setProgramme(profile.getProgramme()); // may be null for untied funds
        }
    }

    /** Use the supplied code, or generate the next ZRY/GA/YYYY/NNN for the agreement year. */
    private String resolveGrantCode(CreateGrantRequest request) {
        if (request.getGrantCode() != null && !request.getGrantCode().isBlank()) {
            return request.getGrantCode().trim();
        }
        int year = request.getAgreementDate().getYear();
        String prefix = GRANT_CODE_PREFIX + year + "/";
        int next = grantRepository.findGrantCodesByPrefix(prefix).stream()
                .map(code -> code.substring(prefix.length()))
                .mapToInt(GrantServiceImpl::leadingSequence)
                .max()
                .orElse(0) + 1;
        return String.format("%s%03d", prefix, next);
    }

    /** Parse the leading numeric run of a code suffix (e.g. "012-B" -> 12); 0 if none. */
    private static int leadingSequence(String suffix) {
        Matcher matcher = LEADING_DIGITS.matcher(suffix);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
    }

    /** Apply currency / FX defaults and compute the INR reporting amount. */
    private void applyFinancials(GrantAgreement grant, CreateGrantRequest request) {
        String currency = (request.getGrantCurrency() == null || request.getGrantCurrency().isBlank())
                ? "INR" : request.getGrantCurrency().trim().toUpperCase();
        BigDecimal fx = request.getFxLockedRate() != null ? request.getFxLockedRate() : BigDecimal.ONE;
        grant.setGrantCurrency(currency);
        grant.setFxLockedRate(fx);
        grant.setReportingAmountInr(
                grant.getTotalGrantAmount() != null ? grant.getTotalGrantAmount().multiply(fx) : null);
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
                .filter(grant -> grant.getGrantStatus() != GrantStatus.DRAFT)
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
                .filter(grant -> grant.getGrantStatus() != GrantStatus.DRAFT)
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
