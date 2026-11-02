package com.ngo.finance.fundsuggestion.service;

import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.fundsuggestion.dto.request.UpdateFundSuggestionWeightsRequest;
import com.ngo.finance.fundsuggestion.dto.response.FundSuggestionWeightsResponse;
import com.ngo.finance.fundsuggestion.entity.FundSuggestionWeights;
import com.ngo.finance.fundsuggestion.repository.FundSuggestionWeightsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The saved fund suggestion weights. Falls back to {@link RankingWeights#DEFAULTS}
 * when nothing is saved, so suggestions always have weights to rank with.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FundSuggestionWeightsService {

    private final FundSuggestionWeightsRepository repository;

    @Transactional(readOnly = true)
    public RankingWeights current() {
        return repository.findTopByOrderByIdAsc().map(FundSuggestionWeights::toWeights).orElse(RankingWeights.DEFAULTS);
    }

    @Transactional(readOnly = true)
    public FundSuggestionWeightsResponse get() {
        return repository.findTopByOrderByIdAsc()
                .map(this::toResponse)
                .orElseGet(() -> FundSuggestionWeightsResponse.builder()
                        .weights(RankingWeights.DEFAULTS)
                        .defaults(RankingWeights.DEFAULTS)
                        .build());
    }

    public FundSuggestionWeightsResponse update(UpdateFundSuggestionWeightsRequest request) {
        RankingWeights weights = new RankingWeights(
                request.getProgrammeMatch(),
                request.getCoversAmount(),
                request.getRestrictedForProgramme(),
                request.getExpiryMax(),
                request.getHasGrant(),
                request.getUnrestricted(),
                request.getExpiryWindowDays());
        if (weights.programmeMatch() + weights.coversAmount() + weights.restrictedForProgramme()
                + weights.expiryMax() + weights.hasGrant() == 0) {
            throw new ValidationException("At least one weight must be above zero, or every fund scores the same");
        }
        return save(weights, request.getReason().trim(), request.getActor());
    }

    public FundSuggestionWeightsResponse resetToDefaults(String actor) {
        return save(RankingWeights.DEFAULTS, "Reset to defaults", actor);
    }

    private FundSuggestionWeightsResponse save(RankingWeights weights, String reason, String actor) {
        String by = actor == null || actor.isBlank() ? "System" : actor.trim();
        FundSuggestionWeights row = repository.findTopByOrderByIdAsc().orElseGet(() -> {
            FundSuggestionWeights fresh = new FundSuggestionWeights();
            fresh.setCreatedBy(by);
            return fresh;
        });
        row.apply(weights);
        row.setChangeReason(reason);
        row.setUpdatedBy(by);
        FundSuggestionWeights saved = repository.saveAndFlush(row);
        log.info("Fund suggestion weights set to {} by {} — {}", weights, by, reason);
        return toResponse(saved);
    }

    private FundSuggestionWeightsResponse toResponse(FundSuggestionWeights row) {
        return FundSuggestionWeightsResponse.builder()
                .weights(row.toWeights())
                .defaults(RankingWeights.DEFAULTS)
                .changeReason(row.getChangeReason())
                .updatedBy(row.getUpdatedBy())
                .updatedAt(row.getUpdatedAt())
                .build();
    }
}
