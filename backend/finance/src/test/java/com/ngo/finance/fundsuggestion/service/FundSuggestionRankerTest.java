package com.ngo.finance.fundsuggestion.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.fundsuggestion.dto.response.FundSuggestionResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class FundSuggestionRankerTest {

    private static final LocalDate NOTE_DATE = LocalDate.of(2026, 6, 10);

    private static final RankingWeights W = RankingWeights.DEFAULTS;

    private static FundCandidate fund(long id, String available, boolean programmeMatch, LocalDate grantEnd, FundClass fundClass) {
        return new FundCandidate(id, "Donor " + id, id, "Fund " + id, fundClass,
                grantEnd == null ? null : id, grantEnd == null ? null : "GA-" + id, null, grantEnd,
                null, false, new BigDecimal(available), BigDecimal.ZERO, 0, programmeMatch);
    }

    private static List<Long> order(List<FundSuggestionResponse> ranked) {
        return ranked.stream().map(FundSuggestionResponse::getFundProfileId).toList();
    }

    @Test
    void scoreIsTheSumOfTheWeightsEarned() {
        // Programme 40 + covers 25 + restricted for programme 15 + grant ends on the note date 15 + has grant 5.
        FundSuggestionResponse best = FundSuggestionRanker.rank(List.of(
                fund(1, "1000", true, NOTE_DATE, FundClass.CLASS_A_RESTRICTED)),
                new BigDecimal("500"), NOTE_DATE, 10, W).get(0);

        assertThat(best.getScore()).isEqualTo(100);
        assertThat(best.getReasons()).contains(
                "Same programme as the budget (+40)",
                "Covers the full amount (+25)",
                "Restricted for this programme (+15)",
                "Grant ends 10 Jun 2026 (+15)",
                "Backed by grant GA-1 (+5)");
    }

    @Test
    void unrestrictedLosesTenAndNoGrantIsWarned() {
        // Programme 40 + covers 25 − unrestricted 10.
        FundSuggestionResponse s = FundSuggestionRanker.rank(List.of(
                fund(1, "1000", true, null, FundClass.CLASS_C_UNRESTRICTED)),
                new BigDecimal("500"), NOTE_DATE, 10, W).get(0);

        assertThat(s.getScore()).isEqualTo(55);
        assertThat(s.getWarnings()).contains("No grant agreement — balance is from receipts only");
        assertThat(s.getWarnings()).anyMatch(w -> w.endsWith("(-10)"));
    }

    @Test
    void expiryPointsFallLinearlyOverTheWindow() {
        // Default window is 90 days.
        assertThat(FundSuggestionRanker.expiryPoints(NOTE_DATE, NOTE_DATE, W)).isEqualTo(15);
        assertThat(FundSuggestionRanker.expiryPoints(NOTE_DATE, NOTE_DATE.minusDays(5), W)).isEqualTo(15);
        assertThat(FundSuggestionRanker.expiryPoints(NOTE_DATE, NOTE_DATE.plusDays(45), W)).isEqualTo(8);
        assertThat(FundSuggestionRanker.expiryPoints(NOTE_DATE, NOTE_DATE.plusDays(90), W)).isZero();
        assertThat(FundSuggestionRanker.expiryPoints(NOTE_DATE, NOTE_DATE.plusDays(900), W)).isZero();
    }

    @Test
    void savedWeightsChangeTheOrder() {
        List<FundCandidate> funds = List.of(
                fund(1, "1000", true, null, FundClass.CLASS_C_UNRESTRICTED),
                fund(2, "1000", false, NOTE_DATE, FundClass.CLASS_A_RESTRICTED));
        BigDecimal amount = new BigDecimal("500");

        // Defaults: 1 = 40 + 25 − 10 = 55; 2 = 25 + 15 + 5 = 45.
        assertThat(order(FundSuggestionRanker.rank(funds, amount, NOTE_DATE, 10, W))).containsExactly(1L, 2L);

        // Programme match worth nothing, grant ending soon worth 40: 1 = 15; 2 = 70.
        RankingWeights grantFirst = new RankingWeights(0, 25, 15, 40, 5, -10, 90);
        List<FundSuggestionResponse> ranked = FundSuggestionRanker.rank(funds, amount, NOTE_DATE, 10, grantFirst);
        assertThat(order(ranked)).containsExactly(2L, 1L);
        assertThat(ranked).extracting(FundSuggestionResponse::getScore).containsExactly(70, 15);
    }

    @Test
    void highestScoreFirst_partialCoverWarned() {
        List<FundSuggestionResponse> ranked = FundSuggestionRanker.rank(List.of(
                // 25 + 5 + 0 (grant > a year out) = 30
                fund(1, "1000", false, NOTE_DATE.plusYears(2), FundClass.CLASS_A_RESTRICTED),
                // 40 + 15 + 15 + 5 = 75 — doesn't cover
                fund(2, "100", true, NOTE_DATE, FundClass.CLASS_A_RESTRICTED),
                // 40 + 25 − 10 = 55
                fund(3, "1000", true, null, FundClass.CLASS_B_UNRESTRICTED)),
                new BigDecimal("500"), NOTE_DATE, 10, W);

        assertThat(order(ranked)).containsExactly(2L, 3L, 1L);
        assertThat(ranked).extracting(FundSuggestionResponse::getScore).containsExactly(75, 55, 30);
        assertThat(ranked.get(0).getCoversAmount()).isFalse();
        assertThat(ranked.get(0).getWarnings()).anyMatch(w -> w.startsWith("Covers ₹100 of ₹500"));
    }

    @Test
    void tiesGoToTheLargerBalance_rankedAndCapped() {
        List<FundSuggestionResponse> ranked = FundSuggestionRanker.rank(List.of(
                fund(1, "100", false, null, null),
                fund(2, "300", false, null, null),
                fund(3, "200", false, null, null)),
                new BigDecimal("50"), NOTE_DATE, 2, W);

        assertThat(order(ranked)).containsExactly(2L, 3L);
        assertThat(ranked).extracting(FundSuggestionResponse::getRank).containsExactly(1, 2);
        assertThat(ranked.get(0).getAvailableAfter()).isEqualByComparingTo("250");
        assertThat(ranked.get(0).getUtilisationAfterPct()).isEqualByComparingTo("16.7");
    }
}
