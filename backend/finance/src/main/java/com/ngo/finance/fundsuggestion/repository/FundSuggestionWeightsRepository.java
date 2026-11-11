package com.ngo.finance.fundsuggestion.repository;

import com.ngo.finance.fundsuggestion.entity.FundSuggestionWeights;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FundSuggestionWeightsRepository extends JpaRepository<FundSuggestionWeights, Long> {

    /** The single saved row (V122 seeds it). */
    Optional<FundSuggestionWeights> findTopByOrderByIdAsc();
}
