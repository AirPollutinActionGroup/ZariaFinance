package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.dto.request.CreateTrancheRequest;
import com.ngo.finance.donor.dto.request.ReceiveTrancheRequest;
import com.ngo.finance.donor.dto.response.TrancheResponse;
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
                .map(trancheMapper::toResponse)
                .toList();
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
        return trancheMapper.toResponse(saved);
    }

    @Override
    public TrancheResponse receiveTranche(Long trancheId, ReceiveTrancheRequest request) {
        log.info("Recording receipt for tranche id: {}", trancheId);
        GrantTranche tranche = trancheRepository.findById(trancheId)
                .orElseThrow(() -> new ResourceNotFoundException("Tranche", trancheId));

        tranche.setActualAmount(request.getActualAmount());
        tranche.setActualReleaseDate(request.getActualDate());
        tranche.setTrancheStatus("Received");
        tranche.setConditionMet("Met");

        GrantTranche saved = trancheRepository.save(tranche);
        log.info("Tranche receipt recorded for id: {}", saved.getId());
        return trancheMapper.toResponse(saved);
    }
}
