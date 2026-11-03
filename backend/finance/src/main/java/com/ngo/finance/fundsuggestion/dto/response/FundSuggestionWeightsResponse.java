package com.ngo.finance.fundsuggestion.dto.response;

import com.ngo.finance.fundsuggestion.service.RankingWeights;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** The weights suggestions are ranked with now, the shipped defaults, and the last change. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundSuggestionWeightsResponse {

    private RankingWeights weights;

    private RankingWeights defaults;

    private String changeReason;

    private String updatedBy;

    private LocalDateTime updatedAt;
}
