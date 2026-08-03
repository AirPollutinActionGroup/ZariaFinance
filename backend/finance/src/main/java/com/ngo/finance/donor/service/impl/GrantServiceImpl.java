package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.ApproveGrantRequest;
import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.dto.request.GrantRemarksRequest;
import com.ngo.finance.donor.dto.response.GrantDetailsResponse;
import com.ngo.finance.donor.dto.response.GrantListResponse;
import com.ngo.finance.donor.entity.DonorDisbursementRule;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.mapper.GrantMapper;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.service.GrantService;
import com.ngo.finance.userRegister.repository.UserRegisterRepo;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    @Autowired
    private UserRegisterRepo userRegisterRepo;

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
        applyStatus(grant, request.getStatus());
        applyApproval(grant, request);

        GrantAgreement savedGrant = grantRepository.save(grant);
        log.info("Grant created successfully with id: {}", savedGrant.getId());

        return toDetails(savedGrant);
    }

    @Override
    public GrantDetailsResponse updateGrant(Long id, CreateGrantRequest request) {
        log.info("Updating grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        // grantCode is the immutable business key; everything else is editable.
        // totalGrantAmount is absent by design — it comes from the fund profile.
        grant.setAgreementName(request.getAgreementName());
        grant.setAgreementDate(request.getAgreementDate());
        grant.setStartDate(request.getStartDate());
        grant.setEndDate(request.getEndDate());
        grant.setDescription(request.getDescription());
        grant.setAgreementDocumentPath(request.getAgreementDocumentPath());

        applyFundProfile(grant, request.getFundProfileId(), request.getProgrammeId());
        applyFinancials(grant, request);
        applyStatus(grant, request.getStatus());
        applyApproval(grant, request);

        GrantAgreement saved = grantRepository.save(grant);
        log.info("Grant updated successfully: {}", saved.getId());
        return toDetails(saved);
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
        // Read-only on the form: the total is the profile's active disbursement
        // rule's committed amount (a profile has at most one meaningful rule).
        grant.setTotalGrantAmount(profile.getDisbursementRules().stream()
                .findFirst()
                .map(DonorDisbursementRule::getTotalAmount)
                .orElse(null));

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

    /**
     * Set the agreement status and keep {@code isActive} in lockstep — the boolean
     * is what existing queries, reports and lifecycle endpoints read.
     */
    private void applyStatus(GrantAgreement grant, GrantStatus status) {
        GrantStatus resolved = status != null ? status : GrantStatus.ACTIVE;
        grant.setGrantStatus(resolved);
        grant.setIsActive(resolved == GrantStatus.ACTIVE);
    }

    /**
     * Apply the form's approval block. Independent of {@code status}: a grant may
     * be ACTIVE while approval is still pending. Fields left null are untouched,
     * so an edit that doesn't show approval can't silently clear it.
     */
    private void applyApproval(GrantAgreement grant, CreateGrantRequest request) {
        if (request.getApprovalStatus() != null) {
            grant.setIsApproved(request.getApprovalStatus());
        }
        if (request.getApprovedBy() != null) {
            grant.setApprovedBy(request.getApprovedBy());
        }
        if (request.getApprovalDate() != null) {
            // The column is a timestamp (the PATCH lifecycle stamps a time); the
            // form only offers a date, so it lands at the start of that day.
            grant.setApprovalDate(request.getApprovalDate().atStartOfDay());
        }
        if (request.getApprovalRemarks() != null) {
            grant.setApprovalRemarks(request.getApprovalRemarks());
        }
    }

    /** Details response with the approver's id resolved to a display name. */
    private GrantDetailsResponse toDetails(GrantAgreement grant) {
        GrantDetailsResponse response = grantMapper.toDetailsResponse(grant);
        response.setApprovedByName(resolveApproverName(grant.getApprovedBy()));
        return response;
    }

    private String resolveApproverName(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRegisterRepo.findById(userId)
                .map(user -> {
                    String last = user.getLastName();
                    return last == null || last.isBlank()
                            ? user.getFirstName()
                            : user.getFirstName() + " " + last;
                })
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public GrantDetailsResponse getGrantById(Long id) {
        log.debug("Fetching grant with id: {}", id);
        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));
        return toDetails(grant);
    }

    @Override
    @Transactional(readOnly = true)
    public GrantDetailsResponse getGrantByCode(String grantCode) {
        log.debug("Fetching grant with code: {}", grantCode);
        GrantAgreement grant = grantRepository.findByGrantCode(grantCode)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", "code", grantCode));
        return toDetails(grant);
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
    public void approveGrant(Long id, ApproveGrantRequest request) {
        log.info("Approving grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        if (grant.getIsApproved() == 2) {
            grant.setIsApproved(1);
            grant.setApprovedBy(request != null ? request.getApprovedBy() : null);
            grant.setApprovalRemarks(request != null ? request.getRemarks() : null);
            grant.setApprovalDate(LocalDateTime.now());
            grantRepository.save(grant);
            log.info("Grant approved successfully");
        } else {
            log.warn("Cannot approve grant with isApproved: {}", grant.getIsApproved());
        }
    }

    @Override
    public void activateGrant(Long id) {
        log.info("Activating grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        if (grant.getIsApproved() == 1) {
            applyStatus(grant, GrantStatus.ACTIVE);
            grantRepository.save(grant);
            log.info("Grant activated successfully");
        } else {
            log.warn("Cannot activate grant that is not approved (isApproved: {})", grant.getIsApproved());
        }
    }

    @Override
    public void closeGrant(Long id) {
        log.info("Closing grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        // Closing is the cancel path: the agreement stops being live.
        applyStatus(grant, GrantStatus.CANCELLED);
        grantRepository.save(grant);
        log.info("Grant closed successfully");
    }

    @Override
    public void holdGrant(Long id, GrantRemarksRequest request) {
        log.info("Putting grant with id: {} on hold", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        if (grant.getIsApproved() == 1) {
            grant.setIsApproved(3);
            if (request != null && request.getRemarks() != null) {
                grant.setApprovalRemarks(request.getRemarks());
            }
            grantRepository.save(grant);
            log.info("Grant put on hold successfully");
        } else {
            log.warn("Cannot put grant on hold that is not approved (isApproved: {})", grant.getIsApproved());
        }
    }

    @Override
    public void resumeGrant(Long id) {
        log.info("Resuming grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        if (grant.getIsApproved() == 3) {
            grant.setIsApproved(1);
            grantRepository.save(grant);
            log.info("Grant resumed successfully");
        } else {
            log.warn("Cannot resume grant that is not on hold (isApproved: {})", grant.getIsApproved());
        }
    }

    @Override
    public void completeGrant(Long id) {
        log.info("Completing grant with id: {}", id);

        GrantAgreement grant = grantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", id));

        if (grant.getIsApproved() == 1) {
            grant.setIsApproved(4);
            applyStatus(grant, GrantStatus.COMPLETED);
            grantRepository.save(grant);
            log.info("Grant completed successfully");
        } else {
            log.warn("Cannot complete grant that is not approved (isApproved: {})", grant.getIsApproved());
        }
    }
}
