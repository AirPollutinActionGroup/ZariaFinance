package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateTrancheRequest;
import com.ngo.finance.donor.dto.request.ReceiveTrancheRequest;
import com.ngo.finance.donor.dto.response.TrancheResponse;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.mapper.TrancheMapper;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.repository.GrantTrancheRepository;
import com.ngo.finance.donor.service.TrancheService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Grant Tranche operations.
 */
@Slf4j
@Service
@Transactional
public class TrancheServiceImpl implements TrancheService {

    @Autowired
    private GrantTrancheRepository trancheRepository;

    @Autowired
    private GrantRepository grantRepository;

    @Autowired
    private TrancheMapper trancheMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TrancheResponse> getTranchesByGrant(Long grantId) {
        log.debug("Fetching tranches for grant id: {}", grantId);
        if (!grantRepository.existsById(grantId)) {
            throw new ResourceNotFoundException("Grant", grantId);
        }
        return trancheRepository.findTranchesByGrantIdOrderedByNumber(grantId).stream()
                .map(this::toResolvedResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrancheResponse> getAllTranches() {
        log.debug("Fetching all tranches across every grant");
        return trancheRepository.findAllOrderedByPlannedReleaseDate().stream()
                .map(this::toResolvedResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TrancheResponse getTrancheById(Long trancheId) {
        log.debug("Fetching tranche with id: {}", trancheId);
        GrantTranche tranche = trancheRepository.findById(trancheId)
                .orElseThrow(() -> new ResourceNotFoundException("Tranche", trancheId));
        return toResolvedResponse(tranche);
    }

    @Override
    public TrancheResponse scheduleTranche(Long grantId, CreateTrancheRequest request) {
        log.info("Scheduling tranche {} for grant id: {}", request.getTrancheNumber(), grantId);
        GrantAgreement grant = grantRepository.findById(grantId)
                .orElseThrow(() -> new ResourceNotFoundException("Grant", grantId));

        GrantTranche tranche = trancheMapper.toEntity(request);
        tranche.setGrant(grant);

        GrantTranche saved = trancheRepository.save(tranche);
        log.info("Tranche scheduled with id: {}", saved.getId());
        return toResolvedResponse(saved);
    }

    @Override
    public TrancheResponse receiveTranche(Long trancheId, ReceiveTrancheRequest request) {
        log.info("Recording receipt for tranche id: {}", trancheId);
        GrantTranche tranche = trancheRepository.findById(trancheId)
                .orElseThrow(() -> new ResourceNotFoundException("Tranche", trancheId));

        tranche.setActualAmount(request.getActualAmount());
        tranche.setActualReleaseDate(request.getActualDate());
        tranche.setActualFxRate(request.getActualFxRate());
        tranche.setBankReference(request.getBankReference());
        tranche.setReceiptVoucherNo(request.getReceiptVoucherNo());
        tranche.setVarianceReason(request.getVarianceReason());
        tranche.setTrancheStatus("Received");
        // The criteria gate is derived from the tranche's release criteria, never
        // asserted by a receipt: money arriving does not prove a milestone was
        // signed off, and the two tracks are deliberately kept separate.
        tranche.setConditionMet(tranche.criteriaSatisfied() ? "Met" : "Pending");

        GrantTranche saved = trancheRepository.save(tranche);
        log.info("Tranche receipt recorded for id: {}", saved.getId());
        return toResolvedResponse(saved);
    }

    /** Resolves grant/donor/fund-profile display fields that aren't persisted on the tranche itself. */
    private TrancheResponse toResolvedResponse(GrantTranche tranche) {
        TrancheResponse response = trancheMapper.toResponse(tranche);
        GrantAgreement grant = tranche.getGrant();
        if (grant == null) {
            return response;
        }
        response.setGrantCode(grant.getGrantCode());
        response.setGrantCurrency(grant.getGrantCurrency());
        response.setFxLockedRate(grant.getFxLockedRate());

        DonorMaster donor = grant.getDonor();
        if (donor != null) {
            response.setDonorId(donor.getId());
            response.setDonorName(donor.getDonorName());
            response.setBook(donor.getBook() != null ? donor.getBook().getShortName() : null);
        }

        DonorFundProfile fundProfile = grant.getFundProfile();
        if (fundProfile != null && fundProfile.getFundMode() != null) {
            response.setFundMode(fundProfile.getFundMode().name());
        }
        return response;
    }
}
